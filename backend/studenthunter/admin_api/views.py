from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, permission_classes as drf_permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from admin_api.models import ModerationLog, AdminNotification, AdminDashboardSetting
from admin_api.serializers import (
    ModerationLogSerializer, AdminNotificationSerializer, AdminDashboardSettingSerializer,
    UserAdminSerializer, JobAdminSerializer, CompanyAdminSerializer, 
    ApplicationAdminSerializer, AdminDashboardStatsSerializer, BulkUserFileUploadSerializer
)
from jobs.models import Job
from companies.models import Company 
from applications.models import Application
from django.db.models import Count, Q
from django.contrib.contenttypes.models import ContentType
from admin_api.models import SystemSettings
from admin_api.serializers import SystemSettingsSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import pandas as pd
import numpy as np
from users.models import StudentProfile, EmployerProfile, CampusProfile

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

class CanBulkRegisterUsers(permissions.BasePermission):
    """
    Allows access to bulk user registration for Admins or Campus users.
    Campus users can only register students.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.role == 'campus'

@extend_schema(tags=['admin'])
class AdminUserViewSet(viewsets.ModelViewSet):
    """API для управления пользователями в административной панели."""
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = []
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'name']
    
    def list(self, request, *args, **kwargs):
        """Override list method to match the frontend expected format with data property."""
        queryset = self.filter_queryset(self.get_queryset())
        total_count = queryset.count()
        
        page = self.paginate_queryset(queryset)
        page_size = request.query_params.get('limit', 10)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'message': 'Users retrieved successfully',
                'total': total_count,
                'page': int(request.query_params.get('page', 1)),
                'limit': int(page_size)
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Users retrieved successfully',
            'total': total_count,
            'page': 1,
            'limit': int(page_size)
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to match the frontend expected format with data property."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'User retrieved successfully'
        })
    
    def create(self, request, *args, **kwargs):
        """Создание нового пользователя администратором."""
        data = request.data
        
        # Извлекаем необходимые данные
        email = data.get('email')
        name = data.get('name', '')
        password = data.get('password')
        role = data.get('role', 'student')
        send_welcome_email = data.get('sendWelcomeEmail', True)
        activate_immediately = data.get('activateImmediately', True)
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Создаем пользователя
            user = User.objects.create_user(
                email=email,
                password=password,
                name=name,
                role=role,
                is_active=activate_immediately
            )
            
            # Дополнительные данные в зависимости от роли
            if role == 'student' and data.get('university'):
                # Добавление университета для студента
                # Здесь может быть связь с профилем студента
                pass
                
            if role == 'employer':
                # Обработка данных компании для работодателя
                if data.get('company_id'):
                    # Если передан ID компании, сохраняем его и название компании
                    user.company_id = data.get('company_id')
                    if data.get('company'):
                        user.company = data.get('company')
                    else:
                        # Если название компании не передано, пытаемся получить его из базы
                        try:
                            from companies.models import Company
                            company = Company.objects.get(id=data.get('company_id'))
                            user.company = company.name
                        except Exception as e:
                            print(f"Error getting company name: {e}")
                    user.save()
                elif data.get('company'):
                    # Если передано только название компании
                    user.company = data.get('company')
                    user.save()
            
            # Отправка приветственного письма, если требуется
            if send_welcome_email:
                # Тут должна быть логика отправки письма
                pass
            
            # Логирование действия
            content_type = ContentType.objects.get_for_model(User)
            ModerationLog.objects.create(
                admin=request.user,
                action='create',
                content_type=content_type,
                object_id=user.id,
                notes=f"Created new {role} account: {email}"
            )
            
            return Response({
                'status': 'success',
                'message': f'User {email} created successfully',
                'data': UserAdminSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Bulk user registration from XLSX/CSV file",
        request=BulkUserFileUploadSerializer,
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT
        }
    )
    @action(detail=False, methods=['post'], permission_classes=[CanBulkRegisterUsers], parser_classes=[MultiPartParser])
    def bulk(self, request):
        """Массовое создание пользователей из файла XLSX или CSV."""
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({
                'status': 'error',
                'message': 'No file provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        results = {
            'success_count': 0,
            'failed_count': 0,
            'details': []
        }
        
        allowed_roles_for_campus = ['student']
        # Define expected columns in the file. Adjust as necessary.
        # It's good practice to provide a template file for users.
        expected_columns = ['email', 'password', 'name', 'role'] # Minimal example
        # Optional columns: 'phone', 'university', 'department', 'position' (for campus), 'company_name' (for employer)

        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            elif file_obj.name.endswith('.xlsx'):
                df = pd.read_excel(file_obj, engine='openpyxl')
            else:
                return Response({
                    'status': 'error',
                    'message': 'Unsupported file type. Please upload a CSV or XLSX file.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Replace NaN values with None for JSON compatibility
            df = df.replace({np.nan: None})

            # Normalize column names (e.g., lower case, strip spaces)
            df.columns = [col.lower().strip() for col in df.columns]

            # Check for required columns
            missing_cols = [col for col in expected_columns if col not in df.columns]
            if missing_cols:
                return Response({
                    'status': 'error',
                    'message': f'Missing required columns in file: {", ".join(missing_cols)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            for index, row in df.iterrows():
                email = row.get('email')
                password = row.get('password')
                name = row.get('name', '')
                role = row.get('role', 'student').lower()
                # Optional fields
                phone = row.get('phone')
                university = row.get('university') # For student/campus
                department = row.get('department') # For campus
                position = row.get('position') # For campus
                # company_name = row.get('company_name') # For employer

                if not email or not password:
                    results['failed_count'] += 1
                    results['details'].append({'email': email, 'status': 'failed', 'reason': 'Missing email or password'})
                    continue
                
                # Role validation by uploader
                if request.user.role == 'campus' and role not in allowed_roles_for_campus:
                    results['failed_count'] += 1
                    results['details'].append({'email': email, 'status': 'failed', 'reason': f'Campus users can only register students, attempted role: {role}'})
                    continue
                
                # Validate role value itself (must be one of the system-defined roles)
                # Assuming User.ROLE_CHOICES or similar exists on your User model
                # For simplicity, let's assume roles are 'student', 'employer', 'campus', 'admin'
                valid_system_roles = [r[0] for r in User.ROLE_CHOICES] if hasattr(User, 'ROLE_CHOICES') else ['student', 'employer', 'campus', 'admin']
                if role not in valid_system_roles:
                    results['failed_count'] += 1
                    results['details'].append({'email': email, 'status': 'failed', 'reason': f'Invalid role specified: {role}'})
                    continue

                try:
                    if User.objects.filter(email=email).exists():
                        results['failed_count'] += 1
                        results['details'].append({'email': email, 'status': 'failed', 'reason': 'User with this email already exists'})
                        continue

                    user = User.objects.create_user(
                        email=email,
                        password=password,
                        name=name,
                        role=role,
                        phone=phone,
                        is_active=True # Or based on a column in the file
                    )
                    
                    # Create profile based on role
                    if role == 'student':
                        StudentProfile.objects.create(user=user, university=university)
                    elif role == 'employer':
                        # company_name might be from the file, or a default/placeholder
                        EmployerProfile.objects.create(user=user, company_name=row.get('company_name', 'Default Company'))
                    elif role == 'campus':
                        CampusProfile.objects.create(user=user, university=university, department=department, position=position)
                    
                    results['success_count'] += 1
                    results['details'].append({'email': email, 'status': 'success'})
                
                except Exception as e:
                    results['failed_count'] += 1
                    results['details'].append({'email': email, 'status': 'failed', 'reason': str(e)})
            
        except pd.errors.EmptyDataError:
             return Response({'status': 'error', 'message': 'The uploaded file is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # General error during file processing
            return Response({
                'status': 'error',
                'message': f'Error processing file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Log moderation action
        try:
            ModerationLog.objects.create(
                admin=request.user,
                action='bulk_user_upload',
                content_type=ContentType.objects.get_for_model(User),
                object_id=request.user.id, # Or a more relevant object if applicable
                notes=f"Bulk user upload: {results['success_count']} succeeded, {results['failed_count']} failed. File: {file_obj.name}"
            )
        except Exception: # Catch all for logging to not break the main flow
            pass 

        return Response(results, status=status.HTTP_200_OK)
    
    def generate_random_password(self, length=12):
        """Генерация случайного безопасного пароля."""
        import random
        import string
        
        chars = string.ascii_letters + string.digits + "!@#$%^&*()"
        return ''.join(random.choice(chars) for _ in range(length))
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Включение/отключение учетной записи пользователя."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        # Логирование действия
        content_type = ContentType.objects.get_for_model(User)
        action = 'restore' if user.is_active else 'suspend'
        ModerationLog.objects.create(
            admin=request.user,
            action=action,
            content_type=content_type,
            object_id=user.id,
            notes=f"{'Activated' if user.is_active else 'Deactivated'} user account: {user.email}"
        )
        
        return Response({'status': 'success', 'is_active': user.is_active})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Статистика по пользователям."""
        total = User.objects.count()
        students = User.objects.filter(role='student').count()
        employers = User.objects.filter(role='employer').count()
        admins = User.objects.filter(is_staff=True).count()
        active = User.objects.filter(is_active=True).count()
        inactive = User.objects.filter(is_active=False).count()
        
        today = timezone.now().date()
        new_today = User.objects.filter(date_joined__date=today).count()
        
        return Response({
            'total': total,
            'students': students,
            'employers': employers,
            'admins': admins,
            'active': active,
            'inactive': inactive,
            'new_today': new_today
        })

@extend_schema(tags=['admin'])
class AdminJobViewSet(viewsets.ModelViewSet):
    """API для управления вакансиями в административной панели."""
    queryset = Job.objects.all()
    serializer_class = JobAdminSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'type', 'industry', 'status']
    search_fields = ['title', 'company', 'description']
    ordering_fields = ['posted_date', 'view_count', 'application_count', 'title']
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Включение/отключение вакансии."""
        job = self.get_object()
        job.is_active = not job.is_active
        job.save()
        
        # Логирование действия
        content_type = ContentType.objects.get_for_model(Job)
        action = 'approve' if job.is_active else 'reject'
        ModerationLog.objects.create(
            admin=request.user,
            action=action,
            content_type=content_type,
            object_id=job.id,
            notes=f"{'Activated' if job.is_active else 'Deactivated'} job: {job.title}"
        )
        
        return Response({'status': 'success', 'is_active': job.is_active})
    
    @action(detail=True, methods=['post'])
    def feature(self, request, pk=None):
        """Добавление/удаление вакансии из рекомендуемых."""
        job = self.get_object()
        job.featured = not job.featured
        job.save()
        
        return Response({'status': 'success', 'featured': job.featured})

@extend_schema(tags=['admin'])
class AdminCompanyViewSet(viewsets.ModelViewSet):
    """API для управления компаниями в административной панели."""
    queryset = Company.objects.all()
    serializer_class = CompanyAdminSerializer
    permission_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['verified', 'featured', 'industry']
    search_fields = ['name', 'description', 'location']
    
    def list(self, request, *args, **kwargs):
        """Override list method to match the frontend expected format with data property."""
        queryset = self.filter_queryset(self.get_queryset())
        total_count = queryset.count()
        
        page = self.paginate_queryset(queryset)
        page_size = request.query_params.get('limit', 10)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data,
                'message': 'Companies retrieved successfully',
                'total': total_count,
                'page': int(request.query_params.get('page', 1)),
                'limit': int(page_size)
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Companies retrieved successfully',
            'total': total_count,
            'page': 1,
            'limit': int(page_size)
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to match the frontend expected format with data property."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Company retrieved successfully'
        })
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Верификация компании."""
        company = self.get_object()
        company.verified = not company.verified
        company.save()
        
        # Логирование действия
        content_type = ContentType.objects.get_for_model(Company)
        action = 'approve' if company.verified else 'reject'
        ModerationLog.objects.create(
            admin=request.user,
            action=action,
            content_type=content_type,
            object_id=company.id,
            notes=f"{'Verified' if company.verified else 'Unverified'} company: {company.name}"
        )
        
        return Response({'status': 'success', 'verified': company.verified})
    
    @action(detail=True, methods=['post'])
    def feature(self, request, pk=None):
        """Добавление/удаление компании из рекомендуемых."""
        company = self.get_object()
        company.featured = not company.featured
        company.save()
        
        return Response({'status': 'success', 'featured': company.featured})

@extend_schema(tags=['admin'])
class AdminApplicationViewSet(viewsets.ModelViewSet):
    """API для управления откликами на вакансии в административной панели."""
    queryset = Application.objects.all()
    serializer_class = ApplicationAdminSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'job__title', 'job__company']
    ordering_fields = ['created_at', 'updated_at']

@extend_schema(tags=['admin'])
class ModerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """API для просмотра логов модерации."""
    queryset = ModerationLog.objects.all().order_by('-timestamp')
    serializer_class = ModerationLogSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['action', 'admin']
    ordering_fields = ['timestamp']

@extend_schema(tags=['admin'])
class AdminNotificationViewSet(viewsets.ModelViewSet):
    """API для управления уведомлениями администраторов."""
    queryset = AdminNotification.objects.all().order_by('-created_at')
    serializer_class = AdminNotificationSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_read', 'type']
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Отметка уведомления как прочитанного."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Отметка всех уведомлений как прочитанных."""
        AdminNotification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'success'})

@extend_schema(tags=['admin'])
class AdminDashboardStatsView(APIView):
    """API для получения статистики для административной панели."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Общая статистика
        stats = {
            'total_users': User.objects.count(),
            'new_users_today': User.objects.filter(date_joined__date=today).count(),
            'total_jobs': Job.objects.count(),
            'new_jobs_today': Job.objects.filter(posted_date__date=today).count(),
            'total_applications': Application.objects.count(),
            'new_applications_today': Application.objects.filter(created_at__date=today).count(),
            'total_companies': Company.objects.count(),
            'new_companies_today': Company.objects.filter(id__in=[1]).count(),  # Заглушка
            'pending_verifications': Company.objects.filter(verified=False).count(),
            'active_jobs': Job.objects.filter(is_active=True).count(),
            'total_students': User.objects.filter(role='student').count(),
            'total_employers': User.objects.filter(role='employer').count(),
        }
        
        serializer = AdminDashboardStatsSerializer(stats)
        return Response(serializer.data)

@extend_schema(tags=['admin'])
class AdminAnalyticsView(APIView):
    """API для получения детальной аналитики для административной панели."""
    permission_classes = []
    
    def get(self, request):
        try:
            # Логируем информацию для отладки
            import logging
            logger = logging.getLogger(__name__)
            logger.info("AdminAnalyticsView.get called")
            
            # Получаем параметры запроса
            period = request.query_params.get('period', 'month')  # 'week', 'month', 'year'
            logger.info(f"Period: {period}")
            
            # Определяем временные рамки для анализа
            today = timezone.now().date()
            if period == 'week':
                start_date = today - timedelta(days=7)
                date_trunc = 'day'
                date_format = '%d %b'  # Формат: "01 Jan"
            elif period == 'month':
                start_date = today - timedelta(days=30)
                date_trunc = 'day'
                date_format = '%d %b'  # Формат: "01 Jan"
            elif period == 'year':
                start_date = today - timedelta(days=365)
                date_trunc = 'month'
                date_format = '%b %Y'  # Формат: "Jan 2023"
            else:
                start_date = today - timedelta(days=30)  # По умолчанию - 30 дней
                date_trunc = 'day'
                date_format = '%d %b'
                
            logger.info(f"Start date: {start_date}, date_trunc: {date_trunc}, date_format: {date_format}")
            
            # Создаем базовые демо-данные (упрощенно для тестирования)
            # Это поможет избежать ошибок, если данных мало или их нет
            
            # Статистика пользователей
            total_users = User.objects.count()
            logger.info(f"Total users: {total_users}")
            new_users = User.objects.filter(date_joined__gte=start_date).count()
            active_users = User.objects.filter(is_active=True).count()
            
            # Статистика по ролям пользователей - с проверкой на существование значений
            user_distribution = []
            try:
                students_count = User.objects.filter(role='student').count()
                user_distribution.append({"name": "Students", "value": students_count})
            except Exception as e:
                logger.error(f"Error counting students: {e}")
                user_distribution.append({"name": "Students", "value": 0})
                
            try:
                employers_count = User.objects.filter(role='employer').count()
                user_distribution.append({"name": "Employers", "value": employers_count})
            except Exception as e:
                logger.error(f"Error counting employers: {e}")
                user_distribution.append({"name": "Employers", "value": 0})
                
            try:
                campus_count = User.objects.filter(role='campus').count()
                user_distribution.append({"name": "Campus", "value": campus_count})
            except Exception as e:
                logger.error(f"Error counting campus: {e}")
                user_distribution.append({"name": "Campus", "value": 0})
                
            try:
                admin_count = User.objects.filter(is_staff=True).count()
                user_distribution.append({"name": "Admins", "value": admin_count})
            except Exception as e:
                logger.error(f"Error counting admins: {e}")
                user_distribution.append({"name": "Admins", "value": 0})
            
            logger.info(f"User distribution: {user_distribution}")
            
            # Рост пользователей по датам (упрощенно)
            user_growth_data = []
            
            # Тестовые данные для графика роста пользователей
            for i in range(7):
                current_date = today - timedelta(days=6-i)
                user_growth_data.append({
                    "date": current_date.strftime(date_format),
                    "count": User.objects.filter(date_joined__date=current_date).count()
                })
            
            logger.info(f"User growth data: {user_growth_data}")
            
            # Тестовые данные для графика статистики вакансий
            job_stats_data = []
            for i in range(7):
                current_date = today - timedelta(days=6-i)
                job_stats_data.append({
                    "date": current_date.strftime(date_format),
                    "posted": Job.objects.filter(posted_date__date=current_date).count(),
                    "filled": Job.objects.filter(status='filled', posted_date__date=current_date).count()
                })
            
            logger.info(f"Job stats data: {job_stats_data}")
            
            # Статистика по заявкам - с проверкой на существование статусов
            application_stats = {"total": Application.objects.count()}
            
            try:
                application_stats["pending"] = Application.objects.filter(status='pending').count()
            except Exception as e:
                logger.error(f"Error counting pending applications: {e}")
                application_stats["pending"] = 0
                
            try:
                application_stats["reviewing"] = Application.objects.filter(status='reviewing').count()
            except Exception as e:
                logger.error(f"Error counting reviewing applications: {e}")
                application_stats["reviewing"] = 0
                
            try:
                application_stats["accepted"] = Application.objects.filter(status='accepted').count()
            except Exception as e:
                logger.error(f"Error counting accepted applications: {e}")
                application_stats["accepted"] = 0
                
            try:
                application_stats["rejected"] = Application.objects.filter(status='rejected').count()
            except Exception as e:
                logger.error(f"Error counting rejected applications: {e}")
                application_stats["rejected"] = 0
            
            logger.info(f"Application stats: {application_stats}")
            
            # Собираем все данные в один объект ответа
            analytics_data = {
                "userGrowth": user_growth_data,
                "jobStats": job_stats_data,
                "userDistribution": user_distribution,
                "applicationStats": application_stats
            }
            
            # Статистические данные для карточек с общей информацией
            stats_data = {
                "users": {
                    "total": total_users,
                    "students": user_distribution[0]["value"] if len(user_distribution) > 0 else 0,
                    "employers": user_distribution[1]["value"] if len(user_distribution) > 1 else 0,
                    "new": new_users,
                    "active": active_users
                },
                "jobs": {
                    "total": Job.objects.count(),
                    "active": Job.objects.filter(is_active=True).count(),
                    "filled": Job.objects.filter(status='filled').count(),
                    "new": Job.objects.filter(posted_date__gte=start_date).count()
                },
                "applications": {
                    "total": application_stats["total"],
                    "pending": application_stats["pending"],
                    "reviewing": application_stats["reviewing"],
                    "accepted": application_stats["accepted"],
                    "rejected": application_stats["rejected"]
                },
                "companies": {
                    "total": Company.objects.count(),
                    "verified": Company.objects.filter(verified=True).count(),
                    "new": Company.objects.filter(id__in=[1]).count()  # Заглушка, заменить на реальные данные
                }
            }
            
            logger.info("Analytics data ready, returning response")
            logger.info(f"Final response data: analytics={analytics_data}, stats={stats_data}")
            
            response_data = {
                "status": "success",
                "message": "Analytics data retrieved successfully",
                "data": {
                    "analytics": analytics_data,
                    "stats": stats_data
                }
            }
            
            logger.info(f"Final response: {response_data}")
            
            return Response(response_data)
            
        except Exception as e:
            import traceback
            logger.error(f"Error in AdminAnalyticsView.get: {e}")
            logger.error(traceback.format_exc())
            return Response({
                "status": "error",
                "message": f"Error retrieving analytics data: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(tags=['admin'])
class AdminDashboardSettingViewSet(viewsets.ModelViewSet):
    """API для управления настройками дашборда администратора."""
    serializer_class = AdminDashboardSettingSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return AdminDashboardSetting.objects.filter(admin=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

@extend_schema(tags=['admin'])
class SystemSettingsView(APIView):
    """API для получения и обновления глобальных настроек системы."""
    permission_classes = []
    
    def get(self, request):
        """Получить текущие системные настройки."""
        settings, _ = SystemSettings.objects.get_or_create(id=1)
        serializer = SystemSettingsSerializer(settings)
        
        # Выводим данные в консоль для отладки
        print(f"SystemSettings data: {serializer.data}")
        
        return Response({
            "status": "success",
            "message": "System settings retrieved successfully",
            "data": serializer.data
        })
    
    def put(self, request):
        """Обновить системные настройки."""
        settings, _ = SystemSettings.objects.get_or_create(id=1)
        serializer = SystemSettingsSerializer(settings, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "System settings updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

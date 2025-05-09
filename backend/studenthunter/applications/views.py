from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from .models import Application
from .serializers import ApplicationSerializer, ApplicationDetailSerializer
from jobs.models import Job
from django.db.models import Q
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

class IsOwnerOrEmployer(permissions.BasePermission):
    """
    Разрешение для проверки, является ли пользователь владельцем заявки или работодателем.
    """
    def has_object_permission(self, request, view, obj):
        # Администраторы имеют полный доступ
        if request.user.is_staff:
            return True
        
        # Студенты могут видеть только свои заявки
        if request.user.role == 'student':
            return obj.applicant == request.user
        
        # Работодатели могут видеть заявки на свои вакансии
        if request.user.role == 'employer':
            return obj.job.created_by == request.user
        
        return False

@extend_schema(tags=['applications'])
class ApplicationViewSet(viewsets.ModelViewSet):
    """API для управления заявками на вакансии."""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployer]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'job']
    ordering_fields = ['created_at', 'updated_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ApplicationDetailSerializer
        return ApplicationSerializer

    def get_queryset(self):
        """
        Возвращает заявки в зависимости от роли пользователя:
        - Работодатели видят заявки на свои вакансии
        - Студенты видят свои заявки
        - Администраторы видят все заявки
        """
        user = self.request.user
        if user.is_staff:
            return Application.objects.all()
        
        if user.role == 'employer':
            return Application.objects.filter(job__created_by=user)
        
        if user.role == 'student':
            return Application.objects.filter(applicant=user)
        
        return Application.objects.none()

    @extend_schema(summary="Create a new application")
    def perform_create(self, serializer):
        """Создание новой заявки."""
        job = serializer.validated_data.get('job')
        
        # Проверяем, что пользователь не является работодателем этой вакансии
        if job.created_by == self.request.user:
            raise permissions.PermissionDenied("You cannot apply to your own job posting.")
        
        serializer.save(applicant=self.request.user)
        
        # Обновляем счетчик заявок у вакансии
        job.application_count += 1
        job.save(update_fields=['application_count'])
        
        # Создаем уведомление для работодателя, если такой функционал есть
        try:
            from admin_api.models import AdminNotification
            AdminNotification.objects.create(
                title=f"New Application for {job.title}",
                message=f"A new application has been submitted by {self.request.user.email} for the job: {job.title}",
                type='new_application',
                content_type=ContentType.objects.get_for_model(Application),
                object_id=serializer.instance.id
            )
        except (ImportError, ContentType.DoesNotExist):
            pass

    @extend_schema(
        summary="Update Application Status",
        description="Updates the status of a specific application (e.g., reviewing, interviewed, accepted, rejected).",
        request={
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'status': {'type': 'string', 'enum': [choice[0] for choice in Application.STATUS_CHOICES]},
                        'notes': {'type': 'string', 'nullable': True}
                    },
                    'required': ['status']
                }
            }
        },
        responses={
            200: ApplicationSerializer,
            400: {'description': 'Invalid status provided.'},
            403: {'description': 'Permission denied.'},
            404: {'description': 'Application not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Обновление статуса заявки."""
        application = self.get_object()
        
        # Проверяем, что пользователь имеет права на обновление статуса
        if request.user.role == 'employer' and application.job.created_by != request.user:
            return Response({'error': 'Permission denied. You can only update status for applications to your jobs.'}, 
                           status=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'student' and request.user != application.applicant:
            return Response({'error': 'Permission denied. You can only update your own applications.'}, 
                           status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        notes = request.data.get('notes', application.notes)
        
        if new_status not in dict(Application.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        application.status = new_status
        application.notes = notes
        application.save()
        
        return Response(self.get_serializer(application).data)

    @extend_schema(
        summary="Schedule an interview",
        description="Schedule an interview for a specific application.",
        request={
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'interview_date': {'type': 'string', 'format': 'date-time'},
                        'notes': {'type': 'string', 'nullable': True}
                    },
                    'required': ['interview_date']
                }
            }
        },
        responses={
            200: ApplicationSerializer,
            400: {'description': 'Invalid data provided.'},
            403: {'description': 'Permission denied.'},
            404: {'description': 'Application not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        """Назначение собеседования для заявки."""
        application = self.get_object()
        
        # Проверяем, что пользователь имеет права на назначение собеседования
        if request.user.role == 'employer' and application.job.created_by != request.user:
            return Response({'error': 'Permission denied. You can only schedule interviews for applications to your jobs.'}, 
                           status=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'student':
            return Response({'error': 'Permission denied. Only employers can schedule interviews.'}, 
                           status=status.HTTP_403_FORBIDDEN)

        interview_date = request.data.get('interview_date')
        notes = request.data.get('notes', application.notes)
        
        if not interview_date:
            return Response(
                {'error': 'Interview date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.interview_date = interview_date
        application.notes = notes
        application.status = 'interviewed'
        application.save()
        
        return Response(self.get_serializer(application).data)

    @extend_schema(
        summary="List applications by job",
        description="Lists applications for a specific job (for employers only).",
        parameters=[
            OpenApiParameter(name='job_id', description='ID of the job', required=True, type=OpenApiTypes.INT),
        ],
        responses={
            200: ApplicationSerializer(many=True),
            403: {'description': 'Permission denied.'},
            404: {'description': 'Job not found.'}
        }
    )
    @action(detail=False, methods=['get'])
    def by_job(self, request):
        """Получение списка заявок на конкретную вакансию."""
        job_id = request.query_params.get('job_id')
        
        if not job_id:
            return Response(
                {'error': 'Job ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Проверяем, что пользователь имеет права на просмотр заявок
        if request.user.role == 'employer' and job.created_by != request.user:
            return Response(
                {'error': 'Permission denied. You can only view applications for your own jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.user.role == 'student':
            return Response(
                {'error': 'Permission denied. Students cannot view all applications for a job.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(job=job)
        
        # Фильтрация по статусу
        status_filter = request.query_params.get('status')
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="List my applications",
        description="Lists applications submitted by the current user (for students only).",
        responses={
            200: ApplicationSerializer(many=True),
            403: {'description': 'Permission denied.'}
        }
    )
    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Получение списка заявок текущего пользователя."""
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can view their applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(applicant=request.user)
        
        # Фильтрация по статусу
        status_filter = request.query_params.get('status')
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="List applications for my jobs",
        description="Lists applications for jobs posted by the current user (for employers only).",
        responses={
            200: ApplicationSerializer(many=True),
            403: {'description': 'Permission denied.'}
        }
    )
    @action(detail=False, methods=['get'])
    def for_my_jobs(self, request):
        """Get a list of applications for the current employer's jobs."""
        if request.user.role != 'employer':
            return Response(
                {'error': 'Only employers can view applications for their jobs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(job__created_by=request.user)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        # Filter by job
        job_filter = request.query_params.get('job_id')
        if job_filter:
            applications = applications.filter(job_id=job_filter)
        
        serializer = self.get_serializer(applications, many=True)
        
        # Format response to match frontend expectations
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Applications retrieved successfully'
        })

    @extend_schema(
        summary="Application statistics",
        description="Get statistics on applications for the current user.",
        responses={
            200: {'description': 'Application statistics'}
        }
    )
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Получение статистики по заявкам."""
        user = request.user
        
        if user.role == 'employer':
            applications = Application.objects.filter(job__created_by=user)
            result = {
                'total': applications.count(),
                'by_status': {},
                'recent': applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count(),
                'by_job': {}
            }
            
            # Группировка по статусу
            for status_choice in Application.STATUS_CHOICES:
                status_code = status_choice[0]
                result['by_status'][status_code] = applications.filter(status=status_code).count()
            
            # Группировка по вакансиям
            jobs = Job.objects.filter(created_by=user)
            for job in jobs:
                result['by_job'][job.id] = {
                    'title': job.title,
                    'count': applications.filter(job=job).count()
                }
        
        elif user.role == 'student':
            applications = Application.objects.filter(applicant=user)
            result = {
                'total': applications.count(),
                'by_status': {},
                'recent': applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count()
            }
            
            # Группировка по статусу
            for status_choice in Application.STATUS_CHOICES:
                status_code = status_choice[0]
                result['by_status'][status_code] = applications.filter(status=status_code).count()
        
        else:
            # Для администраторов
            applications = Application.objects.all()
            result = {
                'total': applications.count(),
                'by_status': {},
                'recent': applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count(),
                'by_job_type': {},
                'by_location': {}
            }
            
            # Группировка по статусу
            for status_choice in Application.STATUS_CHOICES:
                status_code = status_choice[0]
                result['by_status'][status_code] = applications.filter(status=status_code).count()
            
            # Дополнительная статистика для администраторов
            jobs = Job.objects.all()
            job_types = jobs.values_list('type', flat=True).distinct()
            for job_type in job_types:
                result['by_job_type'][job_type] = applications.filter(job__type=job_type).count()
            
            locations = jobs.values_list('location', flat=True).distinct()
            for location in locations:
                result['by_location'][location] = applications.filter(job__location=location).count()
        
        return Response(result)

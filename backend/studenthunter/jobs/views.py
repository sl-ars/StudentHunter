from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes
from jobs.models import Job
from jobs.serializers import JobSerializer, JobListSerializer
from applications.models import Application
from applications.serializers import ApplicationSerializer
from jobs.permissions import IsOwnerOrAdminOrReadOnly, IsApplicantOrEmployer
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
from analytics.models import JobView

# Кастомный фильтр сортировки
class CustomOrderingFilter(filters.OrderingFilter):
    ordering_param = 'sort' # Используем ?sort=... вместо ?ordering=...
    ordering_fields_aliases = {
        'recent': ['-posted_date'],
        'popular': ['-view_count', '-application_count'],
        'featured': ['-featured', '-posted_date'],
        'salary_high': ['-salary'],
        'salary_low': ['salary'],
        'deadline': ['deadline'],
    }
    ordering_description = (
        "Sort order. Available aliases: "
        "`recent` (newest first by posted_date), "
        "`popular` (most popular by view_count, then application_count), "
        "`featured` (featured first, then newest by posted_date), "
        "`salary_high` (highest salary first), "
        "`salary_low` (lowest salary first), "
        "`deadline` (closest deadline first). "
        "You can also use direct model field names from `ordering_fields` (e.g., `title`, `-salary`). "
        "Prefix an alias or field with `-` to reverse its effective sort direction (e.g., `-recent` for oldest first, or `salary` for ascending salary)."
    )

    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)
        if params:
            fields = [param.strip() for param in params.split(',')]
            ordering = []
            for field in fields:
                prefix = ''
                actual_field_name = field
                if field.startswith('-'):
                    prefix = '-'
                    actual_field_name = field[1:]
                
                if actual_field_name in self.ordering_fields_aliases:
                    aliased_fields = self.ordering_fields_aliases[actual_field_name]
                    for aliased_field in aliased_fields:
                        if prefix == '-': # инвертируем сортировку для псевдонима
                            ordering.append(aliased_field[1:] if aliased_field.startswith('-') else prefix + aliased_field)
                        else:
                            ordering.append(aliased_field)
                else:
                    # Это не псевдоним, передаем как есть для стандартной обработки OrderingFilter
                    if hasattr(view, 'ordering_fields') and actual_field_name in view.ordering_fields:
                         ordering.append(field)
            
            if ordering:
                return ordering
        
        return self.get_default_ordering(view)

@extend_schema(tags=['jobs'])
@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                name='scope',
                description="Set to 'personal' to view your own jobs (for employers).",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=['personal']
            ),
            OpenApiParameter(
                name='is_active',
                description="Filter by job activity status ('true' or 'false'). Defaults to 'true' for non-admin users if not specified.",
                required=False,
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name='industry',
                description="Filter by industry.",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY
            )
        ]
    )
)
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, CustomOrderingFilter]
    filterset_fields = ['type', 'industry', 'location']
    search_fields = ['title', 'description', 'company', 'requirements']
    ordering_fields = ['posted_date', 'salary', 'view_count', 'application_count', 'title', 'featured', 'deadline']
    ordering = ['-posted_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Job.objects.all()

        scope = self.request.query_params.get('scope', None) # Default to None if not provided
        is_active_param = self.request.query_params.get('is_active', None)

        # Применяем фильтр по scope
        if scope == 'personal' and user.is_authenticated and user.role == 'employer':
            queryset = queryset.filter(created_by=user)
        # Если scope не 'personal' или пользователь не эмплоер, то scope не применяется (показываются все вакансии, если нет других фильтров)

        # Применяем фильтр по активности
        if user.is_authenticated:
            if user.is_staff: # Администраторы
                if is_active_param is not None:
                    queryset = queryset.filter(is_active=(is_active_param.lower() == 'true'))
            else: # Все остальные пользователи
                if is_active_param is not None:
                    queryset = queryset.filter(is_active=(is_active_param.lower() == 'true'))
                else:
                    queryset = queryset.filter(is_active=True) # По умолчанию активные
        else: # Неаутентифицированные пользователи
            if is_active_param is not None:
                queryset = queryset.filter(is_active=(is_active_param.lower() == 'true'))
            else:
                queryset = queryset.filter(is_active=True) # По умолчанию активные
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Создаем запись о просмотре и увеличиваем счетчик просмотров
        # Проверяем, что просмотр не от самого создателя вакансии
        # и что пользователь аутентифицирован для создания JobView с viewer
        # Если пользователь не аутентифицирован, viewer будет None
        
        viewer_user = request.user if request.user.is_authenticated else None
        
        # Увеличиваем счетчик просмотров в Job.view_count
        # Это можно делать всегда, когда кто-то просматривает, независимо от того, создатель это или нет,
        # т.к. это просто общий счетчик для популярности.
        Job.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db(fields=['view_count']) # Обновляем инстанс из БД

        # Создаем запись JobView, если это не создатель вакансии
        # или если просмотры создателя тоже нужно логировать (в данном случае - логируем все просмотры)
        # (Решение: логируем все просмотры, включая просмотры автора, для полноты данных)
        JobView.objects.create(
            job=instance,
            viewer=viewer_user,
            ip_address=request.META.get('REMOTE_ADDR'),
            # duration можно будет добавить позже, если будет логика отслеживания времени на странице
        )
        
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Job retrieved successfully'
        })

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Jobs retrieved successfully'
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Job updated successfully'
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Создаем уведомление для администраторов, если такой функционал есть
        try:
            from admin_api.models import AdminNotification
            AdminNotification.objects.create(
                title=f"New Job Posting: {serializer.validated_data['title']}",
                message=f"A new job has been posted by {request.user.email}: {serializer.validated_data['title']}",
                type='new_job',
                content_type=ContentType.objects.get_for_model(Job),
                object_id=serializer.instance.id
            )
        except (ImportError, ContentType.DoesNotExist):
            pass
        
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Job created successfully'
        }, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'status': 'success',
            'data': {'success': True},
            'message': 'Job deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        job = self.get_object()
        job.is_active = not job.is_active
        job.save()
        return Response({'status': 'success', 'is_active': job.is_active})

    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        """Получить все заявки на вакансию (только для создателя вакансии)."""
        job = self.get_object()
        if request.user != job.created_by and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view these applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(job=job)
        serializer = ApplicationSerializer(applications, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Applications retrieved successfully'
        })

    @action(detail=True, methods=['get'])
    def application_stats(self, request, pk=None):
        """Получить статистику по заявкам на вакансию."""
        job = self.get_object()
        if request.user != job.created_by and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view these statistics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = Application.objects.filter(job=job)
        stats = {
            'total': applications.count(),
            'by_status': {}
        }
        
        status_counts = applications.values('status').annotate(count=Count('status'))
        for status_count in status_counts:
            stats['by_status'][status_count['status']] = status_count['count']
        
        # Добавляем статистику по времени
        today = timezone.now().date()
        stats['new_today'] = applications.filter(created_at__date=today).count()
        stats['new_this_week'] = applications.filter(created_at__date__gte=today - timedelta(days=7)).count()
        
        return Response(stats)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@extend_schema(tags=['jobs'])
class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsApplicantOrEmployer]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'job']
    ordering_fields = ['created_at', 'updated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'employer':
            return queryset.filter(job__created_by=self.request.user)
        return queryset.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)
        
        # Обновляем счетчик заявок у вакансии
        job = serializer.validated_data['job']
        job.application_count += 1
        job.save(update_fields=['application_count'])

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Application.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = new_status
        application.save()
        return Response(ApplicationSerializer(application).data)

    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        application = self.get_object()
        interview_date = request.data.get('interview_date')
        notes = request.data.get('notes', '')
        
        if not interview_date:
            return Response(
                {'error': 'Interview date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.interview_date = interview_date
        application.notes = notes
        application.status = 'interviewed'
        application.save()
        
        return Response(ApplicationSerializer(application).data)

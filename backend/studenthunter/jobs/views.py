from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from jobs.models import Job
from jobs.serializers import JobSerializer, JobListSerializer
from applications.models import Application
from applications.serializers import ApplicationSerializer
from jobs.permissions import IsEmployerOrReadOnly, IsApplicantOrEmployer
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

@extend_schema(tags=['jobs'])
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsEmployerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'industry', 'location', 'is_active', 'featured']
    search_fields = ['title', 'description', 'company', 'requirements']
    ordering_fields = ['posted_date', 'salary', 'view_count', 'application_count', 'title']

    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            if self.request.user.role == 'employer' and self.action in ['list', 'retrieve']:
                # Для действий list и retrieve работодатели видят все вакансии
                return queryset.filter(is_active=True)
            elif self.request.user.role == 'employer':
                # Для других действий работодатель видит только свои вакансии
                return queryset.filter(created_by=self.request.user)
        return queryset.filter(is_active=True)  # Неавторизованные пользователи видят только активные вакансии

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Увеличиваем счетчик просмотров
        if not request.user.is_authenticated or request.user != instance.created_by:
            instance.view_count += 1
            instance.save(update_fields=['view_count'])
        
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

    @action(detail=False, methods=['get'])
    def employer_jobs(self, request):
        """Get all jobs of the current employer"""
        if not request.user.is_authenticated or request.user.role != 'employer':
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        jobs = Job.objects.filter(created_by=request.user)
        
        # Filter by activity status
        active_filter = request.query_params.get('active')
        if active_filter is not None:
            is_active = active_filter.lower() == 'true'
            jobs = jobs.filter(is_active=is_active)
        
        serializer = self.get_serializer(jobs, many=True)
        
        # Format response to match frontend expectations
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Jobs retrieved successfully'
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Получить рекомендуемые вакансии."""
        featured_jobs = Job.objects.filter(featured=True, is_active=True)
        serializer = self.get_serializer(featured_jobs, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Featured jobs retrieved successfully'
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Получить недавние вакансии."""
        recent_jobs = Job.objects.filter(is_active=True).order_by('-posted_date')[:10]
        serializer = self.get_serializer(recent_jobs, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Recent jobs retrieved successfully'
        })
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Получить популярные вакансии (по просмотрам и заявкам)."""
        popular_jobs = Job.objects.filter(is_active=True).order_by('-view_count', '-application_count')[:10]
        serializer = self.get_serializer(popular_jobs, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Popular jobs retrieved successfully'
        })

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

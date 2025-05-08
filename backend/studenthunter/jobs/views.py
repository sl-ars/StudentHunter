from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from .models import Job
from .serializers import JobSerializer
from applications.models import Application
from applications.serializers import ApplicationSerializer
from .permissions import IsEmployerOrReadOnly, IsApplicantOrEmployer

@extend_schema(tags=['jobs'])
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsEmployerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'industry', 'location', 'is_active']
    search_fields = ['title', 'description', 'company']
    ordering_fields = ['posted_date', 'salary', 'view_count', 'application_count']

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            if self.request.user.role == 'employer':
                return queryset.filter(created_by=self.request.user)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
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
        job = self.get_object()
        applications = Application.objects.filter(job=job)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def employer_jobs(self, request):
        """Получить все вакансии текущего работодателя"""
        if not request.user.is_authenticated or request.user.role != 'employer':
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        jobs = Job.objects.filter(created_by=request.user)
        serializer = self.get_serializer(jobs, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'message': 'Jobs retrieved successfully'
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

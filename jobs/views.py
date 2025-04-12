from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, JobApplication
from .serializers import (
    JobSerializer, JobDetailSerializer,
    JobApplicationSerializer, JobApplicationDetailSerializer
)
from .permissions import IsEmployerOrReadOnly, IsApplicantOrEmployer
from .filters import JobFilter

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(status='published')
    serializer_class = JobSerializer
    permission_classes = [IsEmployerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'company__name', 'location', 'description']
    ordering_fields = ['created_at', 'title', 'salary_min', 'salary_max']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobDetailSerializer
        return JobSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        job = self.get_object()
        user = request.user
        
        # Check if user has already applied
        if JobApplication.objects.filter(job=job, applicant=user).exists():
            return Response(
                {'error': 'You have already applied for this job'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create application
        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(job=job, applicant=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        job = self.get_object()
        
        # Only the employer or admin can see applications
        if request.user != job.created_by and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view these applications'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = job.applications.all()
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        job = self.get_object()
        
        # Find jobs with similar title, industry, or location
        similar_jobs = Job.objects.filter(
            Q(title__icontains=job.title) | 
            Q(company__industry=job.company.industry) | 
            Q(location=job.location)
        ).exclude(id=job.id)[:5]
        
        serializer = JobSerializer(similar_jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        # Get jobs with the most applications and saves in the last 30 days
        from django.utils import timezone
        from datetime import timedelta
        
        last_month = timezone.now() - timedelta(days=30)
        
        # Annotate jobs with application count and saved count
        jobs = Job.objects.filter(status='published').annotate(
            applications_count=Count(
                'applications',
                filter=Q(applications__applied_at__gte=last_month)
            ),
            saved_count=Count('saved_by')
        ).order_by('-applications_count', '-saved_count')[:10]
        
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsApplicantOrEmployer]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['applied_at', 'updated_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Students can only see their own applications
        if user.role == 'student':
            return JobApplication.objects.filter(applicant=user)
        
        # Employers can see applications for their jobs
        elif user.role == 'manager':
            return JobApplication.objects.filter(job__created_by=user)
        
        # Admins can see all applications
        return JobApplication.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobApplicationDetailSerializer
        return JobApplicationSerializer
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status value
        valid_statuses = dict(JobApplication.STATUS_CHOICES).keys()
        if status_value not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        application.status = status_value
        if 'notes' in request.data:
            application.notes = request.data['notes']
        application.save()
        
        serializer = JobApplicationDetailSerializer(application)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        
        if user.role == 'student':
            # Get application statistics for student
            total = JobApplication.objects.filter(applicant=user).count()
            pending = JobApplication.objects.filter(applicant=user, status='pending').count()
            reviewing = JobApplication.objects.filter(applicant=user, status='reviewing').count()
            interview = JobApplication.objects.filter(applicant=user, status='interview').count()
            accepted = JobApplication.objects.filter(applicant=user, status='accepted').count()
            rejected = JobApplication.objects.filter(applicant=user, status='rejected').count()
            
            data = {
                'total': total,
                'pending': pending,
                'reviewing': reviewing,
                'interview': interview,
                'accepted': accepted,
                'rejected': rejected,
            }
            
            return Response(data)
        
        elif user.role == 'manager':
            # Get application statistics for employer
            total = JobApplication.objects.filter(job__created_by=user).count()
            pending = JobApplication.objects.filter(job__created_by=user, status='pending').count()
            reviewing = JobApplication.objects.filter(job__created_by=user, status='reviewing').count()
            interview = JobApplication.objects.filter(job__created_by=user, status='interview').count()
            accepted = JobApplication.objects.filter(job__created_by=user, status='accepted').count()
            rejected = JobApplication.objects.filter(job__created_by=user, status='rejected').count()
            
            data = {
                'total': total,
                'pending': pending,
                'reviewing': reviewing,
                'interview': interview,
                'accepted': accepted,
                'rejected': rejected,
            }
            
            return Response(data)
        
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

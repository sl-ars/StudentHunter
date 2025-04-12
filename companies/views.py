from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Company, CompanyBenefit
from .serializers import CompanySerializer, CompanyDetailSerializer, CompanyBenefitSerializer, CompanyStatsSerializer
from users.models import FollowedCompany

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['industry', 'location', 'is_verified']
    search_fields = ['name', 'description', 'industry', 'location']
    ordering_fields = ['name', 'created_at', 'followers_count']
    
    def get_queryset(self):
        queryset = Company.objects.all()

        # Add followers count annotation
        queryset = queryset.annotate(followers_count=Count('followers'))

        # Add jobs count annotation
        queryset = queryset.annotate(jobs_count=Count('jobs'))

        # Filter by size range
        size_min = self.request.query_params.get('size_min')
        size_max = self.request.query_params.get('size_max')
        
        if size_min and size_max:
            # Assuming size is stored as a string like "1-10", "11-50", etc.
            sizes = {
                'micro': 1,
                '1-10': 2,
                '11-50': 3,
                '51-200': 4,
                '201-500': 5,
                '501-1000': 6,
                '1001+': 7
            }
            
            size_values = list(sizes.keys())
            min_index = size_values.index(size_min) if size_min in size_values else 0
            max_index = size_values.index(size_max) if size_max in size_values else len(size_values) - 1
            
            valid_sizes = size_values[min_index:max_index+1]
            queryset = queryset.filter(size__in=valid_sizes)

        # Filter by founded year range
        year_min = self.request.query_params.get('year_min')
        year_max = self.request.query_params.get('year_max')
        
        if year_min:
            queryset = queryset.filter(founded_year__gte=year_min)
        
        if year_max:
            queryset = queryset.filter(founded_year__lte=year_max)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CompanyDetailSerializer
        if self.action == 'stats':
            return CompanyStatsSerializer
        return CompanySerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.is_verified = True
        company.save()
        return Response({'status': 'company verified'})
    
    @action(detail=True, methods=['get'])
    def jobs(self, request, pk=None):
        company = self.get_object()
        jobs = company.jobs.all()
        from jobs.serializers import JobSerializer
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        company = self.get_object()
        followers = company.followers.all()
        from users.serializers import UserSerializer
        serializer = UserSerializer([f.user for f in followers], many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        company = self.get_object()
        
        # Get job statistics
        jobs_count = company.jobs.count()
        active_jobs_count = company.jobs.filter(status='published').count()
        
        # Get application statistics
        from jobs.models import JobApplication
        applications_count = JobApplication.objects.filter(job__company=company).count()
        
        # Get follower statistics
        followers_count = company.followers.count()
        
        # Get job type distribution
        job_types = company.jobs.values('job_type').annotate(count=Count('id'))
        
        # Get salary statistics
        avg_min_salary = company.jobs.filter(salary_min__isnull=False).aggregate(avg=Avg('salary_min'))['avg']
        avg_max_salary = company.jobs.filter(salary_max__isnull=False).aggregate(avg=Avg('salary_max'))['avg']
        
        data = {
            'jobs_count': jobs_count,
            'active_jobs_count': active_jobs_count,
            'applications_count': applications_count,
            'followers_count': followers_count,
            'job_types': job_types,
            'avg_min_salary': avg_min_salary,
            'avg_max_salary': avg_max_salary,
        }
        
        serializer = self.get_serializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        # Get companies with the most followers and job applications in the last 30 days
        from django.utils import timezone
        from datetime import timedelta
        
        last_month = timezone.now() - timedelta(days=30)
        
        # Annotate companies with follower count and application count
        companies = Company.objects.annotate(
            followers_count=Count('followers'),
            applications_count=Count(
                'jobs__applications',
                filter=Q(jobs__applications__applied_at__gte=last_month)
            )
        ).order_by('-followers_count', '-applications_count')[:10]
        
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

class CompanyBenefitViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyBenefitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CompanyBenefit.objects.filter(company_id=self.kwargs['company_pk'])
    
    def perform_create(self, serializer):
        company_id = self.kwargs['company_pk']
        serializer.save(company_id=company_id)

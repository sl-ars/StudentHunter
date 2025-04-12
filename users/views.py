from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import UserProfile, Resume, SavedJob, FollowedCompany
from .serializers import (
    UserSerializer, UserDetailSerializer, RegisterSerializer,
    ResumeSerializer, SavedJobSerializer, FollowedCompanySerializer,
    UserStatsSerializer
)
from jobs.models import Job, JobApplication
from companies.models import Company

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserStatsSerializer

    def get(self, request):
        user = request.user

        # Get application statistics
        applications_count = JobApplication.objects.filter(applicant=user).count()

        # Get saved job statistics
        saved_jobs_count = SavedJob.objects.filter(user=user).count()

        # Get followed company statistics
        followed_companies_count = FollowedCompany.objects.filter(user=user).count()

        # Get application status distribution
        application_statuses = JobApplication.objects.filter(applicant=user).values('status').annotate(
            count=Count('id'))

        data = {
            'applications_count': applications_count,
            'saved_jobs_count': saved_jobs_count,
            'followed_companies_count': followed_companies_count,
            'application_statuses': application_statuses,
        }

        serializer = self.get_serializer(data)
        return Response(serializer.data)


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If this is marked as default, unmark other default resumes
        if serializer.validated_data.get('is_default', False):
            Resume.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # If this is marked as default, unmark other default resumes
        if serializer.validated_data.get('is_default', False):
            Resume.objects.filter(user=self.request.user, is_default=True).exclude(
                id=serializer.instance.id
            ).update(is_default=False)
        serializer.save()


class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def save_job(self, request):
        job_id = request.data.get('job_id')
        try:
            job = Job.objects.get(id=job_id)
            saved_job, created = SavedJob.objects.get_or_create(user=request.user, job=job)
            if created:
                return Response({'message': 'Job saved successfully'}, status=status.HTTP_201_CREATED)
            return Response({'message': 'Job already saved'}, status=status.HTTP_200_OK)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def unsave_job(self, request):
        job_id = request.data.get('job_id')
        try:
            saved_job = SavedJob.objects.get(user=request.user, job_id=job_id)
            saved_job.delete()
            return Response({'message': 'Job unsaved successfully'}, status=status.HTTP_200_OK)
        except SavedJob.DoesNotExist:
            return Response({'error': 'Job not saved'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        user = request.user

        # Get user's saved jobs
        saved_jobs = SavedJob.objects.filter(user=user).values_list('job_id', flat=True)

        if not saved_jobs:
            # If no saved jobs, return trending jobs
            from django.db.models import Count
            trending_jobs = Job.objects.filter(status='published').annotate(
                saved_count=Count('saved_by')
            ).order_by('-saved_count')[:5]

            from jobs.serializers import JobSerializer
            serializer = JobSerializer(trending_jobs, many=True)
            return Response(serializer.data)

        # Get job details
        saved_job_objects = Job.objects.filter(id__in=saved_jobs)

        # Extract relevant features (title keywords, company industry, location)
        titles = ' '.join([job.title for job in saved_job_objects])
        industries = set([job.company.industry for job in saved_job_objects if job.company.industry])
        locations = set([job.location for job in saved_job_objects])

        # Find similar jobs
        from django.db.models import Q

        query = Q()

        # Add title keywords to query
        import re
        keywords = re.findall(r'\b\w+\b', titles.lower())
        for keyword in keywords:
            if len(keyword) > 3:  # Ignore short words
                query |= Q(title__icontains=keyword)

        # Add industry and location to query
        for industry in industries:
            query |= Q(company__industry=industry)

        for location in locations:
            query |= Q(location=location)

        # Get recommended jobs
        recommended_jobs = Job.objects.filter(
            query,
            status='published'
        ).exclude(
            id__in=saved_jobs
        ).distinct()[:5]

        from jobs.serializers import JobSerializer
        serializer = JobSerializer(recommended_jobs, many=True)
        return Response(serializer.data)


class FollowedCompanyViewSet(viewsets.ModelViewSet):
    serializer_class = FollowedCompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FollowedCompany.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def follow_company(self, request):
        company_id = request.data.get('company_id')
        try:
            company = Company.objects.get(id=company_id)
            followed, created = FollowedCompany.objects.get_or_create(user=request.user, company=company)
            if created:
                return Response({'message': 'Company followed successfully'}, status=status.HTTP_201_CREATED)
            return Response({'message': 'Company already followed'}, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def unfollow_company(self, request):
        company_id = request.data.get('company_id')
        try:
            followed = FollowedCompany.objects.get(user=request.user, company_id=company_id)
            followed.delete()
            return Response({'message': 'Company unfollowed successfully'}, status=status.HTTP_200_OK)
        except FollowedCompany.DoesNotExist:
            return Response({'error': 'Company not followed'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        user = request.user

        # Get user's followed companies
        followed_companies = FollowedCompany.objects.filter(user=user).values_list('company_id', flat=True)

        if not followed_companies:
            # If no followed companies, return trending companies
            from django.db.models import Count
            trending_companies = Company.objects.annotate(
                followers_count=Count('followers')
            ).order_by('-followers_count')[:5]

            from companies.serializers import CompanySerializer
            serializer = CompanySerializer(trending_companies, many=True)
            return Response(serializer.data)

        # Get company details
        followed_company_objects = Company.objects.filter(id__in=followed_companies)

        # Extract relevant features (industry, location)
        industries = set([company.industry for company in followed_company_objects if company.industry])
        locations = set([company.location for company in followed_company_objects if company.location])

        # Find similar companies
        from django.db.models import Q

        query = Q()

        # Add industry and location to query
        for industry in industries:
            query |= Q(industry=industry)

        for location in locations:
            query |= Q(location=location)

        # Get recommended companies
        recommended_companies = Company.objects.filter(
            query
        ).exclude(
            id__in=followed_companies
        ).distinct()[:5]

        from companies.serializers import CompanySerializer
        serializer = CompanySerializer(recommended_companies, many=True)
        return Response(serializer.data)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # Add user data to response
        if response.status_code == 200:
            user = User.objects.get(email=request.data['email'])
            user_data = UserSerializer(user).data
            response.data['user'] = user_data

        return response


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

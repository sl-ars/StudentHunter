from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
import sentry_sdk
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from rest_framework.pagination import PageNumberPagination

from .models import Job, JobCategory, JobSkill, JobApplication
from .serializers import (
    JobListSerializer, JobDetailSerializer, JobCategorySerializer,
    JobSkillSerializer, JobApplicationSerializer, JobApplicationCreateSerializer
)
from users.views import ResponseMixin
from .filters import JobFilter


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@extend_schema_view(
    list=extend_schema(
        summary="List all job categories",
        description="Returns a list of all job categories",
        tags=["job categories"]
    ),
    retrieve=extend_schema(
        summary="Retrieve a job category",
        description="Returns details for a specific job category",
        tags=["job categories"]
    ),
    create=extend_schema(
        summary="Create a job category",
        description="Creates a new job category",
        tags=["job categories"]
    ),
    update=extend_schema(
        summary="Update a job category",
        description="Updates all fields of an existing job category",
        tags=["job categories"]
    ),
    partial_update=extend_schema(
        summary="Partially update a job category",
        description="Updates specific fields of an existing job category",
        tags=["job categories"]
    ),
    destroy=extend_schema(
        summary="Delete a job category",
        description="Deletes a job category",
        tags=["job categories"]
    )
)
class JobCategoryViewSet(viewsets.ModelViewSet, ResponseMixin):
    """ViewSet for job categories."""
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"categories": serializer.data},
                "Job categories retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            self.format_response(
                "success",
                serializer.data,
                "Job category retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(
                self.format_response(
                    "success",
                    serializer.data,
                    "Job category created successfully"
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            self.format_response(
                "error",
                serializer.errors,
                "Failed to create job category"
            ),
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(
                self.format_response(
                    "success",
                    serializer.data,
                    "Job category updated successfully"
                ),
                status=status.HTTP_200_OK
            )
        return Response(
            self.format_response(
                "error",
                serializer.errors,
                "Failed to update job category"
            ),
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            self.format_response(
                "success",
                {},
                "Job category deleted successfully"
            ),
            status=status.HTTP_204_NO_CONTENT
        )


@extend_schema_view(
    list=extend_schema(
        summary="List all job skills",
        description="Returns a list of all job skills",
        tags=["job skills"]
    ),
    retrieve=extend_schema(
        summary="Retrieve a job skill",
        description="Returns details for a specific job skill",
        tags=["job skills"]
    ),
    create=extend_schema(
        summary="Create a job skill",
        description="Creates a new job skill",
        tags=["job skills"]
    ),
    update=extend_schema(
        summary="Update a job skill",
        description="Updates all fields of an existing job skill",
        tags=["job skills"]
    ),
    partial_update=extend_schema(
        summary="Partially update a job skill",
        description="Updates specific fields of an existing job skill",
        tags=["job skills"]
    ),
    destroy=extend_schema(
        summary="Delete a job skill",
        description="Deletes a job skill",
        tags=["job skills"]
    )
)
class JobSkillViewSet(viewsets.ModelViewSet, ResponseMixin):
    """ViewSet for job skills."""
    queryset = JobSkill.objects.all()
    serializer_class = JobSkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"skills": serializer.data},
                "Job skills retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    list=extend_schema(
        summary="List all jobs",
        description="Returns a list of all jobs with optional filtering",
        tags=["jobs"]
    ),
    retrieve=extend_schema(
        summary="Retrieve a job",
        description="Returns details for a specific job",
        tags=["jobs"]
    ),
    create=extend_schema(
        summary="Create a job",
        description="Creates a new job listing",
        tags=["jobs"]
    ),
    update=extend_schema(
        summary="Update a job",
        description="Updates all fields of an existing job",
        tags=["jobs"]
    ),
    partial_update=extend_schema(
        summary="Partially update a job",
        description="Updates specific fields of an existing job",
        tags=["jobs"]
    ),
    destroy=extend_schema(
        summary="Delete a job",
        description="Deletes a job listing",
        tags=["jobs"]
    )
)
class JobViewSet(viewsets.ModelViewSet, ResponseMixin):
    """ViewSet for job listings."""
    queryset = Job.objects.all()
    serializer_class = JobListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'description', 'skills_required', 'location']
    ordering_fields = ['created_at', 'application_deadline', 'salary_min', 'salary_max']
    ordering = ['-created_at']
    pagination_class = CustomPagination

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobDetailSerializer
        return JobListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by company if provided
        company_id = self.request.query_params.get('company')
        if company_id:
            queryset = queryset.filter(company_id=company_id)

        # Filter by active status if requested
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(
                status='published',
                application_deadline__gte=timezone.now().date()
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                self.format_response(
                    "success",
                    {"jobs": serializer.data},
                    "Jobs retrieved successfully"
                )
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"jobs": serializer.data},
                "Jobs retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Increment the views count
        instance.views_count += 1
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(
            self.format_response(
                "success",
                serializer.data,
                "Job retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        # Set the created_by field to the current user
        request.data['created_by'] = request.user.id

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                self.perform_create(serializer)
                return Response(
                    self.format_response(
                        "success",
                        serializer.data,
                        "Job created successfully"
                    ),
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                sentry_sdk.capture_exception(e)
                return Response(
                    self.format_response(
                        "error",
                        {},
                        str(e)
                    ),
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
            self.format_response(
                "error",
                serializer.errors,
                "Failed to create job"
            ),
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Check if the user is the creator of the job or an admin
        if request.user != instance.created_by and not request.user.is_staff:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "You do not have permission to update this job"
                ),
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(
                self.format_response(
                    "success",
                    serializer.data,
                    "Job updated successfully"
                ),
                status=status.HTTP_200_OK
            )
        return Response(
            self.format_response(
                "error",
                serializer.errors,
                "Failed to update job"
            ),
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check if the user is the creator of the job or an admin
        if request.user != instance.created_by and not request.user.is_staff:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "You do not have permission to delete this job"
                ),
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response(
            self.format_response(
                "success",
                {},
                "Job deleted successfully"
            ),
            status=status.HTTP_204_NO_CONTENT
        )

    @extend_schema(
        summary="Search for jobs",
        description="Search for jobs based on query parameters",
        parameters=[
            OpenApiParameter(name="q", description="Search query", required=False, type=str),
            OpenApiParameter(name="location", description="Location filter", required=False, type=str),
        ],
        tags=["jobs"]
    )
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search for jobs based on query parameters."""
        query = request.query_params.get('q', '')
        location = request.query_params.get('location', '')

        queryset = self.get_queryset()

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(skills_required__icontains=query)
            )

        if location:
            queryset = queryset.filter(
                Q(location__icontains=location) |
                Q(is_remote=True)
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                self.format_response(
                    "success",
                    {"jobs": serializer.data},
                    "Search results retrieved successfully"
                )
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"jobs": serializer.data},
                "Search results retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Get recommended jobs",
        description="Get recommended jobs for the current user based on their skills and preferences",
        tags=["jobs"]
    )
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get recommended jobs for the current user."""
        user = request.user

        # This is a simple recommendation system based on user's skills
        # In a real application, you would use a more sophisticated algorithm

        # Get the user's skills (assuming they are stored in the user profile)
        user_skills = []
        if hasattr(user, 'profile') and user.profile.skills:
            user_skills = user.profile.skills.lower().split(',')

        queryset = self.get_queryset().filter(status='published')

        # If user has skills, filter jobs that match those skills
        if user_skills:
            skill_filter = Q()
            for skill in user_skills:
                skill = skill.strip()
                if skill:
                    skill_filter |= Q(skills_required__icontains=skill)

            queryset = queryset.filter(skill_filter)

        # Limit to 10 recommendations
        queryset = queryset[:10]

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"recommended_jobs": serializer.data},
                "Recommended jobs retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Get similar jobs",
        description="Get jobs similar to the specified job",
        tags=["jobs"]
    )
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get jobs similar to this job."""
        job = self.get_object()

        # Find jobs with similar skills, category, or job type
        similar_jobs = Job.objects.filter(
            Q(skills_required__icontains=job.skills_required) |
            Q(category=job.category) |
            Q(job_type=job.job_type)
        ).exclude(id=job.id)[:5]

        serializer = self.get_serializer(similar_jobs, many=True)
        return Response(
            self.format_response(
                "success",
                {"similar_jobs": serializer.data},
                "Similar jobs retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Save a job",
        description="Save a job to the user's saved jobs list",
        tags=["jobs"]
    )
    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """Save a job to the user's saved jobs list."""
        job = self.get_object()
        user = request.user

        # Check if the job is already saved
        if hasattr(user, 'profile') and job in user.profile.saved_jobs.all():
            return Response(
                self.format_response(
                    "error",
                    {},
                    "Job is already saved"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save the job
        user.profile.saved_jobs.add(job)

        return Response(
            self.format_response(
                "success",
                {},
                "Job saved successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Unsave a job",
        description="Remove a job from the user's saved jobs list",
        tags=["jobs"]
    )
    @action(detail=True, methods=['delete'])
    def unsave(self, request, pk=None):
        """Remove a job from the user's saved jobs list."""
        job = self.get_object()
        user = request.user

        # Check if the job is saved
        if not hasattr(user, 'profile') or job not in user.profile.saved_jobs.all():
            return Response(
                self.format_response(
                    "error",
                    {},
                    "Job is not saved"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove the job from saved jobs
        user.profile.saved_jobs.remove(job)

        return Response(
            self.format_response(
                "success",
                {},
                "Job removed from saved jobs successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Check application status",
        description="Check the application status for a job by the current user",
        tags=["jobs"]
    )
    @action(detail=True, methods=['get'])
    def application_status(self, request, pk=None):
        """Check the application status for a job by the current user."""
        job = self.get_object()
        user = request.user

        # Check if the user has applied for this job
        application = JobApplication.objects.filter(job=job, applicant=user).first()

        if application:
            from .serializers import JobApplicationSerializer
            serializer = JobApplicationSerializer(application)
            return Response(
                self.format_response(
                    "success",
                    {"application": serializer.data},
                    "Application status retrieved successfully"
                ),
                status=status.HTTP_200_OK
            )

        return Response(
            self.format_response(
                "success",
                {"application": None},
                "User has not applied for this job"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Get job types",
        description="Get a list of all job types",
        tags=["jobs"]
    )
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get a list of all job types."""
        job_types = Job.objects.values_list('job_type', flat=True).distinct()
        return Response(
            self.format_response(
                "success",
                {"types": list(job_types)},
                "Job types retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Get job locations",
        description="Get a list of all job locations",
        tags=["jobs"]
    )
    @action(detail=False, methods=['get'])
    def locations(self, request):
        """Get a list of all job locations."""
        locations = Job.objects.values_list('location', flat=True).distinct()
        return Response(
            self.format_response(
                "success",
                {"locations": list(locations)},
                "Job locations retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Get job matches",
        description="Get jobs that match the user's resume",
        tags=["jobs"]
    )
    @action(detail=False, methods=['get'])
    def matches(self, request):
        """Get jobs that match the user's resume."""
        user = request.user

        # Get the user's resume
        from resumes.models import Resume
        resume = Resume.objects.filter(user=user).first()

        if not resume:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "User does not have a resume"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the user's skills from the resume
        resume_skills = resume.skills.lower().split(',') if resume.skills else []

        # Find jobs that match the user's skills
        queryset = self.get_queryset().filter(status='published')

        if resume_skills:
            skill_filter = Q()
            for skill in resume_skills:
                skill = skill.strip()
                if skill:
                    skill_filter |= Q(skills_required__icontains=skill)

            queryset = queryset.filter(skill_filter)

        # Limit to 10 matches
        queryset = queryset[:10]

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"matches": serializer.data},
                "Job matches retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    list=extend_schema(
        summary="List all job applications",
        description="Returns a list of all job applications",
        tags=["job applications"]
    ),
    retrieve=extend_schema(
        summary="Retrieve a job application",
        description="Returns details for a specific job application",
        tags=["job applications"]
    ),
    create=extend_schema(
        summary="Create a job application",
        description="Creates a new job application",
        tags=["job applications"]
    ),
    update=extend_schema(
        summary="Update a job application",
        description="Updates all fields of an existing job application",
        tags=["job applications"]
    ),
    partial_update=extend_schema(
        summary="Partially update a job application",
        description="Updates specific fields of an existing job application",
        tags=["job applications"]
    ),
    destroy=extend_schema(
        summary="Delete a job application",
        description="Deletes a job application",
        tags=["job applications"]
    )
)
class JobApplicationViewSet(viewsets.ModelViewSet, ResponseMixin):
    """ViewSet for job applications."""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['job', 'status']
    ordering_fields = ['applied_at', 'updated_at']
    ordering = ['-applied_at']

    def get_queryset(self):
        user = self.request.user

        # If the user is a student, only show their applications
        if hasattr(user, 'profile') and user.profile.user_type == 'student':
            return JobApplication.objects.filter(applicant=user)

        # If the user is an employer, only show applications for their company's jobs
        elif hasattr(user, 'profile') and user.profile.user_type == 'employer':
            if hasattr(user, 'company'):
                return JobApplication.objects.filter(job__company=user.company)

        # If the user is an admin or campus rep, show all applications
        elif user.is_staff or (hasattr(user, 'profile') and user.profile.user_type in ['admin', 'campus_rep']):
            return JobApplication.objects.all()

        # Default: return empty queryset
        return JobApplication.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return JobApplicationCreateSerializer
        return JobApplicationSerializer

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                self.format_response(
                    "success",
                    {"applications": serializer.data},
                    "Job applications retrieved successfully"
                )
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            self.format_response(
                "success",
                {"applications": serializer.data},
                "Job applications retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            self.format_response(
                "success",
                serializer.data,
                "Job application retrieved successfully"
            ),
            status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check if the user has already applied for this job
            job_id = serializer.validated_data.get('job').id
            if JobApplication.objects.filter(job_id=job_id, applicant=request.user).exists():
                return Response(
                    self.format_response(
                        "error",
                        {},
                        "You have already applied for this job"
                    ),
                    status=status.HTTP_400_BAD_REQUEST
                )

            self.perform_create(serializer)
            return Response(
                self.format_response(
                    "success",
                    serializer.data,
                    "Job application submitted successfully"
                ),
                status=status.HTTP_201_CREATED
            )
        return Response(
            self.format_response(
                "error",
                serializer.errors,
                "Failed to submit job application"
            ),
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Only allow the applicant or employer to update the application
        if request.user != instance.applicant and not (
                hasattr(request.user, 'company') and
                instance.job.company == request.user.company
        ) and not request.user.is_staff:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "You do not have permission to update this application"
                ),
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(
                self.format_response(
                    "success",
                    serializer.data,
                    "Job application updated successfully"
                ),
                status=status.HTTP_200_OK
            )
        return Response(
            self.format_response(
                "error",
                serializer.errors,
                "Failed to update job application"
            ),
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Only allow the applicant or admin to delete the application
        if request.user != instance.applicant and not request.user.is_staff:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "You do not have permission to delete this application"
                ),
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response(
            self.format_response(
                "success",
                {},
                "Job application deleted successfully"
            ),
            status=status.HTTP_204_NO_CONTENT
        )

    @extend_schema(
        summary="Update application status",
        description="Update the status of a job application",
        tags=["job applications"]
    )
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update the status of a job application."""
        application = self.get_object()

        # Only allow the employer or admin to update the status
        if not (
                hasattr(request.user, 'company') and
                application.job.company == request.user.company
        ) and not request.user.is_staff:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "You do not have permission to update this application status"
                ),
                status=status.HTTP_403_FORBIDDEN
            )

        status_value = request.data.get('status')
        if not status_value:
            return Response(
                self.format_response(
                    "error",
                    {},
                    "Status is required"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate the status value
        valid_statuses = ['pending', 'reviewing', 'interview', 'accepted', 'rejected']

        if status_value not in valid_statuses:
            return Response(
                self.format_response(
                    "error",
                    {},
                    f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = status_value
        application.updated_at = timezone.now()
        application.save()

        serializer = self.get_serializer(application)
        return Response(
            self.format_response(
                "success",
                serializer.data,
                "Application status updated successfully"
            ),
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Get application statistics",
        description="Get statistics about job applications",
        tags=["job applications"]
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get statistics about job applications."""
        user = request.user

        # For students, get their application statistics
        if hasattr(user, 'profile') and user.profile.user_type == 'student':
            applications = JobApplication.objects.filter(applicant=user)

            stats = {
                'total': applications.count(),
                'pending': applications.filter(status='pending').count(),
                'reviewing': applications.filter(status='reviewing').count(),
                'interview': applications.filter(status='interview').count(),
                'accepted': applications.filter(status='accepted').count(),
                'rejected': applications.filter(status='rejected').count(),
            }

            return Response(
                self.format_response(
                    "success",
                    {"statistics": stats},
                    "Application statistics retrieved successfully"
                ),
                status=status.HTTP_200_OK
            )

        # For employers, get statistics for their company's jobs
        elif hasattr(user, 'profile') and user.profile.user_type == 'employer':
            if hasattr(user, 'company'):
                applications = JobApplication.objects.filter(job__company=user.company)

                stats = {
                    'total': applications.count(),
                    'pending': applications.filter(status='pending').count(),
                    'reviewing': applications.filter(status='reviewing').count(),
                    'interview': applications.filter(status='interview').count(),
                    'accepted': applications.filter(status='accepted').count(),
                    'rejected': applications.filter(status='rejected').count(),
                }

                return Response(
                    self.format_response(
                        "success",
                        {"statistics": stats},
                        "Application statistics retrieved successfully"
                    ),
                    status=status.HTTP_200_OK
                )

        # For admins, get overall statistics
        elif user.is_staff:
            applications = JobApplication.objects.all()

            stats = {
                'total': applications.count(),
                'pending': applications.filter(status='pending').count(),
                'reviewing': applications.filter(status='reviewing').count(),
                'interview': applications.filter(status='interview').count(),
                'accepted': applications.filter(status='accepted').count(),
                'rejected': applications.filter(status='rejected').count(),
            }

            return Response(
                self.format_response(
                    "success",
                    {"statistics": stats},
                    "Application statistics retrieved successfully"
                ),
                status=status.HTTP_200_OK
            )

        return Response(
            self.format_response(
                "error",
                {},
                "You do not have permission to view application statistics"
            ),
            status=status.HTTP_403_FORBIDDEN
        )

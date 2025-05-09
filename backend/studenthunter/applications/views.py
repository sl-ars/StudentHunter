from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from applications.models import Application, ApplicationStatus
from applications.serializers import ApplicationSerializer, ApplicationDetailSerializer
from jobs.models import Job
from core.permissions import IsOwnerOrEmployer
from core.utils import ok, fail

@extend_schema(tags=['applications'])
class ApplicationViewSet(viewsets.ModelViewSet):
    """Application management API."""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployer]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'job']
    ordering_fields = ['created_at', 'updated_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ApplicationDetailSerializer
        return ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Application.objects.all()
        if user.role == 'employer':
            return Application.objects.filter(job__created_by=user)
        if user.role == 'student':
            return Application.objects.filter(applicant=user)
        return Application.objects.none()

    def perform_create(self, serializer):
        job = serializer.validated_data.get('job')
        if job.created_by == self.request.user:
            raise permissions.PermissionDenied("You cannot apply to your own job posting.")
        serializer.save(applicant=self.request.user)
        job.application_count += 1
        job.save(update_fields=['application_count'])
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
        summary="Update application status",
        request={
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'status': {'type': 'string', 'enum': [choice[0] for choice in ApplicationStatus]},
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
        application = self.get_object()
        if request.user.role == 'employer' and application.job.created_by != request.user:
            return fail('Permission denied.', code=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'student':
            return fail('Permission denied. Students cannot update application status.', code=status.HTTP_403_FORBIDDEN)
        new_status = request.data.get('status')
        notes = request.data.get('notes', application.notes)
        if new_status not in ApplicationStatus.values:
            return fail('Invalid status', code=status.HTTP_400_BAD_REQUEST)
        application.status = new_status
        application.notes = notes
        application.save()
        return ok(self.get_serializer(application).data)

    @extend_schema(
        summary="Schedule interview",
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
        application = self.get_object()
        if request.user.role == 'employer' and application.job.created_by != request.user:
            return fail('Permission denied.', code=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'student':
            return fail('Permission denied.', code=status.HTTP_403_FORBIDDEN)
        interview_date = request.data.get('interview_date')
        notes = request.data.get('notes', application.notes)
        if not interview_date:
            return fail('Interview date is required', code=status.HTTP_400_BAD_REQUEST)
        application.interview_date = interview_date
        application.notes = notes
        application.status = ApplicationStatus.INTERVIEWED
        application.save()
        return ok(self.get_serializer(application).data)

    @extend_schema(
        summary="Application statistics",
        description="Returns application statistics depending on user role.",
        responses={200: OpenApiTypes.OBJECT}
    )
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        result = {'total': 0, 'by_status': {}, 'recent': 0}
        if user.role == 'employer':
            applications = Application.objects.filter(job__created_by=user)
            result.update({
                'total': applications.count(),
                'recent': applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count(),
                'by_job': {
                    job.id: {'title': job.title, 'count': applications.filter(job=job).count()}
                    for job in Job.objects.filter(created_by=user)
                }
            })
        elif user.role == 'student':
            applications = Application.objects.filter(applicant=user)
            result['total'] = applications.count()
            result['recent'] = applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count()
        elif user.is_staff: # Admins see all
            applications_qs = Application.objects.all()
            all_jobs = Job.objects.all() # Moved this up
            result['total'] = applications_qs.count()
            result['recent'] = applications_qs.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count()
            result['by_job_type'] = {
                # Ensure job_type is a string key, especially if it could be None/unexpected from DB
                str(job_type): applications_qs.filter(job__type=job_type).count()
                for job_type in all_jobs.values_list('type', flat=True).distinct() if job_type
            }
            result['by_location'] = {
                # Ensure location is a string key
                str(location): applications_qs.filter(job__location=location).count()
                for location in all_jobs.values_list('location', flat=True).distinct() if location
            }
        for status_code, _ in ApplicationStatus:
            result['by_status'][status_code] = applications_qs.filter(status=status_code).count()
        return ok(result)
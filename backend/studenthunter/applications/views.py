from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from .models import Application
from .serializers import ApplicationSerializer

@extend_schema(tags=['applications'])
class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'employer':
            return Application.objects.filter(job__created_by=user)
        elif user.role == 'student':
            return Application.objects.filter(applicant=user)
        return Application.objects.none()

    @extend_schema(summary="Create a new application")
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    @extend_schema(
        summary="Update Application Status",
        description="Updates the status of a specific application (e.g., reviewing, interviewed, accepted, rejected).",
        request={
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'status': {'type': 'string', 'enum': [choice[0] for choice in Application.STATUS_CHOICES]}
                    },
                    'required': ['status']
                }
            }
        },
        responses={
            200: ApplicationSerializer,
            400: {'description': 'Invalid status provided.'},
            403: {'description': 'Permission denied (e.g., student trying to update status of an application not their own, or employer not for their job).'},
            404: {'description': 'Application not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        if request.user.role == 'employer' and application.job.created_by != request.user:
            return Response({'error': 'Permission denied. You can only update status for applications to your jobs.'}, status=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'student':
            return Response({'error': 'Permission denied. Students cannot update application status this way.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        
        if new_status not in dict(Application.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        application.status = new_status
        application.save()
        
        return Response(self.get_serializer(application).data)

    @extend_schema(
        summary="List applications",
        description="Lists applications. Employers see applications for their jobs. Students see their own submitted applications."
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Submit a new application",
        description="Allows an authenticated student to submit an application for a job. The applicant field is automatically set to the current user."
    )
    def create(self, request, *args, **kwargs):
        if request.user.role != 'student':
             return Response({'error': 'Only students can submit applications.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Retrieve an application by ID")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update an application by ID",
        description="Note: General updates to applications might be restricted. Use specific actions like 'update_status' for status changes."
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partially update an application by ID",
        description="Note: General updates to applications might be restricted. Use specific actions like 'update_status' for status changes."
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete an application by ID",
        description="Allows deletion of an application. Consider if students should only be able to delete their own applications before they are processed."
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

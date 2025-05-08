from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from .models import Company
from .serializers import CompanySerializer

@extend_schema(tags=['companies'])
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = (filters.OrderingFilter, filters.SearchFilter)
    search_fields = ['name', 'industry', 'location']

    @extend_schema(
        summary="Verify a Company",
        description="Marks a company as verified.",
        request=None,
        responses={
            200: {'type': 'object', 'properties': {'status': {'type': 'string', 'example': 'verified'}}},
            404: {'description': 'Company not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.verified = True
        company.save()
        return Response({'status': 'verified'})

    @extend_schema(
        summary="Upload Company Logo",
        description="Uploads a logo for the specified company.",
        request={
            'multipart/form-data': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'logo': {'type': 'string', 'format': 'binary'}
                    },
                    'required': ['logo']
                }
            }
        },
        responses={
            200: {'type': 'object', 'properties': {'status': {'type': 'string'}, 'url': {'type': 'string', 'format': 'url'}}},
            400: {'description': 'No logo uploaded.'},
            404: {'description': 'Company not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def upload_logo(self, request, pk=None):
        company = self.get_object()
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()
            return Response({'status': 'logo uploaded', 'url': company.logo.url})
        return Response({'status': 'no logo uploaded'}, status=400)

    @extend_schema(summary="List all companies")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Create a new company")
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Retrieve a company by ID")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Update a company by ID")
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Partially update a company by ID")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Delete a company by ID")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

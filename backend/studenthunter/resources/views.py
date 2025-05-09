from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from resources.models import Resource
from resources.serializers import ResourceSerializer
from resources.permissions import IsAdminOrReadOnly

@extend_schema(tags=['resources'])
class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Resource.objects.all()
        
        category = self.request.query_params.get('category', None)
        if category and category != 'All':
            queryset = queryset.filter(category=category)
        
        resource_type = self.request.query_params.get('type', None)
        if resource_type:
            queryset = queryset.filter(type=resource_type)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__name__in=[search])
            )
        
        if not self.request.user.is_authenticated or not self.request.user.has_perm('resources.view_resource'):
            queryset = queryset.filter(is_demo=True)
        
        return queryset

    @extend_schema(
        summary="List all distinct resource categories",
        description="Retrieves a list of unique category names available for resources.",
        responses={200: {'type': 'array', 'items': {'type': 'string'}}}
    )
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Resource.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @extend_schema(
        summary="List all distinct resource types",
        description="Retrieves a list of unique type names available for resources.",
        responses={200: {'type': 'array', 'items': {'type': 'string'}}}
    )
    @action(detail=False, methods=['get'])
    def types(self, request):
        types = Resource.objects.values_list('type', flat=True).distinct()
        return Response(list(types))

    @extend_schema(
        summary="Download Resource File(s)",
        description=(
            "Retrieves download link(s) for a resource. Increments download count. "
            "If the resource has a single file, it returns a direct link. "
            "If multiple files, it returns a list of file objects with their links."
        ),
        responses={
            200: {
                'oneOf': [
                    {
                        'type': 'object',
                        'properties': {
                            'link': {'type': 'string', 'format': 'uri'},
                            'openInNewTab': {'type': 'boolean'}
                        },
                        'description': 'Response for a single file resource.'
                    },
                    {
                        'type': 'object',
                        'properties': {
                            'files': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'id': {'type': 'string', 'format': 'uuid'},
                                        'title': {'type': 'string'},
                                        'url': {'type': 'string', 'format': 'uri'},
                                        'type': {'type': 'string', 'description': 'File MIME type or category'},
                                        'size': {'type': 'integer', 'description': 'File size in bytes'},
                                        'openInNewTab': {'type': 'boolean'}
                                    }
                                }
                            }
                        },
                        'description': 'Response for a multi-file resource.'
                    }
                ]
            },
            404: {'description': 'Resource not found.'}
        }
    )
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        resource = self.get_object()
        resource.downloads += 1
        resource.save(update_fields=['downloads'])
        
        if resource.files.count() == 1:
            file_instance = resource.files.first()
            return Response({
                'link': request.build_absolute_uri(file_instance.file.url),
                'openInNewTab': file_instance.open_in_new_tab
            })
        
        files_data = [{
            'id': str(file_instance.id),
            'title': file_instance.title,
            'url': request.build_absolute_uri(file_instance.file.url),
            'type': file_instance.file_type,
            'size': file_instance.size,
            'openInNewTab': file_instance.open_in_new_tab
        } for file_instance in resource.files.all()]
        
        return Response({'files': files_data})

    @extend_schema(
        summary="List all resources",
        description="Retrieves a list of resources, optionally filtered by category, type, or search term. Unauthenticated users only see demo resources.",
        parameters=[
            OpenApiParameter(name='category', description='Filter by category name. Use "All" or omit for no category filter.', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='type', description='Filter by resource type.', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='search', description='Search term for title, description, or tags.', required=False, type=OpenApiTypes.STR)
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Create a new resource")
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Retrieve a resource by ID")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Update a resource by ID")
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Partially update a resource by ID")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Delete a resource by ID")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

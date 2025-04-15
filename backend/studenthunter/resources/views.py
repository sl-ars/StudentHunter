from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Resource
from .serializers import ResourceSerializer
from .permissions import IsAdminOrReadOnly

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
                Q(tags__contains=[search])
            )
        
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_demo=True)
        
        return queryset

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Resource.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def types(self, request):
        types = Resource.objects.values_list('type', flat=True).distinct()
        return Response(list(types))

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        resource = self.get_object()
        resource.downloads += 1
        resource.save()
        
        if resource.files.count() == 1:
            file = resource.files.first()
            return Response({
                'link': request.build_absolute_uri(file.file.url),
                'openInNewTab': file.open_in_new_tab
            })
        
        files = [{
            'id': str(file.id),
            'title': file.title,
            'url': request.build_absolute_uri(file.file.url),
            'type': file.file_type,
            'size': file.size,
            'openInNewTab': file.open_in_new_tab
        } for file in resource.files.all()]
        
        return Response({'files': files})

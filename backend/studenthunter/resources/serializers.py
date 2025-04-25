from rest_framework import serializers
from .models import Resource, ResourceFile

class ResourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceFile
        fields = ['id', 'title', 'file', 'file_type', 'size', 'open_in_new_tab']

class ResourceSerializer(serializers.ModelSerializer):
    files = ResourceFileSerializer(many=True, read_only=True)
    published_at = serializers.DateTimeField(format="%Y-%m-%d")
    estimated_time = serializers.CharField()
    is_demo = serializers.BooleanField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'type', 'content', 'author',
            'published_at', 'estimated_time', 'category', 'tags',
            'is_demo', 'views', 'downloads', 'files'
        ]
        read_only_fields = ['views', 'downloads'] 
from rest_framework import serializers
from resources.models import Resource, ResourceFile
from users.serializers import UserSerializer

class ResourceFileSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    # Explicitly define the resource field for clarity in Swagger and to ensure it's writable
    resource = serializers.PrimaryKeyRelatedField(
        queryset=Resource.objects.all(),
        help_text="The ID of the Resource this file belongs to."
    )

    class Meta:
        model = ResourceFile
        fields = ['id', 'resource', 'title', 'file', 'file_url', 'file_type', 'size', 'open_in_new_tab', 'uploaded_by', 'created_at']
        read_only_fields = ['uploaded_by', 'created_at', 'file_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

class ResourceSerializer(serializers.ModelSerializer):
    files = ResourceFileSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    published_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    estimated_time = serializers.CharField()
    is_demo = serializers.BooleanField()
    
    # Explicitly define the type field to add help_text for Swagger
    type_choices = Resource.RESOURCE_TYPES
    type_help_text = "Available types: " + ", ".join([choice[0] for choice in type_choices])
    type = serializers.ChoiceField(choices=type_choices, help_text=type_help_text)

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'type', 'content', 'author',
            'published_at', 'estimated_time', 'category', 'tags',
            'is_demo', 'views', 'downloads', 'files', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['views', 'downloads', 'author', 'created_by', 'published_at', 'created_at', 'updated_at'] 
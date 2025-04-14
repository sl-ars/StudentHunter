from rest_framework import serializers
from .models import Job
from users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company', read_only=True)
    applications_count = serializers.IntegerField(source='application_count', read_only=True)
    views_count = serializers.IntegerField(source='view_count', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'company_name', 'company_id', 'location',
            'type', 'salary', 'description', 'requirements', 'responsibilities',
            'benefits', 'posted_date', 'deadline', 'featured', 'logo', 'industry',
            'views_count', 'applications_count', 'status', 'is_active', 'created_by'
        ]
        read_only_fields = ['posted_date', 'view_count', 'application_count', 'created_by']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

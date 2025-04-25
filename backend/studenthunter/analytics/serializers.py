from rest_framework import serializers
from .models import JobView, JobApplicationMetrics, EmployerMetrics

class JobViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobView
        fields = ['id', 'job', 'viewer', 'ip_address', 'duration', 'viewed_at']
        read_only_fields = ['viewer', 'ip_address', 'viewed_at']

class JobApplicationMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplicationMetrics
        fields = ['id', 'job', 'application', 'source', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class EmployerMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerMetrics
        fields = ['id', 'employer', 'total_jobs', 'total_applications',
                 'total_interviews', 'total_hires', 'average_time_to_hire',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 
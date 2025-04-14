from rest_framework import serializers
from .models import JobView, JobApplicationMetrics, EmployerMetrics

class JobViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobView
        fields = ['id', 'job', 'viewer', 'ip_address', 'user_agent', 'created_at']
        read_only_fields = ['viewer', 'ip_address', 'user_agent', 'created_at']

class JobApplicationMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplicationMetrics
        fields = ['id', 'job', 'total_views', 'total_applications', 'views_last_7_days', 
                 'applications_last_7_days', 'average_application_time', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class EmployerMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerMetrics
        fields = ['id', 'employer', 'total_jobs_posted', 'total_applications_received',
                 'total_interviews_scheduled', 'total_hires', 'average_time_to_hire',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 
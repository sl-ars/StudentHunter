from rest_framework import serializers
from .models import Job, JobApplication
from users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'company_name', 'location', 'description',
            'requirements', 'responsibilities', 'salary_min', 'salary_max',
            'job_type', 'status', 'application_questions', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class JobDetailSerializer(JobSerializer):
    applications_count = serializers.SerializerMethodField()
    
    class Meta(JobSerializer.Meta):
        fields = JobSerializer.Meta.fields + ['applications_count']
    
    def get_applications_count(self, obj):
        return obj.applications.count()

class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.ReadOnlyField(source='applicant.name')
    job_title = serializers.ReadOnlyField(source='job.title')
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'applicant', 'applicant_name',
            'resume', 'cover_letter', 'answers', 'status', 'applied_at'
        ]
        read_only_fields = ['id', 'applied_at']

class JobApplicationDetailSerializer(JobApplicationSerializer):
    applicant = UserSerializer(read_only=True)
    
    class Meta(JobApplicationSerializer.Meta):
        fields = JobApplicationSerializer.Meta.fields + ['notes', 'updated_at']

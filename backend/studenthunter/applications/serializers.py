from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from users.serializers import UserSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)
    applicant = UserSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_id', 'applicant', 'status',
            'cover_letter', 'resume', 'created_at', 'updated_at',
            'interview_date', 'notes'
        ]
        read_only_fields = ['created_at', 'updated_at'] 
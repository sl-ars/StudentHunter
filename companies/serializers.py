from rest_framework import serializers
from .models import Company, CompanyBenefit
from jobs.serializers import JobSerializer

class CompanyBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyBenefit
        fields = ['id', 'title', 'description']

class CompanySerializer(serializers.ModelSerializer):
    benefits = CompanyBenefitSerializer(many=True, read_only=True)
    followers_count = serializers.IntegerField(read_only=True, required=False)
    jobs_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'logo', 'industry', 'location',
            'website', 'founded_year', 'size', 'is_verified', 'benefits',
            'created_at', 'updated_at', 'followers_count', 'jobs_count'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']

class CompanyDetailSerializer(CompanySerializer):
    jobs = JobSerializer(many=True, read_only=True)
    
    class Meta(CompanySerializer.Meta):
        fields = CompanySerializer.Meta.fields + ['jobs']

class CompanyStatsSerializer(serializers.Serializer):
    jobs_count = serializers.IntegerField()
    active_jobs_count = serializers.IntegerField()
    applications_count = serializers.IntegerField()
    followers_count = serializers.IntegerField()
    job_types = serializers.ListField(child=serializers.DictField())
    avg_min_salary = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    avg_max_salary = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)

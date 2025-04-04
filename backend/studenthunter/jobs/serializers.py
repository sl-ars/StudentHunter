from rest_framework import serializers
from .models import (
JobCategory, Job, JobSkill, JobApplication
)
from django.contrib.auth import get_user_model
from django.utils import timezone
from companies.serializers import CompanySerializer

User = get_user_model()


class JobCategorySerializer(serializers.ModelSerializer):
    """Serializer for job categories."""

    class Meta:
       model = JobCategory
       fields = ['id', 'name', 'slug', 'description']


class JobSkillSerializer(serializers.ModelSerializer):
    """Serializer for job skills."""

    class Meta:
       model = JobSkill
       fields = ['id', 'name']


class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
       model = Job
       fields = [
           'id', 'title', 'company_name', 'company_logo', 'category_name',
           'location', 'is_remote', 'salary_min', 'salary_max', 'job_type',
           'experience_level', 'created_at', 'application_deadline', 'status'
       ]


class JobDetailSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
       model = Job
       fields = [
           'id', 'title', 'description', 'requirements', 'responsibilities', 'benefits',
           'company', 'company_name', 'company_logo', 'category', 'category_name',
           'location', 'is_remote', 'salary_min', 'salary_max', 'job_type',
           'experience_level', 'skills_required', 'application_deadline', 'status',
           'created_at', 'updated_at'
       ]


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
       model = JobApplication
       fields = [
           'id', 'job', 'job_title', 'company_name', 'applicant',
           'cover_letter', 'resume', 'status', 'applied_at', 'updated_at'
       ]


class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
       model = JobApplication
       fields = ['job', 'cover_letter', 'resume']

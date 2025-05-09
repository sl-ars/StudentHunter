from rest_framework import serializers
from .models import Application
from jobs.models import Job
from django.contrib.auth import get_user_model

User = get_user_model()

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    applicant_name = serializers.SerializerMethodField(read_only=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    applicant_profile = serializers.SerializerMethodField(read_only=True)
    
    # Fields needed by frontend
    name = serializers.SerializerMethodField(read_only=True)
    position = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_company', 'applicant', 'applicant_name', 
                  'applicant_email', 'applicant_profile', 'status', 'cover_letter', 
                  'resume', 'created_at', 'updated_at', 'interview_date', 'notes',
                  'name', 'position', 'date']
        read_only_fields = ['applicant', 'applicant_name', 'applicant_email', 'applicant_profile', 
                           'job_title', 'job_company', 'created_at', 'updated_at',
                           'name', 'position', 'date']
    
    def get_applicant_name(self, obj):
        if hasattr(obj.applicant, 'name') and obj.applicant.name:
            return obj.applicant.name
        return f"{obj.applicant.first_name} {obj.applicant.last_name}"
    
    def get_name(self, obj):
        if hasattr(obj.applicant, 'name') and obj.applicant.name:
            return obj.applicant.name
        return f"{obj.applicant.first_name} {obj.applicant.last_name}"
    
    def get_position(self, obj):
        return obj.job.title
    
    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    
    def get_applicant_profile(self, obj):
        # Возвращает базовую информацию о профиле соискателя
        if hasattr(obj.applicant, 'profile'):
            profile = obj.applicant.profile
            return {
                'education': getattr(profile, 'education', None),
                'skills': getattr(profile, 'skills', None),
                'experience': getattr(profile, 'experience', None),
            }
        return None
    
    def validate(self, data):
        """Проверяет, что пользователь не подавал заявку на эту вакансию ранее."""
        user = self.context['request'].user
        job = data.get('job')
        
        # При создании новой заявки
        if self.instance is None:
            if Application.objects.filter(applicant=user, job=job).exists():
                raise serializers.ValidationError("You have already applied for this job.")
            
            # Проверяем, что вакансия активна
            if not job.is_active:
                raise serializers.ValidationError("Cannot apply to inactive job.")
        
        return data
    
    def create(self, validated_data):
        return super().create(validated_data)

class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Расширенный сериализатор для детального просмотра заявки."""
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    job_type = serializers.CharField(source='job.type', read_only=True)
    job_details = serializers.SerializerMethodField(read_only=True)
    applicant_name = serializers.SerializerMethodField(read_only=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    applicant_profile = serializers.SerializerMethodField(read_only=True)
    status_history = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_company', 'job_location', 'job_type',
                  'job_details', 'applicant', 'applicant_name', 'applicant_email', 
                  'applicant_profile', 'status', 'status_history', 'cover_letter', 
                  'resume', 'created_at', 'updated_at', 'interview_date', 'notes']
        read_only_fields = ['applicant', 'job', 'created_at', 'updated_at']
    
    def get_applicant_name(self, obj):
        return f"{obj.applicant.first_name} {obj.applicant.last_name}"
    
    def get_applicant_profile(self, obj):
        # Возвращает базовую информацию о профиле соискателя
        if hasattr(obj.applicant, 'profile'):
            profile = obj.applicant.profile
            return {
                'education': getattr(profile, 'education', None),
                'skills': getattr(profile, 'skills', None),
                'experience': getattr(profile, 'experience', None),
            }
        return None
    
    def get_job_details(self, obj):
        # Возвращает детали вакансии
        job = obj.job
        return {
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'type': job.type,
            'salary': job.salary,
            'description': job.description,
            'requirements': job.requirements,
        }
    
    def get_status_history(self, obj):
        # Заглушка для истории статусов, в реальном приложении можно реализовать
        # через отдельную модель ApplicationStatusHistory
        return [
            {
                'status': obj.status,
                'timestamp': obj.updated_at,
                'notes': obj.notes
            }
        ] 
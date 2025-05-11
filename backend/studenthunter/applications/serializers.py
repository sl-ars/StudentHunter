from rest_framework import serializers
from applications.models import Application
from jobs.models import Job
from django.contrib.auth import get_user_model

User = get_user_model()

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    applicant_name = serializers.SerializerMethodField(read_only=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    applicant_phone = serializers.CharField(source='applicant.phone', read_only=True, allow_blank=True, allow_null=True)
    applicant_profile = serializers.SerializerMethodField(read_only=True)
    
    # Fields needed by frontend
    name = serializers.SerializerMethodField(read_only=True)
    position = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_company', 'applicant', 'applicant_name', 
                  'applicant_email', 'applicant_phone', 'applicant_profile', 'status', 'cover_letter', 
                  'resume', 'created_at', 'updated_at', 'interview_date', 'notes',
                  'name', 'position', 'date']
        read_only_fields = ['applicant', 'applicant_name', 'applicant_email', 'applicant_phone', 'applicant_profile', 
                           'job_title', 'job_company', 'created_at', 'updated_at',
                           'name', 'position', 'date', 'status', 'interview_date']
    
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
        """Проверяет, что пользователь не подавал заявку на эту вакансию ранее,
           что вакансия активна, и что используется собственное резюме."""
        user = self.context['request'].user
        job = data.get('job')
        resume = data.get('resume') # This will be a Resume instance or None

        if self.instance is None:  # Only on create
            if Application.objects.filter(applicant=user, job=job).exists():
                raise serializers.ValidationError("You have already applied for this job.")

            if job and not job.is_active: # Assuming Job model has is_active field
                raise serializers.ValidationError("Cannot apply to inactive job.")

            if resume:
                # Assuming the Resume model has a 'user' field linking to the AUTH_USER_MODEL.
                # Adjust 'resume.user' if the field name is different (e.g., 'resume.applicant').
                # Corrected the check to use resume.student.user
                if not hasattr(resume, 'student') or not hasattr(resume.student, 'user') or resume.student.user != user:
                    raise serializers.ValidationError("You can only use your own resume.")
        
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
    applicant_phone = serializers.CharField(source='applicant.phone', read_only=True, allow_blank=True, allow_null=True)
    applicant_profile = serializers.SerializerMethodField(read_only=True)
    status_history = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_company', 'job_location', 'job_type',
                  'job_details', 'applicant', 'applicant_name', 'applicant_email', 'applicant_phone',
                  'applicant_profile', 'status', 'interview_status', 'status_history', 'cover_letter', 
                  'resume', 'created_at', 'updated_at', 'interview_date', 'notes']
        read_only_fields = ['applicant', 'job', 'created_at', 'updated_at', 
                           'job_title', 'job_company', 'job_location', 'job_type', 
                           'job_details', 'applicant_name', 'applicant_email', 'applicant_phone',
                           'applicant_profile', 'status_history']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.role == 'student':
                # Fields a student cannot edit directly on the application
                student_read_only_fields = ['status', 'interview_status', 'interview_date', 'notes']
                for field_name in student_read_only_fields:
                    if field_name in self.fields:
                        self.fields[field_name].read_only = True
            # Employers/Admins can edit these fields (status, notes, interview_date etc.)
            # No specific read_only changes needed here for them beyond what's in Meta

    def get_applicant_name(self, obj):
        if hasattr(obj.applicant, 'name') and obj.applicant.name:
            return obj.applicant.name
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
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
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
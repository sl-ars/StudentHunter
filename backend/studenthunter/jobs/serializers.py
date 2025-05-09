from rest_framework import serializers
from .models import Job
from companies.models import Company
from applications.models import Application
from django.db.models import Count
from users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    application_stats = serializers.SerializerMethodField(read_only=True)
    company_name = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    is_applied = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['created_by', 'view_count', 'application_count', 'company_name', 
                           'created_by_name', 'application_stats', 'is_applied']
    
    def get_application_stats(self, obj):
        """Получить статистику по заявкам на вакансию."""
        stats = {}
        if self.context and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated and (user.is_staff or (obj.created_by and obj.created_by.id == user.id)):
                applications = Application.objects.filter(job=obj)
                status_counts = applications.values('status').annotate(count=Count('status'))
                for status_count in status_counts:
                    stats[status_count['status']] = status_count['count']
        return stats
    
    def get_company_name(self, obj):
        """Получить название компании из объекта Company, если оно существует."""
        return obj.company
    
    def get_created_by_name(self, obj):
        """Получить имя создателя вакансии."""
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None
    
    def get_is_applied(self, obj):
        """Проверить, подал ли текущий пользователь заявку на эту вакансию."""
        if self.context and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated and user.role == 'student':
                return Application.objects.filter(job=obj, applicant=user).exists()
        return False
    
    def validate(self, data):
        """Пользовательская валидация для полей вакансии."""
        # Проверяем, что дедлайн позже текущей даты
        if 'deadline' in data and data['deadline'] and data['deadline'] < data.get('posted_date', 
                                                                                 self.instance.posted_date if self.instance else None):
            raise serializers.ValidationError("Deadline must be later than the posting date.")
        
        # Проверяем, что указаны требования для вакансии
        if 'requirements' in data and not data.get('requirements'):
            raise serializers.ValidationError("Job requirements must be specified.")
        
        return data
    
    def create(self, validated_data):
        """Переопределение create для добавления дополнительной логики."""
        # Если пользователь - работодатель, добавляем данные компании
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.role == 'employer' and not validated_data.get('company_id'):
                # Проверяем, есть ли у пользователя компания
                companies = Company.objects.filter(id=1)  # Заглушка
                if companies.exists():
                    validated_data['company'] = companies.first().name
                    validated_data['company_id'] = companies.first().id
        
        return super().create(validated_data)

class JobListSerializer(serializers.ModelSerializer):
    """Облегченный сериализатор для списка вакансий."""
    company_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'company_name', 'location', 'type', 'salary', 
                 'posted_date', 'deadline', 'is_active', 'featured', 'view_count', 
                 'application_count']
    
    def get_company_name(self, obj):
        # Just return the company field directly
        # to avoid trying to convert company_id to a numeric ID
        return obj.company

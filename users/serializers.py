from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, Resume, SavedJob, FollowedCompany

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'avatar']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        exclude = ['user']

class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'avatar', 'profile']
        read_only_fields = ['id']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data and hasattr(instance, 'profile'):
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()
        
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'name', 'role', 'password', 'password2']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'name', 'file', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']

class SavedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'saved_at']
        read_only_fields = ['id', 'saved_at']

class FollowedCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowedCompany
        fields = ['id', 'company', 'followed_at']
        read_only_fields = ['id', 'followed_at']

class UserStatsSerializer(serializers.Serializer):
    applications_count = serializers.IntegerField()
    saved_jobs_count = serializers.IntegerField()
    followed_companies_count = serializers.IntegerField()
    application_statuses = serializers.ListField(child=serializers.DictField())

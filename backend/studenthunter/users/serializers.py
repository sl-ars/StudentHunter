from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, Education, Experience, StudentProfile, EmployerProfile, CampusProfile
from rest_framework_simplejwt.serializers import TokenVerifySerializer as BaseTokenVerifySerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer as BaseTokenRefreshSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'role', 'avatar', 'university', 'company', 'created_at', 'last_login', 'is_active']


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'name', 'password', 'password2', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        user = CustomUser.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data



class TokenVerifySerializer(BaseTokenVerifySerializer):
    def validate(self, attrs):
        super().validate(attrs)
        return {
            "isValid": True  # user будет добавлен в view
        }



class TokenRefreshSerializer(BaseTokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"]
        }


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ["student"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["student"]


class StudentProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)

    class Meta:
        model = StudentProfile
        fields = ["bio", "skills", "resume", "education", "experience"]

    def update(self, instance, validated_data):
        education_data = validated_data.pop("education", [])
        experience_data = validated_data.pop("experience", [])

        # Обновление простых полей
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Обновление education
        instance.education.all().delete()
        for edu in education_data:
            Education.objects.create(student=instance, **edu)

        # Обновление experience
        instance.experience.all().delete()
        for exp in experience_data:
            Experience.objects.create(student=instance, **exp)

        return instance


class EmployerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerProfile
        fields = "__all__"
        read_only_fields = ["user"]


class CampusProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusProfile
        fields = "__all__"
        read_only_fields = ["user"]
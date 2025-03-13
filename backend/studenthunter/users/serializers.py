from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenVerifySerializer as BaseTokenVerifySerializer,
    TokenRefreshSerializer as BaseTokenRefreshSerializer
)
from .models import (
    CustomUser,
    Education,
    Experience,
    StudentProfile,
    EmployerProfile,
    CampusProfile
)

# === USER SERIALIZATION ===

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'name', 'role', 'avatar',
            'phone', 'location', 'university', 'company',
            'created_at', 'last_login', 'is_active'
        ]


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
            "isValid": True
        }


class TokenRefreshSerializer(BaseTokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"]
        }

# === PROFILE FIELD SERIALIZERS ===

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


# === BASE PROFILE SERIALIZER with user fields merged ===

class BaseProfileSerializer(serializers.ModelSerializer):
    #
    name = serializers.CharField(source="user.name", required=False)
    email = serializers.EmailField(source="user.email", required=False)
    avatar = serializers.ImageField(source="user.avatar", required=False)
    phone = serializers.CharField(source="user.phone", required=False)
    location = serializers.CharField(source="user.location", required=False)
    university = serializers.CharField(source="user.university", required=False)
    company = serializers.CharField(source="user.company", required=False)

    # readonly
    id = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    def get_id(self, obj): return obj.user.id
    def get_role(self, obj): return obj.user.role
    def get_created_at(self, obj): return obj.user.created_at
    def get_last_login(self, obj): return obj.user.last_login
    def get_is_active(self, obj): return obj.user.is_active

    def update_user_fields(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()


# === FULL PROFILE SERIALIZERS ===

class StudentProfileSerializer(BaseProfileSerializer):
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university", "company", "created_at", "last_login", "is_active",
            "bio", "skills", "resume", "education", "experience"
        ]

    def update(self, instance, validated_data):
        self.update_user_fields(instance, validated_data)

        education_data = validated_data.pop("education", [])
        experience_data = validated_data.pop("experience", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        instance.education.all().delete()
        for edu in education_data:
            Education.objects.create(student=instance, **edu)

        instance.experience.all().delete()
        for exp in experience_data:
            Experience.objects.create(student=instance, **exp)

        return instance


class EmployerProfileSerializer(BaseProfileSerializer):
    class Meta:
        model = EmployerProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university", "company", "created_at", "last_login", "is_active",
            "company_name", "industry", "website", "description"
        ]

    def update(self, instance, validated_data):
        self.update_user_fields(instance, validated_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance



class CampusProfileSerializer(BaseProfileSerializer):
    class Meta:
        model = CampusProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university", "company", "created_at", "last_login", "is_active",
            "university", "department", "position"
        ]

    def update(self, instance, validated_data):
        self.update_user_fields(instance, validated_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


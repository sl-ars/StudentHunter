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
    CampusProfile,
    Resume
)
from companies.models import Company  # Import Company from the correct app

# === USER SERIALIZATION ===

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'name', 'role', 'avatar',
            'phone', 'location', 'university', 'company',
            'company_id', 'created_at', 'last_login', 'is_active'
        ]

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None


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
        data = super().validate(attrs)
        try:
            # Get user from token
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(attrs["token"])
            user = CustomUser.objects.get(id=token.payload["user_id"])
            return {
                "status": "success",
                "data": {
                    "isValid": True,
                    "user": UserSerializer(user).data
                },
                "message": "Token is valid"
            }
        except (CustomUser.DoesNotExist, KeyError):
            return {
                "status": "error",
                "data": {
                    "isValid": False,
                    "user": None
                },
                "message": "Invalid token"
            }


class TokenRefreshSerializer(BaseTokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"]
        }

# === PROFILE FIELD SERIALIZERS ===

class EducationSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=True
    )
    end_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=False,
        allow_null=True
    )

    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ["student"]

    def to_internal_value(self, data):
        """Convert YYYY-MM to YYYY-MM-DD before validation"""
        if isinstance(data, dict):
            if 'start_date' in data and isinstance(data['start_date'], str):
                if len(data['start_date']) == 7:  # YYYY-MM format
                    data['start_date'] = f"{data['start_date']}-01"
            
            if 'end_date' in data and isinstance(data['end_date'], str):
                if len(data['end_date']) == 7:  # YYYY-MM format
                    data['end_date'] = f"{data['end_date']}-01"
        
        return super().to_internal_value(data)

    def to_representation(self, instance):
        """Convert YYYY-MM-DD back to YYYY-MM for frontend"""
        ret = super().to_representation(instance)
        
        if ret.get('start_date'):
            ret['start_date'] = ret['start_date'][:7]  # Keep only YYYY-MM
            
        if ret.get('end_date'):
            ret['end_date'] = ret['end_date'][:7]  # Keep only YYYY-MM
            
        return ret


class ExperienceSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=True
    )
    end_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=False,
        allow_null=True
    )

    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["student"]

    def to_internal_value(self, data):
        """Convert YYYY-MM to YYYY-MM-DD before validation"""
        if isinstance(data, dict):
            if 'start_date' in data and isinstance(data['start_date'], str):
                if len(data['start_date']) == 7:  # YYYY-MM format
                    data['start_date'] = f"{data['start_date']}-01"
            
            if 'end_date' in data and isinstance(data['end_date'], str):
                if len(data['end_date']) == 7:  # YYYY-MM format
                    data['end_date'] = f"{data['end_date']}-01"
        
        return super().to_internal_value(data)

    def to_representation(self, instance):
        """Convert YYYY-MM-DD back to YYYY-MM for frontend"""
        ret = super().to_representation(instance)
        
        if ret.get('start_date'):
            ret['start_date'] = ret['start_date'][:7]  # Keep only YYYY-MM
            
        if ret.get('end_date'):
            ret['end_date'] = ret['end_date'][:7]  # Keep only YYYY-MM
            
        return ret


# === BASE PROFILE SERIALIZER with user fields merged ===

class BaseProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(source="user.email", required=False, allow_blank=True, allow_null=True)
    avatar = serializers.ImageField(source="user.avatar", required=False, allow_null=True)
    phone = serializers.CharField(source="user.phone", required=False, allow_blank=True, allow_null=True)
    location = serializers.CharField(source="user.location", required=False, allow_blank=True, allow_null=True)
    university = serializers.CharField(source="user.university", required=False, allow_blank=True, allow_null=True)
    company = serializers.CharField(source="user.company", required=False, allow_blank=True, allow_null=True)

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

    def validate(self, data):
        # Remove avatar from validation if it's already been handled
        if 'user' in data and 'avatar' in data['user']:
            del data['user']['avatar']
        return data

    def update_user_fields(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            if value is not None:  # Only update if value is provided
                setattr(instance.user, attr, value)
        instance.user.save()


# === FULL PROFILE SERIALIZERS ===

class StudentProfileSerializer(BaseProfileSerializer):
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)
    skills = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        default=list
    )
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university", "company", "created_at", "last_login", "is_active",
            "bio", "skills", "resume", "education", "experience"
        ]

    def to_representation(self, instance):
        """Ensure skills is always a list in the response"""
        ret = super().to_representation(instance)
        if ret.get('skills') is None:
            ret['skills'] = []
        return ret

    def to_internal_value(self, data):
        """Ensure skills is properly validated and converted"""
        ret = super().to_internal_value(data)
        if 'skills' in ret and ret['skills'] is None:
            ret['skills'] = []
        return ret

    def update(self, instance, validated_data):
        self.update_user_fields(instance, validated_data)

        # Only update education if provided
        if 'education' in validated_data:
            education_data = validated_data.pop("education")
            instance.education.all().delete()
            for edu in education_data:
                Education.objects.create(student=instance, **edu)

        # Only update experience if provided
        if 'experience' in validated_data:
            experience_data = validated_data.pop("experience")
            instance.experience.all().delete()
            for exp in experience_data:
                Experience.objects.create(student=instance, **exp)

        # Update remaining fields
        for attr, value in validated_data.items():
            if value is not None:  # Only update if value is provided
                setattr(instance, attr, value)
        instance.save()

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

        # Get or create Company model
        company_data = {
            'name': validated_data.get('company_name', instance.company_name),
            'industry': validated_data.get('industry', instance.industry),
            'website': validated_data.get('website', instance.website),
            'description': validated_data.get('description', instance.description),
            'location': validated_data.get('location', instance.user.location) or '',
        }
        
        # Try to get existing company by ID first
        company = None
        if instance.user.company_id:
            try:
                company = Company.objects.get(id=instance.user.company_id)
                # Update company data
                for key, value in company_data.items():
                    setattr(company, key, value)
                company.save()
            except Company.DoesNotExist:
                pass
        
        # If no existing company, create a new one
        if not company:
            company = Company.objects.create(**company_data)
        
        # Update user's company fields
        instance.user.company = company.name
        instance.user.company_id = company.id
        instance.user.save()

        # Update profile fields
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


class ResumeSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'name', 'url', 'created_at', 'file']
        read_only_fields = ['id', 'url', 'created_at', 'name']

    def get_url(self, obj):
        return obj.get_resume_url()

    def validate_file(self, value):
        if not value:
            raise serializers.ValidationError("No file was submitted.")
        
        # Check file size (5MB max)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 5MB")
        
        # Check file type
        valid_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        if value.content_type not in valid_types:
            raise serializers.ValidationError(
                "File type not supported. Please upload a PDF, DOC, or DOCX file."
            )
        
        return value


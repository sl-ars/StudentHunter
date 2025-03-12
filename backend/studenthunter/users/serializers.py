from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
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
            "detail": "Token is valid"
        }



class TokenRefreshSerializer(BaseTokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"]
        }

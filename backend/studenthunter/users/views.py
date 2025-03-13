from functools import wraps

from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import CampusProfile, EmployerProfile, StudentProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    TokenRefreshSerializer, TokenVerifySerializer, CampusProfileSerializer, EmployerProfileSerializer,
    StudentProfileSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response({
                "status": "success",
                "data": serializer.validated_data,
                "message": "Login successful"
            }, status=status.HTTP_200_OK)
        except (AuthenticationFailed, InvalidToken) as e:
            return Response({
                "status": "error",
                "data": {},
                "message": str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)





class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            "status": "success",
            "data": serializer.validated_data,
            "message": "Token refreshed"
        }, status=status.HTTP_200_OK)


class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = TokenVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = request.data.get("token")
        user = None

        try:
            validated_token = UntypedToken(token)
            user_obj, _ = JWTAuthentication().get_user(validated_token), validated_token
            user = UserSerializer(user_obj).data
        except Exception:
            user = None

        return Response({
            "status": "success",
            "data": {
                "isValid": True,
                "user": user
            },
            "message": "Token is valid"
        }, status=status.HTTP_200_OK)


class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        creator = request.user
        role_to_create = request.data.get("role")

        if not role_to_create:
            return Response({
                "status": "error",
                "data": {},
                "message": "Missing role field"
            }, status=status.HTTP_400_BAD_REQUEST)

        if creator.role == "admin":
            allowed = True
        elif creator.role == "campus" and role_to_create == "student":
            allowed = True
        else:
            allowed = False

        if not allowed:
            return Response({
                "status": "error",
                "data": {},
                "message": "You do not have permission to register this type of user"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "status": "success",
                "data": UserSerializer(user).data,
                "message": "User registered successfully"
            }, status=status.HTTP_201_CREATED)

        return Response({
            "status": "error",
            "data": {},
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)





class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({
            "status": "success",
            "data": {},
            "message": "Logged out (client-side only)"
        })


def require_role(expected_role: str):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            if request.user.role != expected_role:
                return Response({
                    "status": "error",
                    "message": f"Access denied: '{expected_role}' role required.",
                    "data": {}
                }, status=status.HTTP_403_FORBIDDEN)
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator
class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @require_role("student")
    @swagger_auto_schema(method='get', responses={200: StudentProfileSerializer})
    @swagger_auto_schema(method='patch', request_body=StudentProfileSerializer, responses={200: StudentProfileSerializer})
    @action(detail=False, methods=['get', 'patch'], url_path='profile/student')
    def student(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        if request.method == "PATCH":
            serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "data": serializer.data,
                    "message": "Student profile updated"
                })
            return Response({
                "status": "error",
                "data": {},
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = StudentProfileSerializer(profile)
        return Response({
            "status": "success",
            "data": serializer.data,
            "message": "Student profile retrieved"
        })

    @require_role("employer")
    @swagger_auto_schema(method='get', responses={200: EmployerProfileSerializer})
    @swagger_auto_schema(method='patch', request_body=EmployerProfileSerializer, responses={200: EmployerProfileSerializer})
    @action(detail=False, methods=['get', 'patch'], url_path='profile/employer')
    def employer(self, request):
        profile, _ = EmployerProfile.objects.get_or_create(user=request.user)

        if request.method == "PATCH":
            serializer = EmployerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "data": serializer.data,
                    "message": "Employer profile updated"
                })
            return Response({
                "status": "error",
                "data": {},
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = EmployerProfileSerializer(profile)
        return Response({
            "status": "success",
            "data": serializer.data,
            "message": "Employer profile retrieved"
        })

    @require_role("campus")
    @swagger_auto_schema(method='get', responses={200: CampusProfileSerializer})
    @swagger_auto_schema(method='patch', request_body=CampusProfileSerializer, responses={200: CampusProfileSerializer})
    @action(detail=False, methods=['get', 'patch'], url_path='profile/campus')
    def campus(self, request):
        profile, _ = CampusProfile.objects.get_or_create(user=request.user)

        if request.method == "PATCH":
            serializer = CampusProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "data": serializer.data,
                    "message": "Campus profile updated"
                })
            return Response({
                "status": "error",
                "data": {},
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = CampusProfileSerializer(profile)
        return Response({
            "status": "success",
            "data": serializer.data,
            "message": "Campus profile retrieved"
        })

    @require_role("admin")
    @swagger_auto_schema(method='get', responses={200: UserSerializer})
    @swagger_auto_schema(method='patch', request_body=UserSerializer, responses={200: UserSerializer})
    @action(detail=False, methods=['get', 'patch'], url_path='profile/admin')
    def admin(self, request):
        user = request.user

        if request.method == "PATCH":
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "data": serializer.data,
                    "message": "Admin profile updated"
                })
            return Response({
                "status": "error",
                "data": {},
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user)
        return Response({
            "status": "success",
            "data": serializer.data,
            "message": "Admin profile retrieved"
        })
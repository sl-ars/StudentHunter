from rest_framework import status, viewsets, permissions
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


class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_profile_and_serializer(self, user):
        match user.role:
            case "student":
                profile, _ = StudentProfile.objects.get_or_create(user=user)
                serializer_class = StudentProfileSerializer
            case "employer":
                profile, _ = EmployerProfile.objects.get_or_create(user=user)
                serializer_class = EmployerProfileSerializer
            case "campus":
                profile, _ = CampusProfile.objects.get_or_create(user=user)
                serializer_class = CampusProfileSerializer
            case _:
                return None, None
        return profile, serializer_class

    def retrieve(self, request):
        profile, serializer_class = self._get_profile_and_serializer(request.user)
        if not profile:
            return Response({
                "status": "error",
                "data": {},
                "message": "No profile for this user"
            }, status=status.HTTP_404_NOT_FOUND)

        data = serializer_class(profile).data
        return Response({
            "status": "success",
            "data": data,
            "message": "Profile retrieved"
        })

    def update(self, request):
        profile, serializer_class = self._get_profile_and_serializer(request.user)
        if not profile:
            return Response({
                "status": "error",
                "data": {},
                "message": "No profile for this user"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = serializer_class(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "data": serializer.data,
                "message": "Profile updated"
            })

        return Response({
            "status": "error",
            "data": {},
            "message": "Validation error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

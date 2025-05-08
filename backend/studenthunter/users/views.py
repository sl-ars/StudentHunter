from functools import wraps

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
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
from rest_framework.parsers import MultiPartParser, FormParser

from .models import CampusProfile, EmployerProfile, StudentProfile, Resume
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    TokenRefreshSerializer, TokenVerifySerializer, CampusProfileSerializer, EmployerProfileSerializer,
    StudentProfileSerializer, ResumeSerializer
)


@extend_schema(tags=['users'])
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


@extend_schema(tags=['users'])
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


@extend_schema(tags=['users'])
class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = TokenVerifySerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
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


@extend_schema(tags=['users'])
class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
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


@extend_schema(tags=['users'])
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

@extend_schema(tags=['users'])
class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @require_role("student")
    @extend_schema(
        methods=['GET'],
        description="Retrieve student profile.",
        responses={200: StudentProfileSerializer}
    )
    @extend_schema(
        methods=['PATCH'],
        description="Update student profile.",
        request=StudentProfileSerializer,
        responses={200: StudentProfileSerializer}
    )
    @action(detail=False, methods=['get', 'patch'], url_path='profile/student')
    def student(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)

        if request.method == "PATCH":
            # Handle avatar upload separately if it exists
            if 'avatar' in request.FILES:
                request.user.avatar = request.FILES['avatar']
                request.user.save()
                # Remove avatar from request data to avoid double processing
                request.data._mutable = True
                if 'avatar' in request.data:
                    del request.data['avatar']
                request.data._mutable = False

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
    @extend_schema(
        methods=['GET'],
        description="Retrieve employer profile.",
        responses={200: EmployerProfileSerializer}
    )
    @extend_schema(
        methods=['PATCH'],
        description="Update employer profile.",
        request=EmployerProfileSerializer,
        responses={200: EmployerProfileSerializer}
    )
    @action(detail=False, methods=['get', 'patch'], url_path='profile/employer')
    def employer(self, request):
        profile, _ = EmployerProfile.objects.get_or_create(user=request.user)

        if request.method == "PATCH":
            # Handle avatar upload separately if it exists
            if 'avatar' in request.FILES:
                request.user.avatar = request.FILES['avatar']
                request.user.save()
                # Remove avatar from request data to avoid double processing
                request.data._mutable = True
                if 'avatar' in request.data:
                    del request.data['avatar']
                request.data._mutable = False

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
    @extend_schema(
        methods=['GET'],
        description="Retrieve campus profile.",
        responses={200: CampusProfileSerializer}
    )
    @extend_schema(
        methods=['PATCH'],
        description="Update campus profile.",
        request=CampusProfileSerializer,
        responses={200: CampusProfileSerializer}
    )
    @action(detail=False, methods=['get', 'patch'], url_path='profile/campus')
    def campus(self, request):
        profile, _ = CampusProfile.objects.get_or_create(user=request.user)

        if request.method == "PATCH":
            # Handle avatar upload separately if it exists
            if 'avatar' in request.FILES:
                request.user.avatar = request.FILES['avatar']
                request.user.save()
                # Remove avatar from request data to avoid double processing
                request.data._mutable = True
                if 'avatar' in request.data:
                    del request.data['avatar']
                request.data._mutable = False

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
    @extend_schema(
        methods=['GET'],
        description="Retrieve admin profile.",
        responses={200: UserSerializer}
    )
    @extend_schema(
        methods=['PATCH'],
        description="Update admin profile.",
        request=UserSerializer,
        responses={200: UserSerializer}
    )
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

@extend_schema(tags=['users'])
class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        student_profile = self.request.user.student_profile
        serializer.save(student=student_profile)

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsAuthenticated()]
        return super().get_permissions()

    @extend_schema(
        operation_id='list_resumes_for_student',
        summary="List resumes",
        description="List all resumes for the authenticated student",
        responses={
            200: ResumeSerializer(many=True)
        }
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "data": serializer.data,
            "message": "Resumes retrieved successfully"
        })

    @extend_schema(
        operation_id='upload_resume',
        summary="Upload resume",
        description="Upload a new resume",
        request={
            'multipart/form-data': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'file': {'type': 'string', 'format': 'binary'}
                    }
                }
            }
        },
        responses={
            201: ResumeSerializer,
            400: {'description': 'Validation error'}
        }
    )
    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({
                "status": "error",
                "data": {},
                "message": "No file provided",
                "errors": {"file": ["This field is required."]}
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={'file': request.FILES['file']})
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                "status": "success",
                "data": serializer.data,
                "message": "Resume uploaded successfully"
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "data": {},
            "message": "Validation error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        operation_id='delete_resume',
        summary="Delete resume",
        description="Delete a resume",
        responses={
            200: {'description': 'Resume deleted successfully'},
        }
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "status": "success",
            "data": {},
            "message": "Resume deleted successfully"
        }, status=status.HTTP_200_OK)

    @extend_schema(
        operation_id='get_resume_download_url',
        summary="Get resume URL",
        description="Get a signed URL for downloading a resume",
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'url': {'type': 'string', 'format': 'url'}
                        }
                    },
                    'message': {'type': 'string'}
                }
            }
        }
    )
    @action(detail=True, methods=['get'])
    def get_url(self, request, pk=None):
        resume = self.get_object()
        url = resume.get_resume_url()
        if url:
            return Response({
                "status": "success",
                "data": {"url": url},
                "message": "Signed URL generated successfully"
            })
        return Response({
            "status": "error",
            "data": {},
            "message": "Failed to generate signed URL"
        }, status=status.HTTP_400_BAD_REQUEST)
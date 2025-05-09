import logging
from functools import wraps

from drf_spectacular.utils import (
    extend_schema, OpenApiParameter, OpenApiTypes,
    PolymorphicProxySerializer, extend_schema_view
)
from rest_framework import status, viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from django.db import transaction
from core.utils import ok, fail
from .models import CampusProfile, EmployerProfile, StudentProfile, Resume
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    TokenRefreshSerializer, TokenVerifySerializer, CampusProfileSerializer, EmployerProfileSerializer,
    StudentProfileSerializer, ResumeSerializer, PublicProfileSerializer, VerifyTokenSerializer, RefreshSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)

@extend_schema(
    request=CustomTokenObtainPairSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
    },
    tags=["authentication"],
    summary="Obtain JWT pair (access + refresh)",
    description="Authenticates the user and returns a JWT access and refresh token pair if credentials are valid."
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return ok(serializer.validated_data, message="Login successful")
        except (AuthenticationFailed, InvalidToken) as e:
            return fail(message=str(e), code=401)



@extend_schema(
    request=VerifyTokenSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
    },
    tags=["authentication"],
    summary="Verify JWT token",
    description="Validates access token and returns user data if valid."
)
class CustomVerifyView(APIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyTokenSerializer

    def post(self, request):
        ser = self.serializer_class(data=request.data)
        if not ser.is_valid():
            return fail("Invalid token", code=401)
        payload = ser.validated_data
        if not payload.get("is_valid"):
            return ok({"is_valid": False}, message="Token invalid")
        return ok(payload, message="Token valid")

@extend_schema(
    request=RefreshSerializer,
    responses={
        200: {
            "type": "object",
            "properties": {
                "access": {"type": "string"},
                "refresh": {"type": "string"},
            }
        },
        401: OpenApiTypes.OBJECT,
    },
    tags=["authentication"],
    summary="Refresh JWT access token",
    description="Refreshes an access token using a valid refresh token."
)
class CustomRefreshView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RefreshSerializer

    def post(self, request):
        raw = request.data.get("refresh")
        if not raw:
            return fail("Missing 'refresh' token")

        try:
            old_refresh = RefreshToken(raw)
        except TokenError:
            return fail("Invalid refresh token", code=401)

        try:
            user = User.objects.get(id=old_refresh["user_id"])
        except User.DoesNotExist:
            return fail("User not found", code=401)

        new_access = str(old_refresh.access_token)

        if api_settings.ROTATE_REFRESH_TOKENS:
            try:
                with transaction.atomic():
                    new_refresh = RefreshToken.for_user(user)

                    if api_settings.BLACKLIST_AFTER_ROTATION:
                        try:
                            old_refresh.blacklist()
                        except AttributeError:
                            logger.warning("simplejwt blacklist app not installed")

            except Exception as e:
                return fail("Failed to rotate token", details=str(e), code=500)

            return ok({"access": str(new_access), "refresh": str(new_refresh)}, message="Token refreshed")

        return ok({"access": str(new_access)}, message="Token refreshed")


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

@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve a public user profile",
        description="Get public profile information for a user by their ID. Does not require authentication. Admin profiles and profiles of roles not explicitly listed (student, employer, campus) are not publicly accessible.",
        parameters=[
            OpenApiParameter("pk", OpenApiTypes.INT, OpenApiParameter.PATH, description="A unique integer identifying the user.")
        ],
        responses={
            200: PublicProfileSerializer,
            403: {"description": "Forbidden: Admin profiles are not public, or the profile type is not publicly viewable."},
            404: {"description": "User not found"}
        }
    )
)
@extend_schema(tags=['users'])
class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    lookup_field = 'pk'
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()

    def _get_profile_info(self, user):
        if user.role == "student":
            profile_model = StudentProfile
            profile_serializer_class = StudentProfileSerializer
        elif user.role == "employer":
            profile_model = EmployerProfile
            profile_serializer_class = EmployerProfileSerializer
        elif user.role == "campus":
            profile_model = CampusProfile
            profile_serializer_class = CampusProfileSerializer
        elif user.role == "admin":
            return user, UserSerializer
        else:
            return None, None

        profile_instance, _ = profile_model.objects.get_or_create(user=user)
        return profile_instance, profile_serializer_class

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        user = request.user
        target_instance, profile_serializer_class = self._get_profile_info(user)

        if not profile_serializer_class:
            return Response({
                "status": "error",
                "message": "Could not determine profile type for user."
            }, status=status.HTTP_400_BAD_REQUEST)

        if request.method == "GET":
            serializer = profile_serializer_class(target_instance, context={'request': request})
            return Response({
                "status": "success",
                "data": serializer.data,
                "message": f"{user.role.capitalize()} profile retrieved successfully"
            })

        elif request.method == "PATCH":
            data_for_serializer = request.data.copy()

            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']
                user.save(update_fields=['avatar'])
                if user.role != "admin" and 'avatar' in data_for_serializer:
                    del data_for_serializer['avatar']

            serializer = profile_serializer_class(
                target_instance,
                data=data_for_serializer,
                partial=True,
                context={'request': request}
            )

            if serializer.is_valid():
                serializer.save()
                fresh_serializer = profile_serializer_class(target_instance, context={'request': request})
                return Response({
                    "status": "success",
                    "data": fresh_serializer.data,
                    "message": f"{user.role.capitalize()} profile updated successfully"
                })
            return Response({
                "status": "error",
                "data": {},
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({
                "status": "error",
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

        if user.role == "admin":
            return Response({
                "status": "error",
                "message": "Admin profiles are not publicly viewable"
            }, status=status.HTTP_403_FORBIDDEN)

        if user.role not in ["student", "employer", "campus"]:
            return Response({
                "status": "error",
                "message": f"Profiles of type '{user.role}' are not publicly viewable"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = PublicProfileSerializer(user, context={'request': request})
        return Response({
            "status": "success",
            "data": serializer.data,
            "message": "Public profile retrieved successfully"
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
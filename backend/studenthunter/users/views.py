from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
TokenRefreshSerializer, TokenVerifySerializer
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

        return Response({
            "status": "success",
            "data": serializer.validated_data,
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



class MeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        return Response({
            "status": "success",
            "data": UserSerializer(request.user).data,
            "message": "Current user"
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({
            "status": "success",
            "data": {},
            "message": "Logged out (client-side only)"
        })

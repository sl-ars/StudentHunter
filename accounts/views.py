from django.contrib.auth import authenticate
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

# User ViewSet for registration and profile management
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# Register User API
class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)

# Login API (JWT)
class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(request, email=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            })
        return Response({"error": "Invalid credentials"}, status=400)
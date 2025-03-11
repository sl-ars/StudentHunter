from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RegisterViewSet, LoginViewSet
from rest_framework_simplejwt.views import TokenRefreshView

# Create router
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'register', RegisterViewSet, basename='register')
router.register(r'login', LoginViewSet, basename='login')

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Include router URLs
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
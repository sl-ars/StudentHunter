from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    RegisterView, UserDetailView, CustomTokenObtainPairView, LogoutView,
    ResumeViewSet, SavedJobViewSet, FollowedCompanyViewSet, UserStatsView
)

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'saved-jobs', SavedJobViewSet, basename='saved-job')
router.register(r'followed-companies', FollowedCompanyViewSet, basename='followed-company')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('me/stats/', UserStatsView.as_view(), name='user-stats'),
    path('', include(router.urls)),
]

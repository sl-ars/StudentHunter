from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet

router = DefaultRouter()
router.register('', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
    path('employer/jobs/', JobViewSet.as_view({'get': 'employer_jobs'}), name='employer-jobs'),
    path('employer/jobs/<int:pk>/', JobViewSet.as_view({'put': 'update', 'patch': 'update'}), name='employer-job-update'),
]

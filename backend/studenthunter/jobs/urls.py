from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs.views import JobViewSet

router = DefaultRouter()
router.register('', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
    # Удаленные пути:
    # path('employer/jobs/', JobViewSet.as_view({'get': 'employer_jobs'}), name='employer-jobs'),
    # path('employer/jobs/<int:pk>/', JobViewSet.as_view({'put': 'update', 'patch': 'update'}), name='employer-job-update'),
    # path('featured/', JobViewSet.as_view({'get': 'featured'}), name='featured-jobs'),
    # path('recent/', JobViewSet.as_view({'get': 'recent'}), name='recent-jobs'),
    # path('popular/', JobViewSet.as_view({'get': 'popular'}), name='popular-jobs'),
]

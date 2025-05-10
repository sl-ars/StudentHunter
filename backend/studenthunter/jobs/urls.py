from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs.views import JobViewSet

router = DefaultRouter()
router.register('', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
]

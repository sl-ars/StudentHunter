from django.urls import path, include
from rest_framework.routers import DefaultRouter
from resources.views import ResourceViewSet

router = DefaultRouter()
router.register(r'', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 
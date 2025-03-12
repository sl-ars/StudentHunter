from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import RegisterViewSet, MeViewSet

router = DefaultRouter()
router.register(r"register", RegisterViewSet, basename="register")
router.register(r"me", MeViewSet, basename="me")

urlpatterns = [
    path("", include(router.urls)),
]

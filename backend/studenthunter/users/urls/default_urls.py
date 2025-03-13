from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import RegisterViewSet, ProfileViewSet

router = DefaultRouter()



router.register(r"register", RegisterViewSet, basename="register")
router.register("", ProfileViewSet, basename="profile-router")

urlpatterns = [
    path("", include(router.urls)),
]

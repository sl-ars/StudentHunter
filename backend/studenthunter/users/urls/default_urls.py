from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import RegisterViewSet, ProfileViewSet

router = DefaultRouter()



router.register(r"register", RegisterViewSet, basename="register")


profile_view = ProfileViewSet.as_view({
    "get": "retrieve",
    "put": "update",
})

urlpatterns = [
    path("", include(router.urls)),
    path("profile/", profile_view, name="profile"),
]

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

schema_view = get_schema_view(
    openapi.Info(
        title="StudentHunter API",
        default_version="v1",
        description="API for StudentHunter Platform",
    ),
    public=True,
    permission_classes=(AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),

    # JWT & logout
    path("api/auth/", include("users.urls.auth")),

    # user views (register, me)
    path("api/user/", include("users.urls.default_urls")),
    path('api/company/', include('companies.urls')),
    path('api/job/', include('jobs.urls')),
    path('api/resource/', include('resources.urls')),
    path('api/application/', include('applications.urls')),
    path('api/analytics/', include('analytics.urls')),

    # Swagger / Redoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

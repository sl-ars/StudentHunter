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

    # JWT & logout
    path("api/auth/", include("users.urls.auth")),

    # user views (register, me)
    path("api/user/", include("users.urls.default_urls")),
    path('api/', include('companies.urls')),
    path('api/', include('jobs.urls')),
    path('api/', include('resources.urls')),
    path('api/', include('applications.urls')),
    path('api/', include('analytics.urls')),

    # Swagger / Redoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

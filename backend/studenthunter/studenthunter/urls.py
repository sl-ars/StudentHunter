from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.permissions import AllowAny
from django.conf import settings
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
    path('api/admin/', include('admin_api.urls')),
]

# Handle media files in development
if settings.DEBUG:
    urlpatterns += [
        # DRF Spectacular - Schema, Swagger UI, Redoc UI
        path('api/schema/', SpectacularAPIView.as_view(permission_classes=[AllowAny]), name='schema'),
        path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[AllowAny]),
             name='swagger-ui'),
        path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[AllowAny]),
             name='redoc'),
    ]


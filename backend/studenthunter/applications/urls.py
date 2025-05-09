from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    # Дополнительные пути для специальных действий
    path('by-job/', views.ApplicationViewSet.as_view({'get': 'by_job'}), name='applications-by-job'),
    path('my/', views.ApplicationViewSet.as_view({'get': 'my_applications'}), name='my-applications'),
    path('employer/', views.ApplicationViewSet.as_view({'get': 'for_my_jobs'}), name='employer-applications'),
    path('stats/', views.ApplicationViewSet.as_view({'get': 'stats'}), name='application-stats'),
] 
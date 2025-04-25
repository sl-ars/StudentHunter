from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'job-views', views.JobViewViewSet)
router.register(r'job-metrics', views.JobApplicationMetricsViewSet)
router.register(r'employer-metrics', views.EmployerMetricsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('manager/', views.ManagerAnalyticsView.as_view(), name='manager-analytics'),
] 
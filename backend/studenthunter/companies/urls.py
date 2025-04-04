from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, CompanyReviewViewSet, CompanyBenefitViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'reviews', CompanyReviewViewSet)
router.register(r'benefits', CompanyBenefitViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

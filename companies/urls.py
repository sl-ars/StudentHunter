from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import CompanyViewSet, CompanyBenefitViewSet

router = DefaultRouter()
router.register(r'', CompanyViewSet)

companies_router = routers.NestedSimpleRouter(router, r'', lookup='company')
companies_router.register(r'benefits', CompanyBenefitViewSet, basename='company-benefits')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(companies_router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, employer_company_update

router = DefaultRouter()
router.register(r'', CompanyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Explicit mapping for employer company - this makes it work with different prefixes
    path('employer/company/', CompanyViewSet.as_view({
        'get': 'employer_company', 
        'put': 'update_employer_company',
        'patch': 'update_employer_company'
    }), name='employer-company'),
    # Explicit post endpoint for updating employer company
    path('employer-company-update/', employer_company_update, name='employer-company-update'),
]

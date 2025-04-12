import django_filters
from .models import Job

class JobFilter(django_filters.FilterSet):
    salary_min = django_filters.NumberFilter(field_name='salary_min', lookup_expr='gte')
    salary_max = django_filters.NumberFilter(field_name='salary_max', lookup_expr='lte')
    job_type = django_filters.CharFilter(field_name='job_type')
    company = django_filters.NumberFilter(field_name='company__id')
    industry = django_filters.CharFilter(field_name='company__industry')
    
    class Meta:
        model = Job
        fields = ['salary_min', 'salary_max', 'job_type', 'company', 'industry', 'location']

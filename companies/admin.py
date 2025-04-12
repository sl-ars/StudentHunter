from django.contrib import admin
from .models import Company, CompanyBenefit

class CompanyBenefitInline(admin.TabularInline):
    model = CompanyBenefit
    extra = 1

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'location', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'industry', 'created_at')
    search_fields = ('name', 'description', 'industry', 'location')
    inlines = [CompanyBenefitInline]

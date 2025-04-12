from django.contrib import admin
from .models import Job, JobApplication

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'job_type', 'status', 'created_at')
    list_filter = ('status', 'job_type', 'created_at')
    search_fields = ('title', 'company__name', 'location', 'description')
    date_hierarchy = 'created_at'

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'job', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('applicant__email', 'job__title', 'job__company__name')
    date_hierarchy = 'applied_at'

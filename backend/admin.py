from django.contrib import admin
from django.contrib.auth import get_user_model
from studenthunter.analytics.models import JobView, JobApplicationMetrics, EmployerMetrics
from studenthunter.applications.models import Application
from studenthunter.core.models import UserSettings, CompanySettings
from studenthunter.jobs.models import Job
from studenthunter.resources.models import Resource
from studenthunter.users.models import CustomUser, EmployerProfile, CampusProfile

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'is_active', 'created_at')
    search_fields = ('email', 'name')
    list_filter = ('role', 'is_active')
    ordering = ('-created_at',)

@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'industry')
    search_fields = ('user__email', 'company_name')
    list_filter = ('industry',)

@admin.register(CampusProfile)
class CampusProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'department')
    search_fields = ('user__email', 'university')
    list_filter = ('university',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'type', 'status', 'is_active')
    search_fields = ('title', 'company', 'location')
    list_filter = ('type', 'status', 'is_active', 'industry')
    ordering = ('-posted_date',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'applicant', 'status', 'created_at')
    search_fields = ('job__title', 'applicant__email')
    list_filter = ('status',)
    ordering = ('-created_at',)

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'author', 'published_at')
    search_fields = ('title', 'author')
    list_filter = ('type', 'category')
    ordering = ('-published_at',)

@admin.register(JobView)
class JobViewAdmin(admin.ModelAdmin):
    list_display = ('job', 'viewer', 'ip_address', 'viewed_at')
    search_fields = ('job__title', 'viewer__email')
    list_filter = ('viewed_at',)
    ordering = ('-viewed_at',)

@admin.register(JobApplicationMetrics)
class JobApplicationMetricsAdmin(admin.ModelAdmin):
    list_display = ('job', 'application', 'status', 'created_at')
    search_fields = ('job__title', 'application__applicant__email')
    list_filter = ('status',)
    ordering = ('-created_at',)

@admin.register(EmployerMetrics)
class EmployerMetricsAdmin(admin.ModelAdmin):
    list_display = ('employer', 'total_jobs', 'total_applications', 'total_hires')
    search_fields = ('employer__email',)
    ordering = ('-updated_at',)

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'push_notifications', 'dark_mode')
    search_fields = ('user__email',)
    list_filter = ('email_notifications', 'push_notifications', 'dark_mode')

@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'company_website')
    search_fields = ('user__email', 'company_name') 
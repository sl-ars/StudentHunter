from django.contrib import admin
from .models import UserSettings, CompanySettings

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'push_notifications', 'sms_notifications', 'two_factor_auth', 'dark_mode', 'language')
    search_fields = ('user__email', 'user__username')
    list_filter = ('email_notifications', 'push_notifications', 'sms_notifications', 'two_factor_auth', 'dark_mode', 'language')

@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'company_website')
    search_fields = ('user__email', 'user__username', 'company_name')
    list_filter = ('company_name',)

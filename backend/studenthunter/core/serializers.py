from rest_framework import serializers
from .models import UserSettings, CompanySettings

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
           'email_notifications', 'push_notifications',
            'sms_notifications', 'two_factor_auth', 'dark_mode',
            'language'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = [
            'company_name', 'company_website',
            'company_description'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 
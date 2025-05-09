# serializers.py

from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='name', read_only=True)
    company = serializers.CharField(source='name', read_only=True)
    company_id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Company
        fields = '__all__'  # или укажите конкретные поля, если не все нужны

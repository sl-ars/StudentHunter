# serializers.py

from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'  # или укажите конкретные поля, если не все нужны

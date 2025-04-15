from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserSettings, CompanySettings
from .serializers import UserSettingsSerializer, CompanySettingsSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
class BaseViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_response(self, data, message="Success", status_code=status.HTTP_200_OK):
        return Response({
            "status": "success" if status_code < 400 else "error",
            "data": data,
            "message": message
        }, status=status_code)

# === User Settings ===

class UserSettingsViewSet(BaseViewSet):
    serializer_class = UserSettingsSerializer

    def get_object(self):
        obj, _ = UserSettings.objects.get_or_create(user=self.request.user)
        return obj

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        instance = self.get_object()

        if request.method == "GET":
            serializer = self.serializer_class(instance)
            return self.get_response(serializer.data, "User settings retrieved")

        if request.method == "PATCH":
            serializer = self.serializer_class(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return self.get_response(serializer.data, "User settings updated")

    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return self.get_response(None, "Incorrect current password", status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return self.get_response(None, str(e), status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return self.get_response(None, "Password changed successfully", status.HTTP_200_OK)


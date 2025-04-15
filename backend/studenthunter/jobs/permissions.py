from rest_framework import permissions


class IsEmployerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated and (
                request.user.role == 'employer' or
                request.user.role == 'admin' or
                request.user.is_staff
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated and (
                obj.created_by == request.user or
                request.user.role == 'admin' or
                request.user.is_staff
        )


class IsApplicantOrEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if obj.applicant == request.user:
            return True

        if obj.job.created_by == request.user:
            return True

        return request.user.role == 'admin' or request.user.is_staff
from rest_framework import permissions

class IsEmployerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for employers or admins
        return request.user.is_authenticated and (
            request.user.role == 'manager' or 
            request.user.role == 'admin' or
            request.user.is_staff
        )
    
    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD, OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for job creator or admins
        return request.user.is_authenticated and (
            obj.created_by == request.user or 
            request.user.role == 'admin' or
            request.user.is_staff
        )

class IsApplicantOrEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Applicant can view/edit their own applications
        if obj.applicant == request.user:
            return True
        
        # Employer can view/edit applications for their jobs
        if obj.job.created_by == request.user:
            return True
        
        # Admins can view/edit all applications
        return request.user.role == 'admin' or request.user.is_staff

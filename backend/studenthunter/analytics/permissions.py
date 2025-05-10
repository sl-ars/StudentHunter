from rest_framework import permissions

class AnalyticsPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins can access anything
        if request.user.is_staff:
            return True

        # Specific views for employers
        if view.__class__.__name__ == 'EmployerAnalyticsView':
            return request.user.role == 'employer'
        
        # For ModelViewSets, further checks might be needed in has_object_permission
        # or by overriding get_queryset in the view itself.
        # By default, deny access to other analytics ViewSets for non-admins.
        if view.__class__.__name__ in ['JobViewViewSet', 'JobApplicationMetricsViewSet', 'EmployerMetricsViewSet']:
            # Allow list/retrieve for summary/trends actions if they are implemented for employers
            if view.action in ['summary', 'trends'] and request.user.role == 'employer':
                return True
            # Otherwise, these ViewSets are admin-only for general CRUD
            return False 
        
        return False # Default deny

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Admins can access any object
        if request.user.is_staff:
            return True
        
        # Employers can access their own metrics or metrics related to their jobs/applications
        if request.user.role == 'employer':
            if view.__class__.__name__ == 'JobApplicationMetricsViewSet' and view.action == 'trends':
                # Check if the job related to the metric belongs to the employer
                return obj.job.created_by == request.user
            if view.__class__.__name__ == 'EmployerMetricsViewSet' and view.action == 'summary':
                # Summary is a detail=False action, but if it were detail=True or for specific objects:
                return obj.employer == request.user 
            # Add other specific object-level checks if needed for employers

        return False # Default deny for object-level access for non-admins 
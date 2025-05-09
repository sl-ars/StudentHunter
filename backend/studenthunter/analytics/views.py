from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from jobs.models import Job
from applications.models import Application
from companies.models import Company
from analytics.models import JobView, JobApplicationMetrics, EmployerMetrics
from analytics.serializers import JobViewSerializer, JobApplicationMetricsSerializer, EmployerMetricsSerializer
from django.db import models
from users.models import EmployerProfile
from django.db.models.functions import TruncDay, TruncMonth, TruncYear, Cast
from django.db.models import DateField, Count

@extend_schema(
    tags=['analytics'],
    summary="Retrieve Employer Analytics Data",
    description="Provides comprehensive analytics data for employers including job statistics, application trends, and performance metrics."
)
class EmployerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='period', description='Time period for analytics aggregation (e.g., "week", "month", "year"). Default is "month".', required=False, type=OpenApiTypes.STR, enum=['week', 'month', 'year'])
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string'},
                    'message': {'type': 'string'},
                    'data': {'type': 'object'}
                }
            },
            403: {'description': 'Access denied if user is not an employer.'},
            404: {'description': 'Employer profile not found.'}
        }
    )
    def get(self, request):
        try:
            # Check if user is an employer
            if request.user.role != 'employer':
                return Response({
                    "status": "error",
                    "message": "Access denied. Only employers can access this data.",
                    "data": None
                }, status=status.HTTP_403_FORBIDDEN)
            
            period = request.query_params.get('period', 'month')
            now = timezone.now()

            # Set date range based on period
            if period == 'week':
                start_date = now - timedelta(days=7)
                trunc_function = TruncDay
            elif period == 'month':
                start_date = now - timedelta(days=30)
                trunc_function = TruncDay
            elif period == 'year':
                start_date = now - timedelta(days=365)
                trunc_function = TruncMonth
            else:
                start_date = now - timedelta(days=30)
                trunc_function = TruncDay

            # Initialize data structures
            application_stats_data = []
            job_views_data = []
            job_statuses_data = []
            application_statuses_data = []
            popular_jobs_data = []
            
            try:
                # Get jobs created by this employer
                jobs = Job.objects.filter(created_by=request.user)
                total_jobs = jobs.count()
                active_jobs = jobs.filter(is_active=True).count()
                
                # Get detailed job status counts
                filled_jobs = jobs.filter(status='filled').count()
                draft_jobs = jobs.filter(status='draft').count()
                archived_jobs = jobs.filter(status='archived').count()
                expired_jobs = jobs.filter(status='expired').count()
            except Exception as e:
                print(f"Error getting job data: {str(e)}")
                return Response({
                    "status": "error",
                    "message": f"Error retrieving job data: {str(e)}",
                    "data": None
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                # Get applications for employer's jobs
                applications = Application.objects.filter(job__in=jobs)
                total_applications = applications.count()
                pending_applications = applications.filter(status='pending').count()
                reviewing_applications = applications.filter(status='reviewing').count()
                accepted_applications = applications.filter(status='accepted').count()
                rejected_applications = applications.filter(status='rejected').count()
                
                # Get interviews data
                interviews_scheduled = applications.filter(status='interviewed', interview_date__isnull=False).count()
                interviews_completed = applications.filter(status='interviewed', interview_date__lt=now).count()
                interviews_canceled = applications.filter(status='canceled', interview_date__isnull=False).count()
            except Exception as e:
                print(f"Error getting application data: {str(e)}")
                return Response({
                    "status": "error",
                    "message": f"Error retrieving application data: {str(e)}",
                    "data": None
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                # Get real view counts if available
                job_views = JobView.objects.filter(job__in=jobs).count()
            except Exception as e:
                print(f"Error getting job view count: {str(e)}")
                job_views = 0
            
            try:
                # Application stats by date (real data)
                application_stats = Application.objects.filter(
                    job__in=jobs,
                    created_at__gte=start_date
                ).annotate(
                    date=trunc_function('created_at')
                ).values('date').annotate(
                    applications=Count('id')
                ).order_by('date')
                
                application_stats_data = [
                    {
                        "date": item['date'].strftime("%Y-%m-%d") if item['date'] else "",
                        "applications": item['applications']
                    }
                    for item in application_stats
                ]
            except Exception as e:
                print(f"Error getting application stats: {str(e)}")
                application_stats_data = []
            
            try:
                # Job views by date (real data if available)
                job_view_stats = JobView.objects.filter(
                    job__in=jobs,
                    viewed_at__gte=start_date
                ).annotate(
                    date=trunc_function('viewed_at')
                ).values('date').annotate(
                    views=Count('id')
                ).order_by('date')
                
                job_views_data = [
                    {
                        "date": item['date'].strftime("%Y-%m-%d") if item['date'] else "",
                        "views": item['views']
                    }
                    for item in job_view_stats
                ]
            except Exception as e:
                print(f"Error getting job view stats: {str(e)}")
                job_views_data = []
            
            try:
                # Job status breakdown (real data)
                job_statuses_data = [
                    {"name": "Active", "value": active_jobs},
                    {"name": "Filled", "value": filled_jobs},
                    {"name": "Draft", "value": draft_jobs}
                ]
                
                # Add archived and expired jobs if there are any
                if archived_jobs > 0:
                    job_statuses_data.append({"name": "Archived", "value": archived_jobs})
                if expired_jobs > 0:
                    job_statuses_data.append({"name": "Expired", "value": expired_jobs})
                
                # Application status breakdown (real data)
                application_statuses_data = [
                    {"name": "Pending", "value": pending_applications},
                    {"name": "Reviewing", "value": reviewing_applications},
                    {"name": "Accepted", "value": accepted_applications},
                    {"name": "Rejected", "value": rejected_applications}
                ]
            except Exception as e:
                print(f"Error generating status data: {str(e)}")
                # Use empty arrays if there was an error
                job_statuses_data = []
                application_statuses_data = []
            
            try:
                # Popular jobs (real data, based on views and applications)
                popular_jobs_data = []
                
                # Get view counts for each job
                job_view_counts = {}
                job_view_count_data = JobView.objects.filter(job__in=jobs).values('job').annotate(
                    total_views=Count('id')
                )
                for item in job_view_count_data:
                    job_view_counts[item['job']] = item['total_views']
                
                # Get application counts for each job
                job_application_counts = {}
                job_app_counts = Application.objects.filter(job__in=jobs).values('job').annotate(
                    total_applications=Count('id')
                )
                for item in job_app_counts:
                    job_application_counts[item['job']] = item['total_applications']
                
                # Get the 5 most viewed/applied to jobs
                for job in jobs.order_by('-created_at')[:5]:
                    views = job_view_counts.get(job.id, 0)
                    applications = job_application_counts.get(job.id, 0)
                    conversion_rate = round((applications / views * 100) if views > 0 else 0, 1)
                    
                    popular_jobs_data.append({
                        "id": job.id,
                        "title": job.title,
                        "views": views,
                        "applications": applications,
                        "conversionRate": conversion_rate
                    })
            except Exception as e:
                print(f"Error generating popular jobs data: {str(e)}")
                popular_jobs_data = []
            
            # Format response data in exactly the structure expected by the frontend
            response_data = {
                "stats": {
                    "jobs": {
                        "total": total_jobs,
                        "active": active_jobs,
                        "filled": filled_jobs,
                        "draft": draft_jobs,
                        "views": job_views
                    },
                    "applications": {
                        "total": total_applications,
                        "pending": pending_applications,
                        "reviewing": reviewing_applications,
                        "accepted": accepted_applications,
                        "rejected": rejected_applications
                    },
                    "clicks": {
                        "total": job_views,
                        "applied": total_applications,
                        "applyRate": float(total_applications) / job_views if job_views > 0 else 0
                    },
                    "interviews": {
                        "scheduled": interviews_scheduled,
                        "completed": interviews_completed,
                        "canceled": interviews_canceled
                    }
                },
                "analytics": {
                    "jobViews": job_views_data,
                    "applicationStats": application_stats_data,
                    "applicationStatuses": application_statuses_data,
                    "jobStatusesData": job_statuses_data,
                    "popularJobs": popular_jobs_data
                }
            }

            return Response({
                "status": "success",
                "message": "Analytics data retrieved successfully",
                "data": response_data
            })
            
        except Exception as e:
            print(f"Error in analytics endpoint: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error retrieving analytics data: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    tags=['analytics'],
    summary="Retrieve Employer Analytics Overview",
    description="Provides a summary of employer analytics such as active jobs, total applications, interviews scheduled, and response rates. Data can be filtered by a time period."
)
class ManagerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='period', description='Time period for analytics aggregation (e.g., "week", "month"). Default is "month".', required=False, type=OpenApiTypes.STR, enum=['week', 'month'])
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'activeJobs': {'type': 'integer'},
                    'jobsChange': {'type': 'string'},
                    'totalApplications': {'type': 'integer'},
                    'applicationsChange': {'type': 'string'},
                    'interviewsScheduled': {'type': 'integer'},
                    'interviewsChange': {'type': 'string'},
                    'responseRate': {'type': 'string'},
                    'responseRateChange': {'type': 'string'},
                }
            },
            403: {'description': 'Access denied if user is not an employer.'},
            404: {'description': 'Employer profile not found.'}
        }
    )
    def get(self, request):
        if request.user.role != 'employer':
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        employer_profile = EmployerProfile.objects.filter(user=request.user).first()
        if not employer_profile:
            return Response({"error": "Employer profile not found"}, status=status.HTTP_404_NOT_FOUND)

        period = request.query_params.get('period', 'month')
        now = timezone.now()

        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        else: # Default to month
            start_date = now - timedelta(days=30)
            period = 'month'


        active_jobs = Job.objects.filter(created_by=request.user, is_active=True).count()
        previous_jobs_count = Job.objects.filter(
            created_by=request.user,
            is_active=True,
            posted_date__lt=start_date
        ).count()
        jobs_change_value = active_jobs - previous_jobs_count
        jobs_change = f"{'+' if jobs_change_value >= 0 else ''}{jobs_change_value} this {period}"


        total_applications = Application.objects.filter(job__created_by=request.user).count()
        previous_applications_count = Application.objects.filter(
            job__created_by=request.user,
            created_at__lt=start_date
        ).count()
        applications_change_value = total_applications - previous_applications_count
        applications_change = f"{'+' if applications_change_value >= 0 else ''}{applications_change_value} this {period}"

        interviews_scheduled = Application.objects.filter(
            job__created_by=request.user,
            status='interviewed',
            interview_date__gte=now, # Scheduled for now or future
            # Consider if interview_date__lte should be for "next 7 days" or "this period"
        ).count()
        # interviews_change logic might need refinement based on exact requirement for "change"

        responded_applications = Application.objects.filter(
            job__created_by=request.user,
            status__in=['reviewing', 'interviewed', 'accepted', 'rejected']
        )
        total_responses = responded_applications.count()
        response_rate = (total_responses / total_applications * 100) if total_applications > 0 else 0

        previous_responded_applications_count = Application.objects.filter(
            job__created_by=request.user,
            status__in=['reviewing', 'interviewed', 'accepted', 'rejected'],
            created_at__lt=start_date
        ).count()
        
        previous_response_rate = (previous_responded_applications_count / previous_applications_count * 100) if previous_applications_count > 0 else 0
        response_rate_change_value = response_rate - previous_response_rate
        response_rate_change = f"{'+' if response_rate_change_value >= 0 else ''}{response_rate_change_value:.1f}% this {period}"

        return Response({
            "activeJobs": active_jobs,
            "jobsChange": jobs_change,
            "totalApplications": total_applications,
            "applicationsChange": applications_change,
            "interviewsScheduled": interviews_scheduled,
             # Assuming "interviewsChange" is a static label or needs specific logic
            "interviewsChange": "For upcoming period" if period == 'month' else "For next 7 days",
            "responseRate": f"{response_rate:.1f}%",
            "responseRateChange": response_rate_change,
        })

@extend_schema(tags=['analytics'])
class JobViewViewSet(viewsets.ModelViewSet):
    queryset = JobView.objects.all()
    serializer_class = JobViewSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Record a Job View")
    def perform_create(self, serializer): # Schema for create action is inherited if serializer_class is set
        serializer.save(
            viewer=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @extend_schema(summary="List Job Views")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Retrieve a Job View")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Create a Job View Record", request=JobViewSerializer, responses={201: JobViewSerializer})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(summary="Update a Job View Record")
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Partially update a Job View Record")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Delete a Job View Record")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


@extend_schema(tags=['analytics'])
class JobApplicationMetricsViewSet(viewsets.ModelViewSet):
    queryset = JobApplicationMetrics.objects.all()
    serializer_class = JobApplicationMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Job View and Application Trends",
        description="Provides daily counts of views and applications for a specific job over a specified number of days.",
        parameters=[
            OpenApiParameter(name='days', description='Number of past days to fetch trends for (default 7).', required=False, type=OpenApiTypes.INT)
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'views': {'type': 'array', 'items': {'type': 'object', 'properties': {'viewed_at__date': {'type': 'string', 'format': 'date'}, 'count': {'type': 'integer'}}}},
                    'applications': {'type': 'array', 'items': {'type': 'object', 'properties': {'created_at__date': {'type': 'string', 'format': 'date'}, 'count': {'type': 'integer'}}}}
                }
            }
        }
    )
    @action(detail=True, methods=['get'])
    def trends(self, request, pk=None):
        # The pk for JobApplicationMetrics might not be directly used if trends are for its related Job
        # Assuming 'self.get_object()' gets a JobApplicationMetrics instance, then .job gets the Job
        try:
            metric_instance = self.get_object() # Gets JobApplicationMetrics instance based on pk
            job = metric_instance.job 
        except JobApplicationMetrics.DoesNotExist:
             return Response({"error": "JobApplicationMetrics not found for the given ID"}, status=status.HTTP_404_NOT_FOUND)
        except Job.DoesNotExist: # If metric_instance.job does not exist
            return Response({"error": "Associated Job not found for this metric"}, status=status.HTTP_404_NOT_FOUND)


        days = int(request.query_params.get('days', 7))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        daily_views = JobView.objects.filter(
            job=job, # Filter by the actual job
            viewed_at__range=(start_date, end_date)
        ).values('viewed_at__date').annotate(
            count=models.Count('id')
        ).order_by('viewed_at__date')

        daily_applications = Application.objects.filter(
            job=job, # Filter by the actual job
            created_at__range=(start_date, end_date)
        ).values('created_at__date').annotate(
            count=models.Count('id')
        ).order_by('created_at__date')

        return Response({
            'views': list(daily_views),
            'applications': list(daily_applications)
        })

    @extend_schema(summary="List Job Application Metrics")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Create Job Application Metrics")
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Retrieve Job Application Metrics")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Update Job Application Metrics")
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Partially update Job Application Metrics")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Delete Job Application Metrics")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


@extend_schema(tags=['analytics'])
class EmployerMetricsViewSet(viewsets.ModelViewSet):
    queryset = EmployerMetrics.objects.all()
    serializer_class = EmployerMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure that users can only see their own metrics
        if self.request.user.is_authenticated:
            return EmployerMetrics.objects.filter(employer=self.request.user)
        return EmployerMetrics.objects.none() # Or raise PermissionDenied

    @extend_schema(
        summary="Get Employer Metrics Summary",
        description="Provides a summary of an employer's performance metrics, including total jobs posted, applications received, interviews conducted, hires made, and the average time to hire.",
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'total_jobs': {'type': 'integer'},
                    'total_applications': {'type': 'integer'},
                    'total_interviews': {'type': 'integer'},
                    'total_hires': {'type': 'integer'},
                    'average_time_to_hire': {'type': 'number', 'format': 'float', 'nullable': True, 'description': 'Average days to hire. Null if no hires.'}
                }
            }
        }
    )
    @action(detail=False, methods=['get'])
    def summary(self, request):
        employer = request.user # Assuming request.user is the employer
        
        # Ensure an EmployerProfile exists for the user if your logic depends on it elsewhere,
        # or if EmployerMetrics are directly linked to EmployerProfile instead of User.
        # For this specific summary, direct use of request.user for filtering Job.created_by seems intended.

        jobs = Job.objects.filter(created_by=employer)
        applications = Application.objects.filter(job__in=jobs)
        
        total_jobs = jobs.count()
        total_applications = applications.count()
        total_interviews = applications.filter(status='interviewed').count()
        
        hired_applications = applications.filter(status='accepted')
        total_hires = hired_applications.count()
        
        avg_time_to_hire = None
        if hired_applications.exists():
            total_days_to_hire = 0
            valid_hires_for_avg = 0
            for app in hired_applications:
                # Ensure both dates are not None before subtraction
                if app.created_at and app.updated_at: # Assuming updated_at reflects hire date for 'accepted' status
                    time_diff = app.updated_at - app.created_at
                    total_days_to_hire += time_diff.days
                    valid_hires_for_avg +=1
            if valid_hires_for_avg > 0:
                avg_time_to_hire = total_days_to_hire / valid_hires_for_avg


        return Response({
            'total_jobs': total_jobs,
            'total_applications': total_applications,
            'total_interviews': total_interviews,
            'total_hires': total_hires,
            'average_time_to_hire': avg_time_to_hire
        })

    @extend_schema(summary="List Employer Metrics")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Create Employer Metrics")
    def create(self, request, *args, **kwargs):
        # Typically, EmployerMetrics might be created/updated via signals or specific actions
        # rather than direct POST, but providing schema for completeness.
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Retrieve Employer Metrics")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Update Employer Metrics")
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Partially update Employer Metrics")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Delete Employer Metrics")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

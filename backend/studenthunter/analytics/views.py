from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job
from applications.models import Application
from companies.models import Company
from .models import JobView, JobApplicationMetrics, EmployerMetrics
from .serializers import JobViewSerializer, JobApplicationMetricsSerializer, EmployerMetricsSerializer
from django.db import models
from users.models import EmployerProfile

class ManagerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

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
        else:
            start_date = now - timedelta(days=30)

        active_jobs = Job.objects.filter(created_by=request.user, is_active=True).count()
        previous_jobs = Job.objects.filter(
            created_by=request.user,
            is_active=True,
            posted_date__lt=start_date
        ).count()
        jobs_change = f"+{active_jobs - previous_jobs} this {period}"

        total_applications = Application.objects.filter(job__created_by=request.user).count()
        previous_applications = Application.objects.filter(
            job__created_by=request.user,
            created_at__lt=start_date
        ).count()
        applications_change = f"+{total_applications - previous_applications} this {period}"

        interviews_scheduled = Application.objects.filter(
            job__created_by=request.user,
            status='interviewed',
            interview_date__gte=now,
            interview_date__lte=now + timedelta(days=7)
        ).count()

        total_responses = Application.objects.filter(
            job__created_by=request.user,
            status__in=['reviewing', 'interviewed', 'accepted', 'rejected']
        ).count()
        response_rate = (total_responses / total_applications * 100) if total_applications > 0 else 0
        previous_response_rate = Application.objects.filter(
            job__created_by=request.user,
            status__in=['reviewing', 'interviewed', 'accepted', 'rejected'],
            created_at__lt=start_date
        ).count() / previous_applications * 100 if previous_applications > 0 else 0
        response_rate_change = f"+{response_rate - previous_response_rate:.1f}% this {period}"

        return Response({
            "activeJobs": active_jobs,
            "jobsChange": jobs_change,
            "totalApplications": total_applications,
            "applicationsChange": applications_change,
            "interviewsScheduled": interviews_scheduled,
            "interviewsChange": "Next 7 days",
            "responseRate": f"{response_rate:.1f}%",
            "responseRateChange": response_rate_change,
        })

class JobViewViewSet(viewsets.ModelViewSet):
    queryset = JobView.objects.all()
    serializer_class = JobViewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            viewer=self.request.user,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

class JobApplicationMetricsViewSet(viewsets.ModelViewSet):
    queryset = JobApplicationMetrics.objects.all()
    serializer_class = JobApplicationMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def trends(self, request, pk=None):
        job = self.get_object().job
        days = int(request.query_params.get('days', 7))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        daily_views = JobView.objects.filter(
            job=job,
            viewed_at__range=(start_date, end_date)
        ).values('viewed_at__date').annotate(
            count=models.Count('id')
        ).order_by('viewed_at__date')

        daily_applications = Application.objects.filter(
            job=job,
            created_at__range=(start_date, end_date)
        ).values('created_at__date').annotate(
            count=models.Count('id')
        ).order_by('created_at__date')

        return Response({
            'views': list(daily_views),
            'applications': list(daily_applications)
        })

class EmployerMetricsViewSet(viewsets.ModelViewSet):
    queryset = EmployerMetrics.objects.all()
    serializer_class = EmployerMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmployerMetrics.objects.filter(employer=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        employer = request.user
        jobs = Job.objects.filter(created_by=employer)
        applications = Application.objects.filter(job__in=jobs)
        
        total_jobs = jobs.count()
        total_applications = applications.count()
        total_interviews = applications.filter(status='interviewed').count()
        total_hires = applications.filter(status='accepted').count()
        
        hired_applications = applications.filter(status='accepted')
        if hired_applications.exists():
            total_days = sum(
                (app.updated_at - app.created_at).days 
                for app in hired_applications
            )
            avg_time_to_hire = total_days / hired_applications.count()
        else:
            avg_time_to_hire = None

        return Response({
            'total_jobs': total_jobs,
            'total_applications': total_applications,
            'total_interviews': total_interviews,
            'total_hires': total_hires,
            'average_time_to_hire': avg_time_to_hire
        })

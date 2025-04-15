from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    company_id = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    salary = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    requirements = models.JSONField(null=True, blank=True)
    responsibilities = models.JSONField(null=True, blank=True)
    benefits = models.JSONField(null=True, blank=True)
    posted_date = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    featured = models.BooleanField(default=False)
    logo = models.ImageField(upload_to='job_logos/', null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)
    view_count = models.IntegerField(default=0)
    application_count = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
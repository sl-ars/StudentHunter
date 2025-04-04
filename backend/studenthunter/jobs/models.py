from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from companies.models import Company

class JobCategory(models.Model):
   """Model for job categories."""
   name = models.CharField(max_length=100)
   slug = models.SlugField(max_length=120, unique=True)
   description = models.TextField(blank=True)

class Meta:
   verbose_name_plural = "Job Categories"

def __str__(self):
   return self.name

def save(self, *args, **kwargs):
   if not self.slug:
       self.slug = slugify(self.name)
   super().save(*args, **kwargs)


class Job(models.Model):
   """Model for job listings."""

   STATUS_CHOICES = (
      ('draft', 'Draft'),
      ('published', 'Published'),
      ('closed', 'Closed'),
      ('expired', 'Expired'),
   )

   JOB_TYPE_CHOICES = (
      ('full_time', 'Full Time'),
      ('part_time', 'Part Time'),
      ('contract', 'Contract'),
      ('internship', 'Internship'),
      ('temporary', 'Temporary'),
   )

   EXPERIENCE_LEVEL_CHOICES = (
      ('entry', 'Entry Level'),
      ('mid', 'Mid Level'),
      ('senior', 'Senior Level'),
      ('executive', 'Executive Level'),
   )

   title = models.CharField(max_length=200)
   slug = models.SlugField(max_length=250, unique_for_date='created_at')
   company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
   category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, related_name='jobs')
   description = models.TextField()
   requirements = models.TextField()
   responsibilities = models.TextField()
   location = models.CharField(max_length=200)
   is_remote = models.BooleanField(default=False)
   salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
   salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
   job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
   experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='entry')
   skills_required = models.TextField(blank=True)
   benefits = models.TextField(blank=True)
   application_deadline = models.DateField(null=True, blank=True)
   status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
   created_at = models.DateTimeField(auto_now_add=True)
   updated_at = models.DateTimeField(auto_now=True)
   created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_jobs')
   views_count = models.PositiveIntegerField(default=0)
   applications_count = models.PositiveIntegerField(default=0)

   class Meta:
      ordering = ['-created_at']

   def __str__(self):
      return self.title

   def save(self, *args, **kwargs):
      if not self.slug:
          self.slug = slugify(self.title)

      # Check if the job has expired
      if self.application_deadline and self.application_deadline < timezone.now().date():
          self.status = 'expired'

      super().save(*args, **kwargs)

@property
def is_active(self):
   """Check if the job is active (published and not expired)."""
   return (
       self.status == 'published' and 
       (not self.application_deadline or self.application_deadline >= timezone.now().date())
   )


class JobSkill(models.Model):
   """Model for job skills."""
   name = models.CharField(max_length=100, unique=True)

   def __str__(self):
      return self.name


class JobApplication(models.Model):
   """Model for job applications."""

   STATUS_CHOICES = (
      ('pending', 'Pending'),
      ('reviewing', 'Reviewing'),
      ('shortlisted', 'Shortlisted'),
      ('interview', 'Interview'),
      ('offered', 'Offered'),
      ('hired', 'Hired'),
      ('rejected', 'Rejected'),
      ('withdrawn', 'Withdrawn'),
   )

   job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
   applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
   cover_letter = models.TextField()
   resume = models.FileField(upload_to='resumes/%Y/%m/%d/')
   status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
   applied_at = models.DateTimeField(auto_now_add=True)
   updated_at = models.DateTimeField(auto_now=True)
   employer_notes = models.TextField(blank=True)

   class Meta:
      ordering = ['-applied_at']
      unique_together = ['job', 'applicant']

   def __str__(self):
      return f"{self.applicant.email} - {self.job.title}"

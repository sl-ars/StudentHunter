from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager
from users.storage import AvatarStorage, ResumeStorage
import boto3
from django.conf import settings
from botocore.exceptions import NoCredentialsError, ClientError

class CustomUser(AbstractUser):
    objects = CustomUserManager()

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('employer', 'Employer'),
        ('campus', 'Campus'),
        ('admin', 'Admin'),
    ]

    class Meta:
        app_label = 'users'

    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(storage=AvatarStorage(), upload_to="avatars/", blank=True, null=True, help_text="Profile picture")
    university = models.CharField(max_length=255, blank=True, null=True, default="")
    company = models.CharField(max_length=255, blank=True, null=True, default="")
    company_id = models.CharField(max_length=255, blank=True, null=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="student_profile")
    bio = models.TextField(blank=True, null=True)
    skills = models.JSONField(blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", null=True, blank=True)

    def __str__(self):
        return f"Student Profile: {self.user.email}"

def upload_to_student_directory(instance, filename):
    # instance is Resume; instance.student is StudentProfile; instance.student.user is CustomUser
    user_id = instance.student.user.id
    return f"{user_id}/{filename}"
class Resume(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(storage=ResumeStorage(), upload_to=upload_to_student_directory)
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume: {self.name or self.file.name} for {self.student.user.email}"

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = self.file.name
        super().save(*args, **kwargs)

    def get_resume_url(self):
        """Generates a signed S3 URL for secure resume download"""
        if not self.file or not self.file.name:
            return None

        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
            )
          
            s3_key = f"resumes/{self.file.name}"

            signed_url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                    "Key": s3_key
                },
                ExpiresIn=600,  # 10 minutes expiration
                HttpMethod="GET",
            )

            return signed_url

        except (NoCredentialsError, ClientError):
            return None


class Education(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="education")
    university = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    gpa = models.CharField(max_length=10, blank=True, null=True)

    def clean(self):
        # Convert YYYY-MM to YYYY-MM-DD if needed
        if isinstance(self.start_date, str) and len(self.start_date) == 7:
            self.start_date = f"{self.start_date}-01"
        if isinstance(self.end_date, str) and len(self.end_date) == 7:
            self.end_date = f"{self.end_date}-01"

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class Experience(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="experience")
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    current = models.BooleanField(default=False)
    description = models.TextField(blank=True)


class EmployerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="employer_profile")
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name="employer_profiles")

    def __str__(self):
        return f"Employer: {self.company_name}"


class CampusProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="campus_profile")
    university = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Campus: {self.university}"


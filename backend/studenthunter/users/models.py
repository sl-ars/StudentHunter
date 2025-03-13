from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager


class CustomUser(AbstractUser):
    objects = CustomUserManager()

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('employer', 'Employer'),
        ('campus', 'Campus'),
        ('admin', 'Admin'),
    ]

    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    university = models.CharField(max_length=255, blank=True, null=True, default="")
    company = models.CharField(max_length=255, blank=True, null=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True, default=None)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="student_profile")
    bio = models.TextField(blank=True)
    skills = models.JSONField(blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", null=True, blank=True)

    def __str__(self):
        return f"Student Profile: {self.user.email}"


class Education(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="education")
    university = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    gpa = models.CharField(max_length=10, blank=True, null=True)


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

    def __str__(self):
        return f"Employer: {self.company_name}"


class CampusProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="campus_profile")
    university = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Campus: {self.university}"


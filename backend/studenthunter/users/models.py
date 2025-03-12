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


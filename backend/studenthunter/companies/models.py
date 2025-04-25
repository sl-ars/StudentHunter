from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255)
    industry = models.CharField(max_length=255)
    size = models.CharField(max_length=50, blank=True, null=True)
    founded = models.CharField(max_length=4, blank=True, null=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='company_cover_images/', blank=True, null=True)
    verified = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    culture = models.TextField(blank=True, null=True)
    benefits = models.JSONField(blank=True, null=True)  
    social_links = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.name

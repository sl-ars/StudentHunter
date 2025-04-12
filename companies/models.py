from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    size = models.CharField(max_length=50, blank=True)  # e.g., "1-10", "11-50", "51-200", etc.
    
    # Verification status
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class CompanyBenefit(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='benefits')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.company.name}"

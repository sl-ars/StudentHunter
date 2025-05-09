from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
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
        
    def save(self, *args, **kwargs):
        """
        Override save method to update related data when company name changes
        """
        # Detect if this is an update operation (object already exists)
        is_update = self.pk is not None
        
        # If updating and name has changed, store old name before saving
        old_name = None
        if is_update:
            old_instance = Company.objects.get(pk=self.pk)
            if old_instance.name != self.name:
                old_name = old_instance.name
        
        # Call the original save method
        super().save(*args, **kwargs)
        
        # If company name has changed, update all related jobs
        if is_update and old_name and old_name != self.name:
            try:
                from jobs.models import Job
                # Update all jobs with this company ID
                jobs_to_update = Job.objects.filter(company_id=str(self.id))
                print(f"Updating company name in {jobs_to_update.count()} jobs")
                
                for job in jobs_to_update:
                    job.company = self.name
                    job.save(update_fields=['company'])
                
                # Also update jobs with old company name but no company_id
                other_jobs = Job.objects.filter(company=old_name, company_id='')
                print(f"Updating {other_jobs.count()} jobs with old company name")
                
                for job in other_jobs:
                    job.company = self.name
                    job.company_id = str(self.id)
                    job.save(update_fields=['company', 'company_id'])
                
                # Update users with this company ID
                from users.models import CustomUser
                users_to_update = CustomUser.objects.filter(company_id=str(self.id))
                print(f"Updating company name for {users_to_update.count()} users")
                
                for user in users_to_update:
                    user.company = self.name
                    user.save(update_fields=['company'])
            except Exception as e:
                print(f"Error updating related data after company name change: {str(e)}")
        
    @property
    def company_name(self):
        """Return company name field for API consistency"""
        return self.name
        
    @property
    def company_id(self):
        """Return company id string for API consistency"""
        return str(self.id) if self.id else ""

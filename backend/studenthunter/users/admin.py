from django.contrib import admin
from .models import CustomUser, StudentProfile, Resume, Education, Experience, EmployerProfile, CampusProfile

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(StudentProfile)
admin.site.register(Resume)
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(EmployerProfile)
admin.site.register(CampusProfile)

import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
# Adjust 'config.settings.dev' to your actual development settings file if different,
# or use 'config.settings.base' or 'config.settings' if appropriate.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

app = Celery('studenthunter')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   in Django settings should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
# This allows Celery to find tasks defined in files like `tasks.py` within your apps.
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """A sample task for debugging Celery setup."""
    print(f'Celery Request: {self.request!r}') 
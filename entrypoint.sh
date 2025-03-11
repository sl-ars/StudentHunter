#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for PostgreSQL to start..."
while ! timeout 1 bash -c 'cat < /dev/null > /dev/tcp/db/5432'; do
  sleep 1
done
echo "PostgreSQL started."

# Apply database migrations
echo "Applying migrations..."
poetry run python manage.py migrate

# Collect static files (optional)
echo "Collecting static files..."
poetry run python manage.py collectstatic --noinput

# Create superuser if not exists (optional)
if [ "$CREATE_SUPERUSER" = "true" ]; then
  poetry run python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email="admin@example.com").exists():
    User.objects.create_superuser("admin@example.com", "Admin", "User", "adminpassword")
EOF
fi

# Start Gunicorn server
echo "Starting Gunicorn..."
exec poetry run gunicorn studenthunter.wsgi:application --bind 0.0.0.0:8000 --workers 4
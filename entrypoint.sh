#!/bin/sh

# Wait for database to be ready
echo "Waiting for PostgreSQL..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

# Create static directory if it doesn't exist
mkdir -p /app/staticfiles
mkdir -p /app/media

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Create superuser if needed
echo "Creating superuser..."
python manage.py createsuperuser --noinput --email $DJANGO_SUPERUSER_EMAIL --name $DJANGO_SUPERUSER_NAME || true

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server
echo "Starting server..."
exec "$@"

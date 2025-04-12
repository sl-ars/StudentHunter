FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install netcat for the entrypoint script
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Create static and media directories
RUN mkdir -p /app/staticfiles
RUN mkdir -p /app/media
RUN mkdir -p /app/static

# Copy project
COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "studenthunter.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120"]

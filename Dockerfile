# Use an official Python runtime as a base image
FROM python:3.11

# Set environment variables to avoid bytecode generation and buffering
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry

# Copy Poetry files first (for caching layers)
COPY pyproject.toml poetry.lock /app/

# Configure Poetry to disable virtualenv creation inside Docker
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi

# Copy the rest of the application code
COPY . /app/

# Ensure entrypoint script is executable
RUN chmod +x /app/entrypoint.sh

# Expose the application port
EXPOSE 8000

# Set the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
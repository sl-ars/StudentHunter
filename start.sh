#!/bin/bash

# Check if .env file exists, if not create it
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOL
# Database settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=studenthunter

# Backend settings
DEBUG=True
SECRET_KEY=django-insecure-key-for-development-only

# Frontend settings
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MOCK_ENABLED=true
EOL
  echo ".env file created. You may want to edit it with your specific configuration."
fi

# Start the Docker containers
echo "Starting Docker containers..."
docker-compose up -d

echo "Services are starting:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo "- Database: localhost:5432"

echo "To view logs, run: docker-compose logs -f"
echo "To stop services, run: docker-compose down"

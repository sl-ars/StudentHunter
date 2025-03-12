# StudentHunter

A platform connecting students with job opportunities.

## Docker Setup

This project is containerized using Docker for easy setup and deployment.

### Quick Start

1. Make sure you have Docker and Docker Compose installed on your system.

2. Make the start script executable:
   \`\`\`bash
   chmod +x start.sh
   \`\`\`

3. Run the start script:
   \`\`\`bash
   ./start.sh
   \`\`\`

4. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Environment Variables

You can customize the application behavior by editing the `.env` file in the project root.

### Services

- **frontend**: Next.js application running on port 3000
- **backend**: Django application running on port 8000
- **db**: PostgreSQL database running on port 5432

### Volumes

- **postgres_data**: Persistent storage for the database
- **static_volume**: Django static files
- **media_volume**: Django media files

### Development vs Production

This Docker setup is designed to work in both development and production environments.
For production, you should:

1. Set `DEBUG=False` in the `.env` file
2. Use a proper `SECRET_KEY`
3. Configure proper database credentials
4. Set `NEXT_PUBLIC_MOCK_ENABLED=false`

### Manual Docker Commands

- Start services: `docker-compose up -d`
- View logs: `docker-compose logs -f`
- Stop services: `docker-compose down`
- Rebuild services: `docker-compose up -d --build`
\`\`\`

Now, let's delete the docker folder since we've moved everything to the root:

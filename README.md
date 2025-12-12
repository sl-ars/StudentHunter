# StudentHunter

![Main page](docs/main_page.png)
StudentHunter is a web platform that helps students find internships, junior positions, and educational opportunities. It connects students and employers in one place and streamlines the whole process: from discovering a vacancy to submitting an application and tracking its status.

The project is built as a modern web application with a Django + Django REST Framework backend and a React frontend, using PostgreSQL as the primary database. It is designed to be deployable on common cloud providers (e.g., AWS) but can also run on any standard Linux/macOS/Windows environment with Docker or a Python/Node.js stack.

## Goals

- Give students easy access to relevant internships and entry-level jobs.
- Provide employers with a convenient way to publish vacancies and discover young talent.
- Offer a simple and transparent application flow with status tracking.
- Deliver notifications and basic recommendations to keep students engaged.
- Lay the foundation for future enhancements (e.g., AI-based matching, chat, integrations).

## Key Features

- Student and employer registration and authentication.
- Student profiles with resumes and basic completion progress (e.g., must be ≥70% to apply).
- Vacancy creation and management for employers.
- Vacancy search and filtering by multiple criteria.
- Application submission and status tracking (submitted, rejected, accepted, etc.).
- Notification system for new vacancies and status changes.
- Admin panel for content and user management.

## Tech Stack

**Backend**

- Python 3.x  
- Django  
- Django REST Framework  
- PostgreSQL  

**Frontend**

- React (SPA)  
- RESTful API integration with the backend  

**Infrastructure (recommended)**

- Docker for containerization  
- AWS (EC2, RDS PostgreSQL, S3, ELB) or any other cloud provider  
- Redis (caching, Celery broker)  
- Sentry / similar tool for error tracking and monitoring  

## Architecture Overview

For the initial MVP, StudentHunter is implemented as a monolithic Django application that exposes a REST API consumed by a React frontend.

Main backend modules (conceptual):

- `accounts` – user management (students, employers, admins, roles, auth).
- `jobs` – vacancy creation, editing, search, and filtering.
- `applications` – job applications and status workflow.
- `notifications` – email and in-app notifications.
- `admin_dashboard` – administration and moderation tools.

As the project grows, selected modules (e.g., notifications) can be split into separate services and communicate via REST APIs or a message broker.

## Installation & Setup (Development)

Below is a generic development setup. Adjust paths/commands to your actual repo structure.

### Prerequisites

- Python 3.x  
- Node.js (LTS) and npm or yarn  
- PostgreSQL  
- Git  
- (Optional) Docker & Docker Compose

### Backend

1. Clone the repository:

   ```bash
   git clone https://github.com/sl-ars/StudentHunter.git
   cd StudentHunter
   ```

2. Create and activate a virtual environment, then install dependencies:

   ```bash
   python -m venv venv
   source venv/bin/activate  # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure environment variables (e.g. in `.env`):

   - Database connection (PostgreSQL)
   - Secret key
   - Email/notification settings (optional)

4. Apply migrations and run the development server:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend

1. Go to your frontend folder (e.g. `frontend/`):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open the URL shown in the console (typically http://localhost:3000) to access the frontend.

### Docker (Optional)

If you have Docker configuration, you can start everything with:

```bash
docker compose up
```

## Documentation

- Project overview, installation and usage: this `README.md`.
- Contribution guidelines: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Governance and ownership: [`GOVERNANCE.md`](GOVERNANCE.md)
- Code of Conduct: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- Privacy & data handling: [`PRIVACY.md`](PRIVACY.md)
- Security policy: [`SECURITY.md`](SECURITY.md)
- DPG Self-Assessment: [`docs/dpg-self-assessment.md`](docs/dpg-self-assessment.md)

## License

StudentHunter is released under an open source license.  
See the [`LICENSE`](LICENSE) file for details.

## Contributing

We welcome contributions from students, educators, and employers.  
Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before opening an issue or submitting a pull request.

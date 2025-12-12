# Privacy & Data Protection

StudentHunter processes personal data from students and employers, and we take privacy and data protection seriously. This document explains, in simple terms, what data we handle and how we intend to protect it.

## What Data We Collect

Depending on your role (student or employer), we may store:

- Basic account information (name, email address, password hash).
- Student profile details (education, skills, resume/CV, links to portfolios).
- Employer profile details (company name, contact person, contact email, company logo).
- Vacancy data (title, description, requirements, location).
- Application data (which student applied to which job, application status, timestamps).
- Technical logs (for debugging and security), which may include IP addresses and user agents.

We **do not** store passwords in plain text; they are securely hashed. We do not intentionally store highly sensitive personal data (such as government IDs, bank card numbers, or health records).

## How We Use the Data

We use personal data to:

- Provide the core functionality of the platform: posting jobs, searching, applying, and tracking statuses.
- Send notifications about new vacancies, application status changes, and important updates.
- Improve the platform through basic analytics (e.g., number of applications, active users).

We do **not** sell personal data to third parties.

## Data Security

- All secrets (database passwords, API keys, etc.) should be stored in environment variables and not committed to the repository.
- We recommend running StudentHunter behind HTTPS so that all traffic is encrypted in transit.
- Database encryption at rest can be enabled at the infrastructure level (e.g., encrypted volumes or managed DB encryption).
- Logs are configured to avoid storing passwords or other highly sensitive fields.

## Data Retention and User Rights

- Users can request account deletion, and we aim to remove personal profile data and associated applications where possible, while keeping the minimum data required for legal or statistical purposes (in aggregate form).
- We plan to support export of personal data upon request, in line with regulations such as GDPR where applicable.

## Third-Party Services

If you deploy StudentHunter using third-party services (e.g., AWS, email providers, monitoring tools), please review their privacy policies as well. They may process IP addresses, emails, and other metadata as part of their normal operation.

If you have questions or concerns about privacy in StudentHunter, please contact: **studenthunter.team@gmail.com**.

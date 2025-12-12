# Security Policy

We care about the security of StudentHunter and the protection of student and employer data. If you discover a security issue, we ask that you report it responsibly.

## Reporting a Vulnerability

Please **do not** open public GitHub issues for security vulnerabilities.

Instead, send a detailed report to: **studenthunter.team@gmail.com** with:

- A clear description of the issue.
- Steps to reproduce the vulnerability.
- Any potential impact (e.g., data exposure, privilege escalation).
- Your environment details (if relevant).

We will:

- Acknowledge your report as soon as possible.
- Investigate the issue and assess its impact.
- Work on a fix and coordinate a responsible disclosure timeline if needed.

## Supported Versions

As this is an evolving project, the `main` branch and the latest tagged release are the primary supported versions. Security fixes are generally applied to the latest version; backports may be considered if necessary.

## Best Practices for Deployers

If you are deploying StudentHunter yourself, we recommend:

- Always running behind HTTPS (TLS 1.2+).
- Using strong, unique passwords for admin accounts.
- Storing secrets (DB passwords, API keys) in environment variables or a secure secret manager.
- Keeping your OS, database, and dependencies up to date with security patches.
- Restricting direct database and admin access to trusted networks or VPNs only.

If you are unsure whether something is a security issue or just a bug, feel free to err on the side of caution and contact us.

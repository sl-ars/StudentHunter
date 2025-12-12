# Contributing to StudentHunter

Thank you for your interest in contributing to StudentHunter!  
This project aims to help students find internships and first jobs, so every contribution that improves stability, usability, or accessibility is highly appreciated.

## Ways to Contribute

- Report bugs and issues.
- Suggest new features or improvements.
- Improve documentation and examples.
- Work on open issues labeled as good first issue or help wanted.

## How to Get Started

1. **Fork the repository** on GitHub and clone your fork locally.
2. **Create a feature branch** based on `main`:

   ```bash
   git checkout -b feature/my-change
   ```

3. **Set up the project locally** following the instructions in `README.md`.
4. **Make your changes** in small, focused commits.
5. **Run tests** (if configured):

   ```bash
   # backend tests
   python manage.py test

   # frontend tests (if available)
   cd frontend
   npm test
   ```

6. **Push your branch** to your fork and open a Pull Request (PR) against the `main` branch of the main repository.

## Issues

- Before creating a new issue, please search existing issues to avoid duplicates.
- Use a clear title and include:
  - Steps to reproduce (for bugs).
  - Expected vs. actual behavior.
  - Environment details (OS, Python/Node versions, etc.).
- For feature requests, describe:
  - The problem you are trying to solve.
  - Why this feature is useful for students/employers.
  - Any alternative solutions you considered.

## Pull Requests

- Keep PRs as small and focused as possible.
- Describe the problem and the solution in the PR description.
- Reference related issues using keywords like `Closes #123`.
- Make sure your changes follow existing code style and structure.
- Be ready to respond to review comments and update your PR.

## Code Style

- **Backend (Python/Django)**:
  - Follow PEP 8 where possible.
  - Use meaningful names and keep functions/classes small and focused.
- **Frontend (JavaScript/TypeScript/React)**:
  - Prefer functional components and hooks.
  - Keep components small and reusable.
  - Use a linter/formatter if configured (e.g., ESLint, Prettier).

## Communication

By participating in this project, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).  
If you have questions about how to contribute, feel free to open a discussion or a draft PR and ask.

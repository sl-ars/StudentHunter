# DPG Self-Assessment

Project Name: StudentHunter  
Repository: https://github.com/sl-ars/StudentHunter

---

## Criterion 1: Relevant to SDGs

Justification: StudentHunter directly supports **SDG 4: Quality Education** by helping students connect their studies with real-world internships and learning opportunities. It also contributes to **SDG 8: Decent Work and Economic Growth** by improving access to early-career jobs and making it easier for employers to discover young talent. By centralizing opportunities and simplifying applications, the platform reduces friction in the transition from education to work.

## Criterion 2: Open Source License

Justification: StudentHunter is released under an open source license that allows free use, modification, and redistribution of the code (for example, the MIT or Apache 2.0 license). The full license text is included in the root of the repository as [`LICENSE`](../LICENSE), making it clear to all users and deployers what the rights and obligations are. This ensures that StudentHunter can be reused and adapted by universities, NGOs, and other organizations.

## Criterion 3: Clear Ownership

Justification: The project is maintained by the StudentHunter student team, as described in [`GOVERNANCE.md`](../GOVERNANCE.md) and the repository’s README. Ownership and maintenance responsibilities are transparent: the GitHub organization and contributor list show who is involved, and governance rules describe how decisions are made. This clarity helps potential adopters and contributors understand who to contact and how to engage with the project.

## Criterion 4: Platform Independence

Justification: StudentHunter is built using widely available open technologies (Django, Django REST Framework, React, PostgreSQL) and can be deployed on any standard infrastructure, including self-hosted servers, generic cloud providers, and container platforms. The recommended deployment setup (e.g., Docker, AWS, or equivalent) is described in the README, but the project is not locked to any single proprietary platform. This allows organizations in different countries and with different infrastructure constraints to host the platform independently.

## Criterion 5: Documentation

Justification: The main documentation is provided in [`README.md`](../README.md), which explains what the project does, how to install it, and how to use the basic features. Additional documents, such as [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`GOVERNANCE.md`](../GOVERNANCE.md), and this self-assessment, help newcomers understand how to contribute and how the project is structured. Together, these documents meet the standard for user and contributor guides and can be expanded as the project evolves.

## Criterion 6: Non-Discrimination & Do No Harm

Justification: StudentHunter is designed to support students from diverse backgrounds and does not target or exclude any group based on protected characteristics. The [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) explicitly commits the community to non-discrimination, respectful interaction, and a zero-tolerance policy towards harassment. The project’s goal is to expand access to opportunities and avoid misuse (for example, by moderating content via the admin panel and responding to reports of abuse).

## Criterion 7: Privacy and Data Security

Justification: StudentHunter handles personal data such as student profiles, resumes, and employer contacts, and intends to do so responsibly, as described in [`PRIVACY.md`](../PRIVACY.md). The project recommends using secure password hashing, environment variables for secrets, HTTPS for all traffic, and encrypted storage at the infrastructure level. Logs are configured to avoid storing sensitive fields, and users are given a way to request deletion of their data, aligning with good privacy and data protection practices.

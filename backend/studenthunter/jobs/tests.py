# You can add tests here for the jobs application
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Job
from users.models import CustomUser

User = get_user_model()

class JobModelTests(TestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            email='employer@example.com',
            name='Employer User',
            password='testpass123',
            role='employer'
        )
        self.job_data = {
            'title': 'Software Engineer',
            'company': 'Test Company',
            'company_id': '123',
            'location': 'Remote',
            'type': 'Full-time',
            'salary': '$100,000 - $150,000',
            'description': 'Test job description',
            'requirements': ['Python', 'Django'],
            'responsibilities': ['Develop web applications', 'Write tests'],
            'benefits': ['Health insurance', '401k'],
            'industry': 'Technology',
            'created_by': self.employer
        }

    def test_job_creation(self):
        job = Job.objects.create(**self.job_data)
        self.assertEqual(job.title, self.job_data['title'])
        self.assertEqual(job.company, self.job_data['company'])
        self.assertEqual(job.location, self.job_data['location'])
        self.assertEqual(job.type, self.job_data['type'])
        self.assertEqual(job.salary, self.job_data['salary'])
        self.assertEqual(job.description, self.job_data['description'])
        self.assertEqual(job.requirements, self.job_data['requirements'])
        self.assertEqual(job.responsibilities, self.job_data['responsibilities'])
        self.assertEqual(job.benefits, self.job_data['benefits'])
        self.assertEqual(job.industry, self.job_data['industry'])
        self.assertEqual(job.created_by, self.employer)
        self.assertTrue(job.is_active)
        self.assertEqual(job.status, 'active')
        self.assertEqual(job.view_count, 0)
        self.assertEqual(job.application_count, 0)

    def test_job_str_representation(self):
        job = Job.objects.create(**self.job_data)
        self.assertEqual(str(job), self.job_data['title'])

class JobAPITests(APITestCase):
    def setUp(self):
        self.employer = User.objects.create_user(
            email='employer@example.com',
            name='Employer User',
            password='testpass123',
            role='employer'
        )
        self.student = User.objects.create_user(
            email='student@example.com',
            name='Student User',
            password='testpass123',
            role='student'
        )
        self.job_data = {
            'title': 'Software Engineer',
            'company': 'Test Company',
            'company_id': '123',
            'location': 'Remote',
            'type': 'Full-time',
            'salary': '$100,000 - $150,000',
            'description': 'Test job description',
            'requirements': ['Python', 'Django'],
            'responsibilities': ['Develop web applications', 'Write tests'],
            'benefits': ['Health insurance', '401k'],
            'industry': 'Technology'
        }
        self.job = Job.objects.create(**self.job_data, created_by=self.employer)

    def test_create_job_authenticated_employer(self):
        self.client.force_authenticate(user=self.employer)
        response = self.client.post('/api/jobs/', self.job_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(), 2)  # initial job + new job

    def test_create_job_authenticated_student(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/jobs/', self.job_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_job_unauthenticated(self):
        response = self.client.post('/api/jobs/', self.job_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_jobs(self):
        response = self.client.get('/api/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)

    def test_retrieve_job(self):
        response = self.client.get(f'/api/jobs/{self.job.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['title'], self.job.title)

    def test_update_job_authenticated_employer(self):
        self.client.force_authenticate(user=self.employer)
        updated_data = {**self.job_data, 'title': 'Updated Title'}
        response = self.client.patch(f'/api/jobs/{self.job.id}/', updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.job.refresh_from_db()
        self.assertEqual(self.job.title, 'Updated Title')

    def test_update_job_authenticated_student(self):
        self.client.force_authenticate(user=self.student)
        updated_data = {**self.job_data, 'title': 'Updated Title'}
        response = self.client.patch(f'/api/jobs/{self.job.id}/', updated_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_job_authenticated_employer(self):
        self.client.force_authenticate(user=self.employer)
        response = self.client.delete(f'/api/jobs/{self.job.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Job.objects.count(), 0)

    def test_toggle_job_active(self):
        self.client.force_authenticate(user=self.employer)
        response = self.client.post(f'/api/jobs/{self.job.id}/toggle_active/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.job.refresh_from_db()
        self.assertFalse(self.job.is_active)

    def test_employer_jobs_list(self):
        self.client.force_authenticate(user=self.employer)
        response = self.client.get('/api/jobs/employer/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['title'], self.job.title)

    def test_employer_jobs_list_unauthorized(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/jobs/employer/jobs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import StudentProfile, EmployerProfile, CampusProfile, Education, Experience
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

User = get_user_model()

class UserModelTests(TestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'name': 'Test User',
            'password': 'testpass123',
            'role': 'student'
        }

    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.name, self.user_data['name'])
        self.assertEqual(user.role, self.user_data['role'])
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            email='admin@example.com',
            name='Admin User',
            password='adminpass123'
        )
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertEqual(admin_user.role, 'admin')

    def test_user_str_representation(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(str(user), f"{user.email} ({user.role})")

class StudentProfileTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='student@example.com',
            name='Student User',
            password='testpass123',
            role='student'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.user,
            bio='Test bio',
            skills=['Python', 'Django']
        )

    def test_student_profile_creation(self):
        self.assertEqual(self.student_profile.user, self.user)
        self.assertEqual(self.student_profile.bio, 'Test bio')
        self.assertEqual(self.student_profile.skills, ['Python', 'Django'])

    def test_student_profile_str_representation(self):
        self.assertEqual(str(self.student_profile), f"Student Profile: {self.user.email}")

    def test_education_creation(self):
        education = Education.objects.create(
            student=self.student_profile,
            university='Test University',
            degree='Bachelor of Science',
            field='Computer Science',
            start_date='2020-09-01',
            end_date='2024-05-01',
            gpa='3.8'
        )
        self.assertEqual(education.student, self.student_profile)
        self.assertEqual(education.university, 'Test University')

    def test_experience_creation(self):
        experience = Experience.objects.create(
            student=self.student_profile,
            company='Test Company',
            position='Software Engineer',
            start_date='2023-06-01',
            end_date='2023-08-31',
            current=False,
            description='Test description'
        )
        self.assertEqual(experience.student, self.student_profile)
        self.assertEqual(experience.company, 'Test Company')

class EmployerProfileTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='employer@example.com',
            name='Employer User',
            password='testpass123',
            role='employer'
        )
        self.employer_profile = EmployerProfile.objects.create(
            user=self.user,
            company_name='Test Company',
            industry='Technology',
            website='https://testcompany.com',
            description='Test company description'
        )

    def test_employer_profile_creation(self):
        self.assertEqual(self.employer_profile.user, self.user)
        self.assertEqual(self.employer_profile.company_name, 'Test Company')
        self.assertEqual(self.employer_profile.industry, 'Technology')

    def test_employer_profile_str_representation(self):
        self.assertEqual(str(self.employer_profile), f"Employer: {self.employer_profile.company_name}")

class CampusProfileTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='campus@example.com',
            name='Campus User',
            password='testpass123',
            role='campus'
        )
        self.campus_profile = CampusProfile.objects.create(
            user=self.user,
            university='Test University',
            department='Computer Science',
            position='Career Advisor'
        )

    def test_campus_profile_creation(self):
        self.assertEqual(self.campus_profile.user, self.user)
        self.assertEqual(self.campus_profile.university, 'Test University')
        self.assertEqual(self.campus_profile.department, 'Computer Science')

    def test_campus_profile_str_representation(self):
        self.assertEqual(str(self.campus_profile), f"Campus: {self.campus_profile.university}")

class UserAPITests(APITestCase):
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'name': 'Test User',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': 'student'
        }
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            name='Admin User',
            password='adminpass123'
        )

    def test_user_registration(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/users/register/', self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)  # admin + new user

    def test_user_registration_unauthorized(self):
        response = self.client.post('/api/users/register/', self.user_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_login(self):
        user = User.objects.create_user(**self.user_data)
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post('/api/token/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

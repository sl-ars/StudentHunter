from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import StudentProfile, EmployerProfile, CampusProfile, Education, Experience, Resume
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
import os

User = get_user_model()

# Helper function to create a dummy image file for uploads
def create_dummy_image(name="test_image.png", content_type="image/png", size=1024):
    return SimpleUploadedFile(name, b"0" * size, content_type=content_type)

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
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            name='Admin User',
            password='adminpass123'
        )
        cls.student_data_for_creation = {
            'email': 'teststudent@example.com',
            'name': 'Test Student',
            'password': 'studentpass123',
            'password2': 'studentpass123',
            'role': 'student'
        }
        cls.campus_user_data_for_creation = {
            'email': 'campus@example.com',
            'name': 'Campus Head',
            'password': 'campuspass123',
            'password2': 'campuspass123',
            'role': 'campus'
        }
        cls.employer_user_data_for_creation = {
            'email': 'employer@example.com',
            'name': 'Employer Recruiter',
            'password': 'employerpass123',
            'password2': 'employerpass123',
            'role': 'employer'
        }

    def test_user_registration_by_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(reverse('user-register-list'), self.student_data_for_creation)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(User.objects.count(), 2)  # admin + new student
        created_user = User.objects.get(email=self.student_data_for_creation['email'])
        self.assertEqual(created_user.role, 'student')

    def test_register_student_by_campus_user(self):
        campus_user = User.objects.create_user(**{
            k: v for k, v in self.campus_user_data_for_creation.items() if k != 'password2'
        })
        self.client.force_authenticate(user=campus_user)
        student_data = {
            'email': 'newstudent@campus.com',
            'name': 'New Student by Campus',
            'password': 'newpass123',
            'password2': 'newpass123',
            'role': 'student'
        }
        response = self.client.post(reverse('user-register-list'), student_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(User.objects.filter(email=student_data['email']).exists())

    def test_register_fail_student_creates_student(self):
        student_user = User.objects.create_user(**{
            k:v for k,v in self.student_data_for_creation.items() if k != 'password2'
        })
        self.client.force_authenticate(user=student_user)
        another_student_data = {
            'email': 'anotherstudent@example.com',
            'name': 'Another Student',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': 'student'
        }
        response = self.client.post(reverse('user-register-list'), another_student_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, response.data)

    def test_register_fail_campus_creates_employer(self):
        campus_user = User.objects.create_user(**{
            k: v for k, v in self.campus_user_data_for_creation.items() if k != 'password2'
        })
        self.client.force_authenticate(user=campus_user)
        response = self.client.post(reverse('user-register-list'), self.employer_user_data_for_creation)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, response.data)

    def test_user_registration_unauthorized(self):
        response = self.client.post(reverse('user-register-list'), self.student_data_for_creation)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_login_and_token_structure(self):
        user = User.objects.create_user(**{
            k:v for k,v in self.student_data_for_creation.items() if k != 'password2'
        })
        login_data = {
            'email': self.student_data_for_creation['email'],
            'password': self.student_data_for_creation['password']
        }
        response = self.client.post(reverse('token_obtain_pair'), login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])
        self.assertIn('user', response.data['data'])
        self.assertEqual(response.data['data']['user']['email'], user.email)

    def test_token_refresh(self):
        User.objects.create_user(**{
            k:v for k,v in self.student_data_for_creation.items() if k != 'password2'
        })
        login_data = {
            'email': self.student_data_for_creation['email'],
            'password': self.student_data_for_creation['password']
        }
        login_response = self.client.post(reverse('token_obtain_pair'), login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        refresh_token = login_response.data['data']['refresh']

        refresh_response = self.client.post(reverse('token_refresh'), {'refresh': refresh_token})
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK, refresh_response.data)
        self.assertIn('access', refresh_response.data['data'])

    def test_token_verify_valid(self):
        User.objects.create_user(**{
            k:v for k,v in self.student_data_for_creation.items() if k != 'password2'
        })
        login_data = {
            'email': self.student_data_for_creation['email'],
            'password': self.student_data_for_creation['password']
        }
        login_response = self.client.post(reverse('token_obtain_pair'), login_data)
        access_token = login_response.data['data']['access']

        verify_response = self.client.post(reverse('token_verify'), {'token': access_token})
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK, verify_response.data)
        self.assertTrue(verify_response.data['data']['isValid'])
        self.assertEqual(verify_response.data['data']['user']['email'], self.student_data_for_creation['email'])

    def test_token_verify_invalid(self):
        verify_response = self.client.post(reverse('token_verify'), {'token': 'invalidtoken'})
        self.assertEqual(verify_response.status_code, status.HTTP_401_UNAUTHORIZED) # Based on SimpleJWT default
        # Or if your custom TokenVerifySerializer now returns 400 for validation errors:
        # self.assertEqual(verify_response.status_code, status.HTTP_400_BAD_REQUEST, verify_response.data)
        # self.assertFalse(verify_response.data['isValid']) # if it still returns a body on validation error

    def test_logout_view(self):
        User.objects.create_user(**{
             k:v for k,v in self.student_data_for_creation.items() if k != 'password2'
        })
        login_data = {
            'email': self.student_data_for_creation['email'],
            'password': self.student_data_for_creation['password']
        }
        login_response = self.client.post(reverse('token_obtain_pair'), login_data)
        access_token = login_response.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        logout_response = self.client.post(reverse('logout'))
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK, logout_response.data)
        self.assertEqual(logout_response.data['message'], "Logged out (client-side only)")

class ProfileAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = User.objects.create_superuser(
            email='admin_profile@example.com', name='Admin Prof', password='adminpass123'
        )
        # Student
        cls.student_user = User.objects.create_user(
            email='student_profile@example.com', name='Student Prof', password='studentpass123', role='student'
        )
        cls.student_profile = StudentProfile.objects.create(user=cls.student_user, bio='Student bio')
        # Employer
        cls.employer_user = User.objects.create_user(
            email='employer_profile@example.com', name='Employer Prof', password='employerpass123', role='employer'
        )
        cls.employer_profile = EmployerProfile.objects.create(user=cls.employer_user, company_name='TestCorp')
        # Campus
        cls.campus_user = User.objects.create_user(
            email='campus_profile@example.com', name='Campus Prof', password='campuspass123', role='campus'
        )
        cls.campus_profile = CampusProfile.objects.create(user=cls.campus_user, university='TestUni')

    def _login_user(self, email, password):
        response = self.client.post(reverse('token_obtain_pair'), {'email': email, 'password': password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data['data']['access']

    def test_get_my_student_profile(self):
        token = self._login_user('student_profile@example.com', 'studentpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('profile-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['email'], self.student_user.email)
        self.assertIn('bio', response.data['data'])

    def test_get_my_employer_profile(self):
        token = self._login_user('employer_profile@example.com', 'employerpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('profile-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['email'], self.employer_user.email)
        self.assertIn('company_name', response.data['data'])

    def test_get_my_admin_profile(self):
        token = self._login_user('admin_profile@example.com', 'adminpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('profile-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['email'], self.admin_user.email)
        self.assertEqual(response.data['data']['role'], 'admin')

    def test_update_my_student_profile_data(self):
        token = self._login_user('student_profile@example.com', 'studentpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        update_data = {
            'name': 'Updated Student Name',
            'bio': 'Updated student bio',
            'skills': ['JavaScript', 'React']
        }
        response = self.client.patch(reverse('profile-me'), update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.student_user.refresh_from_db()
        self.student_profile.refresh_from_db()
        self.assertEqual(self.student_user.name, 'Updated Student Name')
        self.assertEqual(self.student_profile.bio, 'Updated student bio')
        self.assertEqual(self.student_profile.skills, ['JavaScript', 'React'])

    def test_update_my_profile_avatar_upload(self):
        token = self._login_user('student_profile@example.com', 'studentpass123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        avatar = create_dummy_image()
        response = self.client.patch(reverse('profile-me'), {'avatar': avatar}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.student_user.refresh_from_db()
        self.assertIsNotNone(self.student_user.avatar)
        self.assertTrue(self.student_user.avatar.url.endswith('test_image.png'))
        # Test clearing avatar
        response_clear = self.client.patch(reverse('profile-me'), {'avatar': ''}, format='multipart') # or None with json
        self.assertEqual(response_clear.status_code, status.HTTP_200_OK, response_clear.data)
        self.student_user.refresh_from_db()
        self.assertEqual(self.student_user.avatar.name, '') # Check if avatar is cleared

    def test_get_public_student_profile(self):
        response = self.client.get(reverse('profile-detail', kwargs={'pk': self.student_user.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['data']['role'], 'student')
        self.assertNotIn('email', response.data['data']) # Public serializer should not expose email by default
        self.assertIn('full_name', response.data['data'])

    def test_get_public_profile_admin_forbidden(self):
        response = self.client.get(reverse('profile-detail', kwargs={'pk': self.admin_user.pk}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, response.data)

    def test_get_public_profile_not_found(self):
        response = self.client.get(reverse('profile-detail', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND, response.data)

class ResumeAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.student_user = User.objects.create_user(
            email='resume_student@example.com', name='Resume Student',
            password='resumepass123', role='student'
        )
        cls.student_profile = StudentProfile.objects.create(user=cls.student_user)

        cls.other_user = User.objects.create_user(
            email='other@example.com', name='Other User',
            password='otherpass123', role='employer'
        )

    def _login_student(self):
        response = self.client.post(reverse('token_obtain_pair'), 
                                    {'email': self.student_user.email, 'password': 'resumepass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_list_resumes_empty(self):
        self._login_student()
        response = self.client.get(reverse('resume-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(len(response.data['data']), 0)

    def test_upload_resume_pdf(self):
        self._login_student()
        pdf_file = SimpleUploadedFile("test_resume.pdf", b"dummy pdf content", content_type="application/pdf")
        response = self.client.post(reverse('resume-list'), {'file': pdf_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertIn('id', response.data['data'])
        self.assertTrue(response.data['data']['url'].endswith('test_resume.pdf'))
        self.assertEqual(Resume.objects.count(), 1)

    def test_upload_resume_no_file(self):
        self._login_student()
        response = self.client.post(reverse('resume-list'), {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        self.assertIn('file', response.data['errors'])

    def test_upload_resume_invalid_file_type(self):
        self._login_student()
        txt_file = SimpleUploadedFile("test.txt", b"text content", content_type="text/plain")
        response = self.client.post(reverse('resume-list'), {'file': txt_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, response.data)
        self.assertIn('file', response.data['errors'])

    def test_delete_resume(self):
        self._login_student()
        pdf_file = SimpleUploadedFile("test_resume_to_delete.pdf", b"dummy content", content_type="application/pdf")
        upload_response = self.client.post(reverse('resume-list'), {'file': pdf_file}, format='multipart')
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        resume_id = upload_response.data['data']['id']
        
        delete_response = self.client.delete(reverse('resume-detail', kwargs={'pk': resume_id}))
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK, delete_response.data)
        self.assertEqual(Resume.objects.count(), 0)

    def test_get_resume_download_url(self):
        self._login_student()
        pdf_file = SimpleUploadedFile("test_resume_url.pdf", b"dummy content", content_type="application/pdf")
        upload_response = self.client.post(reverse('resume-list'), {'file': pdf_file}, format='multipart')
        resume_id = upload_response.data['data']['id']

        url_response = self.client.get(reverse('resume-get-url', kwargs={'pk': resume_id}))
        self.assertEqual(url_response.status_code, status.HTTP_200_OK, url_response.data)
        self.assertTrue(url_response.data['data']['url'])

    def test_resume_access_by_non_student_owner(self):
        # Login as student, upload resume
        self._login_student()
        pdf_file = SimpleUploadedFile("owned_resume.pdf", b"content", content_type="application/pdf")
        upload_resp = self.client.post(reverse('resume-list'), {'file': pdf_file}, format='multipart')
        resume_id = upload_resp.data['data']['id']
        self.client.logout() # Logout student

        # Login as other user (employer)
        other_token_resp = self.client.post(reverse('token_obtain_pair'), 
                                    {'email': self.other_user.email, 'password': 'otherpass123'})
        other_token = other_token_resp.data['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {other_token}')

        # Try to list resumes (should be empty for this employer)
        list_resp = self.client.get(reverse('resume-list'))
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data['data']), 0)

        # Try to delete student's resume (should fail)
        delete_resp = self.client.delete(reverse('resume-detail', kwargs={'pk': resume_id}))
        self.assertEqual(delete_resp.status_code, status.HTTP_404_NOT_FOUND) # get_object based on queryset for request.user

        # Try to get URL of student's resume (should fail)
        url_resp = self.client.get(reverse('resume-get-url', kwargs={'pk': resume_id}))
        self.assertEqual(url_resp.status_code, status.HTTP_404_NOT_FOUND)

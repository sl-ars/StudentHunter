from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from companies.models import Company
from companies.serializers import CompanySerializer
from users.models import EmployerProfile

@extend_schema(tags=['companies'])
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = (filters.OrderingFilter, filters.SearchFilter)
    search_fields = ['name', 'industry', 'location']

    @extend_schema(
        summary="Verify a Company",
        description="Marks a company as verified.",
        request=None,
        responses={
            200: {'type': 'object', 'properties': {'status': {'type': 'string', 'example': 'verified'}}},
            404: {'description': 'Company not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.verified = True
        company.save()
        return Response({'status': 'verified'})

    @extend_schema(
        summary="Upload Company Logo",
        description="Uploads a logo for the specified company.",
        request={
            'multipart/form-data': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'logo': {'type': 'string', 'format': 'binary'}
                    },
                    'required': ['logo']
                }
            }
        },
        responses={
            200: {'type': 'object', 'properties': {'status': {'type': 'string'}, 'url': {'type': 'string', 'format': 'url'}}},
            400: {'description': 'No logo uploaded.'},
            404: {'description': 'Company not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def upload_logo(self, request, pk=None):
        company = self.get_object()
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()
            return Response({'status': 'logo uploaded', 'url': company.logo.url})
        return Response({'status': 'no logo uploaded'}, status=400)
        
    @extend_schema(
        summary="Get Employer Company Profile",
        description="Retrieves the company profile for the logged-in employer",
        responses={
            200: CompanySerializer,
            404: {'description': 'Company not found for this employer.'}
        }
    )
    @action(detail=False, methods=['get'], url_path='employer/company', permission_classes=[IsAuthenticated])
    def employer_company(self, request):
        # Get employer profile for this user
        try:
            employer_profile = EmployerProfile.objects.get(user=request.user)
            
            # Check if employer has a company
            if employer_profile.company:
                company = employer_profile.company
                serializer = self.get_serializer(company)
                
                # Return the serialized data directly as it now includes all needed fields
                return Response({
                    'status': 'success',
                    'message': 'Company profile retrieved successfully',
                    'data': serializer.data
                })
            
            # If no company exists, return a default profile
            return Response({
                'status': 'success',
                'message': 'No company exists for this employer',
                'data': {
                    'id': '',
                    'name': '',
                    'company_name': '',
                    'description': '',
                    'website': '',
                    'industry': '',
                    'location': '',
                    'company': '',
                    'company_id': ''
                }
            })
            
        except EmployerProfile.DoesNotExist:
            # Create a default employer profile if it doesn't exist
            employer_profile = EmployerProfile.objects.create(user=request.user)
            
            return Response({
                'status': 'success',
                'message': 'Employer profile created, no company exists yet',
                'data': {
                    'id': '',
                    'name': '',
                    'company_name': '',
                    'description': '',
                    'website': '',
                    'industry': '',
                    'location': '',
                    'company': '',
                    'company_id': ''
                }
            })
        
    @extend_schema(
        summary="Update Employer Company Profile",
        description="Updates the company profile for the logged-in employer",
        request=CompanySerializer,
        responses={
            200: {'type': 'object', 'properties': {'status': {'type': 'string'}, 'message': {'type': 'string'}, 'data': {'type': 'object'}}},
            400: {'description': 'Invalid data provided.'},
            404: {'description': 'Employer profile not found.'}
        }
    )
    @action(detail=False, methods=['put', 'patch'], url_path='employer/company', permission_classes=[IsAuthenticated])
    def update_employer_company(self, request):
        try:
            # Get employer profile for this user
            employer_profile = EmployerProfile.objects.get(user=request.user)
            
            # Log request data for debugging
            print(f"Received data for company profile update: {request.data}")
            
            # Extract data from request
            company_name = request.data.get('company_name', '')
            industry = request.data.get('industry', '')
            website = request.data.get('website', '')
            description = request.data.get('description', '')
            location = request.data.get('location', '')
            
            print(f"Extracted fields - name: {company_name}, industry: {industry}, website: {website}")
            
            # Check if employer has a company
            if employer_profile.company:
                # Update existing company
                company = employer_profile.company
                print(f"Updating existing company: {company.name} (ID: {company.id})")
                company.name = company_name
                company.industry = industry
                company.website = website
                company.description = description
                company.location = location
                company.save()
                print(f"Company updated: {company.name}")
            else:
                # Create new company
                print(f"Creating new company: {company_name}")
                company = Company.objects.create(
                    name=company_name,
                    industry=industry,
                    website=website,
                    description=description,
                    location=location or '',
                    verified=False,
                    featured=False
                )
                employer_profile.company = company
                employer_profile.save()
                print(f"New company created with ID: {company.id}")
                
                # Update any existing jobs with the same company name
                try:
                    from jobs.models import Job
                    existing_jobs = Job.objects.filter(company=company_name)
                    print(f"Found {existing_jobs.count()} existing jobs to update with new company ID")
                    
                    for job in existing_jobs:
                        job.company_id = str(company.id)
                        job.save()
                        print(f"Updated job: {job.id} - {job.title} with company ID: {company.id}")
                except Exception as e:
                    print(f"Error updating existing jobs for new company: {str(e)}")
            
            # Update user's company info for consistency
            user = request.user
            user.company = company_name
            user.company_id = str(company.id)
            user.save()
            print(f"User company info updated: {user.company} (ID: {user.company_id})")
            
            # Return response with serialized company data
            serializer = self.get_serializer(company)
            
            return Response({
                'status': 'success',
                'message': 'Company profile updated successfully',
                'data': serializer.data
            })
            
        except EmployerProfile.DoesNotExist:
            # Create a default employer profile and company
            employer_profile = EmployerProfile.objects.create(user=request.user)
            
            company_name = request.data.get('company_name', '')
            industry = request.data.get('industry', '')
            website = request.data.get('website', '')
            description = request.data.get('description', '')
            location = request.data.get('location', '')
            
            company = Company.objects.create(
                name=company_name,
                industry=industry,
                website=website,
                description=description,
                location=location or '',
                verified=False,
                featured=False
            )
            
            employer_profile.company = company
            employer_profile.save()
            
            # Update user's company info
            user = request.user
            user.company = company_name
            user.company_id = str(company.id)
            user.save()
            
            # Prepare response
            serializer = self.get_serializer(company)
            
            return Response({
                'status': 'success',
                'message': 'Company profile created successfully',
                'data': serializer.data
            })
        
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error updating company profile: {str(e)}',
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Create or Update Employer Company Profile via POST",
        description="Creates or updates the company profile for the logged-in employer via POST",
        request=CompanySerializer,
        responses={
            200: {'type': 'object', 'properties': {'status': {'type': 'string'}, 'message': {'type': 'string'}, 'data': {'type': 'object'}}},
            400: {'description': 'Invalid data provided.'},
            404: {'description': 'Employer profile not found.'}
        }
    )
    @action(detail=False, methods=['post'], url_path='employer/update', permission_classes=[IsAuthenticated])
    def post_employer_company(self, request):
        """
        POST метод для создания/обновления профиля компании работодателя
        """
        try:
            # Get employer profile for this user
            employer_profile = EmployerProfile.objects.get(user=request.user)
            
            # Log request data for debugging
            print(f"Received data for company profile update via POST: {request.data}")
            
            # Extract data from request
            company_name = request.data.get('company_name', '')
            industry = request.data.get('industry', '')
            website = request.data.get('website', '')
            description = request.data.get('description', '')
            location = request.data.get('location', '')
            
            print(f"Extracted fields - name: {company_name}, industry: {industry}, website: {website}")
            
            # Check if employer has a company
            if employer_profile.company:
                # Update existing company
                company = employer_profile.company
                print(f"Updating existing company: {company.name} (ID: {company.id})")
                
                # Store old name for updating related jobs
                old_company_name = company.name
                
                company.name = company_name
                company.industry = industry
                company.website = website
                company.description = description
                company.location = location or ''
                company.save()
                print(f"Company updated: {company.name}")
                
                # Update all jobs associated with this company
                from jobs.models import Job
                try:
                    # Update all jobs that belong to this company
                    company_jobs = Job.objects.filter(company_id=str(company.id))
                    print(f"Found {company_jobs.count()} jobs to update for this company")
                    
                    for job in company_jobs:
                        job.company = company_name
                        job.save()
                        print(f"Updated job: {job.id} - {job.title} with new company name: {company_name}")
                        
                    # Also update any jobs that might have the old company name but not the ID
                    other_company_jobs = Job.objects.filter(company=old_company_name)
                    print(f"Found {other_company_jobs.count()} additional jobs with old company name")
                    
                    for job in other_company_jobs:
                        job.company = company_name
                        job.company_id = str(company.id)
                        job.save()
                        print(f"Updated job with old company name: {job.id} - {job.title}")
                except Exception as e:
                    print(f"Error updating jobs: {str(e)}")
            else:
                # Create new company
                print(f"Creating new company: {company_name}")
                company = Company.objects.create(
                    name=company_name,
                    industry=industry,
                    website=website,
                    description=description,
                    location=location or '',
                    verified=False,
                    featured=False
                )
                employer_profile.company = company
                employer_profile.save()
                print(f"New company created with ID: {company.id}")
            
            # Update user's company info for consistency
            user = request.user
            user.company = company_name
            user.company_id = str(company.id)
            user.save()
            print(f"User company info updated: {user.company} (ID: {user.company_id})")
            
            # Check if user has other connected profiles and update them too
            try:
                from users.models import CustomUser
                # Update all users with the same company ID
                related_users = CustomUser.objects.filter(company_id=str(company.id)).exclude(id=user.id)
                print(f"Found {related_users.count()} related users to update")
                
                for related_user in related_users:
                    related_user.company = company_name
                    related_user.save()
                    print(f"Updated user: {related_user.email} with new company name")
            except Exception as e:
                print(f"Error updating related users: {str(e)}")
            
            # Return response with serialized company data
            serializer = self.get_serializer(company)
            
            return Response({
                'status': 'success',
                'message': 'Company profile and all related data updated successfully',
                'data': serializer.data
            })
            
        except EmployerProfile.DoesNotExist:
            # Create a default employer profile and company
            employer_profile = EmployerProfile.objects.create(user=request.user)
            
            company_name = request.data.get('company_name', '')
            industry = request.data.get('industry', '')
            website = request.data.get('website', '')
            description = request.data.get('description', '')
            location = request.data.get('location', '')
            
            company = Company.objects.create(
                name=company_name,
                industry=industry,
                website=website,
                description=description,
                location=location or '',
                verified=False,
                featured=False
            )
            
            employer_profile.company = company
            employer_profile.save()
            
            # Update user's company info
            user = request.user
            user.company = company_name
            user.company_id = str(company.id)
            user.save()
            
            # Prepare response
            serializer = self.get_serializer(company)
            
            return Response({
                'status': 'success',
                'message': 'Company profile created successfully via POST',
                'data': serializer.data
            })
        
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error updating company profile via POST: {str(e)}',
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(summary="List all companies")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Create a new company")
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Retrieve a company by ID")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Update a company by ID")
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Partially update a company by ID")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Delete a company by ID")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

# Добавляем простую функцию для обновления профиля компании
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def employer_company_update(request):
    """
    Обновление профиля компании работодателя через POST запрос.
    Принимает те же данные, что и метод update_employer_company.
    """
    try:
        # Получаем профиль работодателя
        employer_profile = EmployerProfile.objects.get(user=request.user)
        
        print(f"Received data for company profile update via POST: {request.data}")
        
        # Извлекаем данные из запроса
        company_name = request.data.get('company_name', '')
        industry = request.data.get('industry', '')
        website = request.data.get('website', '')
        description = request.data.get('description', '')
        location = request.data.get('location', '')
        
        print(f"Extracted fields - name: {company_name}, industry: {industry}, website: {website}")
        
        # Проверяем, есть ли у работодателя компания
        if employer_profile.company:
            # Обновляем существующую компанию
            company = employer_profile.company
            print(f"Updating existing company: {company.name} (ID: {company.id})")
            company.name = company_name
            company.industry = industry
            company.website = website
            company.description = description
            company.location = location or ''
            company.save()
            print(f"Company updated: {company.name}")
        else:
            # Создаем новую компанию
            print(f"Creating new company: {company_name}")
            company = Company.objects.create(
                name=company_name,
                industry=industry,
                website=website,
                description=description,
                location=location or '',
                verified=False,
                featured=False
            )
            employer_profile.company = company
            employer_profile.save()
            print(f"New company created with ID: {company.id}")
        
        # Обновляем информацию о компании пользователя
        user = request.user
        user.company = company_name
        user.company_id = str(company.id)
        user.save()
        print(f"User company info updated: {user.company} (ID: {user.company_id})")
        
        # Сериализуем данные компании для ответа
        serializer = CompanySerializer(company)
        
        return Response({
            'status': 'success',
            'message': 'Company profile updated successfully via POST',
            'data': serializer.data
        })
        
    except EmployerProfile.DoesNotExist:
        # Создаем профиль работодателя по умолчанию, если он не существует
        employer_profile = EmployerProfile.objects.create(user=request.user)
        
        company_name = request.data.get('company_name', '')
        industry = request.data.get('industry', '')
        website = request.data.get('website', '')
        description = request.data.get('description', '')
        location = request.data.get('location', '')
        
        company = Company.objects.create(
            name=company_name,
            industry=industry,
            website=website,
            description=description,
            location=location or '',
            verified=False,
            featured=False
        )
        
        employer_profile.company = company
        employer_profile.save()
        
        # Обновляем информацию о компании пользователя
        user = request.user
        user.company = company_name
        user.company_id = str(company.id)
        user.save()
        
        # Сериализуем данные компании для ответа
        serializer = CompanySerializer(company)
        
        return Response({
            'status': 'success',
            'message': 'Company profile created successfully via POST',
            'data': serializer.data
        })
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error updating company profile via POST: {str(e)}',
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)

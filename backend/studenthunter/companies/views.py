from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Company
from .serializers import CompanySerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = (filters.OrderingFilter, filters.SearchFilter)
    search_fields = ['name', 'industry', 'location']

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        company = self.get_object()
        company.verified = True
        company.save()
        return Response({'status': 'verified'})

    @action(detail=True, methods=['post'])
    def upload_logo(self, request, pk=None):
        company = self.get_object()
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
            company.save()
            return Response({'status': 'logo uploaded', 'url': company.logo.url})
        return Response({'status': 'no logo uploaded'}, status=400)

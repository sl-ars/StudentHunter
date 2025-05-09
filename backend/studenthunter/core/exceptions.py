from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError
from django.http import Http404
from django.core.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler to wrap all API error responses using status: string.
    """
    response = exception_handler(exc, context)

    # If DRF couldn't handle it, we handle manually
    if response is None:
        if isinstance(exc, Http404):
            detail = "Not found."
            response_code = status.HTTP_404_NOT_FOUND
        elif isinstance(exc, PermissionDenied):
            detail = "Permission denied."
            response_code = status.HTTP_403_FORBIDDEN
        else:
            detail = str(exc) if str(exc) else "A server error occurred."
            response_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        response = Response({'detail': detail}, status=response_code)

    # Build a standardized error response
    error_response = {
        'status': 'error',
        'data': None,
        'error': {
            'message': '',
            'code': '',
        }
    }

    # Determine error details
    if isinstance(exc, ValidationError):
        error_response['error']['message'] = "Validation error."
        error_response['error']['code'] = "validation_error"
        error_response['error']['details'] = response.data
    else:
        message = response.data.get('detail') if isinstance(response.data, dict) else str(response.data)
        error_response['error']['message'] = message or "An error occurred."
        error_response['error']['code'] = getattr(exc, 'default_code', 'error')

    response.data = error_response

    return response
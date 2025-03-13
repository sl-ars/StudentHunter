from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "status": "error",
            "message": str(exc),
            "data": {},
            "errors": response.data
        }
    else:
        response = Response({
            "status": "error",
            "message": "Internal server error",
            "data": {},
            "errors": {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

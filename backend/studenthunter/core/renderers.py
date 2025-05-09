from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    """
    Standardizes API responses to:
    {
        "status": "success" | "fail",
        "message": "OK" | "Error message",
        "data": ...,
        "error": { "code": ..., "details": {...} } or null
    }
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        status_code = getattr(response, 'status_code', 200)

        # If already standardized -> patch missing fields
        if isinstance(data, dict) and "status" in data:
            if "message" not in data:
                data["message"] = "OK" if 200 <= status_code < 300 else "An error occurred"
            if "error" not in data:
                data["error"] = None if 200 <= status_code < 300 else {"code": "error"}
            if "data" not in data:
                data["data"] = None if not 200 <= status_code < 300 else data.get("data")
            return super().render(data, accepted_media_type, renderer_context)

        # Not standardized → build fresh
        is_success = 200 <= status_code < 300

        if is_success:
            standardized = {
                "status": "success",
                "message": "OK",
                "data": data,
                "error": None
            }
        else:
            error_message = "An error occurred"
            error_code = "error"
            error_details = None

            if isinstance(data, dict):
                if "detail" in data:
                    error_message = data.get("detail", "An error occurred")
                    error_code = getattr(data.get("detail"), "code", "error") or "error"
                elif "non_field_errors" in data:
                    error_message = data["non_field_errors"][0]
                    error_code = "validation_error"
                else:
                    error_message = "Validation error"
                    error_code = "validation_error"
                    error_details = data
            elif isinstance(data, str):
                error_message = data
                error_code = "error"

            standardized = {
                "status": "fail",
                "message": error_message,
                "data": None,
                "error": {
                    "code": error_code
                }
            }
            if error_details:
                standardized["error"]["details"] = error_details
            else:
                standardized["error"] = None

        return super().render(standardized, accepted_media_type, renderer_context)
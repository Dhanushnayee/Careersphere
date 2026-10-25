"""
CareerSphere AI — Centralized REST Exception Handling
Phase 1 Foundation
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger("careersphere")


def custom_exception_handler(exc, context):
    """
    Transforms all DRF exceptions into the standard CareerSphere AI error response envelope.
    Ensures no raw internal stack traces leak into client responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "error": {
                "code": getattr(exc, "default_code", "API_ERROR").upper(),
                "message": getattr(exc, "detail", str(exc)),
                "details": response.data if isinstance(response.data, dict) else {"non_field_errors": response.data},
            },
        }
        # In case message is a complex dict/list from DRF serializer errors
        if isinstance(custom_data["error"]["message"], (dict, list)):
            custom_data["error"]["message"] = "Validation failed. Inspect details for individual field errors."
        response.data = custom_data
        return response

    # Unhandled Internal Server Errors
    logger.exception("Unhandled server exception encountered in API view: %s", exc)
    return Response(
        {
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please contact CareerSphere support.",
                "details": {},
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

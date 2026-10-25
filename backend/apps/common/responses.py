"""
CareerSphere AI — Standardized JSON Response Utilities
Phase 1 Foundation
"""
from typing import Any, Dict, Optional
from rest_framework.response import Response
from rest_framework import status


def success_response(
    data: Any = None,
    message: str = "Operation completed successfully.",
    meta: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_200_OK,
) -> Response:
    """Standardized envelope for successful API operations."""
    payload = {
        "success": True,
        "message": message,
        "data": data if data is not None else {},
        "meta": meta or {},
    }
    return Response(payload, status=status_code)


def error_response(
    message: str = "An error occurred while processing the request.",
    code: str = "REQUEST_FAILED",
    details: Any = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> Response:
    """Standardized envelope for erroneous API operations."""
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details if details is not None else {},
        },
    }
    return Response(payload, status=status_code)

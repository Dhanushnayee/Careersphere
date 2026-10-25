"""
CareerSphere AI — AI Copilot Views
Phase 1 Foundation
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class AiCopilotContractView(APIView):
    """
    Exposes the architectural contract and prompt interface for the planned Phase 4 AI Resume Engine.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="AI Resume Copilot Contract & Benchmark Spec")
    def get(self, request):
        return success_response(
            data={
                "copilot": "CareerSphere Resume Intelligence Engine",
                "phase": "Phase 1 Foundation (Full LLM Pipeline scheduled for Phase 4)",
                "target_model": "gemini-2.5-flash",
                "capabilities": [
                    "ATS Parsing & Format Normalization",
                    "Semantic Skill Gap Extraction",
                    "Impact & Quantification Scorer",
                    "Context-Aware Bullet Point Rewriter",
                ],
                "sample_analysis": {
                    "ats_score": 88,
                    "quantification_score": 76,
                    "bullet_relevance_score": 91,
                    "matched_skills": ["Python", "FastAPI / Django", "TypeScript", "PostgreSQL", "Docker"],
                    "missing_skills": ["Vector DBs (Pinecone/Milvus)", "Celery Task Optimization", "K8s Helm"],
                    "key_strengths": [
                        "Demonstrated architectural scope across microservices and async worker queues",
                        "Clean technical stack alignment with modern full-stack development",
                    ],
                    "recommended_improvements": [
                        "Quantify throughput and user volume in recent backend accomplishments",
                        "Include specific latency reduction percentages on database query optimization",
                    ],
                },
            },
            message="AI Copilot schema contract verified.",
        )

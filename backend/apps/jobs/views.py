"""
CareerSphere AI — Job Listing Views
Phase 1 Foundation
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class SampleJobsListView(APIView):
    """
    Returns curated Phase 1 benchmark jobs for candidate and recruiter workspace previews.
    Demonstrates model fields, skill tags, and salary bands.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="Curated Phase 1 Job Listings Benchmark")
    def get(self, request):
        sample_jobs = [
            {
                "id": "job_01",
                "title": "Senior AI Systems Architect",
                "company_name": "Synthetix Dynamics",
                "location": "San Francisco, CA (Remote)",
                "workplace_type": "Remote",
                "employment_type": "Full-time",
                "salary_range": "$175,000 - $220,000",
                "skills_required": ["Python", "PyTorch", "Kubernetes", "Vector Databases", "LangChain"],
                "match_score_demo": 94,
                "applicants_count": 28,
                "posted_days_ago": 2,
                "description": "Lead the engineering of high-throughput generative AI copilots and multi-agent orchestration infrastructure.",
            },
            {
                "id": "job_02",
                "title": "Full-Stack Software Engineer (Python & React)",
                "company_name": "Horizon Cloud Labs",
                "location": "New York, NY (Hybrid)",
                "workplace_type": "Hybrid",
                "employment_type": "Full-time",
                "salary_range": "$140,000 - $175,000",
                "skills_required": ["Django REST Framework", "TypeScript", "React 19", "PostgreSQL", "Docker"],
                "match_score_demo": 88,
                "applicants_count": 42,
                "posted_days_ago": 4,
                "description": "Architect modern distributed web services, RESTful APIs, and responsive enterprise interfaces.",
            },
            {
                "id": "job_03",
                "title": "Machine Learning Operations (MLOps) Lead",
                "company_name": "Vanguard AI Robotics",
                "location": "Austin, TX (Remote)",
                "workplace_type": "Remote",
                "employment_type": "Full-time",
                "salary_range": "$160,000 - $205,000",
                "skills_required": ["MLflow", "Terraform", "CI/CD", "AWS SageMaker", "Python"],
                "match_score_demo": 82,
                "applicants_count": 19,
                "posted_days_ago": 6,
                "description": "Scale model training pipelines, automated evaluation benchmarks, and low-latency inference serving.",
            },
            {
                "id": "job_04",
                "title": "Principal Product Designer (AI Workspaces)",
                "company_name": "Aetheria Systems",
                "location": "Seattle, WA (Remote)",
                "workplace_type": "Remote",
                "employment_type": "Full-time",
                "salary_range": "$150,000 - $190,000",
                "skills_required": ["Figma", "Design Systems", "User Research", "Frontend Architecture", "Prototyping"],
                "match_score_demo": 78,
                "applicants_count": 35,
                "posted_days_ago": 7,
                "description": "Craft intuitive human-AI collaboration interfaces for next-generation talent acquisition teams.",
            },
        ]
        return success_response(
            data={"jobs": sample_jobs, "count": len(sample_jobs), "is_demo": True},
            message="Curated Phase 1 benchmark jobs retrieved.",
        )

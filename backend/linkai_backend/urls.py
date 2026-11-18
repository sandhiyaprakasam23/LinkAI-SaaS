"""
URL configuration for linkai_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_status_view(request):
    return JsonResponse({
        "project": "LinkAI – Smart URL Intelligence Platform",
        "version": "2.0.0",
        "status": "operational",
        "engine": "Django + DRF + AI Heuristics + Redirection Core",
        "endpoints": {
            "auth": "/api/auth/",
            "links": "/api/links/",
            "analytics": "/api/analytics/",
            "ai": "/api/ai/",
            "automation": "/api/automation/",
            "redirector": "/r/<short_code>/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/status/', api_status_view, name='api-status'),
    path('api/auth/', include('authentication.urls')),
    path('api/links/', include('links.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/ai/', include('ai_engine.urls')),
    path('api/automation/', include('automation.urls')),
    path('r/', include('redirector.urls')),
]

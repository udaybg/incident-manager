"""
URL routing for incidents API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet, IncidentDocumentViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'incidents', IncidentViewSet, basename='incident')
router.register(r'incident-documents', IncidentDocumentViewSet, basename='incident-document')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# GET    /api/v1/incidents/                 - List all incidents (paginated)
# POST   /api/v1/incidents/                 - Create new incident
# GET    /api/v1/incidents/{id}/            - Get specific incident details
# PUT    /api/v1/incidents/{id}/            - Update specific incident
# PATCH  /api/v1/incidents/{id}/            - Partially update specific incident
# DELETE /api/v1/incidents/{id}/            - Delete specific incident
# GET    /api/v1/incidents/statistics/      - Get incident statistics
# GET    /api/v1/incidents/critical/        - Get critical incidents (L5 Medium/High)
# POST   /api/v1/incidents/{id}/update_status/ - Update incident status
# GET    /api/v1/incidents/{id}/timeline/   - Get incident timeline

# GET    /api/v1/incident-documents/        - List all incident documents
# POST   /api/v1/incident-documents/        - Create new incident document
# GET    /api/v1/incident-documents/{id}/   - Get specific document
# PUT    /api/v1/incident-documents/{id}/   - Update specific document
# PATCH  /api/v1/incident-documents/{id}/   - Partially update specific document
# DELETE /api/v1/incident-documents/{id}/   - Delete specific document 
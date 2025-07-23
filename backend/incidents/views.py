"""
Django REST Framework views for incident management API.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet, CharFilter
from django.db.models import Q
from .models import Incident, IncidentDocument, IncidentUpdate
from .serializers import (
    IncidentSerializer, IncidentListSerializer, IncidentCreateSerializer,
    IncidentDocumentSerializer, IncidentUpdateSerializer
)
from .config import VALID_STATUSES


class IncidentFilter(FilterSet):
    """Custom filter for incidents supporting JSONField filtering and multiple value OR logic."""
    
    impacted_locations = CharFilter(method='filter_impacted_locations')
    impacted_parties = CharFilter(method='filter_impacted_parties')
    incident_type = CharFilter(method='filter_incident_type')
    status = CharFilter(method='filter_status')
    level = CharFilter(method='filter_level')
    scope = CharFilter(method='filter_scope')
    detection_source = CharFilter(method='filter_detection_source')
    reporting_org = CharFilter(method='filter_reporting_org')
    incident_commander = CharFilter(method='filter_incident_commander')
    impacted_assets = CharFilter(method='filter_impacted_assets')
    impacted_areas = CharFilter(method='filter_impacted_areas')
    
    class Meta:
        model = Incident
        fields = []  # Custom methods handle all filtering
    
    def filter_impacted_locations(self, queryset, name, value):
        """Filter by impacted locations (JSONField contains)."""
        if not value:
            return queryset
        # Support multiple values separated by comma
        values = [v.strip() for v in value.split(',')]
        q_objects = Q()
        for val in values:
            q_objects |= Q(impacted_locations__contains=[val])
        return queryset.filter(q_objects)
    
    def filter_impacted_parties(self, queryset, name, value):
        """Filter by impacted parties (JSONField contains)."""
        if not value:
            return queryset
        # Support multiple values separated by comma
        values = [v.strip() for v in value.split(',')]
        q_objects = Q()
        for val in values:
            q_objects |= Q(impacted_parties__contains=[val])
        return queryset.filter(q_objects)
    
    def filter_incident_type(self, queryset, name, value):
        """Filter by incident type with OR logic for multiple values."""
        values = self.request.GET.getlist('incident_type')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(incident_type=val)
        return queryset.filter(q_objects)
    
    def filter_status(self, queryset, name, value):
        """Filter by status with OR logic for multiple values."""
        values = self.request.GET.getlist('status')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(status=val)
        return queryset.filter(q_objects)
    
    def filter_level(self, queryset, name, value):
        """Filter by level with OR logic for multiple values."""
        values = self.request.GET.getlist('level')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(level=val)
        return queryset.filter(q_objects)
    
    def filter_scope(self, queryset, name, value):
        """Filter by scope with OR logic for multiple values."""
        values = self.request.GET.getlist('scope')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(scope=val)
        return queryset.filter(q_objects)
    
    def filter_detection_source(self, queryset, name, value):
        """Filter by detection source with OR logic for multiple values."""
        values = self.request.GET.getlist('detection_source')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(detection_source=val)
        return queryset.filter(q_objects)
    
    def filter_reporting_org(self, queryset, name, value):
        """Filter by reporting org with OR logic for multiple values."""
        values = self.request.GET.getlist('reporting_org')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(reporting_org=val)
        return queryset.filter(q_objects)
    
    def filter_incident_commander(self, queryset, name, value):
        """Filter by incident commander with OR logic for multiple values."""
        values = self.request.GET.getlist('incident_commander')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(incident_commander=val)
        return queryset.filter(q_objects)
    
    def filter_impacted_assets(self, queryset, name, value):
        """Filter by impacted assets with OR logic for multiple values."""
        values = self.request.GET.getlist('impacted_assets')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(impacted_assets=val)
        return queryset.filter(q_objects)
    
    def filter_impacted_areas(self, queryset, name, value):
        """Filter by impacted areas with OR logic for multiple values."""
        values = self.request.GET.getlist('impacted_areas')
        if not values:
            return queryset
        q_objects = Q()
        for val in values:
            q_objects |= Q(impacted_areas=val)
        return queryset.filter(q_objects)


class IncidentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing incidents.
    
    Provides CRUD operations for incidents with filtering, searching, and ordering.
    Uses display_id for URL lookups (e.g., /api/incidents/INC-2024-001/).
    """
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = IncidentFilter
    search_fields = ['title', 'description', 'incident_commander', 'reporting_org']
    ordering_fields = ['created_at', 'started_at', 'detected_at', 'level', 'scope']
    ordering = ['-created_at']  # Default ordering
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return IncidentListSerializer
        elif self.action == 'create':
            return IncidentCreateSerializer
        return IncidentSerializer
    
    def perform_create(self, serializer):
        """Set the created_by field when creating an incident."""
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get incident statistics.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total_incidents': queryset.count(),
            'by_level': {
                'L2': queryset.filter(level='L2').count(),
                'L3': queryset.filter(level='L3').count(),
                'L4': queryset.filter(level='L4').count(),
                'L5': queryset.filter(level='L5').count(),
            },
            'by_scope': {
                'Low': queryset.filter(scope='Low').count(),
                'Medium': queryset.filter(scope='Medium').count(),
                'High': queryset.filter(scope='High').count(),
            },
            'by_status': {
                'reported': queryset.filter(status='reported').count(),
                'mitigating': queryset.filter(status='mitigating').count(),
                'resolved': queryset.filter(status='resolved').count(),
                'postmortem': queryset.filter(status='postmortem').count(),
                'closed': queryset.filter(status='closed').count(),
            },
            'l5_high_incidents': queryset.filter(level='L5', scope='High').count(),
            'critical_incidents': queryset.filter(
                Q(level='L5', scope='High') | 
                Q(level='L5', scope='Medium')
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """
        Get critical incidents (L5 Medium/High).
        """
        critical_incidents = self.get_queryset().filter(
            Q(level='L5', scope='High') | 
            Q(level='L5', scope='Medium')
        ).order_by('-created_at')
        
        serializer = IncidentListSerializer(critical_incidents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update incident status.
        """
        incident = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in VALID_STATUSES:
            return Response(
                {'error': 'Invalid status value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        incident.status = new_status
        incident.save()
        
        serializer = self.get_serializer(incident)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """
        Get incident timeline information.
        """
        incident = self.get_object()
        
        timeline = {
            'started_at': incident.started_at,
            'detected_at': incident.detected_at,
            'created_at': incident.created_at,
            'updated_at': incident.updated_at,
            'time_to_detection': None,
            'time_since_started': None,
        }
        
        # Calculate time differences
        if incident.started_at and incident.detected_at:
            timeline['time_to_detection'] = (
                incident.detected_at - incident.started_at
            ).total_seconds()
        
        if incident.started_at:
            from django.utils import timezone
            timeline['time_since_started'] = (
                timezone.now() - incident.started_at
            ).total_seconds()
        
        return Response(timeline)
    
    @action(detail=True, methods=['get', 'post'])
    def updates(self, request, pk=None):
        """
        Get all updates for an incident or create a new update.
        """
        incident = self.get_object()
        
        if request.method == 'GET':
            updates = incident.updates.all()
            serializer = IncidentUpdateSerializer(updates, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create a new update
            serializer = IncidentUpdateSerializer(data=request.data)
            if serializer.is_valid():
                # Set the incident and created_by fields
                serializer.save(
                    incident=incident,
                    created_by=request.user if request.user.is_authenticated else None
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncidentDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing incident documents.
    """
    queryset = IncidentDocument.objects.all()
    serializer_class = IncidentDocumentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['incident']
    search_fields = ['title', 'url']
    ordering = ['created_at'] 
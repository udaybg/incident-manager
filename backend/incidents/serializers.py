"""
Django REST Framework serializers for incident models.
"""
from rest_framework import serializers
from .models import Incident, IncidentDocument, IncidentUpdate
from django.utils.dateparse import parse_datetime
from django.utils import timezone


class IncidentDocumentSerializer(serializers.ModelSerializer):
    """Serializer for IncidentDocument model."""
    
    class Meta:
        model = IncidentDocument
        fields = ['id', 'title', 'url', 'created_at']
        read_only_fields = ['id', 'created_at']


class IncidentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for IncidentUpdate model."""
    
    class Meta:
        model = IncidentUpdate
        fields = ['id', 'content', 'author', 'update_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create an incident update."""
        # The incident will be set in the view based on the URL
        return IncidentUpdate.objects.create(**validated_data)


class IncidentSerializer(serializers.ModelSerializer):
    """Serializer for Incident model."""
    
    documents = IncidentDocumentSerializer(many=True, read_only=True)
    updates = IncidentUpdateSerializer(many=True, read_only=True)
    impacted_locations = serializers.JSONField(required=False, allow_null=True)
    impacted_parties = serializers.JSONField(required=False, allow_null=True)
    
    # Read-only computed fields
    is_l5_high = serializers.ReadOnlyField()
    requires_mitigation_policy = serializers.ReadOnlyField()
    impacted_locations_display = serializers.ReadOnlyField(source='get_impacted_locations_display')
    impacted_parties_display = serializers.ReadOnlyField(source='get_impacted_parties_display')
    
    class Meta:
        model = Incident
        fields = [
            'id', 'title', 'description', 'level', 'scope',
            'safety_compliance', 'security_privacy', 'data_quality', 'psd2_impact',
            'started_at', 'detected_at', 'time_format', 'detection_source',
            'incident_type', 'impacted_locations', 'impacted_parties',
            'incident_commander', 'reporting_org', 'estimated_time_to_mitigation',
            'first_detected_in', 'impacted_assets', 'impacted_areas',
            'additional_subscribers', 'safety_compliance_document_url', 'l5_confirmation',
            'mitigation_policy_acknowledgment', 'send_email_notifications',
            'status', 'created_at', 'updated_at', 'created_by',
            
            # Read-only computed fields
            'documents', 'updates', 'is_l5_high', 'requires_mitigation_policy',
            'impacted_locations_display', 'impacted_parties_display'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by',
            'is_l5_high', 'requires_mitigation_policy'
        ]
    
    def create(self, validated_data):
        """Create incident."""
        # Create the incident
        incident = Incident.objects.create(**validated_data)
        return incident
    
    def update(self, instance, validated_data):
        """Update incident."""
        # Update the incident
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def validate_started_at(self, value):
        """Validate started_at datetime."""
        if not value:
            raise serializers.ValidationError("Started at time is required.")
        return value
    
    def validate_detected_at(self, value):
        """Validate detected_at datetime."""
        if not value:
            raise serializers.ValidationError("Detected at time is required.")
        return value
    
    def validate(self, data):
        """Validate the incident data."""
        # Ensure detected_at is not before started_at
        started_at = data.get('started_at')
        detected_at = data.get('detected_at')
        
        if started_at and detected_at and detected_at < started_at:
            raise serializers.ValidationError({
                'detected_at': 'Detected at time cannot be before started at time.'
            })
        
        # Validate L5 confirmations
        level = data.get('level')
        scope = data.get('scope')
        l5_confirmation = data.get('l5_confirmation', False)
        mitigation_policy_acknowledgment = data.get('mitigation_policy_acknowledgment', False)
        
        if level == 'L5':
            if scope in ['Low', 'Medium', 'High'] and not l5_confirmation:
                raise serializers.ValidationError({
                    'l5_confirmation': 'L5 incident confirmation is required for L5 incidents.'
                })
            
            if scope in ['Medium', 'High'] and not mitigation_policy_acknowledgment:
                raise serializers.ValidationError({
                    'mitigation_policy_acknowledgment': 'Mitigation policy acknowledgment is required for L5 Medium/High incidents.'
                })
        
        return data


class IncidentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for incident list views."""
    
    impacted_locations_display = serializers.ReadOnlyField(source='get_impacted_locations_display')
    impacted_parties_display = serializers.ReadOnlyField(source='get_impacted_parties_display')
    is_l5_high = serializers.ReadOnlyField()
    
    class Meta:
        model = Incident
        fields = [
            'id', 'title', 'description', 'level', 'scope', 'incident_type', 'status',
            'incident_commander', 'started_at', 'created_at', 'updated_at',
            'impacted_locations_display', 'impacted_parties_display',
            'is_l5_high'
        ]


class IncidentCreateSerializer(serializers.ModelSerializer):
    """Specialized serializer for incident creation from React form."""
    
    # Handle datetime fields from React form
    startedAt = serializers.DateTimeField(write_only=True, source='started_at')
    incidentDetectedAt = serializers.DateTimeField(write_only=True, source='detected_at')
    
    # Handle camelCase field names from React
    safetyCompliance = serializers.CharField(write_only=True, source='safety_compliance', required=False, allow_blank=True)
    securityPrivacy = serializers.CharField(write_only=True, source='security_privacy', required=False, allow_blank=True)
    dataQuality = serializers.CharField(write_only=True, source='data_quality', required=False, allow_blank=True)
    psd2Impact = serializers.CharField(write_only=True, source='psd2_impact', required=False, allow_blank=True)
    timeFormat = serializers.CharField(write_only=True, source='time_format', required=False)
    detectionSource = serializers.CharField(write_only=True, source='detection_source', required=False)
    incidentType = serializers.CharField(write_only=True, source='incident_type', required=False)
    impactedLocations = serializers.JSONField(write_only=True, source='impacted_locations', required=False)
    impactedParties = serializers.JSONField(write_only=True, source='impacted_parties', required=False)
    incidentCommander = serializers.EmailField(write_only=True, source='incident_commander', required=False)
    reportingOrg = serializers.CharField(write_only=True, source='reporting_org', required=False)
    estimatedTimeToMitigation = serializers.CharField(write_only=True, source='estimated_time_to_mitigation', required=False, allow_blank=True)
    firstDetectedIn = serializers.CharField(write_only=True, source='first_detected_in', required=False, allow_blank=True)
    impactedAssets = serializers.JSONField(write_only=True, source='impacted_assets', required=False)
    impactedAreas = serializers.JSONField(write_only=True, source='impacted_areas', required=False)
    additionalSubscribers = serializers.CharField(write_only=True, source='additional_subscribers', required=False, allow_blank=True)
    l5Confirmation = serializers.BooleanField(write_only=True, source='l5_confirmation', required=False)
    mitigationPolicyAcknowledgment = serializers.BooleanField(write_only=True, source='mitigation_policy_acknowledgment', required=False)
    sendEmailNotifications = serializers.BooleanField(write_only=True, source='send_email_notifications', required=False)
    scImpactDocumentUrl = serializers.URLField(write_only=True, source='safety_compliance_document_url', required=False, allow_blank=True)
    
    class Meta:
        model = Incident
        fields = [
            'title', 'description', 'level', 'scope',
            'safetyCompliance', 'securityPrivacy', 'dataQuality', 'psd2Impact',
            'startedAt', 'incidentDetectedAt', 'timeFormat', 'detectionSource',
            'incidentType', 'impactedLocations', 'impactedParties',
            'incidentCommander', 'reportingOrg', 'estimatedTimeToMitigation',
            'firstDetectedIn', 'impactedAssets', 'impactedAreas',
            'additionalSubscribers', 'l5Confirmation', 'mitigationPolicyAcknowledgment',
            'sendEmailNotifications', 'scImpactDocumentUrl'
        ]
    
    def create(self, validated_data):
        """Create incident from React form data."""
        # Set defaults for missing fields
        validated_data.setdefault('status', 'reported')
        
        # Create the incident
        incident = Incident.objects.create(**validated_data)
        return incident
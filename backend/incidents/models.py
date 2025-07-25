"""
Models for incident management system.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json
from .config import (
    LEVEL_CHOICES, SCOPE_CHOICES, TYPE_CHOICES, STATUS_CHOICES,
    IMPACT_CHOICES, TIME_FORMAT_CHOICES, DETECTION_SOURCE_CHOICES
)


class Incident(models.Model):
    """
    Main incident model representing all data from the incident creation form.
    """
    
    # Basic Information
    title = models.CharField(max_length=255, help_text="Short, one sentence description of the incident")
    description = models.TextField(help_text="Detailed description of what is known about the incident")
    
    # Level and Scope
    level = models.CharField(max_length=3, choices=LEVEL_CHOICES, blank=True)
    scope = models.CharField(max_length=10, choices=SCOPE_CHOICES, blank=True)
    
    # Impact Assessment
    safety_compliance = models.CharField(max_length=15, choices=IMPACT_CHOICES, blank=True)
    security_privacy = models.CharField(max_length=15, choices=IMPACT_CHOICES, blank=True) 
    data_quality = models.CharField(max_length=15, choices=IMPACT_CHOICES, blank=True)
    psd2_impact = models.CharField(max_length=15, choices=IMPACT_CHOICES, blank=True)
    
    # Timeline Information
    started_at = models.DateTimeField(help_text="When the incident started")
    detected_at = models.DateTimeField(help_text="When the incident was detected")
    
    time_format = models.CharField(max_length=15, choices=TIME_FORMAT_CHOICES, default='Local Time')
    
    # Detection Information
    detection_source = models.CharField(max_length=15, choices=DETECTION_SOURCE_CHOICES, default='Manual')
    
    # Incident Type
    incident_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='Planned')
    
    # Location and Parties
    impacted_locations = models.JSONField(default=list, help_text="List of impacted geographical locations")
    impacted_parties = models.JSONField(default=list, help_text="List of impacted parties/user groups")
    
    # Personnel Information
    incident_commander = models.EmailField(help_text="Email of the incident commander")
    reporting_org = models.CharField(max_length=100, help_text="Organization reporting the incident")
    
    # Optional Fields
    estimated_time_to_mitigation = models.CharField(max_length=20, blank=True, default='unknown')
    first_detected_in = models.CharField(max_length=50, blank=True, help_text="Where the incident was first detected")
    impacted_assets = models.JSONField(default=list, help_text="List of assets experiencing side effects")
    impacted_areas = models.JSONField(default=list, help_text="List of technical areas impacted")
    additional_subscribers = models.TextField(blank=True, help_text="Additional email subscribers")
    
    # Related Documents are handled via the IncidentDocument model with ForeignKey relationship
    
    # Compliance and Safety
    safety_compliance_document_url = models.URLField(blank=True, help_text="URL for safety compliance documentation")
    
    # Confirmations and Acknowledgments
    l5_confirmation = models.BooleanField(default=False, help_text="L5 incident confirmation")
    mitigation_policy_acknowledgment = models.BooleanField(default=False, help_text="Mitigation policy acknowledgment")
    
    # Notifications
    send_email_notifications = models.BooleanField(default=True, help_text="Send email notifications")
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_incidents')
    
    # Status tracking
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='reported')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Incident'
        verbose_name_plural = 'Incidents'
    
    def __str__(self):
        return f"#{self.id}: {self.title} ({self.level}-{self.scope})"
    
    @property
    def is_l5_high(self):
        """Check if this is a critical L5 High incident."""
        return self.level == 'L5' and self.scope == 'High'
    
    @property
    def requires_mitigation_policy(self):
        """Check if mitigation policy applies."""
        return self.level == 'L5' and self.scope in ['Medium', 'High']
    
    def get_impacted_locations_display(self):
        """Get display string for impacted locations."""
        if isinstance(self.impacted_locations, list):
            return ', '.join(self.impacted_locations)
        return str(self.impacted_locations)
    
    def get_impacted_parties_display(self):
        """Get display string for impacted parties."""
        if isinstance(self.impacted_parties, list):
            return ', '.join(self.impacted_parties)
        return str(self.impacted_parties)


class IncidentDocument(models.Model):
    """
    Model for related documents linked to incidents.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255, help_text="Document title")
    url = models.URLField(help_text="Document URL")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Incident Document'
        verbose_name_plural = 'Incident Documents'
    
    def __str__(self):
        return f"{self.title} - {self.incident.title}"


class IncidentUpdate(models.Model):
    """
    Model for updates/comments posted on incidents.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='updates')
    content = models.TextField(help_text="Update content/comment")
    author = models.EmailField(help_text="Email of the person posting the update")
    update_type = models.CharField(
        max_length=20, 
        choices=[
            ('update', 'Update'),
            ('mitigation', 'Mitigation'),
            ('resolution', 'Resolution'),
            ('note', 'Note')
        ],
        default='update',
        help_text="Type of update"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='incident_updates')
    
    class Meta:
        ordering = ['-created_at']  # Newest first
        verbose_name = 'Incident Update'
        verbose_name_plural = 'Incident Updates'
    
    def __str__(self):
        return f"Update on {self.incident.title} by {self.author} at {self.created_at}" 
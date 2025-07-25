"""
Django admin configuration for incident models.
"""
from django.contrib import admin
from .models import Incident, IncidentDocument, IncidentUpdate


class IncidentDocumentInline(admin.TabularInline):
    """Inline admin for incident documents."""
    model = IncidentDocument
    extra = 0
    fields = ['title', 'url']


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    """Admin configuration for Incident model."""
    
    list_display = [
        'title', 'level', 'scope', 'incident_type', 'status', 
        'incident_commander', 'created_at', 'is_l5_high'
    ]
    
    list_filter = [
        'level', 'scope', 'incident_type', 'status', 'detection_source',
        'safety_compliance', 'security_privacy', 'created_at'
    ]
    
    search_fields = [
        'title', 'description', 'incident_commander', 'reporting_org'
    ]
    
    readonly_fields = ['created_at', 'updated_at', 'is_l5_high', 'requires_mitigation_policy']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'status', 'created_by')
        }),
        ('Level & Impact', {
            'fields': (
                ('level', 'scope'),
                ('safety_compliance', 'security_privacy'),
                ('data_quality', 'psd2_impact'),
                ('l5_confirmation', 'mitigation_policy_acknowledgment')
            )
        }),
        ('Timeline', {
            'fields': (
                ('started_at', 'detected_at', 'time_format'),
                ('detection_source', 'incident_type')
            )
        }),
        ('Location & Personnel', {
            'fields': (
                'impacted_locations', 'impacted_parties',
                'incident_commander', 'reporting_org'
            )
        }),
        ('Optional Information', {
            'fields': (
                'estimated_time_to_mitigation', 'first_detected_in',
                'impacted_assets', 'impacted_areas',
                'additional_subscribers'
            ),
            'classes': ['collapse']
        }),
        ('System Information', {
            'fields': (
                'send_email_notifications',
                'safety_compliance_document_url',
                ('created_at', 'updated_at')
            ),
            'classes': ['collapse']
        }),
    )
    
    inlines = [IncidentDocumentInline]
    
    def save_model(self, request, obj, form, change):
        """Set created_by when saving."""
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(IncidentUpdate)
class IncidentUpdateAdmin(admin.ModelAdmin):
    """Admin configuration for IncidentUpdate model."""
    
    list_display = [
        'incident', 'author', 'update_type', 'content_preview', 'created_at'
    ]
    
    list_filter = [
        'update_type', 'created_at', 'incident__level', 'incident__status'
    ]
    
    search_fields = [
        'content', 'author', 'incident__title'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Update Information', {
            'fields': ('incident', 'content', 'update_type')
        }),
        ('Author Information', {
            'fields': ('author', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def content_preview(self, obj):
        """Show preview of content."""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def save_model(self, request, obj, form, change):
        """Set created_by when saving."""
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(IncidentDocument)
class IncidentDocumentAdmin(admin.ModelAdmin):
    """Admin configuration for IncidentDocument model."""
    
    list_display = ['title', 'incident', 'url', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'incident__title', 'url']
    readonly_fields = ['created_at'] 
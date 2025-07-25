# Generated manually to convert string fields to JSON arrays

from django.db import migrations
import json


def convert_strings_to_arrays(apps, schema_editor):
    """Convert existing string data to JSON arrays."""
    Incident = apps.get_model('incidents', 'Incident')
    
    for incident in Incident.objects.all():
        # Convert impacted_assets from string to array
        if incident.impacted_assets:
            # Split by comma and clean up
            assets_list = [item.strip() for item in incident.impacted_assets.split(',') if item.strip()]
            incident.impacted_assets = json.dumps(assets_list)
        else:
            incident.impacted_assets = json.dumps([])
        
        # Convert impacted_areas from string to array  
        if incident.impacted_areas:
            # Split by comma and clean up
            areas_list = [item.strip() for item in incident.impacted_areas.split(',') if item.strip()]
            incident.impacted_areas = json.dumps(areas_list)
        else:
            incident.impacted_areas = json.dumps([])
        
        incident.save(update_fields=['impacted_assets', 'impacted_areas'])


def reverse_convert_arrays_to_strings(apps, schema_editor):
    """Reverse: convert JSON arrays back to strings."""
    Incident = apps.get_model('incidents', 'Incident')
    
    for incident in Incident.objects.all():
        # Convert impacted_assets from array to string
        try:
            if incident.impacted_assets:
                assets_list = json.loads(incident.impacted_assets)
                incident.impacted_assets = ', '.join(assets_list) if assets_list else ''
            else:
                incident.impacted_assets = ''
        except (json.JSONDecodeError, TypeError):
            incident.impacted_assets = str(incident.impacted_assets) if incident.impacted_assets else ''
        
        # Convert impacted_areas from array to string
        try:
            if incident.impacted_areas:
                areas_list = json.loads(incident.impacted_areas)
                incident.impacted_areas = ', '.join(areas_list) if areas_list else ''
            else:
                incident.impacted_areas = ''
        except (json.JSONDecodeError, TypeError):
            incident.impacted_areas = str(incident.impacted_areas) if incident.impacted_areas else ''
        
        incident.save(update_fields=['impacted_assets', 'impacted_areas'])


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0004_incidentupdate'),
    ]

    operations = [
        migrations.RunPython(
            convert_strings_to_arrays,
            reverse_convert_arrays_to_strings,
        ),
    ] 
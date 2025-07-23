"""
Shared configuration loader for incident management.
Loads configuration from shared-config.json to ensure consistency between frontend and backend.
"""
import json
import os
from pathlib import Path

# Path to the shared config file (in src directory)
CONFIG_FILE = Path(__file__).parent.parent.parent / 'src' / 'shared-config.json'

def load_shared_config():
    """Load the shared configuration from JSON file."""
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Shared config file not found: {CONFIG_FILE}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in shared config file: {e}")

# Load the config once at module import
_config = load_shared_config()
INCIDENT_CONFIG = _config['incident']

def get_choices_for_field(field_name):
    """
    Convert config array to Django choices format.
    
    Args:
        field_name: Name of the field in the config
        
    Returns:
        List of tuples in Django choices format: [(value, label), ...]
    """
    field_config = INCIDENT_CONFIG.get(field_name, [])
    return [(item['value'], item['label']) for item in field_config]

def get_values_for_field(field_name):
    """
    Get just the values for a field.
    
    Args:
        field_name: Name of the field in the config
        
    Returns:
        List of values: [value1, value2, ...]
    """
    field_config = INCIDENT_CONFIG.get(field_name, [])
    return [item['value'] for item in field_config]

def validate_field_value(field_name, value):
    """
    Validate that a value is allowed for a given field.
    
    Args:
        field_name: Name of the field in the config
        value: Value to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    valid_values = get_values_for_field(field_name)
    return value in valid_values

# Pre-computed choices for Django models
LEVEL_CHOICES = get_choices_for_field('levels')
SCOPE_CHOICES = get_choices_for_field('scopes')
TYPE_CHOICES = get_choices_for_field('types')
STATUS_CHOICES = get_choices_for_field('statuses')
IMPACT_CHOICES = get_choices_for_field('impactOptions')
TIME_FORMAT_CHOICES = get_choices_for_field('timeFormats')
DETECTION_SOURCE_CHOICES = get_choices_for_field('detectionSources')

# Lists for validation
VALID_LEVELS = get_values_for_field('levels')
VALID_SCOPES = get_values_for_field('scopes')
VALID_TYPES = get_values_for_field('types')
VALID_STATUSES = get_values_for_field('statuses')
VALID_IMPACTED_LOCATIONS = get_values_for_field('impactedLocations')
VALID_IMPACTED_PARTIES = get_values_for_field('impactedParties') 
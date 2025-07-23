// Incident Management Configuration
// Customize these values according to your organization's needs

export const INCIDENT_CONFIG = {
  // Severity Levels - customize as needed
  severityLevels: [
    { value: 'Level 1', label: 'L1 - Minor', description: 'Minor issues with minimal impact' },
    { value: 'Level 2', label: 'L2 - Low', description: 'Low priority issues' },
    { value: 'Level 3', label: 'L3 - Medium', description: 'Medium priority issues' },
    { value: 'Level 4', label: 'L4 - High', description: 'High priority issues' },
    { value: 'Level 5', label: 'L5 - Critical', description: 'Critical issues requiring immediate attention' }
  ],

  // Scope/Impact Levels - customize as needed
  scopeLevels: [
    { value: 'Low', label: 'Low', description: 'Limited impact scope' },
    { value: 'Medium', label: 'Medium', description: 'Moderate impact scope' },
    { value: 'High', label: 'High', description: 'Wide impact scope' }
  ],

  // Impact Areas - customize as needed
  impactAreas: [
    { value: 'Internal', label: 'Internal', description: 'Internal systems only' },
    { value: 'External', label: 'External', description: 'Customer-facing systems' },
    { value: 'Partial', label: 'Partial', description: 'Partial system impact' },
    { value: 'Infrastructure', label: 'Infrastructure', description: 'Infrastructure components' },
    { value: 'Application', label: 'Application', description: 'Application layer' }
  ],

  // Root Cause Categories - customize as needed
  rootCauseCategories: [
    { value: 'Human Error', label: 'Human Error' },
    { value: 'System Failure', label: 'System Failure' },
    { value: 'Process Failure', label: 'Process Failure' },
    { value: 'External Dependency', label: 'External Dependency' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Security', label: 'Security' },
    { value: 'Configuration', label: 'Configuration' },
    { value: 'Code Defect', label: 'Code Defect' },
    { value: 'Third Party', label: 'Third Party Service' }
  ],

  // Impact Assessment Levels - customize as needed
  impactLevels: [
    { value: 'None', label: 'None' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ],

  // Default Values
  defaults: {
    severityLevel: 'L3',
    scopeLevel: 'Low',
    impactArea: 'Internal',
    status: 'Reported'
  },

  // Priority Scoring Configuration
  priorityScoring: {
    // Base scores for severity levels (customize these values)
    levelScores: {
      'L1': 1,
      'L2': 2,
      'L3': 3,
      'L4': 4,
      'L5': 5
    },
    
    // Multipliers for scope (customize these values)
    scopeMultipliers: {
      'Low': 1,
      'Medium': 1.5,
      'High': 2
    },
    
    // Additional point values (customize these values)
    bonusPoints: {
      externalImpact: 2,
      highRequestPercentage: 2, // threshold: >50%
      highUserImpact: 2, // threshold: >1000 users
      securityPrivacyImpact: 1,
      safetyComplianceImpact: 1
    },
    
    // Priority badge thresholds (customize these values)
    thresholds: {
      critical: 12, // Red badge
      warning: 8,   // Yellow badge
      normal: 0     // Gray badge
    }
  },

  // Form Validation Rules
  validation: {
    titleMaxLength: 100,
    titleRequired: true,
    descriptionRequired: true,
    descriptionMaxLength: 2000
  },

  // Auto-save Configuration
  autoSave: {
    enabled: true,
    intervalMs: 2000 // 2 seconds
  }
};

// Helper function to get options for dropdowns
export const getDropdownOptions = (configKey) => {
  return INCIDENT_CONFIG[configKey] || [];
};

// Helper function to get priority score
export const calculatePriorityScore = (incident) => {
  const config = INCIDENT_CONFIG.priorityScoring;
  let score = 0;
  
  // Base score from severity level
  const baseScore = config.levelScores[incident.level] || 0;
  const multiplier = config.scopeMultipliers[incident.severity_scope] || 1;
  score += Math.round(baseScore * multiplier);
  
  // Bonus points
  if (incident.scope === 'External') {
    score += config.bonusPoints.externalImpact;
  }
  
  if (incident.customerImpact?.percentage_requests_affected > 50) {
    score += config.bonusPoints.highRequestPercentage;
  }
  
  if (incident.customerImpact?.absolute_users_impacted > 1000) {
    score += config.bonusPoints.highUserImpact;
  }
  
  if (incident.customerImpact?.security_privacy_impact && 
      incident.customerImpact.security_privacy_impact !== 'None') {
    score += config.bonusPoints.securityPrivacyImpact;
  }
  
  if (incident.customerImpact?.safety_compliance_impact && 
      incident.customerImpact.safety_compliance_impact !== 'None') {
    score += config.bonusPoints.safetyComplianceImpact;
  }
  
  return score;
};

// Helper function to get priority badge variant
export const getPriorityBadgeVariant = (score) => {
  const thresholds = INCIDENT_CONFIG.priorityScoring.thresholds;
  
  if (score >= thresholds.critical) return 'destructive';
  if (score >= thresholds.warning) return 'warning';
  return 'secondary';
}; 
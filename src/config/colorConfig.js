/**
 * Color Configuration for Incident Management
 * Centralizes all color coding logic for consistency across components
 */

// Get incident priority color for left border (combination-based)
export const getIncidentBorderColor = (level, scope) => {
  if (level === 'L5' && scope === 'High') return 'border-l-red-500';     // L5 High - red border
  if (level === 'L5' && scope === 'Medium') return 'border-l-orange-500'; // L5 Medium - orange border
  return 'border-l-black';     // Everything else - black border
};

// Get level badge styling
export const getLevelBadgeStyle = (level, scope) => {
  if (level === 'L5') {
    if (scope === 'High') return 'bg-red-600 text-white';
    if (scope === 'Medium') return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-white';
  }
  if (level === 'L4') return 'bg-orange-400 text-white';
  if (level === 'L3') return 'bg-yellow-400 text-white';
  return 'bg-gray-400 text-white';
};

// Get level part background color for merged badge
export const getLevelBackgroundColor = (level, scope) => {
  if (level === 'L5') {
    if (scope === 'High') return 'bg-red-600';
    if (scope === 'Medium') return 'bg-orange-500';
    return 'bg-black'; // L5 Low
  }
  // L2, L3, L4 all scopes are black
  return 'bg-black';
};

// Get scope badge styling (severity-based)
export const getScopeBadgeStyle = (scope) => {
  switch (scope) {
    case 'High': return 'bg-white text-black border-2 border-red-500';     // Critical impact
    case 'Medium': return 'bg-white text-black border-2 border-orange-500'; // Moderate impact
    case 'Low': return 'bg-white text-black border-2 border-yellow-500';    // Minor impact
    default: return 'bg-white text-black border-2 border-gray-400';     // Unknown impact
  }
};

// Get border color for level-scope badge (combination-based)
export const getScopeBorderColor = (level, scope) => {
  if (level === 'L5' && scope === 'High') return 'border-red-500';     // L5 High - red border
  if (level === 'L5' && scope === 'Medium') return 'border-orange-500'; // L5 Medium - orange border
  return 'border-black';     // Everything else - black border
};

// Get status badge styling (workflow-based)
export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'reported':
      return 'bg-red-100 text-red-800';      // Urgent - needs immediate attention
    case 'mitigating':
      return 'bg-orange-100 text-orange-800';   // Active - work in progress
    case 'resolved':
    case 'postmortem':
      return 'bg-yellow-100 text-yellow-800';   // Complete - awaiting closure
    case 'closed':
      return 'bg-green-100 text-green-800';    // Success - fully resolved
    default:
      return 'bg-gray-100 text-gray-700';     // Unknown state
  }
};

// Get incident type badge styling (nature-based)
export const getIncidentTypeBadgeStyle = (incidentType) => {
  switch (incidentType) {
    case 'Planned':
      return 'bg-blue-100 text-blue-800';     // Scheduled - calm blue
    case 'Outage':
      return 'bg-purple-100 text-purple-800'; // Unplanned - urgent purple
    case 'External':
      return 'bg-teal-100 text-teal-800';     // Third-party - neutral teal
    case 'Test':
      return 'bg-pink-100 text-pink-800';     // Test data - distinct pink
    default:
      return 'bg-gray-100 text-gray-700';     // Unknown - gray
  }
};

// Get L5 context text and styling for creation form
export const getL5ContextStyling = (level, scope) => {
  if (level !== 'L5' || !scope) return null;
  
  const baseStyles = {
    titleClass: 'text-sm font-medium',
    descClass: 'text-sm',
    title: `L5 ${scope}`,
  };
  
  switch (scope) {
    case 'High':
      return {
        ...baseStyles,
        titleClass: 'text-sm font-medium text-red-600',
        descClass: 'text-sm text-red-500',
        description: 'Critical: Affects at least one entire datacenter or 50%+ of consumers'
      };
    case 'Medium':
      return {
        ...baseStyles,
        titleClass: 'text-sm font-medium text-orange-600',
        descClass: 'text-sm text-orange-500',
        description: 'Severe: Significant impact requiring immediate attention'
      };
    case 'Low':
      return {
        ...baseStyles,
        titleClass: 'text-sm font-medium text-gray-900',
        descClass: 'text-sm text-gray-600',
        description: 'Moderate L5 incident'
      };
    default:
      return null;
  }
}; 
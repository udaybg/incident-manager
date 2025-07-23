/**
 * Form Configuration - Legacy file, now imports from shared config
 * @deprecated Use src/config/sharedConfig.js directly instead
 */
import { 
  FORM_CONFIG as SHARED_FORM_CONFIG, 
  getOptionsForField, 
  getDefaultValue, 
  getFieldLabel, 
  getFieldDescription 
} from './sharedConfig.js';

// Re-export shared config for backward compatibility
export const FORM_CONFIG = SHARED_FORM_CONFIG;

// Legacy helper functions for backward compatibility
export const getOptionsForLevel = () => getOptionsForField('levels');
export const getOptionsForScope = () => getOptionsForField('scopes');
export const getOptionsForType = () => getOptionsForField('types');
export const getOptionsForStatus = () => getOptionsForField('statuses');
export const getOptionsForImpact = () => getOptionsForField('impactOptions');

// Re-export helper functions
export { getOptionsForField, getDefaultValue, getFieldLabel, getFieldDescription };

// Help text function for form fields
export const getHelpText = (fieldKey) => {
  const helpTexts = {
    title: 'Enter a clear and descriptive title for the incident',
    description: 'Provide detailed information about the incident',
    level: 'Select the severity level (L1=Lowest, L5=Highest)',
    scope: 'Choose the impact scope (Low, Medium, High)',
    safetyComplianceHelp: 'Indicate if this incident affects safety or compliance requirements',
    impactedAssetsHelp: 'List all systems, services, or assets affected by this incident',
    additionalSubscribersHelp: 'Add email addresses for additional stakeholders who should be notified about this incident'
  };
  return helpTexts[fieldKey] || '';
};

// Incident type definition function (used for hover tooltips)
export const getIncidentTypeDefinition = (type) => getFieldDescription('types', type);

// Validation helpers
export const shouldShowL5Warning = (level, scope) => {
  return level === 'L5' && ['Medium', 'High'].includes(scope);
};

export const shouldShowMitigationPolicies = (level, scope) => {
  return level === 'L5' && scope === 'High';
};

export const isL5High = (level, scope) => {
  return level === 'L5' && scope === 'High';
};

// Utility functions
export const getMessage = (type, context = {}) => {
  // Simple message utility - can be expanded as needed
  return '';
};

export const getCurrentTimestamp = () => {
  // Return datetime-local format: YYYY-MM-DDTHH:MM
  const now = new Date();
  return now.toISOString().slice(0, 16);
}; 
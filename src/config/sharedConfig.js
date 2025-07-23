/**
 * Shared configuration loader for the frontend.
 * Loads configuration from shared-config.json to ensure consistency with backend.
 */

// Import the shared configuration
import sharedConfigData from '../shared-config.json';

const { incident: config } = sharedConfigData;

// Helper function to get options for dropdowns
export const getOptionsForField = (fieldName) => {
  return config[fieldName] || [];
};

// Helper function to get just the values
export const getValuesForField = (fieldName) => {
  return config[fieldName]?.map(item => item.value) || [];
};

// Helper function to get default value (first option)
export const getDefaultValue = (fieldName) => {
  const options = config[fieldName];
  return options && options.length > 0 ? options[0].value : '';
};

// Helper function to get field label by value
export const getFieldLabel = (fieldName, value) => {
  const options = config[fieldName] || [];
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Helper function to get field description by value
export const getFieldDescription = (fieldName, value) => {
  const options = config[fieldName] || [];
  const option = options.find(opt => opt.value === value);
  return option ? option.description : '';
};

// Helper function to get tooltip content
export const getTooltipContent = (fieldName) => {
  return config.tooltips?.[fieldName] || null;
};

// Export commonly used field configurations
export const FORM_CONFIG = {
  // Direct access to field options
  levels: config.levels,
  scopes: config.scopes,
  types: config.types,
  incidentTypes: config.incidentTypes,
  statuses: config.statuses,
  impactOptions: config.impactOptions,
  safetyCompliance: config.safetyCompliance,
  securityPrivacy: config.securityPrivacy,
  dataQuality: config.dataQuality,
  psd2Impact: config.psd2Impact,
  retroactive: config.retroactive,
  global: config.global,
  sendEmailNotifications: config.sendEmailNotifications,
  timeFormats: config.timeFormats,
  detectionSources: config.detectionSources,
  impactedLocations: config.impactedLocations,
  impactedParties: config.impactedParties,
  reportingOrganizations: config.reportingOrganizations,
  reportingOrg: config.reportingOrg,
  incidentCommanders: config.incidentCommanders,
  timeToMitigationOptions: config.timeToMitigationOptions,
  estimatedTimeToMitigation: config.estimatedTimeToMitigation,
  detectionLocationOptions: config.detectionLocationOptions,
  firstDetectedIn: config.firstDetectedIn,
  impactedAssetsOptions: config.impactedAssetsOptions,
  impactedAssets: config.impactedAssets,
  impactedAreasOptions: config.impactedAreasOptions,
  impactedAreas: config.impactedAreas,
  additionalSubscribers: config.additionalSubscribers,
};

// Legacy export for backward compatibility with existing formConfig.js usage
export const getOptionsForLevel = () => config.levels;
export const getOptionsForScope = () => config.scopes;
export const getOptionsForType = () => config.types;
export const getOptionsForStatus = () => config.statuses;
export const getOptionsForImpact = () => config.impactOptions; 
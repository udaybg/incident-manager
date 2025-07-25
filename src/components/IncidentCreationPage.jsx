import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, MultiSelect,
  Badge, Alert, AlertDescription, Checkbox, ToggleButtons, Tooltip 
} from './ui/index.js';
import { ChevronDown, ChevronUp, Trash2, AlertTriangle } from 'lucide-react';
import { 
  getOptionsForField, getDefaultValue, getFieldLabel, 
  shouldShowL5Warning, shouldShowMitigationPolicies, isL5High, 
  getIncidentTypeDefinition, getMessage, getCurrentTimestamp
} from '../config/formConfig.js';
import { getTooltipContent } from '../config/sharedConfig.js';
import { getL5ContextStyling } from '../config/colorConfig.js';

const IncidentCreationPage = () => {
  const navigate = useNavigate();

  // Main incident state
  const [incident, setIncident] = useState({
    title: '',
    description: '',
    level: getDefaultValue('levels'),
    scope: getDefaultValue('scopes'),
    safetyCompliance: getDefaultValue('safetyCompliance'),
    securityPrivacy: getDefaultValue('securityPrivacy'),
    dataQuality: getDefaultValue('dataQuality'),
    psd2Impact: getDefaultValue('psd2Impact'),
    startedAt: getCurrentTimestamp(),
    timeFormat: getDefaultValue('timeFormats'),
    detectionSource: getDefaultValue('detectionSources'),
    impactedLocations: [],
    impactedParties: [],
    incidentCommander: getDefaultValue('incidentCommanders'),
    reportingOrg: getDefaultValue('reportingOrg'),
    retroactive: getDefaultValue('retroactive'),
    global: getDefaultValue('global'),
    sendEmailNotifications: getDefaultValue('sendEmailNotifications'),
    l5Confirmation: false,
    mitigationPolicyAcknowledgment: false,
    scImpactDocumentUrl: '',
    incidentType: 'Planned',
    estimatedTimeToMitigation: getDefaultValue('estimatedTimeToMitigation'),
    firstDetectedIn: getDefaultValue('firstDetectedIn'),
    impactedAssets: getDefaultValue('impactedAssets'),
    impactedAreas: getDefaultValue('impactedAreas'),
    additionalSubscribers: getDefaultValue('additionalSubscribers'),
    relatedDocuments: [],
    incidentDetectedAt: getCurrentTimestamp()
  });

  const [errors, setErrors] = useState({});
  const [autoSave, setAutoSave] = useState(true);
  
  // Section visibility states
  const [sectionVisibility, setSectionVisibility] = useState({
    basicInfo: true,
    classification: true,
    timeline: true,
    impact: true,
    additional: true
  });

  // Load saved draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('incident-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        // Only load the draft if user wants to
        if (window.confirm('Found a saved draft. Would you like to load it?')) {
          setIncident(prev => ({ ...prev, ...draftData }));
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setInterval(() => {
        localStorage.setItem('incident-draft', JSON.stringify(incident));
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [incident, autoSave]);

  const updateIncident = (field, value) => {
    setIncident(prev => {
      const newState = { ...prev, [field]: value };
      // Reset L5 confirmation when level or scope changes away from L5 (Low/Medium/High)
      if ((field === 'level' || field === 'scope') && !shouldShowL5Warning(newState.level, newState.scope)) {
        newState.l5Confirmation = false;
      }
      // Reset mitigation policy acknowledgment when level or scope changes away from L5/Medium or L5/High
      if ((field === 'level' || field === 'scope') && !shouldShowMitigationPolicies(newState.level, newState.scope)) {
        newState.mitigationPolicyAcknowledgment = false;
      }
      return newState;
    });

    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addDocument = () => {
    setIncident(prev => ({
      ...prev,
      relatedDocuments: [...prev.relatedDocuments, { url: '', description: '' }]
    }));
  };

  const updateDocument = (index, field, value) => {
    setIncident(prev => ({
      ...prev,
      relatedDocuments: prev.relatedDocuments.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const removeDocument = (index) => {
    setIncident(prev => ({
      ...prev,
      relatedDocuments: prev.relatedDocuments.filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (section) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!incident.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!incident.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (shouldShowL5Warning(incident.level, incident.scope) && !incident.l5Confirmation) {
      newErrors.l5Confirmation = 'Please confirm L5 incident';
    }

    if (shouldShowMitigationPolicies(incident.level, incident.scope) && !incident.mitigationPolicyAcknowledgment) {
      newErrors.mitigationPolicyAcknowledgment = 'Please acknowledge mitigation policies';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Prepare data for API submission
        const apiData = {
          title: incident.title,
          description: incident.description,
          level: incident.level,
          scope: incident.scope,
          safetyCompliance: incident.safetyCompliance,
          securityPrivacy: incident.securityPrivacy,
          dataQuality: incident.dataQuality,
          psd2Impact: incident.psd2Impact,
          startedAt: incident.startedAt,
          incidentDetectedAt: incident.incidentDetectedAt,
          timeFormat: incident.timeFormat,
          detectionSource: incident.detectionSource,
          incidentType: incident.incidentType,
          impactedLocations: Array.isArray(incident.impactedLocations) ? incident.impactedLocations : [],
          impactedParties: Array.isArray(incident.impactedParties) ? incident.impactedParties : [],
          incidentCommander: incident.incidentCommander,
          reportingOrg: incident.reportingOrg,
          estimatedTimeToMitigation: incident.estimatedTimeToMitigation,
          firstDetectedIn: incident.firstDetectedIn,
          impactedAssets: Array.isArray(incident.impactedAssets) ? incident.impactedAssets : [],
          impactedAreas: Array.isArray(incident.impactedAreas) ? incident.impactedAreas : [],
          additionalSubscribers: incident.additionalSubscribers,
          l5Confirmation: incident.l5Confirmation,
          mitigationPolicyAcknowledgment: incident.mitigationPolicyAcknowledgment,
          sendEmailNotifications: incident.sendEmailNotifications,
          scImpactDocumentUrl: incident.scImpactDocumentUrl
        };

        console.log('Submitting incident to API:', apiData);
        
        const response = await fetch('http://localhost:8000/api/v1/incidents/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
        
        if (response.ok) {
          const createdIncident = await response.json();
          console.log('Incident created successfully:', createdIncident);
          alert('Incident reported successfully!');
          
          // Clear form draft
          localStorage.removeItem('incident-draft');
          
          // Navigate back to list view
          navigate('/incidents');
        } else {
          const errorData = await response.json();
          console.error('Error creating incident:', errorData);
          console.error('Response status:', response.status);
          
          // Handle validation errors from backend
          if (response.status === 400 && errorData) {
            const backendErrors = {};
            Object.keys(errorData).forEach(key => {
              if (Array.isArray(errorData[key])) {
                backendErrors[key] = errorData[key][0];
              } else {
                backendErrors[key] = errorData[key];
              }
            });
            console.error('Processed backend errors:', backendErrors);
            setErrors(prev => ({ ...prev, ...backendErrors }));
            alert(`Please fix the errors and try again. Backend errors: ${JSON.stringify(errorData, null, 2)}`);
          } else {
            alert('Error reporting incident. Please try again.');
          }
        }
      } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please check your connection and try again.');
      }
    }
  };

  const getScopeBorderColor = (level, scope) => {
    if (level === 'L5') {
      if (scope === 'Low') return 'border-black';
      if (scope === 'Medium') return 'border-orange-500';
      if (scope === 'High') return 'border-red-500';
    }
    return 'border-black';
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ backgroundColor: '#dbdfe3', height: 'calc(100vh - 64px)' }}>
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-8 space-y-6">

          {/* Section 1: Basic Incident Information */}
          <div className="rounded-xl p-6 space-y-6 bg-white">
            <button
              type="button"
              onClick={() => toggleSection('basicInfo')}
              className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${sectionVisibility.basicInfo ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
            >
              <span>Basic Information</span>
              {sectionVisibility.basicInfo ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {sectionVisibility.basicInfo && (
              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Incident Title *
                    </label>
                    <Tooltip content={getTooltipContent('title')} />
                  </div>
                  <Input
                    value={incident.title}
                    onChange={(e) => updateIncident('title', e.target.value)}
                    className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description Field */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <Tooltip content={getTooltipContent('description')} />
                  </div>
                  <Textarea
                    value={incident.description}
                    onChange={(e) => updateIncident('description', e.target.value)}
                    rows={4}
                    className={`w-full ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Incident Type */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Incident Type
                    </label>
                    <Tooltip content={getIncidentTypeDefinition(incident.incidentType)} />
                  </div>
                  <ToggleButtons
                    options={getOptionsForField('incidentTypes')}
                    value={incident.incidentType}
                    onChange={(value) => updateIncident('incidentType', value)}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Incident Commander
                      </label>
                      <Tooltip content={getTooltipContent('incidentCommander')} />
                    </div>
                    <Input
                      type="email"
                      value={incident.incidentCommander}
                      onChange={(e) => updateIncident('incidentCommander', e.target.value)}
                      placeholder="commander@company.com"
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Reporting Organization
                      </label>
                      <Tooltip content={getTooltipContent('reportingOrg')} />
                    </div>
                    <Select value={incident.reportingOrg} onValueChange={(value) => updateIncident('reportingOrg', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reporting organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOptionsForField('reportingOrg').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Level and Scope */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <label className="block text-sm font-medium text-gray-900">
                        Level
                      </label>
                      <Tooltip content={getTooltipContent('level')} />
                    </div>
                    <ToggleButtons
                      options={[
                        { value: 'L2', label: 'L2' },
                        { value: 'L3', label: 'L3' },
                        { value: 'L4', label: 'L4' },
                        { value: 'L5', label: 'L5' }
                      ]}
                      value={incident.level}
                      onChange={(value) => updateIncident('level', value)}
                      incident={incident}
                    />
                    {!incident.level && (
                      <div className="mt-2 text-sm text-gray-600">Incident level is unknown</div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <label className="block text-sm font-medium text-gray-900">
                        Scope
                      </label>
                      <Tooltip content={getTooltipContent('scope')} />
                    </div>
                    <ToggleButtons
                      options={[
                        { value: 'Low', label: 'LOW' },
                        { value: 'Medium', label: 'MEDIUM' },
                        { value: 'High', label: 'HIGH' }
                      ]}
                      value={incident.scope}
                      onChange={(value) => updateIncident('scope', value)}
                      incident={incident}
                    />
                  </div>
                </div>

                {/* L5 Confirmations */}
                {(incident.level === 'L5' && incident.scope) && (
                  <div className="space-y-2">
                    {/* First checkbox - shows for all L5 levels */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <Checkbox
                          checked={incident.l5Confirmation}
                          onCheckedChange={(checked) => updateIncident('l5Confirmation', checked)}
                        />
                        <AlertTriangle className={`h-4 w-4 ${
                          incident.scope === 'High' ? 'text-red-600' : 
                          incident.scope === 'Medium' ? 'text-orange-600' : 
                          'text-gray-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          incident.scope === 'High' ? 'text-red-600' : 
                          incident.scope === 'Medium' ? 'text-orange-600' : 
                          'text-gray-900'
                        }`}>
                          I confirm this is an L5 incident and understand the implications
                        </span>
                      </label>
                      {errors.l5Confirmation && <p className="text-red-500 text-sm ml-6">{errors.l5Confirmation}</p>}
                    </div>

                    {/* Second checkbox - shows for L5 Medium/High */}
                    {shouldShowMitigationPolicies(incident.level, incident.scope) && (
                      <div>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={incident.mitigationPolicyAcknowledgment}
                            onCheckedChange={(checked) => updateIncident('mitigationPolicyAcknowledgment', checked)}
                          />
                          <AlertTriangle className={`h-4 w-4 ${
                            incident.scope === 'High' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            incident.scope === 'High' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            I acknowledge and will follow the emergency mitigation policies for this critical incident level
                          </span>
                        </label>
                        {errors.mitigationPolicyAcknowledgment && <p className="text-red-500 text-sm ml-6">{errors.mitigationPolicyAcknowledgment}</p>}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Section 2: Impact and Scope Classification */}
          <div className="rounded-xl p-6 space-y-6 bg-white">
            <button
              type="button"
              onClick={() => toggleSection('classification')}
              className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${sectionVisibility.classification ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
            >
              <span>Impact and Scope Classification</span>
              {sectionVisibility.classification ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {sectionVisibility.classification && (
              <div className="space-y-6">
                {/* Impact Assessment Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Does this incident impact Safety & Compliance?
                      </label>
                      <Tooltip content={getTooltipContent('safetyCompliance')} />
                    </div>
                    <ToggleButtons
                      options={getOptionsForField('impactOptions')}
                      value={incident.safetyCompliance}
                      onChange={(value) => updateIncident('safetyCompliance', value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Does this incident impact Security & Privacy?
                      </label>
                      <Tooltip content={getTooltipContent('securityPrivacy')} />
                    </div>
                    <ToggleButtons
                      options={getOptionsForField('impactOptions')}
                      value={incident.securityPrivacy}
                      onChange={(value) => updateIncident('securityPrivacy', value)}
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <label className="inline text-sm font-medium text-gray-700">
                        Does this incident impact data quality: data missing, incorrect, corrupted?
                      </label>
                      <span className="ml-2">
                        <Tooltip content={getTooltipContent('dataQuality')} />
                      </span>
                    </div>
                    <ToggleButtons
                      options={getOptionsForField('impactOptions')}
                      value={incident.dataQuality}
                      onChange={(value) => updateIncident('dataQuality', value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Does this incident have PSD2 impact?
                      </label>
                      <Tooltip content={getTooltipContent('psd2Impact')} />
                    </div>
                    <ToggleButtons
                      options={getOptionsForField('impactOptions')}
                      value={incident.psd2Impact}
                      onChange={(value) => updateIncident('psd2Impact', value)}
                    />
                  </div>
                </div>

                {/* Impacted Parties and Locations */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Impacted Parties
                      </label>
                      <Tooltip content={getTooltipContent('impactedParties')} />
                    </div>
                    <MultiSelect
                      values={incident.impactedParties}
                      onValuesChange={(values) => updateIncident('impactedParties', values)}
                      placeholder="Select impacted parties"
                    >
                      <SelectContent>
                        {getOptionsForField('impactedParties').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </MultiSelect>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Impacted Locations
                      </label>
                      <Tooltip content={getTooltipContent('impactedLocations')} />
                    </div>
                    <MultiSelect
                      values={incident.impactedLocations}
                      onValuesChange={(values) => updateIncident('impactedLocations', values)}
                      placeholder="Select impacted locations"
                    >
                      <SelectContent>
                        {getOptionsForField('impactedLocations').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </MultiSelect>
                  </div>
                </div>

                {/* Additional Impact Fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Impacted Areas
                      </label>
                      <Tooltip content={getTooltipContent('impactedAreas')} />
                    </div>
                    <MultiSelect
                      values={incident.impactedAreas}
                      onValuesChange={(values) => updateIncident('impactedAreas', values)}
                      placeholder="Select impacted areas"
                    >
                      <SelectContent>
                        {getOptionsForField('impactedAreas').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </MultiSelect>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Impacted Assets
                      </label>
                      <Tooltip content={getTooltipContent('impactedAssets')} />
                    </div>
                    <MultiSelect
                      values={incident.impactedAssets}
                      onValuesChange={(values) => updateIncident('impactedAssets', values)}
                      placeholder="Select impacted assets"
                    >
                      <SelectContent>
                        {getOptionsForField('impactedAssets').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </MultiSelect>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Timeline Information */}
          <div className="rounded-xl p-6 space-y-6 bg-white">
            <button
              type="button"
              onClick={() => toggleSection('timeline')}
              className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${sectionVisibility.timeline ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
            >
              <span>Timeline Information</span>
              {sectionVisibility.timeline ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {sectionVisibility.timeline && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Incident Started At
                      </label>
                      <Tooltip content={getTooltipContent('startedAt')} />
                    </div>
                    <Input
                      type="datetime-local"
                      value={incident.startedAt}
                      onChange={(e) => updateIncident('startedAt', e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Incident Detected At
                      </label>
                      <Tooltip content={getTooltipContent('incidentDetectedAt')} />
                    </div>
                    <Input
                      type="datetime-local"
                      value={incident.incidentDetectedAt}
                      onChange={(e) => updateIncident('incidentDetectedAt', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        All Form Times in
                      </label>
                    </div>
                    <ToggleButtons
                      options={[
                        { value: 'Local Time', label: 'Local Time' },
                        { value: 'UTC', label: 'UTC' }
                      ]}
                      value={incident.timeFormat}
                      onChange={(value) => updateIncident('timeFormat', value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Detection Source
                      </label>
                      <Tooltip content={getTooltipContent('detectionSource')} />
                    </div>
                    <ToggleButtons
                      options={[
                        { value: 'Alert', label: 'Alert' },
                        { value: 'Manual', label: 'Manual' }
                      ]}
                      value={incident.detectionSource}
                      onChange={(value) => updateIncident('detectionSource', value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Estimated Time to Mitigation
                      </label>
                      <Tooltip content={getTooltipContent('estimatedTimeToMitigation')} />
                    </div>
                    <Select value={incident.estimatedTimeToMitigation} onValueChange={(value) => updateIncident('estimatedTimeToMitigation', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select estimated time" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOptionsForField('estimatedTimeToMitigation').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Additional Information */}
          <div className="rounded-xl p-6 space-y-6 bg-white">
            <button
              type="button"
              onClick={() => toggleSection('additional')}
              className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${sectionVisibility.additional ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
            >
              <span>Additional Information</span>
              {sectionVisibility.additional ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {sectionVisibility.additional && (
              <div className="space-y-6">
                {/* Additional Subscribers */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Subscribers
                    </label>
                    <Tooltip content={getTooltipContent('additionalSubscribers')} />
                  </div>
                  <Textarea
                    value={incident.additionalSubscribers}
                    onChange={(e) => updateIncident('additionalSubscribers', e.target.value)}
                    placeholder="Additional email addresses (comma-separated)"
                    rows={2}
                  />
                </div>

                {/* Related Documents */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Related Documents
                      </label>
                      <Tooltip content={getTooltipContent('relatedDocuments')} />
                    </div>
                    <Button 
                      type="button" 
                      onClick={addDocument}
                      variant="outline" 
                      size="sm"
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Add Document
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {incident.relatedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-xl">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Title"
                            value={doc.description}
                            onChange={(e) => updateDocument(index, 'description', e.target.value)}
                          />
                          <Input
                            placeholder="URL"
                            value={doc.url}
                            onChange={(e) => updateDocument(index, 'url', e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeDocument(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Compliance Document URL */}
                {(incident.safetyCompliance === 'Yes' || incident.safetyCompliance === 'To be determined') && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Safety & Compliance Impact Document URL
                      </label>
                      <Tooltip content={getTooltipContent('scImpactDocumentUrl')} />
                    </div>
                    <Input
                      value={incident.scImpactDocumentUrl}
                      onChange={(e) => updateIncident('scImpactDocumentUrl', e.target.value)}
                      placeholder="Link to safety & compliance assessment document"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div className="shadow-lg rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={incident.sendEmailNotifications}
                    onCheckedChange={(checked) => updateIncident('sendEmailNotifications', checked)}
                  />
                  <span className="text-sm font-medium text-gray-900">Send Email Notifications</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={autoSave}
                    onCheckedChange={(checked) => setAutoSave(checked)}
                  />
                  <span className="text-sm font-medium text-gray-600">Auto-save enabled</span>
                </label>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                className="px-8 rounded-xl h-12 font-semibold"
                style={{ 
                  backgroundColor: '#000000', 
                  color: '#ffffff', 
                  border: '1px solid #000000' 
                }}
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCreationPage; 
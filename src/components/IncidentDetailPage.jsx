import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, MultiSelect, Checkbox
} from './ui/index.js';
import { 
  Calendar, User, MapPin, Users, AlertTriangle, 
  Clock, Shield, Database, CreditCard, Globe, Mail, ExternalLink, Plus, Send, Edit3,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { getFieldLabel, getOptionsForField } from '../config/formConfig.js';

const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedIncident, setEditedIncident] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPostmortemMode, setIsPostmortemMode] = useState(false);
  const [postmortemSectionVisibility, setPostmortemSectionVisibility] = useState({
    owners: true,
    summary: true,
    timestamps: true,
    impact: true
  });
  const [postmortemData, setPostmortemData] = useState({
    // Postmortem owners
    author: '',
    contributors: '',
    organisation: '',
    accountableTeam: '',
    reviewers: '',
    barRaiser: '',
    // Incident summary
    executiveSummary: '',
    detailedSummary: '',
    keyLearnings: '',
    mitigationNotes: '',
    // Incident timestamps
    startedAt: '',
    detectedAt: '',
    mitigatedAt: '',
    resolvedAt: '',
    // Impact assessment
    businessImpact: '',
    customerImpact: '',
    stakeholderImpact: ''
  });
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const [showPostmortemModal, setShowPostmortemModal] = useState(false);


    const [showCompletedPostmortem, setShowCompletedPostmortem] = useState(false);
  
  // Master state for incident details pages with state-based defaults
  const getDefaultDetailsPage = (status) => {
    switch(status) {
      case 'reported': return 'incident';
      case 'mitigating': return 'mitigation';  
      case 'resolved': return 'mitigation';
      case 'postmortem': return 'postmortem';
      case 'closed': return 'postmortem';
      default: return 'incident';
    }
  };
  
  const [activeDetailsPage, setActiveDetailsPage] = useState(null); // null | 'incident' | 'mitigation' | 'postmortem'

  // Section visibility states for collapsible incident details
  const [detailSectionVisibility, setDetailSectionVisibility] = useState({
    basicInfo: true,
    classification: true, 
    timeline: true,
    additional: true
  });

  const toggleDetailSection = (section) => {
    setDetailSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`);
        if (response.ok) {
          const incidentData = await response.json();
          setIncident(incidentData);
          // Set updates from the incident data (comes with the incident)
          if (incidentData.updates) {
            setUpdates(incidentData.updates);
          }

          // If incident is already in postmortem status, show the postmortem form
          if (incidentData.status === 'postmortem') {
            setPostmortemData(prev => ({
              ...prev,
              author: incidentData.incident_commander || '',
              organisation: incidentData.reporting_org || '',
              startedAt: incidentData.started_at || '',
              detectedAt: incidentData.detected_at || '',
              mitigatedAt: incidentData.updated_at || '',
              resolvedAt: incidentData.updated_at || '' // Use updated_at as default resolved time
            }));
            setIsPostmortemMode(true);
          }

          // If incident is closed, show completed postmortem by default
          if (incidentData.status === 'closed') {
            setShowCompletedPostmortem(true);
          }

          // Set default active details page based on incident status
          setActiveDetailsPage(getDefaultDetailsPage(incidentData.status));
        } else if (response.status === 404) {
          setError('Incident not found');
        } else {
          setError('Failed to load incident details');
        }
      } catch (error) {
        console.error('Error fetching incident:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncident();
    }
  }, [id]);

  const getStatusBadgeColor = (status) => {
    const statusColors = {
      'reported': 'bg-green-100 text-green-800',
      'mitigating': 'bg-blue-100 text-blue-800', 
      'resolved': 'bg-green-100 text-green-800',
      'postmortem': 'bg-purple-100 text-purple-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get level part background color for merged badge (matching incident cards)
  const getLevelBackgroundColor = (level, scope) => {
    if (level === 'L5') {
      if (scope === 'High') return 'bg-red-600';
      if (scope === 'Medium') return 'bg-orange-500';
      return 'bg-black'; // L5 Low
    }
    // L2, L3, L4 all scopes are black
    return 'bg-black';
  };

  // Get border color for level-scope badge (matching incident cards)
  const getScopeBorderColor = (level, scope) => {
    if (level === 'L5' && scope === 'High') return 'border-red-500';
    if (level === 'L5' && scope === 'Medium') return 'border-orange-500';
    return 'border-black';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInYears = Math.floor(diffInDays / 365);
      
      const formatted = date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      
      let timeAgo = '';
      if (diffInYears > 0) {
        timeAgo = `(over ${diffInYears} year${diffInYears > 1 ? 's' : ''} ago)`;
      } else if (diffInDays > 0) {
        timeAgo = `(${diffInDays} day${diffInDays > 1 ? 's' : ''} ago)`;
      } else {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours > 0) {
          timeAgo = `(${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago)`;
        } else {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          timeAgo = `(${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago)`;
        }
      }
      
      return `${formatted} ${timeAgo}`;
    } catch {
      return dateString;
    }
  };

  const calculateTTD = (startedAt, detectedAt) => {
    if (!startedAt || !detectedAt) return 'Unknown';
    try {
      const start = new Date(startedAt);
      const detected = new Date(detectedAt);
      const diffInMs = detected - start;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    } catch {
      return 'Unknown';
    }
  };

  const StatusProgression = ({ currentStatus }) => {
    const statuses = [
      { key: 'reported', label: 'Reported', number: 1 },
      { key: 'mitigating', label: 'Mitigating', number: 2 },
      { key: 'resolved', label: 'Resolved', number: 3 },
      { key: 'postmortem', label: 'Postmortem', number: 4 },
      { key: 'closed', label: 'Closed', number: 5 }
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);

    const getStatusLink = (statusKey) => {
      // Add hyperlinks based on status and current state
      if (statusKey === 'closed' && currentIndex >= 4) {
        return () => setShowPostmortemModal(true);
      }
      return null;
    };

    return (
      <div className="flex items-center space-x-4">
        {statuses.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = status.key === currentStatus;
          const hasLink = getStatusLink(status.key);
          
          const StatusContent = ({ children }) => {
            if (hasLink) {
              return (
                <button
                  onClick={hasLink}
                  className="flex items-center hover:opacity-75 transition-opacity underline cursor-pointer"
                >
                  {children}
                </button>
              );
            }
            return <div className="flex items-center">{children}</div>;
          };

          return (
            <div key={status.key} className="flex items-center">
              <StatusContent>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  isActive 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {status.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isCurrent ? 'text-green-600' : isActive ? 'text-gray-900' : 'text-gray-400'
                } ${hasLink ? 'text-blue-600 hover:text-blue-800' : ''}`}>
                  {status.label}
                </span>
              </StatusContent>
              {index < statuses.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'reported': 'mitigating',
      'mitigating': 'resolved', 
      'resolved': 'postmortem',
      'postmortem': 'closed'
    };
    return statusFlow[currentStatus];
  };

  const getButtonText = (currentStatus) => {
    const buttonTexts = {
      'reported': 'Start Mitigating',
      'mitigating': 'Mark Resolved',
      'resolved': 'Start Postmortem', 
      'postmortem': 'Complete Postmortem'
    };
    return buttonTexts[currentStatus] || 'Update Status';
  };

  const handleStartPostmortem = () => {
    // Pre-populate postmortem data with incident information
    setPostmortemData(prev => ({
      ...prev,
      author: incident.incident_commander || '',
      organisation: incident.reporting_org || '',
      startedAt: incident.started_at || '',
      detectedAt: incident.detected_at || '',
      mitigatedAt: incident.updated_at || '', // Use last updated as mitigated time for now
      resolvedAt: new Date().toISOString() // Current time as resolved time
    }));
    setIsPostmortemMode(true);
  };

  const updatePostmortemData = (field, value) => {
    setPostmortemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePostmortemSection = (section) => {
    setPostmortemSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validatePostmortemData = () => {
    const requiredFields = [
      { key: 'author', label: 'Author' },
      { key: 'contributors', label: 'Contributors' },
      { key: 'organisation', label: 'Organisation' },
      { key: 'accountableTeam', label: 'Accountable Team' },
      { key: 'reviewers', label: 'Reviewers' },
      { key: 'barRaiser', label: 'Bar Raiser' },
      { key: 'executiveSummary', label: 'Executive Summary' },
      { key: 'detailedSummary', label: 'Detailed Summary' },
      { key: 'keyLearnings', label: 'Key Learnings' },
      { key: 'mitigationNotes', label: 'Mitigation Notes' },
      { key: 'startedAt', label: 'Started At' },
      { key: 'detectedAt', label: 'Detected At' },
      { key: 'mitigatedAt', label: 'Mitigated At' },
      { key: 'resolvedAt', label: 'Resolved At' },
      { key: 'businessImpact', label: 'Business Impact' },
      { key: 'customerImpact', label: 'Customer Impact' },
      { key: 'stakeholderImpact', label: 'Stakeholder Impact' }
    ];

    const missingFields = requiredFields.filter(field => {
      const value = postmortemData[field.key];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(field => field.label)
    };
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(incident.status);
    if (!nextStatus) {
      alert('No further status changes available');
      return;
    }

    // Validate postmortem data if completing postmortem
    if (incident.status === 'postmortem') {
      const validation = validatePostmortemData();
      if (!validation.isValid) {

        alert(`Please fill in all required postmortem fields:\n\n${validation.missingFields.join('\n')}`);
        return;
      }
    }

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        const updatedIncident = await response.json();
        setIncident(updatedIncident);
        
        // Special handling for starting postmortem - show form after status update
        if (incident.status === 'resolved' && nextStatus === 'postmortem') {
          handleStartPostmortem();
        }
      } else {
        alert('Failed to update incident status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error occurred');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    setIsPostingUpdate(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/updates/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: newUpdate,
          author: 'current_user@uber.com', // TODO: Get from authenticated user
          update_type: 'update'
        })
      });

      if (response.ok) {
        const newUpdateData = await response.json();
        // Add the new update to the beginning of the list (newest first)
        setUpdates([newUpdateData, ...updates]);
        setNewUpdate('');
      } else {
        const errorData = await response.json();
        console.error('Failed to post update:', errorData);
        alert('Failed to post update: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error posting update:', error);
      alert('Network error: Failed to post update');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleEnterEditMode = () => {
    setEditedIncident({
      title: incident.title,
      description: incident.description,
      level: incident.level,
      scope: incident.scope,
      incident_commander: incident.incident_commander,
      reporting_org: incident.reporting_org || incident.reportingOrg,
      detection_source: incident.detection_source || incident.detectionSource,
      safety_compliance: incident.safety_compliance || incident.safetyCompliance,
      security_privacy: incident.security_privacy || incident.securityPrivacy,
      data_quality: incident.data_quality || incident.dataQuality,
      psd2_impact: incident.psd2_impact || incident.psd2Impact,
      impacted_areas: incident.impacted_areas || incident.impactedAreas,
      impacted_assets: incident.impacted_assets || incident.impactedAssets,
      impacted_parties: incident.impacted_parties || incident.impactedParties || [],
      impacted_locations: incident.impacted_locations || incident.impactedLocations || [],
      related_documents: incident.documents || [],
      l5_confirmation: incident.l5_confirmation || false,
      mitigation_policy_acknowledgment: incident.mitigation_policy_acknowledgment || false,
    });
    setIsEditMode(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        title: editedIncident.title,
        description: editedIncident.description,
        level: editedIncident.level,
        scope: editedIncident.scope,
        safety_compliance: editedIncident.safety_compliance,
        security_privacy: editedIncident.security_privacy,
        data_quality: editedIncident.data_quality,
        psd2_impact: editedIncident.psd2_impact,
        incident_commander: editedIncident.incident_commander,
        reporting_org: editedIncident.reporting_org,
        detection_source: editedIncident.detection_source,
        impacted_areas: editedIncident.impacted_areas,
        impacted_assets: editedIncident.impacted_assets,
        impacted_parties: editedIncident.impacted_parties,
        impacted_locations: editedIncident.impacted_locations,
        l5_confirmation: editedIncident.l5_confirmation || incident.l5_confirmation || false,
        mitigation_policy_acknowledgment: editedIncident.mitigation_policy_acknowledgment || incident.mitigation_policy_acknowledgment || false,
      };

      console.log('Saving incident with data:', updateData);

      const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const updatedIncident = await response.json();
        console.log('Updated incident data:', updatedIncident);
        setIncident(updatedIncident);
        setIsEditMode(false);
        setEditedIncident({});
        alert('Incident updated successfully!');
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Update failed. Status:', response.status);
        console.error('Error response:', errorData);
        alert(`Failed to update incident. Status: ${response.status}. Error: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      alert(`Network error occurred: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedIncident({});
  };

  const handleFieldChange = (field, value) => {
    setEditedIncident(prev => ({
      ...prev,
      [field]: value
    }));
  };



  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden" style={{ backgroundColor: '#dbdfe3', height: 'calc(100vh - 64px)' }}>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading incident details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col overflow-hidden" style={{ backgroundColor: '#dbdfe3', height: 'calc(100vh - 64px)' }}>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return null;
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ backgroundColor: '#dbdfe3', height: 'calc(100vh - 64px)' }}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-8">
          


          {/* Main Content - Full Width */}
          <div className="max-w-5xl mx-auto">
            
            <div className="space-y-2">
              
                             {/* Main Incident Card */}
               <Card className="bg-white border border-gray-200">
                 <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      {/* Level & Scope Badge - separate line */}
                      <div className="mb-2">
                        {!isEditMode ? (
                          <div className="flex items-center font-bold text-xs">
                            {/* Level part - colored background with combination-based border */}
                            <span className={`${getLevelBackgroundColor(incident.level, incident.scope)} text-white px-2 py-1 rounded-l border-2 border-r-0 ${getScopeBorderColor(incident.level, incident.scope)}`}>
                              {incident.level}
                            </span>
                            {/* Scope part - white background with black text and combination-based border */}
                            <span className={`bg-white text-black px-2 py-1 rounded-r border-2 border-l-0 ${getScopeBorderColor(incident.level, incident.scope)}`}>
                              {incident.scope.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Select value={editedIncident.level || ''} onValueChange={(value) => handleFieldChange('level', value)}>
                              <SelectTrigger className="w-20 h-8 text-xs border-2 border-blue-500">
                                <SelectValue placeholder="Level" />
                              </SelectTrigger>
                              <SelectContent>
                                {getOptionsForField('levels').map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={editedIncident.scope || ''} onValueChange={(value) => handleFieldChange('scope', value)}>
                              <SelectTrigger className="w-24 h-8 text-xs border-2 border-blue-500">
                                <SelectValue placeholder="Scope" />
                              </SelectTrigger>
                              <SelectContent>
                                {getOptionsForField('scopes').map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Title - separate line */}
                      <div className="mb-1">
                        {!isEditMode ? (
                          <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
                        ) : (
                          <Input
                            value={editedIncident.title || ''}
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                            className="text-2xl font-bold text-gray-900 border-2 border-blue-500"
                            placeholder="Incident title"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    {!isEditMode ? (
                      <p className="text-gray-700">{incident.description}</p>
                    ) : (
                      <Textarea
                        value={editedIncident.description || ''}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className="text-gray-700 border-2 border-blue-500"
                        placeholder="Incident description"
                        rows={3}
                      />
                    )}
                  </div>

                  {/* Status Progression */}
                  <div className="mb-0">
                    <StatusProgression currentStatus={incident.status} />
                  </div>
                </CardContent>
              </Card>

              {/* Incident Details Master Page - Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-gray-200">
                {/* Left side: Navigation tabs */}
                <div className="flex items-center space-x-0">
                  <button 
                    onClick={() => setActiveDetailsPage('incident')}
                    className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 border-b-2 transition-colors ${
                      activeDetailsPage === 'incident' 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>📋</span>
                    <span>Incident Details</span>
                  </button>

                  <button 
                    onClick={() => setActiveDetailsPage('mitigation')}
                    className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 border-b-2 transition-colors ${
                      activeDetailsPage === 'mitigation' 
                        ? 'border-blue-600 text-blue-600 bg-blue-50' 
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>🔍</span>
                    <span>Mitigation Details</span>
                  </button>

                  {['postmortem', 'closed'].includes(incident.status) && (
                    <button 
                      onClick={() => setActiveDetailsPage('postmortem')}
                      className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 border-b-2 transition-colors ${
                        activeDetailsPage === 'postmortem' 
                          ? 'border-blue-600 text-blue-600 bg-blue-50' 
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span>📄</span>
                      <span>Postmortem Details</span>
                    </button>
                  )}
                </div>

                {/* Right side: Primary action button */}
                {incident.status !== 'closed' && (
                  <button 
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus}
                    className="flex items-center space-x-2 text-sm rounded-lg text-white disabled:opacity-50 font-medium"
                    style={{
                      backgroundColor: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      padding: '8px 16px'
                    }}
                    onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#374151')}
                    onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#000000')}
                  >
                    <span style={{backgroundColor: 'transparent', color: 'white'}}>▶</span>
                    <span style={{backgroundColor: 'transparent', color: 'white'}}>{getButtonText(incident.status)}</span>
                  </button>
                )}
              </div>

              {/* Secondary Action Buttons - Second Row */}
              <div className="flex items-center space-x-2 mt-3">


                {/* Show postmortem button - available only in closed state */}
                {incident.status === 'closed' && (
                  <button 
                    onClick={() => {
                      setShowCompletedPostmortem(prev => !prev);
                    }}
                    className="flex items-center space-x-2 text-sm rounded-lg text-white font-medium"
                    style={{
                      backgroundColor: showCompletedPostmortem ? '#7c3aed' : '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      padding: '8px 16px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = showCompletedPostmortem ? '#6d28d9' : '#374151'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = showCompletedPostmortem ? '#7c3aed' : '#000000'}
                  >
                    <span>📋</span>
                    <span>{showCompletedPostmortem ? 'Hide Postmortem' : 'Show Postmortem'}</span>
                  </button>
                )}
              </div>

              {/* Incident Details Master Page - Tab Content */}
              <div className="mt-6">
                  {/* Page 1: Incident Details Created Details Page */}
                  {activeDetailsPage === 'incident' && (
                    <div className="space-y-4">
                      {/* Basic Information Section */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => toggleDetailSection('basicInfo')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.basicInfo ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Basic Information</span>
                          {detailSectionVisibility.basicInfo ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {detailSectionVisibility.basicInfo && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                              <div className="text-gray-900">{incident.incidentType?.toUpperCase() || 'PLANNED'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Incident Commander</label>
                                <div className="text-gray-900">{incident.incident_commander || 'Not assigned'}</div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Organization</label>
                                <div className="text-gray-900">{incident.reportingOrg || incident.reporting_org || 'Not specified'}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Impact and Scope Classification Section */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => toggleDetailSection('classification')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.classification ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Impact and Scope Classification</span>
                          {detailSectionVisibility.classification ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {detailSectionVisibility.classification && (
                          <div className="space-y-4">
                            {/* Impacted Areas */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Areas</label>
                              <div className="text-gray-900">{Array.isArray(incident.impacted_areas) ? incident.impacted_areas.join(', ') : (incident.impacted_areas || 'Not specified')}</div>
                            </div>
                            {/* Impacted Assets */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Assets</label>
                              <div className="text-gray-900">{Array.isArray(incident.impacted_assets) ? incident.impacted_assets.join(', ') : (incident.impacted_assets || 'Not specified')}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timeline Information Section */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => toggleDetailSection('timeline')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.timeline ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Timeline Information</span>
                          {detailSectionVisibility.timeline ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {detailSectionVisibility.timeline && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Started</label>
                              <div className="text-gray-900">{formatDateTime(incident.started_at)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Detected</label>
                              <div className="text-gray-900">{formatDateTime(incident.detected_at)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Reported</label>
                              <div className="text-gray-900">{formatDateTime(incident.created_at || incident.started_at)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Time to Detection (TTD)</label>
                              <div className="text-gray-900">{calculateTTD(incident.started_at, incident.detected_at)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                              <div className="text-gray-900">{formatDateTime(incident.updatedAt || incident.updated_at)}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Detection Source</label>
                              <div className="text-gray-900">{incident.detectionSource || incident.detection_source || 'Manual'}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Information Section */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => toggleDetailSection('additional')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.additional ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Additional Information</span>
                          {detailSectionVisibility.additional ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {detailSectionVisibility.additional && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Incident No</label>
                              <div className="text-gray-900">#{incident.id}</div>
                            </div>
                            {/* Impacted Locations */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Locations</label>
                              <div className="text-gray-900">{Array.isArray(incident.impacted_locations) ? incident.impacted_locations.join(', ') : (incident.impacted_locations || 'Not specified')}</div>
                            </div>
                            {/* Impacted Parties */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Parties</label>
                              <div className="text-gray-900">{Array.isArray(incident.impacted_parties) ? incident.impacted_parties.join(', ') : (incident.impacted_parties || 'Not specified')}</div>
                            </div>
                            {/* Related Documents */}
                            {incident.documents && incident.documents.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Related Documents</label>
                                <div className="space-y-2">
                                  {incident.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                      <ExternalLink className="h-4 w-4 text-gray-500" />
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        {doc.title || doc.description || doc.url}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Page 2: Incident Details Mitigation Page */}
                  {activeDetailsPage === 'mitigation' && (
                    <div className="space-y-4">
                      <div className="rounded-xl p-6 space-y-4 bg-white shadow-lg">
                        
                        {/* Content based on incident status */}
                        {incident.status === 'mitigating' && (
                          /* Active mitigation - show text box */
                          <div className="space-y-2">
                            <Textarea
                              value={newUpdate}
                              onChange={(e) => setNewUpdate(e.target.value)}
                              className="w-full"
                              rows="3"
                              placeholder="Post an update about this incident..."
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={handlePostUpdate}
                                disabled={isPostingUpdate || !newUpdate.trim()}
                                className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isPostingUpdate ? 'Posting...' : 'Post Update'}
                              >
                                {isPostingUpdate ? (
                                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Saved Posts Timeline - Always show in Mitigation Details tab */}
                        {updates.length > 0 && (
                          <div className="space-y-3 mt-6">
                            {updates
                              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                              .map((update, index) => (
                                <div key={update.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                                  <div className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">{formatDateTime(update.created_at)}</span> by <span className="text-blue-600">{update.author}</span>
                                  </div>
                                  <div className="text-gray-900">{update.content}</div>
                                </div>
                                ))}
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* Page 3: Incident Details Postmortem Page */}
                  {activeDetailsPage === 'postmortem' && (
                    <div className="space-y-4">
                      {/* Section 1: Postmortem Owners */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => togglePostmortemSection('owners')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${postmortemSectionVisibility.owners ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Postmortem Owners</span>
                          {postmortemSectionVisibility.owners ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>

                        {postmortemSectionVisibility.owners && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.author || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    value={postmortemData.author}
                                    onChange={(e) => updatePostmortemData('author', e.target.value)}
                                    placeholder="Postmortem author"
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contributors *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.contributors || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    value={postmortemData.contributors}
                                    onChange={(e) => updatePostmortemData('contributors', e.target.value)}
                                    placeholder="Contributors (comma-separated)"
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Organisation *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.organisation || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    value={postmortemData.organisation}
                                    onChange={(e) => updatePostmortemData('organisation', e.target.value)}
                                    placeholder="Organization"
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Accountable Team *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.accountableTeam || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    value={postmortemData.accountableTeam}
                                    onChange={(e) => updatePostmortemData('accountableTeam', e.target.value)}
                                    placeholder="Accountable team"
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reviewers *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.reviewers || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    value={postmortemData.reviewers}
                                    onChange={(e) => updatePostmortemData('reviewers', e.target.value)}
                                    placeholder="Reviewers (comma-separated)"
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bar Raiser *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.barRaiser || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    value={postmortemData.barRaiser}
                                    onChange={(e) => updatePostmortemData('barRaiser', e.target.value)}
                                    placeholder="Bar raiser"
                                    className="w-full"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 2: Incident Summary */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => togglePostmortemSection('summary')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${postmortemSectionVisibility.summary ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Incident Summary</span>
                          {postmortemSectionVisibility.summary ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>

                        {postmortemSectionVisibility.summary && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Executive Summary *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.executiveSummary || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.executiveSummary}
                                  onChange={(e) => updatePostmortemData('executiveSummary', e.target.value)}
                                  placeholder="High-level summary for executives and stakeholders"
                                  rows={3}
                                  className="w-full"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Summary *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.detailedSummary || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.detailedSummary}
                                  onChange={(e) => updatePostmortemData('detailedSummary', e.target.value)}
                                  placeholder="Detailed technical summary of what happened"
                                  rows={4}
                                  className="w-full"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Key Learnings *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.keyLearnings || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.keyLearnings}
                                  onChange={(e) => updatePostmortemData('keyLearnings', e.target.value)}
                                  placeholder="What we learned from this incident"
                                  rows={3}
                                  className="w-full"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Mitigation Notes *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.mitigationNotes || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.mitigationNotes}
                                  onChange={(e) => updatePostmortemData('mitigationNotes', e.target.value)}
                                  placeholder="Steps taken to mitigate the incident"
                                  rows={3}
                                  className="w-full"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 3: Incident Timestamps */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => togglePostmortemSection('timestamps')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${postmortemSectionVisibility.timestamps ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Incident Timestamps</span>
                          {postmortemSectionVisibility.timestamps ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>

                        {postmortemSectionVisibility.timestamps && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Started At *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.startedAt) || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    type="datetime-local"
                                    value={postmortemData.startedAt ? new Date(postmortemData.startedAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updatePostmortemData('startedAt', e.target.value)}
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Detected At *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.detectedAt) || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    type="datetime-local"
                                    value={postmortemData.detectedAt ? new Date(postmortemData.detectedAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updatePostmortemData('detectedAt', e.target.value)}
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mitigated At *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.mitigatedAt) || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    type="datetime-local"
                                    value={postmortemData.mitigatedAt ? new Date(postmortemData.mitigatedAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updatePostmortemData('mitigatedAt', e.target.value)}
                                    className="w-full"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resolved At *</label>
                                {incident.status === 'closed' ? (
                                  <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.resolvedAt) || 'Not specified'}</div>
                                ) : (
                                  <Input
                                    type="datetime-local"
                                    value={postmortemData.resolvedAt ? new Date(postmortemData.resolvedAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updatePostmortemData('resolvedAt', e.target.value)}
                                    className="w-full"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 4: Impact Assessment */}
                      <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => togglePostmortemSection('impact')}
                          className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${postmortemSectionVisibility.impact ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                        >
                          <span>Impact Assessment</span>
                          {postmortemSectionVisibility.impact ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>

                        {postmortemSectionVisibility.impact && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Business Impact *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.businessImpact || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.businessImpact}
                                  onChange={(e) => updatePostmortemData('businessImpact', e.target.value)}
                                  placeholder="How did this incident affect business operations?"
                                  rows={3}
                                  className="w-full"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Impact *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.customerImpact || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.customerImpact}
                                  onChange={(e) => updatePostmortemData('customerImpact', e.target.value)}
                                  placeholder="How were customers affected?"
                                  rows={3}
                                  className="w-full"
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Stakeholder Impact *</label>
                              {incident.status === 'closed' ? (
                                <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.stakeholderImpact || 'Not specified'}</div>
                              ) : (
                                <Textarea
                                  value={postmortemData.stakeholderImpact}
                                  onChange={(e) => updatePostmortemData('stakeholderImpact', e.target.value)}
                                  placeholder="How were internal stakeholders affected?"
                                  rows={3}
                                  className="w-full"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              {/* OLD SECTIONS - ALWAYS HIDDEN NOW (TABS ALWAYS ACTIVE) */}
              {/* Incident Details - Collapsible Sections */}
              <div className="mt-6 space-y-4" style={{display: 'none'}}>
                {/* Section 1: Basic Information */}
                <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => toggleDetailSection('basicInfo')}
                    className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.basicInfo ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                  >
                    <span>Basic Information</span>
                    {detailSectionVisibility.basicInfo ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {detailSectionVisibility.basicInfo && (
                    <div className="space-y-4">
                      {/* Incident Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                        <div className="text-gray-900">{incident.incidentType?.toUpperCase() || 'PLANNED'}</div>
                      </div>

                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Incident Commander</label>
                          <div className="text-gray-900">{incident.incident_commander || 'Not assigned'}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Organization</label>
                          <div className="text-gray-900">{incident.reportingOrg || incident.reporting_org || 'Not specified'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Impact and Scope Classification */}
                <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => toggleDetailSection('classification')}
                    className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.classification ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                  >
                    <span>Impact and Scope Classification</span>
                    {detailSectionVisibility.classification ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {detailSectionVisibility.classification && (
                    <div className="space-y-4">

                      {/* Impacted Areas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Areas</label>
                        <div className="text-gray-900">{Array.isArray(incident.impacted_areas) ? incident.impacted_areas.join(', ') : (incident.impacted_areas || 'Not specified')}</div>
                      </div>

                      {/* Impacted Assets */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Assets</label>
                        <div className="text-gray-900">{Array.isArray(incident.impacted_assets) ? incident.impacted_assets.join(', ') : (incident.impacted_assets || 'Not specified')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Timeline Information */}
                <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => toggleDetailSection('timeline')}
                    className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.timeline ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                  >
                    <span>Timeline Information</span>
                    {detailSectionVisibility.timeline ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {detailSectionVisibility.timeline && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Started</label>
                        <div className="text-gray-900">{formatDateTime(incident.started_at)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detected</label>
                        <div className="text-gray-900">{formatDateTime(incident.detected_at)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reported</label>
                        <div className="text-gray-900">{formatDateTime(incident.created_at || incident.started_at)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time to Detection (TTD)</label>
                        <div className="text-gray-900">{calculateTTD(incident.started_at, incident.detected_at)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <div className="text-gray-900">{formatDateTime(incident.updatedAt || incident.updated_at)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detection Source</label>
                        <div className="text-gray-900">{incident.detectionSource || incident.detection_source || 'Manual'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Additional Information */}
                <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => toggleDetailSection('additional')}
                    className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${detailSectionVisibility.additional ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                  >
                    <span>Additional Information</span>
                    {detailSectionVisibility.additional ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {detailSectionVisibility.additional && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Incident No</label>
                        <div className="text-gray-900">#{incident.id}</div>
                      </div>

                      {/* Impacted Locations */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Locations</label>
                        <div className="text-gray-900">{Array.isArray(incident.impacted_locations) ? incident.impacted_locations.join(', ') : (incident.impacted_locations || 'Not specified')}</div>
                      </div>

                      {/* Impacted Parties */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Parties</label>
                        <div className="text-gray-900">{Array.isArray(incident.impacted_parties) ? incident.impacted_parties.join(', ') : (incident.impacted_parties || 'Not specified')}</div>
                      </div>

                      {/* Related Documents */}
                      {incident.documents && incident.documents.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Related Documents</label>
                          <div className="space-y-2">
                            {incident.documents.map((doc, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                <ExternalLink className="h-4 w-4 text-gray-500" />
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  {doc.title || doc.description || doc.url}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Updates Modal */}
      {showUpdatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Incident Updates</h2>
              <Button
                onClick={() => setShowUpdatesModal(false)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            {updates.length > 0 ? (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <span className="font-medium text-blue-600">{update.author}</span>
                      <span>•</span>
                      <span>{formatDateTime(update.created_at)}</span>
                    </div>
                    <p className="text-gray-900">{update.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No updates have been posted for this incident.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Postmortem Modal */}
      {showPostmortemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Post-Mortem Analysis</h2>
              <Button
                onClick={() => setShowPostmortemModal(false)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Display postmortem data in read-only format */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Postmortem Owners</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Author:</strong> {postmortemData.author || 'Not specified'}</div>
                  <div><strong>Contributors:</strong> {postmortemData.contributors || 'Not specified'}</div>
                  <div><strong>Organisation:</strong> {postmortemData.organisation || 'Not specified'}</div>
                  <div><strong>Accountable Team:</strong> {postmortemData.accountableTeam || 'Not specified'}</div>
                  <div><strong>Reviewers:</strong> {postmortemData.reviewers || 'Not specified'}</div>
                  <div><strong>Bar Raiser:</strong> {postmortemData.barRaiser || 'Not specified'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Incident Summary</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Executive Summary:</strong><br/>{postmortemData.executiveSummary || 'Not provided'}</div>
                  <div><strong>Detailed Summary:</strong><br/>{postmortemData.detailedSummary || 'Not provided'}</div>
                  <div><strong>Key Learnings:</strong><br/>{postmortemData.keyLearnings || 'Not provided'}</div>
                  <div><strong>Mitigation Notes:</strong><br/>{postmortemData.mitigationNotes || 'Not provided'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Impact Assessment</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Business Impact:</strong><br/>{postmortemData.businessImpact || 'Not provided'}</div>
                  <div><strong>Customer Impact:</strong><br/>{postmortemData.customerImpact || 'Not provided'}</div>
                  <div><strong>Stakeholder Impact:</strong><br/>{postmortemData.stakeholderImpact || 'Not provided'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            </div>
    );
  };

export default IncidentDetailPage; 
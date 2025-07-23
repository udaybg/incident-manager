import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/index.js';
import { 
  Calendar, User, MapPin, Users, AlertTriangle, 
  Clock, Shield, Database, CreditCard, Globe, Mail, ExternalLink, Plus, Send, Edit3
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

    return (
      <div className="flex items-center space-x-4">
        {statuses.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = status.key === currentStatus;
          
          return (
            <div key={status.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                isActive 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-white text-gray-400 border-gray-300'
              }`}>
                {status.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isCurrent ? 'text-green-600' : isActive ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {status.label}
              </span>
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
      'mitigating': 'Mark as Mitigated',
      'resolved': 'Start Postmortem', 
      'postmortem': 'Complete Postmortem'
    };
    return buttonTexts[currentStatus] || 'Update Status';
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus(incident.status);
    if (!nextStatus) {
      alert('No further status changes available');
      return;
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
    });
    setIsEditMode(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });

      if (response.ok) {
        const updatedIncident = await response.json();
        setIncident(updatedIncident);
        setIsEditMode(false);
        setEditedIncident({});
        alert('Incident updated successfully!');
      } else {
        alert('Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Network error occurred');
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
          


          {/* Main Layout: Left content and Right sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Content (3/4 width) */}
            <div className="lg:col-span-3 space-y-2">
              
                             {/* Main Incident Card */}
               <Card className="bg-white border border-gray-200">
                 <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      {/* Level & Scope Badge and Title on same line */}
                      <div className="flex items-center space-x-4 mb-1">
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
                  <div className="mb-1">
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

                  {/* Incident Commander */}
                  <div className="mb-4">
                    {!isEditMode ? (
                      <p className="text-blue-600 underline cursor-pointer">{incident.incidentCommander || 'Not assigned'}</p>
                    ) : (
                      <Input
                        type="email"
                        value={editedIncident.incident_commander || ''}
                        onChange={(e) => handleFieldChange('incident_commander', e.target.value)}
                        className="text-blue-600 border-2 border-blue-500"
                        placeholder="commander@company.com"
                      />
                    )}
                  </div>

                  {/* Status Progression */}
                  <div className="mb-2">
                    <StatusProgression currentStatus={incident.status} />
                  </div>
                </CardContent>
              </Card>

                             {/* Action Buttons */}
               <div className="flex items-center space-x-2">
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
                     <span>▶</span>
                     <span>{getButtonText(incident.status)}</span>
                   </button>
                 )}
                 <button 
                   onClick={() => {
                     // TODO: Implement mark as duplicate functionality
                     alert('Mark as duplicate functionality to be implemented');
                   }}
                   className="flex items-center space-x-2 text-sm rounded-lg text-white font-medium"
                   style={{
                     backgroundColor: '#000000',
                     border: 'none',
                     borderRadius: '8px',
                     fontSize: '14px',
                     padding: '8px 16px'
                   }}
                   onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                   onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                 >
                   <span>📋</span>
                   <span>Mark as duplicate</span>
                 </button>
               </div>

                                            {/* Post an Update */}
               <div className="flex items-center space-x-2 mb-3">
                 <Textarea
                   value={newUpdate}
                   onChange={(e) => setNewUpdate(e.target.value)}
                   placeholder="Post an update about this incident..."
                   rows={2}
                   className="flex-1 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 rounded-lg border border-black"
                   style={{ backgroundColor: '#dbdfe3' }}
                 />
                 <Button 
                   onClick={handlePostUpdate}
                   disabled={isPostingUpdate || !newUpdate.trim()}
                   className="bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center p-2 rounded-lg"
                 >
                   <Send className="h-4 w-4" />
                 </Button>
               </div>

                             {/* Updates Timeline */}
               {updates.length > 0 && (
                 <div className="space-y-2">
                   {updates.map((update) => (
                     <div key={update.id} className="flex items-start space-x-2">
                       {/* Timeline icon */}
                       <div className="flex-shrink-0 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center mt-1">
                         <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                       </div>
                       
                       {/* Update content */}
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                           <span>{formatDateTime(update.created_at).split(' (')[0]}</span>
                           <span>by</span>
                           <span className="font-medium text-blue-600 underline">{update.author}</span>
                           <span>:</span>
                         </div>
                         <div className="py-1">
                           <p className="text-gray-900 text-xs">{update.content}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Right Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              <Card className="bg-white border border-gray-200 sticky top-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-900">Incident Details</CardTitle>
                    {!isEditMode ? (
                      <button
                        onClick={handleEnterEditMode}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Edit incident details"
                      >
                        <Edit3 className="h-4 w-4 text-gray-600" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          title="Save changes"
                        >
                          {isSaving && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>}
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                          title="Cancel editing"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                   <div className="space-y-2 text-xs">
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Author</span>
                      <span className="font-medium">{incident.incidentCommander || 'Not assigned'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Incident No</span>
                      <span className="font-medium">#{incident.id}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Started</span>
                      <div className="text-right">
                        <div className="font-medium">{formatDateTime(incident.startedAt)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Detected</span>
                      <div className="text-right">
                        <div className="font-medium">{formatDateTime(incident.incidentDetectedAt)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Reported</span>
                      <div className="text-right">
                        <div className="font-medium">{formatDateTime(incident.createdAt || incident.startedAt)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">TTD</span>
                      <span className="font-medium">{calculateTTD(incident.startedAt, incident.incidentDetectedAt)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium">{incident.incidentType?.toUpperCase() || 'PLANNED'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Flags</span>
                      <span className="font-medium">None</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Reporting Org</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.reportingOrg || incident.reporting_org || 'Not specified'}</span>
                      ) : (
                        <Input
                          value={editedIncident.reporting_org || ''}
                          onChange={(e) => handleFieldChange('reporting_org', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Organization"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <div className="text-right">
                        <div className="font-medium">{formatDateTime(incident.updatedAt || incident.updated_at)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Detection Source</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.detectionSource || incident.detection_source || 'Manual'}</span>
                      ) : (
                        <Input
                          value={editedIncident.detection_source || ''}
                          onChange={(e) => handleFieldChange('detection_source', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Source"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Safety & Compliance</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.safetyCompliance || incident.safety_compliance || 'Not known yet'}</span>
                      ) : (
                        <Input
                          value={editedIncident.safety_compliance || ''}
                          onChange={(e) => handleFieldChange('safety_compliance', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Impact"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Security & Privacy</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.securityPrivacy || incident.security_privacy || 'Not known yet'}</span>
                      ) : (
                        <Input
                          value={editedIncident.security_privacy || ''}
                          onChange={(e) => handleFieldChange('security_privacy', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Impact"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Quality</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.dataQuality || incident.data_quality || 'Not known yet'}</span>
                      ) : (
                        <Input
                          value={editedIncident.data_quality || ''}
                          onChange={(e) => handleFieldChange('data_quality', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Impact"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">PSD2 Review</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.psd2Impact || incident.psd2_impact || 'Not known yet'}</span>
                      ) : (
                        <Input
                          value={editedIncident.psd2_impact || ''}
                          onChange={(e) => handleFieldChange('psd2_impact', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Impact"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Impacted Parties</span>
                      <span className="font-medium">
                        {incident.impactedParties && incident.impactedParties.length > 0 
                          ? incident.impactedParties.join(', ') 
                          : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Impacted Areas</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.impactedAreas || 'None'}</span>
                      ) : (
                        <Input
                          value={editedIncident.impacted_areas || ''}
                          onChange={(e) => handleFieldChange('impacted_areas', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Areas"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Impacted Assets</span>
                      {!isEditMode ? (
                        <span className="font-medium">{incident.impactedAssets || 'None'}</span>
                      ) : (
                        <Input
                          value={editedIncident.impacted_assets || ''}
                          onChange={(e) => handleFieldChange('impacted_assets', e.target.value)}
                          className="text-xs font-medium border border-blue-500 w-32"
                          placeholder="Assets"
                        />
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Impacted Locations</span>
                      <span className="font-medium">
                        {incident.impactedLocations && incident.impactedLocations.length > 0 
                          ? incident.impactedLocations.join(', ') 
                          : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Related Documents</span>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>

            </div>
    );
  };

export default IncidentDetailPage; 
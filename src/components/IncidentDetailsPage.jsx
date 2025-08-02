import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/index.js';
import { 
  Calendar, User, MapPin, Users, AlertTriangle, 
  Clock, Shield, Database, CreditCard, Globe, Mail, ExternalLink, Edit3,
  ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { getFieldLabel, getOptionsForField } from '../config/formConfig.js';

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedIncident, setEditedIncident] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Section visibility states for collapsible sections
  const [sectionVisibility, setSectionVisibility] = useState({
    basicInfo: true,
    classification: true,
    timeline: true,
    additional: true
  });

  const toggleSection = (section) => {
    setSectionVisibility(prev => ({
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
    const colors = {
      'reported': 'bg-red-100 text-red-800',
      'mitigating': 'bg-yellow-100 text-yellow-800', 
      'resolved': 'bg-green-100 text-green-800',
      'postmortem': 'bg-blue-100 text-blue-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLevelBackgroundColor = (level, scope) => {
    if (level === 'P0' && scope === 'major') return 'bg-red-600';
    if (level === 'P0') return 'bg-red-500';
    if (level === 'P1' && scope === 'major') return 'bg-orange-600';
    if (level === 'P1') return 'bg-orange-500';
    if (level === 'P2' && scope === 'major') return 'bg-yellow-600';
    if (level === 'P2') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getScopeBorderColor = (level, scope) => {
    if (level === 'P0' && scope === 'major') return 'border-red-600';
    if (level === 'P0') return 'border-red-500';
    if (level === 'P1' && scope === 'major') return 'border-orange-600';
    if (level === 'P1') return 'border-orange-500';
    if (level === 'P2' && scope === 'major') return 'border-yellow-600';
    if (level === 'P2') return 'border-yellow-500';
    return 'border-gray-500';
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
              <div className="flex items-center">
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
              </div>
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

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    const nextStatus = getNextStatus(incident.status);
    
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
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEnterEditMode = () => {
    setEditedIncident(incident);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedIncident({});
    setIsEditMode(false);
  };

  const handleFieldChange = (field, value) => {
    setEditedIncident(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedIncident),
      });

      if (response.ok) {
        const updatedIncident = await response.json();
        setIncident(updatedIncident);
        setIsEditMode(false);
        setEditedIncident({});
      } else {
        console.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-xl">{error}</div>
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
          
          {/* Navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/incidents')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Incidents</span>
            </button>
            
            {/* Page Navigation */}
            <div className="flex space-x-4">
              <Link
                to={`/incidents/${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                📋 Incident Details
              </Link>
              {['mitigating', 'resolved', 'postmortem', 'closed'].includes(incident.status) && (
                <Link
                  to={`/incidents/${id}/mitigation`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
                >
                  🔍 Mitigation Details
                </Link>
              )}
              {['postmortem', 'closed'].includes(incident.status) && (
                <Link
                  to={`/incidents/${id}/postmortem`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
                >
                  📊 Postmortem Details
                </Link>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6">
              
              {/* Main Incident Card */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Level & Scope Badge */}
                      <div className="mb-2">
                        {!isEditMode ? (
                          <div className="flex items-center font-bold text-xs">
                            <span className={`${getLevelBackgroundColor(incident.level, incident.scope)} text-white px-2 py-1 rounded-l border-2 border-r-0 ${getScopeBorderColor(incident.level, incident.scope)}`}>
                              {incident.level}
                            </span>
                            <span className={`bg-white text-black px-2 py-1 rounded-r border-2 border-l-0 ${getScopeBorderColor(incident.level, incident.scope)}`}>
                              {incident.scope.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Select value={editedIncident.level || ''} onValueChange={(value) => handleFieldChange('level', value)}>
                              <SelectTrigger className="w-32 text-xs border border-blue-500">
                                <SelectValue placeholder="Level" />
                              </SelectTrigger>
                              <SelectContent>
                                {getOptionsForField('level').map(option => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={editedIncident.scope || ''} onValueChange={(value) => handleFieldChange('scope', value)}>
                              <SelectTrigger className="w-32 text-xs border border-blue-500">
                                <SelectValue placeholder="Scope" />
                              </SelectTrigger>
                              <SelectContent>
                                {getOptionsForField('scope').map(option => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Title */}
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
                  <div className="mb-4">
                    <StatusProgression currentStatus={incident.status} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    {/* Edit/Save Controls */}
                    <div className="flex space-x-2">
                      {!isEditMode ? (
                        <button
                          onClick={handleEnterEditMode}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Details</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isSaving && <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>}
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                    {/* Status Update Button */}
                    {incident.status !== 'closed' && (
                      <button
                        onClick={handleStatusUpdate}
                        disabled={isUpdatingStatus}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isUpdatingStatus && <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>}
                        <span>{getButtonText(incident.status)}</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information Section */}
              <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Incident ID:</strong> {incident.id}</div>
                    <div><strong>Reporter:</strong> {incident.reporter_name}</div>
                    <div><strong>Owner:</strong> {incident.owner || 'Not assigned'}</div>
                    <div><strong>Assignee:</strong> {incident.assignee || 'Not assigned'}</div>
                    <div><strong>Incident Commander:</strong> {incident.incident_commander || 'Not assigned'}</div>
                    <div><strong>Status:</strong> <Badge className={getStatusBadgeColor(incident.status)}>{incident.status}</Badge></div>
                  </div>
                )}
              </div>

              {/* Classification Information */}
              <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('classification')}
                  className={`w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700 ${sectionVisibility.classification ? 'border-b border-gray-200 pb-2' : 'pb-0'}`}
                >
                  <span>Classification Information</span>
                  {sectionVisibility.classification ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {sectionVisibility.classification && (
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <strong>Systems Affected:</strong>
                      <div className="mt-1 text-gray-700">{incident.systems_affected || 'Not specified'}</div>
                    </div>
                    <div>
                      <strong>Service:</strong>
                      <div className="mt-1 text-gray-700">{incident.service || 'Not specified'}</div>
                    </div>
                    <div>
                      <strong>Stakeholders:</strong>
                      <div className="mt-1 text-gray-700">{incident.stakeholders || 'Not specified'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Information */}
              <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Created:</strong> {formatDateTime(incident.created_at)}</div>
                    <div><strong>Last Updated:</strong> {formatDateTime(incident.updated_at)}</div>
                    {incident.first_identified && (
                      <div><strong>First Identified:</strong> {formatDateTime(incident.first_identified)}</div>
                    )}
                    {incident.escalated_at && (
                      <div><strong>Escalated At:</strong> {formatDateTime(incident.escalated_at)}</div>
                    )}
                    {incident.resolved_at && (
                      <div><strong>Resolved At:</strong> {formatDateTime(incident.resolved_at)}</div>
                    )}
                    {incident.closed_at && (
                      <div><strong>Closed At:</strong> {formatDateTime(incident.closed_at)}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="rounded-xl p-6 space-y-6 bg-white shadow-lg">
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
                  <div className="space-y-4 text-sm">
                    <div>
                      <strong>Communication Channels:</strong>
                      <div className="mt-1 text-gray-700">
                        {incident.communication_channels && incident.communication_channels.length > 0 ? (
                          incident.communication_channels.map((channel, index) => (
                            <div key={index} className="text-blue-600">
                              <a href={channel.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                                {channel.name}
                              </a>
                            </div>
                          ))
                        ) : (
                          'No communication channels specified'
                        )}
                      </div>
                    </div>
                    <div>
                      <strong>Related Documents:</strong>
                      <div className="mt-1 text-gray-700">
                        {incident.documents && incident.documents.length > 0 ? (
                          incident.documents.map((doc, index) => (
                            <div key={index} className="text-blue-600">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                                {doc.title || 'Untitled Document'}
                              </a>
                            </div>
                          ))
                        ) : (
                          'No related documents'
                        )}
                      </div>
                    </div>
                    <div>
                      <strong>Tags:</strong>
                      <div className="mt-1 text-gray-700">{incident.tags && incident.tags.length > 0 ? incident.tags.join(', ') : 'No tags'}</div>
                    </div>
                    <div>
                      <strong>Change ID:</strong>
                      <div className="mt-1 text-gray-700">{incident.change_id || 'Not specified'}</div>
                    </div>
                    <div>
                      <strong>Learning Document:</strong>
                      <div className="mt-1 text-gray-700">
                        {incident.learning_document ? (
                          <a href={incident.learning_document} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            View Learning Document
                          </a>
                        ) : (
                          'No learning document available'
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsPage; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Textarea
} from './ui/index.js';
import { 
  ArrowLeft, Users, FileText, Clock, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';

const PostmortemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const [sectionVisibility, setSectionVisibility] = useState({
    owners: true,
    summary: true,
    timestamps: true,
    impact: true
  });

  const toggleSection = (section) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updatePostmortemData = (field, value) => {
    setPostmortemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`);
        if (response.ok) {
          const incidentData = await response.json();
          setIncident(incidentData);
          
          // Pre-populate postmortem data if already exists or with incident information
          if (incidentData.postmortem_data) {
            setPostmortemData(incidentData.postmortem_data);
          } else {
            // Pre-populate with incident information
            setPostmortemData(prev => ({
              ...prev,
              author: incidentData.incident_commander || '',
              organisation: incidentData.reporting_org || '',
              startedAt: incidentData.started_at || '',
              detectedAt: incidentData.detected_at || '',
              mitigatedAt: incidentData.updated_at || '',
              resolvedAt: incidentData.resolved_at || ''
            }));
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

  const handleSavePostmortem = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/postmortem/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postmortemData),
      });

      if (response.ok) {
        // Optionally update the incident status to 'closed' after saving postmortem
        const statusResponse = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'closed' }),
        });

        if (statusResponse.ok) {
          const updatedIncident = await statusResponse.json();
          setIncident(updatedIncident);
        }
      } else {
        console.error('Failed to save postmortem');
      }
    } catch (error) {
      console.error('Error saving postmortem:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validatePostmortemData = () => {
    const requiredFields = [
      'author', 'contributors', 'organisation', 'accountableTeam',
      'executiveSummary', 'detailedSummary', 'keyLearnings', 'mitigationNotes',
      'startedAt', 'detectedAt', 'mitigatedAt', 'resolvedAt',
      'businessImpact', 'customerImpact', 'stakeholderImpact'
    ];

    const missingFields = requiredFields.filter(field => !postmortemData[field]?.trim());
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields.map(field => field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
    };
  };

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

  const validation = validatePostmortemData();
  const isReadOnly = incident.status === 'closed';

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
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                📋 Incident Details
              </Link>
              <Link
                to={`/incidents/${id}/mitigation`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                🔍 Mitigation Details
              </Link>
              <Link
                to={`/incidents/${id}/postmortem`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                📊 Postmortem Details
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6">
              
              {/* Header Card */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Postmortem Analysis - {incident.title}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusBadgeColor(incident.status)}>
                          {incident.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Incident #{incident.id}
                        </span>
                        {!isReadOnly && (
                          <span className="text-sm text-orange-600 font-medium">
                            Draft Mode
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Level</div>
                      <div className="text-lg font-bold">{incident.level} - {incident.scope}</div>
                    </div>
                  </div>
                  
                  {!isReadOnly && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {validation.isValid ? (
                          <span className="text-green-600">✓ All required fields completed</span>
                        ) : (
                          <span className="text-orange-600">
                            {validation.missingFields.length} required fields remaining
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleSavePostmortem}
                        disabled={isSaving || !validation.isValid}
                        className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving && <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>}
                        <span>{isSaving ? 'Saving...' : 'Complete Postmortem'}</span>
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 1: Postmortem Owners */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <button
                    type="button"
                    onClick={() => toggleSection('owners')}
                    className="w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Postmortem Owners</span>
                    </div>
                    {sectionVisibility.owners ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </CardHeader>
                {sectionVisibility.owners && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                        {isReadOnly ? (
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
                        {isReadOnly ? (
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
                        {isReadOnly ? (
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
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.accountableTeam || 'Not specified'}</div>
                        ) : (
                          <Input
                            value={postmortemData.accountableTeam}
                            onChange={(e) => updatePostmortemData('accountableTeam', e.target.value)}
                            placeholder="Team accountable for this incident"
                            className="w-full"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reviewers</label>
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.reviewers || 'Not specified'}</div>
                        ) : (
                          <Input
                            value={postmortemData.reviewers}
                            onChange={(e) => updatePostmortemData('reviewers', e.target.value)}
                            placeholder="Postmortem reviewers (comma-separated)"
                            className="w-full"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bar Raiser</label>
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{postmortemData.barRaiser || 'Not specified'}</div>
                        ) : (
                          <Input
                            value={postmortemData.barRaiser}
                            onChange={(e) => updatePostmortemData('barRaiser', e.target.value)}
                            placeholder="Bar raiser for this postmortem"
                            className="w-full"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Section 2: Incident Summary */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <button
                    type="button"
                    onClick={() => toggleSection('summary')}
                    className="w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Incident Summary</span>
                    </div>
                    {sectionVisibility.summary ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </CardHeader>
                {sectionVisibility.summary && (
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Executive Summary *</label>
                      {isReadOnly ? (
                        <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.executiveSummary || 'Not specified'}</div>
                      ) : (
                        <Textarea
                          value={postmortemData.executiveSummary}
                          onChange={(e) => updatePostmortemData('executiveSummary', e.target.value)}
                          placeholder="Brief executive summary of the incident"
                          rows={3}
                          className="w-full"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Summary *</label>
                      {isReadOnly ? (
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
                      {isReadOnly ? (
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
                      {isReadOnly ? (
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
                  </CardContent>
                )}
              </Card>

              {/* Section 3: Incident Timestamps */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <button
                    type="button"
                    onClick={() => toggleSection('timestamps')}
                    className="w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Incident Timestamps</span>
                    </div>
                    {sectionVisibility.timestamps ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </CardHeader>
                {sectionVisibility.timestamps && (
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Started At *</label>
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.startedAt)}</div>
                        ) : (
                          <Input
                            type="datetime-local"
                            value={postmortemData.startedAt}
                            onChange={(e) => updatePostmortemData('startedAt', e.target.value)}
                            className="w-full"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detected At *</label>
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.detectedAt)}</div>
                        ) : (
                          <Input
                            type="datetime-local"
                            value={postmortemData.detectedAt}
                            onChange={(e) => updatePostmortemData('detectedAt', e.target.value)}
                            className="w-full"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mitigated At *</label>
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.mitigatedAt)}</div>
                        ) : (
                          <Input
                            type="datetime-local"
                            value={postmortemData.mitigatedAt}
                            onChange={(e) => updatePostmortemData('mitigatedAt', e.target.value)}
                            className="w-full"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resolved At *</label>
                        {isReadOnly ? (
                          <div className="text-gray-900 p-2 bg-gray-50 rounded">{formatDateTime(postmortemData.resolvedAt)}</div>
                        ) : (
                          <Input
                            type="datetime-local"
                            value={postmortemData.resolvedAt}
                            onChange={(e) => updatePostmortemData('resolvedAt', e.target.value)}
                            className="w-full"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Section 4: Impact Assessment */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <button
                    type="button"
                    onClick={() => toggleSection('impact')}
                    className="w-full flex items-center justify-between text-lg font-bold text-gray-900 hover:text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Impact Assessment</span>
                    </div>
                    {sectionVisibility.impact ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </CardHeader>
                {sectionVisibility.impact && (
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Impact *</label>
                      {isReadOnly ? (
                        <div className="text-gray-900 p-2 bg-gray-50 rounded whitespace-pre-wrap">{postmortemData.businessImpact || 'Not specified'}</div>
                      ) : (
                        <Textarea
                          value={postmortemData.businessImpact}
                          onChange={(e) => updatePostmortemData('businessImpact', e.target.value)}
                          placeholder="How did this incident affect the business?"
                          rows={3}
                          className="w-full"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Impact *</label>
                      {isReadOnly ? (
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
                      {isReadOnly ? (
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
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostmortemDetailsPage; 
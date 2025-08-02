import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Badge, Textarea
} from './ui/index.js';
import { 
  Send, ArrowLeft, MessageSquare
} from 'lucide-react';

const MitigationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/incidents/${id}/`);
        if (response.ok) {
          const incidentData = await response.json();
          setIncident(incidentData);
          // Set updates from the incident data
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
          author: 'Current User', // This should come from auth context
        }),
      });

      if (response.ok) {
        const newUpdateData = await response.json();
        setUpdates(prev => [newUpdateData, ...prev]);
        setNewUpdate('');
      } else {
        console.error('Failed to post update');
      }
    } catch (error) {
      console.error('Error posting update:', error);
    } finally {
      setIsPostingUpdate(false);
    }
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                🔍 Mitigation Details
              </Link>
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
              
              {/* Header Card */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Mitigation Details - {incident.title}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusBadgeColor(incident.status)}>
                          {incident.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Incident #{incident.id}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Level</div>
                      <div className="text-lg font-bold">{incident.level} - {incident.scope}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mitigation Updates */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Mitigation Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  
                  {/* Post New Update - Only in mitigating status */}
                  {incident.status === 'mitigating' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="text-lg font-medium text-yellow-800 mb-3">Post Mitigation Update</h3>
                      <div className="space-y-3">
                        <Textarea
                          value={newUpdate}
                          onChange={(e) => setNewUpdate(e.target.value)}
                          className="w-full"
                          rows="4"
                          placeholder="Post an update about this incident's mitigation progress..."
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handlePostUpdate}
                            disabled={isPostingUpdate || !newUpdate.trim()}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPostingUpdate ? (
                              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            <span>{isPostingUpdate ? 'Posting...' : 'Post Update'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Updates Timeline */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Mitigation Timeline ({updates.length} updates)
                    </h3>
                    
                    {updates.length > 0 ? (
                      <div className="space-y-4">
                        {updates
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                          .map((update, index) => (
                            <div key={update.id || index} className="border-l-4 border-blue-500 pl-6 py-3 bg-gray-50 rounded-r-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-blue-600">{update.author}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-gray-600">{formatDateTime(update.created_at)}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Update #{updates.length - index}
                                </div>
                              </div>
                              <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {update.content}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">No mitigation updates yet</h3>
                        <p className="text-sm">
                          {incident.status === 'mitigating' 
                            ? 'Post the first update to track mitigation progress.'
                            : 'No updates were posted during the mitigation phase.'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Mitigation Summary</h3>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{updates.length}</div>
                      <div className="text-sm text-gray-600">Updates Posted</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {incident.status === 'resolved' || incident.status === 'postmortem' || incident.status === 'closed' ? '✓' : '○'}
                      </div>
                      <div className="text-sm text-gray-600">Resolution Status</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {incident.resolved_at ? formatDateTime(incident.resolved_at).split(',')[0] : 'In Progress'}
                      </div>
                      <div className="text-sm text-gray-600">Resolution Date</div>
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

export default MitigationDetailsPage; 
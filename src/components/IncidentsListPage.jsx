import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent, Button, Input, 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, MultiSelect 
} from './ui/index.js';
import { Search, Plus, Menu, Filter, RefreshCw, Calendar, Users, AlertTriangle, Edit } from 'lucide-react';
import { getOptionsForField } from '../config/formConfig.js';
import { 
  getIncidentBorderColor, getLevelBackgroundColor, getScopeBorderColor,
  getStatusBadgeStyle, getIncidentTypeBadgeStyle 
} from '../config/colorConfig.js';

// Hamburger Menu Icon Component
const HamburgerIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor"/>
    <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/>
    <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor"/>
  </svg>
);

const IncidentsListPage = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  
     // Filter states
   const [filters, setFilters] = useState({
     impactedLocations: [],
     impactedParties: [],
     incidentType: [],
     status: [],
     detectionSource: [],
     reportingOrg: [],
     incidentCommander: [],
     impactedAssets: [],
     impactedAreas: []
   });
  
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  // Fetch incidents from API
  const fetchIncidents = async () => {
    try {
      setLoading(true);
             const params = new URLSearchParams();
       if (search) params.append('search', search);
       
       // Add filters with multiple values as comma-separated strings for custom FilterSet
       if (filters.impactedLocations.length > 0) {
         params.append('impacted_locations', filters.impactedLocations.join(','));
       }
       if (filters.impactedParties.length > 0) {
         params.append('impacted_parties', filters.impactedParties.join(','));
       }
       if (filters.incidentType.length > 0) {
         filters.incidentType.forEach(type => params.append('incident_type', type));
       }
       if (filters.status.length > 0) {
         filters.status.forEach(status => params.append('status', status));
       }
       if (filters.detectionSource.length > 0) {
         filters.detectionSource.forEach(source => params.append('detection_source', source));
       }
       if (filters.reportingOrg.length > 0) {
         filters.reportingOrg.forEach(org => params.append('reporting_org', org));
       }
       if (filters.incidentCommander.length > 0) {
         filters.incidentCommander.forEach(commander => params.append('incident_commander', commander));
       }
       if (filters.impactedAssets.length > 0) {
         filters.impactedAssets.forEach(asset => params.append('impacted_assets', asset));
       }
       if (filters.impactedAreas.length > 0) {
         filters.impactedAreas.forEach(area => params.append('impacted_areas', area));
       }

      const url = `http://localhost:8000/api/v1/incidents/?${params}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setIncidents(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous
        });
      } else {
        setError('Failed to fetch incidents');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, filters]);



  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h ${diffMinutes % 60}m`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes % 60}m`;
    return `${diffMinutes}m`;
  };

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

     // Clear all filters
   const clearFilters = () => {
     setFilters({
       impactedLocations: [],
       impactedParties: [],
       incidentType: [],
       status: [],
       detectionSource: [],
       reportingOrg: [],
       incidentCommander: [],
       impactedAssets: [],
       impactedAreas: []
     });
     setSearch('');
   };

          // Sidebar component
   const FilterSidebar = () => (
     <div className={`${sidebarMinimized ? 'w-16' : 'w-80'} transition-all duration-300 ${sidebarMinimized ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'} flex-shrink-0 relative overflow-hidden`}>
       {/* Toggle button at top of dividing line */}
       <Button
         onClick={() => setSidebarMinimized(!sidebarMinimized)}
         variant="ghost"
         className="absolute -right-3 top-4 z-10 bg-white border border-gray-300 rounded-full p-1.5 shadow-lg hover:shadow-xl"
         title={sidebarMinimized ? "Expand filters" : "Minimize filters"}
       >
         <HamburgerIcon className="h-3 w-3 text-gray-700" />
       </Button>
       
       <div className={`${sidebarMinimized ? 'p-2' : ''} h-full flex flex-col overflow-hidden`}>
        {sidebarMinimized ? (
          <div className="flex flex-col h-full pt-4">
            {/* Filter icon next to hamburger */}
            <div className="flex justify-start">
              <Filter className="h-5 w-5 text-white" />
            </div>
          </div>
        ) : (
          <>
            {/* Fixed Filters Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
            </div>
            
            {/* Scrollable filters content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Impacted Locations */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Impacted locations</h3>
          <MultiSelect values={filters.impactedLocations} onValuesChange={(values) => updateFilter('impactedLocations', values)} placeholder="Select locations...">
            <SelectContent>
              {getOptionsForField('impactedLocations').map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Impacted Parties */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Impacted parties</h3>
          <MultiSelect values={filters.impactedParties} onValuesChange={(values) => updateFilter('impactedParties', values)} placeholder="Select parties...">
            <SelectContent>
              {getOptionsForField('impactedParties').map((party) => (
                <SelectItem key={party.value} value={party.value}>
                  {party.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Incident Type */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Incident type</h3>
          <MultiSelect values={filters.incidentType} onValuesChange={(values) => updateFilter('incidentType', values)} placeholder="Select types...">
            <SelectContent>
              {getOptionsForField('incidentTypes').map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Incident Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Incident status</h3>
          <MultiSelect values={filters.status} onValuesChange={(values) => updateFilter('status', values)} placeholder="Select statuses...">
            <SelectContent>
              <SelectItem value="reported">Reported</SelectItem>
              <SelectItem value="mitigating">Mitigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="postmortem">Postmortem</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Detection Source */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Detection source</h3>
          <MultiSelect values={filters.detectionSource} onValuesChange={(values) => updateFilter('detectionSource', values)} placeholder="Select sources...">
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Automated">Automated</SelectItem>
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Reporting Organisation */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Reporting organisation</h3>
          <MultiSelect values={filters.reportingOrg} onValuesChange={(values) => updateFilter('reportingOrg', values)} placeholder="Select organisations...">
            <SelectContent>
              {getOptionsForField('reportingOrganizations').map((org) => (
                <SelectItem key={org.value} value={org.value}>
                  {org.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Incident Commander */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Incident commander</h3>
          <MultiSelect values={filters.incidentCommander} onValuesChange={(values) => updateFilter('incidentCommander', values)} placeholder="Select commanders...">
            <SelectContent>
              {getOptionsForField('incidentCommanders').map((commander) => (
                <SelectItem key={commander.value} value={commander.value}>
                  {commander.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Impacted Assets */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Impacted assets</h3>
          <MultiSelect values={filters.impactedAssets} onValuesChange={(values) => updateFilter('impactedAssets', values)} placeholder="Select assets...">
            <SelectContent>
              {getOptionsForField('impactedAssetsOptions').map((asset) => (
                <SelectItem key={asset.value} value={asset.value}>
                  {asset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>

        {/* Impacted Areas */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Impacted areas</h3>
          <MultiSelect values={filters.impactedAreas} onValuesChange={(values) => updateFilter('impactedAreas', values)} placeholder="Select areas...">
            <SelectContent>
              {getOptionsForField('impactedAreasOptions').map((area) => (
                <SelectItem key={area.value} value={area.value}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </MultiSelect>
        </div>



            </div>
            
            {/* Fixed Clear Filters Footer */}
            <div className="bg-white border-t border-gray-200 px-4 flex-shrink-0">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear all filters
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex overflow-hidden" style={{ backgroundColor: '#dbdfe3', height: 'calc(100vh - 64px)' }}>
        <FilterSidebar />
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Loading incidents...</p>
          </div>
        </div>
      </div>
    );
  }

     return (
     <div className="flex overflow-hidden" style={{ backgroundColor: '#dbdfe3', height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <FilterSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-gray-900">Incidents</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{pagination.count} total incidents</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative max-w-2xl">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search for Incidents by title, description, #number, commander, or reporter email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
              />
              <Button
                onClick={fetchIncidents}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                variant="ghost"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Global Status */}
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Active incidents:</span>
              <Badge className="bg-red-100 text-red-800 border border-red-200">
                Reported
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
                Mitigating
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Party impact:</span>
              <div className="flex flex-wrap gap-1">
                {['drivers', 'eaters', 'engineering', 'ops'].map((party) => (
                  <Badge key={party} className="bg-green-100 text-green-800 border border-green-200 text-xs">
                    {party}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Incidents Container - ONLY incident cards scroll */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#dbdfe3' }}>
          <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
              <Button 
                onClick={fetchIncidents}
                className="mt-2 text-red-600 hover:text-red-800"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}

          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No incidents found</p>
              <Button 
                onClick={() => navigate('/create-incident')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Report Your First Incident
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card 
                  key={incident.id} 
                  className={`border-l-4 ${getIncidentBorderColor(incident.level, incident.scope)} bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer relative ${
                    incident.status === 'closed' ? 'opacity-70' : ''
                  }`}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  {/* Closed Incident Overlay */}
                  {incident.status === 'closed' && (
                    <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                      <span>✓</span>
                      <span>COMPLETED</span>
                    </div>
                  )}
                                    <div className="p-3">
                    <div className="flex justify-between">
                      {/* Left side - Main incident info */}
                      <div className="flex-1">
                        {/* First line: level-scope badge, incident type badge, status badge */}
                        <div className="flex items-center space-x-3 mb-1">
                          {/* Merged Level-Scope Badge */}
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
                          {/* Incident Type Badge */}
                          <span className={`${getIncidentTypeBadgeStyle(incident.incident_type)} rounded-full text-xs px-2 py-0`}>
                            {incident.incident_type}
                          </span>
                          {/* Status Badge - Always show actual status */}
                          <span className={`${getStatusBadgeStyle(incident.status)} rounded-full text-xs px-2 py-0`}>
                            {incident.status}
                          </span>
                        </div>

                        {/* Second line: incident number and title */}
                        <div className="mb-1">
                          <span className="text-sm font-bold text-gray-900">{incident.display_id || `#${incident.id}`} | </span>
                          <span className="text-base font-bold text-gray-900">{incident.title}</span>
                        </div>

                        {/* Third line: description */}
                        {incident.description && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {incident.description.length > 120 
                                ? `${incident.description.substring(0, 120)}...` 
                                : incident.description}
                            </p>
                          </div>
                        )}

                        {/* Fourth line: impacted parties */}
                        <div className="flex flex-wrap gap-1">
                          {incident.impacted_parties_display?.split(', ').map((party, index) => (
                            <Badge key={index} className="bg-gray-100 text-gray-700 text-xs px-1 py-0">
                              {party.toLowerCase()}
                            </Badge>
                          )) || (
                            <Badge className="bg-gray-100 text-gray-700 text-xs px-1 py-0">
                              None
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Right side - Timeline info */}
                      <div className="flex-shrink-0 text-right text-xs text-gray-600 ml-4 space-y-0.5">
                        {/* Started date and duration */}
                        <div className="flex items-center justify-end space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Started {formatDate(incident.started_at)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          active for {formatRelativeTime(incident.started_at)}
                        </div>
                        
                        {/* Incident Commander */}
                        <div className="flex items-center justify-end space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{incident.incident_commander || 'Not assigned'}</span>
                        </div>
                        
                        {/* Updated date */}
                        <div className="flex items-center justify-end space-x-1">
                          <Edit className="h-3 w-3" />
                          <span>Updated on {formatDate(incident.updated_at || incident.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentsListPage; 
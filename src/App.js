import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import IncidentCreationPage from './components/IncidentCreationPage';
import IncidentsListPage from './components/IncidentsListPage';
import IncidentDetailsPage from './components/IncidentDetailsPage';
import MitigationDetailsPage from './components/MitigationDetailsPage';
import PostmortemDetailsPage from './components/PostmortemDetailsPage';
import './App.css';

// Navigation component that uses React Router
function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigateToCreate = () => {
    navigate('/create-incident');
  };

  const handleNavigateToList = () => {
    navigate('/incidents');
  };

  const isListPage = location.pathname === '/' || location.pathname === '/incidents';

  return (
    <div className={`App ${isListPage ? 'incidents-page-container' : ''}`}>
      {/* Navigation Bar - Sticky */}
      <nav className="sticky top-0 z-30 bg-gray-900 shadow-lg">
        <div className="max-w-full px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="Incident Manager Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold text-white">Incident Manager</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleNavigateToList}
                className="text-white text-lg font-bold hover:text-gray-300 transition-colors"
              >
                All Incidents
              </button>
              <button
                onClick={handleNavigateToCreate}
                className="px-4 py-2 bg-white text-gray-900 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Report Incident
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Routes */}
      <Routes>
        <Route 
          path="/" 
          element={<IncidentsListPage />} 
        />
        <Route 
          path="/incidents" 
          element={<IncidentsListPage />} 
        />
        <Route 
          path="/create-incident" 
          element={<IncidentCreationPage />} 
        />
        {/* New separate incident detail pages */}
        <Route 
          path="/incidents/:id" 
          element={<IncidentDetailsPage />} 
        />
        <Route 
          path="/incidents/:id/mitigation" 
          element={<MitigationDetailsPage />} 
        />
        <Route 
          path="/incidents/:id/postmortem" 
          element={<PostmortemDetailsPage />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
    </Router>
  );
}

export default App; 
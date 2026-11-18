import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import DashboardPage from './pages/DashboardPage';
import CreateLinkStudioPage from './pages/CreateLinkStudioPage';
import LinkControlCenterPage from './pages/LinkControlCenterPage';
import DeepAnalyticsLabPage from './pages/DeepAnalyticsLabPage';
import AIIntelligenceHubPage from './pages/AIIntelligenceHubPage';
import AutomationEnginePage from './pages/AutomationEnginePage';
import QRStudioPage from './pages/QRStudioPage';
import SmartRedirectLabPage from './pages/SmartRedirectLabPage';
import DataExportCenterPage from './pages/DataExportCenterPage';
import DeveloperApiPage from './pages/DeveloperApiPage';
import UserSettingsPage from './pages/UserSettingsPage';
import AuthPage from './pages/AuthPage';

import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLinkIdForAnalytics, setSelectedLinkIdForAnalytics] = useState(null);

  const [user, setUser] = useState({
    username: 'demo_user',
    first_name: 'Alex',
    last_name: 'Vance',
    email: 'alex@linkai.io',
    profile: {
      company: 'LinkAI Hypergrowth Labs',
      plan: 'Pro',
      role: 'Owner',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  });

  useEffect(() => {
    // Attempt profile fetch from API
    api.getProfile()
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((err) => {
        console.log('Running with demo user session:', err.message);
      });
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLinkForAnalytics = (id) => {
    setSelectedLinkIdForAnalytics(id);
    setCurrentPage('analytics');
  };

  // If viewing Auth page
  if (currentPage === 'auth') {
    return (
      <ToastProvider>
        <AuthPage
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            setCurrentPage('dashboard');
          }}
        />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-neon-cyan selection:text-slate-950">
        {/* Top Navbar */}
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 flex">
          {/* Left Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Workspace Body */}
          <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
            {currentPage === 'dashboard' && (
              <DashboardPage onNavigate={handleNavigate} user={user} />
            )}

            {currentPage === 'create-link' && (
              <CreateLinkStudioPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'links' && (
              <LinkControlCenterPage
                onNavigate={handleNavigate}
                onSelectLinkForAnalytics={handleSelectLinkForAnalytics}
              />
            )}

            {currentPage === 'analytics' && (
              <DeepAnalyticsLabPage
                onNavigate={handleNavigate}
                initialLinkId={selectedLinkIdForAnalytics}
              />
            )}

            {currentPage === 'ai-insights' && (
              <AIIntelligenceHubPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'automation' && (
              <AutomationEnginePage onNavigate={handleNavigate} />
            )}

            {currentPage === 'qr-studio' && (
              <QRStudioPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'smart-redirect' && (
              <SmartRedirectLabPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'export' && (
              <DataExportCenterPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'api-docs' && (
              <DeveloperApiPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'settings' && (
              <UserSettingsPage
                onNavigate={handleNavigate}
                user={user}
                onUpdateUser={setUser}
              />
            )}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

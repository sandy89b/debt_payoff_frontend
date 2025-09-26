import React, { useState, useEffect } from 'react';
import { useEmailAutomation } from '../../contexts/EmailAutomationContext';
import EmailTemplateManager from '../../components/admin/EmailTemplateManager';
import EmailCampaignManager from '../../components/admin/EmailCampaignManager';
import EmailAnalytics from '../../components/admin/EmailAnalytics';
import EmailSendHistory from '../../components/admin/EmailSendHistory';

const EmailAutomationDashboard: React.FC = () => {
  const { 
    templates, 
    campaigns, 
    analytics, 
    emailSends, 
    loading, 
    error, 
    getTemplates, 
    getCampaigns, 
    getAnalytics, 
    getEmailSends,
    clearError 
  } = useEmailAutomation();

  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'analytics' | 'history'>('templates');

  useEffect(() => {
    // Load initial data
    getTemplates();
    getCampaigns();
    getAnalytics();
    getEmailSends({ limit: 50 });
  }, []);

  const tabs = [
    { id: 'templates', label: 'Email Templates', icon: '📧' },
    { id: 'campaigns', label: 'Campaigns', icon: '📬' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'history', label: 'Send History', icon: '📋' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-float">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text-animated mb-4">
            Email Automation Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage email templates, campaigns, and track performance metrics with advanced analytics
          </p>
        </div>

        {/* Enhanced Error Alert */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-6 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={clearError}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-8 w-96">
              <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
                  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
                <p className="text-gray-600">Please wait while we fetch the data</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Templates</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{templates.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-2xl">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Campaigns</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-200">{campaigns.length}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-2xl">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Total Sends</p>
                <p className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">{analytics?.total_sends || 0}</p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-2xl">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Open Rate</p>
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{analytics?.open_rate || '0'}%</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-2xl">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 mb-8">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-semibold text-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                }`}
              >
                <span className="mr-3 text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Enhanced Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
          {activeTab === 'templates' && <EmailTemplateManager />}
          {activeTab === 'campaigns' && <EmailCampaignManager />}
          {activeTab === 'analytics' && <EmailAnalytics />}
          {activeTab === 'history' && <EmailSendHistory />}
        </div>
      </div>
    </div>
  );
};

export default EmailAutomationDashboard;

import React, { useState, useEffect } from 'react';
import { useEmailAutomation } from '../../contexts/EmailAutomationContext';

const EmailAnalytics: React.FC = () => {
  const { analytics, campaigns, getAnalytics } = useEmailAutomation();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    getAnalytics(selectedCampaign || undefined, dateRange);
  }, [selectedCampaign, dateRange]);

  const formatNumber = (num: number | string | null | undefined) => {
    const numValue = Number(num) || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (rate: number | string | null | undefined) => {
    if (!rate) return '0.0%';
    const numValue = Number(rate) || 0;
    return `${numValue.toFixed(1)}%`;
  };

  const formatDecimal = (num: number | string | null | undefined) => {
    const numValue = Number(num) || 0;
    return numValue.toFixed(2);
  };

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Email Analytics</h2>
        
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <select
              value={selectedCampaign || ''}
              onChange={(e) => setSelectedCampaign(e.target.value ? parseInt(e.target.value) : null)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </div>

      {analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Sends</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics?.total_sends)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics?.delivered_count)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Opens</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics?.opened_count)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Clicks</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics?.clicked_count)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {formatPercentage(analytics?.open_rate)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Open Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics?.opened_count || 0} / {analytics?.sent_count || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {formatPercentage(analytics?.click_rate)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Click Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics?.clicked_count || 0} / {analytics?.sent_count || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-sm">
                        {formatPercentage(analytics?.bounce_rate)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Bounce Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics?.bounced_count || 0} / {analytics?.sent_count || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Detailed Statistics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Email Performance</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Total Sent:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatNumber(analytics?.sent_count)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Delivered:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatNumber(analytics?.delivered_count)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Opened:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatNumber(analytics?.opened_count)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Clicked:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatNumber(analytics?.clicked_count)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Bounced:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatNumber(analytics?.bounced_count)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Engagement Metrics</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Avg Opens per Email:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDecimal(analytics?.avg_opens)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Avg Clicks per Email:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDecimal(analytics?.avg_clicks)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Open Rate:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatPercentage(analytics?.open_rate)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Click Rate:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatPercentage(analytics?.click_rate)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Bounce Rate:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatPercentage(analytics?.bounce_rate)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
          <p className="mt-1 text-sm text-gray-500">Start sending emails to see analytics data.</p>
        </div>
      )}
    </div>
  );
};

export default EmailAnalytics;

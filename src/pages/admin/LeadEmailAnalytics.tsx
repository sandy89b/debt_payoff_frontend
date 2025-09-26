import React, { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Clock, CheckCircle, XCircle, BarChart3, Calendar, Filter } from 'lucide-react';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EmailAnalytics {
  totalEmailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsBounced: number;
  emailsFailed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  conversionRate: number;
}

interface EmailLog {
  id: number;
  leadId: number;
  triggerEvent: string;
  emailAddress: string;
  status: string;
  sentAt: string;
  errorMessage?: string;
}

interface LeadEmailStats {
  leadId: number;
  leadName: string;
  leadEmail: string;
  totalEmailsSent: number;
  lastEmailSent: string;
  lastEmailStatus: string;
  conversionStatus: string;
}

export const LeadEmailAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [leadStats, setLeadStats] = useState<LeadEmailStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAnalytics();
    loadEmailLogs();
    loadLeadStats();
  }, [dateRange, statusFilter]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Transform the data to match the expected interface
        const transformedData = {
          totalEmailsSent: result.data.total_sends || 0,
          emailsDelivered: result.data.delivered_count || 0,
          emailsOpened: result.data.opened_count || 0,
          emailsClicked: result.data.clicked_count || 0,
          emailsBounced: result.data.bounced_count || 0,
          emailsFailed: 0, // Not available in current API
          openRate: parseFloat(result.data.open_rate) || 0,
          clickRate: parseFloat(result.data.click_rate) || 0,
          bounceRate: parseFloat(result.data.bounce_rate) || 0,
          conversionRate: 0 // Not available in current API
        };
        setAnalytics(transformedData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default analytics on error
      setAnalytics({
        totalEmailsSent: 0,
        emailsDelivered: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        emailsBounced: 0,
        emailsFailed: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        conversionRate: 0
      });
    }
  };

  const loadEmailLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/sends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email logs');
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Transform the data to match the expected interface
        const transformedLogs = result.data.map((log: any) => ({
          id: log.id,
          leadId: log.user_id || 0,
          triggerEvent: log.campaign_id ? 'campaign_send' : 'manual_send',
          emailAddress: log.recipient_email,
          status: log.status,
          sentAt: log.sent_at,
          errorMessage: log.bounce_reason || null
        }));
        setEmailLogs(transformedLogs);
      }
    } catch (error) {
      console.error('Error loading email logs:', error);
      setEmailLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeadStats = async () => {
    try {
      // For now, we'll use the email sends data to create lead stats
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/sends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead stats');
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Group by email address to create lead stats
        const emailGroups = result.data.reduce((acc: any, log: any) => {
          const email = log.recipient_email;
          if (!acc[email]) {
            acc[email] = {
              leadId: log.user_id || 0,
              leadName: email.split('@')[0], // Use email prefix as name
              leadEmail: email,
              totalEmailsSent: 0,
              lastEmailSent: log.sent_at,
              lastEmailStatus: log.status,
              conversionStatus: 'active'
            };
          }
          acc[email].totalEmailsSent++;
          if (new Date(log.sent_at) > new Date(acc[email].lastEmailSent)) {
            acc[email].lastEmailSent = log.sent_at;
            acc[email].lastEmailStatus = log.status;
          }
          return acc;
        }, {});

        const transformedStats = Object.values(emailGroups);
        setLeadStats(transformedStats);
      }
    } catch (error) {
      console.error('Error loading lead stats:', error);
      setLeadStats([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'clicked': return 'bg-orange-100 text-orange-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'opened': return <TrendingUp className="h-4 w-4" />;
      case 'clicked': return <BarChart3 className="h-4 w-4" />;
      case 'bounced': return <XCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-float">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text-animated mb-4">
            Lead Email Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track email performance and lead engagement with comprehensive analytics
          </p>
        </div>

        {/* Enhanced Controls */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="clicked">Clicked</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Emails</p>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{analytics.totalEmailsSent}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-2xl">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Open Rate</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">{(analytics.openRate || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-2xl">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Click Rate</p>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{(analytics.clickRate || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-2xl">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Conversion Rate</p>
                    <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">{(analytics.conversionRate || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Email Logs Table */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Mail className="h-5 w-5" />
              </div>
              Recent Email Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Lead</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Trigger Event</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Sent At</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-6">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{log.emailAddress}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Lead #{log.leadId}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge variant="outline" className="border-purple-300 text-purple-600 px-3 py-1">
                          {log.triggerEvent.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <Badge className={`${getStatusColor(log.status)} px-3 py-1 text-sm font-semibold`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(log.sentAt)}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        {log.errorMessage && (
                          <p className="text-sm text-red-600 dark:text-red-400">{log.errorMessage}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {emailLogs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No email activity found</h3>
                <p className="text-gray-500 dark:text-gray-500">No email logs match your current criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Lead Email Stats */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              Lead Email Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Lead</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Emails Sent</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Last Email</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Last Status</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {leadStats.map((lead) => (
                    <tr key={lead.leadId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-6">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{lead.leadName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{lead.leadEmail}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{lead.totalEmailsSent}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(lead.lastEmailSent)}</span>
                      </td>
                      <td className="p-6">
                        <Badge className={`${getStatusColor(lead.lastEmailStatus)} px-3 py-1 text-sm font-semibold`}>
                          {lead.lastEmailStatus}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <Badge className={lead.conversionStatus === 'converted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-3 py-1 text-sm font-semibold' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 px-3 py-1 text-sm font-semibold'}>
                          {lead.conversionStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leadStats.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No lead email stats found</h3>
                <p className="text-gray-500 dark:text-gray-500">No lead email performance data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

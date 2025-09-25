import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  Calendar, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_type: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  campaign_type: string;
  trigger_event: string;
  template_id: string;
  target_criteria: any;
  is_active: boolean;
  created_at: string;
  template?: EmailTemplate;
}

interface LeadEmailLog {
  id: string;
  lead_id: string;
  trigger_event: string;
  template_id: string;
  email_address: string;
  status: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface EmailAnalytics {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

const EmailAutomation: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [emailLogs, setEmailLogs] = useState<LeadEmailLog[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');

  // Form states
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    template_type: 'lead_nurturing',
    category: 'debt_freedom'
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    campaign_type: 'lead_nurturing',
    trigger_event: 'lead_captured',
    template_id: '',
    target_criteria: '{}'
  });

  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTemplates(),
        loadCampaigns(),
        loadEmailLogs(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load email automation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/campaigns`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadEmailLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/logs`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setEmailLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error loading email logs:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/analytics`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const createTemplate = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTemplate)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Email template created successfully",
          variant: "success",
        });
        setNewTemplate({
          name: '',
          subject: '',
          html_content: '',
          text_content: '',
          template_type: 'lead_nurturing',
          category: 'debt_freedom'
        });
        loadTemplates();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
    }
  };

  const createCampaign = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/campaigns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newCampaign)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Email campaign created successfully",
          variant: "success",
        });
        setNewCampaign({
          name: '',
          description: '',
          campaign_type: 'lead_nurturing',
          trigger_event: 'lead_captured',
          template_id: '',
          target_criteria: '{}'
        });
        loadCampaigns();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email campaign",
        variant: "destructive",
      });
    }
  };

  const sendTestEmail = async (templateId: string) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates/${templateId}/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: testEmail })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Test email sent successfully",
          variant: "success",
        });
        setTestEmail('');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const toggleCampaignStatus = async (campaignId: string, isActive: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !isActive })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Campaign ${!isActive ? 'activated' : 'deactivated'} successfully`,
          variant: "success",
        });
        loadCampaigns();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'opened':
        return <Badge variant="default" className="bg-green-100 text-green-800">Opened</Badge>;
      case 'clicked':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Clicked</Badge>;
      case 'bounced':
        return <Badge variant="destructive">Bounced</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTriggerEventLabel = (triggerEvent: string) => {
    const labels: { [key: string]: string } = {
      'lead_captured': 'Lead Captured',
      'lead_day_3': 'Day 3 Follow-up',
      'lead_day_7': 'Day 7 Follow-up',
      'lead_day_14': 'Day 14 Reminder',
      'user_signup': 'User Signup',
      'first_debt_entry': 'First Debt Entry',
      'debt_paid_off': 'Debt Paid Off',
      'weekly_check_in': 'Weekly Check-in',
      'monthly_report': 'Monthly Report'
    };
    return labels[triggerEvent] || triggerEvent;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading email automation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Automation</h1>
          <p className="text-gray-600">Manage email campaigns and lead nurturing sequences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab('templates')} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setActiveTab('campaigns')} variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Campaigns
          </Button>
          <Button onClick={() => setActiveTab('analytics')} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_sent}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.open_rate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.click_rate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.bounce_rate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Template Type</Label>
                      <Select value={newTemplate.template_type} onValueChange={(value) => setNewTemplate({ ...newTemplate, template_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead_nurturing">Lead Nurturing</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="template-subject">Subject</Label>
                    <Input
                      id="template-subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-html">HTML Content</Label>
                    <Textarea
                      id="template-html"
                      value={newTemplate.html_content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, html_content: e.target.value })}
                      placeholder="Enter HTML content (use {{variableName}} for dynamic content)"
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-text">Text Content</Label>
                    <Textarea
                      id="template-text"
                      value={newTemplate.text_content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, text_content: e.target.value })}
                      placeholder="Enter plain text content"
                      rows={4}
                    />
                  </div>
                  <Button onClick={createTemplate} className="w-full">
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">{template.name}</CardTitle>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{template.template_type}</Badge>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Template Preview: {template.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Subject:</Label>
                              <p className="font-medium">{template.subject}</p>
                            </div>
                            <div>
                              <Label>HTML Content:</Label>
                              <div className="border rounded p-4 bg-gray-50 max-h-60 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: template.html_content }} />
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Test Email</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="test-email">Test Email Address</Label>
                              <Input
                                id="test-email"
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter test email address"
                              />
                            </div>
                            <Button onClick={() => sendTestEmail(template.id)} className="w-full">
                              Send Test Email
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Email Campaigns</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campaign-name">Campaign Name</Label>
                      <Input
                        id="campaign-name"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                        placeholder="Enter campaign name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select value={newCampaign.campaign_type} onValueChange={(value) => setNewCampaign({ ...newCampaign, campaign_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead_nurturing">Lead Nurturing</SelectItem>
                          <SelectItem value="welcome">Welcome Series</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="campaign-description">Description</Label>
                    <Textarea
                      id="campaign-description"
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                      placeholder="Enter campaign description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trigger-event">Trigger Event</Label>
                      <Select value={newCampaign.trigger_event} onValueChange={(value) => setNewCampaign({ ...newCampaign, trigger_event: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead_captured">Lead Captured</SelectItem>
                          <SelectItem value="lead_day_3">Day 3 Follow-up</SelectItem>
                          <SelectItem value="lead_day_7">Day 7 Follow-up</SelectItem>
                          <SelectItem value="lead_day_14">Day 14 Reminder</SelectItem>
                          <SelectItem value="user_signup">User Signup</SelectItem>
                          <SelectItem value="first_debt_entry">First Debt Entry</SelectItem>
                          <SelectItem value="debt_paid_off">Debt Paid Off</SelectItem>
                          <SelectItem value="weekly_check_in">Weekly Check-in</SelectItem>
                          <SelectItem value="monthly_report">Monthly Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template-id">Email Template</Label>
                      <Select value={newCampaign.template_id} onValueChange={(value) => setNewCampaign({ ...newCampaign, template_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={createCampaign} className="w-full">
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={campaign.is_active ? "default" : "secondary"}>
                        {campaign.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCampaignStatus(campaign.id, campaign.is_active)}
                      >
                        {campaign.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getTriggerEventLabel(campaign.trigger_event)}</Badge>
                      <Badge variant="outline">{campaign.campaign_type}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Template:</strong> {campaign.template?.name || 'Unknown'}</p>
                      <p><strong>Created:</strong> {new Date(campaign.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Email Performance Analytics</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle>Recent Email Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Mail className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{log.lead?.first_name} {log.lead?.last_name}</p>
                          <p className="text-sm text-gray-600">{log.email_address}</p>
                          <p className="text-xs text-gray-500">{getTriggerEventLabel(log.trigger_event)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(log.status)}
                        <span className="text-sm text-gray-500">
                          {new Date(log.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailAutomation;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Send, BarChart3, Plus, Eye, Edit, Trash2, Save, X, Play, Pause, Calendar, Users, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface EmailAnalytics {
  total_sends: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  open_rate: string;
  click_rate: string;
  bounce_rate: string;
  avg_opens: number;
  avg_clicks: number;
}

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
  template_id: string;
  template_name?: string;
  trigger_event: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EmailAutomationSimple: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'analytics'>('templates');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [selectedTemplateForTest, setSelectedTemplateForTest] = useState<EmailTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20); // 0 = show all
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignPageSize, setCampaignPageSize] = useState<number>(20);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    template_type: 'general',
    category: 'debt_freedom',
    is_active: true,
  });

  useEffect(() => {
    loadTemplates();
    loadCampaigns();
    if (isAdmin) {
      loadAnalytics();
    }
  }, [isAdmin]);

  // Debug analytics tab activation
  useEffect(() => {
    if (activeTab === 'analytics') {
      console.log('Analytics tab activated, isAdmin:', isAdmin, 'analytics:', analytics, 'analyticsLoading:', analyticsLoading);
    }
  }, [activeTab, isAdmin, analytics, analyticsLoading]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
        setPage(1);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      console.log('Loading analytics...');
      setAnalyticsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/analytics`, {
        headers: getAuthHeaders()
      });
      console.log('Analytics response status:', response.status);
      const data = await response.json();
      console.log('Analytics response data:', data);
      if (data.success) {
        // Ensure all numeric fields are properly formatted
        const formattedData = {
          ...data.data,
          avg_opens: parseFloat(data.data.avg_opens) || 0,
          avg_clicks: parseFloat(data.data.avg_clicks) || 0,
          total_sends: parseInt(data.data.total_sends) || 0,
          sent_count: parseInt(data.data.sent_count) || 0,
          delivered_count: parseInt(data.data.delivered_count) || 0,
          opened_count: parseInt(data.data.opened_count) || 0,
          clicked_count: parseInt(data.data.clicked_count) || 0,
          bounced_count: parseInt(data.data.bounced_count) || 0
        };
        setAnalytics(formattedData);
        console.log('Analytics loaded successfully:', formattedData);
        console.log('avg_opens type:', typeof formattedData.avg_opens, 'value:', formattedData.avg_opens);
      } else {
        console.error('Failed to load analytics:', data.message);
        // Set default analytics if failed
        setAnalytics({
          total_sends: 0,
          sent_count: 0,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          bounced_count: 0,
          open_rate: '0.0',
          click_rate: '0.0',
          bounce_rate: '0.0',
          avg_opens: 0,
          avg_clicks: 0
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set default analytics on error
      setAnalytics({
        total_sends: 0,
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        bounced_count: 0,
        open_rate: '0.0',
        click_rate: '0.0',
        bounce_rate: '0.0',
        avg_opens: 0,
        avg_clicks: 0
      });
    } finally {
      setAnalyticsLoading(false);
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
      toast({
        title: "Error",
        description: "Failed to load email campaigns",
        variant: "destructive",
      });
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const handleTest = () => {
    toast({
      title: "Test",
      description: "Email Automation page is working!",
      variant: "success",
    });
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingTemplate)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Template updated successfully",
          variant: "success",
        });
        setEditingTemplate(null);
        loadTemplates();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates/${template.id}` , {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Deleted', description: 'Template deleted successfully', variant: 'success' });
        await loadTemplates();
        setDeleteOpen(false);
        setTemplateToDelete(null);
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const openDeleteModal = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteOpen(true);
  };

  const handleCreateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/campaigns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingCampaign)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Campaign created successfully",
          variant: "success",
        });
        setEditingCampaign(null);
        loadCampaigns();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingCampaign)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Campaign updated successfully",
          variant: "success",
        });
        setEditingCampaign(null);
        loadCampaigns();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    }
  };

  const handleToggleCampaignStatus = async (campaign: EmailCampaign) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !campaign.is_active })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Campaign ${!campaign.is_active ? 'activated' : 'deactivated'} successfully`,
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

  const handleSendTestEmail = async (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    setSendingTestEmail(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates/${template.id}/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: testEmail })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Test email sent to ${testEmail}`,
          variant: "success",
        });
        
        // Clear form and close modal after a short delay for smooth UX
        setTimeout(() => {
          setTestEmail('');
          setTestEmailModalOpen(false);
          setSelectedTemplateForTest(null);
        }, 1000);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const processTemplateContent = (content: string, variables: { [key: string]: string } = {}) => {
    let processedContent = content;
    
    // Default variables for preview
    const defaultVariables = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      totalDebt: '$25,000',
      debtCount: '3',
      totalMinPayments: '$450',
      extraPayment: '$200',
      encouragementMessage: 'You\'re taking the right steps toward financial freedom!',
      platformUrl: 'http://localhost:8080',
      debtName: 'Credit Card',
      stepTitle: 'Step 1: Inventory',
      amount: '$5,000',
      ...variables
    };

    // Replace variables in content
    Object.entries(defaultVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });

    return processedContent;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Email Automation
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage email campaigns and lead nurturing sequences
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Sent</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {!isAdmin ? '0' : analyticsLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    ) : (
                      analytics?.total_sends || 0
                    )}
                  </p>
                </div>
                <Send className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Open Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {!isAdmin ? '0.0%' : analyticsLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    ) : (
                      `${analytics?.open_rate || '0.0'}%`
                    )}
                  </p>
                </div>
                <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Click Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {!isAdmin ? '0.0%' : analyticsLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    ) : (
                      `${analytics?.click_rate || '0.0'}%`
                    )}
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {!isAdmin ? '0.0%' : analyticsLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                    ) : (
                      `${analytics?.bounce_rate || '0.0'}%`
                    )}
                  </p>
                </div>
                <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div>
          <nav className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'templates'
                  ? 'text-gray-900 dark:text-gray-100 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'campaigns'
                  ? 'text-gray-900 dark:text-gray-100 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Campaigns ({campaigns.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('analytics');
                if (isAdmin && !analytics) {
                  loadAnalytics();
                }
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'text-gray-900 dark:text-gray-100 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">
                {activeTab === 'templates' && 'Email Templates'}
                {activeTab === 'campaigns' && 'Email Campaigns'}
                {activeTab === 'analytics' && 'Email Analytics'}
              </CardTitle>
              {activeTab === 'templates' && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
              {activeTab === 'campaigns' && (
                <Button onClick={() => setEditingCampaign({
                    id: '',
                    name: '',
                    description: '',
                    template_id: '',
                    trigger_event: 'lead_captured',
                    is_active: true,
                    created_at: '',
                    updated_at: ''
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              )}
              {activeTab === 'analytics' && (
                <Button onClick={loadAnalytics} disabled={analyticsLoading}>
                  {analyticsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  Refresh Analytics
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
          {/* Templates Tab - Table View with Pagination */}
          {activeTab === 'templates' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading templates...</span>
                </div>
              ) : templates.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">Showing {pageSize === 0 ? templates.length : Math.min(page * pageSize, templates.length)} of {templates.length}</div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pageSize" className="text-sm text-gray-600">Rows per page</Label>
                      <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                        <SelectTrigger id="pageSize" className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">All</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Subject</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead className="hidden lg:table-cell">Category</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center w-0">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(pageSize === 0 ? templates : templates.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)).map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium break-words max-w-[220px]">{template.name}</TableCell>
                          <TableCell className="hidden md:table-cell break-words max-w-[400px]">{template.subject}</TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="outline">{template.template_type}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell"><Badge variant="outline">{template.category}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">{new Date(template.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={template.is_active ? 'default' : 'secondary'}>
                              {template.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="mx-auto">
                                  <MoreHorizontal className="h-5 w-5" />
                                  <span className="sr-only">Open actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => handlePreview(template)} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(template)} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedTemplateForTest(template); setTestEmailModalOpen(true); }} className="cursor-pointer">
                                  <Send className="h-4 w-4 mr-2" />
                                  Test
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteModal(template)} className="cursor-pointer text-red-600 focus:text-red-700">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pageSize !== 0 && templates.length > pageSize && (
                    <Pagination className="justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                        </PaginationItem>
                        {Array.from({ length: Math.ceil(templates.length / pageSize) }).slice(0, 5).map((_, idx) => {
                          const p = idx + 1;
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(Math.ceil(templates.length / pageSize), p + 1)); }} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}

                  {/* Delete Confirmation Modal */}
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete template?</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">This action cannot be undone. This will permanently delete the template{templateToDelete ? ` "${templateToDelete.name}"` : ''}.</p>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}>Delete</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Templates</h3>
                  <p className="text-gray-600 mb-4">Create your first email template to get started.</p>
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Campaigns Tab - Table View with Pagination */}
          {activeTab === 'campaigns' && (
            <>
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">Showing {campaignPageSize === 0 ? campaigns.length : Math.min(campaignPage * campaignPageSize, campaigns.length)} of {campaigns.length}</div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="campaignPageSize" className="text-sm text-gray-600">Rows per page</Label>
                      <Select value={String(campaignPageSize)} onValueChange={(v) => { setCampaignPageSize(Number(v)); setCampaignPage(1); }}>
                        <SelectTrigger id="campaignPageSize" className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">All</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="hidden sm:table-cell">Trigger</TableHead>
                        <TableHead className="hidden lg:table-cell">Template</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center w-0">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(campaignPageSize === 0 ? campaigns : campaigns.slice((campaignPage - 1) * campaignPageSize, (campaignPage - 1) * campaignPageSize + campaignPageSize)).map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium break-words max-w-[260px]">{campaign.name}</TableCell>
                          <TableCell className="hidden md:table-cell break-words max-w-[480px]">{campaign.description}</TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="outline">{campaign.trigger_event}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell"><Badge variant="outline">{campaign.template_name || 'No Template'}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                              {campaign.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="mx-auto">
                                  <MoreHorizontal className="h-5 w-5" />
                                  <span className="sr-only">Open actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setEditingCampaign(campaign)} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleCampaignStatus(campaign)} className="cursor-pointer">
                                  {campaign.is_active ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2" /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" /> Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {campaignPageSize !== 0 && campaigns.length > campaignPageSize && (
                    <Pagination className="justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCampaignPage((p) => Math.max(1, p - 1)); }} />
                        </PaginationItem>
                        {Array.from({ length: Math.ceil(campaigns.length / campaignPageSize) }).slice(0, 5).map((_, idx) => {
                          const p = idx + 1;
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink href="#" isActive={p === campaignPage} onClick={(e) => { e.preventDefault(); setCampaignPage(p); }}>
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCampaignPage((p) => Math.min(Math.ceil(campaigns.length / campaignPageSize), p + 1)); }} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Campaigns</h3>
                  <p className="text-gray-600 mb-4">Create your first email campaign to get started.</p>
                  <Button onClick={() => setEditingCampaign({
                    id: '',
                    name: '',
                    description: '',
                    template_id: '',
                    trigger_event: 'lead_captured',
                    is_active: true,
                    created_at: '',
                    updated_at: ''
                  })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {!isAdmin ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Access Restricted</h3>
                  <p className="text-gray-600 mb-4">Email analytics are only available to admin users.</p>
                  <p className="text-sm text-gray-500">Contact your administrator if you need access to email analytics.</p>
                </div>
              ) : analyticsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading analytics...</span>
                </div>
              ) : analytics ? (
                <>
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Email Analytics</h3>
                    <p className="text-gray-600 mb-6">Real-time email performance metrics from your campaigns</p>
                  </div>
                  
                  {/* Detailed Analytics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Total Emails Sent</h4>
                      <p className="text-3xl font-bold text-blue-600">{analytics?.total_sends || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">All time</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Delivered</h4>
                      <p className="text-3xl font-bold text-green-600">{analytics?.delivered_count || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Successfully delivered</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Opened</h4>
                      <p className="text-3xl font-bold text-purple-600">{analytics?.opened_count || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Times opened</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Clicked</h4>
                      <p className="text-3xl font-bold text-indigo-600">{analytics?.clicked_count || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Times clicked</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Bounced</h4>
                      <p className="text-3xl font-bold text-red-600">{analytics?.bounced_count || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Failed deliveries</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Avg Opens per Email</h4>
                      <p className="text-3xl font-bold text-orange-600">{(analytics?.avg_opens || 0).toFixed(1)}</p>
                      <p className="text-sm text-gray-600 mt-1">Average opens</p>
                    </div>
                  </div>
                  
                  {/* Performance Rates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <h4 className="font-medium text-gray-900">Open Rate</h4>
                      <p className="text-2xl font-bold text-green-600">{analytics?.open_rate || '0.0'}%</p>
                      <p className="text-sm text-gray-600 mt-1">Emails opened</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-gray-900">Click Rate</h4>
                      <p className="text-2xl font-bold text-blue-600">{analytics?.click_rate || '0.0'}%</p>
                      <p className="text-sm text-gray-600 mt-1">Links clicked</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                      <h4 className="font-medium text-gray-900">Bounce Rate</h4>
                      <p className="text-2xl font-bold text-red-600">{analytics?.bounce_rate || '0.0'}%</p>
                      <p className="text-sm text-gray-600 mt-1">Failed deliveries</p>
                    </div>
                  </div>
                  
                  {/* Refresh Button */}
                  <div className="text-center pt-4">
                    <Button 
                      onClick={loadAnalytics} 
                      variant="outline" 
                      disabled={analyticsLoading}
                      className="w-full sm:w-auto"
                    >
                      {analyticsLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Refresh Analytics
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                  <p className="text-gray-600 mb-4">Analytics data is not available. Click the button below to load analytics.</p>
                  <Button onClick={loadAnalytics} disabled={analyticsLoading}>
                    {analyticsLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Load Analytics
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject:</Label>
                <p className="font-medium p-2 bg-gray-50 rounded">{processTemplateContent(previewTemplate.subject)}</p>
              </div>
              <div>
                <Label>HTML Content:</Label>
                <div className="border rounded p-4 bg-gray-50 max-h-60 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: processTemplateContent(previewTemplate.html_content) }} />
                </div>
              </div>
              <div>
                <Label>Text Content:</Label>
                <div className="border rounded p-4 bg-gray-50 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {processTemplateContent(previewTemplate.text_content)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <Input
                  id="edit-subject"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-html">HTML Content</Label>
                <Textarea
                  id="edit-html"
                  value={editingTemplate.html_content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, html_content: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="edit-text">Text Content</Label>
                <Textarea
                  id="edit-text"
                  value={editingTemplate.text_content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, text_content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Email Modal */}
      <Dialog open={testEmailModalOpen} onOpenChange={(open) => {
        setTestEmailModalOpen(open);
        if (!open) {
          setTestEmail('');
          setSelectedTemplateForTest(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            {selectedTemplateForTest && (
              <p className="text-sm text-gray-600">Template: {selectedTemplateForTest.name}</p>
            )}
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
                disabled={sendingTestEmail}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => selectedTemplateForTest && handleSendTestEmail(selectedTemplateForTest)} 
                className="flex-1"
                disabled={sendingTestEmail || !testEmail || !selectedTemplateForTest}
                style={{
                  cursor: (sendingTestEmail || !testEmail || !selectedTemplateForTest) ? 'not-allowed' : 'pointer'
                }}
              >
                {sendingTestEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Edit/Create Modal */}
      <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign?.id ? 'Edit Campaign' : 'Create Campaign'}
            </DialogTitle>
          </DialogHeader>
          {editingCampaign && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={editingCampaign.name}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label htmlFor="campaign-description">Description</Label>
                <Textarea
                  id="campaign-description"
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                  placeholder="Enter campaign description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="campaign-template">Email Template</Label>
                <Select
                  value={editingCampaign.template_id}
                  onValueChange={(value) => setEditingCampaign({ ...editingCampaign, template_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
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
              <div>
                <Label htmlFor="campaign-trigger">Trigger Event</Label>
                <Select
                  value={editingCampaign.trigger_event}
                  onValueChange={(value) => setEditingCampaign({ ...editingCampaign, trigger_event: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_captured">Lead Captured</SelectItem>
                    <SelectItem value="user_signup">User Signup</SelectItem>
                    <SelectItem value="debt_paid_off">Debt Paid Off</SelectItem>
                    <SelectItem value="milestone_reached">Milestone Reached</SelectItem>
                    <SelectItem value="welcome_series">Welcome Series</SelectItem>
                    <SelectItem value="admin_invite">Admin Invite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="campaign-active"
                  checked={editingCampaign.is_active}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="campaign-active">Active Campaign</Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={editingCampaign.id ? handleUpdateCampaign : handleCreateCampaign} 
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCampaign.id ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Template Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tmpl-name">Name</Label>
              <Input id="tmpl-name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tmpl-subject">Subject</Label>
              <Input id="tmpl-subject" value={newTemplate.subject} onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tmpl-type">Type</Label>
              <Input id="tmpl-type" value={newTemplate.template_type} onChange={(e) => setNewTemplate({ ...newTemplate, template_type: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tmpl-category">Category</Label>
              <Input id="tmpl-category" value={newTemplate.category} onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tmpl-html">HTML Content</Label>
              <Textarea id="tmpl-html" rows={8} className="font-mono text-sm" value={newTemplate.html_content} onChange={(e) => setNewTemplate({ ...newTemplate, html_content: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="tmpl-text">Text Content (optional)</Label>
              <Textarea id="tmpl-text" rows={4} value={newTemplate.text_content} onChange={(e) => setNewTemplate({ ...newTemplate, text_content: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={creating || !newTemplate.name || !newTemplate.subject || !newTemplate.html_content}
                onClick={async () => {
                  try {
                    setCreating(true);
                    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email-automation/templates`, {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify(newTemplate)
                    });
                    const data = await res.json();
                    if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to create template');
                    toast({ title: 'Template created', description: 'Your email template has been created.' });
                    setCreateOpen(false);
                    setNewTemplate({ name: '', subject: '', html_content: '', text_content: '', template_type: 'general', category: 'debt_freedom', is_active: true });
                    loadTemplates();
                  } catch (err: any) {
                    toast({ title: 'Error', description: err.message || 'Failed to create template', variant: 'destructive' });
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                {creating ? 'Creating...' : 'Create Template'}
              </Button>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
);
};

export default EmailAutomationSimple;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, BarChart3, Plus, Eye, Edit, Trash2, Save, X, Play, Pause, Calendar, Users, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
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
  }, []);

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
      'Authorization': token ? `Bearer ${token}` : ''
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
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Automation</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage email campaigns and lead nurturing sequences</p>
        </div>
        <Button onClick={handleTest} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Test Button
        </Button>
      </div>

      {/* Simple Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
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
                <p className="text-2xl font-bold text-gray-900">0.0%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">0.0%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bounce Rate</p>
                <p className="text-2xl font-bold text-gray-900">0.0%</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 bg-gray-100 p-1 rounded-lg -mx-3 sm:mx-0 px-3 sm:px-1">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Main Content Area */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">
              {activeTab === 'templates' && 'Email Templates'}
              {activeTab === 'campaigns' && 'Email Campaigns'}
              {activeTab === 'analytics' && 'Email Analytics'}
            </CardTitle>
            {activeTab === 'templates' && (
              <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
            {activeTab === 'campaigns' && (
              <Button className="w-full sm:w-auto" onClick={() => setEditingCampaign({
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
            )}
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Analytics</h3>
              <p className="text-gray-600 mb-4">Detailed analytics and reporting features coming soon.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Open Rates</h4>
                  <p className="text-2xl font-bold text-purple-600">0.0%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Click Rates</h4>
                  <p className="text-2xl font-bold text-blue-600">0.0%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Conversion</h4>
                  <p className="text-2xl font-bold text-green-600">0.0%</p>
                </div>
              </div>
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
  );
};

export default EmailAutomationSimple;

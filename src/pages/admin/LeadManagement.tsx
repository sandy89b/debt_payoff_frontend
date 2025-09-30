import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, DollarSign, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Filter, Search, Download, Plus, UserCheck } from 'lucide-react';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalDebt: number;
  totalMinPayments: number;
  extraPayment: number;
  debtCount: number;
  status: 'new' | 'nurturing' | 'converted' | 'lost';
  source: string;
  userId?: number;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadStatistics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  nurturingLeads: number;
  lostLeads: number;
  avgDebtAmount: number;
  totalDebtValue: number;
  conversionRate: number;
}

export const LeadManagement: React.FC = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statistics, setStatistics] = useState<LeadStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [confirmConvertId, setConfirmConvertId] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    totalDebt: '',
    totalMinPayments: '',
    extraPayment: '',
    debtCount: '',
    source: 'admin'
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadLeads();
    loadStatistics();
  }, [currentPage, statusFilter]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const result = await response.json();
      setLeads(result.data);
      setTotalPages(Math.ceil(result.total / itemsPerPage) || 1);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const result = await response.json();
      setStatistics(result.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus as any } : lead
      ));

      // Show success message with automation info
      const automationMessage = getAutomationMessage(newStatus);
      toast({
        title: "Status Updated",
        description: `Lead status has been updated successfully. ${automationMessage}`,
      });

      // Reload statistics
      loadStatistics();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAutomationMessage = (status: string) => {
    switch (status) {
      case 'nurturing':
        return 'A nurturing email has been sent to the lead.';
      case 'converted':
        return 'A welcome email has been sent to the converted lead.';
      case 'lost':
        return 'A follow-up email has been sent to the lead.';
      default:
        return '';
    }
  };

  const handleCreateLead = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...newLead,
        totalDebt: parseFloat(newLead.totalDebt || '0'),
        totalMinPayments: parseFloat(newLead.totalMinPayments || '0'),
        extraPayment: parseFloat(newLead.extraPayment || '0'),
        debtCount: parseInt(newLead.debtCount || '0')
      } as any;

      // Use admin endpoint that also creates/links a user shell and sends password-setup email
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Failed to create lead');
      }

      toast({ title: 'Lead created', description: 'The lead has been created successfully.' });
      // Smooth close animation
      setIsClosingModal(true);
      setTimeout(() => {
        setIsCreateOpen(false);
        setIsClosingModal(false);
      }, 220);
      setNewLead({ firstName: '', lastName: '', email: '', phone: '', totalDebt: '', totalMinPayments: '', extraPayment: '', debtCount: '', source: 'admin' });
      // Reload list and stats
      setCurrentPage(1);
      await Promise.all([loadLeads(), loadStatistics()]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create lead.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertLead = async (leadId: number) => {
    try {
      setIsConverting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads/${leadId}/convert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const r = await response.json().catch(() => ({}));
        throw new Error(r?.message || 'Failed to convert lead');
      }

      toast({ 
        title: 'Lead converted', 
        description: 'Lead has been marked as converted and linked to the user. A welcome email has been sent to the lead.' 
      });
      await Promise.all([loadLeads(), loadStatistics()]);
      setConvertModalOpen(false);
      setConfirmConvertId(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to convert lead.', variant: 'destructive' });
    } finally {
      setIsConverting(false);
    }
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Total Debt', 'Status', 'Source', 'Created At'],
      ...leads.map(lead => [
        `${lead.firstName} ${lead.lastName}`,
        lead.email,
        lead.phone || '',
        `$${lead.totalDebt.toLocaleString()}`,
        lead.status,
        lead.source,
        new Date(lead.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Leads have been exported to CSV successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'nurturing': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />;
      case 'nurturing': return <Mail className="h-4 w-4" />;
      case 'converted': return <CheckCircle className="h-4 w-4" />;
      case 'lost': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredLeads = leads.filter(lead =>
    searchTerm === '' ||
    lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && leads.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading leads..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Lead Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track your debt calculator leads</p>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">Email Automation Active</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Status changes automatically trigger personalized emails to leads. Nurturing, converted, and lost statuses will send appropriate follow-up emails.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Lead
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create Lead</DialogTitle>
              </DialogHeader>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 py-2 transition-all duration-200 ${isClosingModal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={newLead.firstName} onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={newLead.lastName} onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="totalDebt">Total Debt ($)</Label>
                  <Input id="totalDebt" type="number" inputMode="decimal" value={newLead.totalDebt} onChange={(e) => setNewLead({ ...newLead, totalDebt: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="totalMinPayments">Total Min Payments ($)</Label>
                  <Input id="totalMinPayments" type="number" inputMode="decimal" value={newLead.totalMinPayments} onChange={(e) => setNewLead({ ...newLead, totalMinPayments: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="extraPayment">Extra Payment ($)</Label>
                  <Input id="extraPayment" type="number" inputMode="decimal" value={newLead.extraPayment} onChange={(e) => setNewLead({ ...newLead, extraPayment: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="debtCount">Debt Count</Label>
                  <Input id="debtCount" type="number" inputMode="numeric" value={newLead.debtCount} onChange={(e) => setNewLead({ ...newLead, debtCount: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="transition-all duration-200 hover:opacity-90 active:scale-95" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleCreateLead} disabled={isSubmitting} className="transition-all duration-200 hover:opacity-90 active:scale-95">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={exportLeads} variant="outline" className="px-4 py-2">
            <Download className="h-5 w-5 mr-2 text-brand-purple" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Leads</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statistics.totalLeads}</p>
                  </div>
                  <Users className="h-6 w-6 text-brand-purple" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">New Leads</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statistics.newLeads}</p>
                  </div>
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Converted</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statistics.convertedLeads}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Conversion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statistics.conversionRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Search Leads</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="nurturing">Nurturing</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Debt Info</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Created</th>
                    <th className="text-left p-6 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-6">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{lead.firstName} {lead.lastName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{lead.source}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-brand-purple" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-rose-500" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">${lead.totalDebt.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{lead.debtCount} debts</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(lead.status)} px-3 py-1 text-sm font-semibold`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(lead.status)}
                              {lead.status}
                            </span>
                          </Badge>
                          {lead.status !== 'new' && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span>Email sent</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32 text-sm py-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="nurturing">Nurturing</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                          {lead.status !== 'converted' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => { setConfirmConvertId(lead.id); setConvertModalOpen(true); }}
                            >
                              <UserCheck className="h-4 w-4 mr-1" /> Convert
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-8 w-8 text-brand-purple mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No leads found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">No leads match your current search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <div className="px-4 py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        )}
        {/* Confirm Convert Modal */}
        <Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Convert lead to user?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              This will mark the lead as converted and link it to a user account. Do you want to continue?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertModalOpen(false)} disabled={isConverting}>Cancel</Button>
              <Button onClick={() => confirmConvertId && handleConvertLead(confirmConvertId)} disabled={isConverting}>
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Converting...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

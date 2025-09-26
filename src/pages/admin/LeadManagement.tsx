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

      toast({
        title: "Status Updated",
        description: "Lead status has been updated successfully.",
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

      toast({ title: 'Lead converted', description: 'Lead has been marked as converted and linked to the user.' });
      await Promise.all([loadLeads(), loadStatistics()]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to convert lead.', variant: 'destructive' });
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading leads...</p>
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
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text-animated mb-4">
            Lead Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage and track your debt calculator leads with comprehensive analytics
          </p>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
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
          <Button 
            onClick={exportLeads} 
            variant="outline" 
            className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Leads</p>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{statistics.totalLeads}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-2xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">New Leads</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">{statistics.newLeads}</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-2xl">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Converted</p>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{statistics.convertedLeads}</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-3xl shadow-lg card-hover">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">Conversion Rate</p>
                    <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">{statistics.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-2xl">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Filter className="h-5 w-5" />
              </div>
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Search Leads</Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800">
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

        {/* Enhanced Leads Table */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              Leads ({filteredLeads.length})
            </CardTitle>
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
                            <Mail className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">${lead.totalDebt.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{lead.debtCount} debts</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <Badge className={`${getStatusColor(lead.status)} px-3 py-1 text-sm font-semibold`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(lead.status)}
                            {lead.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32 text-sm py-2 border-purple-200 dark:border-purple-800/30 rounded-lg focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800">
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
                              className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 hover:opacity-90 active:scale-95" 
                              onClick={() => handleConvertLead(lead.id)}
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
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No leads found</h3>
                <p className="text-gray-500 dark:text-gray-500">No leads match your current search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-purple-200 dark:border-purple-800/30 rounded-2xl px-6 py-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

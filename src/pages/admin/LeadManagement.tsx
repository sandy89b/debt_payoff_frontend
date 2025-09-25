import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, DollarSign, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Filter, Search, Download, Plus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Lead Management</h1>
          <p className="text-muted-foreground">Manage and track your debt calculator leads</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
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
          <Button onClick={exportLeads} variant="outline" className="transition-all duration-200 hover:opacity-90 active:scale-95">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{statistics.totalLeads}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.newLeads}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Converted</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.convertedLeads}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.conversionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Leads</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              <Label htmlFor="status-filter">Filter by Status</Label>
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
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Debt Info</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                        <p className="text-sm text-muted-foreground">{lead.source}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">${lead.totalDebt.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.debtCount} debts</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(lead.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(lead.status)}
                          {lead.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-32">
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
                          <Button size="sm" variant="outline" className="transition-all duration-200 hover:opacity-90 active:scale-95" onClick={() => handleConvertLead(lead.id)}>
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
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No leads found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

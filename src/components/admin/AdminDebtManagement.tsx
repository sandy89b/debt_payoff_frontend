import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, DollarSign, TrendingUp, Eye } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface DebtWithUser {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  debtName: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number;
  debtType: string;
  description?: string;
  originalBalance: number;
  isActive: boolean;
  status: string;
  paidOffDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSummary {
  id: number;
  email: string;
  name: string;
  userCreatedAt: string;
  totalDebts: number;
  activeDebts: number;
  paidDebts: number;
  totalBalance: number;
  totalMinPayments: number;
  debtFreeProgress: number;
}

export const AdminDebtManagement: React.FC = () => {
  const [debts, setDebts] = useState<DebtWithUser[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [view, setView] = useState<'debts' | 'users'>('users');
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchAllDebts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/debts/all-debts`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch debts');
      }

      const result = await response.json();
      setDebts(result.data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch debt data",
        variant: "destructive",
      });
    }
  };

  const fetchUsersWithDebts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/debts/users-with-debts`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllDebts(), fetchUsersWithDebts()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.debtName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && debt.isActive) ||
                         (statusFilter === 'paid' && debt.status === 'Paid Off');
    
    const matchesUser = selectedUser === 'all' || debt.userId.toString() === selectedUser;
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-500';
      case 'Paid Off': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Admin Debt Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monitor and manage all user debts with comprehensive analytics and insights</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={view === 'users' ? 'default' : 'outline'}
            onClick={() => setView('users')}
            className="px-4 py-2"
          >
            <Users className="h-4 w-4 mr-2" />
            Users Overview
          </Button>
          <Button 
            variant={view === 'debts' ? 'default' : 'outline'}
            onClick={() => setView('debts')}
            className="px-4 py-2"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            All Debts
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={view === 'users' ? "Search users..." : "Search debts or users..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            
              {view === 'debts' && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paid">Paid Off</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {view === 'users' ? (
          /* Users Overview */
          <div className="grid gap-4">
            {filteredUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="px-3 py-1">
                        {user.debtFreeProgress}% Debt-Free
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user.id.toString());
                          setView('debts');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Debts
                      </Button>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Debts</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.totalDebts}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Debts</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.activeDebts}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Paid Off</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.paidDebts}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Balance</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(user.totalBalance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* All Debts View */
          <div className="grid gap-4">
            {filteredDebts.map(debt => (
              <Card key={debt.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{debt.debtName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {debt.userName} ({debt.userEmail})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(debt.status)} px-3 py-1 text-sm font-semibold`}>
                        {debt.status}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        {debt.debtType}
                      </Badge>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Balance</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(debt.balance)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Min Payment</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(debt.minimumPayment)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Interest Rate</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{debt.interestRate.toFixed(2)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Due Date</p>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{debt.dueDate}th</p>
                    </div>
                  </div>
                
                  {debt.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{debt.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {((view === 'users' && filteredUsers.length === 0) || 
          (view === 'debts' && filteredDebts.length === 0)) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No {view} found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">No {view} found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDebtManagement;

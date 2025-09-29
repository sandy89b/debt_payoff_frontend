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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-float">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text-animated mb-4">
            Admin Debt Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor and manage all user debts with comprehensive analytics and insights
          </p>
        </div>

        {/* Enhanced View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 p-2">
            <div className="flex gap-2">
              <Button 
                variant={view === 'users' ? 'default' : 'outline'}
                onClick={() => setView('users')}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  view === 'users' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                Users Overview
              </Button>
              <Button 
                variant={view === 'debts' ? 'default' : 'outline'}
                onClick={() => setView('debts')}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  view === 'debts' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                All Debts
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Search className="h-5 w-5" />
              </div>
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                  <Input
                    placeholder={view === 'users' ? "Search users..." : "Search debts or users..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            
              {view === 'debts' && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paid">Paid Off</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-64 text-lg py-4 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl focus:border-purple-400 dark:focus:border-purple-600 bg-white dark:bg-slate-800">
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
          /* Enhanced Users Overview */
          <div className="grid gap-6">
            {filteredUsers.map(user => (
              <Card key={user.id} className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 card-hover">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{user.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold">
                        {user.debtFreeProgress}% Debt-Free
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user.id.toString());
                          setView('debts');
                        }}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Debts
                      </Button>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500 rounded-xl">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Debts</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{user.totalDebts}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500 rounded-xl">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Debts</p>
                      </div>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">{user.activeDebts}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500 rounded-xl">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Paid Off</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{user.paidDebts}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500 rounded-xl">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Balance</p>
                      </div>
                      <p className="text-2xl font-bold text-red-800 dark:text-red-200">{formatCurrency(user.totalBalance)}</p>
                    </div>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
          /* Enhanced All Debts View */
          <div className="grid gap-6">
            {filteredDebts.map(debt => (
              <Card key={debt.id} className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 card-hover">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{debt.debtName}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {debt.userName} ({debt.userEmail})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(debt.status)} px-4 py-2 text-sm font-semibold`}>
                        {debt.status}
                      </Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-600 px-4 py-2">
                        {debt.debtType}
                      </Badge>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500 rounded-xl">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Current Balance</p>
                      </div>
                      <p className="text-2xl font-bold text-red-800 dark:text-red-200">{formatCurrency(debt.balance)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500 rounded-xl">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Min Payment</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(debt.minimumPayment)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500 rounded-xl">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Interest Rate</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{debt.interestRate.toFixed(2)}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500 rounded-xl">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Due Date</p>
                      </div>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">{debt.dueDate}th</p>
                    </div>
                  </div>
                
                  {debt.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">{debt.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {((view === 'users' && filteredUsers.length === 0) || 
          (view === 'debts' && filteredDebts.length === 0)) && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No {view} found</h3>
              <p className="text-gray-500 dark:text-gray-500">No {view} found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDebtManagement;

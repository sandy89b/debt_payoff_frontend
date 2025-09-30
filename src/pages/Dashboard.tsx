import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PressButton as Button } from "@/components/ui/PressButton";
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, CheckCircle2, Calendar, Percent, Goal, Bell, GraduationCap, BookOpen, Trophy, Users, Heart, HeartHandshake, LineChart, ShieldCheck, HelpingHand, Settings, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Debt {
  id: string;
  name: string;
  balance: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: number;
  isPaidOff?: boolean;
  isActive?: boolean;
  debtType?: string;
  description?: string;
  originalBalance?: number;
  priority?: number;
  debtStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('No auth token found - user may not be authenticated');
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    // Prevent ngrok browser warning page (which returns HTML and breaks JSON parsing)
    'ngrok-skip-browser-warning': 'true'
  } as Record<string, string>;
}

const DashboardOverview: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch both debts and statistics for better performance
      const [debtsRes, statsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts?includeInactive=true`, {
          headers: getAuthHeaders()
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts/statistics`, {
          headers: getAuthHeaders()
        })
      ]);
      
      const debtsJson = await debtsRes.json();
      const statsJson = await statsRes.json();
      
      if (!debtsRes.ok) throw new Error(debtsJson.message || 'Failed to load debts');
      if (!statsRes.ok) throw new Error(statsJson.message || 'Failed to load statistics');
      
      setDebts(debtsJson.data || []);
      // Store statistics for potential future use
      
      if (isRefresh) {
        toast({ title: 'Success', description: 'Dashboard data refreshed', variant: 'success' });
      }
    } catch (e: any) {
      console.error('Dashboard load error:', e);
      toast({ title: 'Error', description: e.message || 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [toast]);

  const active = debts.filter(d => d.isActive && !d.isPaidOff);
  const paidOff = debts.filter(d => d.isPaidOff);
  const totalActiveBalance = active.reduce((s, d) => s + (d.balance || 0), 0);
  const totalActiveMinPayments = active.reduce((s, d) => s + (d.minimumPayment || 0), 0);
  const weightedApr = active.length === 0 ? 0 : (
    active.reduce((sum, d) => sum + (d.balance || 0) * (d.interestRate || 0), 0) /
    Math.max(totalActiveBalance, 1)
  );
  const nextDue = active.length > 0 ? active.reduce((p, c) => (c.dueDate < p.dueDate ? c : p)) : undefined;

  const currency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your comprehensive debt freedom journey overview</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            variant="outline" 
            onClick={() => loadDashboardData(true)} 
            disabled={refreshing}
            className="px-4 py-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            onClick={() => navigate('/calculator')} 
            className="px-4 py-2"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Open Calculator
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Active Debt</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{currency(totalActiveBalance)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total outstanding</p>
                </div>
                <DollarSign className="h-6 w-6 text-rose-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Min Payments</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{currency(totalActiveMinPayments)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly commitment</p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Active Debts</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{active.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accounts open</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-brand-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Weighted APR</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{weightedApr.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average rate</p>
                </div>
                <Percent className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {nextDue ? (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-400" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{nextDue.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Due day {nextDue.dueDate} • Min {currency(nextDue.minimumPayment)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No active debts yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/calculator')} 
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <TrendingUp className="h-5 w-5 text-brand-purple" />
                  <span className="text-sm">Calculator</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/calendar')} 
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Calendar className="h-5 w-5 text-brand-purple" />
                  <span className="text-sm">Calendar</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/goals')} 
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Goal className="h-5 w-5 text-brand-purple" />
                  <span className="text-sm">Goals</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/reminders')} 
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <Bell className="h-5 w-5 text-brand-purple" />
                  <span className="text-sm">Reminders</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Overview Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/framework')}>
            <CardContent className="p-4 flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-blue-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Framework Steps</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Biblical and practical steps toward freedom</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/devotionals')}>
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-green-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Daily Devotionals</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Stay motivated and focused</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/achievements')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-amber-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Achievements</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Milestones you have reached</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/accountability')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Accountability</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Invite support and track commitments</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/prayers')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Heart className="h-6 w-6 text-rose-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Prayer Corner</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Share requests and gratitude</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/coaching')}>
            <CardContent className="p-4 flex items-center gap-3">
              <HeartHandshake className="h-6 w-6 text-violet-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Coaching</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Get help from our team</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/income-optimization')}>
            <CardContent className="p-4 flex items-center gap-3">
              <LineChart className="h-6 w-6 text-emerald-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Income Optimization</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Increase margin for payoff</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/emergency-fund-calculator')}>
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-rose-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Emergency Fund</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Build resilience for surprises</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/giving-stewardship-tracker')}>
            <CardContent className="p-4 flex items-center gap-3">
              <HelpingHand className="h-6 w-6 text-emerald-600"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Giving Tracker</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Track generosity and impact</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => navigate('/legacy-planning')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Settings className="h-6 w-6 text-slate-500"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Legacy Planning</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Plan for the long term</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;



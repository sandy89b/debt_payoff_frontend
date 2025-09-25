import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, CheckCircle2, Calendar, Percent, Goal, Bell, GraduationCap, BookOpen, Trophy, Users, Heart, HeartHandshake, LineChart, ShieldCheck, HelpingHand, Settings, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    ...(token && { 'Authorization': `Bearer ${token}` })
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
      console.log('Debt statistics:', statsJson.data);
      
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
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your debt journey</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => loadDashboardData(true)} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => navigate('/calculator')} className="bg-primary hover:bg-primary/90">
            <TrendingUp className="h-4 w-4 mr-2" />
            Open Calculator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Debt</p>
                <p className="text-2xl font-bold text-gray-900">{currency(totalActiveBalance)}</p>
                <p className="text-xs text-gray-500 mt-1">Total outstanding</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Min Payments</p>
                <p className="text-2xl font-bold text-gray-900">{currency(totalActiveMinPayments)}</p>
                <p className="text-xs text-gray-500 mt-1">Monthly commitment</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Debts</p>
                <p className="text-2xl font-bold text-gray-900">{active.length}</p>
                <p className="text-xs text-gray-500 mt-1">Accounts open</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Weighted APR</p>
                <p className="text-2xl font-bold text-gray-900">{weightedApr.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">Average rate</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <Percent className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {nextDue ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{nextDue.name}</div>
                  <div className="text-sm text-gray-600">Due day {nextDue.dueDate} • Min {currency(nextDue.minimumPayment)}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No active debts yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/calculator')} className="h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Calculator</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/calendar')} className="h-auto p-4 flex flex-col items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Calendar</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/goals')} className="h-auto p-4 flex flex-col items-center gap-2">
                <Goal className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Goals</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/reminders')} className="h-auto p-4 flex flex-col items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Reminders</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* App overview tiles (education, motivation, tools) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/framework')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg"><GraduationCap className="h-6 w-6 text-blue-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Framework Steps</div>
              <div className="text-sm text-gray-600">Biblical and practical steps toward freedom</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/devotionals')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg"><BookOpen className="h-6 w-6 text-green-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Daily Devotionals</div>
              <div className="text-sm text-gray-600">Stay motivated and focused</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/achievements')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg"><Trophy className="h-6 w-6 text-yellow-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Achievements</div>
              <div className="text-sm text-gray-600">Milestones you have reached</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/accountability')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg"><Users className="h-6 w-6 text-purple-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Accountability</div>
              <div className="text-sm text-gray-600">Invite support and track commitments</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/prayers')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-pink-50 rounded-lg"><Heart className="h-6 w-6 text-pink-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Prayer Corner</div>
              <div className="text-sm text-gray-600">Share requests and gratitude</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/coaching')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg"><HeartHandshake className="h-6 w-6 text-indigo-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Coaching</div>
              <div className="text-sm text-gray-600">Get help from our team</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/income-optimization')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg"><LineChart className="h-6 w-6 text-emerald-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Income Optimization</div>
              <div className="text-sm text-gray-600">Increase margin for payoff</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/emergency-fund-calculator')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg"><ShieldCheck className="h-6 w-6 text-red-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Emergency Fund</div>
              <div className="text-sm text-gray-600">Build resilience for surprises</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/giving-stewardship-tracker')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-teal-50 rounded-lg"><HelpingHand className="h-6 w-6 text-teal-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Giving Tracker</div>
              <div className="text-sm text-gray-600">Track generosity and impact</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/legacy-planning')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-lg"><Settings className="h-6 w-6 text-gray-600"/></div>
            <div>
              <div className="font-semibold text-gray-900">Legacy Planning</div>
              <div className="text-sm text-gray-600">Plan for the long term</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;



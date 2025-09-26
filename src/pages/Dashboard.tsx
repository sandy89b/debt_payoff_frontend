import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PressButton as Button } from "@/components/ui/PressButton";
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
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-float mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text-animated mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your comprehensive debt freedom journey overview
          </p>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => loadDashboardData(true)} 
            disabled={refreshing}
            className="bg-white/80 backdrop-blur-sm border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            onClick={() => navigate('/calculator')} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Open Calculator
          </Button>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Active Debt</p>
                  <p className="text-3xl font-bold text-red-800 dark:text-red-200">{currency(totalActiveBalance)}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Total outstanding</p>
                </div>
                <div className="p-3 bg-red-500 rounded-2xl">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Min Payments</p>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{currency(totalActiveMinPayments)}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Monthly commitment</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Active Debts</p>
                  <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{active.length}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Accounts open</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-2xl">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-3xl shadow-lg card-hover">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Weighted APR</p>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-200">{weightedApr.toFixed(2)}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Average rate</p>
                </div>
                <div className="p-3 bg-green-500 rounded-2xl">
                  <Percent className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Upcoming Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {nextDue ? (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                  <div className="p-3 bg-blue-500 rounded-2xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{nextDue.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Due day {nextDue.dueDate} • Min {currency(nextDue.minimumPayment)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">No active debts yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Goal className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/calculator')} 
                  className="h-auto p-4 flex flex-col items-center gap-3 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 rounded-2xl transition-all duration-300"
                >
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold">Calculator</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/calendar')} 
                  className="h-auto p-4 flex flex-col items-center gap-3 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-2xl transition-all duration-300"
                >
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold">Calendar</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/goals')} 
                  className="h-auto p-4 flex flex-col items-center gap-3 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 rounded-2xl transition-all duration-300"
                >
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Goal className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold">Goals</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/reminders')} 
                  className="h-auto p-4 flex flex-col items-center gap-3 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-2xl transition-all duration-300"
                >
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold">Reminders</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced App Overview Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/framework')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-2xl">
                <GraduationCap className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Framework Steps</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Biblical and practical steps toward freedom</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/devotionals')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Daily Devotionals</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Stay motivated and focused</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/achievements')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-yellow-500 rounded-2xl">
                <Trophy className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Achievements</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Milestones you have reached</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/accountability')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-2xl">
                <Users className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Accountability</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Invite support and track commitments</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/prayers')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-pink-500 rounded-2xl">
                <Heart className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Prayer Corner</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Share requests and gratitude</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/coaching')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-2xl">
                <HeartHandshake className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Coaching</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Get help from our team</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/income-optimization')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-2xl">
                <LineChart className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Income Optimization</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Increase margin for payoff</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/emergency-fund-calculator')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-500 rounded-2xl">
                <ShieldCheck className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Emergency Fund</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Build resilience for surprises</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/giving-stewardship-tracker')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-teal-500 rounded-2xl">
                <HelpingHand className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Giving Tracker</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Track generosity and impact</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden dark:bg-slate-800/80 cursor-pointer card-hover" onClick={() => navigate('/legacy-planning')}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-gray-500 rounded-2xl">
                <Settings className="h-8 w-8 text-white"/>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">Legacy Planning</div>
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



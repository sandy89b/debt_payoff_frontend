import React, { useState, useEffect } from 'react';
import { Plus, Calculator, DollarSign, BookOpen, AlertTriangle, CheckCircle2, TrendingUp, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { EnhancedDebtEntry, EnhancedDebt } from './EnhancedDebtEntry';
import { DebtImportTools } from './DebtImportTools';
import LoadingSpinner from '../ui/LoadingSpinner';
import { BiblicalVerse } from './BiblicalVerse';
import { LeadCaptureModal } from './LeadCaptureModal';
import { PayoffComparison } from './PayoffComparison';
import { DebtProgress } from './DebtProgress';
import { useAuth } from '@/contexts/AuthContext';

// API service for debt management
class DebtAPIService {
  static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      // Prevent ngrok browser warning HTML
      'ngrok-skip-browser-warning': 'true'
    };
  }

  static async getAllDebts() {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts?includeInactive=true`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch debts: ${response.statusText}`);
    }
    
    const result = await response.json();
    const backendDebts = result.data || [];
    
    // Map backend debt format to frontend format
    return backendDebts.map((debt: any) => ({
      id: debt.id,
      name: debt.name,
      balance: debt.balance,
      minPayment: debt.minimumPayment, // Map minimumPayment to minPayment
      interestRate: debt.interestRate,
      dueDate: debt.dueDate,
      debtType: debt.debtType,
      description: debt.description || '',
      originalBalance: debt.originalBalance || debt.balance,
      isPaidOff: debt.isPaidOff,
      paidOffDate: debt.paidOffDate,
      debtStatus: debt.debtStatus || 'active', // Map debt status
      isNew: false // These are existing debts from database
    }));
  }

  static async createDebt(debtData: Partial<EnhancedDebt>) {
    // Map frontend property names to backend property names
    const backendData = {
      ...debtData,
      minimumPayment: debtData.minPayment
    };
    delete backendData.minPayment;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(backendData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to create debt: ${response.statusText}`);
    }
    
    // Map backend response to frontend format
    const backendDebt = result.data;
    return {
      id: backendDebt.id,
      name: backendDebt.name,
      balance: backendDebt.balance,
      minPayment: backendDebt.minimumPayment,
      interestRate: backendDebt.interestRate,
      dueDate: backendDebt.dueDate,
      debtType: backendDebt.debtType,
      description: backendDebt.description || '',
      originalBalance: backendDebt.originalBalance || backendDebt.balance,
      isPaidOff: backendDebt.isPaidOff,
      paidOffDate: backendDebt.paidOffDate,
      isNew: false
    };
  }

  static async updateDebt(debtId: string, debtData: Partial<EnhancedDebt>) {
    // Map frontend property names to backend property names
    const backendData = {
      ...debtData,
      minimumPayment: debtData.minPayment
    };
    delete backendData.minPayment;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts/${debtId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(backendData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to update debt: ${response.statusText}`);
    }
    
    // Map backend response to frontend format
    const backendDebt = result.data;
    return {
      id: backendDebt.id,
      name: backendDebt.name,
      balance: backendDebt.balance,
      minPayment: backendDebt.minimumPayment,
      interestRate: backendDebt.interestRate,
      dueDate: backendDebt.dueDate,
      debtType: backendDebt.debtType,
      description: backendDebt.description || '',
      originalBalance: backendDebt.originalBalance || backendDebt.balance,
      isPaidOff: backendDebt.isPaidOff,
      paidOffDate: backendDebt.paidOffDate,
      isNew: false
    };
  }

  static async deleteDebt(debtId: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts/${debtId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to delete debt: ${response.statusText}`);
    }
    
    return result;
  }

  static async markDebtAsPaidOff(debtId: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts/${debtId}/mark-paid`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to mark debt as paid off: ${response.statusText}`);
    }
    
    return result.data;
  }

  static async calculatePayoffScenarios(extraPayment: number) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts/calculate-payoff`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ extraPayment })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to calculate payoff scenarios: ${response.statusText}`);
    }
    
    return result.data;
  }

  static async bulkCreateDebts(debts: Partial<EnhancedDebt>[]) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debts/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ debts })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Failed to create debts in bulk: ${response.statusText}`);
    }
    
    return result.data;
  }

  static async recordPayment(debtId: string, amount: number, notes: string = '') {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debt-payments/${debtId}/payments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ amount, notes })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Failed to record payment: ${response.statusText}`);
    }

    return result.data;
  }

  static async getPaymentHistory(debtId: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/debt-payments/${debtId}/payments/history`, {
      headers: this.getAuthHeaders()
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Failed to fetch payment history: ${response.statusText}`);
    }

    return result.data as Array<{
      id: number;
      previousBalance: number;
      newBalance: number;
      paymentAmount: number;
      changeType: string;
      notes: string | null;
      createdAt: string;
    }>;
  }
}

export const EnhancedDebtCalculator: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [debts, setDebts] = useState<EnhancedDebt[]>([]);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [calculationResults, setCalculationResults] = useState<{
    snowball: any;
    avalanche: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<{
    totalErrors: number;
    totalWarnings: number;
    isValid: boolean;
  }>({ totalErrors: 0, totalWarnings: 0, isValid: false });
  // Track most recently added debt for smooth animation/scroll
  const [lastAddedDebtId, setLastAddedDebtId] = useState<string | null>(null);
  
  // State for managing collapsed paid-off debts
  const [hidePaidOffDebts, setHidePaidOffDebts] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  // Load debts from backend on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDebts();
    }
  }, [isAuthenticated, user]);

  // Validate all debts whenever debts change
  useEffect(() => {
    validateAllDebts();
  }, [debts]);

  const loadDebts = async () => {
    try {
      setIsLoading(true);
      const fetchedDebts = await DebtAPIService.getAllDebts();
      
      if (fetchedDebts.length > 0) {
        setDebts(fetchedDebts);
      } else {
        // Initialize with a default debt entry if no debts exist
        addDebt();
      }
    } catch (error) {
      console.error('Error loading debts:', error);
      toast({
        title: "Error Loading Debts",
        description: "Failed to load your debts. Please refresh the page and try again.",
        variant: "destructive",
      });
      
      // Initialize with a default debt entry on error
      addDebt();
    } finally {
      setIsLoading(false);
    }
  };

  const validateAllDebts = () => {
    let totalErrors = 0;
    let totalWarnings = 0;

    // Only validate active debts (not paid-off ones)
    activeDebts.forEach(debt => {
      // Required field validation
      if (!debt.name || debt.name.trim().length < 2) totalErrors++;
      if (!debt.balance || debt.balance <= 0) totalErrors++;
      if (!debt.minPayment || debt.minPayment <= 0) totalErrors++;
      if (debt.interestRate < 0) totalErrors++;
      if (!debt.dueDate || debt.dueDate < 1 || debt.dueDate > 31) totalErrors++;
      if (!debt.debtType) totalErrors++;

      // Warning validations
      if (debt.minPayment > debt.balance) totalWarnings++;
      if (debt.interestRate > 30) totalWarnings++;
      if (debt.balance > 100000) totalWarnings++;
    });

    setValidationSummary({
      totalErrors,
      totalWarnings,
      isValid: totalErrors === 0 && activeDebts.length > 0
    });
  };

  const addDebt = () => {
    const newDebt: EnhancedDebt = {
      id: `temp-${Date.now()}`, // Temporary ID until saved to backend
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      minPayment: 0,
      interestRate: 0,
      dueDate: 15,
      debtType: 'other',
      description: '',
      originalBalance: 0,
      isNew: true // Flag to indicate this is a new debt not yet saved
    };
    setDebts([...debts, newDebt]);
    setLastAddedDebtId(newDebt.id);
    // Clear the highlight after animation completes
    setTimeout(() => setLastAddedDebtId(null), 900);
  };

  // Smoothly scroll the newly added debt into view
  useEffect(() => {
    if (lastAddedDebtId) {
      const el = document.getElementById(`debt-row-${lastAddedDebtId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [lastAddedDebtId]);

  const updateDebt = (updatedDebt: EnhancedDebt) => {
    // For new debts, just update local state - don't auto-save
    // User will click "Save" button to explicitly save
    setDebts(debts.map(debt => debt.id === updatedDebt.id ? updatedDebt : debt));
  };

  const saveDebt = async (debtToSave: EnhancedDebt) => {
    try {
      if (debtToSave.isNew) {
        // Validate required fields before saving
        if (!debtToSave.name || debtToSave.name.trim().length < 2) {
          toast({
            title: "Validation Error",
            description: "Debt name must be at least 2 characters long.",
            variant: "destructive",
          });
          return;
        }
        
        if (!debtToSave.balance || debtToSave.balance <= 0) {
          toast({
            title: "Validation Error", 
            description: "Current balance must be greater than 0.",
            variant: "destructive",
          });
          return;
        }
        
        if (!debtToSave.minPayment || debtToSave.minPayment <= 0) {
          toast({
            title: "Validation Error",
            description: "Minimum payment must be greater than 0.", 
            variant: "destructive",
          });
          return;
        }

        const createdDebt = await DebtAPIService.createDebt({
          name: debtToSave.name,
          balance: debtToSave.balance,
          interestRate: debtToSave.interestRate,
          minPayment: debtToSave.minPayment,
          dueDate: debtToSave.dueDate,
          debtType: debtToSave.debtType,
          description: debtToSave.description
        });
        
        // Replace the temporary debt with the created one
        setDebts(debts.map(debt => 
          debt.id === debtToSave.id ? { ...createdDebt, isNew: false } : debt
        ));
        
        toast({
          title: "✅ Debt Saved",
          description: `${createdDebt.name} has been saved to the database successfully!`,
        });
      } else {
        // This is an existing debt that needs to be updated
        const updated = await DebtAPIService.updateDebt(debtToSave.id, {
          name: debtToSave.name,
          balance: debtToSave.balance,
          interestRate: debtToSave.interestRate,
          minPayment: debtToSave.minPayment,
          dueDate: debtToSave.dueDate,
          debtType: debtToSave.debtType,
          description: debtToSave.description
        });
        
        setDebts(debts.map(debt => debt.id === debtToSave.id ? updated : debt));
        
        toast({
          title: "✅ Debt Updated",
          description: `${updated.name} has been updated in the database successfully!`,
        });
      }
    } catch (error) {
      console.error('Error saving debt:', error);
      
      toast({
        title: "❌ Save Failed",
        description: error instanceof Error ? error.message : "Failed to save debt to database. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const removeDebt = async (id: string) => {
    if (debts.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one debt entry.",
        variant: "destructive",
      });
      return;
    }

    const debtToRemove = debts.find(debt => debt.id === id);
    
    try {
      if (!debtToRemove?.isNew) {
        // Only call API if this is not a new unsaved debt
        await DebtAPIService.deleteDebt(id);
      }
      
      setDebts(debts.filter(debt => debt.id !== id));
      
      toast({
        title: "✅ Debt Removed",
        description: `${debtToRemove?.name || 'Debt'} has been removed successfully.`,
      });
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete debt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkPaidOff = async (debt: EnhancedDebt) => {
    try {
      if (debt.isNew) {
        toast({
          title: "Cannot Mark as Paid",
          description: "Please save the debt first before marking it as paid off.",
          variant: "destructive",
        });
        return;
      }

      const updatedDebt = await DebtAPIService.markDebtAsPaidOff(debt.id);
      
      setDebts(debts.map(d => d.id === debt.id ? { ...updatedDebt, isPaidOff: true } : d));
      
      toast({
        title: "🎉 Congratulations!",
        description: `${debt.name} has been marked as paid off! Check your email for a celebration message.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error marking debt as paid off:', error);
      toast({
        title: "Error",
        description: "Failed to mark debt as paid off. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportDebts = async (importedDebts: EnhancedDebt[]) => {
    try {
      setIsLoading(true);
      
      const result = await DebtAPIService.bulkCreateDebts(importedDebts);
      
      // Reload debts from server to get the latest data
      await loadDebts();
      
      toast({
        title: "✅ Import Successful",
        description: `Successfully imported ${result.created.length} debts${result.errors.length > 0 ? ` (${result.errors.length} failed)` : ''}.`,
        variant: "success",
      });
      
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
    } catch (error) {
      console.error('Error importing debts:', error);
      toast({
        title: "Import Error",
        description: "Failed to import debts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtraPaymentChange = (value: number) => {
    setExtraPayment(value);
  };

  const calculateStrategies = async () => {
    if (!validationSummary.isValid) {
      toast({
        title: "Validation Required",
        description: "Please fix all errors and save your debts before calculating payoff strategies.",
        variant: "destructive",
      });
      return;
    }

    // Only enforce "save before calculate" for authenticated users
    if (isAuthenticated) {
      const unsavedDebts = debts.filter(debt => debt.isNew);
      if (unsavedDebts.length > 0) {
        toast({
          title: "Unsaved Changes",
          description: "Please complete and save all debt entries before calculating.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsCalculating(true);

    try {
      const results = await DebtAPIService.calculatePayoffScenarios(extraPayment);
      setCalculationResults(results);

      toast({
        title: "✅ Calculation Complete",
        description: "Your debt payoff strategies have been calculated!",
        variant: "success",
      });

      // If user is not authenticated, prompt lead capture
      if (!isAuthenticated) {
        setShowLeadCapture(true);
      }

    } catch (error) {
      console.error('Error calculating strategies:', error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating your payoff strategies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getTotalDebt = () => debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const getTotalMinPayments = () => debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0);
  
  // Helper functions to separate active and paid-off debts
  const activeDebts = debts.filter(debt => !debt.isPaidOff);
  const paidOffDebts = debts.filter(debt => debt.isPaidOff);
  const hasPaidOffDebts = paidOffDebts.length > 0;

  // Show loading state while fetching data
  if (isLoading && debts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading your debts..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Debt Freedom Calculator</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan and track your personalized debt payoff strategies</p>
        </div>

        {/* Debt Entries Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Debts</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add and manage your debt information</p>
                </div>
                {validationSummary.isValid && (
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                )}
              </div>
              
              {/* Import Tools */}
              <DebtImportTools onImportDebts={handleImportDebts} />
            </div>
          </CardHeader>
        <CardContent className="pt-0">
          {/* Debt Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Debt</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      ${activeDebts.reduce((sum, debt) => sum + (debt.balance || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Outstanding balance</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Min Payments</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      ${activeDebts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly commitment</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Active Debts</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {activeDebts.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accounts open</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Paid Off</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {paidOffDebts.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Debts eliminated</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Debt Entries with Better Spacing */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Debt Entries</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {validationSummary.totalErrors > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    {validationSummary.totalErrors} error{validationSummary.totalErrors !== 1 ? 's' : ''} to fix
                  </span>
                )}
                {validationSummary.totalWarnings > 0 && (
                  <span className="text-orange-600 dark:text-orange-400 ml-2">
                    {validationSummary.totalWarnings} warning{validationSummary.totalWarnings !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            {activeDebts.map((debt, index) => (
              <div
                key={debt.id}
                id={`debt-row-${debt.id}`}
                className={
                  debt.id === lastAddedDebtId
                    ? "animate-slide-in-up ring-2 ring-purple-200 rounded-lg"
                    : "animate-stagger"
                }
              >
                <EnhancedDebtEntry
                  debt={debt}
                  onUpdate={updateDebt}
                  onSave={saveDebt}
                  onRemove={removeDebt}
                  onMarkPaidOff={handleMarkPaidOff}
                  onRecordPayment={DebtAPIService.recordPayment as any}
                  onFetchPaymentHistory={DebtAPIService.getPaymentHistory as any}
                  isFirst={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Paid Off Debts Section */}
          {hasPaidOffDebts && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Paid Off Debts ({paidOffDebts.length})
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Congratulations! These debts have been eliminated.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHidePaidOffDebts(!hidePaidOffDebts)}
                    className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {hidePaidOffDebts ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Paid Off
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Paid Off
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {!hidePaidOffDebts && (
                <div className="space-y-4">
                  {paidOffDebts.map((debt, index) => (
                    <div key={debt.id} className="animate-stagger">
                      <EnhancedDebtEntry
                        debt={debt}
                        onUpdate={updateDebt}
                        onSave={saveDebt}
                        onRemove={removeDebt}
                        onMarkPaidOff={handleMarkPaidOff}
                        isFirst={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Add Another Debt Button with Better Touch Target */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={addDebt}
              variant="outline"
              className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:border-gray-600 dark:hover:border-purple-500 dark:hover:bg-purple-900/20 text-base font-medium rounded-lg transition-all duration-200 group"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-3">
                <Plus className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                <span className="text-gray-600 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">Add Another Debt</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extra Payment Section with Better Visual Hierarchy */}
      <Card className="mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Extra Monthly Payment</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accelerate your debt freedom journey</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Label htmlFor="extra-payment" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 block">
                Additional amount to apply monthly
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="extra-payment"
                  type="number"
                  step="0.01"
                  min="0"
                  value={extraPayment || ''}
                  onChange={(e) => handleExtraPaymentChange(parseFloat(e.target.value) || 0)}
                  placeholder="200.00"
                  className="pl-12 h-12 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-slate-800 transition-colors duration-200"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Any extra money you can put toward debt elimination each month
              </p>
            </div>
            
            <Button
              onClick={calculateStrategies}
              disabled={!validationSummary.isValid || isCalculating || isLoading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {isCalculating ? (
                <>
                  <LoadingSpinner size="sm" inline className="mr-3" />
                  Calculating Strategies...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-3" />
                  Calculate Payoff Strategies
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {calculationResults && (
        <>
          <PayoffComparison 
            snowball={calculationResults.snowball}
            avalanche={calculationResults.avalanche}
          />
          
          <DebtProgress 
            debts={debts.map(debt => ({
              id: debt.id,
              name: debt.name,
              balance: debt.balance,
              minPayment: debt.minPayment,
              interestRate: debt.interestRate
            }))}
          />
        </>
      )}

      {/* Biblical Encouragement */}
      <BiblicalVerse />

      {/* Instructions for First-Time Users */}
      {debts.length === 1 && debts[0].balance === 0 && (
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="h-6 w-6 text-gray-400 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Welcome to Your Debt Freedom Journey
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">1</div>
                    <p><strong className="text-gray-900 dark:text-gray-100">Fill out your first debt</strong> with accurate information</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">2</div>
                    <p><strong className="text-gray-900 dark:text-gray-100">Add all your other debts</strong> using the form or import tools</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">3</div>
                    <p><strong className="text-gray-900 dark:text-gray-100">Set your extra monthly payment</strong> amount</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">4</div>
                    <p><strong className="text-gray-900 dark:text-gray-100">Calculate your personalized</strong> payoff strategies</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-gray-100">Pro tip:</strong> Your data is automatically saved to your account as you enter it!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guest Lead Capture */}
      {!isAuthenticated && calculationResults && (
        <LeadCaptureModal
          isOpen={showLeadCapture}
          onClose={() => setShowLeadCapture(false)}
          onSuccess={() => setShowLeadCapture(false)}
          debtData={{ debts, extraPayment, calculationResults }}
        />
      )}
      </div>
    </div>
  );
};
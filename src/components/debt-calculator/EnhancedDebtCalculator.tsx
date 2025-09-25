import React, { useState, useEffect } from 'react';
import { Plus, Calculator, DollarSign, BookOpen, AlertTriangle, CheckCircle2, TrendingUp, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { EnhancedDebtEntry, EnhancedDebt } from './EnhancedDebtEntry';
import { DebtImportTools } from './DebtImportTools';
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
      ...(token && { 'Authorization': `Bearer ${token}` })
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading your debts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      {/* <div className="text-center space-y-4 animate-fade-in-slow">
        <h1 className="text-4xl font-bold text-primary">
        The Pour & Payoff Planner™                                        
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter your debts below to create a personalized plan for financial freedom using biblical wisdom.
        </p>
      </div> */}


      {/* Debt Entries Section */}
      <Card className="bg-gradient-card shadow-card animate-slide-in-up dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-financial-debt" />
              <CardTitle>Your Debts</CardTitle>
              {validationSummary.isValid && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            {/* Import Tools */}
            <DebtImportTools onImportDebts={handleImportDebts} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Debt Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-secondary border border-border rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Debt</p>
              <p className="text-2xl font-bold text-red-600">
                ${activeDebts.reduce((sum, debt) => sum + (debt.balance || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Min Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                ${activeDebts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Debts</p>
              <p className="text-2xl font-bold text-purple-600">
                {activeDebts.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Paid Off</p>
              <p className="text-2xl font-bold text-green-600">
                {paidOffDebts.length}
              </p>
            </div>
          </div>

          {/* Active Debt Entries */}
          <div className="space-y-4">
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
            <div className="space-y-4 animate-slide-in-up">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-emerald-300">
                      Paid Off Debts ({paidOffDebts.length})
                    </h3>
                    <p className="text-sm text-green-600 dark:text-emerald-400">
                      Congratulations! These debts have been eliminated.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHidePaidOffDebts(!hidePaidOffDebts)}
                  className="border-green-300 text-green-700 hover:bg-green-100 transition-all duration-200 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
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
          
          {/* Add Another Debt Button */}
          <Button
            onClick={addDebt}
            variant="outline"
            className="w-full border-dashed border-2 hover:bg-primary/5 py-8 text-lg"
            disabled={isLoading}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Debt
          </Button>
        </CardContent>
      </Card>

      {/* Extra Payment Section */}
      <Card className="bg-gradient-card shadow-card animate-slide-in-up dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Extra Monthly Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="extra-payment" className="text-base font-medium">
                Additional amount to apply monthly
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="extra-payment"
                  type="number"
                  step="0.01"
                  min="0"
                  value={extraPayment || ''}
                  onChange={(e) => handleExtraPaymentChange(parseFloat(e.target.value) || 0)}
                  placeholder="200.00"
                  className="pl-10 text-lg py-6"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Any extra money you can put toward debt elimination each month
              </p>
            </div>
            
            <Button
              onClick={calculateStrategies}
              disabled={!validationSummary.isValid || isCalculating || isLoading}
              className="bg-gradient-primary hover:opacity-90 py-6 text-lg font-semibold"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-2" />
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
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Welcome to Your Debt Freedom Journey! 🎯
                </h3>
                <div className="text-blue-800 space-y-2">
                  <p><strong>Step 1:</strong> Fill out your first debt with accurate information</p>
                  <p><strong>Step 2:</strong> Add all your other debts using the form or import tools</p>
                  <p><strong>Step 3:</strong> Set your extra monthly payment amount</p>
                  <p><strong>Step 4:</strong> Calculate your personalized payoff strategies</p>
                  <p className="text-sm text-blue-600 mt-3 italic">
                    💡 Pro tip: Your data is automatically saved to your account as you enter it!
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
  );
};
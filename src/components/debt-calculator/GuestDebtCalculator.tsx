import React, { useState, useEffect } from 'react';
import { Plus, Calculator, DollarSign, BookOpen, AlertTriangle, CheckCircle2, TrendingUp, ChevronDown, ChevronUp, Eye, EyeOff, UserPlus, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { EnhancedDebtEntry, EnhancedDebt } from './EnhancedDebtEntry';
import { DebtImportTools } from './DebtImportTools';
import { BiblicalVerse } from './BiblicalVerse';
import { PayoffComparison } from './PayoffComparison';
import { DebtProgress } from './DebtProgress';
import { LeadCaptureModal } from './LeadCaptureModal';
import { useDebtsStorage } from '@/hooks/useDebtsStorage';

// Guest API service for local storage operations
class GuestDebtAPIService {
  static saveToLocalStorage(debts: EnhancedDebt[], extraPayment: number) {
    const data = {
      debts: debts.map(debt => ({
        ...debt,
        // Convert to local storage format
        id: debt.id,
        name: debt.name,
        balance: debt.balance,
        minPayment: debt.minPayment,
        interestRate: debt.interestRate,
        dueDate: debt.dueDate,
        debtType: debt.debtType,
        description: debt.description || '',
        originalBalance: debt.originalBalance || debt.balance,
        isPaidOff: debt.isPaidOff || false,
        paidOffDate: debt.paidOffDate,
        debtStatus: debt.debtStatus || 'active',
        isNew: false
      })),
      extraPayment,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('guest_debt_data', JSON.stringify(data));
  }

  static loadFromLocalStorage(): { debts: EnhancedDebt[], extraPayment: number } {
    try {
      const data = localStorage.getItem('guest_debt_data');
      if (data) {
        const parsed = JSON.parse(data);
        return {
          debts: parsed.debts || [],
          extraPayment: parsed.extraPayment || 0
        };
      }
    } catch (error) {
      console.error('Error loading guest debt data:', error);
    }
    return { debts: [], extraPayment: 0 };
  }

  static calculatePayoffStrategies(debts: EnhancedDebt[], extraPayment: number) {
    // Snowball method (lowest balance first)
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
    const snowballResult = this.calculatePayoffStrategy(snowballDebts, extraPayment);

    // Avalanche method (highest interest rate first)
    const avalancheDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    const avalancheResult = this.calculatePayoffStrategy(avalancheDebts, extraPayment);

    return {
      snowball: {
        method: 'snowball',
        totalMonths: snowballResult.totalMonths,
        totalInterest: snowballResult.totalInterest,
        totalPayments: snowballResult.totalPayments,
        payoffOrder: snowballResult.payoffOrder,
        monthlyCashFlow: snowballResult.monthlyCashFlow
      },
      avalanche: {
        method: 'avalanche',
        totalMonths: avalancheResult.totalMonths,
        totalInterest: avalancheResult.totalInterest,
        totalPayments: avalancheResult.totalPayments,
        payoffOrder: avalancheResult.payoffOrder,
        monthlyCashFlow: avalancheResult.monthlyCashFlow
      }
    };
  }

  static calculatePayoffStrategy(debts: EnhancedDebt[], extraPayment: number) {
    const debtsCopy = debts.map(debt => ({
      id: debt.id,
      name: debt.name,
      balance: debt.balance,
      interestRate: debt.interestRate / 100, // Convert percentage to decimal
      minimumPayment: debt.minPayment,
      monthsToPayoff: 0,
      totalInterest: 0
    }));

    let totalMonths = 0;
    let totalInterest = 0;
    let totalPayments = 0;
    const payoffOrder = [];
    let availableExtra = extraPayment;

    while (debtsCopy.some(debt => debt.balance > 0)) {
      totalMonths++;
      let monthlyExtra = availableExtra;

      // Apply minimum payments and calculate interest
      for (const debt of debtsCopy) {
        if (debt.balance > 0) {
          const monthlyInterest = debt.balance * (debt.interestRate / 12);
          const principalPayment = Math.min(debt.minimumPayment - monthlyInterest, debt.balance);
          
          debt.balance -= principalPayment;
          debt.totalInterest += monthlyInterest;
          totalInterest += monthlyInterest;
          totalPayments += debt.minimumPayment;

          if (debt.balance <= 0) {
            debt.monthsToPayoff = totalMonths;
            payoffOrder.push({
              id: debt.id,
              name: debt.name,
              monthsToPayoff: totalMonths,
              totalInterest: Math.round(debt.totalInterest * 100) / 100
            });
            availableExtra += debt.minimumPayment; // Snowball effect
          }
        }
      }

      // Apply extra payment to first active debt
      const firstActiveDebt = debtsCopy.find(debt => debt.balance > 0);
      if (firstActiveDebt && monthlyExtra > 0) {
        const extraToApply = Math.min(monthlyExtra, firstActiveDebt.balance);
        firstActiveDebt.balance -= extraToApply;
        totalPayments += extraToApply;

        if (firstActiveDebt.balance <= 0) {
          firstActiveDebt.monthsToPayoff = totalMonths;
          if (!payoffOrder.some(p => p.id === firstActiveDebt.id)) {
            payoffOrder.push({
              id: firstActiveDebt.id,
              name: firstActiveDebt.name,
              monthsToPayoff: totalMonths,
              totalInterest: Math.round(firstActiveDebt.totalInterest * 100) / 100
            });
          }
          availableExtra += firstActiveDebt.minimumPayment;
        }
      }

      // Safety check to prevent infinite loops
      if (totalMonths > 600) { // 50 years max
        break;
      }
    }

    return {
      totalMonths,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      payoffOrder,
      monthlyCashFlow: debts.reduce((sum, debt) => sum + debt.minPayment, 0) + extraPayment
    };
  }
}

export const GuestDebtCalculator: React.FC = () => {
  const { toast } = useToast();
  const { saveDebtData } = useDebtsStorage();
  
  // State management
  const [debts, setDebts] = useState<EnhancedDebt[]>([]);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [calculationResults, setCalculationResults] = useState<{
    snowball: any;
    avalanche: any;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<{
    totalErrors: number;
    totalWarnings: number;
    isValid: boolean;
  }>({ totalErrors: 0, totalWarnings: 0, isValid: false });
  
  // State for managing collapsed paid-off debts
  const [hidePaidOffDebts, setHidePaidOffDebts] = useState(false);
  
  // Lead capture state
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  // Track last added for animation/scroll
  const [lastAddedDebtId, setLastAddedDebtId] = useState<string | null>(null);

  // Load debts from local storage on component mount
  useEffect(() => {
    const { debts: storedDebts, extraPayment: storedExtraPayment } = GuestDebtAPIService.loadFromLocalStorage();
    
    if (storedDebts.length > 0) {
      setDebts(storedDebts);
      setExtraPayment(storedExtraPayment);
    } else {
      // Initialize with a default debt entry if no debts exist
      addDebt();
    }
  }, []);

  // Validate all debts whenever debts change
  useEffect(() => {
    validateAllDebts();
  }, [debts]);

  // Auto-save to local storage when debts or extra payment changes
  useEffect(() => {
    if (debts.length > 0) {
      GuestDebtAPIService.saveToLocalStorage(debts, extraPayment);
    }
  }, [debts, extraPayment]);

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
      id: `temp-${Date.now()}`, // Temporary ID
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      minPayment: 0,
      interestRate: 0,
      dueDate: 15,
      debtType: 'other',
      description: '',
      originalBalance: 0,
      isNew: true // Flag to indicate this is a new debt
    };
    setDebts([...debts, newDebt]);
    setLastAddedDebtId(newDebt.id);
    setTimeout(() => setLastAddedDebtId(null), 900);
  };

  useEffect(() => {
    if (lastAddedDebtId) {
      const el = document.getElementById(`debt-row-${lastAddedDebtId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lastAddedDebtId]);

  const updateDebt = (updatedDebt: EnhancedDebt) => {
    setDebts(debts.map(debt => debt.id === updatedDebt.id ? updatedDebt : debt));
  };

  const removeDebt = (id: string) => {
    if (debts.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one debt entry.",
        variant: "destructive",
      });
      return;
    }

    const debtToRemove = debts.find(debt => debt.id === id);
    setDebts(debts.filter(debt => debt.id !== id));
    
    toast({
      title: "✅ Debt Removed",
      description: `${debtToRemove?.name || 'Debt'} has been removed successfully.`,
    });
  };

  const handleMarkPaidOff = async (debt: EnhancedDebt) => {
    setDebts(debts.map(d => d.id === debt.id ? { ...d, isPaidOff: true, debtStatus: 'paid_off', paidOffDate: new Date().toISOString() } : d));
    
    toast({
      title: "🎉 Congratulations!",
      description: `${debt.name} has been marked as paid off!`,
      duration: 5000,
    });
  };

  const handleImportDebts = async (importedDebts: EnhancedDebt[]) => {
    try {
      const newDebts = importedDebts.map(debt => ({
        ...debt,
        id: `temp-${Date.now()}-${Math.random()}`,
        isNew: true
      }));
      
      setDebts([...debts, ...newDebts]);
      
      toast({
        title: "✅ Import Successful",
        description: `Successfully imported ${newDebts.length} debts.`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error importing debts:', error);
      toast({
        title: "Import Error",
        description: "Failed to import debts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExtraPaymentChange = (value: number) => {
    setExtraPayment(value);
  };

  const calculateStrategies = () => {
    if (!validationSummary.isValid) {
      toast({
        title: "Validation Required",
        description: "Please fix all errors before calculating payoff strategies.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    try {
      const results = GuestDebtAPIService.calculatePayoffStrategies(activeDebts, extraPayment);
      setCalculationResults(results);
      setHasCalculated(true);

      toast({
        title: "✅ Calculation Complete",
        description: "Your debt payoff strategies have been calculated!",
        variant: "success",
      });

      // Show lead capture modal after successful calculation
      setTimeout(() => {
        setShowLeadCapture(true);
      }, 2000);

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

  const exportData = () => {
    const data = {
      debts: debts.map(debt => ({
        name: debt.name,
        balance: debt.balance,
        minPayment: debt.minPayment,
        interestRate: debt.interestRate,
        dueDate: debt.dueDate,
        debtType: debt.debtType,
        description: debt.description
      })),
      extraPayment,
      calculationResults,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-payoff-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Data Exported",
      description: "Your debt payoff plan has been exported successfully!",
    });
  };

  const getTotalDebt = () => debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const getTotalMinPayments = () => debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0);
  
  // Helper functions to separate active and paid-off debts
  const activeDebts = debts.filter(debt => !debt.isPaidOff);
  const paidOffDebts = debts.filter(debt => debt.isPaidOff);
  const hasPaidOffDebts = paidOffDebts.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in-slow">
        <h1 className="text-4xl font-bold text-primary">
          The Pour & Payoff Planner™
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter your debts below to create a personalized plan for financial freedom using biblical wisdom.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>🔒 GUEST MODE:</strong> You're using the calculator without an account. 
            Create a free account to save your progress and access advanced features like payment tracking and monthly reports.
            <br />
            <strong>NO SAVE BUTTONS - Data stored in browser only</strong>
          </p>
        </div>
      </div>

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
                  onRemove={removeDebt}
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
                        onRemove={removeDebt}
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
            
            <div className="flex gap-3">
              <Button
                onClick={calculateStrategies}
                disabled={!validationSummary.isValid || isCalculating}
                className="bg-gradient-primary hover:opacity-90 py-6 text-lg font-semibold flex-1"
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
              
              {hasCalculated && (
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="py-6 text-lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export Plan
                </Button>
              )}
            </div>
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

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        onSuccess={() => {
          setShowLeadCapture(false);
          toast({
            title: "🎉 Welcome!",
            description: "Your account has been created! You can now save your progress and access advanced features.",
            duration: 5000,
          });
        }}
        debtData={{
          debts: activeDebts,
          extraPayment,
          calculationResults
        }}
      />

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
                    💡 Pro tip: Create a free account to save your progress and access payment tracking!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

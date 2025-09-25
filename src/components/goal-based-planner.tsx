import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { format, addMonths, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculatePayoffStrategies } from './debt-calculator/PayoffCalculator';
import { Debt } from './debt-calculator/DebtEntry';

interface GoalBasedPlannerProps {
  debts: Debt[];
  baseExtraPayment: number;
  onGoalSelect?: (extraPayment: number) => void;
}

interface PaymentGoal {
  id: string;
  name: string;
  targetDate: Date;
  requiredPayment: number;
  isAchievable: boolean;
  totalInterest: number;
  strategy: 'snowball' | 'avalanche';
}

interface DateGoal {
  id: string;
  name: string;
  extraPayment: number;
  projectedDate: Date;
  totalInterest: number;
  strategy: 'snowball' | 'avalanche';
}

export const GoalBasedPlanner: React.FC<GoalBasedPlannerProps> = ({
  debts,
  baseExtraPayment,
  onGoalSelect
}) => {
  const [targetDate, setTargetDate] = useState<Date>();
  const [budgetAmount, setBudgetAmount] = useState<number>(baseExtraPayment);
  const [paymentGoals, setPaymentGoals] = useState<PaymentGoal[]>([]);
  const [dateGoals, setDateGoals] = useState<DateGoal[]>([]);
  const [baselineResult, setBaselineResult] = useState<any>(null);

  // Calculate baseline
  useEffect(() => {
    if (debts.length > 0) {
      const validDebts = debts.filter(debt => 
        debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
      );
      
      if (validDebts.length > 0) {
        const baseline = calculatePayoffStrategies(validDebts, baseExtraPayment);
        setBaselineResult(baseline);
      }
    }
  }, [debts, baseExtraPayment]);

  // Calculate required payment for target date
  const calculateRequiredPayment = (targetDate: Date): PaymentGoal | null => {
    if (!targetDate || !baselineResult) return null;

    const validDebts = debts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length === 0) return null;

    const targetMonths = differenceInMonths(targetDate, new Date());
    if (targetMonths <= 0) return null;

    // Binary search to find required payment
    let low = 0;
    let high = 50000; // Max reasonable extra payment
    let bestPayment = null;
    let bestResult = null;
    let bestStrategy = 'snowball';

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const snowballResult = calculatePayoffStrategies(validDebts, mid).snowball;
      const avalancheResult = calculatePayoffStrategies(validDebts, mid).avalanche;
      
      const snowballMonths = snowballResult.totalMonths;
      const avalancheMonths = avalancheResult.totalMonths;
      
      // Use the better strategy for this payment amount
      const useSnowball = snowballMonths <= avalancheMonths;
      const months = useSnowball ? snowballMonths : avalancheMonths;
      const result = useSnowball ? snowballResult : avalancheResult;
      
      if (months <= targetMonths) {
        bestPayment = mid;
        bestResult = result;
        bestStrategy = useSnowball ? 'snowball' : 'avalanche';
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return {
      id: targetDate.toISOString(),
      name: `Target: ${format(targetDate, 'MMM yyyy')}`,
      targetDate,
      requiredPayment: bestPayment || high,
      isAchievable: bestPayment !== null,
      totalInterest: bestResult?.totalInterest || 0,
      strategy: bestStrategy as 'snowball' | 'avalanche'
    };
  };

  // Calculate projected date for budget amount
  const calculateProjectedDate = (extraPayment: number): DateGoal | null => {
    if (!baselineResult || extraPayment < 0) return null;

    const validDebts = debts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length === 0) return null;

    const results = calculatePayoffStrategies(validDebts, extraPayment);
    const snowballMonths = results.snowball.totalMonths;
    const avalancheMonths = results.avalanche.totalMonths;
    
    // Use the better strategy
    const useSnowball = snowballMonths <= avalancheMonths;
    const months = useSnowball ? snowballMonths : avalancheMonths;
    const result = useSnowball ? results.snowball : results.avalanche;
    
    const projectedDate = addMonths(new Date(), Math.ceil(months));

    return {
      id: extraPayment.toString(),
      name: `Budget: $${extraPayment.toLocaleString()}/month`,
      extraPayment,
      projectedDate,
      totalInterest: result.totalInterest,
      strategy: useSnowball ? 'snowball' : 'avalanche'
    };
  };

  const addPaymentGoal = () => {
    if (!targetDate) return;
    
    const goal = calculateRequiredPayment(targetDate);
    if (goal) {
      setPaymentGoals([...paymentGoals, goal]);
      setTargetDate(undefined);
    }
  };

  const addDateGoal = () => {
    if (budgetAmount < 0) return;
    
    const goal = calculateProjectedDate(budgetAmount);
    if (goal) {
      setDateGoals([...dateGoals, goal]);
    }
  };

  const removeGoal = (goalId: string, type: 'payment' | 'date') => {
    if (type === 'payment') {
      setPaymentGoals(paymentGoals.filter(g => g.id !== goalId));
    } else {
      setDateGoals(dateGoals.filter(g => g.id !== goalId));
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonths = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  if (!baselineResult) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Add valid debt information to use goal-based planning</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-500" />
          Goal-Based Planning
        </CardTitle>
        <p className="text-muted-foreground">
          Set specific financial goals and see exactly what it takes to achieve them
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="target-date" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="target-date">Target Date Goals</TabsTrigger>
            <TabsTrigger value="budget-goals">Budget Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="target-date" className="space-y-6">
            {/* Add Target Date Goal */}
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Set Target Payoff Date
              </h4>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label>Target Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetDate ? format(targetDate, "PPP") : "Pick a target date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={setTargetDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  onClick={addPaymentGoal}
                  disabled={!targetDate}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Required Payment
                </Button>
              </div>
            </div>

            {/* Payment Goals List */}
            <div className="space-y-3">
              {paymentGoals.map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {goal.isAchievable ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                      <h5 className="font-semibold">{goal.name}</h5>
                      <Badge variant={goal.strategy === 'snowball' ? 'default' : 'secondary'}>
                        {goal.strategy}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {goal.isAchievable && (
                        <Button
                          size="sm"
                          onClick={() => onGoalSelect?.(goal.requiredPayment)}
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          Apply Goal
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeGoal(goal.id, 'payment')}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Required Extra Payment</p>
                      <p className="font-semibold text-lg">
                        {goal.isAchievable 
                          ? formatCurrency(goal.requiredPayment)
                          : "Not achievable"
                        }
                        <span className="text-sm font-normal">/month</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-medium">{formatCurrency(goal.totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target Date</p>
                      <p className="font-medium">{format(goal.targetDate, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  {!goal.isAchievable && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/50 rounded border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        This target date may not be achievable even with maximum payments. Consider extending the timeline.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="budget-goals" className="space-y-6">
            {/* Add Budget Goal */}
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Set Monthly Budget
              </h4>
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="budget-amount">Extra Payment Budget</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={addDateGoal}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Calculate Timeline
                </Button>
              </div>
            </div>

            {/* Date Goals List */}
            <div className="space-y-3">
              {dateGoals.map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <h5 className="font-semibold">{goal.name}</h5>
                      <Badge variant={goal.strategy === 'snowball' ? 'default' : 'secondary'}>
                        {goal.strategy}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onGoalSelect?.(goal.extraPayment)}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        Apply Goal
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeGoal(goal.id, 'date')}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Projected Freedom Date</p>
                      <p className="font-semibold text-lg">
                        {format(goal.projectedDate, 'MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-medium">{formatCurrency(goal.totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Budget</p>
                      <p className="font-medium">{formatCurrency(goal.extraPayment)}/month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Current Baseline Reference */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border-2 border-dashed">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4" />
            <h4 className="font-semibold">Current Plan (Baseline)</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Freedom Date</p>
              <p className="font-semibold">
                {format(addMonths(new Date(), Math.ceil(baselineResult.snowball.totalMonths)), 'MMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Interest</p>
              <p className="font-semibold">{formatCurrency(baselineResult.snowball.totalInterest)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Extra Payment</p>
              <p className="font-semibold">{formatCurrency(baseExtraPayment)}/month</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield,
  DollarSign,
  TrendingUp,
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Target,
  PiggyBank,
  Home,
  Utensils,
  Car,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExpenseCategory {
  id: string;
  name: string;
  icon: any;
  amount: number;
  required: boolean;
}

export function EmergencyFundCalculator() {
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useLocalStorage<ExpenseCategory[]>("emergency-fund-expenses", [
    { id: "housing", name: "Housing (Rent/Mortgage)", icon: Home, amount: 0, required: true },
    { id: "utilities", name: "Utilities", icon: Zap, amount: 0, required: true },
    { id: "food", name: "Groceries & Food", icon: Utensils, amount: 0, required: true },
    { id: "transportation", name: "Transportation", icon: Car, amount: 0, required: true },
    { id: "insurance", name: "Insurance", icon: Shield, amount: 0, required: true },
    { id: "debt", name: "Minimum Debt Payments", icon: DollarSign, amount: 0, required: true },
    { id: "other", name: "Other Essential Expenses", icon: Target, amount: 0, required: false }
  ]);

  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [monthsDesired, setMonthsDesired] = useState<number>(3);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState<number>(0);

  const monthlyEssentials = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const emergencyFundTarget = monthlyEssentials * monthsDesired;
  const remainingAmount = Math.max(0, emergencyFundTarget - currentSavings);
  const progressPercentage = emergencyFundTarget > 0 ? Math.min(100, (currentSavings / emergencyFundTarget) * 100) : 0;
  const monthsToComplete = monthlySavingsGoal > 0 ? Math.ceil(remainingAmount / monthlySavingsGoal) : 0;

  const updateExpense = (id: string, amount: number) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, amount } : expense
    ));
  };

  const getRecommendation = () => {
    if (progressPercentage >= 100) {
      return {
        type: "success",
        title: "Emergency Fund Complete! 🎉",
        message: "Congratulations! You have a fully funded emergency fund. Now you can focus aggressively on debt payoff with confidence.",
        action: "Consider increasing to 6 months if you have irregular income or job instability."
      };
    } else if (progressPercentage >= 75) {
      return {
        type: "good", 
        title: "Almost There!",
        message: "You're making great progress. Stay focused on completing your emergency fund before aggressive debt payoff.",
        action: `Save $${remainingAmount.toLocaleString()} more to reach your goal.`
      };
    } else if (progressPercentage >= 25) {
      return {
        type: "warning",
        title: "Building Momentum",
        message: "Good start! Continue building your emergency fund as a foundation before tackling debt aggressively.",
        action: `Focus on reaching $1,000 minimum, then build to your full ${monthsDesired}-month goal.`
      };
    } else {
      return {
        type: "alert",
        title: "Start Here First",
        message: "Emergency fund should be your first priority. Even $1,000 starter emergency fund provides crucial protection.",
        action: "Begin with baby step 1: Save $1,000 before paying extra on debt."
      };
    }
  };

  const recommendation = getRecommendation();

  const calculateTimeToGoal = () => {
    if (monthlySavingsGoal <= 0) return "Set savings goal to calculate timeline";
    if (remainingAmount <= 0) return "Goal achieved!";
    
    const months = Math.ceil(remainingAmount / monthlySavingsGoal);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Emergency Fund Calculator</h1>
        <p className="text-muted-foreground">
          Build a proper financial foundation before aggressive debt payoff
        </p>
      </div>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Essentials</p>
                <p className="text-2xl font-bold">${monthlyEssentials.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fund Target</p>
                <p className="text-2xl font-bold">${emergencyFundTarget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <PiggyBank className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Savings</p>
                <p className="text-2xl font-bold">${currentSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Recommendation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Fund Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {monthsDesired}-month goal</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${currentSavings.toLocaleString()}</span>
              <span>${emergencyFundTarget.toLocaleString()}</span>
            </div>
          </div>

          <Alert className={`border-l-4 ${
            recommendation.type === 'success' ? 'border-l-green-500 bg-green-50' :
            recommendation.type === 'good' ? 'border-l-blue-500 bg-blue-50' :
            recommendation.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
            'border-l-red-500 bg-red-50'
          }`}>
            <div className="flex items-start gap-3">
              {recommendation.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> :
               recommendation.type === 'alert' ? <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" /> :
               <Target className="h-5 w-5 text-blue-600 mt-0.5" />}
              <div>
                <h4 className="font-semibold mb-1">{recommendation.title}</h4>
                <AlertDescription className="mb-2">
                  {recommendation.message}
                </AlertDescription>
                <p className="text-sm font-medium">{recommendation.action}</p>
              </div>
            </div>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Essential Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Monthly Essential Expenses
            </CardTitle>
            <CardDescription>
              Calculate your true monthly survival costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <expense.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={expense.id} className="text-sm font-medium">
                    {expense.name}
                    {expense.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={expense.id}
                    type="number"
                    placeholder="0"
                    value={expense.amount || ""}
                    onChange={(e) => updateExpense(expense.id, parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Monthly Essentials:</span>
                <span className="text-xl font-bold text-green-600">
                  ${monthlyEssentials.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings and Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fund Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-savings">Current Emergency Savings ($)</Label>
                <Input
                  id="current-savings"
                  type="number"
                  placeholder="0"
                  value={currentSavings || ""}
                  onChange={(e) => setCurrentSavings(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="months-desired">Months of Expenses</Label>
                <Input
                  id="months-desired"
                  type="number"
                  min="1"
                  max="12"
                  value={monthsDesired}
                  onChange={(e) => setMonthsDesired(parseInt(e.target.value) || 3)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 3-6 months (3 for stable income, 6 for irregular income)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly-savings">Monthly Savings Goal ($)</Label>
                <Input
                  id="monthly-savings"
                  type="number"
                  placeholder="0"
                  value={monthlySavingsGoal || ""}
                  onChange={(e) => setMonthlySavingsGoal(parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline to Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {calculateTimeToGoal()}
                </div>
                <p className="text-sm text-muted-foreground">
                  To complete your emergency fund
                </p>
              </div>

              {remainingAmount > 0 && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Amount remaining:</span>
                    <span className="font-semibold">${remainingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly savings needed:</span>
                    <span className="font-semibold">${monthlySavingsGoal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Biblical Principle:</strong> "The wise store up choice food and olive oil, but fools gulp theirs down." - Proverbs 21:20. 
                  An emergency fund provides wisdom and peace in uncertain times.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
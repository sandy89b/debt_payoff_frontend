import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Debt } from './DebtEntry';
import { Target, TrendingUp } from 'lucide-react';

interface DebtProgressProps {
  debts: Debt[];
  totalPaidOff?: number;
}

export const DebtProgress: React.FC<DebtProgressProps> = ({ debts, totalPaidOff = 0 }) => {
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const averageInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + (debt.interestRate * debt.balance), 0) / totalDebt
    : 0;

  const progressPercentage = totalPaidOff > 0 
    ? Math.min((totalPaidOff / (totalDebt + totalPaidOff)) * 100, 100)
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            Debt Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-financial-debt/10 rounded-lg border border-financial-debt/20">
              <div className="text-xl font-bold text-financial-debt">{formatCurrency(totalDebt)}</div>
              <div className="text-xs text-muted-foreground">Total Debt</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xl font-bold text-primary">{formatCurrency(totalMinPayments)}</div>
              <div className="text-xs text-muted-foreground">Monthly Minimums</div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-lg font-bold text-warning">{averageInterestRate.toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground">Weighted Avg Interest</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-financial-growth">
            <TrendingUp className="h-5 w-5" />
            Progress to Freedom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Debt Eliminated</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
            <div className="text-center text-xs text-muted-foreground">
              {formatCurrency(totalPaidOff)} of {formatCurrency(totalDebt + totalPaidOff)} eliminated
            </div>
          </div>
          
          <div className="bg-financial-wisdom/10 p-4 rounded-lg border border-financial-wisdom/20">
            <p className="text-sm text-center italic">
              "Let no debt remain outstanding, except the continuing debt to love one another."
            </p>
            <cite className="text-xs block text-center mt-2 text-muted-foreground">
              Romans 13:8
            </cite>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
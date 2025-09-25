import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PayoffResult } from './PayoffCalculator';
import { Calendar, DollarSign, TrendingDown, Trophy } from 'lucide-react';

interface PayoffComparisonProps {
  snowball: PayoffResult;
  avalanche: PayoffResult;
}

export const PayoffComparison: React.FC<PayoffComparisonProps> = ({ snowball, avalanche }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} months`;
    } else if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  };

  const interestSavings = snowball.totalInterest - avalanche.totalInterest;
  const timeDifference = snowball.totalMonths - avalanche.totalMonths;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Snowball Method */}
      <Card className="bg-gradient-card shadow-card dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-financial-progress">
            <Trophy className="h-5 w-5" />
            Debt Snowball Method
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay smallest balances first for psychological wins
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-secondary rounded-lg">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-financial-progress" />
              <div className="text-lg font-semibold">{formatMonths(snowball.totalMonths)}</div>
              <div className="text-xs text-muted-foreground">Time to Freedom</div>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-financial-debt" />
              <div className="text-lg font-semibold">{formatCurrency(snowball.totalInterest)}</div>
              <div className="text-xs text-muted-foreground">Total Interest</div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 dark:bg-emerald-900/15 dark:border-emerald-800">
            <h4 className="font-medium text-green-700 mb-2 dark:text-emerald-300">Psychological Benefits</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Quick wins build momentum</li>
              <li>• Simplified focus on one debt</li>
              <li>• Motivational progress markers</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Avalanche Method */}
      <Card className="bg-gradient-card shadow-card dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-financial-growth">
            <TrendingDown className="h-5 w-5" />
            Debt Avalanche Method
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay highest interest rates first for maximum savings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-secondary rounded-lg">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-financial-progress" />
              <div className="text-lg font-semibold">{formatMonths(avalanche.totalMonths)}</div>
              <div className="text-xs text-muted-foreground">Time to Freedom</div>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-financial-growth" />
              <div className="text-lg font-semibold">{formatCurrency(avalanche.totalInterest)}</div>
              <div className="text-xs text-muted-foreground">Total Interest</div>
            </div>
          </div>
          
          <div className="bg-financial-growth/10 p-4 rounded-lg border border-financial-growth/20">
            <h4 className="font-medium text-financial-growth mb-2">Mathematical Benefits</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Maximum interest savings</li>
              <li>• Mathematically optimal</li>
              <li>• Faster overall payoff</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Summary */}
      <Card className="md:col-span-2 bg-white border border-purple-100 shadow-card dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-center text-purple-700">Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {interestSavings > 0 ? formatCurrency(interestSavings) : formatCurrency(Math.abs(interestSavings))}
              </div>
              <div className="text-sm text-muted-foreground">
                {interestSavings > 0 ? 'Avalanche saves more' : 'Snowball costs more'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {Math.abs(timeDifference)} months
              </div>
              <div className="text-sm text-muted-foreground">
                {timeDifference > 0 ? 'Avalanche is faster' : 'Snowball is faster'}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg border border-purple-50">
            <p className="text-sm text-center italic">
              "The plans of the diligent lead to profit as surely as haste leads to poverty." - Proverbs 21:5
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
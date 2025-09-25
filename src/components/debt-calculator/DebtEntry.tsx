import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  minPayment: number;
  interestRate: number;
}

interface DebtEntryProps {
  debt: Debt;
  onUpdate: (debt: Debt) => void;
  onRemove: (id: string) => void;
  isFirst?: boolean;
}

export const DebtEntry: React.FC<DebtEntryProps> = ({ debt, onUpdate, onRemove, isFirst = false }) => {
  const handleChange = (field: keyof Debt, value: string | number) => {
    onUpdate({
      ...debt,
      [field]: value
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card animate-fade-in">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor={`debt-name-${debt.id}`} className="text-sm font-medium text-foreground">
              Debt Name
            </Label>
            <Input
              id={`debt-name-${debt.id}`}
              value={debt.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Credit Card 1"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor={`debt-balance-${debt.id}`} className="text-sm font-medium text-foreground">
              Current Balance
            </Label>
            <Input
              id={`debt-balance-${debt.id}`}
              type="number"
              value={debt.balance || ''}
              onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
              placeholder="5000"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor={`debt-payment-${debt.id}`} className="text-sm font-medium text-foreground">
              Min Payment
            </Label>
            <Input
              id={`debt-payment-${debt.id}`}
              type="number"
              value={debt.minPayment || ''}
              onChange={(e) => handleChange('minPayment', parseFloat(e.target.value) || 0)}
              placeholder="150"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor={`debt-rate-${debt.id}`} className="text-sm font-medium text-foreground">
                Interest Rate (%)
              </Label>
              <Input
                id={`debt-rate-${debt.id}`}
                type="number"
                step="0.01"
                value={debt.interestRate || ''}
                onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
                placeholder="18.99"
                className="mt-1"
              />
            </div>
            
            {!isFirst && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemove(debt.id)}
                className="text-financial-debt hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
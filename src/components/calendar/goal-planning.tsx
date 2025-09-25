import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Target, CalendarIcon, TrendingUp, Clock } from 'lucide-react';
import { format, differenceInMonths, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Debt } from '../debt-calculator/DebtEntry';

interface Goal {
  id: string;
  title: string;
  targetDate: Date;
  targetAmount: number;
  description?: string;
  priority: 'high' | 'medium' | 'low';
}

interface GoalPlanningProps {
  debts: Debt[];
  currentExtraPayment?: number;
}

export const GoalPlanning: React.FC<GoalPlanningProps> = ({
  debts,
  currentExtraPayment = 0
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState<Date | undefined>();
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<Goal['priority']>('medium');

  const calculateRequiredPayment = (goal: Goal) => {
    const today = new Date();
    const monthsUntilGoal = differenceInMonths(goal.targetDate, today);
    
    if (monthsUntilGoal <= 0) return null;
    
    // Calculate current total debt
    const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
    const totalMinPayments = debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0);
    
    // Required extra payment to reach goal
    const requiredExtraPayment = Math.max(0, (totalDebt - goal.targetAmount) / monthsUntilGoal - totalMinPayments);
    
    return {
      monthsUntilGoal,
      requiredExtraPayment,
      totalDebt,
      feasible: requiredExtraPayment >= 0
    };
  };

  const addGoal = () => {
    if (!newGoalTitle || !newGoalTargetDate || !newGoalAmount) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle,
      targetDate: newGoalTargetDate,
      targetAmount: parseFloat(newGoalAmount),
      description: newGoalDescription,
      priority: newGoalPriority
    };

    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalTargetDate(undefined);
    setNewGoalAmount('');
    setNewGoalDescription('');
    setNewGoalPriority('medium');
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityVariant = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goal-Based Planning</h1>
          <p className="text-muted-foreground">Set debt payoff goals and track your progress</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input
                  placeholder="e.g., Pay off credit cards"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newGoalTargetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoalTargetDate ? format(newGoalTargetDate, "PPP") : "Select target date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newGoalTargetDate}
                      onSelect={setNewGoalTargetDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Target Remaining Balance</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <Button
                      key={priority}
                      variant={newGoalPriority === priority ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewGoalPriority(priority)}
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Additional notes..."
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                />
              </div>
              <Button onClick={addGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first debt payoff goal to start planning your financial future
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const calculation = calculateRequiredPayment(goal);
            
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", getPriorityColor(goal.priority))} />
                      <CardTitle>{goal.title}</CardTitle>
                      <Badge variant={getPriorityVariant(goal.priority)}>
                        {goal.priority} priority
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  {goal.description && (
                    <p className="text-muted-foreground">{goal.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Target Date</p>
                        <p className="font-medium">{format(goal.targetDate, "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Target Balance</p>
                        <p className="font-medium">${goal.targetAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time Remaining</p>
                        <p className="font-medium">
                          {calculation ? `${calculation.monthsUntilGoal} months` : 'Past due'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {calculation && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Required Payment Plan</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current extra payment:</p>
                          <p className="font-medium">${currentExtraPayment.toFixed(2)}/month</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Required extra payment:</p>
                          <p className={cn(
                            "font-medium",
                            calculation.requiredExtraPayment <= currentExtraPayment ? "text-green-600" : "text-red-600"
                          )}>
                            ${calculation.requiredExtraPayment.toFixed(2)}/month
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {calculation.requiredExtraPayment <= currentExtraPayment ? (
                          <Badge variant="default" className="bg-green-600">
                            ✓ Goal achievable with current payments
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Need ${(calculation.requiredExtraPayment - currentExtraPayment).toFixed(2)} more per month
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
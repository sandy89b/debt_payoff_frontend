import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Target, 
  Play, 
  TrendingUp, 
  DollarSign, 
  Trophy,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface ProgressDashboardProps {
  currentStep: number;
  completedSteps: number[];
  debtsEntered: number;
  calculationsDone: boolean;
}

const steps = [
  { id: 1, title: "INVENTORY", subtitle: "What's In Your House?", icon: Search, color: "text-blue-500" },
  { id: 2, title: "INSTRUCTION", subtitle: "Borrow With Purpose", icon: Target, color: "text-green-500" },
  { id: 3, title: "IMPLEMENTATION", subtitle: "Shut the Door and Pour", icon: Play, color: "text-purple-500" },
  { id: 4, title: "INCREASE", subtitle: "Let It Flow Until It Stops", icon: TrendingUp, color: "text-orange-500" },
  { id: 5, title: "INCOME", subtitle: "Sell the Oil", icon: DollarSign, color: "text-yellow-500" },
  { id: 6, title: "IMPACT", subtitle: "Pay Off & Live on the Rest", icon: Trophy, color: "text-red-500" }
];

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  currentStep,
  completedSteps,
  debtsEntered,
  calculationsDone
}) => {
  const overallProgress = (completedSteps.length / steps.length) * 100;
  const currentStepData = steps.find(step => step.id === currentStep) || steps[0];
  const CurrentIcon = currentStepData.icon;

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <CurrentIcon className={`h-6 w-6 ${currentStepData.color}`} />
            <div className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse" />
          </div>
          Your Journey Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Current Step Highlight */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-2">
              <CurrentIcon className={`h-5 w-5 ${currentStepData.color}`} />
              <Badge variant="default" className="px-2 py-1">
                Current Step
              </Badge>
            </div>
            <h4 className="font-semibold text-foreground">{currentStepData.title}</h4>
            <p className="text-sm text-muted-foreground">{currentStepData.subtitle}</p>
          </CardContent>
        </Card>

        {/* Steps Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            
            return (
              <div
                key={step.id}
                className={`relative p-3 rounded-lg border transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-primary/10 border-primary/30' 
                    : isCurrent
                    ? 'bg-secondary border-primary/50 ring-1 ring-primary/20'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative">
                    <Icon className={`h-4 w-4 ${step.color}`} />
                    {isCompleted && (
                      <CheckCircle2 className="absolute -bottom-1 -right-1 h-3 w-3 text-primary bg-background rounded-full" />
                    )}
                    {isCurrent && !isCompleted && (
                      <Clock className="absolute -bottom-1 -right-1 h-3 w-3 text-orange-500 bg-background rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.id}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{debtsEntered}</div>
            <div className="text-xs text-muted-foreground">Debts Added</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{completedSteps.length}</div>
            <div className="text-xs text-muted-foreground">Steps Complete</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${calculationsDone ? 'text-green-500' : 'text-muted-foreground'}`}>
              {calculationsDone ? '✓' : '○'}
            </div>
            <div className="text-xs text-muted-foreground">Calculations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
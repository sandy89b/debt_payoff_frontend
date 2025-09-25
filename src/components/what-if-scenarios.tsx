import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calculator,
  BarChart3,
  Target,
  Zap,
  ChevronDown
} from 'lucide-react';
import { Debt } from './debt-calculator/DebtEntry';
import { AdvancedScenarioBuilder } from './advanced-scenario-builder';
import { GoalBasedPlanner } from './goal-based-planner';

interface WhatIfScenariosProps {
  debts: Debt[];
  baseExtraPayment: number;
  onScenarioSelect?: (extraPayment: number) => void;
}

export const WhatIfScenarios: React.FC<WhatIfScenariosProps> = ({
  debts,
  baseExtraPayment,
  onScenarioSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  if (debts.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Add valid debt information to see what-if scenarios</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-gradient-card shadow-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                What-If Scenarios
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
            <p className="text-muted-foreground text-left">
              Explore how different financial changes could impact your debt payoff journey
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <Tabs defaultValue="advanced" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="advanced">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Advanced Builder
                </TabsTrigger>
                <TabsTrigger value="goals">
                  <Target className="h-4 w-4 mr-2" />
                  Goal Planning
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="advanced" className="space-y-4">
                <AdvancedScenarioBuilder 
                  debts={debts}
                  baseExtraPayment={baseExtraPayment}
                  onScenarioSelect={(scenario) => {
                    onScenarioSelect?.(scenario.extraPayment);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="goals" className="space-y-4">
                <GoalBasedPlanner 
                  debts={debts}
                  baseExtraPayment={baseExtraPayment}
                  onGoalSelect={onScenarioSelect}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
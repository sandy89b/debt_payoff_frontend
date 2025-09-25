import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Save, 
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  Percent
} from 'lucide-react';
import { calculatePayoffStrategies } from './debt-calculator/PayoffCalculator';
import { Debt } from './debt-calculator/DebtEntry';

interface CustomScenario {
  id: string;
  name: string;
  description: string;
  extraPayment: number;
  modifiedDebts: Debt[];
  results?: {
    snowball: any;
    avalanche: any;
  };
}

interface AdvancedScenarioBuilderProps {
  debts: Debt[];
  baseExtraPayment: number;
  onScenarioSelect?: (scenario: CustomScenario) => void;
}

export const AdvancedScenarioBuilder: React.FC<AdvancedScenarioBuilderProps> = ({
  debts,
  baseExtraPayment,
  onScenarioSelect
}) => {
  const [scenarios, setScenarios] = useState<CustomScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<CustomScenario | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize with a default scenario
  useEffect(() => {
    if (debts.length > 0 && scenarios.length === 0) {
      createNewScenario('Current Plan', 'Your baseline debt payoff plan');
    }
  }, [debts]);

  const createNewScenario = (name: string = '', description: string = '') => {
    const newScenario: CustomScenario = {
      id: Date.now().toString(),
      name: name || `Scenario ${scenarios.length + 1}`,
      description: description || 'Custom debt payoff scenario',
      extraPayment: baseExtraPayment,
      modifiedDebts: [...debts]
    };

    const validDebts = newScenario.modifiedDebts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length > 0) {
      newScenario.results = calculatePayoffStrategies(validDebts, newScenario.extraPayment);
    }

    setScenarios([...scenarios, newScenario]);
    setActiveScenario(newScenario);
    setIsEditing(true);
  };

  const duplicateScenario = (scenario: CustomScenario) => {
    const duplicated: CustomScenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (Copy)`,
      modifiedDebts: [...scenario.modifiedDebts]
    };
    setScenarios([...scenarios, duplicated]);
    setActiveScenario(duplicated);
  };

  const deleteScenario = (scenarioId: string) => {
    if (scenarios.length <= 1) return; // Keep at least one scenario
    
    const newScenarios = scenarios.filter(s => s.id !== scenarioId);
    setScenarios(newScenarios);
    
    if (activeScenario?.id === scenarioId) {
      setActiveScenario(newScenarios[0] || null);
    }
  };

  const updateScenario = (updatedScenario: CustomScenario) => {
    const validDebts = updatedScenario.modifiedDebts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length > 0) {
      updatedScenario.results = calculatePayoffStrategies(validDebts, updatedScenario.extraPayment);
    }

    setScenarios(scenarios.map(s => s.id === updatedScenario.id ? updatedScenario : s));
    setActiveScenario(updatedScenario);
  };

  const updateDebt = (debtId: string, updates: Partial<Debt>) => {
    if (!activeScenario) return;

    const updatedDebts = activeScenario.modifiedDebts.map(debt =>
      debt.id === debtId ? { ...debt, ...updates } : debt
    );

    updateScenario({
      ...activeScenario,
      modifiedDebts: updatedDebts
    });
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

  if (debts.length === 0) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Add debt information to build custom scenarios</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Advanced Scenario Builder
        </CardTitle>
        <p className="text-muted-foreground">
          Create and compare custom debt payoff scenarios with full control over all variables
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Scenario Management */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => createNewScenario()}
              size="sm"
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
            
            {activeScenario && (
              <>
                <Button
                  onClick={() => duplicateScenario(activeScenario)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                
                {scenarios.length > 1 && (
                  <Button
                    onClick={() => deleteScenario(activeScenario.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Scenario Tabs */}
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder">Scenario Builder</TabsTrigger>
              <TabsTrigger value="comparison">Compare Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="space-y-6">
              {/* Scenario Selector */}
              <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario) => (
                  <Button
                    key={scenario.id}
                    onClick={() => setActiveScenario(scenario)}
                    variant={activeScenario?.id === scenario.id ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    {scenario.name}
                  </Button>
                ))}
              </div>

              {activeScenario && (
                <div className="space-y-6">
                  {/* Scenario Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scenario-name">Scenario Name</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="scenario-name"
                          value={activeScenario.name}
                          onChange={(e) => updateScenario({
                            ...activeScenario,
                            name: e.target.value
                          })}
                          placeholder="Enter scenario name"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
                      <Input
                        id="extra-payment"
                        type="number"
                        value={activeScenario.extraPayment}
                        onChange={(e) => updateScenario({
                          ...activeScenario,
                          extraPayment: parseFloat(e.target.value) || 0
                        })}
                        placeholder="500"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scenario-description">Description</Label>
                    <Input
                      id="scenario-description"
                      value={activeScenario.description}
                      onChange={(e) => updateScenario({
                        ...activeScenario,
                        description: e.target.value
                      })}
                      placeholder="Describe this scenario"
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  {/* Debt Modifications */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Modify Individual Debts
                    </h4>
                    
                    <div className="space-y-4">
                      {activeScenario.modifiedDebts.map((debt) => (
                        <div key={debt.id} className="p-4 border rounded-lg bg-card">
                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-xs">Debt Name</Label>
                              <Input
                                value={debt.name}
                                onChange={(e) => updateDebt(debt.id, { name: e.target.value })}
                                className="mt-1 text-sm"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Balance</Label>
                              <Input
                                type="number"
                                value={debt.balance}
                                onChange={(e) => updateDebt(debt.id, { balance: parseFloat(e.target.value) || 0 })}
                                className="mt-1 text-sm"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Min Payment</Label>
                              <Input
                                type="number"
                                value={debt.minPayment}
                                onChange={(e) => updateDebt(debt.id, { minPayment: parseFloat(e.target.value) || 0 })}
                                className="mt-1 text-sm"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Interest Rate (%)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={debt.interestRate}
                                onChange={(e) => updateDebt(debt.id, { interestRate: parseFloat(e.target.value) || 0 })}
                                className="mt-1 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scenario Results */}
                  {activeScenario.results && (
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Scenario Results
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Snowball Method</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time to Freedom:</span>
                              <span className="font-medium">{formatMonths(activeScenario.results.snowball.totalMonths)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Interest:</span>
                              <span className="font-medium">{formatCurrency(activeScenario.results.snowball.totalInterest)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Avalanche Method</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time to Freedom:</span>
                              <span className="font-medium">{formatMonths(activeScenario.results.avalanche.totalMonths)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Interest:</span>
                              <span className="font-medium">{formatCurrency(activeScenario.results.avalanche.totalInterest)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => onScenarioSelect?.(activeScenario)}
                          size="sm"
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Apply This Scenario
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="grid gap-4">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                      <Badge variant="outline">
                        ${scenario.extraPayment}/month
                      </Badge>
                    </div>
                    
                    {scenario.results && (
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Snowball Time</p>
                          <p className="font-medium">{formatMonths(scenario.results.snowball.totalMonths)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Snowball Interest</p>
                          <p className="font-medium">{formatCurrency(scenario.results.snowball.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avalanche Time</p>
                          <p className="font-medium">{formatMonths(scenario.results.avalanche.totalMonths)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avalanche Interest</p>
                          <p className="font-medium">{formatCurrency(scenario.results.avalanche.totalInterest)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
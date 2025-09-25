import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Crown,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  BookOpen,
  Heart,
  Users,
  Building,
  GraduationCap,
  Church,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Gift,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LegacyGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: "family" | "education" | "charity" | "business" | "property";
  timeline: string;
  priority: "high" | "medium" | "low";
}

interface WealthBuildingStep {
  id: string;
  step: number;
  title: string;
  description: string;
  completed: boolean;
  estimatedValue?: number;
}

export function LegacyPlanning() {
  const { toast } = useToast();
  
  const [legacyGoals, setLegacyGoals] = useLocalStorage<LegacyGoal[]>("legacy-goals", [
    {
      id: "1",
      name: "Children's College Fund",
      description: "Full college education for 2 children",
      targetAmount: 200000,
      currentAmount: 15000,
      category: "education",
      timeline: "15 years",
      priority: "high"
    },
    {
      id: "2",
      name: "Family Foundation",
      description: "Create charitable foundation for community impact",
      targetAmount: 500000,
      currentAmount: 0,
      category: "charity",
      timeline: "20 years",
      priority: "medium"
    }
  ]);

  const [wealthSteps] = useState<WealthBuildingStep[]>([
    {
      id: "1",
      step: 1,
      title: "Build Emergency Fund",
      description: "Secure 3-6 months of expenses before wealth building",
      completed: true,
      estimatedValue: 15000
    },
    {
      id: "2",
      step: 2,
      title: "Eliminate All Debt",
      description: "Pay off all consumer debt including mortgage",
      completed: false,
      estimatedValue: 250000
    },
    {
      id: "3",
      step: 3,
      title: "Max Out Retirement",
      description: "Contribute maximum to 401k, IRA, and Roth IRA",
      completed: false,
      estimatedValue: 75000
    },
    {
      id: "4",
      step: 4,
      title: "Real Estate Investment",
      description: "Purchase rental properties for passive income",
      completed: false,
      estimatedValue: 500000
    },
    {
      id: "5",
      step: 5,
      title: "Business Investment",
      description: "Start or invest in businesses for wealth multiplication",
      completed: false,
      estimatedValue: 1000000
    },
    {
      id: "6",
      step: 6,
      title: "Legacy Giving",
      description: "Create sustainable giving and inheritance plans",
      completed: false,
      estimatedValue: 2000000
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
    targetAmount: "",
    category: "family" as const,
    timeline: "",
    priority: "medium" as const
  });

  const [debtFreeProjection, setDebtFreeProjection] = useState({
    currentAge: 35,
    debtFreeAge: 45,
    monthlyInvestment: 2000,
    retirementAge: 65
  });

  const addLegacyGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast({
        title: "Missing Information",
        description: "Please provide goal name and target amount.",
        variant: "destructive"
      });
      return;
    }

    const goal: LegacyGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      description: newGoal.description,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      category: newGoal.category,
      timeline: newGoal.timeline,
      priority: newGoal.priority
    };

    setLegacyGoals(prev => [...prev, goal]);
    setNewGoal({ 
      name: "", 
      description: "", 
      targetAmount: "", 
      category: "family", 
      timeline: "", 
      priority: "medium" 
    });
    
    toast({
      title: "Legacy Goal Created!",
      description: `Your goal "${goal.name}" has been added to your legacy plan.`
    });
  };

  const calculateCompoundGrowth = (principal: number, monthlyContribution: number, years: number, rate: number = 0.10) => {
    const monthlyRate = rate / 12;
    const months = years * 12;
    
    // Future value of existing principal
    const principalValue = principal * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    const contributionValue = monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    
    return principalValue + contributionValue;
  };

  const yearsToDebtFree = debtFreeProjection.debtFreeAge - debtFreeProjection.currentAge;
  const yearsToRetirement = debtFreeProjection.retirementAge - debtFreeProjection.debtFreeAge;
  const projectedWealth = calculateCompoundGrowth(0, debtFreeProjection.monthlyInvestment, yearsToRetirement);

  const totalLegacyTargets = legacyGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalLegacyCurrent = legacyGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const legacyProgress = totalLegacyTargets > 0 ? (totalLegacyCurrent / totalLegacyTargets) * 100 : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "family": return <Users className="h-4 w-4" />;
      case "education": return <GraduationCap className="h-4 w-4" />;
      case "charity": return <Heart className="h-4 w-4" />;
      case "business": return <Building className="h-4 w-4" />;
      case "property": return <Crown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const completedSteps = wealthSteps.filter(step => step.completed).length;
  const wealthProgress = (completedSteps / wealthSteps.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Legacy Planning</h1>
        <p className="text-muted-foreground">
          Show how debt freedom enables legacy building and generational wealth
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Legacy Goals</p>
                <p className="text-2xl font-bold">{legacyGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Legacy</p>
                <p className="text-2xl font-bold">${(totalLegacyTargets / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Wealth</p>
                <p className="text-2xl font-bold">${(projectedWealth / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wealth Steps</p>
                <p className="text-2xl font-bold">{completedSteps}/{wealthSteps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wealth Building Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Wealth Building Journey
          </CardTitle>
          <CardDescription>
            Your path from debt freedom to generational wealth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{wealthProgress.toFixed(1)}%</span>
            </div>
            <Progress value={wealthProgress} className="h-3" />
          </div>

          <div className="grid gap-4">
            {wealthSteps.map((step, index) => (
              <div key={step.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                step.completed ? 'bg-green-50 border-green-200' : 'bg-muted/30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.completed ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? <CheckCircle2 className="h-4 w-4" /> : step.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {step.estimatedValue && (
                  <div className="text-right">
                    <div className="font-semibold">${(step.estimatedValue / 1000).toLocaleString()}K</div>
                    <div className="text-xs text-muted-foreground">Est. Impact</div>
                  </div>
                )}
                {index < wealthSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Biblical Truth:</strong> "A good person leaves an inheritance for their children's children." - Proverbs 13:22. 
              Building wealth is about stewardship and blessing future generations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Legacy Goals</TabsTrigger>
          <TabsTrigger value="projection">Wealth Projection</TabsTrigger>
          <TabsTrigger value="principles">Biblical Principles</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Add New Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Legacy Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Children's Education Fund"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="Describe your legacy goal..."
                    rows={3}
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount ($)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="0"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="family">Family & Children</option>
                    <option value="education">Education</option>
                    <option value="charity">Charitable Giving</option>
                    <option value="business">Business Investment</option>
                    <option value="property">Real Estate</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    placeholder="e.g., 10 years, 2030"
                    value={newGoal.timeline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, timeline: e.target.value }))}
                  />
                </div>

                <Button onClick={addLegacyGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>

            {/* Current Goals */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Legacy Goals ({legacyGoals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {legacyGoals.map((goal) => (
                      <div key={goal.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted">
                              {getCategoryIcon(goal.category)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{goal.name}</h3>
                              <p className="text-sm text-muted-foreground">{goal.description}</p>
                            </div>
                          </div>
                          <Badge className={`text-xs ${getPriorityColor(goal.priority)}`}>
                            {goal.priority} priority
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>${goal.currentAmount.toLocaleString()}</span>
                            <span>${goal.targetAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timeline: {goal.timeline}</span>
                          <span className="text-muted-foreground">Category: {goal.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projection" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Wealth Projection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-age">Current Age</Label>
                    <Input
                      id="current-age"
                      type="number"
                      value={debtFreeProjection.currentAge}
                      onChange={(e) => setDebtFreeProjection(prev => ({ 
                        ...prev, 
                        currentAge: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="debt-free-age">Debt Free Age</Label>
                    <Input
                      id="debt-free-age"
                      type="number"
                      value={debtFreeProjection.debtFreeAge}
                      onChange={(e) => setDebtFreeProjection(prev => ({ 
                        ...prev, 
                        debtFreeAge: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-investment">Monthly Investment ($)</Label>
                    <Input
                      id="monthly-investment"
                      type="number"
                      value={debtFreeProjection.monthlyInvestment}
                      onChange={(e) => setDebtFreeProjection(prev => ({ 
                        ...prev, 
                        monthlyInvestment: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retirement-age">Retirement Age</Label>
                    <Input
                      id="retirement-age"
                      type="number"
                      value={debtFreeProjection.retirementAge}
                      onChange={(e) => setDebtFreeProjection(prev => ({ 
                        ...prev, 
                        retirementAge: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Assumes 10% annual return. Once debt-free, your former debt payments become wealth-building investments.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Wealth Projection Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${(projectedWealth / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Projected wealth at retirement
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Years to debt freedom:</span>
                    <span className="font-semibold">{yearsToDebtFree} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wealth building years:</span>
                    <span className="font-semibold">{yearsToRetirement} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total contributions:</span>
                    <span className="font-semibold">
                      ${(debtFreeProjection.monthlyInvestment * 12 * yearsToRetirement).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Investment growth:</span>
                    <span className="font-semibold text-green-600">
                      ${(projectedWealth - (debtFreeProjection.monthlyInvestment * 12 * yearsToRetirement)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Alert>
                  <Crown className="h-4 w-4" />
                  <AlertDescription>
                    This projection shows the power of compound interest once you're debt-free. Every year counts!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="principles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Biblical Wealth Principles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Stewardship</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      "Moreover, it is required of stewards that they be found faithful." - 1 Corinthians 4:2
                    </p>
                    <p className="text-sm">Wealth is a tool for God's kingdom, not our own glory.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Generational Blessing</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      "A good person leaves an inheritance for their children's children." - Proverbs 13:22
                    </p>
                    <p className="text-sm">Building wealth blesses future generations and God's kingdom.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Generous Giving</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      "Give, and it will be given to you." - Luke 6:38
                    </p>
                    <p className="text-sm">Wealth enables greater generosity and kingdom impact.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Legacy Impact Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Family Legacy</h4>
                      <p className="text-sm text-muted-foreground">Children's education, family experiences, wisdom transfer</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                    <Church className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Kingdom Impact</h4>
                      <p className="text-sm text-muted-foreground">Church support, missions, charitable foundations</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                    <Building className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-semibold">Community Building</h4>
                      <p className="text-sm text-muted-foreground">Local investments, job creation, community development</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                    <GraduationCap className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="font-semibold">Education & Mentorship</h4>
                      <p className="text-sm text-muted-foreground">Scholarships, mentoring, financial education</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
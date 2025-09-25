import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Heart,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  ChevronDown,
  Church,
  Users,
  Hand,
  Gift,
  Clock,
  Target,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GivingRecord {
  id: string;
  date: Date;
  recipient: string;
  amount: number;
  category: "tithe" | "offering" | "charity" | "mission" | "emergency";
  description?: string;
}

interface GivingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline?: Date;
  recurring: boolean;
}

export function GivingStewardshipTracker() {
  const { toast } = useToast();
  
  const [givingRecords, setGivingRecords] = useLocalStorage<GivingRecord[]>("giving-records", [
    {
      id: "1",
      date: new Date("2024-03-01"),
      recipient: "Church Tithe",
      amount: 500,
      category: "tithe",
      description: "Monthly tithe"
    },
    {
      id: "2",
      date: new Date("2024-03-15"),
      recipient: "Food Bank",
      amount: 100,
      category: "charity",
      description: "Local food assistance"
    },
    {
      id: "3",
      date: new Date("2024-03-10"),
      recipient: "Missions Fund",
      amount: 200,
      category: "mission",
      description: "Supporting overseas mission work"
    }
  ]);

  const [givingGoals, setGivingGoals] = useLocalStorage<GivingGoal[]>("giving-goals", [
    {
      id: "1",
      name: "Monthly Tithe (10%)",
      targetAmount: 600,
      currentAmount: 500,
      category: "tithe",
      recurring: true
    },
    {
      id: "2",
      name: "Christmas Giving",
      targetAmount: 1000,
      currentAmount: 300,
      category: "charity",
      deadline: new Date("2024-12-25"),
      recurring: false
    }
  ]);

  const [monthlyIncome, setMonthlyIncome] = useState<number>(6000);
  const [givingPercentage, setGivingPercentage] = useState<number>(10);

  const [newRecord, setNewRecord] = useState({
    recipient: "",
    amount: "",
    category: "tithe" as const,
    description: ""
  });

  const [newGoal, setNewGoal] = useState<{
    name: string;
    targetAmount: string;
    category: "tithe" | "offering" | "charity" | "mission" | "emergency";
    deadline: string;
    recurring: boolean;
  }>({
    name: "",
    targetAmount: "",
    category: "tithe",
    deadline: "",
    recurring: false
  });

  // Calculations
  const currentMonthGiving = givingRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      const currentDate = new Date();
      return recordDate.getMonth() === currentDate.getMonth() && 
             recordDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, record) => sum + record.amount, 0);

  const yearlyGiving = givingRecords
    .filter(record => new Date(record.date).getFullYear() === new Date().getFullYear())
    .reduce((sum, record) => sum + record.amount, 0);

  const targetMonthlyGiving = (monthlyIncome * givingPercentage) / 100;
  const monthlyProgress = targetMonthlyGiving > 0 ? (currentMonthGiving / targetMonthlyGiving) * 100 : 0;

  const addGivingRecord = () => {
    if (!newRecord.recipient || !newRecord.amount) {
      toast({
        title: "Missing Information",
        description: "Please provide recipient and amount.",
        variant: "destructive"
      });
      return;
    }

    const record: GivingRecord = {
      id: Date.now().toString(),
      date: new Date(),
      recipient: newRecord.recipient,
      amount: parseFloat(newRecord.amount),
      category: newRecord.category,
      description: newRecord.description
    };

    setGivingRecords(prev => [record, ...prev]);
    setNewRecord({ recipient: "", amount: "", category: "tithe", description: "" });
    
    toast({
      title: "Gift Recorded! 🙏",
      description: `Your ${record.category} of $${record.amount} has been recorded.`
    });
  };

  const addGivingGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast({
        title: "Missing Information", 
        description: "Please provide goal name and target amount.",
        variant: "destructive"
      });
      return;
    }

    const goal: GivingGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      category: newGoal.category,
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
      recurring: newGoal.recurring
    };

    setGivingGoals(prev => [...prev, goal]);
    setNewGoal({ name: "", targetAmount: "", category: "tithe", deadline: "", recurring: false });
    
    toast({
      title: "Goal Created!",
      description: `Your giving goal "${goal.name}" has been created.`
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tithe": return <Church className="h-4 w-4" />;
      case "offering": return <Gift className="h-4 w-4" />;
      case "charity": return <Heart className="h-4 w-4" />;
      case "mission": return <Users className="h-4 w-4" />;
      case "emergency": return <Hand className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tithe": return "bg-blue-100 text-blue-700";
      case "offering": return "bg-purple-100 text-purple-700";
      case "charity": return "bg-green-100 text-green-700";
      case "mission": return "bg-orange-100 text-orange-700";
      case "emergency": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Giving & Stewardship Tracker</h1>
        <p className="text-muted-foreground">
          Plan for generosity throughout your debt freedom journey
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${currentMonthGiving.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Monthly Goal</p>
                <p className="text-2xl font-bold">${targetMonthlyGiving.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold">${yearlyGiving.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giving %</p>
                <p className="text-2xl font-bold">{givingPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Giving Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to monthly goal</span>
              <span>{monthlyProgress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(100, monthlyProgress)} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${currentMonthGiving.toLocaleString()}</span>
              <span>${targetMonthlyGiving.toLocaleString()}</span>
            </div>
          </div>

          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              <strong>Biblical Truth:</strong> "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Giving Records</TabsTrigger>
          <TabsTrigger value="goals">Goals & Planning</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Add New Record */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Record New Gift
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    placeholder="Church, Charity, Person"
                    value={newRecord.recipient}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, recipient: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={newRecord.amount}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newRecord.category}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="charity">Charity</option>
                    <option value="mission">Mission</option>
                    <option value="emergency">Emergency Help</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief note about this gift"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button onClick={addGivingRecord} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Gift
                </Button>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Gifts ({givingRecords.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {givingRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${getCategoryColor(record.category)}`}>
                            {getCategoryIcon(record.category)}
                          </div>
                          <div>
                            <div className="font-medium">{record.recipient}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.date.toLocaleDateString()}
                              {record.description && ` • ${record.description}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${record.amount.toLocaleString()}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {record.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Current Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {givingGoals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{goal.name}</h3>
                      <Badge variant={goal.recurring ? "default" : "secondary"}>
                        {goal.recurring ? "Recurring" : "One-time"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
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

                    {goal.deadline && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Due: {goal.deadline.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Add New Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Christmas Giving Fund"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
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
                  <Label htmlFor="goal-category">Category</Label>
                  <select
                    id="goal-category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as "tithe" | "offering" | "charity" | "mission" | "emergency" }))}
                  >
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="charity">Charity</option>
                    <option value="mission">Mission</option>
                    <option value="emergency">Emergency Help</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={newGoal.recurring}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, recurring: e.target.checked }))}
                    className="rounded border-input"
                  />
                  <Label htmlFor="recurring" className="text-sm">Recurring goal</Label>
                </div>

                <Button onClick={addGivingGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Income & Giving Settings
              </CardTitle>
              <CardDescription>
                Configure your income and giving targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthly-income">Monthly Income ($)</Label>
                  <Input
                    id="monthly-income"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="giving-percentage">Giving Percentage (%)</Label>
                  <Input
                    id="giving-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={givingPercentage}
                    onChange={(e) => setGivingPercentage(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between text-sm mb-2">
                  <span>Recommended monthly giving:</span>
                  <span className="font-semibold">${targetMonthlyGiving.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Annual giving target:</span>
                  <span className="font-semibold">${(targetMonthlyGiving * 12).toLocaleString()}</span>
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Stewardship Principle:</strong> Even during debt repayment, maintaining generous giving demonstrates trust in God's provision and prevents debt from becoming an idol.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
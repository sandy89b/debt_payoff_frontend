import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PressButton as Button } from "@/components/ui/PressButton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Target, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Heart,
  CheckCircle2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const frameworkSteps = [
  {
    id: 1,
    title: "Emergency Fund",
    description: "Build your financial foundation",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    worksheet: {
      title: "Emergency Fund Worksheet",
      fields: [
        { id: "monthlyExpenses", label: "Monthly Essential Expenses", type: "number", placeholder: "3000" },
        { id: "targetMonths", label: "Target Months of Coverage", type: "number", placeholder: "3-6" },
        { id: "currentSavings", label: "Current Emergency Savings", type: "number", placeholder: "1000" },
        { id: "monthlyContribution", label: "Monthly Contribution Goal", type: "number", placeholder: "500" }
      ],
      notes: "Calculate your target emergency fund and create a savings plan."
    }
  },
  {
    id: 2,
    title: "List All Debts",
    description: "Know what you owe",
    icon: CreditCard,
    color: "text-red-600",
    bgColor: "bg-red-50",
    worksheet: {
      title: "Debt Inventory Worksheet",
      fields: [
        { id: "creditorName", label: "Creditor Name", type: "text", placeholder: "Credit Card Company" },
        { id: "totalBalance", label: "Total Balance", type: "number", placeholder: "5000" },
        { id: "minimumPayment", label: "Minimum Payment", type: "number", placeholder: "150" },
        { id: "interestRate", label: "Interest Rate (%)", type: "number", placeholder: "18.99" }
      ],
      notes: "List every debt with complete details. Knowledge is power!"
    }
  },
  {
    id: 3,
    title: "Budget Creation",
    description: "Track every dollar",
    icon: Calculator,
    color: "text-green-600",
    bgColor: "bg-green-50",
    worksheet: {
      title: "Monthly Budget Worksheet",
      fields: [
        { id: "monthlyIncome", label: "Total Monthly Income", type: "number", placeholder: "5000" },
        { id: "fixedExpenses", label: "Fixed Expenses", type: "number", placeholder: "2500" },
        { id: "variableExpenses", label: "Variable Expenses", type: "number", placeholder: "1000" },
        { id: "debtPayments", label: "Debt Payments", type: "number", placeholder: "800" }
      ],
      notes: "Every dollar should have a purpose. Track income and all expenses."
    }
  },
  {
    id: 4,
    title: "Choose Strategy",
    description: "Debt Snowball or Avalanche",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    worksheet: {
      title: "Strategy Selection Worksheet",
      fields: [
        { id: "preferredMethod", label: "Preferred Method", type: "select", options: ["Debt Snowball", "Debt Avalanche", "Hybrid"] },
        { id: "motivation", label: "What motivates you most?", type: "textarea", placeholder: "Quick wins or saving money?" },
        { id: "extraPayment", label: "Extra Payment Available", type: "number", placeholder: "300" },
        { id: "timeline", label: "Target Payoff Timeline", type: "text", placeholder: "24 months" }
      ],
      notes: "Choose the strategy that fits your personality and financial situation."
    }
  },
  {
    id: 5,
    title: "Increase Income",
    description: "Boost your earning power",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    worksheet: {
      title: "Income Enhancement Worksheet",
      fields: [
        { id: "currentSkills", label: "Current Skills/Talents", type: "textarea", placeholder: "What can you monetize?" },
        { id: "sideHustleIdeas", label: "Side Hustle Ideas", type: "textarea", placeholder: "Freelancing, selling items, etc." },
        { id: "incomeGoal", label: "Additional Monthly Income Goal", type: "number", placeholder: "500" },
        { id: "timeCommitment", label: "Time Available (hours/week)", type: "number", placeholder: "10" }
      ],
      notes: "Every extra dollar can accelerate your debt freedom journey."
    }
  },
  {
    id: 6,
    title: "Stay Motivated",
    description: "Maintain momentum",
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    worksheet: {
      title: "Motivation & Accountability Worksheet",
      fields: [
        { id: "whyStatement", label: "Your 'Why' Statement", type: "textarea", placeholder: "Why is being debt-free important to you?" },
        { id: "rewards", label: "Milestone Rewards", type: "textarea", placeholder: "How will you celebrate progress?" },
        { id: "accountabilityPartner", label: "Accountability Partner", type: "text", placeholder: "Who will support you?" },
        { id: "trackingMethod", label: "Progress Tracking Method", type: "text", placeholder: "How will you track progress?" }
      ],
      notes: "Your mindset and motivation are crucial for long-term success."
    }
  }
];

export function InteractiveFramework() {
  const [openSteps, setOpenSteps] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [worksheetData, setWorksheetData] = useState<Record<string, any>>({});

  const toggleStep = (stepId: number) => {
    setOpenSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const markComplete = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const updateWorksheetData = (stepId: number, fieldId: string, value: string) => {
    setWorksheetData(prev => ({
      ...prev,
      [`${stepId}-${fieldId}`]: value
    }));
  };

  const completionPercentage = (completedSteps.length / frameworkSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Clear Hierarchy */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Biblical Debt Freedom Framework
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Follow these 6 biblical principles to achieve lasting financial freedom
          </p>
          
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedSteps.length}/{frameworkSteps.length} steps completed
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </div>

        {/* Framework Steps */}
        <div className="space-y-6">
          {frameworkSteps.map((step) => {
            const IconComponent = step.icon;
            const isOpen = openSteps.includes(step.id);
            const isCompleted = completedSteps.includes(step.id);

            return (
              <Card key={step.id} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <Collapsible>
                  <CollapsibleTrigger 
                    className="w-full"
                    onClick={() => toggleStep(step.id)}
                  >
                    <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${step.bgColor}`}>
                            <IconComponent className={`h-6 w-6 ${step.color}`} />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                Step {step.id}: {step.title}
                              </CardTitle>
                              {isCompleted && (
                                <Badge variant="default" className="bg-green-100 text-green-800 px-3 py-1">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Complete
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                              {step.description}
                            </CardDescription>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-6 w-6 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">
                          {step.worksheet.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          {step.worksheet.notes}
                        </p>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          {step.worksheet.fields.map((field) => (
                            <div key={field.id} className="space-y-3">
                              <Label htmlFor={`${step.id}-${field.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                              </Label>
                              {field.type === 'textarea' ? (
                                <Textarea
                                  id={`${step.id}-${field.id}`}
                                  placeholder={field.placeholder}
                                  value={worksheetData[`${step.id}-${field.id}`] || ''}
                                  onChange={(e) => updateWorksheetData(step.id, field.id, e.target.value)}
                                  rows={3}
                                  className="min-h-[80px]"
                                />
                              ) : field.type === 'select' ? (
                                <select
                                  id={`${step.id}-${field.id}`}
                                  className="w-full h-12 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  value={worksheetData[`${step.id}-${field.id}`] || ''}
                                  onChange={(e) => updateWorksheetData(step.id, field.id, e.target.value)}
                                >
                                  <option value="">Select an option</option>
                                  {field.options?.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  id={`${step.id}-${field.id}`}
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={worksheetData[`${step.id}-${field.id}`] || ''}
                                  onChange={(e) => updateWorksheetData(step.id, field.id, e.target.value)}
                                  className="h-12"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end mt-8">
                          <Button
                            onClick={() => markComplete(step.id)}
                            variant={isCompleted ? "outline" : "default"}
                            className="min-w-40 h-12 text-base font-medium"
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Completed
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
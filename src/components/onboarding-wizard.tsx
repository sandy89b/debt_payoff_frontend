import React, { useState } from 'react';
import { Wizard, WizardStep, WizardNavigation } from '@/components/ui/wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Target, 
  Play, 
  TrendingUp, 
  DollarSign, 
  Trophy,
  X,
  CheckCircle2
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "INVENTORY - What's In Your House?",
    description: "Tell me, what do you have in your house? (2 Kings 4:2)",
    icon: Search,
    color: "bg-blue-500",
    content: {
      reflection: "What am I overlooking that God can use?",
      tasks: [
        "Identify your current income sources",
        "List your assets and resources", 
        "Recognize your skills and talents",
        "Note any forgotten or unused resources"
      ]
    }
  },
  {
    id: 2,
    title: "INSTRUCTION - Borrow With Purpose", 
    description: "Go around and ask all your neighbors for empty jars—don't ask for just a few. (v. 3)",
    icon: Target,
    color: "bg-green-500",
    content: {
      reflection: "Debt isn't evil. Disobedient debt is.",
      tasks: [
        "Define what the debt will fund",
        "Ensure it's for production, not consumption",
        "Calculate expected return on investment",
        "Set clear repayment strategy"
      ]
    }
  },
  {
    id: 3,
    title: "IMPLEMENTATION - Shut the Door and Pour",
    description: "Then go inside and shut the door... Pour oil into all the jars. (v. 4)",
    icon: Play,
    color: "bg-purple-500", 
    content: {
      reflection: "This is your pour season. Don't look around—look within.",
      tasks: [
        "Remove distractions and focus",
        "Use your skills and resources consistently",
        "Execute your plan without looking back",
        "Stay committed to the process"
      ]
    }
  },
  {
    id: 4,
    title: "INCREASE - Let It Flow Until It Stops",
    description: "When all the jars were full, she said... 'Bring me another one.' But there was not a jar left. Then the oil stopped flowing. (v. 6)",
    icon: TrendingUp,
    color: "bg-orange-500",
    content: {
      reflection: "Provision flows in proportion to your preparation.",
      tasks: [
        "Track your output and results",
        "Scale what's working effectively", 
        "Measure your progress consistently",
        "Multiply successful strategies"
      ]
    }
  },
  {
    id: 5,
    title: "INCOME - Sell the Oil",
    description: "Go, sell the oil... (v. 7)",
    icon: DollarSign,
    color: "bg-yellow-500",
    content: {
      reflection: "Selling is stewardship.",
      tasks: [
        "Monetize your efforts and products",
        "Create value for others",
        "Convert output into revenue",
        "Build sustainable income streams"
      ]
    }
  },
  {
    id: 6,
    title: "IMPACT - Pay Off & Live on the Rest",
    description: "...and pay your debts. You and your sons can live on what is left. (v. 7)",
    icon: Trophy,
    color: "bg-red-500",
    content: {
      reflection: "Overflow isn't just for you—it's for those after you.",
      tasks: [
        "Pay off all debts systematically",
        "Establish emergency savings",
        "Create overflow for giving and investing",
        "Build generational wealth"
      ]
    }
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean[]>>({});

  if (!isOpen) return null;

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  const toggleTask = (stepId: number, taskIndex: number) => {
    setCompletedTasks(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [taskIndex]: !prev[stepId]?.[taskIndex]
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = true; // Always allow progression for onboarding

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                The Widow's Wealth Cycle™
              </h2>
              <p className="text-muted-foreground">
                A guided tour through your journey to financial freedom
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Wizard
            currentStep={currentStep}
            totalSteps={steps.length}
            onStepChange={setCurrentStep}
          >
            <WizardStep
              title={currentStepData.title}
              description={currentStepData.description}
            >
              <div className="space-y-6">
                {/* Step Icon and Color */}
                <div className="flex items-center gap-4">
                  <div className={`${currentStepData.color} p-3 rounded-lg`}>
                    <StepIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    Step {currentStep} of {steps.length}
                  </Badge>
                </div>

                {/* Reflection Question */}
                <Card className="bg-muted/50 border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <p className="font-medium text-foreground mb-2">
                      💭 Reflection:
                    </p>
                    <p className="text-muted-foreground italic">
                      "{currentStepData.content.reflection}"
                    </p>
                  </CardContent>
                </Card>

                {/* Action Items */}
                <div>
                  <h4 className="font-semibold mb-4 text-foreground">
                    Key Actions for This Step:
                  </h4>
                  <div className="space-y-3">
                    {currentStepData.content.tasks.map((task, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-card border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleTask(currentStep, index)}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          completedTasks[currentStep]?.[index] 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {completedTasks[currentStep]?.[index] && (
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className={`flex-1 transition-colors ${
                          completedTasks[currentStep]?.[index] 
                            ? 'text-muted-foreground line-through' 
                            : 'text-foreground'
                        }`}>
                          {task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Resources */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Pro Tip:</strong> This step is about {
                        currentStep === 1 ? "taking inventory of your resources" :
                        currentStep === 2 ? "strategic thinking before action" :
                        currentStep === 3 ? "focused execution without distractions" :
                        currentStep === 4 ? "scaling what works" :
                        currentStep === 5 ? "monetizing your efforts" :
                        "creating lasting impact and generational wealth"
                      }. Take your time to think through each action item.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </WizardStep>

            <WizardNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              canProceed={canProceed}
              isLastStep={currentStep === steps.length}
            />
          </Wizard>
        </div>
      </div>
    </div>
  );
};
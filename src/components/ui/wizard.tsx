import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface WizardProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps: number
  onStepChange: (step: number) => void
  children: React.ReactNode
}

interface WizardStepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  children: React.ReactNode
}

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSkip?: () => void
  canProceed?: boolean
  isLastStep?: boolean
}

const Wizard = React.forwardRef<HTMLDivElement, WizardProps>(
  ({ className, currentStep, totalSteps, onStepChange, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Step {currentStep} of {totalSteps}
            </h3>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button
                key={i}
                onClick={() => onStepChange(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  i + 1 < currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : i + 1 === currentStep
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {i + 1 < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </button>
            ))}
          </div>
        </div>
        
        {children}
      </div>
    )
  }
)
Wizard.displayName = "Wizard"

const WizardStep = React.forwardRef<HTMLDivElement, WizardStepProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("", className)} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    )
  }
)
WizardStep.displayName = "WizardStep"

const WizardNavigation = React.forwardRef<HTMLDivElement, WizardNavigationProps>(
  ({ currentStep, totalSteps, onPrevious, onNext, onSkip, canProceed = true, isLastStep = false, ...props }, ref) => {
    return (
      <div ref={ref} className="flex items-center justify-between mt-8" {...props}>
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {onSkip && !isLastStep && (
            <Button variant="ghost" onClick={onSkip}>
              Skip for now
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {isLastStep ? "Complete" : "Next"}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    )
  }
)
WizardNavigation.displayName = "WizardNavigation"

export { Wizard, WizardStep, WizardNavigation }
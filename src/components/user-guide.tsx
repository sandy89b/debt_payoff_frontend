import React, { useState } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Calendar, 
  Target, 
  Bell, 
  Download, 
  Heart, 
  Trophy, 
  Users, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Crown, 
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle,
  ArrowRight,
  Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const UserGuide = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const mainFeatures = [
    {
      icon: Home,
      title: "Dashboard",
      description: "Your main starting point with debt calculator and biblical framework",
      steps: [
        "Enter your debts using the debt entry forms",
        "Set your extra monthly payment amount",
        "Review the 6-Step Widow's Wealth Cycle framework",
        "Calculate your payoff strategies automatically"
      ]
    },
    {
      icon: Calculator,
      title: "Debt Calculator",
      description: "Core tool for calculating debt payoff strategies",
      steps: [
        "Add each debt with balance, minimum payment, and interest rate",
        "Enter any extra monthly payment you can make",
        "View Snowball vs Avalanche comparison results",
        "Export your results to PDF for reference"
      ]
    }
  ];

  const calendarFeatures = [
    {
      icon: Calendar,
      title: "Payment Calendar",
      description: "Visual timeline of your debt payments",
      steps: [
        "View your payment schedule month by month",
        "See when each debt will be paid off",
        "Track progress with visual indicators",
        "Plan around important dates"
      ]
    },
    {
      icon: Target,
      title: "Goal Planning",
      description: "Set and track your financial milestones",
      steps: [
        "Define specific debt payoff goals",
        "Set target dates for debt freedom",
        "Monitor progress toward each goal",
        "Celebrate milestones along the way"
      ]
    },
    {
      icon: Bell,
      title: "Reminders",
      description: "Stay on track with payment notifications",
      steps: [
        "Set up payment due date reminders",
        "Get motivational check-ins",
        "Receive milestone celebration alerts",
        "Customize reminder frequency"
      ]
    },
    {
      icon: Download,
      title: "Export Tools",
      description: "Save and share your financial plan",
      steps: [
        "Generate PDF reports of your debt plan",
        "Export data for backup purposes",
        "Share progress with accountability partners",
        "Import previous data when needed"
      ]
    }
  ];

  const educationFeatures = [
    {
      icon: BookOpen,
      title: "Framework Steps",
      description: "Learn the 6-step biblical debt elimination process",
      steps: [
        "Study each step of the Widow's Wealth Cycle",
        "Apply biblical principles to your finances",
        "Follow the guided implementation process",
        "Track your progress through each phase"
      ]
    },
    {
      icon: Heart,
      title: "Daily Devotionals",
      description: "Spiritual encouragement for your financial journey",
      steps: [
        "Read daily biblical reflections on money",
        "Apply practical lessons to your situation",
        "Mark devotionals as read to track progress",
        "Favorite meaningful devotionals for later"
      ]
    }
  ];

  const motivationFeatures = [
    {
      icon: Trophy,
      title: "Achievements",
      description: "Celebrate your financial victories",
      steps: [
        "Unlock badges for reaching milestones",
        "Track your debt payoff progress",
        "Share achievements with others",
        "Stay motivated with visual progress"
      ]
    },
    {
      icon: Users,
      title: "Accountability",
      description: "Connect with others on the same journey",
      steps: [
        "Find accountability partners",
        "Share progress updates",
        "Encourage others in their journey",
        "Join community challenges"
      ]
    },
    {
      icon: Heart,
      title: "Prayer Corner",
      description: "Spiritual support for financial breakthrough",
      steps: [
        "Submit prayer requests for financial needs",
        "Pray for others' financial breakthrough",
        "Access biblical prayers for prosperity",
        "Join prayer groups for mutual support"
      ]
    },
    {
      icon: GraduationCap,
      title: "Coaching",
      description: "Professional guidance for your financial goals",
      steps: [
        "Schedule sessions with certified coaches",
        "Get personalized debt elimination strategies",
        "Access exclusive educational content",
        "Track coaching progress and assignments"
      ]
    }
  ];

  const advancedFeatures = [
    {
      icon: TrendingUp,
      title: "Income Optimization",
      description: "Maximize your earning potential",
      steps: [
        "Assess your current income streams",
        "Identify opportunities for increase",
        "Create action plans for income growth",
        "Track income optimization progress"
      ]
    },
    {
      icon: Shield,
      title: "Emergency Fund Calculator",
      description: "Build your financial safety net",
      steps: [
        "Calculate your ideal emergency fund size",
        "Create a savings plan to reach your goal",
        "Track emergency fund growth",
        "Maintain fund while paying off debt"
      ]
    },
    {
      icon: DollarSign,
      title: "Giving & Stewardship Tracker",
      description: "Track your biblical giving and stewardship",
      steps: [
        "Set giving goals and commitments",
        "Track tithes and offerings",
        "Monitor stewardship activities",
        "Plan charitable giving strategies"
      ]
    },
    {
      icon: Crown,
      title: "Legacy Planning",
      description: "Plan for generational wealth transfer",
      steps: [
        "Create wealth-building strategies",
        "Plan for estate and inheritance",
        "Set long-term family financial goals",
        "Develop generational impact plans"
      ]
    }
  ];

  const quickStartGuide = [
    {
      step: 1,
      title: "Start with the Dashboard",
      description: "Begin by exploring the main dashboard and taking the guided tour",
      action: "Click 'Take the Guided Tour' on the homepage"
    },
    {
      step: 2,
      title: "Add Your Debts",
      description: "Enter all your current debts with accurate information",
      action: "Fill in debt name, balance, minimum payment, and interest rate"
    },
    {
      step: 3,
      title: "Set Extra Payment",
      description: "Determine how much extra you can pay toward debt monthly",
      action: "Enter your extra monthly payment amount"
    },
    {
      step: 4,
      title: "Review Strategies",
      description: "Compare Snowball vs Avalanche payoff methods",
      action: "Review the automatic calculations and choose your strategy"
    },
    {
      step: 5,
      title: "Export Your Plan",
      description: "Save your debt elimination plan for reference",
      action: "Use the PDF export feature to save your plan"
    },
    {
      step: 6,
      title: "Explore Other Tools",
      description: "Use calendar, reminders, and educational content for ongoing support",
      action: "Navigate through the sidebar to access all features"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-purple/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            User Guide & Navigation
          </h1>
          <p className="text-lg text-brand-gray max-w-3xl mx-auto">
            Learn how to navigate and maximize every feature of The Pour & Payoff Planner™
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {quickStartGuide.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-background/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-brand-gray mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <ArrowRight className="h-3 w-3" />
                      {item.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Main Features</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {mainFeatures.map((feature, index) => (
                <AccordionItem key={index} value={`main-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{feature.title}</div>
                        <div className="text-sm text-brand-gray">{feature.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-2">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-brand-gray">{step}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Calendar Features */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Calendar & Planning Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {calendarFeatures.map((feature, index) => (
                <AccordionItem key={index} value={`calendar-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{feature.title}</div>
                        <div className="text-sm text-brand-gray">{feature.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-2">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-brand-gray">{step}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Education Features */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Education & Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {educationFeatures.map((feature, index) => (
                <AccordionItem key={index} value={`education-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{feature.title}</div>
                        <div className="text-sm text-brand-gray">{feature.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-2">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-brand-gray">{step}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Motivation Features */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Motivation & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {motivationFeatures.map((feature, index) => (
                <AccordionItem key={index} value={`motivation-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{feature.title}</div>
                        <div className="text-sm text-brand-gray">{feature.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-2">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-brand-gray">{step}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Advanced Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {advancedFeatures.map((feature, index) => (
                <AccordionItem key={index} value={`advanced-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">{feature.title}</div>
                        <div className="text-sm text-brand-gray">{feature.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-2">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm text-brand-gray">{step}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Navigation Tips */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Navigation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-brand-charcoal">Sidebar Navigation</h3>
                <ul className="space-y-2 text-sm text-brand-gray">
                  <li>• Use the sidebar to access all major features</li>
                  <li>• Collapse the sidebar for more screen space</li>
                  <li>• Features are organized by category for easy browsing</li>
                  <li>• Active page is highlighted in the navigation</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-brand-charcoal">Data Management</h3>
                <ul className="space-y-2 text-sm text-brand-gray">
                  <li>• Your data is automatically saved as you work</li>
                  <li>• Export backups regularly for safety</li>
                  <li>• Import previous data when switching devices</li>
                  <li>• Clear all data to start fresh if needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Help */}
        <Card className="bg-gradient-hero shadow-glow text-center">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need Additional Help?
              </h3>
              <p className="text-white/90 mb-6">
                If you need personalized guidance or have questions about using the tool, 
                our team is here to help you succeed on your financial journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-brand-purple hover:bg-white/90 font-semibold"
                  onClick={() => window.open('https://legacymindsetsolutions.com/contact', '_blank')}
                >
                  Contact Support
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 font-semibold"
                  onClick={() => window.open('https://legacymindsetsolutions.com', '_blank')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
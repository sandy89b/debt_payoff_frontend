import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { EmailAutomationProvider } from "@/contexts/EmailAutomationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UserGuidePage from "./pages/UserGuide";
import DashboardOverview from "./pages/Dashboard";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OAuthSuccess from "./pages/auth/OAuthSuccess";
import OAuthError from "./pages/auth/OAuthError";
import SetPassword from "./pages/auth/SetPassword";
import EmailAutomationDashboard from "./pages/admin/EmailAutomationDashboard";
import { PaymentCalendar } from "@/components/calendar/payment-calendar";
import { GoalPlanning } from "@/components/calendar/goal-planning";
import { Reminders } from "@/components/calendar/reminders";
import { Export } from "@/components/calendar/export";
import { InteractiveFramework } from "@/components/interactive-framework";
import { DailyDevotionals } from "@/components/daily-devotionals";
import { Achievements } from "@/components/achievements";
import { Accountability } from "@/components/accountability";
import { PrayerIntegration } from "@/components/prayer-integration";
import { IncomeOptimization } from "@/components/income-optimization";
import { EmergencyFundCalculator } from "@/components/emergency-fund-calculator";
import { GivingStewardshipTracker } from "@/components/giving-stewardship-tracker";
import { LegacyPlanning } from "@/components/legacy-planning";
import { CoachingIntegration } from "@/components/coaching-integration";
import { AdminDebtManagement } from "@/components/admin/AdminDebtManagement";
import { LeadManagement } from "@/pages/admin/LeadManagement";
import { LeadEmailAnalytics } from "@/pages/admin/LeadEmailAnalytics";
import EmailAutomation from "./pages/calendar/EmailAutomation";
import EmailAutomationTest from "./pages/calendar/EmailAutomationTest";
import EmailAutomationSimple from "./pages/calendar/EmailAutomationSimple";
import { useDebtsStorage } from "@/hooks/useDebtsStorage";
import { GuestDebtCalculator } from "@/components/debt-calculator/GuestDebtCalculator";
import UserSettingsLayout from "@/pages/account/UserSettingsLayout";
import AccountSettings from "@/pages/account/AccountSettings";
import SecuritySettings from "@/pages/account/SecuritySettings";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => {
  const { debts } = useDebtsStorage();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <EmailAutomationProvider>
                <ConditionalLayout>
                  <Routes>
                    {/* Public Routes - No Authentication Required */}
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/auth/signin" element={<Signin />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    {/* Removed reset-password route: handled within ForgotPassword/SetPassword */}
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/auth/success" element={<OAuthSuccess />} />
                    <Route path="/auth/error" element={<OAuthError />} />
                    
                    {/* Public Routes - Previously protected */}
                    <Route path="/calculator" element={<Index />} />
                    <Route path="/dashboard" element={<DashboardOverview />} />
                    <Route path="/account" element={<UserSettingsLayout />}>
                      <Route path="settings" element={<AccountSettings />} />
                      <Route path="security" element={<SecuritySettings />} />
                    </Route>
                    <Route path="/user-guide" element={<UserGuidePage />} />
                    <Route path="/calendar" element={<PaymentCalendar debts={debts} />} />
                    <Route path="/calendar/goals" element={<GoalPlanning debts={debts} />} />
                    <Route path="/calendar/reminders" element={<Reminders debts={debts} />} />
                    <Route path="/calendar/export" element={<Export debts={debts} />} />
                    <Route path="/framework" element={<InteractiveFramework />} />
                    <Route path="/devotionals" element={<DailyDevotionals />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/accountability" element={<Accountability />} />
                    <Route path="/prayers" element={<PrayerIntegration />} />
                    <Route path="/income-optimization" element={<IncomeOptimization />} />
                    <Route path="/emergency-fund-calculator" element={<EmergencyFundCalculator />} />
                    <Route path="/giving-stewardship-tracker" element={<GivingStewardshipTracker />} />
                    <Route path="/legacy-planning" element={<LegacyPlanning />} />
                    <Route path="/coaching" element={<CoachingIntegration />} />
                    
                    {/* Admin Routes - Now public for viewing */}
                    <Route path="/admin/email-automation" element={<EmailAutomationSimple />} />
                    <Route path="/admin/debt-manage" element={<AdminDebtManagement />} />
                    <Route path="/admin/lead-manage" element={<LeadManagement />} />
                    <Route path="/admin/lead-analytics" element={<LeadEmailAnalytics />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ConditionalLayout>
              </EmailAutomationProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
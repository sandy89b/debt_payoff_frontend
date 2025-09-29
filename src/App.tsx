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
import ResetPassword from "./pages/auth/ResetPassword";
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
import EmailAutomationSimple from "./pages/calendar/EmailAutomationSimple";
import { useDebtsStorage } from "@/hooks/useDebtsStorage";
import { GuestDebtCalculator } from "@/components/debt-calculator/GuestDebtCalculator";
import UserSettingsLayout from "@/pages/account/UserSettingsLayout";
import AccountSettings from "@/pages/account/AccountSettings";
import SecuritySettings from "@/pages/account/SecuritySettings";
import { UpgradePage } from "@/pages/Upgrade";
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
                    {/* Redirect root to calculator (public) */}
                    <Route path="/" element={<Navigate to="/calculator" replace />} />
                    <Route path="/calculator" element={<Index />} />
                    <Route path="/auth/signin" element={<Signin />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/auth/success" element={<OAuthSuccess />} />
                    <Route path="/auth/error" element={<OAuthError />} />
                    
                    {/* Protected Routes - Require Authentication */}
                    
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
                    <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><UserSettingsLayout /></ProtectedRoute>}>
                      <Route path="settings" element={<AccountSettings />} />
                      <Route path="security" element={<SecuritySettings />} />
                    </Route>
                    <Route path="/user-guide" element={<ProtectedRoute><UserGuidePage /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><PaymentCalendar debts={debts} /></ProtectedRoute>} />
                    <Route path="/calendar/goals" element={<ProtectedRoute><GoalPlanning debts={debts} /></ProtectedRoute>} />
                    <Route path="/calendar/reminders" element={<ProtectedRoute><Reminders debts={debts} /></ProtectedRoute>} />
                    <Route path="/calendar/export" element={<ProtectedRoute><Export debts={debts} /></ProtectedRoute>} />
                    <Route path="/framework" element={<ProtectedRoute><InteractiveFramework /></ProtectedRoute>} />
                    <Route path="/devotionals" element={<ProtectedRoute><DailyDevotionals /></ProtectedRoute>} />
                    <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                    <Route path="/accountability" element={<ProtectedRoute><Accountability /></ProtectedRoute>} />
                    <Route path="/prayers" element={<ProtectedRoute><PrayerIntegration /></ProtectedRoute>} />
                    <Route path="/income-optimization" element={<ProtectedRoute><IncomeOptimization /></ProtectedRoute>} />
                    <Route path="/emergency-fund-calculator" element={<ProtectedRoute><EmergencyFundCalculator /></ProtectedRoute>} />
                    <Route path="/giving-stewardship-tracker" element={<ProtectedRoute><GivingStewardshipTracker /></ProtectedRoute>} />
                    <Route path="/legacy-planning" element={<ProtectedRoute><LegacyPlanning /></ProtectedRoute>} />
                    <Route path="/coaching" element={<ProtectedRoute><CoachingIntegration /></ProtectedRoute>} />
                    
                    {/* Admin Routes - Require Admin Role */}
                    <Route path="/admin/email-automation" element={<AdminRoute><EmailAutomationSimple /></AdminRoute>} />
                    <Route path="/admin/debt-manage" element={<AdminRoute><AdminDebtManagement /></AdminRoute>} />
                    <Route path="/admin/lead-manage" element={<AdminRoute><LeadManagement /></AdminRoute>} />
                    <Route path="/admin/lead-analytics" element={<AdminRoute><LeadEmailAnalytics /></AdminRoute>} />
                    
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
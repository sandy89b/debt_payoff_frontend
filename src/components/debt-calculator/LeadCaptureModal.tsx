import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, Mail, Phone, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debtData: {
    debts: any[];
    extraPayment: number;
    calculationResults: any;
  };
}

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalDebt: number;
  totalMinPayments: number;
  extraPayment: number;
  debtCount: number;
  calculationResults: any;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  debtData
}) => {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Password confirmation is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Safely serialize calculation results to avoid JSON errors
      let calculationResults = null;
      if (debtData.calculationResults) {
        try {
          calculationResults = {
            snowball: {
              totalMonths: Number(debtData.calculationResults.snowball?.totalMonths) || 0,
              totalInterest: Number(debtData.calculationResults.snowball?.totalInterest) || 0,
              totalPayments: Number(debtData.calculationResults.snowball?.totalPayments) || 0
            },
            avalanche: {
              totalMonths: Number(debtData.calculationResults.avalanche?.totalMonths) || 0,
              totalInterest: Number(debtData.calculationResults.avalanche?.totalInterest) || 0,
              totalPayments: Number(debtData.calculationResults.avalanche?.totalPayments) || 0
            }
          };
        } catch (error) {
          console.warn('Error serializing calculation results:', error);
          calculationResults = null;
        }
      }

      // Create lead data
      const leadData: LeadData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        totalDebt: debtData.debts.reduce((sum, debt) => sum + (debt.balance || 0), 0),
        totalMinPayments: debtData.debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0),
        extraPayment: debtData.extraPayment,
        debtCount: debtData.debts.length,
        calculationResults
      };

      // Send lead data to backend
      const leadResponse = await fetch(`${import.meta.env.VITE_API_URL }/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(leadData),
      });

      const leadResult = await leadResponse.json();

      // If lead already exists, don't hard-fail – continue with a friendly message
      let createdLeadId: number | null = null;
      if (leadResponse.ok && leadResult?.data?.id) {
        createdLeadId = leadResult.data.id;
      } else if (leadResponse.status === 409) {
        createdLeadId = leadResult?.data?.leadId || null;
        toast({
          title: 'Lead Already Exists',
          description: 'We found your email in our system. We will link your account if created next.',
        });
      } else {
        throw new Error(leadResult?.message || 'Failed to capture lead');
      }

      // Try to create user account
      const signupResult = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone ? (formData.phone.startsWith('+') ? formData.phone : `+1${formData.phone}`) : '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        skipVerification: true // Skip email verification for lead capture flow
      });

      if (signupResult.success && createdLeadId) {
        // If signup successful, convert lead to user AND transfer debt data in one request
        const convertResponse = await fetch(`${import.meta.env.VITE_API_URL }/api/leads/${createdLeadId}/convert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            debts: debtData.debts.map(debt => ({
              name: debt.name,
              balance: debt.balance,
              minPayment: debt.minPayment,
              interestRate: debt.interestRate,
              dueDate: debt.dueDate,
              debtType: debt.debtType,
              description: debt.description || ''
            }))
          })
        });

        if (convertResponse.ok) {
          // Clear localStorage after successful transfer
          localStorage.removeItem('guest_debt_data');
        }

        toast({
          title: "🎉 Account Created!",
          description: "Your free account has been created and your debt data has been saved! Redirecting to your dashboard...",
          duration: 3000,
        });

        // Redirect to dashboard after successful signup
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

        onSuccess();
      } else {
        // If signup fails, lead is still captured
        const duplicate = leadResponse.status === 409;
        toast({
          title: duplicate ? 'Lead already on file' : 'Lead Captured!',
          description: duplicate
            ? 'You may already have an account with this email. Try signing in or resetting your password.'
            : "We've saved your information. We'll be in touch soon with your personalized debt freedom plan!",
          duration: 6000,
        });

        onSuccess();
      }

    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "There was an error processing your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalDebt = debtData.debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const totalMinPayments = debtData.debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle>Create Your Free Account</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              🎯 Unlock Your Complete Debt Freedom Journey
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              You've calculated your payoff strategies! Create a free account to:
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Save your progress and access it anytime
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Track payments and see real progress
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Receive monthly progress reports
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Get your printable payoff plan
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Access biblical financial wisdom
              </li>
            </ul>
          </div>

          {/* Debt Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Debt</p>
              <p className="text-lg font-bold text-red-600">
                ${totalDebt.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Min Payments</p>
              <p className="text-lg font-bold text-blue-600">
                ${totalMinPayments.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Extra Payment</p>
              <p className="text-lg font-bold text-purple-600">
                ${debtData.extraPayment.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Debts</p>
              <p className="text-lg font-bold text-green-600">
                {debtData.debts.length}
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className={`pl-9 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                We'll use this to send you important updates about your debt freedom journey
              </p>
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a secure password"
                  className={errors.password ? 'border-red-500' : ''}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Maybe Later
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Free Account
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            We'll never spam you and you can unsubscribe at any time.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

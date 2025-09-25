import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { VerificationMethodModal } from '@/components/auth/VerificationMethodModal';
import { PhoneInput } from '@/components/ui/PhoneInput';

export const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, verifyCode, resendCode, sendVerificationCode, verifyAccountCode, signInWithGoogle, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    try {
      const delay = new Promise((res) => setTimeout(res, 3000));
      const signPromise = signUp({
        firstName,
        lastName,
        email,
        phone: phone.trim(),
        password,
        confirmPassword
      });
      const result = await Promise.all([delay, signPromise]).then(([, r]) => r);
      
      if (result.success && result.requiresVerification) {
        // Since both email and phone are now required, always show modal to choose verification method
        setPendingEmail(email);
        setPendingPhone(phone.trim());
        setShowVerificationModal(true);
        return;
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully! Welcome to Legacy Mindset Solutions.",
          variant: "success",
        });
        navigate('/', { replace: true });
      } else {
        // Show specific validation errors
        if (result.errors && result.errors.length > 0) {
          // Show the first validation error (most important one)
          const firstError = result.errors[0];
          toast({
            title: "Validation Error",
            description: firstError.message,
            variant: "destructive",
          });
        } else {
          // Show general error message
          toast({
            title: "Error",
            description: result.error || "Failed to create account. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectVerificationMethod = async (method: 'email' | 'phone') => {
    setVerificationMethod(method);
    setAwaitingVerification(true);
    
    const contact = method === 'email' ? pendingEmail : pendingPhone;
    if (!contact) return;

    const success = await sendVerificationCode(method, contact);
    if (success) {
      toast({
        title: `Verification code sent`,
        description: `We sent a 6-digit code to your ${method === 'email' ? 'email' : 'phone number'}.`
      });
    } else {
      toast({
        title: 'Failed to send code',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const contact = verificationMethod === 'email' ? pendingEmail : pendingPhone;
    if (!contact) return;
    
    if (code.length !== 6) {
      toast({ 
        title: 'Invalid code', 
        description: 'Enter the 6-digit code.', 
        variant: 'destructive' 
      });
      return;
    }
    
    const ok = await verifyAccountCode(verificationMethod, contact, code);
    if (ok) {
      toast({ 
        title: 'Account verified', 
        description: 'Welcome to Legacy Mindset Solutions!' 
      });
      navigate('/', { replace: true });
    } else {
      toast({ 
        title: 'Verification failed', 
        description: 'The code was invalid or expired.', 
        variant: 'destructive' 
      });
    }
  };

  const handleResend = async () => {
    const contact = verificationMethod === 'email' ? pendingEmail : pendingPhone;
    if (!contact) return;
    
    const ok = await sendVerificationCode(verificationMethod, contact);
    if (ok) {
      toast({ 
        title: 'Code sent', 
        description: `Check your ${verificationMethod === 'email' ? 'email' : 'phone'} for a new code.` 
      });
    } else {
      toast({ 
        title: 'Resend failed', 
        description: 'Please try again later.', 
        variant: 'destructive' 
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const delay = new Promise((res) => setTimeout(res, 3000));
      await Promise.all([delay, signInWithGoogle()]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 to-brand-charcoal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-brand-gray hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/45e07ccd-ab70-45c2-aec8-3ab85f43ded3.png" 
                alt="Legacy Mindset Solutions Logo" 
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-brand-charcoal">
              {awaitingVerification ? 
                (verificationMethod === 'email' ? 'Verify Your Email' : 'Verify Your Phone') : 
                'Create Your Account'
              }
            </CardTitle>
            <CardDescription className="text-brand-gray">
              {awaitingVerification ? 
                `Enter the code we sent to ${verificationMethod === 'email' ? pendingEmail : pendingPhone}` : 
                'Join us on your journey to financial freedom and legacy building'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!awaitingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-brand-charcoal">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-brand-gray" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-brand-charcoal">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-brand-gray" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-brand-charcoal">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-gray" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-brand-charcoal">
                  Phone Number
                </Label>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter your phone number"
                  required
                  className="border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                />
                <p className="text-xs text-brand-gray">
                  Used for SMS notifications and account recovery.
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-brand-charcoal">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-gray" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-brand-gray hover:text-brand-charcoal transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-brand-charcoal">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-gray" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-brand-gray hover:text-brand-charcoal transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="mt-1 border-brand-gray/20 data-[state=checked]:bg-brand-purple data-[state=checked]:border-brand-purple"
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm text-brand-gray cursor-pointer leading-relaxed"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-brand-purple hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-brand-purple hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90 text-white font-semibold py-2.5"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-brand-charcoal">
                    Enter 6-digit verification code
                  </Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="______"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="text-center tracking-widest text-lg"
                    required
                  />
                  <p className="text-xs text-brand-gray">
                    We sent a code to {verificationMethod === 'email' ? pendingEmail : pendingPhone}. It expires in 15 minutes.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-gradient-hero text-white">Verify</Button>
                  <Button type="button" variant="outline" onClick={handleResend}>Resend</Button>
                </div>
              </form>
            )}

            {/* Google Sign In - Only show when not in verification mode */}
            {!awaitingVerification && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-brand-gray">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 flex items-center justify-center"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </span>
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">

            {/* Already have an account */}
            <div className="text-center">
              <p className="text-sm text-brand-gray">
                Already have an account?{' '}
                <Link 
                  to="/auth/signin" 
                  className="text-brand-purple hover:text-brand-charcoal font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Verification Method Selection Modal */}
        <VerificationMethodModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSelectMethod={handleSelectVerificationMethod}
          email={email}
          phone={pendingPhone || ''}
        />
      </div>
    </div>
  );
};

export default Signup;

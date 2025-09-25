import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const Signin: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<{ required: boolean; tempToken?: string }>({ required: false });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, isLoading } = useAuth();

  // Get the page user was trying to access before being redirected, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrPhone || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // const delay = new Promise((res) => setTimeout(res, 3000));
      const signPromise = signIn(emailOrPhone, password, twoFactorToken as any);
      const result = await Promise.all([signPromise]).then(([r]) => r);
      
      if ((result as any).twoFactorRequired) {
        setTwoFactorChallenge({ required: true, tempToken: (result as any).tempToken });
        return;
      }

      if (result.success) {
        toast({
          title: "Success",
          description: "You have been signed in successfully!",
          variant: "success",
        });
        
        // Redirect to the page user was trying to access, or home
        navigate(from, { replace: true });
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
            description: result.error || "Invalid email or password. Please try again.",
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

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password');
  };

  const handleGoogleSignIn = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // Navigate directly to backend redirect endpoint to avoid CORS/fetch timeouts
    window.location.assign(`${apiBase}/api/auth/google/url`);
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-brand-gray">
              Sign in to your account to continue your debt freedom journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email or Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-sm font-medium text-brand-charcoal">
                  Email Address or Phone Number
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-gray" />
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="pl-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
                    required
                  />
                </div>
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
                    placeholder="Enter your password"
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

              {twoFactorChallenge.required && (
                <div className="space-y-2">
                  <Label htmlFor="twofa" className="text-sm font-medium text-brand-charcoal">
                    Enter the 6‑digit code from your authenticator app
                  </Label>
                  <div className="flex gap-2">
                    <Input id="twofa" inputMode="numeric" maxLength={6} placeholder="______" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value.replace(/[^0-9]/g, ''))} className="tracking-widest" />
                    <Button type="button" onClick={async () => {
                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-2fa`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tempToken: twoFactorChallenge.tempToken, twoFactorToken })
                        });
                        const data = await response.json();
                        if (data.success && data.data?.user) {
                          // mimic sign-in success
                          localStorage.setItem('auth_status', 'authenticated');
                          localStorage.setItem('user_data', JSON.stringify(data.data.user));
                          if (data.data.token) localStorage.setItem('auth_token', data.data.token);
                          navigate(from, { replace: true });
                        } else {
                          toast({ title: 'Invalid code', description: data.message || 'Please try again.', variant: 'destructive' });
                        }
                      } catch (_) {
                        toast({ title: 'Error', description: 'Failed to verify 2FA. Try again.', variant: 'destructive' });
                      }
                    }}>Verify</Button>
                  </div>
                  <div className="text-xs text-brand-gray">Lost access to your app? <Link to="#" className="text-brand-purple">Verify via email or SMS</Link></div>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-brand-gray/20 data-[state=checked]:bg-brand-purple data-[state=checked]:border-brand-purple"
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm text-brand-gray cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-brand-purple hover:text-brand-charcoal transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-hero hover:opacity-90 text-white font-semibold py-2.5"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Google OAuth Section */}
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
              {/* Fallback anchor in case JS handlers are blocked */}
              <div className="sr-only">
                <a href={(import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/auth/google/start'}>Google OAuth</a>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Separator className="bg-brand-gray/20" />
            
            {/* Don't have an account */}
            <div className="text-center">
              <p className="text-sm text-brand-gray">
                Don't have an account?{' '}
                <Link 
                  to="/auth/signup" 
                  className="text-brand-purple hover:text-brand-charcoal font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-brand-gray/70">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-brand-purple hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-brand-purple hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signin;

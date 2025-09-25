import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const twofa = searchParams.get('twofa');
        const tempToken = searchParams.get('temp');

        if (twofa === '1' && tempToken) {
          // Handle 2FA challenge
          setError('Two-factor authentication required. Please complete 2FA verification.');
          setLoading(false);
          return;
        }

        if (token) {
          // Store the token first
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_status', 'authenticated');
          
          // Fetch user data from backend using the token
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google/me`, {
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${token}`
              }
            });
            
            const data = await response.json();
            
            if (data.success && data.data?.user) {
              // Store user data in localStorage
              localStorage.setItem('user_data', JSON.stringify(data.data.user));
              
              // Refresh auth context to update the state
              refreshAuth();
              
              toast({
                title: "Success",
                description: "You have been signed in successfully!",
                variant: "success",
              });

              // Redirect to dashboard after a short delay
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 2000);
            } else {
              throw new Error(data.message || 'Failed to fetch user data');
            }
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
            // Fallback: try to use refreshAuth anyway in case user data is cached
            refreshAuth();
            
            toast({
              title: "Success",
              description: "You have been signed in successfully!",
              variant: "success",
            });

            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          }
        } else {
          setError('No authentication token received');
        }
      } catch (err) {
        console.error('OAuth success handling error:', err);
        setError('Failed to complete authentication');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthSuccess();
  }, [searchParams, navigate, toast, refreshAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 to-brand-charcoal/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-purple" />
            <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
            <p className="text-gray-600">Please wait while we complete your sign-in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 to-brand-charcoal/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/auth/signin')} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 to-brand-charcoal/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2 text-green-600">Authentication Successful</h2>
          <p className="text-gray-600 mb-4">You have been signed in successfully!</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthSuccess;
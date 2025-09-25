import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TwoFactorModal from '@/components/auth/TwoFactorModal';

export const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();

  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const twofa = searchParams.get('twofa');
    const temp = searchParams.get('temp');

    if (twofa === '1' && temp) {
      setTempToken(temp);
      return;
    }

    if (token) {
      // Verify the token with the backend
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          // Store user data and token
          localStorage.setItem('auth_status', 'authenticated');
          localStorage.setItem('user_data', JSON.stringify(result.data.user));
          
          // Store JWT token if provided
          if (result.data.token) {
            localStorage.setItem('auth_token', result.data.token);
          }
          
          // Refresh authentication state
          refreshAuth();
          
          toast({
            title: "Success",
            description: "Successfully signed in with Google!",
            variant: "success",
          });
          
          // Small delay to ensure state is updated before redirect
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          throw new Error(result.message || 'Token verification failed');
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: "Failed to verify authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/auth/signin', { replace: true });
      });
    } else {
      // No token, redirect to signin
      navigate('/auth/signin', { replace: true });
    }
  }, [searchParams, navigate, toast, refreshAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 to-brand-charcoal/5 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-brand-charcoal mb-2">
          Completing Sign In...
        </h2>
        <p className="text-brand-gray">
          Please wait while we complete your Google sign-in.
        </p>
      </div>
      {tempToken && (
        <TwoFactorModal
          isOpen={true}
          tempToken={tempToken}
          onClose={() => navigate('/auth/signin', { replace: true })}
          onSuccess={(user, token) => {
            localStorage.setItem('auth_status', 'authenticated');
            localStorage.setItem('user_data', JSON.stringify(user));
            if (token) localStorage.setItem('auth_token', token);
            refreshAuth();
            toast({ title: 'Success', description: 'Two-factor verified. Signed in with Google.' });
            setTimeout(() => navigate('/dashboard', { replace: true }), 300);
          }}
        />
      )}
    </div>
  );
};

export default OAuthSuccess;

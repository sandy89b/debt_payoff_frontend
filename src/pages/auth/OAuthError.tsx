import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PressButton as Button } from "@/components/ui/PressButton";
import { AlertCircle, ArrowLeft } from 'lucide-react';

const OAuthError: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorMessage = searchParams.get('message') || 'An authentication error occurred';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple/5 to-brand-charcoal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth/signin')} 
                className="w-full bg-gradient-hero hover:opacity-90 text-white font-semibold py-2.5"
              >
                Try Signing In Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OAuthError;
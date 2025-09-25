import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      toast({ title: 'Invalid link', description: 'Missing token.', variant: 'destructive' });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Invalid or expired link');
      }
      toast({ title: 'Password set', description: 'You can now sign in.' });
      navigate('/auth/signin');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to set password', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Set Your Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !token} className="w-full">
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Setting Password...
              </>
            ) : (
              'Set Password'
            )}
          </Button>
          {!token && (
            <p className="text-sm text-muted-foreground">Missing or invalid password setup link.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;



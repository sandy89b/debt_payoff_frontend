import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorModalProps {
  isOpen: boolean;
  tempToken: string;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, tempToken, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({ title: 'Invalid code', description: 'Enter the 6-digit code.', variant: 'destructive' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ tempToken, twoFactorToken: code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Verification failed');
      onSuccess(data.data.user, data.data.token);
    } catch (e: any) {
      toast({ title: 'Verification failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Two-Factor Verification</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <Label htmlFor="twofa">Enter the 6-digit code from your authenticator app</Label>
          <Input id="twofa" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} className="tracking-widest text-center text-lg" placeholder="______" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting} className="transition-all duration-200 hover:opacity-90 active:scale-95">Cancel</Button>
          <Button onClick={handleVerify} disabled={submitting} className="transition-all duration-200 active:scale-95">
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Verifying…
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorModal;



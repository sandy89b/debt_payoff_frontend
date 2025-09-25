import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [is2faBusy, setIs2faBusy] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [secretBase32, setSecretBase32] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  const api = (path: string, init?: RequestInit) => fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${path}`, init);

  const loadMe = async () => {
    try {
      const res = await api('/api/user/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTwoFAEnabled(!!data.data?.twoFactorEnabled);
      }
    } catch {}
  };

  useEffect(() => { loadMe(); }, [user?.id]);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: 'Invalid password', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    try {
      setIsSaving(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password');
      }
      toast({ title: 'Password updated', description: 'Your password has been changed.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 max-w-lg">
          <div>
            <Label htmlFor="current">Current Password (leave blank if you signed up with Google)</Label>
            <Input id="current" type="password" placeholder="Leave blank for Google sign-in accounts" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="new">New Password</Label>
            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={isSaving}>Change Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
        </CardHeader>
        <CardContent>
          {!twoFAEnabled ? (
            <div className="space-y-4">
              {!otpauthUrl ? (
                <>
                  <p className="text-sm text-muted-foreground">Secure your account with an authenticator app (Google Authenticator, Authy, etc.).</p>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setIs2faBusy(true);
                        const res = await api('/api/user/2fa/setup', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to start setup');
                        setSecretBase32(data.data.base32);
                        setOtpauthUrl(data.data.otpauth);
                        if (data.data.qrDataUrl) setQrDataUrl(data.data.qrDataUrl);
                        toast({ title: '2FA setup started', description: 'Scan the QR with your authenticator app.' });
                      } catch (e: any) {
                        toast({ title: 'Error', description: e.message || 'Failed to start 2FA setup', variant: 'destructive' });
                      } finally {
                        setIs2faBusy(false);
                      }
                    }}
                    disabled={is2faBusy}
                  >
                    {is2faBusy ? 'Preparing…' : 'Set up Authenticator'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium mb-2">Scan this QR in your authenticator app</p>
                      {qrDataUrl ? (
                        <img alt="Authenticator QR" className="border rounded p-2 bg-white" src={qrDataUrl} />
                      ) : (
                        <img alt="Authenticator QR" className="border rounded p-2 bg-white" src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`} />
                      )}
                      <p className="text-xs text-muted-foreground mt-2">Or enter this key manually: <span className="font-mono">{secretBase32}</span></p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter 6-digit code</Label>
                      <Input id="otp" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} />
                      <div className="flex gap-2">
                        <Button onClick={async () => {
                          try {
                            if (otpCode.length !== 6) { toast({ title: 'Invalid code', description: 'Enter the 6-digit code.', variant: 'destructive' }); return; }
                            setIs2faBusy(true);
                            const res = await api('/api/user/2fa/enable', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                              body: JSON.stringify({ token: otpCode })
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to enable 2FA');
                            setTwoFAEnabled(true);
                            setOtpCode('');
                            toast({ title: 'Two-factor enabled', description: 'Keep your codes safe.' });
                          } catch (e: any) {
                            toast({ title: 'Verification failed', description: e.message || 'Invalid or expired code', variant: 'destructive' });
                          } finally {
                            setIs2faBusy(false);
                          }
                        }} disabled={is2faBusy}>Enable</Button>
                        <Button variant="ghost" onClick={() => { setOtpauthUrl(''); setSecretBase32(''); setOtpCode(''); }}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Two-factor authentication is currently <span className="text-green-600 font-medium">enabled</span> for your account.</p>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirm password to disable</Label>
                <Input id="confirm-pass" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <Button variant="destructive" onClick={async () => {
                try {
                  setIs2faBusy(true);
                  const res = await api('/api/user/2fa/disable', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                    body: JSON.stringify({ password: currentPassword })
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to disable 2FA');
                  setTwoFAEnabled(false);
                  setOtpauthUrl('');
                  setSecretBase32('');
                  toast({ title: 'Two-factor disabled' });
                } catch (e: any) {
                  toast({ title: 'Error', description: e.message || 'Failed to disable 2FA', variant: 'destructive' });
                } finally {
                  setIs2faBusy(false);
                }
              }} disabled={is2faBusy}>Disable Two-Factor</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;



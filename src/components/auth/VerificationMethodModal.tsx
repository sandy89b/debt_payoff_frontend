import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Shield } from 'lucide-react';
import { parsePhoneNumber, findCountryByDialCode } from '@/data/countryCodes';
import ReactCountryFlag from 'react-country-flag';

// Flag component using react-country-flag library
const FlagIcon: React.FC<{ country: any }> = ({ country }) => {
  return (
    <div 
      className="flex-shrink-0 w-6 h-4 flex items-center justify-center"
      title={country.name}
    >
      <ReactCountryFlag 
        countryCode={country.code} 
        svg
        style={{
          width: '24px',
          height: '16px',
          borderRadius: '2px'
        }}
      />
    </div>
  );
};

interface VerificationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'email' | 'phone') => void;
  email: string;
  phone: string;
}

export const VerificationMethodModal: React.FC<VerificationMethodModalProps> = ({
  isOpen,
  onClose,
  onSelectMethod,
  email,
  phone
}) => {
  const handleSelectEmail = () => {
    onSelectMethod('email');
    onClose();
  };

  const handleSelectPhone = () => {
    onSelectMethod('phone');
    onClose();
  };

  // Parse phone number to get country info
  const parsedPhone = parsePhoneNumber(phone);
  const country = findCountryByDialCode(parsedPhone.countryCode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-brand-charcoal">
            <Shield className="h-5 w-5 text-brand-purple" />
            Choose Verification Method
          </DialogTitle>
          <DialogDescription className="text-brand-gray">
            How would you like to verify your account? Choose your preferred method below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* Email Verification Option */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-brand-gray/20 hover:border-brand-purple/50"
            onClick={handleSelectEmail}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-brand-purple" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-charcoal">Email Verification</h3>
                  <p className="text-sm text-brand-gray">Send code to {email}</p>
                  <p className="text-xs text-brand-gray/70 mt-1">
                    We'll send a 6-digit code to your email address
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone Verification Option */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-brand-gray/20 hover:border-brand-purple/50"
            onClick={handleSelectPhone}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-brand-purple" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-charcoal">SMS Verification</h3>
                  <div className="text-sm text-brand-gray flex items-center gap-2">
                    <span>Send code to</span>
                    {country && <FlagIcon country={country} />}
                    <span>{parsedPhone.countryCode} {parsedPhone.phoneNumber}</span>
                  </div>
                  <p className="text-xs text-brand-gray/70 mt-1">
                    We'll send a 6-digit code via text message
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-brand-gray/20 text-brand-gray hover:bg-brand-gray/5"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

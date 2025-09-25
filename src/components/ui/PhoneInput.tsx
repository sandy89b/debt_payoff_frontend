import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { CountryCodeSelector } from '@/components/ui/CountryCodeSelector';
import { Country, getDefaultCountry, formatPhoneWithCountryCode, parsePhoneNumber, countryCodes } from '@/data/countryCodes';

interface PhoneInputProps {
  value: string;
  onChange: (fullPhoneNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  required = false,
  className = "",
  id
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      const country = countryCodes.find(c => c.dialCode === parsed.countryCode);
      if (country) {
        setSelectedCountry(country);
      }
      setPhoneNumber(parsed.phoneNumber);
    }
  }, []);

  // Update parent when country or phone number changes
  useEffect(() => {
    const fullNumber = phoneNumber ? formatPhoneWithCountryCode(selectedCountry.dialCode, phoneNumber) : '';
    onChange(fullNumber);
  }, [selectedCountry, phoneNumber, onChange]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, dashes, and parentheses
    const cleaned = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
    setPhoneNumber(cleaned);
  };

  const formatPhoneDisplay = (phone: string) => {
    // Basic formatting for US/Canada numbers
    const digits = phone.replace(/\D/g, '');
    
    if (selectedCountry.dialCode === '+1' && digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // For other countries, just return the cleaned input
    return phone;
  };

  return (
    <div className={`flex ${className}`}>
      {/* Country Code Selector */}
      <CountryCodeSelector
        selectedCountry={selectedCountry}
        onCountrySelect={handleCountrySelect}
        disabled={disabled}
      />
      
      {/* Phone Number Input */}
      <Input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={formatPhoneDisplay(phoneNumber)}
        onChange={handlePhoneNumberChange}
        disabled={disabled}
        required={required}
        className={`
          flex-1 ml-1 border-l-0 rounded-l-none border-brand-gray/20 
          focus:border-brand-purple focus:ring-brand-purple/20
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
    </div>
  );
};

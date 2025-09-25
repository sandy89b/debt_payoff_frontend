import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { countryCodes, Country, getDefaultCountry } from '@/data/countryCodes';
import ReactCountryFlag from 'react-country-flag';

// Flag component using react-country-flag library
const FlagIcon: React.FC<{ country: Country }> = ({ country }) => {
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

interface CountryCodeSelectorProps {
  selectedCountry: Country;
  onCountrySelect: (country: Country) => void;
  disabled?: boolean;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onCountrySelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countryCodes);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search term
  useEffect(() => {
    const filtered = countryCodes.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchTerm]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Country Button */}
      <Button
        type="button"
        variant="outline"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 h-10 min-w-[100px] border-brand-gray/20 
          hover:bg-gray-50 focus:border-brand-purple focus:ring-brand-purple/20
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-brand-purple ring-2 ring-brand-purple/20' : ''}
        `}
      >
        <FlagIcon country={selectedCountry} />
        <span className="text-sm font-medium text-brand-charcoal">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-brand-gray transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-brand-gray/20 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-brand-gray/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-gray" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-brand-gray/20 focus:border-brand-purple focus:ring-brand-purple/20"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-64">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-purple/5 
                    transition-colors focus:outline-none focus:bg-brand-purple/10
                    ${selectedCountry.code === country.code ? 'bg-brand-purple/10 border-r-2 border-brand-purple' : ''}
                  `}
                >
                  <FlagIcon country={country} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-charcoal truncate">
                        {country.name}
                      </span>
                      <span className="text-sm text-brand-gray font-mono ml-2">
                        {country.dialCode}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-brand-gray">
                <p className="text-sm">No countries found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

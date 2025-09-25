export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const countryCodes: Country[] = [
  // North America
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  
  // Europe
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺" },
  { name: "Monaco", code: "MC", dialCode: "+377", flag: "🇲🇨" },
  { name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩" },
  { name: "San Marino", code: "SM", dialCode: "+378", flag: "🇸🇲" },
  { name: "Vatican City", code: "VA", dialCode: "+39", flag: "🇻🇦" },
  { name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹" },
  { name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪" },
  { name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻" },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦" },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸" },
  { name: "Montenegro", code: "ME", dialCode: "+382", flag: "🇲🇪" },
  { name: "North Macedonia", code: "MK", dialCode: "+389", flag: "🇲🇰" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴" },
  { name: "Moldova", code: "MD", dialCode: "+373", flag: "🇲🇩" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾" },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰" },
    
  // Asia
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
  { name: "Bhutan", code: "BT", dialCode: "+975", flag: "🇧🇹" },
  { name: "Maldives", code: "MV", dialCode: "+960", flag: "🇲🇻" },
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Myanmar", code: "MM", dialCode: "+95", flag: "🇲🇲" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭" },
  { name: "Laos", code: "LA", dialCode: "+856", flag: "🇱🇦" },
  { name: "Brunei", code: "BN", dialCode: "+673", flag: "🇧🇳" },
  { name: "Mongolia", code: "MN", dialCode: "+976", flag: "🇲🇳" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼" },
  { name: "Macau", code: "MO", dialCode: "+853", flag: "🇲🇴" },
  
  // Central Asia
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿" },
  { name: "Uzbekistan", code: "UZ", dialCode: "+998", flag: "🇺🇿" },
  { name: "Kyrgyzstan", code: "KG", dialCode: "+996", flag: "🇰🇬" },
  { name: "Tajikistan", code: "TJ", dialCode: "+992", flag: "🇹🇯" },
  { name: "Turkmenistan", code: "TM", dialCode: "+993", flag: "🇹🇲" },
  
  // Middle East
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "UAE", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
  { name: "Syria", code: "SY", dialCode: "+963", flag: "🇸🇾" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷" },
  { name: "Yemen", code: "YE", dialCode: "+967", flag: "🇾🇪" },
  
  // Caucasus
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲" },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿" },
  
  // Africa
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "Tunisia", code: "TN", dialCode: "+216", flag: "🇹🇳" },
  { name: "Libya", code: "LY", dialCode: "+218", flag: "🇱🇾" },
  { name: "Sudan", code: "SD", dialCode: "+249", flag: "🇸🇩" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Senegal", code: "SN", dialCode: "+221", flag: "🇸🇳" },
  { name: "Mali", code: "ML", dialCode: "+223", flag: "🇲🇱" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫" },
  { name: "Niger", code: "NE", dialCode: "+227", flag: "🇳🇪" },
  { name: "Chad", code: "TD", dialCode: "+235", flag: "🇹🇩" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲" },
  { name: "Central African Republic", code: "CF", dialCode: "+236", flag: "🇨🇫" },
  { name: "Democratic Republic of Congo", code: "CD", dialCode: "+243", flag: "🇨🇩" },
  { name: "Republic of Congo", code: "CG", dialCode: "+242", flag: "🇨🇬" },
  { name: "Gabon", code: "GA", dialCode: "+241", flag: "🇬🇦" },
  { name: "Equatorial Guinea", code: "GQ", dialCode: "+240", flag: "🇬🇶" },
  { name: "São Tomé and Príncipe", code: "ST", dialCode: "+239", flag: "🇸🇹" },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴" },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼" },
  { name: "Botswana", code: "BW", dialCode: "+267", flag: "🇧🇼" },
  { name: "Namibia", code: "NA", dialCode: "+264", flag: "🇳🇦" },
  { name: "Lesotho", code: "LS", dialCode: "+266", flag: "🇱🇸" },
  { name: "Swaziland", code: "SZ", dialCode: "+268", flag: "🇸🇿" },
  { name: "Madagascar", code: "MG", dialCode: "+261", flag: "🇲🇬" },
  { name: "Mauritius", code: "MU", dialCode: "+230", flag: "🇲🇺" },
  { name: "Seychelles", code: "SC", dialCode: "+248", flag: "🇸🇨" },
  { name: "Comoros", code: "KM", dialCode: "+269", flag: "🇰🇲" },
  { name: "Djibouti", code: "DJ", dialCode: "+253", flag: "🇩🇯" },
  { name: "Somalia", code: "SO", dialCode: "+252", flag: "🇸🇴" },
  { name: "Eritrea", code: "ER", dialCode: "+291", flag: "🇪🇷" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿" },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬" },
  { name: "Rwanda", code: "RW", dialCode: "+250", flag: "🇷🇼" },
  { name: "Burundi", code: "BI", dialCode: "+257", flag: "🇧🇮" },
  { name: "Malawi", code: "MW", dialCode: "+265", flag: "🇲🇼" },
  { name: "Mozambique", code: "MZ", dialCode: "+258", flag: "🇲🇿" },
  { name: "Cape Verde", code: "CV", dialCode: "+238", flag: "🇨🇻" },
  { name: "Guinea-Bissau", code: "GW", dialCode: "+245", flag: "🇬🇼" },
  { name: "Guinea", code: "GN", dialCode: "+224", flag: "🇬🇳" },
  { name: "Sierra Leone", code: "SL", dialCode: "+232", flag: "🇸🇱" },
  { name: "Liberia", code: "LR", dialCode: "+231", flag: "🇱🇷" },
  { name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "🇨🇮" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬" },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯" },
  
  // South America
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴" },
  { name: "Paraguay", code: "PY", dialCode: "+595", flag: "🇵🇾" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾" },
  { name: "Guyana", code: "GY", dialCode: "+592", flag: "🇬🇾" },
  { name: "Suriname", code: "SR", dialCode: "+597", flag: "🇸🇷" },
  { name: "French Guiana", code: "GF", dialCode: "+594", flag: "🇬🇫" },
  
  // Central America & Caribbean
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹" },
  { name: "Belize", code: "BZ", dialCode: "+501", flag: "🇧🇿" },
  { name: "El Salvador", code: "SV", dialCode: "+503", flag: "🇸🇻" },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳" },
  { name: "Nicaragua", code: "NI", dialCode: "+505", flag: "🇳🇮" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦" },
  { name: "Cuba", code: "CU", dialCode: "+53", flag: "🇨🇺" },
  { name: "Jamaica", code: "JM", dialCode: "+1", flag: "🇯🇲" },
  { name: "Haiti", code: "HT", dialCode: "+509", flag: "🇭🇹" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1", flag: "🇩🇴" },
  { name: "Puerto Rico", code: "PR", dialCode: "+1", flag: "🇵🇷" },
  { name: "Trinidad and Tobago", code: "TT", dialCode: "+1", flag: "🇹🇹" },
  { name: "Barbados", code: "BB", dialCode: "+1", flag: "🇧🇧" },
  { name: "Bahamas", code: "BS", dialCode: "+1", flag: "🇧🇸" },
  { name: "Antigua and Barbuda", code: "AG", dialCode: "+1", flag: "🇦🇬" },
  { name: "Dominica", code: "DM", dialCode: "+1", flag: "🇩🇲" },
  { name: "Grenada", code: "GD", dialCode: "+1", flag: "🇬🇩" },
  { name: "Saint Kitts and Nevis", code: "KN", dialCode: "+1", flag: "🇰🇳" },
  { name: "Saint Lucia", code: "LC", dialCode: "+1", flag: "🇱🇨" },
  { name: "Saint Vincent and the Grenadines", code: "VC", dialCode: "+1", flag: "🇻🇨" },
  
  // Oceania
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Papua New Guinea", code: "PG", dialCode: "+675", flag: "🇵🇬" },
  { name: "Fiji", code: "FJ", dialCode: "+679", flag: "🇫🇯" },
  { name: "Solomon Islands", code: "SB", dialCode: "+677", flag: "🇸🇧" },
  { name: "Vanuatu", code: "VU", dialCode: "+678", flag: "🇻🇺" },
  { name: "New Caledonia", code: "NC", dialCode: "+687", flag: "🇳🇨" },
  { name: "French Polynesia", code: "PF", dialCode: "+689", flag: "🇵🇫" },
  { name: "Samoa", code: "WS", dialCode: "+685", flag: "🇼🇸" },
  { name: "Tonga", code: "TO", dialCode: "+676", flag: "🇹🇴" },
  { name: "Kiribati", code: "KI", dialCode: "+686", flag: "🇰🇮" },
  { name: "Tuvalu", code: "TV", dialCode: "+688", flag: "🇹🇻" },
  { name: "Nauru", code: "NR", dialCode: "+674", flag: "🇳🇷" },
  { name: "Palau", code: "PW", dialCode: "+680", flag: "🇵🇼" },
  { name: "Marshall Islands", code: "MH", dialCode: "+692", flag: "🇲🇭" },
  { name: "Micronesia", code: "FM", dialCode: "+691", flag: "🇫🇲" },
];

// Helper function to find country by dial code
export const findCountryByDialCode = (dialCode: string): Country | undefined => {
  return countryCodes.find(country => country.dialCode === dialCode);
};

// Helper function to get default country (US)
export const getDefaultCountry = (): Country => {
  return countryCodes.find(country => country.code === "US") || countryCodes[0];
};

// Helper function to format phone number with country code
export const formatPhoneWithCountryCode = (countryCode: string, phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `${countryCode}${cleanPhone}`;
};

// Helper function to parse phone number with country code
export const parsePhoneNumber = (fullPhoneNumber: string): { countryCode: string; phoneNumber: string } => {
  // Remove any spaces or special characters
  const cleaned = fullPhoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Find the longest matching country code
  let matchedCountry: Country | undefined;
  let phoneNumber = cleaned;
  
  for (const country of countryCodes) {
    if (cleaned.startsWith(country.dialCode)) {
      if (!matchedCountry || country.dialCode.length > matchedCountry.dialCode.length) {
        matchedCountry = country;
      }
    }
  }
  
  if (matchedCountry) {
    phoneNumber = cleaned.substring(matchedCountry.dialCode.length);
    return {
      countryCode: matchedCountry.dialCode,
      phoneNumber: phoneNumber
    };
  }
  
  // Default to US if no match found
  return {
    countryCode: "+1",
    phoneNumber: cleaned.startsWith('+') ? cleaned.substring(1) : cleaned
  };
};

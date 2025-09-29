import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  inline?: boolean; // For inline spinners in buttons/forms
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '',
  inline = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // For inline spinners (in buttons/forms), just return the spinning icon
  if (inline) {
    return (
      <div className={`${iconSizeClasses[size]} animate-spin ${className}`}>
        <RefreshCw className={`${iconSizeClasses[size]} text-current`} />
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-float mx-auto mb-4`}>
        <RefreshCw className={`${iconSizeClasses[size]} text-white animate-spin`} />
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-300`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

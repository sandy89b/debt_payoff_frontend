import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      // Start transition out
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 150); // Half of the total transition time

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={`page-transition-container ${
        isTransitioning ? 'page-transitioning' : 'page-transitioned'
      }`}
    >
      {children}
    </div>
  );
};

import { EnhancedDebtCalculator } from '@/components/debt-calculator/EnhancedDebtCalculator';
import { GuestDebtCalculator } from '@/components/debt-calculator/GuestDebtCalculator';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // Force guest mode if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <GuestDebtCalculator />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <EnhancedDebtCalculator />
    </div>
  );
};

export default Index;
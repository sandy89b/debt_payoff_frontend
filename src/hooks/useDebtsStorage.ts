import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { useToast } from './use-toast';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  minPayment: number;
  interestRate: number;
}

interface DebtStorageData {
  debts: Debt[];
  extraPayment: number;
  lastUpdated: string;
}

interface ProgressData {
  currentStep: number;
  completedSteps: number[];
  hasSeenOnboarding: boolean;
  lastVisited: string;
}

const DEFAULT_DEBT: Debt = {
  id: '1',
  name: 'Credit Card 1',
  balance: 5000,
  minPayment: 150,
  interestRate: 18.99
};

const DEFAULT_DEBT_DATA: DebtStorageData = {
  debts: [DEFAULT_DEBT],
  extraPayment: 0,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_PROGRESS: ProgressData = {
  currentStep: 1,
  completedSteps: [],
  hasSeenOnboarding: false,
  lastVisited: new Date().toISOString()
};

export function useDebtsStorage() {
  const { toast } = useToast();
  const [debtData, setDebtData] = useLocalStorage<DebtStorageData>('pourPayoffPlanner_debts', DEFAULT_DEBT_DATA);
  const [progressData, setProgressData] = useLocalStorage<ProgressData>('pourPayoffPlanner_progress', DEFAULT_PROGRESS);

  // Auto-save debt data with timestamp
  const saveDebtData = (debts: Debt[], extraPayment: number) => {
    const newData: DebtStorageData = {
      debts,
      extraPayment,
      lastUpdated: new Date().toISOString()
    };
    setDebtData(newData);
  };

  // Auto-save progress data
  const saveProgressData = (currentStep: number, completedSteps: number[], hasSeenOnboarding: boolean) => {
    const newData: ProgressData = {
      currentStep,
      completedSteps,
      hasSeenOnboarding,
      lastVisited: new Date().toISOString()
    };
    setProgressData(newData);
  };

  // Clear all stored data
  const clearAllData = () => {
    setDebtData(DEFAULT_DEBT_DATA);
    setProgressData(DEFAULT_PROGRESS);
    toast({
      title: "Data Cleared",
      description: "All saved progress has been reset.",
    });
  };

  // Export data for backup
  const exportData = () => {
    const exportData = {
      debtData,
      progressData,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pour-payoff-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded as a backup file.",
    });
  };

  // Import data from backup
  const importData = (fileContent: string) => {
    try {
      const importedData = JSON.parse(fileContent);
      
      if (importedData.debtData) {
        setDebtData(importedData.debtData);
      }
      
      if (importedData.progressData) {
        setProgressData(importedData.progressData);
      }
      
      toast({
        title: "Data Imported",
        description: "Your backup data has been restored successfully.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "The backup file format is invalid.",
        variant: "destructive"
      });
    }
  };

  // Check if data exists and show welcome back message
  useEffect(() => {
    const hasExistingData = debtData.lastUpdated !== DEFAULT_DEBT_DATA.lastUpdated;
    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(progressData.lastVisited).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (hasExistingData && daysSinceLastVisit > 0) {
      const message = daysSinceLastVisit === 1 
        ? "Welcome back! Your progress from yesterday has been restored."
        : `Welcome back! Your progress from ${daysSinceLastVisit} days ago has been restored.`;
        
      setTimeout(() => {
        toast({
          title: "Welcome Back!",
          description: message,
        });
      }, 1000); // Delay to ensure UI is ready
    }
  }, []);

  return {
    // Data
    debts: debtData.debts,
    extraPayment: debtData.extraPayment,
    currentStep: progressData.currentStep,
    completedSteps: progressData.completedSteps,
    hasSeenOnboarding: progressData.hasSeenOnboarding,
    lastUpdated: debtData.lastUpdated,
    
    // Actions
    saveDebtData,
    saveProgressData,
    clearAllData,
    exportData,
    importData,
  };
}
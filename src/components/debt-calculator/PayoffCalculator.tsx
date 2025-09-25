import React from 'react';
import { Debt } from './DebtEntry';

export interface PayoffResult {
  strategy: 'snowball' | 'avalanche';
  totalMonths: number;
  totalInterest: number;
  monthlySchedule: Array<{
    month: number;
    debts: Array<{
      id: string;
      name: string;
      balance: number;
      payment: number;
      isComplete: boolean;
    }>;
    totalPayment: number;
  }>;
}

export const calculatePayoffStrategies = (
  debts: Debt[],
  extraPayment: number = 0
): { snowball: PayoffResult; avalanche: PayoffResult } => {
  const snowballResult = calculateSnowball(debts, extraPayment);
  const avalancheResult = calculateAvalanche(debts, extraPayment);
  
  return { snowball: snowballResult, avalanche: avalancheResult };
};

const calculateSnowball = (debts: Debt[], extraPayment: number): PayoffResult => {
  // Sort by balance (smallest first)
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  return simulatePayoff(sortedDebts, extraPayment, 'snowball');
};

const calculateAvalanche = (debts: Debt[], extraPayment: number): PayoffResult => {
  // Sort by interest rate (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  return simulatePayoff(sortedDebts, extraPayment, 'avalanche');
};

const simulatePayoff = (
  sortedDebts: Debt[],
  extraPayment: number,
  strategy: 'snowball' | 'avalanche'
): PayoffResult => {
  const workingDebts = sortedDebts.map(debt => ({ ...debt }));
  const monthlySchedule = [];
  let month = 0;
  let totalInterest = 0;
  let availableExtra = extraPayment;

  while (workingDebts.some(debt => debt.balance > 0)) {
    month++;
    let totalPayment = 0;
    
    // Apply minimum payments and interest
    workingDebts.forEach(debt => {
      if (debt.balance > 0) {
        const monthlyInterest = (debt.balance * debt.interestRate / 100) / 12;
        totalInterest += monthlyInterest;
        debt.balance += monthlyInterest;
        
        const payment = Math.min(debt.minPayment, debt.balance);
        debt.balance -= payment;
        totalPayment += payment;
        
        if (debt.balance < 0.01) {
          debt.balance = 0;
        }
      }
    });

    // Apply extra payment to target debt
    if (availableExtra > 0) {
      const targetDebt = workingDebts.find(debt => debt.balance > 0);
      if (targetDebt) {
        const extraApplied = Math.min(availableExtra, targetDebt.balance);
        targetDebt.balance -= extraApplied;
        totalPayment += extraApplied;
        
        if (targetDebt.balance < 0.01) {
          targetDebt.balance = 0;
          // In snowball, this freed up payment becomes available for next debt
          if (strategy === 'snowball') {
            availableExtra += targetDebt.minPayment;
          }
        }
      }
    }

    // Record monthly snapshot
    monthlySchedule.push({
      month,
      debts: workingDebts.map(debt => ({
        id: debt.id,
        name: debt.name,
        balance: debt.balance,
        payment: debt.balance > 0 ? debt.minPayment : 0,
        isComplete: debt.balance === 0
      })),
      totalPayment
    });

    // Safety valve to prevent infinite loops
    if (month > 600) break; // 50 years max
  }

  return {
    strategy,
    totalMonths: month,
    totalInterest,
    monthlySchedule
  };
};
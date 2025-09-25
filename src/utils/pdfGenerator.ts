import jsPDF from 'jspdf';
import { Debt } from '@/components/debt-calculator/DebtEntry';

interface PDFData {
  debts: Debt[];
  extraPayment: number;
  snowballResult: any;
  avalancheResult: any;
  userName?: string;
}

export const generateDebtPayoffPDF = (data: PDFData): void => {
  const { debts, extraPayment, snowballResult, avalancheResult, userName = 'Friend' } = data;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  let yPosition = 20;

  // Helper function to add text with line breaks
  const addText = (text: string, x: number, y: number, maxWidth?: number, size = 12, color = '#000000') => {
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    
    if (maxWidth) {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        pdf.text(line, x, y + (index * (size * 0.5)));
      });
      return y + (lines.length * (size * 0.5));
    } else {
      pdf.text(text, x, y);
      return y + (size * 0.5);
    }
  };

  // Header with branding
  pdf.setFillColor(76, 175, 80); // Brand green
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(24);
  pdf.text('The Pour & Payoff Planner™', 20, 25);
  
  pdf.setFontSize(12);
  pdf.text('Your Biblical Path to Debt Freedom', 20, 32);

  yPosition = 55;

  // Personal greeting
  pdf.setTextColor('#2E7D32');
  pdf.setFontSize(16);
  pdf.text(`Dear ${userName},`, 20, yPosition);
  yPosition += 15;

  // Biblical encouragement
  pdf.setTextColor('#000000');
  pdf.setFontSize(12);
  const encouragement = `"The rich rule over the poor, and the borrower is slave to the lender." - Proverbs 22:7

Congratulations on taking this faithful step toward financial freedom! Like the widow in 2 Kings 4, you're about to pour what's in your house to cancel what you owe and create what you need.`;
  
  yPosition = addText(encouragement, 20, yPosition, pageWidth - 40, 12);
  yPosition += 15;

  // Debt Summary Section
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
  
  pdf.setTextColor('#2E7D32');
  pdf.setFontSize(14);
  pdf.text('Your Current Debts', 20, yPosition + 5);
  yPosition += 20;

  pdf.setTextColor('#000000');
  pdf.setFontSize(10);
  
  // Table header
  pdf.text('Debt Name', 20, yPosition);
  pdf.text('Balance', 80, yPosition);
  pdf.text('Min Payment', 120, yPosition);
  pdf.text('Interest Rate', 160, yPosition);
  yPosition += 8;

  // Draw line under header
  pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
  yPosition += 5;

  // Debt details
  let totalBalance = 0;
  let totalMinPayment = 0;
  
  debts.forEach((debt) => {
    totalBalance += debt.balance;
    totalMinPayment += debt.minPayment;
    
    pdf.text(debt.name.substring(0, 15), 20, yPosition);
    pdf.text(`$${debt.balance.toLocaleString()}`, 80, yPosition);
    pdf.text(`$${debt.minPayment.toLocaleString()}`, 120, yPosition);
    pdf.text(`${debt.interestRate}%`, 160, yPosition);
    yPosition += 8;
  });

  // Totals
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;
  pdf.setFontSize(11);
  pdf.text('TOTALS:', 20, yPosition);
  pdf.text(`$${totalBalance.toLocaleString()}`, 80, yPosition);
  pdf.text(`$${totalMinPayment.toLocaleString()}`, 120, yPosition);
  yPosition += 15;

  // Strategy Comparison
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
  
  pdf.setTextColor('#2E7D32');
  pdf.setFontSize(14);
  pdf.text('Your Payoff Strategies', 20, yPosition + 5);
  yPosition += 25;

  // Snowball vs Avalanche comparison
  pdf.setTextColor('#000000');
  pdf.setFontSize(12);
  
  const snowballMonths = Math.round(snowballResult.totalMonths);
  const avalancheMonths = Math.round(avalancheResult.totalMonths);
  const snowballInterest = snowballResult.totalInterest;
  const avalancheInterest = avalancheResult.totalInterest;

  // Snowball Method
  pdf.setTextColor('#1976D2');
  pdf.setFontSize(13);
  pdf.text('🏔️ Debt Snowball Method (Smallest Balance First)', 20, yPosition);
  yPosition += 12;

  pdf.setTextColor('#000000');
  pdf.setFontSize(11);
  pdf.text(`• Time to Freedom: ${snowballMonths} months (${Math.floor(snowballMonths/12)} years, ${snowballMonths%12} months)`, 25, yPosition);
  yPosition += 8;
  pdf.text(`• Total Interest Paid: $${snowballInterest.toLocaleString()}`, 25, yPosition);
  yPosition += 8;
  pdf.text(`• Monthly Extra Payment: $${extraPayment.toLocaleString()}`, 25, yPosition);
  yPosition += 15;

  // Avalanche Method
  pdf.setTextColor('#E65100');
  pdf.setFontSize(13);
  pdf.text('⚡ Debt Avalanche Method (Highest Interest First)', 20, yPosition);
  yPosition += 12;

  pdf.setTextColor('#000000');
  pdf.setFontSize(11);
  pdf.text(`• Time to Freedom: ${avalancheMonths} months (${Math.floor(avalancheMonths/12)} years, ${avalancheMonths%12} months)`, 25, yPosition);
  yPosition += 8;
  pdf.text(`• Total Interest Paid: $${avalancheInterest.toLocaleString()}`, 25, yPosition);
  yPosition += 8;
  pdf.text(`• Interest Savings vs Snowball: $${Math.abs(snowballInterest - avalancheInterest).toLocaleString()}`, 25, yPosition);
  yPosition += 15;

  // Recommended strategy
  const recommended = avalancheInterest < snowballInterest ? 'Avalanche' : 'Snowball';
  const savings = Math.abs(snowballInterest - avalancheInterest);
  
  pdf.setFillColor(255, 249, 196);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
  
  pdf.setTextColor('#F57F17');
  pdf.setFontSize(12);
  pdf.text(`💡 Recommended: ${recommended} Method`, 20, yPosition + 5);
  yPosition += 12;
  
  pdf.setTextColor('#000000');
  pdf.setFontSize(10);
  if (savings > 0) {
    pdf.text(`This could save you $${savings.toLocaleString()} in interest payments!`, 20, yPosition + 5);
  }
  yPosition += 20;

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
  }

  // The Widow's Wealth Cycle™ Framework
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
  
  pdf.setTextColor('#2E7D32');
  pdf.setFontSize(14);
  pdf.text('The Widow\'s Wealth Cycle™ - Your 6-Step Journey', 20, yPosition + 5);
  yPosition += 25;

  const steps = [
    '1. INVENTORY - "What do you have in your house?" - Identify your resources',
    '2. INSTRUCTION - Borrow with purpose, not consumption',
    '3. IMPLEMENTATION - Shut the door and pour - Execute with focus',
    '4. INCREASE - Let it flow until it stops - Scale what works',
    '5. INCOME - Sell the oil - Monetize your efforts',
    '6. IMPACT - Pay off & live on the rest - Create generational wealth'
  ];

  pdf.setTextColor('#000000');
  pdf.setFontSize(10);
  
  steps.forEach((step) => {
    yPosition = addText(step, 20, yPosition, pageWidth - 40, 10);
    yPosition += 5;
  });

  yPosition += 10;

  // Biblical encouragement section
  pdf.setFillColor(255, 249, 196);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
  
  pdf.setTextColor('#2E7D32');
  pdf.setFontSize(12);
  pdf.text('Words of Encouragement', 20, yPosition + 5);
  yPosition += 15;

  pdf.setTextColor('#000000');
  pdf.setFontSize(10);
  const finalEncouragement = `"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future." - Jeremiah 29:11

Remember, this journey isn't just about paying off debt - it's about building a legacy that honors God and blesses generations. Stay faithful to the process, trust in His provision, and celebrate each milestone along the way.`;

  yPosition = addText(finalEncouragement, 20, yPosition, pageWidth - 40, 10);
  yPosition += 20;

  // Footer
  pdf.setFillColor(76, 175, 80);
  pdf.rect(0, pageHeight - 30, pageWidth, 30, 'F');
  
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(10);
  pdf.text('Legacy Mindset Solutions - Harmony in Finance, Harmony in Life', 20, pageHeight - 15);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 5);
  
  pdf.setTextColor('#B8E6B8');
  pdf.text('www.legacymindsetsolutions.com', pageWidth - 80, pageHeight - 15);

  // Save the PDF
  const fileName = `Pour-Payoff-Plan-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
};
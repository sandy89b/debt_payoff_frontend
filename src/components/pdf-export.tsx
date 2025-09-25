import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, User } from 'lucide-react';
import { generateDebtPayoffPDF } from '@/utils/pdfGenerator';
import { Debt } from './debt-calculator/DebtEntry';
import { useToast } from '@/hooks/use-toast';

interface PDFExportProps {
  debts: Debt[];
  extraPayment: number;
  calculationResults: {
    snowball: any;
    avalanche: any;
  } | null;
}

export const PDFExport: React.FC<PDFExportProps> = ({
  debts,
  extraPayment,
  calculationResults
}) => {
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGeneratePDF = () => {
    if (!calculationResults) {
      toast({
        title: "No calculation results",
        description: "Please calculate your debt payoff strategies first.",
        variant: "destructive"
      });
      return;
    }

    const validDebts = debts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length === 0) {
      toast({
        title: "No valid debts",
        description: "Please add valid debt information before generating the report.",
        variant: "destructive"
      });
      return;
    }

    try {
      generateDebtPayoffPDF({
        debts: validDebts,
        extraPayment,
        snowballResult: calculationResults.snowball,
        avalancheResult: calculationResults.avalanche,
        userName: userName || 'Friend'
      });

      toast({
        title: "PDF Generated Successfully!",
        description: "Your personalized debt payoff plan has been downloaded.",
        variant: "success",
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "Something went wrong while creating your report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canGeneratePDF = calculationResults && debts.some(debt => 
    debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
  );

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Your Personalized Report
        </CardTitle>
        <p className="text-muted-foreground">
          Generate a beautiful PDF report with your debt payoff plan and biblical encouragement
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* PDF Preview/Features */}
          <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed">
            <h4 className="font-semibold mb-3">Your report will include:</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Complete debt summary
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Snowball vs Avalanche comparison
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                The Widow's Wealth Cycle™ framework
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Biblical encouragement & verses
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Personalized timeline to freedom
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Legacy Mindset branding
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-gradient-primary hover:opacity-90 touch-target"
                disabled={!canGeneratePDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Your PDF Report
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Personalize Your Report
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Your Name (Optional)
                  </Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name for personalization"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will personalize the greeting in your report
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGeneratePDF}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {!canGeneratePDF && (
            <p className="text-sm text-muted-foreground text-center">
              Add your debts and calculate your payoff strategies to generate a report
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
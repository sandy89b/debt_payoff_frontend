import React, { useState } from 'react';
import { Upload, Plus, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EnhancedDebt } from './EnhancedDebtEntry';

interface DebtImportToolsProps {
  onImportDebts: (debts: EnhancedDebt[]) => void;
}

export const DebtImportTools: React.FC<DebtImportToolsProps> = ({ onImportDebts }) => {
  const { toast } = useToast();
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // CSV Import Handler
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const importedDebts: EnhancedDebt[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length >= 4) {
            const debt: EnhancedDebt = {
              id: Date.now().toString() + i,
              name: values[0] || `Imported Debt ${i}`,
              balance: parseFloat(values[1]) || 0,
              minPayment: parseFloat(values[2]) || 0,
              interestRate: parseFloat(values[3]) || 0,
              dueDate: parseInt(values[4]) || 15,
              debtType: values[5]?.toLowerCase().replace(' ', '_') || 'other',
              description: values[6] || '',
              originalBalance: parseFloat(values[1]) || 0
            };
            
            // Basic validation
            if (debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0) {
              importedDebts.push(debt);
            }
          }
        }
        
        if (importedDebts.length > 0) {
          onImportDebts(importedDebts);
          toast({
            title: "✅ Import Successful",
            description: `Imported ${importedDebts.length} debts from CSV file`,
            variant: "success",
          });
        } else {
          throw new Error('No valid debts found in CSV file');
        }
        
      } catch (error) {
        toast({
          title: "Import Error",
          description: error instanceof Error ? error.message : "Failed to import CSV file",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        // Reset file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "File Error",
        description: "Could not read the selected file",
        variant: "destructive",
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  // Bulk Entry Handler
  const processBulkEntry = () => {
    if (!bulkText.trim()) {
      toast({
        title: "No Data",
        description: "Please enter debt information to import",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = bulkText.split('\n').filter(line => line.trim());
      const newDebts: EnhancedDebt[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length >= 4) {
          const debt: EnhancedDebt = {
            id: Date.now().toString() + index,
            name: parts[0] || `Debt ${index + 1}`,
            balance: parseFloat(parts[1]) || 0,
            minPayment: parseFloat(parts[2]) || 0,
            interestRate: parseFloat(parts[3]) || 0,
            dueDate: parseInt(parts[4]) || 15,
            debtType: parts[5]?.toLowerCase().replace(' ', '_') || 'other',
            description: parts[6] || '',
            originalBalance: parseFloat(parts[1]) || 0
          };
          
          // Basic validation
          if (debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0) {
            newDebts.push(debt);
          }
        }
      });
      
      if (newDebts.length > 0) {
        onImportDebts(newDebts);
        setBulkText('');
        setShowBulkModal(false);
        toast({
          title: "✅ Bulk Entry Complete",
          description: `Added ${newDebts.length} debts successfully`,
        });
      } else {
        throw new Error('No valid debts found in the entered data');
      }
      
    } catch (error) {
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process bulk entry",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download CSV Template
  const downloadTemplate = () => {
    const template = `Debt Name,Balance,Min Payment,Interest Rate,Due Date,Debt Type,Description
Chase Freedom,5000.00,150.00,18.99,15,credit_card,Main credit card
Student Loan,25000.00,300.00,6.50,1,student_loan,Federal student loan
Car Payment,15000.00,350.00,4.99,28,auto_loan,2020 Honda Civic`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debt-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template saved to your downloads folder",
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* CSV Import Button */}
      <Button 
        variant="outline" 
        onClick={() => document.getElementById('csv-import')?.click()}
        disabled={isProcessing}
        className="flex items-center gap-2"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Import CSV
      </Button>
      
      <input
        id="csv-import"
        type="file"
        accept=".csv,.txt"
        onChange={handleCSVImport}
        className="hidden"
      />

      {/* Bulk Entry Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Bulk Entry
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bulk Debt Entry
            </DialogTitle>
            <DialogDescription>
              Enter multiple debts at once, one per line. Use commas to separate the fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Format Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Format:</h4>
              <code className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
                Name, Balance, Min Payment, Interest Rate, Due Date, Type, Description
              </code>
              
              <div className="mt-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Example:</p>
                <div className="font-mono text-xs bg-blue-100 p-2 rounded">
                  Credit Card 1, 5000, 150, 18.99, 15, credit_card, Main card<br/>
                  Student Loan, 25000, 300, 6.5, 1, student_loan, Federal loan
                </div>
              </div>
            </div>

            {/* Text Area */}
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Credit Card 1, 5000, 150, 18.99, 15, credit_card, Main credit card&#10;Student Loan, 25000, 300, 6.5, 1, student_loan, Federal student loan&#10;Auto Loan, 15000, 350, 4.99, 28, auto_loan, 2020 Honda Civic"
              rows={8}
              className="font-mono text-sm"
            />
            
            {/* Preview */}
            {bulkText && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview: {bulkText.split('\n').filter(line => line.trim()).length} debts detected
                </p>
                <div className="text-xs text-gray-600">
                  {bulkText.split('\n').slice(0, 3).map((line, i) => (
                    <div key={i} className="truncate">
                      {line.trim() && `${i + 1}. ${line.split(',')[0]?.trim() || 'Unnamed'} - $${line.split(',')[1]?.trim() || '0'}`}
                    </div>
                  ))}
                  {bulkText.split('\n').filter(line => line.trim()).length > 3 && (
                    <div className="text-gray-500">... and more</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={processBulkEntry}
              disabled={!bulkText.trim() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Add All Debts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Template Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={downloadTemplate}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Download className="h-4 w-4 mr-1" />
        CSV Template
      </Button>
    </div>
  );
};

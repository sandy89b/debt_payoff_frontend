import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { EnhancedDebt } from './EnhancedDebtEntry';

interface MarkPaidOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  debt: EnhancedDebt;
  isLoading?: boolean;
}

export const MarkPaidOffModal: React.FC<MarkPaidOffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  debt,
  isLoading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Mark Debt as Paid Off
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Debt Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">{debt.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Current Balance</p>
                  <p className="font-semibold text-lg text-red-600">
                    {formatCurrency(debt.balance)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Paid Off Date</p>
                  <p className="font-semibold">
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>

            {debt.originalBalance && debt.originalBalance > debt.balance && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Original Balance:</span>
                  <span className="font-medium">{formatCurrency(debt.originalBalance)}</span>
                </div>
                <div className="flex justify-between text-sm text-purple-600">
                  <span>Amount Paid Off:</span>
                  <span className="font-semibold">
                    {formatCurrency(debt.originalBalance - debt.balance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">
                Are you sure you want to mark this debt as paid off?
              </p>
              <ul className="text-amber-700 space-y-1">
                <li>• The debt balance will be set to $0.00</li>
                <li>• The debt will become read-only</li>
                <li>• You'll receive a celebration email</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Marking as Paid Off...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, Mark as Paid Off
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarkPaidOffModal;


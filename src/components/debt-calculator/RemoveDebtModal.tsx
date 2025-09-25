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
import { Trash2, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { EnhancedDebt } from './EnhancedDebtEntry';

interface RemoveDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  debt: EnhancedDebt;
  isLoading?: boolean;
}

export const RemoveDebtModal: React.FC<RemoveDebtModalProps> = ({
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

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Remove Debt
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
                  <p className="text-gray-500">Min Payment</p>
                  <p className="font-semibold">
                    {formatCurrency(debt.minPayment)}
                  </p>
                </div>
              </div>
            </div>

            {debt.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Description:</p>
                <p className="text-gray-700 text-sm">{debt.description}</p>
              </div>
            )}

            {debt.dueDate && (
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-medium">Day {debt.dueDate} of each month</span>
                </div>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 mb-2">
                Are you sure you want to remove this debt?
              </p>
              <ul className="text-red-700 space-y-1">
                <li>• All debt information will be permanently deleted</li>
                <li>• Payment history and progress will be lost</li>
                <li>• This debt will be removed from all calculations</li>
                <li>• You cannot recover this data once deleted</li>
              </ul>
              
              {debt.balance > 0 && (
                <div className="mt-3 p-2 bg-red-100 rounded border-l-4 border-red-400">
                  <p className="font-medium text-red-800">
                    ⚠️ This debt still has a balance of {formatCurrency(debt.balance)}
                  </p>
                  <p className="text-red-700 text-xs mt-1">
                    Consider marking it as paid off instead if you've actually paid it.
                  </p>
                </div>
              )}
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
            variant="destructive"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Remove Debt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveDebtModal;


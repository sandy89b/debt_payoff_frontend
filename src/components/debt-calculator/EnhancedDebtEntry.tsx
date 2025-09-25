import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, Tag, AlertCircle, CheckCircle, DollarSign, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MarkPaidOffModal } from './MarkPaidOffModal';
import { RemoveDebtModal } from './RemoveDebtModal';

export interface EnhancedDebt {
  id: string;
  name: string;
  balance: number;
  minPayment: number;
  interestRate: number;
  dueDate: number;           // NEW: Payment due date (1-31)
  debtType: string;          // NEW: Debt category
  description?: string;      // NEW: Optional detailed description
  isPaidOff?: boolean;       // For email automation
  paidOffDate?: string;      // For tracking
  originalBalance?: number;  // For progress tracking
  debtStatus?: string;       // NEW: Debt status ('active', 'paid_off', 'archived')
  isNew?: boolean;           // Flag for new unsaved debts
}

interface EnhancedDebtEntryProps {
  debt: EnhancedDebt;
  onUpdate: (debt: EnhancedDebt) => void;
  onRemove: (id: string) => void;
  onSave?: (debt: EnhancedDebt) => void;
  onMarkPaidOff?: (debt: EnhancedDebt) => void;
  onRecordPayment?: (debtId: string, amount: number, notes?: string) => Promise<any>;
  onFetchPaymentHistory?: (debtId: string) => Promise<Array<{ id: number; previousBalance: number; newBalance: number; paymentAmount: number; changeType: string; notes?: string | null; createdAt: string }>>;
  isFirst?: boolean;
}

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'student_loan', label: 'Student Loan', icon: '🎓' },
  { value: 'auto_loan', label: 'Auto Loan', icon: '🚗' },
  { value: 'mortgage', label: 'Mortgage', icon: '🏠' },
  { value: 'personal_loan', label: 'Personal Loan', icon: '💰' },
  { value: 'medical_debt', label: 'Medical Debt', icon: '🏥' },
  { value: 'business_loan', label: 'Business Loan', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '📄' }
];

export const EnhancedDebtEntry: React.FC<EnhancedDebtEntryProps> = ({ 
  debt, 
  onUpdate, 
  onRemove, 
  onSave,
  onMarkPaidOff,
  onRecordPayment,
  onFetchPaymentHistory,
  isFirst = false 
}) => {
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showMarkPaidOffModal, setShowMarkPaidOffModal] = useState(false);
  const [isMarkingPaidOff, setIsMarkingPaidOff] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<Array<{ id: number; previousBalance: number; newBalance: number; paymentAmount: number; changeType: string; notes?: string | null; createdAt: string }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Check if debt is paid off (read-only mode)
  const isPaidOff = debt.debtStatus === 'paid_off';
  const isReadOnly = isPaidOff;

  // Validate all fields when component mounts
  useEffect(() => {
    const validateAllFields = () => {
      const errors: Record<string, string> = {};
      
      // Only validate if this is a new debt with actual data
      if (debt.isNew) {
        // Name validation
        if (!debt.name || debt.name.toString().trim().length < 2) {
          errors.name = 'Debt name must be at least 2 characters';
        }
        
        // Balance validation  
        if (!debt.balance || debt.balance <= 0) {
          errors.balance = 'Balance must be greater than $0';
        }
        
        // Min payment validation
        if (!debt.minPayment || debt.minPayment <= 0) {
          errors.minPayment = 'Minimum payment must be greater than $0';
        }
        
        // Interest rate validation
        if (debt.interestRate < 0) {
          errors.interestRate = 'Interest rate cannot be negative';
        }
        
        // Due date validation
        if (!debt.dueDate || debt.dueDate < 1 || debt.dueDate > 31) {
          errors.dueDate = 'Due date must be between 1-31';
        }
      }
      
      setValidationErrors(errors);
    };
    
    validateAllFields();
  }, []); // Only run on mount

  const validateField = (field: keyof EnhancedDebt, value: any): string => {
    switch (field) {
      case 'name':
        if (!value || value.toString().trim().length < 2) return 'Debt name must be at least 2 characters';
        if (value.toString().length > 50) return 'Debt name must be less than 50 characters';
        break;
      case 'balance':
        const balance = parseFloat(value);
        if (isNaN(balance) || balance <= 0) return 'Balance must be greater than $0';
        if (balance > 10000000) return 'Balance seems unrealistic (max $10M)';
        break;
      case 'minPayment':
        const minPayment = parseFloat(value);
        if (isNaN(minPayment) || minPayment <= 0) return 'Minimum payment must be greater than $0';
        if (minPayment > debt.balance) return 'Minimum payment cannot exceed balance';
        break;
      case 'interestRate':
        const rate = parseFloat(value);
        if (isNaN(rate) || rate < 0) return 'Interest rate cannot be negative';
        if (rate > 50) return 'Interest rate seems unrealistic (max 50%)';
        break;
      case 'dueDate':
        const dueDate = parseInt(value);
        if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) return 'Due date must be between 1-31';
        break;
    }
    return '';
  };

  const handleChange = (field: keyof EnhancedDebt, value: string | number) => {
    const error = validateField(field, value);
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field]; // Remove error if field is now valid
      }
      return newErrors;
    });

    onUpdate({
      ...debt,
      [field]: value
    });

    // Only show toast for errors, not when fields become valid
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
    }
  };

  const selectedDebtType = DEBT_TYPES.find(type => type.value === debt.debtType);

  // Modal handlers
  const handleMarkPaidOffClick = () => {
    setShowMarkPaidOffModal(true);
  };

  const handleMarkPaidOffConfirm = async () => {
    if (!onMarkPaidOff) return;
    
    setIsMarkingPaidOff(true);
    try {
      await onMarkPaidOff(debt);
      setShowMarkPaidOffModal(false);
      
      toast({
        title: "🎉 Congratulations!",
        description: `${debt.name} has been marked as paid off! You should receive a celebration email shortly.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark debt as paid off. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingPaidOff(false);
    }
  };

  const handleMarkPaidOffCancel = () => {
    setShowMarkPaidOffModal(false);
  };

  // Remove modal handlers
  const handleRemoveClick = () => {
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!onRemove) return;
    
    setIsRemoving(true);
    try {
      await onRemove(debt.id);
      setShowRemoveModal(false);
      
      toast({
        title: "Debt Removed",
        description: `${debt.name} has been successfully removed from your debt list.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove debt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveCancel = () => {
    setShowRemoveModal(false);
  };

  const loadPaymentHistory = async () => {
    if (!onFetchPaymentHistory || debt.isNew) return;
    try {
      setIsLoadingHistory(true);
      const history = await onFetchPaymentHistory(debt.id);
      setPaymentHistory(history);
    } catch (error) {
      // optional toast suppressed for brevity
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debt.id]);

  const submitPayment = async () => {
    if (!onRecordPayment) return;
    if (debt.isNew) {
      toast({ title: 'Save Debt First', description: 'Please save this debt before recording a payment.', variant: 'destructive' });
      return;
    }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: 'Invalid Amount', description: 'Enter a payment amount greater than 0.', variant: 'destructive' });
      return;
    }
    setIsSubmittingPayment(true);
    try {
      const updated = await onRecordPayment(debt.id, amt, paymentNotes || '');
      onUpdate({ ...debt, balance: updated.balance, isPaidOff: updated.debtStatus === 'paid_off', debtStatus: updated.debtStatus });
      setPaymentAmount('');
      setPaymentNotes('');
      toast({ title: 'Payment Recorded', description: `Applied $${amt.toFixed(2)} to ${debt.name}.` });
      await loadPaymentHistory();
    } catch (error: any) {
      toast({ title: 'Payment Failed', description: error?.message || 'Could not record payment.', variant: 'destructive' });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <Card className={`bg-card shadow-card animate-fade-in transition-all duration-200 ${
      isFirst ? 'ring-2 ring-primary/20' : ''
    } ${
      isPaidOff ? 'border border-border' : 'border border-border'
    }`}>
      <CardContent className="p-6">
        {/* Row 1: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor={`debt-name-${debt.id}`} className="text-sm font-medium text-foreground flex items-center gap-1">
              Debt Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`debt-name-${debt.id}`}
              value={debt.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Chase Freedom Credit Card"
              disabled={isReadOnly} 
              readOnly={isReadOnly}
              className={`mt-1 ${validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.name}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`debt-type-${debt.id}`} className="text-sm font-medium text-foreground flex items-center gap-1">
              Debt Type <span className="text-red-500">*</span>
            </Label>
            <Select value={debt.debtType} onValueChange={(value) => handleChange('debtType', value)} disabled={isReadOnly}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select debt type">
                  {selectedDebtType && (
                    <div className="flex items-center gap-2">
                      <span>{selectedDebtType.icon}</span>
                      {selectedDebtType.label}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DEBT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor={`debt-balance-${debt.id}`} className="text-sm font-medium text-foreground flex items-center gap-1">
              Current Balance <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={`debt-balance-${debt.id}`}
                type="number"
                step="0.01"
                min="0"
                value={debt.balance || ''}
                onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
                placeholder="5000.00"
                disabled={isReadOnly}
                readOnly={isReadOnly}
                className={`mt-1 pl-9 ${validationErrors.balance ? 'border-red-500 focus:border-red-500' : ''}`}
              />
            </div>
            {validationErrors.balance && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.balance}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`debt-payment-${debt.id}`} className="text-sm font-medium text-foreground flex items-center gap-1">
              Min Payment <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={`debt-payment-${debt.id}`}
                type="number"
                step="0.01"
                min="0"
                value={debt.minPayment || ''}
                onChange={(e) => handleChange('minPayment', parseFloat(e.target.value) || 0)}
                placeholder="150.00"
                disabled={isReadOnly}
                readOnly={isReadOnly}
                className={`mt-1 pl-9 ${validationErrors.minPayment ? 'border-red-500 focus:border-red-500' : ''}`}
              />
            </div>
            {validationErrors.minPayment && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.minPayment}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`debt-rate-${debt.id}`} className="text-sm font-medium text-foreground flex items-center gap-1">
              Interest Rate (%) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">%</span>
              <Input
                id={`debt-rate-${debt.id}`}
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={debt.interestRate || ''}
                onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
                placeholder="18.99"
                disabled={isReadOnly}
                readOnly={isReadOnly}
                className={`mt-1 pr-8 ${validationErrors.interestRate ? 'border-red-500 focus:border-red-500' : ''}`}
              />
            </div>
            {validationErrors.interestRate && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.interestRate}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Due Date & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor={`debt-due-${debt.id}`} className="text-sm font-medium text-foreground flex items-center gap-1">
              Payment Due Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={`debt-due-${debt.id}`}
                type="number"
                min="1"
                max="31"
                value={debt.dueDate || ''}
                onChange={(e) => handleChange('dueDate', parseInt(e.target.value) || 1)}
                placeholder="15"
                disabled={isReadOnly}
                readOnly={isReadOnly}
                className={`mt-1 pl-9 ${validationErrors.dueDate ? 'border-red-500 focus:border-red-500' : ''}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Day of month (1-31)</p>
            {validationErrors.dueDate && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.dueDate}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor={`debt-desc-${debt.id}`} className="text-sm font-medium text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id={`debt-desc-${debt.id}`}
              value={debt.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional notes about this debt..."
              className="mt-1 resize-none"
              rows={2}
              maxLength={200}
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(debt.description || '').length}/200 characters
            </p>
          </div>
        </div>

        {/* Validation Summary & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Validation Status */}
          <div className="flex items-center gap-2 text-sm">
            {Object.keys(validationErrors).length === 0 ? (
              <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full dark:text-emerald-300 dark:bg-emerald-900/20">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Valid</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{Object.keys(validationErrors).length} error(s)</span>
                </div>
                {/* Debug: Show specific validation errors */}
                <div className="text-xs text-red-600 space-y-1 bg-red-50 p-2 rounded">
                  <div className="font-semibold">Validation Issues:</div>
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <div key={field} className="flex gap-2">
                      <span className="font-medium capitalize">{field}:</span>
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Show action buttons only for active debts */}
            {!isPaidOff && (
              <>
                {onSave && debt.isNew && (
                  <Button
                    onClick={() => onSave(debt)}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    disabled={Object.keys(validationErrors).length > 0}
                    title={Object.keys(validationErrors).length > 0 ? 
                      `Please fix ${Object.keys(validationErrors).length} validation error(s) first` : 
                      'Save this debt to the database'}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Debt
                    {Object.keys(validationErrors).length > 0 && (
                      <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1">
                        {Object.keys(validationErrors).length}
                      </span>
                    )}
                  </Button>
                )}
                {onMarkPaidOff && !debt.isNew && debt.balance > 0 && (
                  <Button
                    onClick={handleMarkPaidOffClick}
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Paid Off
                  </Button>
                )}
                {!isFirst && (
                  <Button
                    onClick={handleRemoveClick}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </>
            )}
            
            {/* Show paid-off status for completed debts */}
            {isPaidOff && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">PAID OFF</span>
                {debt.paidOffDate && (
                  <span className="text-sm text-gray-500">
                    on {new Date(debt.paidOffDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        {isFirst && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 text-blue-700 text-sm">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                <AlertCircle className="h-3 w-3" />
              </div>
              <div>
                <p className="font-medium mb-1">💡 Pro Tips:</p>
                <ul className="text-xs space-y-1 ml-2">
                  <li>• Enter your <strong>exact current balance</strong> for accurate calculations</li>
                  <li>• Use your <strong>minimum required payment</strong>, not what you usually pay</li>
                  <li>• Find your APR on your statement or call your lender</li>
                  <li>• Set due date to help with payment scheduling</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardContent className="pt-0">
        {/* Payment Entry */}
        {!isPaidOff && (
          <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <Label htmlFor={`payment-amount-${debt.id}`}>Record Payment</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id={`payment-amount-${debt.id}`} type="number" step="0.01" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="e.g., 200.00" className="pl-9" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label htmlFor={`payment-notes-${debt.id}`}>Notes (optional)</Label>
                <Input id={`payment-notes-${debt.id}`} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="e.g., Extra payment" />
              </div>
              <div className="md:col-span-1">
                <Button onClick={submitPayment} disabled={isSubmittingPayment} className="w-full">
                  {isSubmittingPayment ? 'Recording...' : 'Apply Payment'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">Payment History</h4>
            <Button variant="outline" size="sm" onClick={loadPaymentHistory} disabled={isLoadingHistory}>Refresh</Button>
          </div>
          {paymentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <div className="space-y-2">
              {paymentHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm p-2 border border-border rounded">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{item.changeType === 'payment' ? 'Payment' : item.changeType}</span>
                    <span className="text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${(item.paymentAmount || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground">{item.previousBalance?.toLocaleString()} → {item.newBalance?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Mark Paid Off Confirmation Modal */}
      <MarkPaidOffModal
        isOpen={showMarkPaidOffModal}
        onClose={handleMarkPaidOffCancel}
        onConfirm={handleMarkPaidOffConfirm}
        debt={debt}
        isLoading={isMarkingPaidOff}
      />

      {/* Remove Debt Confirmation Modal */}
      <RemoveDebtModal
        isOpen={showRemoveModal}
        onClose={handleRemoveCancel}
        onConfirm={handleRemoveConfirm}
        debt={debt}
        isLoading={isRemoving}
      />
    </Card>
  );
};

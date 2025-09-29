import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PressButton as Button } from "@/components/ui/PressButton";
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download, 
  Calendar as CalendarIcon, 
  FileText, 
  Mail,
  ExternalLink,
  Copy
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Debt } from '../debt-calculator/DebtEntry';

interface ExportProps {
  debts: Debt[];
  extraPayment?: number;
}

export const Export: React.FC<ExportProps> = ({ debts, extraPayment = 0 }) => {
  const [exportFormat, setExportFormat] = useState<'ics' | 'csv' | 'google' | 'outlook'>('ics');
  const [exportType, setExportType] = useState<'payments' | 'goals' | 'all'>('payments');
  const { toast } = useToast();

  const generatePaymentSchedule = () => {
    const schedule: Array<{
      date: Date;
      debtName: string;
      amount: number;
      type: 'minimum' | 'extra' | 'payoff';
      balance: number;
    }> = [];

    debts.forEach((debt) => {
      if (!debt.balance || !debt.minPayment) return;

      let balance = debt.balance;
      let currentDate = new Date();
      let monthCount = 0;

      while (balance > 0 && monthCount < 360) {
        const payment = Math.min(debt.minPayment + extraPayment, balance);
        
        schedule.push({
          date: new Date(currentDate),
          debtName: debt.name || `Debt ${debt.id}`,
          amount: payment,
          type: balance <= payment ? 'payoff' : 'minimum',
          balance: Math.max(0, balance - payment)
        });

        balance -= payment;
        currentDate = addMonths(currentDate, 1);
        monthCount++;
      }
    });

    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const generateICSContent = () => {
    const schedule = generatePaymentSchedule();
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Debt Calculator//Payment Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    schedule.forEach((payment, index) => {
      const startDate = format(payment.date, 'yyyyMMdd');
      const uid = `payment-${index}-${Date.now()}`;
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `SUMMARY:${payment.debtName} Payment - $${payment.amount.toFixed(2)}`,
        `DESCRIPTION:Payment for ${payment.debtName}\\nAmount: $${payment.amount.toFixed(2)}\\nRemaining Balance: $${payment.balance.toFixed(2)}\\nType: ${payment.type}`,
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Payment Reminder',
        'END:VALARM',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\\n');
  };

  const generateCSVContent = () => {
    const schedule = generatePaymentSchedule();
    
    const headers = ['Date', 'Debt Name', 'Payment Amount', 'Type', 'Remaining Balance'];
    const rows = schedule.map(payment => [
      format(payment.date, 'yyyy-MM-dd'),
      payment.debtName,
      payment.amount.toFixed(2),
      payment.type,
      payment.balance.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    
    switch (exportFormat) {
      case 'ics':
        const icsContent = generateICSContent();
        downloadFile(icsContent, `payment-schedule-${timestamp}.ics`, 'text/calendar');
        toast({ title: 'Calendar exported successfully', description: 'ICS file downloaded' });
        break;
        
      case 'csv':
        const csvContent = generateCSVContent();
        downloadFile(csvContent, `payment-schedule-${timestamp}.csv`, 'text/csv');
        toast({ title: 'Schedule exported successfully', description: 'CSV file downloaded' });
        break;
        
      case 'google':
        const googleCalendarUrl = createGoogleCalendarUrl();
        window.open(googleCalendarUrl, '_blank');
        toast({ title: 'Opening Google Calendar', description: 'Add events manually from the opened link' });
        break;
        
      case 'outlook':
        const outlookUrl = createOutlookUrl();
        window.open(outlookUrl, '_blank');
        toast({ title: 'Opening Outlook Calendar', description: 'Add events manually from the opened link' });
        break;
    }
  };

  const createGoogleCalendarUrl = () => {
    const schedule = generatePaymentSchedule();
    const firstPayment = schedule[0];
    
    if (!firstPayment) return 'https://calendar.google.com';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${firstPayment.debtName} Payment`,
      dates: `${format(firstPayment.date, 'yyyyMMdd')}/${format(firstPayment.date, 'yyyyMMdd')}`,
      details: `Payment amount: $${firstPayment.amount.toFixed(2)}\\nDebt: ${firstPayment.debtName}\\nRemaining balance: $${firstPayment.balance.toFixed(2)}`,
      recur: 'RRULE:FREQ=MONTHLY;COUNT=12'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const createOutlookUrl = () => {
    const schedule = generatePaymentSchedule();
    const firstPayment = schedule[0];
    
    if (!firstPayment) return 'https://outlook.live.com/calendar';
    
    const params = new URLSearchParams({
      subject: `${firstPayment.debtName} Payment`,
      startdt: format(firstPayment.date, 'yyyy-MM-dd'),
      enddt: format(firstPayment.date, 'yyyy-MM-dd'),
      body: `Payment amount: $${firstPayment.amount.toFixed(2)}\\nDebt: ${firstPayment.debtName}\\nRemaining balance: $${firstPayment.balance.toFixed(2)}`,
      allday: 'true'
    });
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const copyScheduleToClipboard = async () => {
    const schedule = generatePaymentSchedule();
    const text = schedule.map(payment => 
      `${format(payment.date, 'MMM d, yyyy')} - ${payment.debtName}: $${payment.amount.toFixed(2)}`
    ).join('\\n');
    
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Schedule copied to clipboard', description: 'You can paste it anywhere' });
    } catch (err) {
      toast({ title: 'Failed to copy', description: 'Please try again', variant: 'destructive' });
    }
  };

  const schedule = generatePaymentSchedule();
  const totalPayments = schedule.length;
  const totalAmount = schedule.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Clear Hierarchy */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Export Payment Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Export your payment schedule to external calendars and apps
          </p>
        </div>

        {/* Export Options */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Export Format
                </label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ics">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                        <span>ICS Calendar File</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>CSV Spreadsheet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="google">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-purple-600" />
                        <span>Google Calendar</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="outlook">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-orange-600" />
                        <span>Outlook Calendar</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content Type
                </label>
                <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payments">Payment Schedule</SelectItem>
                    <SelectItem value="goals">Goal Deadlines</SelectItem>
                    <SelectItem value="all">Everything</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleExport} className="flex-1 h-12 text-base font-medium">
                <Download className="h-5 w-5 mr-2" />
                Export Schedule
              </Button>
              <Button variant="outline" onClick={copyScheduleToClipboard} className="h-12 px-6">
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Preview */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Schedule Preview
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {totalPayments} payments
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  Total: ${totalAmount.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No payment schedule available. Add debts to generate a schedule.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {schedule.slice(0, 10).map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{payment.debtName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(payment.date, 'MMM d, yyyy')} • {payment.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Balance: ${payment.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {schedule.length > 10 && (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                    ... and {schedule.length - 10} more payments
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Calendar Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://calendar.google.com', '_blank')}
                className="h-auto p-6 flex flex-col items-start hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ExternalLink className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Google Calendar</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                  Import ICS files or create events manually
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open('https://outlook.live.com/calendar', '_blank')}
                className="h-auto p-6 flex flex-col items-start hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Outlook Calendar</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                  Sync with Microsoft Outlook and Office 365
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
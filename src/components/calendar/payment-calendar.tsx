import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Plus, DollarSign } from 'lucide-react';
import { format, addDays, addMonths, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Debt } from '../debt-calculator/DebtEntry';

interface PaymentEvent {
  id: string;
  date: Date;
  amount: number;
  type: 'minimum' | 'extra' | 'payoff';
  debtName: string;
  description?: string;
}

interface PaymentCalendarProps {
  debts: Debt[];
  extraPayment?: number;
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  debts,
  extraPayment = 0
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [newEventDate, setNewEventDate] = useState<Date | undefined>();
  const [newEventAmount, setNewEventAmount] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Generate payment events from debts
  const generatePaymentEvents = (): PaymentEvent[] => {
    const events: PaymentEvent[] = [];
    const today = new Date();

    debts.forEach((debt) => {
      if (!debt.balance || !debt.minPayment) return;

      let balance = debt.balance;
      let currentDate = new Date(today);
      let monthCount = 0;

      while (balance > 0 && monthCount < 360) { // Max 30 years
        const payment = Math.min(debt.minPayment + (extraPayment || 0), balance);
        
        events.push({
          id: `${debt.id}-${monthCount}`,
          date: new Date(currentDate),
          amount: payment,
          type: balance <= payment ? 'payoff' : 'minimum',
          debtName: debt.name || `Debt ${debt.id}`,
          description: balance <= payment ? 'Final Payment' : 'Monthly Payment'
        });

        balance -= payment;
        currentDate = addMonths(currentDate, 1);
        monthCount++;
      }
    });

    // Return unique events only; avoid duplicating which causes duplicate keys
    return events;
  };

  const allEvents = [...generatePaymentEvents(), ...events];
  const selectedDateEvents = allEvents.filter(event => 
    selectedDate && isSameDay(event.date, selectedDate)
  );

  const addCustomEvent = () => {
    if (!newEventDate || !newEventAmount) return;

    const newEvent: PaymentEvent = {
      id: `custom-${Date.now()}`,
      date: newEventDate,
      amount: parseFloat(newEventAmount),
      type: 'extra',
      debtName: 'Extra Payment',
      description: newEventDescription || 'Custom payment'
    };

    setEvents(prev => [...prev, newEvent]);
    setNewEventDate(undefined);
    setNewEventAmount('');
    setNewEventDescription('');
  };

  const getEventColor = (type: PaymentEvent['type']) => {
    switch (type) {
      case 'minimum': return 'bg-blue-500';
      case 'extra': return 'bg-green-500';
      case 'payoff': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const modifiers = {
    hasEvents: allEvents.map(event => event.date)
  };

  const modifiersStyles = {
    hasEvents: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '50%'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Calendar</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newEventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEventDate ? format(newEventDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEventDate}
                      onSelect={setNewEventDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newEventAmount}
                  onChange={(e) => setNewEventAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Extra payment for..."
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                />
              </div>
              <Button onClick={addCustomEvent} className="w-full">
                Schedule Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="pointer-events-auto"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-3 h-3 rounded-full", getEventColor(event.type))} />
                      <div>
                        <p className="font-medium">{event.debtName}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{event.amount.toFixed(2)}</span>
                      <Badge variant={event.type === 'payoff' ? 'default' : 'secondary'}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No payments scheduled for this date
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
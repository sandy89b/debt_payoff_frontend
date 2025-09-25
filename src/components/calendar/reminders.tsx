import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Plus, Clock, Mail, Smartphone } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Debt } from '../debt-calculator/DebtEntry';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  reminderDays: number;
  enabled: boolean;
  type: 'payment' | 'goal' | 'custom';
  method: 'notification' | 'email';
  recurring: boolean;
}

interface RemindersProps {
  debts: Debt[];
}

export const Reminders: React.FC<RemindersProps> = ({ debts }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  // Auto-generate payment reminders from debts
  useEffect(() => {
    const paymentReminders: Reminder[] = debts.map(debt => ({
      id: `payment-${debt.id}`,
      title: `${debt.name || `Debt ${debt.id}`} Payment Due`,
      description: `Minimum payment: $${debt.minPayment?.toFixed(2) || '0.00'}`,
      dueDate: addDays(new Date(), 30), // Assume monthly payments
      reminderDays: 3,
      enabled: true,
      type: 'payment' as const,
      method: 'notification' as const,
      recurring: true
    }));

    setReminders(prev => {
      const customReminders = prev.filter(r => r.type === 'custom' || r.type === 'goal');
      return [...customReminders, ...paymentReminders];
    });
  }, [debts]);

  // Check for notifications permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const addCustomReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `custom-${Date.now()}`
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const checkReminders = () => {
    const today = new Date();
    const activeReminders = reminders.filter(reminder => 
      reminder.enabled && 
      isBefore(today, reminder.dueDate) &&
      addDays(today, reminder.reminderDays) >= reminder.dueDate
    );

    activeReminders.forEach(reminder => {
      if (reminder.method === 'notification' && notificationsEnabled) {
        new Notification(reminder.title, {
          body: reminder.description,
          icon: '/favicon.ico'
        });
      }
      
      toast({
        title: reminder.title,
        description: reminder.description,
      });
    });
  };

  // Check reminders on component mount and periodically
  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders, notificationsEnabled]);

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'payment': return <Clock className="h-4 w-4" />;
      case 'goal': return <Bell className="h-4 w-4" />;
      case 'custom': return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Reminder['type']) => {
    switch (type) {
      case 'payment': return 'bg-blue-500';
      case 'goal': return 'bg-green-500';
      case 'custom': return 'bg-purple-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Reminders</h1>
          <p className="text-muted-foreground">Never miss a payment deadline</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Reminder</DialogTitle>
            </DialogHeader>
            <ReminderForm onSubmit={addCustomReminder} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get desktop notifications for upcoming payments
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notificationsEnabled && (
                <Button size="sm" onClick={requestNotificationPermission}>
                  Enable
                </Button>
              )}
              <Switch 
                checked={notificationsEnabled} 
                disabled={!('Notification' in window)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reminders Set</h3>
              <p className="text-muted-foreground">
                Add debts to automatically create payment reminders
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(reminder.type)}`} />
                    <div className="flex items-center gap-2">
                      {getTypeIcon(reminder.type)}
                      <div>
                        <h4 className="font-medium">{reminder.title}</h4>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground">{reminder.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Due</p>
                      <p className="font-medium">{format(reminder.dueDate, 'MMM d, yyyy')}</p>
                    </div>
                    <Badge variant={reminder.method === 'notification' ? 'default' : 'secondary'}>
                      {reminder.method === 'notification' ? (
                        <><Smartphone className="h-3 w-3 mr-1" /> Push</>
                      ) : (
                        <><Mail className="h-3 w-3 mr-1" /> Email</>
                      )}
                    </Badge>
                    <Switch 
                      checked={reminder.enabled}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                    {reminder.type === 'custom' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const ReminderForm: React.FC<{ onSubmit: (reminder: Omit<Reminder, 'id'>) => void }> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderDays, setReminderDays] = useState('3');
  const [method, setMethod] = useState<'notification' | 'email'>('notification');
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    onSubmit({
      title,
      description,
      dueDate: new Date(dueDate),
      reminderDays: parseInt(reminderDays),
      enabled: true,
      type: 'custom',
      method,
      recurring
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
    setReminderDays('3');
    setMethod('notification');
    setRecurring(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Reminder title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Input
          placeholder="Additional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Due Date</Label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Remind me (days before)</Label>
        <Select value={reminderDays} onValueChange={setReminderDays}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 day before</SelectItem>
            <SelectItem value="3">3 days before</SelectItem>
            <SelectItem value="7">1 week before</SelectItem>
            <SelectItem value="14">2 weeks before</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Method</Label>
        <Select value={method} onValueChange={(value: 'notification' | 'email') => setMethod(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="notification">Browser Notification</SelectItem>
            <SelectItem value="email">Email (Coming Soon)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch checked={recurring} onCheckedChange={setRecurring} />
        <Label>Recurring monthly</Label>
      </div>
      <Button type="submit" className="w-full">
        Create Reminder
      </Button>
    </form>
  );
};
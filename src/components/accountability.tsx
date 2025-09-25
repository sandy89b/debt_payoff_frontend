import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Calendar,
  Trophy,
  TrendingUp,
  Heart,
  Mail,
  Phone,
  UserPlus,
  CheckCircle2,
  Clock,
  Target,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AccountabilityPartner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  since: Date;
  avatar?: string;
  isActive: boolean;
}

interface ProgressUpdate {
  id: string;
  date: Date;
  message: string;
  milestone?: string;
  amount?: number;
  celebratory: boolean;
}

export function Accountability() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<AccountabilityPartner[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      relationship: "Life Coach",
      since: new Date("2024-01-15"),
      isActive: true
    },
    {
      id: "2", 
      name: "Mike Chen",
      email: "mike.chen@email.com",
      relationship: "Friend",
      since: new Date("2024-02-01"),
      isActive: true
    }
  ]);

  const [progressUpdates] = useState<ProgressUpdate[]>([
    {
      id: "1",
      date: new Date("2024-03-15"),
      message: "Just paid off my credit card! $2,500 down, feeling so grateful! 🎉",
      milestone: "Credit Card Freedom",
      amount: 2500,
      celebratory: true
    },
    {
      id: "2",
      date: new Date("2024-03-10"),
      message: "Made an extra $300 payment this month. Every dollar counts!",
      amount: 300,
      celebratory: false
    },
    {
      id: "3",
      date: new Date("2024-03-01"),
      message: "Starting my debt freedom journey today. Praying for wisdom and discipline.",
      celebratory: false
    }
  ]);

  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: ""
  });

  const [newUpdate, setNewUpdate] = useState({
    message: "",
    milestone: "",
    amount: ""
  });

  const addPartner = () => {
    if (!newPartner.name || !newPartner.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a name and email address.",
        variant: "destructive"
      });
      return;
    }

    const partner: AccountabilityPartner = {
      id: Date.now().toString(),
      name: newPartner.name,
      email: newPartner.email,
      phone: newPartner.phone,
      relationship: newPartner.relationship || "Accountability Partner",
      since: new Date(),
      isActive: true
    };

    setPartners(prev => [...prev, partner]);
    setNewPartner({ name: "", email: "", phone: "", relationship: "" });
    
    toast({
      title: "Partner Added!",
      description: `${partner.name} has been added as your accountability partner.`
    });
  };

  const removePartner = (partnerId: string) => {
    const partnerToRemove = partners.find(p => p.id === partnerId);
    setPartners(prev => prev.filter(p => p.id !== partnerId));
    
    toast({
      title: "Partner Removed",
      description: `${partnerToRemove?.name} has been removed from your accountability partners.`
    });
  };

  const shareUpdate = () => {
    if (!newUpdate.message) {
      toast({
        title: "No Message",
        description: "Please write a message to share with your partners.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send notifications to partners
    toast({
      title: "Update Shared!",
      description: "Your progress update has been shared with your accountability partners."
    });

    setNewUpdate({ message: "", milestone: "", amount: "" });
  };

  const shareProgress = (type: "email" | "text") => {
    const totalPaid = 5300; // Mock data
    const totalDebt = 25000; // Mock data
    const percentComplete = ((totalPaid / totalDebt) * 100).toFixed(1);

    const message = `🎯 Debt Freedom Update!\n\nProgress: ${percentComplete}% complete\nTotal Paid: $${totalPaid.toLocaleString()}\nRemaining: $${(totalDebt - totalPaid).toLocaleString()}\n\nPraying for continued wisdom and strength on this journey! 💪🙏`;

    if (type === "email") {
      const subject = "My Debt Freedom Progress Update";
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.open(mailtoLink);
    } else {
      const smsLink = `sms:?body=${encodeURIComponent(message)}`;
      window.open(smsLink);
    }

    toast({
      title: "Share Link Opened",
      description: `Your ${type} app should now be open with the progress message.`
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Accountability Partners</h1>
        <p className="text-muted-foreground">
          Share your journey and stay motivated with trusted friends, family, or coaches
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Partners & Quick Share */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Partners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Partners ({partners.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={partner.avatar} />
                    <AvatarFallback>
                      {partner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{partner.name}</div>
                    <div className="text-xs text-muted-foreground">{partner.relationship}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePartner(partner.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {partners.length === 0 && (
                <div className="text-center p-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No accountability partners yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Share */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Quick Share
              </CardTitle>
              <CardDescription>
                Share your current progress instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => shareProgress("email")} 
                className="w-full" 
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
              <Button 
                onClick={() => shareProgress("text")} 
                className="w-full" 
                variant="outline"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share via Text
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Updates & Add Partner */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share New Update */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Share Progress Update
              </CardTitle>
              <CardDescription>
                Let your accountability partners know how you're doing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="milestone">Milestone (Optional)</Label>
                  <Input
                    id="milestone"
                    placeholder="e.g., 'Credit Card Paid Off'"
                    value={newUpdate.milestone}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, milestone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={newUpdate.amount}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Share your progress, challenges, or celebrations..."
                  rows={3}
                  value={newUpdate.message}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              
              <Button onClick={shareUpdate} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Update
              </Button>
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressUpdates.map((update, index) => (
                  <div key={update.id}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {update.celebratory ? (
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">
                            {update.date.toLocaleDateString()}
                          </span>
                          {update.milestone && (
                            <Badge variant="secondary" className="text-xs">
                              {update.milestone}
                            </Badge>
                          )}
                          {update.amount && (
                            <Badge variant="outline" className="text-xs">
                              ${update.amount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{update.message}</p>
                      </div>
                    </div>
                    {index < progressUpdates.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add New Partner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Accountability Partner
              </CardTitle>
              <CardDescription>
                Invite someone to support you on your debt freedom journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Name *</Label>
                  <Input
                    id="partner-name"
                    placeholder="Full name"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-email">Email *</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    placeholder="email@example.com"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-phone">Phone (Optional)</Label>
                  <Input
                    id="partner-phone"
                    placeholder="(555) 123-4567"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-relationship">Relationship</Label>
                  <Input
                    id="partner-relationship"
                    placeholder="e.g., Friend, Coach, Family"
                    value={newPartner.relationship}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, relationship: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button onClick={addPartner} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
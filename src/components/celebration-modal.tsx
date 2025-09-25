import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Sparkles, 
  PartyPopper,
  Crown,
  Medal,
  Target,
  DollarSign
} from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: {
    title: string;
    description: string;
    type: "debt_paid" | "milestone" | "achievement" | "goal_reached";
    amount?: number;
    icon?: React.ElementType;
    rarity?: "common" | "rare" | "epic" | "legendary";
  };
}

const celebrationMessages = {
  debt_paid: [
    "🎉 Debt Demolished!",
    "💪 Freedom Fighter!",
    "🔥 Debt Destroyer!",
    "⚡ Unstoppable!"
  ],
  milestone: [
    "🎯 Milestone Mastered!",
    "🚀 Progress Powerhouse!",
    "⭐ Achievement Unlocked!",
    "📈 Goal Getter!"
  ],
  achievement: [
    "🏆 Badge Earned!",
    "👑 Champion Status!",
    "💎 Elite Achiever!",
    "🌟 Superstar!"
  ],
  goal_reached: [
    "🎊 Goal Accomplished!",
    "🔥 Target Terminated!",
    "💯 Mission Complete!",
    "✨ Dream Achieved!"
  ]
};

const confettiColors = ["#f43f5e", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function CelebrationModal({ isOpen, onClose, achievement }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  useEffect(() => {
    if (isOpen && achievement) {
      setShowConfetti(true);
      const messages = celebrationMessages[achievement.type];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCelebrationMessage(randomMessage);

      // Auto-hide confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, achievement]);

  if (!isOpen || !achievement) return null;

  const IconComponent = achievement.icon || Trophy;

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary": return "from-yellow-400 to-orange-500";
      case "epic": return "from-purple-400 to-pink-500";
      case "rare": return "from-blue-400 to-cyan-500";
      default: return "from-green-400 to-blue-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                width: '8px',
                height: '8px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <Card className="max-w-md mx-auto relative overflow-hidden">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-10`} />
        
        <CardContent className="p-8 text-center relative">
          {/* Main Icon with Glow Effect */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center shadow-lg animate-pulse`}>
              <IconComponent className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -inset-2 rounded-full animate-ping opacity-75">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-20`} />
            </div>
          </div>

          {/* Celebration Message */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {celebrationMessage}
            </h2>
            {achievement.rarity && (
              <Badge 
                variant="secondary" 
                className={`mb-2 ${achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : 
                  achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}`}
              >
                <Star className="h-3 w-3 mr-1" />
                {achievement.rarity.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Achievement Details */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{achievement.title}</h3>
            <p className="text-muted-foreground mb-3">{achievement.description}</p>
            
            {achievement.amount && (
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-green-600">
                <DollarSign className="h-5 w-5" />
                {achievement.amount.toLocaleString()} {achievement.type === 'debt_paid' ? 'Paid Off' : 'Saved'}
              </div>
            )}
          </div>

          {/* Motivational Quote */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm italic text-muted-foreground">
              "Every step forward is a victory. You're building a foundation for lasting financial freedom!"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button onClick={onClose} variant="outline">
              Continue Journey
            </Button>
            <Button 
              onClick={() => {
                // Share achievement
                if (navigator.share) {
                  navigator.share({
                    title: 'Debt Freedom Achievement!',
                    text: `Just achieved: ${achievement.title}! ${achievement.description} 🎉`,
                  });
                }
                onClose();
              }}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Share Victory
            </Button>
          </div>

          {/* Floating Icons */}
          <div className="absolute top-4 left-4 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="absolute top-4 right-4 animate-bounce" style={{ animationDelay: '1s' }}>
            <Medal className="h-6 w-6 text-orange-400" />
          </div>
          <div className="absolute bottom-4 left-4 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Trophy className="h-6 w-6 text-gold-400" />
          </div>
          <div className="absolute bottom-4 right-4 animate-bounce" style={{ animationDelay: '2s' }}>
            <Crown className="h-6 w-6 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Medal, 
  Star, 
  Target, 
  Calendar,
  DollarSign,
  Flame,
  Crown,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useDebtsStorage } from "@/hooks/useDebtsStorage";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "debt" | "savings" | "consistency" | "milestone";
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

const achievementDefinitions = [
  {
    id: "first-payment",
    title: "First Step",
    description: "Make your first extra debt payment",
    icon: Target,
    category: "debt" as const,
    requirement: 1,
    rarity: "common" as const,
    points: 10
  },
  {
    id: "debt-destroyer",
    title: "Debt Destroyer",
    description: "Pay off your first debt completely",
    icon: Trophy,
    category: "debt" as const,
    requirement: 1,
    rarity: "rare" as const,
    points: 50
  },
  {
    id: "debt-free-warrior",
    title: "Debt-Free Warrior",
    description: "Pay off all your debts",
    icon: Crown,
    category: "debt" as const,
    requirement: 1,
    rarity: "legendary" as const,
    points: 500
  },
  {
    id: "emergency-saver",
    title: "Emergency Ready",
    description: "Build a $1,000 emergency fund",
    icon: ShieldCheck,
    category: "savings" as const,
    requirement: 1000,
    rarity: "rare" as const,
    points: 75
  },
  {
    id: "consistency-champion",
    title: "Consistency Champion",
    description: "Make payments for 30 consecutive days",
    icon: Flame,
    category: "consistency" as const,
    requirement: 30,
    rarity: "epic" as const,
    points: 100
  },
  {
    id: "milestone-master",
    title: "Milestone Master",
    description: "Reach 50% debt reduction",
    icon: Medal,
    category: "milestone" as const,
    requirement: 50,
    rarity: "epic" as const,
    points: 150
  },
  {
    id: "payment-perfectionist",
    title: "Payment Perfectionist",
    description: "Make 100 on-time payments",
    icon: Star,
    category: "consistency" as const,
    requirement: 100,
    rarity: "legendary" as const,
    points: 200
  },
  {
    id: "savings-superstar",
    title: "Savings Superstar",
    description: "Save $10,000 total",
    icon: DollarSign,
    category: "savings" as const,
    requirement: 10000,
    rarity: "legendary" as const,
    points: 300
  }
];

const rarityColors = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-300"
};

export function Achievements() {
  const { debts } = useDebtsStorage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  // Calculate achievement progress
  useEffect(() => {
    const calculateProgress = () => {
      const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
      const paidOffDebts = debts.filter(debt => debt.balance === 0).length;
      const totalDebts = debts.length;
      
      return achievementDefinitions.map(def => {
        let progress = 0;
        let unlocked = false;

        switch (def.id) {
          case "first-payment":
            // Mock progress - would be tracked in real app
            progress = 1;
            unlocked = true;
            break;
          case "debt-destroyer":
            progress = paidOffDebts;
            unlocked = paidOffDebts >= def.requirement;
            break;
          case "debt-free-warrior":
            progress = totalDebts > 0 ? (paidOffDebts / totalDebts) * 100 : 0;
            unlocked = paidOffDebts === totalDebts && totalDebts > 0;
            break;
          case "emergency-saver":
            // Mock emergency fund amount
            progress = 500;
            unlocked = progress >= def.requirement;
            break;
          case "consistency-champion":
            // Mock consecutive days
            progress = 15;
            unlocked = progress >= def.requirement;
            break;
          case "milestone-master":
            // Mock percentage reduction
            progress = 25;
            unlocked = progress >= def.requirement;
            break;
          case "payment-perfectionist":
            // Mock on-time payments
            progress = 45;
            unlocked = progress >= def.requirement;
            break;
          case "savings-superstar":
            // Mock total savings
            progress = 3500;
            unlocked = progress >= def.requirement;
            break;
        }

        return {
          ...def,
          progress,
          unlocked,
          unlockedAt: unlocked ? new Date() : undefined
        };
      });
    };

    const updatedAchievements = calculateProgress();
    setAchievements(updatedAchievements);
    
    const points = updatedAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(points);
  }, [debts]);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.category === "milestone" || achievement.category === "consistency") {
      return (achievement.progress / achievement.requirement) * 100;
    }
    return achievement.unlocked ? 100 : 0;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Achievements & Badges</h1>
        <p className="text-muted-foreground mb-4">
          Track your progress and unlock rewards on your debt freedom journey
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">{totalPoints} Points</div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">{unlockedAchievements.length}/{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Unlocked Achievements
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unlockedAchievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Card key={achievement.id} className="relative overflow-hidden border-2 border-primary/20">
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <Badge className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {achievement.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        +{achievement.points} points
                      </span>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-muted-foreground">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
            Locked Achievements
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedAchievements.map((achievement) => {
              const IconComponent = achievement.icon;
              const progressPercentage = getProgressPercentage(achievement);
              
              return (
                <Card key={achievement.id} className="opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconComponent className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-muted-foreground">
                          {achievement.title}
                        </CardTitle>
                        <Badge variant="outline" className={rarityColors[achievement.rarity]}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {achievement.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.requirement}
                          {achievement.category === "milestone" && "%"}
                          {achievement.category === "savings" && " saved"}
                          {achievement.category === "consistency" && " days"}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    
                    <div className="mt-3 text-sm font-medium text-muted-foreground">
                      Reward: +{achievement.points} points
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Celebration Modal would go here */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4 text-center">
            <CardContent className="p-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Achievement Unlocked!</h2>
              <p className="text-muted-foreground mb-4">
                You've earned a new badge on your debt freedom journey!
              </p>
              <Button onClick={() => setShowCelebration(null)}>
                Awesome!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
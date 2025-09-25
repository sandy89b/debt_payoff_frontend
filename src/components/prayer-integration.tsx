import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  BookOpen, 
  Star,
  Calendar,
  Clock,
  Share2,
  Copy,
  Check,
  Bookmark,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Prayer {
  id: string;
  title: string;
  category: "starting" | "struggling" | "celebrating" | "wisdom" | "gratitude" | "perseverance";
  prayer: string;
  verse?: string;
  verseText?: string;
  situation: string;
  isFavorite: boolean;
}

const prayers: Prayer[] = [
  {
    id: "1",
    title: "Starting the Journey",
    category: "starting",
    situation: "When beginning your debt freedom journey",
    prayer: "Heavenly Father, I come before You acknowledging that I need Your wisdom and strength as I begin this journey toward financial freedom. Help me to trust in Your provision and give me discipline to make wise choices with the resources You've entrusted to me. Grant me patience when the process feels slow and hope when the burden feels heavy. May this journey draw me closer to You and teach me to be a faithful steward. In Jesus' name, Amen.",
    verse: "Proverbs 16:9",
    verseText: "In their hearts humans plan their course, but the Lord establishes their steps.",
    isFavorite: false
  },
  {
    id: "2", 
    title: "When Tempted to Overspend",
    category: "struggling",
    situation: "When facing temptation to make unnecessary purchases",
    prayer: "Lord Jesus, I feel the pull of temptation to spend money I've committed to debt repayment. Help me remember that my true satisfaction comes from You, not from things. Give me strength to say no to temporary pleasures for the sake of lasting freedom. Remind me of my goals and the reasons I'm pursuing debt freedom. Fill the emptiness I'm feeling with Your presence instead of material things. Thank You for loving me enough to help me grow in self-control. Amen.",
    verse: "1 Corinthians 10:13",
    verseText: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.",
    isFavorite: false
  },
  {
    id: "3",
    title: "Celebrating a Paid-Off Debt",
    category: "celebrating", 
    situation: "When you've successfully paid off a debt",
    prayer: "Praise You, Lord! Thank You for this victory and for Your faithfulness throughout this process. I recognize that every dollar, every opportunity to earn extra income, and every moment of discipline came from Your hand. Help me to use this moment of celebration to fuel my motivation for the remaining debts. Keep my heart humble and grateful, remembering that You are the source of all provision. May this achievement encourage others who are on their own debt freedom journey. All glory to You! Amen.",
    verse: "Psalm 126:3",
    verseText: "The Lord has done great things for us, and we are filled with joy.",
    isFavorite: false
  },
  {
    id: "4",
    title: "For Financial Wisdom",
    category: "wisdom",
    situation: "When making important financial decisions",
    prayer: "Father, Your Word says that if anyone lacks wisdom, they should ask You, and You will give generously. I need Your wisdom for the financial decisions before me. Help me see clearly what choices align with Your will and my debt freedom goals. Protect me from decisions motivated by fear, pride, or impulse. Give me discernment to know when an opportunity is from You and when it's a distraction. I trust Your guidance more than my own understanding. Lead me in the path of financial wisdom. Amen.",
    verse: "James 1:5",
    verseText: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.",
    isFavorite: false
  },
  {
    id: "5",
    title: "Gratitude in Tight Times", 
    category: "gratitude",
    situation: "When money is tight but you want to maintain a grateful heart",
    prayer: "Dear God, even though money is tight right now, I choose to thank You for Your many blessings. Thank You for the roof over my head, the food on my table, and the people who love me. Help me see abundance in the non-material gifts You've given me. Teach me to find joy in simple pleasures and contentment in what I have. When I'm tempted to complain or compare my situation to others, remind me of Your faithfulness. Use this season to grow my character and deepen my trust in You. Amen.",
    verse: "1 Thessalonians 5:18",
    verseText: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
    isFavorite: false
  },
  {
    id: "6",
    title: "For Perseverance",
    category: "perseverance",
    situation: "When the debt payoff journey feels overwhelming or endless",
    prayer: "Lord, this journey feels longer and harder than I anticipated. Some days I wonder if I'll ever reach financial freedom. Strengthen my resolve and help me focus on progress, not perfection. Remind me that every payment, no matter how small, is a step toward freedom. When I feel discouraged, fill me with hope. When I want to give up, remind me of how far I've already come. Help me run this race with endurance, keeping my eyes fixed on the goal. I trust that You will see me through to victory. Amen.",
    verse: "Galatians 6:9",
    verseText: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    isFavorite: false
  }
];

const categoryColors = {
  starting: "bg-blue-100 text-blue-800",
  struggling: "bg-red-100 text-red-800", 
  celebrating: "bg-yellow-100 text-yellow-800",
  wisdom: "bg-purple-100 text-purple-800",
  gratitude: "bg-green-100 text-green-800",
  perseverance: "bg-orange-100 text-orange-800"
};

const categoryIcons = {
  starting: Star,
  struggling: Heart,
  celebrating: Star,
  wisdom: BookOpen,
  gratitude: Heart,
  perseverance: Calendar
};

export function PrayerIntegration() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useLocalStorage<string[]>("prayer-favorites", []);
  const [personalPrayers, setPersonalPrayers] = useLocalStorage<string[]>("personal-prayers", []);
  const [newPrayer, setNewPrayer] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPrayers, setExpandedPrayers] = useState<string[]>([]);
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All Prayers" },
    { value: "starting", label: "Starting Journey" },
    { value: "struggling", label: "Struggling" },
    { value: "celebrating", label: "Celebrating" },
    { value: "wisdom", label: "Seeking Wisdom" },
    { value: "gratitude", label: "Gratitude" },
    { value: "perseverance", label: "Perseverance" }
  ];

  const filteredPrayers = selectedCategory === "all" 
    ? prayers 
    : prayers.filter(prayer => prayer.category === selectedCategory);

  const toggleFavorite = (prayerId: string) => {
    setFavorites(prev => 
      prev.includes(prayerId)
        ? prev.filter(id => id !== prayerId)
        : [...prev, prayerId]
    );
  };

  const copyPrayer = async (prayer: Prayer) => {
    const text = `${prayer.title}\n\n${prayer.prayer}\n\n${prayer.verse ? `"${prayer.verseText}" - ${prayer.verse}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(prayer.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Prayer Copied",
        description: "The prayer has been copied to your clipboard."
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const sharePrayer = (prayer: Prayer) => {
    const text = `🙏 ${prayer.title}\n\n${prayer.prayer}\n\n${prayer.verse ? `"${prayer.verseText}" - ${prayer.verse}` : ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: prayer.title,
        text: text
      });
    } else {
      // Fallback to email
      const subject = `Prayer: ${prayer.title}`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      window.open(mailtoLink);
    }
  };

  const addPersonalPrayer = () => {
    if (!newPrayer.trim()) return;
    
    setPersonalPrayers(prev => [...prev, newPrayer]);
    setNewPrayer("");
    
    toast({
      title: "Prayer Added",
      description: "Your personal prayer has been saved."
    });
  };

  const togglePrayerExpansion = (prayerId: string) => {
    setExpandedPrayers(prev =>
      prev.includes(prayerId)
        ? prev.filter(id => id !== prayerId)
        : [...prev, prayerId]
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Prayer Integration</h1>
        <p className="text-muted-foreground">
          Find strength, wisdom, and peace through prayer during your debt freedom journey
        </p>
      </div>

      {/* Category Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prayer Categories</CardTitle>
          <CardDescription>Choose prayers based on your current situation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Prayers */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPrayers.map((prayer) => {
            const IconComponent = categoryIcons[prayer.category];
            const isExpanded = expandedPrayers.includes(prayer.id);
            const isFavorited = favorites.includes(prayer.id);
            const isCopied = copiedId === prayer.id;

            return (
              <Card key={prayer.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{prayer.title}</CardTitle>
                        <Badge className={categoryColors[prayer.category]} variant="secondary">
                          {prayer.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(prayer.id)}
                        className={isFavorited ? "text-yellow-500" : ""}
                      >
                        {isFavorited ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPrayer(prayer)}
                      >
                        {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sharePrayer(prayer)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardDescription className="text-sm">
                    {prayer.situation}
                  </CardDescription>
                </CardHeader>

                <Collapsible>
                  <CollapsibleTrigger 
                    className="w-full px-6 pb-2"
                    onClick={() => togglePrayerExpansion(prayer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {isExpanded ? "Hide Prayer" : "Show Prayer"}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                          <p className="text-sm leading-relaxed italic">
                            {prayer.prayer}
                          </p>
                        </div>

                        {prayer.verse && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">{prayer.verse}</p>
                            <p className="text-sm text-muted-foreground">
                              "{prayer.verseText}"
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Right Column - Favorites & Personal */}
        <div className="space-y-6">
          {/* Favorites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Favorite Prayers ({favorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="space-y-2">
                  {favorites.map(favoriteId => {
                    const prayer = prayers.find(p => p.id === favoriteId);
                    if (!prayer) return null;
                    
                    return (
                      <div key={favoriteId} className="p-2 rounded bg-muted/30">
                        <div className="font-medium text-sm">{prayer.title}</div>
                        <div className="text-xs text-muted-foreground">{prayer.situation}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No favorite prayers yet. Click the star icon on any prayer to save it here.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Add Personal Prayer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Personal Prayer
              </CardTitle>
              <CardDescription>
                Write your own prayer for your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write a personal prayer for your debt freedom journey..."
                rows={4}
                value={newPrayer}
                onChange={(e) => setNewPrayer(e.target.value)}
              />
              <Button onClick={addPersonalPrayer} className="w-full" disabled={!newPrayer.trim()}>
                <Heart className="h-4 w-4 mr-2" />
                Save Prayer
              </Button>
              
              {personalPrayers.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Separator />
                  <h4 className="font-medium text-sm">Your Prayers:</h4>
                  {personalPrayers.map((prayer, index) => (
                    <div key={index} className="p-2 rounded bg-muted/30 text-sm">
                      {prayer}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prayer Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-medium text-sm text-blue-900">Morning Prayer</div>
                  <div className="text-xs text-blue-700">Start your day seeking God's wisdom for financial decisions</div>
                </div>
                
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="font-medium text-sm text-green-900">Before Purchases</div>
                  <div className="text-xs text-green-700">Pause and pray before making any non-essential purchases</div>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="font-medium text-sm text-purple-900">Evening Gratitude</div>
                  <div className="text-xs text-purple-700">Thank God for His provision and progress made today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PressButton as Button } from "@/components/ui/PressButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Heart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";

const devotionals = [
  {
    id: 1,
    title: "God's Provision Over Worry",
    verse: "Matthew 6:26",
    verseText: "Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?",
    lesson: "Financial anxiety often stems from forgetting God's faithful provision. Just as He cares for the birds, He will provide for your needs as you trust Him.",
    application: "Today, instead of worrying about your debt, spend 5 minutes listing ways God has provided for you in the past. Use this as fuel for faith in your current situation.",
    prayer: "Father, help me trust in Your provision rather than my own understanding. Give me peace as I work diligently toward debt freedom, knowing You are faithful to supply my needs.",
    tags: ["Anxiety", "Trust", "Provision"]
  },
  {
    id: 2,
    title: "The Blessing of Hard Work",
    verse: "Proverbs 13:11",
    verseText: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow.",
    lesson: "Sustainable wealth comes through consistent, honest effort rather than get-rich-quick schemes. Every small payment toward debt is progress worth celebrating.",
    application: "Review your debt payoff plan. Celebrate the small victories and commit to steady, consistent payments rather than waiting for a windfall.",
    prayer: "Lord, give me patience and persistence in my journey to financial freedom. Help me value steady progress over quick fixes.",
    tags: ["Work", "Patience", "Integrity"]
  },
  {
    id: 3,
    title: "Contentment in All Circumstances",
    verse: "Philippians 4:12-13",
    verseText: "I know what it is to be in need, and I know what it is to have plenty. I have learned the secret of being content in any and every situation... I can do all this through him who gives me strength.",
    lesson: "True contentment isn't dependent on financial status but on our relationship with Christ. This contentment empowers us to make wise financial decisions.",
    application: "Practice gratitude today by listing 10 things you're thankful for that money can't buy. Let this cultivate contentment as you pay down debt.",
    prayer: "God, teach me to find my satisfaction in You alone. Help me live contentedly within my means as I work toward financial freedom.",
    tags: ["Contentment", "Gratitude", "Strength"]
  },
  {
    id: 4,
    title: "Wise Counsel and Planning",
    verse: "Proverbs 15:22",
    verseText: "Plans fail for lack of counsel, but with many advisers they succeed.",
    lesson: "God encourages us to seek wise counsel in all areas, including finances. Isolation in debt often leads to poor decisions, while community brings wisdom.",
    application: "Identify someone you trust who manages money well. Schedule a conversation to share your debt freedom goals and ask for their insights.",
    prayer: "Father, surround me with wise counselors who will encourage me toward good financial stewardship. Give me humility to receive their guidance.",
    tags: ["Wisdom", "Community", "Planning"]
  },
  {
    id: 5,
    title: "Breaking Free from Bondage",
    verse: "Proverbs 22:7",
    verseText: "The rich rule over the poor, and the borrower is slave to the lender.",
    lesson: "Debt creates a form of bondage that limits our freedom to follow God's calling. Working toward debt freedom is working toward the liberty Christ desires for us.",
    application: "Reflect on how debt has limited your choices. Write down three things you'll be able to do for God's kingdom once you're debt-free.",
    prayer: "Lord, You desire freedom for Your children. Help me persevere in paying off debt so I can serve You without the burden of financial bondage.",
    tags: ["Freedom", "Stewardship", "Purpose"]
  },
  {
    id: 6,
    title: "Generous Hearts, Faithful Stewards",
    verse: "2 Corinthians 9:6-7",
    verseText: "Remember this: Whoever sows sparingly will also reap sparingly, and whoever sows generously will also reap generously. Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
    lesson: "Even while paying off debt, maintaining a generous heart positions us for God's blessing. Small, cheerful giving during debt payoff develops the right heart attitude.",
    application: "Find one small way to be generous this week, even if it's just $5 or your time. Practice generosity as you work toward greater financial capacity.",
    prayer: "God, keep my heart generous even in tight financial times. Help me trust that as I honor You with my giving, You will honor my efforts toward debt freedom.",
    tags: ["Generosity", "Trust", "Blessing"]
  },
  {
    id: 7,
    title: "Discipline and Self-Control",
    verse: "1 Corinthians 9:25",
    verseText: "Everyone who competes in the games goes into strict training. They do it to get a crown that will not last, but we do it to get a crown that will last forever.",
    lesson: "Financial discipline is like athletic training - it requires sacrifice and consistency for a greater prize. The freedom on the other side of debt is worth the temporary sacrifice.",
    application: "Identify one area where you can practice more financial discipline this week. Treat it as training for the ultimate prize of financial freedom.",
    prayer: "Father, give me the self-control I need to make wise financial choices. Help me remember that temporary sacrifice leads to lasting freedom.",
    tags: ["Discipline", "Self-Control", "Sacrifice"]
  }
];

export function DailyDevotionals() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [favorites, setFavorites] = useLocalStorage<number[]>("devotional-favorites", []);
  const [readDevotionals, setReadDevotionals] = useLocalStorage<string[]>("devotional-read", []);

  // Get devotional for current date (cycles through based on day of year)
  const getDailyDevotional = (date: Date) => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const devotionalIndex = (dayOfYear - 1) % devotionals.length;
    return devotionals[devotionalIndex];
  };

  const currentDevotional = getDailyDevotional(currentDate);
  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const isRead = readDevotionals.includes(dateKey);

  const markAsRead = () => {
    if (!isRead) {
      setReadDevotionals(prev => [...prev, dateKey]);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Clear Hierarchy */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Devotionals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Biblical wisdom for your debt freedom journey
          </p>
        </div>

        {/* Date Navigation */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white text-lg">
                  {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="h-10 px-4"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToToday}
                  className="h-10 px-4"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="h-10 px-4"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Daily Devotional */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {currentDevotional.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  {currentDevotional.verse}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(currentDevotional.id)}
                  className={`h-10 w-10 ${favorites.includes(currentDevotional.id) ? 'text-yellow-500' : 'text-gray-500'}`}
                >
                  <Star className={`h-5 w-5 ${favorites.includes(currentDevotional.id) ? 'fill-current' : ''}`} />
                </Button>
                {isRead && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Read
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Scripture */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-6 rounded-r-lg">
              <p className="text-gray-900 dark:text-white italic font-medium leading-relaxed text-lg">
                "{currentDevotional.verseText}"
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {currentDevotional.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-sm px-3 py-1 border-gray-300 dark:border-gray-600">
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Lesson */}
            <div>
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
                <Heart className="h-6 w-6 text-purple-600" />
                Today's Lesson
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                {currentDevotional.lesson}
              </p>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Application */}
            <div>
              <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">
                Practical Application
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                {currentDevotional.application}
              </p>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            {/* Prayer */}
            <div>
              <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">
                Prayer
              </h3>
              <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed text-base">
                {currentDevotional.prayer}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-6">
              <Button 
                onClick={markAsRead}
                disabled={isRead}
                className="min-w-40 h-12 text-base font-medium"
              >
                {isRead ? "Read Today" : "Mark as Read"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reading Stats */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-base text-gray-600 dark:text-gray-400">
              <span>Devotionals read: {readDevotionals.length}</span>
              <span>Favorites saved: {favorites.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
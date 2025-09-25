import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Phone,
  Video,
  MessageSquare,
  Star,
  Download,
  ExternalLink,
  Bell,
  Target,
  Heart,
  Lightbulb,
  Play,
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string;
  date: string;
  time: string;
  type: "phone" | "video" | "in-person";
  topic: string;
  message: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  category: "debt-freedom" | "budgeting" | "giving" | "investing" | "general";
  replies: number;
  likes: number;
  createdAt: string;
}

interface Resource {
  id: string;
  title: string;
  type: "pdf" | "video" | "audio" | "article";
  category: "biblical-finance" | "debt-manage" | "budgeting" | "giving" | "legacy";
  description: string;
  duration?: string;
  downloaded: boolean;
}

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  triggerCondition: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  suggestedAction: string;
}

interface CoachingVideo {
  id: string;
  title: string;
  step: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  watched: boolean;
}

interface SuccessStory {
  id: string;
  name: string;
  location: string;
  situation: string;
  transformation: string;
  timeframe: string;
  debtReduction: string;
  emergencyFund: string;
  image: string;
  quote: string;
}

export function CoachingIntegration() {
  const { toast } = useToast();
  
  const [bookings, setBookings] = useLocalStorage<BookingRequest[]>("coaching-bookings", []);
  const [forumPosts] = useState<ForumPost[]>([
    {
      id: "1",
      title: "Struggling with Emergency Fund vs Debt Payoff Priority",
      author: "Sarah M.",
      content: "I'm torn between building my emergency fund and paying off debt. What does Scripture say about this balance?",
      category: "debt-freedom",
      replies: 12,
      likes: 8,
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      title: "Tithing While in Debt - Biblical Perspective",
      author: "Michael K.",
      content: "Should I continue tithing while working to pay off credit card debt? Looking for biblical guidance.",
      category: "giving",
      replies: 24,
      likes: 15,
      createdAt: "2024-01-14"
    },
    {
      id: "3",
      title: "Teaching Kids About Money God's Way",
      author: "Jennifer L.",
      content: "What are some practical ways to teach children biblical financial principles?",
      category: "general",
      replies: 18,
      likes: 22,
      createdAt: "2024-01-13"
    }
  ]);

  const [resources] = useState<Resource[]>([
    {
      id: "1",
      title: "Biblical Foundations of Financial Stewardship",
      type: "pdf",
      category: "biblical-finance",
      description: "A comprehensive guide to understanding God's perspective on money and possessions",
      downloaded: false
    },
    {
      id: "2",
      title: "Debt Freedom Prayer & Action Plan",
      type: "pdf", 
      category: "debt-manage",
      description: "Combining prayer with practical steps for becoming debt-free",
      downloaded: false
    },
    {
      id: "3",
      title: "The Heart of Giving: Video Series",
      type: "video",
      category: "giving",
      description: "5-part video series on generous giving as a form of worship",
      duration: "2.5 hours",
      downloaded: false
    },
    {
      id: "4",
      title: "Building Your Legacy Workbook",
      type: "pdf",
      category: "legacy",
      description: "Step-by-step guide to creating a lasting financial and spiritual legacy",
      downloaded: false
    }
  ]);

  const [checkpoints] = useState<Checkpoint[]>([
    {
      id: "1",
      title: "Debt Snowball Stalled",
      description: "Consider professional guidance when debt payoff progress slows",
      triggerCondition: "No progress for 2+ months",
      priority: "medium",
      completed: false,
      suggestedAction: "Schedule a debt strategy consultation"
    },
    {
      id: "2",
      title: "Emergency Fund Milestone",
      description: "Celebrate and plan next steps after reaching $1,000 emergency fund",
      triggerCondition: "Emergency fund reaches $1,000",
      priority: "low",
      completed: false,
      suggestedAction: "Book a financial planning session"
    },
    {
      id: "3",
      title: "Giving Goals Evaluation",
      description: "Review and adjust giving strategy quarterly",
      triggerCondition: "Every 3 months",
      priority: "medium",
      completed: false,
      suggestedAction: "Schedule stewardship planning call"
    },
    {
      id: "4",
      title: "Major Life Change",
      description: "Seek guidance during significant life transitions",
      triggerCondition: "Job change, marriage, new baby, etc.",
      priority: "high",
      completed: false,
      suggestedAction: "Schedule priority consultation"
    }
  ]);

  const [coachingVideos, setCoachingVideos] = useLocalStorage<CoachingVideo[]>("coaching-videos", [
    {
      id: "1",
      title: "Biblical Foundation for Financial Recovery",
      step: "Step 1: Foundation",
      description: "Understanding God's heart for your financial healing and establishing biblical principles",
      duration: "12:30",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "/api/placeholder/400/225",
      watched: false
    },
    {
      id: "2",
      title: "Emergency Fund Essentials for Widows",
      step: "Step 2: Protection",
      description: "Building your safety net with realistic goals and biblical wisdom",
      duration: "15:45",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "/api/placeholder/400/225",
      watched: false
    },
    {
      id: "3",
      title: "Debt Freedom Strategy",
      step: "Step 3: Freedom",
      description: "Creating your debt elimination plan with prayer and practical steps",
      duration: "18:20",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "/api/placeholder/400/225",
      watched: false
    },
    {
      id: "4",
      title: "Building Wealth God's Way",
      step: "Step 4: Growth",
      description: "Growing your resources through biblical stewardship principles",
      duration: "22:10",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "/api/placeholder/400/225",
      watched: false
    },
    {
      id: "5",
      title: "Legacy and Giving",
      step: "Step 5: Legacy",
      description: "Creating lasting impact through generous giving and wise planning",
      duration: "16:40",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "/api/placeholder/400/225",
      watched: false
    }
  ]);

  const [successStories] = useState<SuccessStory[]>([
    {
      id: "1",
      name: "Maria Rodriguez",
      location: "Phoenix, AZ",
      situation: "Lost husband suddenly, $45k in debt, no savings",
      transformation: "Paid off all debt and built 6-month emergency fund",
      timeframe: "18 months",
      debtReduction: "$45,000",
      emergencyFund: "$12,000",
      image: "/api/placeholder/150/150",
      quote: "I thought my financial future was hopeless after losing Miguel. Legacy Mindset Solutions showed me that God had a plan for my restoration. Today I'm debt-free and helping other widows find hope."
    },
    {
      id: "2",
      name: "Jennifer Williams",
      location: "Nashville, TN",
      situation: "Overwhelmed by finances, $23k credit card debt",
      transformation: "Eliminated debt and started investing for the future",
      timeframe: "14 months",
      debtReduction: "$23,000",
      emergencyFund: "$8,500",
      image: "/api/placeholder/150/150",
      quote: "The biblical approach to money management changed everything. I went from financial anxiety to peace, knowing I'm stewarding God's resources well."
    },
    {
      id: "3",
      name: "Patricia Johnson",
      location: "Atlanta, GA",
      situation: "Facing foreclosure, $67k total debt including mortgage arrears",
      transformation: "Saved her home and became completely debt-free",
      timeframe: "24 months",
      debtReduction: "$67,000",
      emergencyFund: "$15,000",
      image: "/api/placeholder/150/150",
      quote: "They helped me create a plan when I couldn't see a way forward. God used Legacy Mindset Solutions to literally save my home and my financial future."
    },
    {
      id: "4",
      name: "Susan Chen",
      location: "Seattle, WA",
      situation: "Retired with fixed income, struggling to make ends meet",
      transformation: "Optimized her budget and built substantial savings",
      timeframe: "8 months",
      debtReduction: "$12,000",
      emergencyFund: "$10,000",
      image: "/api/placeholder/150/150",
      quote: "I learned that even on a fixed income, biblical stewardship principles can create abundance. I'm now able to give generously while living comfortably."
    }
  ]);

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const [newBooking, setNewBooking] = useState({
    date: "",
    time: "",
    type: "video" as const,
    topic: "",
    message: ""
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleBookingSubmit = () => {
    if (!newBooking.date || !newBooking.time || !newBooking.topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const booking: BookingRequest = {
      id: Date.now().toString(),
      ...newBooking,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, booking]);
    setNewBooking({ date: "", time: "", type: "video", topic: "", message: "" });
    
    toast({
      title: "Booking Request Submitted!",
      description: "Legacy Mindset Solutions will contact you within 24 hours to confirm your appointment."
    });
  };

  const handleResourceDownload = (resourceId: string) => {
    toast({
      title: "Resource Downloaded",
      description: "The resource has been saved to your downloads folder.",
    });
  };

  const handleVideoWatch = (videoId: string) => {
    setCoachingVideos(prev => 
      prev.map(video => 
        video.id === videoId ? { ...video, watched: true } : video
      )
    );
  };

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "phone": return <Phone className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "in-person": return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf": return <BookOpen className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "audio": return <MessageSquare className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredPosts = selectedCategory === "all" 
    ? forumPosts 
    : forumPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Coaching Integration</h1>
        <p className="text-muted-foreground">
          Connect with Legacy Mindset Solutions coaches and access biblical financial resources
        </p>
      </div>

      <Tabs defaultValue="booking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
        </TabsList>

        {/* Consultation Booking */}
        <TabsContent value="booking" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Your Consultation
                </CardTitle>
                <CardDescription>
                  Schedule a session with our biblical financial coaches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Preferred Date</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-time">Preferred Time</Label>
                    <Input
                      id="booking-time"
                      type="time"
                      value={newBooking.time}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Session Type</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "video", label: "Video Call", icon: Video },
                      { value: "phone", label: "Phone", icon: Phone },
                      { value: "in-person", label: "In-Person", icon: Users }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={newBooking.type === option.value ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setNewBooking(prev => ({ ...prev, type: option.value as any }))}
                      >
                        <option.icon className="h-4 w-4 mr-2" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-topic">Main Topic</Label>
                  <Input
                    id="booking-topic"
                    placeholder="e.g., Debt payoff strategy, Emergency fund planning"
                    value={newBooking.topic}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-message">Additional Details (Optional)</Label>
                  <Textarea
                    id="booking-message"
                    placeholder="Share any specific questions or concerns..."
                    value={newBooking.message}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <Button onClick={handleBookingSubmit} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Consultation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Booking Requests</CardTitle>
                <CardDescription>
                  Track your consultation requests and confirmations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No booking requests yet. Schedule your first consultation!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(booking.type)}
                            <span className="font-medium">{booking.topic}</span>
                          </div>
                          <Badge variant={
                            booking.status === "confirmed" ? "default" :
                            booking.status === "completed" ? "secondary" : "outline"
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3" />
                            {booking.date} at {booking.time}
                          </div>
                          <div className="capitalize">{booking.type} session</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resource Library */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Biblical Financial Resources
              </CardTitle>
              <CardDescription>
                Access our library of faith-based financial education materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <Badge variant="outline" className="text-xs">
                          {resource.type.toUpperCase()}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {resource.category.replace("-", " ")}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    
                    {resource.duration && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Clock className="h-3 w-3" />
                        {resource.duration}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleResourceDownload(resource.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Integration */}
        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Widow's Wealth Cycle Video Series
              </CardTitle>
              <CardDescription>
                Step-by-step coaching videos guiding you through biblical financial recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {coachingVideos.map((video, index) => (
                  <div key={video.id} className="rounded-lg border bg-card overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <iframe
                        src={video.videoUrl}
                        title={video.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      {!video.watched && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs mb-2">
                          {video.step}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {video.duration}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {video.description}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleVideoWatch(video.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {video.watched ? "Watch Again" : "Start Watching"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Progress Tracking</span>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Complete videos in order for the best learning experience
                </div>
                <div className="flex gap-2">
                  {coachingVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className={`w-3 h-3 rounded-full ${
                        video.watched ? "bg-green-600" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {coachingVideos.filter(v => v.watched).length} of {coachingVideos.length} videos completed
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Success Stories */}
        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Success Stories
              </CardTitle>
              <CardDescription>
                Real transformations from women who've walked this journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="overflow-hidden rounded-lg">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentStoryIndex * 100}%)` }}
                  >
                    {successStories.map((story) => (
                      <div key={story.id} className="w-full flex-shrink-0 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                              <img 
                                src={story.image} 
                                alt={story.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold">{story.name}</h3>
                              <p className="text-muted-foreground">{story.location}</p>
                            </div>
                            
                            <div className="relative">
                              <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                              <blockquote className="text-lg italic leading-relaxed pl-6">
                                "{story.quote}"
                              </blockquote>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium text-destructive">The Challenge:</h4>
                                <p className="text-sm text-muted-foreground">{story.situation}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-green-600">The Transformation:</h4>
                                <p className="text-sm text-muted-foreground">{story.transformation}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-lg text-destructive">-{story.debtReduction}</div>
                                <div className="text-muted-foreground">Debt Eliminated</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg text-green-600">+{story.emergencyFund}</div>
                                <div className="text-muted-foreground">Emergency Fund</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-lg text-primary">{story.timeframe}</div>
                                <div className="text-muted-foreground">Timeframe</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={prevStory}
                    disabled={currentStoryIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {successStories.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStoryIndex ? "bg-primary" : "bg-muted"
                        }`}
                        onClick={() => setCurrentStoryIndex(index)}
                      />
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextStory}
                    disabled={currentStoryIndex === successStories.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg border bg-card">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Ready to Write Your Success Story?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join hundreds of women who've transformed their financial lives through biblical principles
                  </p>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Your Free Consultation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Forum */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Forum
              </CardTitle>
              <CardDescription>
                Connect with others on similar biblical financial journeys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { value: "all", label: "All Posts" },
                  { value: "debt-freedom", label: "Debt Freedom" },
                  { value: "budgeting", label: "Budgeting" },
                  { value: "giving", label: "Giving" },
                  { value: "investing", label: "Investing" },
                  { value: "general", label: "General" }
                ].map((category) => (
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

              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {post.category.replace("-", " ")}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>by {post.author} • {post.createdAt}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.replies}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Full Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coaching Checkpoints */}
        <TabsContent value="checkpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Coaching Checkpoints
              </CardTitle>
              <CardDescription>
                Suggested times to seek professional guidance on your financial journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className={`p-4 rounded-lg border ${getPriorityColor(checkpoint.priority)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <h3 className="font-semibold">{checkpoint.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {checkpoint.priority} priority
                        </Badge>
                        {checkpoint.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2">{checkpoint.description}</p>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      <strong>Trigger:</strong> {checkpoint.triggerCondition}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <strong>Suggested Action:</strong> {checkpoint.suggestedAction}
                      </div>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
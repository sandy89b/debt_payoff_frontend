import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Star,
  Clock,
  Users,
  Briefcase,
  Wrench,
  Brain,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";

interface Skill {
  id: string;
  name: string;
  category: "professional" | "hobby" | "craft" | "service";
  proficiency: "beginner" | "intermediate" | "expert";
  monetizable: boolean;
  potentialIncome: number;
}

interface Asset {
  id: string;
  name: string;
  type: "physical" | "digital" | "space" | "vehicle";
  condition: "excellent" | "good" | "fair" | "poor";
  estimatedValue: number;
  canRent: boolean;
  canSell: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  timeRequired: string;
  potentialIncome: string;
  difficulty: "low" | "medium" | "high";
  category: "side-hustle" | "skill-based" | "asset-based" | "service";
}

export function IncomeOptimization() {
  const { toast } = useToast();
  
  const [skills, setSkills] = useLocalStorage<Skill[]>("income-optimization-skills", [
    {
      id: "1",
      name: "Web Design",
      category: "professional",
      proficiency: "intermediate",
      monetizable: true,
      potentialIncome: 500
    },
    {
      id: "2", 
      name: "Cooking",
      category: "hobby",
      proficiency: "expert",
      monetizable: true,
      potentialIncome: 300
    }
  ]);

  const [assets, setAssets] = useLocalStorage<Asset[]>("income-optimization-assets", [
    {
      id: "1",
      name: "Spare Bedroom",
      type: "space",
      condition: "good",
      estimatedValue: 0,
      canRent: true,
      canSell: false
    },
    {
      id: "2",
      name: "Camera Equipment",
      type: "physical", 
      condition: "excellent",
      estimatedValue: 2000,
      canRent: true,
      canSell: true
    }
  ]);

  const [opportunities] = useState<Opportunity[]>([
    {
      id: "1",
      title: "Freelance Your Skills",
      description: "Use your professional skills to take on freelance projects in your spare time",
      timeRequired: "5-10 hours/week",
      potentialIncome: "$500-2000/month",
      difficulty: "medium",
      category: "skill-based"
    },
    {
      id: "2",
      title: "Rent Out Space",
      description: "List your spare room, parking space, or storage area for rental income",
      timeRequired: "2-3 hours/week",
      potentialIncome: "$200-800/month", 
      difficulty: "low",
      category: "asset-based"
    },
    {
      id: "3",
      title: "Meal Prep Service",
      description: "Prepare and sell healthy meals to busy professionals in your area",
      timeRequired: "10-15 hours/week",
      potentialIncome: "$300-1000/month",
      difficulty: "medium",
      category: "service"
    },
    {
      id: "4",
      title: "Declutter & Sell",
      description: "Go through your belongings and sell items you no longer need",
      timeRequired: "One-time effort",
      potentialIncome: "$200-1500",
      difficulty: "low", 
      category: "asset-based"
    }
  ]);

  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "hobby" as const,
    proficiency: "beginner" as const,
    potentialIncome: ""
  });

  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "physical" as const,
    condition: "good" as const,
    estimatedValue: ""
  });

  const addSkill = () => {
    if (!newSkill.name) {
      toast({
        title: "Missing Information",
        description: "Please enter a skill name.",
        variant: "destructive"
      });
      return;
    }

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name,
      category: newSkill.category,
      proficiency: newSkill.proficiency,
      monetizable: true,
      potentialIncome: parseInt(newSkill.potentialIncome) || 0
    };

    setSkills(prev => [...prev, skill]);
    setNewSkill({ name: "", category: "hobby", proficiency: "beginner", potentialIncome: "" });
    
    toast({
      title: "Skill Added!",
      description: "Your skill has been added to your optimization profile."
    });
  };

  const addAsset = () => {
    if (!newAsset.name) {
      toast({
        title: "Missing Information", 
        description: "Please enter an asset name.",
        variant: "destructive"
      });
      return;
    }

    const asset: Asset = {
      id: Date.now().toString(),
      name: newAsset.name,
      type: newAsset.type,
      condition: newAsset.condition,
      estimatedValue: parseInt(newAsset.estimatedValue) || 0,
      canRent: true,
      canSell: true
    };

    setAssets(prev => [...prev, asset]);
    setNewAsset({ name: "", type: "physical", condition: "good", estimatedValue: "" });
    
    toast({
      title: "Asset Added!",
      description: "Your asset has been added to your optimization profile."
    });
  };

  const totalSkillIncome = skills.reduce((sum, skill) => sum + skill.potentialIncome, 0);
  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.estimatedValue, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "professional": return <Briefcase className="h-4 w-4" />;
      case "hobby": return <Heart className="h-4 w-4" />;
      case "craft": return <Wrench className="h-4 w-4" />;
      case "service": return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Income Optimization</h1>
        <p className="text-muted-foreground">
          Discover "what's in your house" - identify your skills, assets, and opportunities to increase income
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Skill Potential</p>
                <p className="text-2xl font-bold">${totalSkillIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Asset Value</p>
                <p className="text-2xl font-bold">${totalAssetValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold">{opportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skills Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Skills ({skills.length})
              </CardTitle>
              <CardDescription>
                Skills you can monetize for extra income
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(skill.category)}
                    <div>
                      <div className="font-medium">{skill.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {skill.proficiency}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${skill.potentialIncome}/mo
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add New Skill */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Skill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="skill-name">Skill Name</Label>
                  <Input
                    id="skill-name"
                    placeholder="e.g., Photography, Writing"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill-income">Monthly Potential ($)</Label>
                  <Input
                    id="skill-income"
                    type="number"
                    placeholder="0"
                    value={newSkill.potentialIncome}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, potentialIncome: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addSkill} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assets & Opportunities */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Your Assets ({assets.length})
              </CardTitle>
              <CardDescription>
                Physical items and spaces you can monetize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {asset.condition}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${asset.estimatedValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {asset.canRent && "Rentable"} {asset.canRent && asset.canSell && "•"} {asset.canSell && "Sellable"}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add New Asset */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset Name</Label>
                  <Input
                    id="asset-name"
                    placeholder="e.g., Camera, Spare Room"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-value">Estimated Value ($)</Label>
                  <Input
                    id="asset-value"
                    type="number"
                    placeholder="0"
                    value={newAsset.estimatedValue}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addAsset} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Opportunities Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Income Opportunities
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your skills and assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{opportunity.title}</h3>
                  <Badge className={`text-xs ${getDifficultyColor(opportunity.difficulty)}`}>
                    {opportunity.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {opportunity.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.timeRequired}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-green-600">{opportunity.potentialIncome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
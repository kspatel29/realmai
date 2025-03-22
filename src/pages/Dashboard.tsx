
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import ServiceCard from "@/components/ServiceCard";
import { Coins, Film, Subtitles, Video, Code, History, Settings, LineChart } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

const Dashboard = () => {
  const { user } = useAuth();
  const { credits } = useCredits();

  const services = [
    {
      title: "Video Dubbing",
      description: "Create multilingual versions of your videos with AI voice dubbing",
      icon: <Film className="h-6 w-6" />,
      link: "/dashboard/video-dubbing",
      action: "Start Dubbing",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Subtitle Generator",
      description: "Generate and translate subtitles for your videos",
      icon: <Subtitles className="h-6 w-6" />,
      link: "/dashboard/subtitles",
      action: "Create Subtitles",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Clips Generator",
      description: "Create engaging short-form video clips from your long content",
      icon: <Video className="h-6 w-6" />,
      link: "/dashboard/clips",
      action: "Generate Clips",
      color: "bg-amber-100 text-amber-800"
    },
    {
      title: "History",
      description: "View and manage your previous jobs",
      icon: <History className="h-6 w-6" />,
      link: "/dashboard/history",
      action: "View History",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Analytics",
      description: "Track performance across translated content",
      icon: <LineChart className="h-6 w-6" />,
      link: "/dashboard/analytics",
      action: "View Analytics",
      color: "bg-pink-100 text-pink-800"
    },
    {
      title: "Settings",
      description: "Manage your account and preferences",
      icon: <Settings className="h-6 w-6" />,
      link: "/dashboard/settings",
      action: "Manage Settings",
      color: "bg-gray-100 text-gray-800"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Creator"}! Expand your global reach with AI-powered tools.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Credit Summary
          </CardTitle>
          <CardDescription>
            You have <span className="font-medium">{credits}</span> credits available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use your credits for video dubbing, subtitle generation, and clip creation.
            Visit the <a href="/dashboard/settings?tab=billing" className="text-primary hover:underline">billing page</a> to purchase more credits.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service, i) => (
          <ServiceCard key={i} {...service} />
        ))}
      </div>

      <Separator className="my-8" />

      <ServiceCostDisplay showSummary={true} />

      <div className="text-center mt-8">
        <Card className="max-w-xl mx-auto bg-muted/20">
          <CardContent className="pt-6">
            <Code className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">Need API Access?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Integrate our AI tools directly into your workflow with our developer API
            </p>
            <a 
              href="/dashboard/settings?tab=api" 
              className="text-sm text-primary hover:underline"
            >
              Get API Keys →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

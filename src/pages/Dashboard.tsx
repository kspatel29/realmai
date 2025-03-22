
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import ServiceCard from "@/components/ServiceCard";
import { Coins, Film, Subtitles, Video, History, Settings, LineChart, Package, Plus, ArrowRight } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CREDIT_PACKAGES } from "@/constants/pricing";

const Dashboard = () => {
  const { user } = useAuth();
  const { credits } = useCredits();
  const [showPackages, setShowPackages] = useState(false);

  const services = [
    {
      title: "Video Dubbing",
      description: "Create multilingual versions of your videos with AI voice dubbing",
      icon: <Film className="h-6 w-6" style={{ color: "#3B82F6" }} />,
      link: "/dashboard/video-dubbing",
      action: "Start Dubbing",
      color: "#3B82F6"
    },
    {
      title: "Subtitle Generator",
      description: "Generate and translate subtitles for your videos",
      icon: <Subtitles className="h-6 w-6" style={{ color: "#8B5CF6" }} />,
      link: "/dashboard/subtitles",
      action: "Create Subtitles",
      color: "#8B5CF6"
    },
    {
      title: "Clips Generator",
      description: "Create engaging short-form video clips from your long content",
      icon: <Video className="h-6 w-6" style={{ color: "#F59E0B" }} />,
      link: "/dashboard/clips",
      action: "Generate Clips",
      color: "#F59E0B"
    },
    {
      title: "History",
      description: "View and manage your previous jobs",
      icon: <History className="h-6 w-6" style={{ color: "#10B981" }} />,
      link: "/dashboard/history",
      action: "View History",
      color: "#10B981"
    },
    {
      title: "Analytics",
      description: "Track performance across translated content",
      icon: <LineChart className="h-6 w-6" style={{ color: "#EC4899" }} />,
      link: "/dashboard/analytics",
      action: "View Analytics",
      color: "#EC4899"
    },
    {
      title: "Settings",
      description: "Manage your account and preferences",
      icon: <Settings className="h-6 w-6" style={{ color: "#6B7280" }} />,
      link: "/dashboard/settings",
      action: "Manage Settings",
      color: "#6B7280"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              Credit Summary
            </CardTitle>
            <CardDescription>
              You have <span className="font-medium text-yellow-600">{credits}</span> credits available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use your credits for video dubbing, subtitle generation, and clip creation.
              Visit the <a href="/dashboard/settings?tab=billing" className="text-primary hover:underline">billing page</a> to purchase more credits.
            </p>
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="group"
                onClick={() => setShowPackages(!showPackages)}
              >
                <Package className="mr-1 h-4 w-4 text-yellow-500" />
                {showPackages ? "Hide Packages" : "Buy Creator Packs"}
                <ArrowRight className={`ml-1 h-3 w-3 transition-transform ${showPackages ? "rotate-90" : "group-hover:translate-x-1"}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <Button variant="ghost" size="sm" className="h-8 mr-2" onClick={() => setShowPackages(!showPackages)}>
                {showPackages ? "Hide" : "View All"}
              </Button>
            </div>
            <h3 className="font-semibold text-lg mb-1">Need more credits?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Purchase credit packs to continue using our AI tools
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none" 
              onClick={() => setShowPackages(!showPackages)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Buy Credits
            </Button>
          </CardContent>
        </Card>
      </div>

      {showPackages && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Creator Access Packs</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowPackages(false)}>
              Hide Packages
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className="border border-muted hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{pkg.name}</CardTitle>
                    <div className="bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded text-sm">
                      ${pkg.price}
                    </div>
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 text-yellow-500 mr-1.5" />
                      <span className="text-2xl font-bold">{pkg.credits}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(pkg.price / pkg.credits * 100).toFixed(1)}¢ per credit
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service, i) => (
          <ServiceCard 
            key={i} 
            title={service.title}
            description={service.description}
            icon={service.icon}
            action={service.action}
            link={service.link}
            color={service.color}
          />
        ))}
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Service Cost Breakdown</h2>
        <ServiceCostDisplay showSummary={true} />
      </div>
    </div>
  );
};

export default Dashboard;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import ServiceCard from "@/components/ServiceCard";
import { Film, Subtitles, Video, Package, Plus, BarChart, Users, Clock, Zap } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
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
    }
  ];

  // Statistic cards data
  const statsCards = [
    {
      title: "Total Videos",
      value: "24",
      description: "Videos processed",
      icon: <Film className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "Total Users",
      value: "3",
      description: "Team members",
      icon: <Users className="h-5 w-5 text-violet-500" />,
      color: "bg-violet-50"
    },
    {
      title: "Processing Time",
      value: "2.4h",
      description: "Average processing",
      icon: <Clock className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-50"
    },
    {
      title: "Usage Trend",
      value: "+27%",
      description: "Month over month",
      icon: <BarChart className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-50"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Creator"}! Expand your global reach with AI-powered tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statsCards.map((card, i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-md">
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Zap className="mr-1 h-3.5 w-3.5" />
                <span>{credits} credits</span>
              </div>
            </div>
            <h3 className="font-semibold text-lg">Need more credits?</h3>
            <p className="text-sm text-muted-foreground">
              Purchase credit packs to continue using our AI tools or manage your subscription plan
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none" 
                onClick={() => setShowPackages(!showPackages)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Buy Credits
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.location.href = '/dashboard/billing'}
              >
                Manage Billing
              </Button>
            </div>
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
                      <Package className="h-5 w-5 text-yellow-500 mr-1.5" />
                      <span className="text-2xl font-bold">{pkg.credits}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(pkg.price / pkg.credits * 100).toFixed(1)}¢ per credit
                    </div>
                  </div>
                  <Button className="w-full">
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

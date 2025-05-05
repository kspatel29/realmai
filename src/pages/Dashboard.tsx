import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import ServiceCard from "@/components/ServiceCard";
import {
  Film,
  Subtitles,
  Video,
  Package,
  Plus,
  Calendar,
  Users,
  CreditCard,
  Zap,
} from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Define the stats interface
interface DashboardStats {
  totalVideos: number;
  lastActive: string;
  creditsUsed: number;
  creditsRemaining: number;
}

// Define credit transaction interface
interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "usage" | "refund";
  service?: string;
  description?: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    lastActive: "Today",
    creditsUsed: 0,
    creditsRemaining: 0,
  });

  console.log(credits);
  

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch actual video count
        const { count: videoCount, error: videoError } = await supabase
          .from("videos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (videoError) throw videoError;

        // Get user credits data
        const creditsData = credits || 0;

        // Get credit transaction history to calculate used credits
        const { data: transactions, error: txError } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("type", "usage")
          .order("created_at", { ascending: false });

        if (txError) throw txError;

        console.log(transactions);
        

        // Calculate total used credits
        let creditsUsed = 0;
        if (transactions && transactions.length > 0) {
          // Sum up all usage transactions
          creditsUsed = (transactions as CreditTransaction[]).reduce(
            (total, tx) => total + tx.amount,
            0
          );
        }

        // Calculate last active date based on last transaction
        let lastActive = "Today"; // Default
        const lastSignIn = user.last_sign_in_at;

        console.log(lastSignIn);
        
        
        if (lastSignIn) {
          const lastLoginDate = new Date(lastSignIn);
          const today = new Date();
          const diffDays = Math.floor(
            (today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) lastActive = "Today";
          else if (diffDays === 1) lastActive = "Yesterday";
          else lastActive = `${diffDays} days ago`;
        }

        setStats({
          totalVideos: videoCount || 0,
          lastActive: lastActive,
          creditsUsed: creditsUsed,
          creditsRemaining: creditsData,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fall back to basic stats if there's an error
        setStats({
          totalVideos: 0,
          lastActive: "Today",
          creditsUsed: 0,
          creditsRemaining: credits || 0,
        });
      }
    };

    fetchStats();
  }, [user, credits]);

  const services = [
    {
      title: "Video Dubbing",
      description:
        "Create multilingual versions of your videos with AI voice dubbing",
      icon: <Film className="h-6 w-6" style={{ color: "#3B82F6" }} />,
      link: "/dashboard/video-dubbing",
      action: "Start Dubbing",
      color: "#3B82F6",
    },
    {
      title: "Subtitle Generator",
      description: "Generate and translate subtitles for your videos",
      icon: <Subtitles className="h-6 w-6" style={{ color: "#8B5CF6" }} />,
      link: "/dashboard/subtitles",
      action: "Create Subtitles",
      color: "#8B5CF6",
    },
    {
      title: "Clips Generator",
      description:
        "Create engaging short-form video clips from your long content",
      icon: <Video className="h-6 w-6" style={{ color: "#F59E0B" }} />,
      link: "/dashboard/clips",
      action: "Generate Clips",
      color: "#F59E0B",
    },
  ];

  // Statistic cards data
  const statsCards = [
    {
      title: "Total Videos",
      value: stats.totalVideos.toString(),
      description: "Videos processed",
      icon: <Film className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Last Active",
      value: stats.lastActive,
      description: "Your recent activity",
      icon: <Calendar className="h-5 w-5 text-violet-500" />,
      color: "bg-violet-50",
    },
    {
      title: "Credits Used",
      value: stats.creditsUsed.toString(),
      description: "Total consumption",
      icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-50",
    },
    {
      title: "Credits Remaining",
      value: stats.creditsRemaining.toString(),
      description: "Available balance",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-50",
    },
  ];

  const handleBuyCredits = () => {
    navigate("/dashboard/billing");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.user_metadata?.name || "Creator"}! Expand your
          global reach with AI-powered tools.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statsCards.map((card, i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
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
              Purchase credit packs to continue using our AI tools or manage
              your subscription plan
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none"
                onClick={handleBuyCredits}
              >
                <Plus className="mr-2 h-4 w-4" />
                Buy Credits
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/dashboard/billing")}
              >
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

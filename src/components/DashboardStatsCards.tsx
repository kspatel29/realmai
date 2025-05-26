
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Clock, Coins, TrendingUp } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardStatsCards = () => {
  const { stats, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Videos",
      value: stats?.totalVideos || 0,
      description: "Videos uploaded",
      icon: Video,
      color: "text-blue-600"
    },
    {
      title: "Last Active",
      value: stats?.lastActive || "Never",
      description: "Last sign in",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Credits Used",
      value: stats?.creditsUsed || 0,
      description: "Total consumed",
      icon: TrendingUp,
      color: "text-orange-600"
    },
    {
      title: "Credits Remaining",
      value: stats?.creditsRemaining || 0,
      description: "Available balance",
      icon: Coins,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatsCards;

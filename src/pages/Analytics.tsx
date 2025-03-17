
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { DollarSign, Globe, TrendingUp, Users, BarChart3, Download } from "lucide-react";

const videoOptions = [
  { value: "all", label: "All Videos" },
  { value: "video1", label: "How to Make Amazing Content" },
  { value: "video2", label: "My Product Review" },
  { value: "video3", label: "Travel Vlog: Paris" },
];

const timeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "Last year" },
];

const Analytics = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Analytics</h1>
          <p className="text-muted-foreground">
            Track the performance of your content across languages and regions.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select video" />
            </SelectTrigger>
            <SelectContent>
              {videoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue="30d">
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Global Views</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2M</div>
            <p className="flex items-center text-xs text-emerald-500">
              <span>+32.1%</span>
              <TrendingUp className="ml-1 h-3 w-3" />
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,426</div>
            <p className="flex items-center text-xs text-emerald-500">
              <span>+16.5%</span>
              <TrendingUp className="ml-1 h-3 w-3" />
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324K hrs</div>
            <p className="flex items-center text-xs text-emerald-500">
              <span>+24.3%</span>
              <TrendingUp className="ml-1 h-3 w-3" />
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Subscribers</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142K</div>
            <p className="flex items-center text-xs text-emerald-500">
              <span>+54.2%</span>
              <TrendingUp className="ml-1 h-3 w-3" />
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views by Language</CardTitle>
              <CardDescription>
                How your content performs across different languages
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <LineChart 
                className="w-full aspect-[4/2]"
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "English",
                      data: [200, 250, 300, 450, 500, 550],
                      borderColor: "#2563eb",
                      backgroundColor: "#93c5fd",
                    },
                    {
                      label: "Spanish",
                      data: [150, 200, 220, 280, 350, 420],
                      borderColor: "#16a34a",
                      backgroundColor: "#86efac",
                    },
                    {
                      label: "French",
                      data: [50, 90, 95, 110, 170, 210],
                      borderColor: "#ca8a04",
                      backgroundColor: "#fde047",
                    },
                    {
                      label: "Others",
                      data: [100, 120, 150, 180, 220, 270],
                      borderColor: "#9333ea",
                      backgroundColor: "#d8b4fe",
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Audience Geography</CardTitle>
                <CardDescription>
                  Where your viewers are located
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <PieChart 
                  className="w-full aspect-square max-w-[300px]"
                  data={{
                    labels: ["USA", "Europe", "Asia", "Latin America", "Other"],
                    datasets: [
                      {
                        label: "Viewers",
                        data: [35, 25, 20, 15, 5],
                        backgroundColor: [
                          "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899",
                        ],
                      },
                    ],
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
                <CardDescription>
                  Age distribution of your audience
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart 
                  className="w-full aspect-[4/3]"
                  data={{
                    labels: ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
                    datasets: [
                      {
                        label: "Viewers by Age",
                        data: [5, 30, 35, 15, 10, 5],
                        backgroundColor: "#f87171",
                      },
                    ],
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>
                How your revenue is distributed
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <BarChart 
                className="w-full aspect-[4/2]"
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Ad Revenue",
                      data: [1200, 1350, 1400, 1600, 1800, 2100],
                      backgroundColor: "#22c55e",
                    },
                    {
                      label: "Sponsorships",
                      data: [800, 800, 1000, 1200, 1400, 1500],
                      backgroundColor: "#3b82f6",
                    },
                    {
                      label: "Merchandise",
                      data: [500, 600, 650, 700, 800, 850],
                      backgroundColor: "#eab308",
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Language</CardTitle>
              <CardDescription>
                How different languages contribute to your channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-4">
                    {[
                      { language: "English", views: "4.2M", watchTime: "168K hrs", engagement: "High" },
                      { language: "Spanish", views: "1.8M", watchTime: "67K hrs", engagement: "Medium" },
                      { language: "Portuguese", views: "980K", watchTime: "41K hrs", engagement: "Medium" },
                      { language: "French", views: "560K", watchTime: "24K hrs", engagement: "Medium" },
                      { language: "German", views: "430K", watchTime: "18K hrs", engagement: "Low" },
                      { language: "Others", views: "210K", watchTime: "6K hrs", engagement: "Low" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <div className="font-medium">{item.language}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.views} views • {item.watchTime}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          item.engagement === "High" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                          item.engagement === "Medium" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {item.engagement} Engagement
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <PieChart 
                      className="w-full aspect-square"
                      data={{
                        labels: ["English", "Spanish", "Portuguese", "French", "German", "Others"],
                        datasets: [
                          {
                            label: "Views Distribution",
                            data: [51, 22, 12, 7, 5, 3],
                            backgroundColor: [
                              "#3b82f6", "#ef4444", "#eab308", "#22c55e", "#8b5cf6", "#94a3b8",
                            ],
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;

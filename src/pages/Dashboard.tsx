
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "@/components/ServiceCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Globe, Video, MessageSquare, Scissors, Upload, BarChart3, ArrowUpRight, TrendingUp, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      
      // Auto-set title based on filename without extension
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setVideoTitle(fileNameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error("Please select a video file first");
      return;
    }

    if (!videoTitle.trim()) {
      toast.error("Please enter a title for your video");
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        toast.success("Video uploaded successfully!");
        setVideoFile(null);
        setVideoTitle("");
        navigate("/dashboard/video-dubbing");
      }
    }, 200);
  };

  const services = [
    {
      title: "Video Dubbing",
      description: "Convert your content into 50+ languages with AI voice cloning.",
      icon: <Video className="h-6 w-6 text-blue-600" />,
      action: "Start Dubbing",
      color: "#2563eb",
      href: "/dashboard/video-dubbing"
    },
    {
      title: "Subtitle Generator",
      description: "Create accurate subtitles in multiple languages automatically.",
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
      action: "Generate Subtitles",
      color: "#9333ea",
      href: "/dashboard/subtitles"
    },
    {
      title: "Clips Generator",
      description: "Create viral clips from your long-form content automatically.",
      icon: <Scissors className="h-6 w-6 text-orange-600" />,
      action: "Generate Clips",
      color: "#ea580c",
      href: "/dashboard/clips"
    }
  ];

  const stats = [
    {
      title: "Total Earnings",
      value: "$12,426",
      change: "+16.5%",
      positive: true,
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />
    },
    {
      title: "Global Views",
      value: "8.2M",
      change: "+32.1%",
      positive: true,
      icon: <Globe className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Languages",
      value: "12",
      change: "+3",
      positive: true,
      icon: <MessageSquare className="h-5 w-5 text-violet-500" />
    },
    {
      title: "New Subscribers",
      value: "142K",
      change: "+54.2%",
      positive: true,
      icon: <Users className="h-5 w-5 text-orange-500" />
    }
  ];

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "Creator"}! Here's an overview of your global reach.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-youtube-red hover:bg-youtube-darkred text-white gap-2">
              <Upload className="h-4 w-4" />
              Upload New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Video</DialogTitle>
              <DialogDescription>
                Upload a video to get started with dubbing, subtitles, or clips generation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {videoFile ? (
                <div className="bg-muted rounded p-4 text-center">
                  <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium truncate">{videoFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setVideoFile(null)} 
                    className="mt-2"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag and drop or click to upload</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports MP4, MOV, AVI up to 500MB
                  </p>
                  <Input 
                    id="video-upload" 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    Select Video
                  </Button>
                </div>
              )}

              {videoFile && (
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title</Label>
                  <Input 
                    id="title" 
                    value={videoTitle} 
                    onChange={(e) => setVideoTitle(e.target.value)} 
                    placeholder="Enter a title for your video"
                  />
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-youtube-red transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setVideoFile(null);
                  setVideoTitle("");
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpload} 
                disabled={!videoFile || isUploading}
                className="bg-youtube-red hover:bg-youtube-darkred"
              >
                {isUploading ? "Uploading..." : "Upload & Continue"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`flex items-center text-xs ${stat.positive ? "text-emerald-500" : "text-red-500"}`}>
                <span>{stat.change}</span>
                <TrendingUp className="ml-1 h-3 w-3" />
                <span className="text-muted-foreground ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Services */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Our Services</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100 + 400}ms` }}>
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your latest content operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">How I Made $100K in a Day</p>
                    <p className="text-sm text-muted-foreground">Dubbed in Spanish, French, German</p>
                  </div>
                  <div className="text-sm text-muted-foreground shrink-0">2 hours ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Revenue Growth</CardTitle>
              <CardDescription>Global revenue performance</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-youtube-red">
              View Report
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Revenue analytics chart will appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

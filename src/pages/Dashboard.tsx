
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "@/components/ServiceCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Globe, Video, MessageSquare, Scissors, Upload, BarChart3, ArrowUpRight, Users, DollarSign, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useVideos } from "@/hooks/useVideos";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const { credits, isLoading: isLoadingCredits } = useCredits();
  const { videos, isLoading: isLoadingVideos, uploadVideo } = useVideos();
  
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
    
    // Set up a simulated progress indicator
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 95) {
          clearInterval(progressInterval);
          return 95; // Hold at 95% until the actual upload completes
        }
        return newProgress;
      });
    }, 300);
    
    try {
      await uploadVideo.mutateAsync({
        file: videoFile,
        title: videoTitle,
        description: videoDescription
      });
      
      // Complete the progress bar
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setVideoFile(null);
        setVideoTitle("");
        setVideoDescription("");
        setUploadDialogOpen(false);
        navigate("/dashboard/video-dubbing");
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      console.error("Upload error:", error);
    }
  };

  // Define service costs
  const services = [
    {
      title: "Video Dubbing",
      description: "Convert your content into 50+ languages with AI voice cloning.",
      icon: <Video className="h-6 w-6 text-blue-600" />,
      action: "Start Dubbing",
      color: "#2563eb",
      href: "/dashboard/video-dubbing",
      cost: 10
    },
    {
      title: "Subtitle Generator",
      description: "Create accurate subtitles in multiple languages automatically.",
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
      action: "Generate Subtitles",
      color: "#9333ea",
      href: "/dashboard/subtitles",
      cost: 5
    },
    {
      title: "Clips Generator",
      description: "Create viral clips from your long-form content automatically.",
      icon: <Scissors className="h-6 w-6 text-orange-600" />,
      action: "Generate Clips",
      color: "#ea580c",
      href: "/dashboard/clips",
      cost: 15
    }
  ];

  // Basic stats based on real data
  const stats = [
    {
      title: "Available Credits",
      value: isLoadingCredits ? "Loading..." : credits.toString(),
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />
    },
    {
      title: "Videos",
      value: isLoadingVideos ? "Loading..." : (videos?.length || 0).toString(),
      icon: <Video className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Account Status",
      value: "Active",
      icon: <Users className="h-5 w-5 text-violet-500" />
    },
    {
      title: "Storage Used",
      value: isLoadingVideos ? "Loading..." : 
        videos?.reduce((total, video) => total + (video.file_size || 0), 0) 
          ? `${(videos?.reduce((total, video) => total + (video.file_size || 0), 0) / (1024 * 1024)).toFixed(1)} MB`
          : "0 MB",
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />
    }
  ];

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "Creator"}! Here's an overview of your content.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
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
                    
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Enter a description for your video"
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
                    setVideoDescription("");
                    setUploadDialogOpen(false);
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

      {/* Recent Videos */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Videos</CardTitle>
            <CardDescription>Your uploaded videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingVideos ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Loading videos...</p>
                </div>
              ) : videos && videos.length > 0 ? (
                videos.slice(0, 3).map((video, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0">
                      {new Date(video.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No videos found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload Video
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <CardDescription>Follow these steps to create content</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold shrink-0">1</div>
                <div>
                  <h3 className="font-medium">Upload Your Video</h3>
                  <p className="text-sm text-muted-foreground">Start by uploading your video using the upload button.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold shrink-0">2</div>
                <div>
                  <h3 className="font-medium">Select a Service</h3>
                  <p className="text-sm text-muted-foreground">Choose from dubbing, subtitles, or clips generation.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold shrink-0">3</div>
                <div>
                  <h3 className="font-medium">Configure Options</h3>
                  <p className="text-sm text-muted-foreground">Select languages, voices, and other options for your project.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold shrink-0">4</div>
                <div>
                  <h3 className="font-medium">Generate & Download</h3>
                  <p className="text-sm text-muted-foreground">Process your content and download the results.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

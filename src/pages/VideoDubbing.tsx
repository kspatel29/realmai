import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Play, Pause, Globe, Mic, Wand2, Coins, Trash2, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import CreditConfirmDialog from "@/components/CreditConfirmDialog";
import { useCredits } from "@/hooks/useCredits";
import { useVideos, type Video as VideoType } from "@/hooks/useVideos";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const languages = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "id", name: "Indonesian" },
  { code: "vi", name: "Vietnamese" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
];

const CREDIT_COSTS = {
  BASE_COST: 5,
  PER_LANGUAGE: 3,
  VOICE_CLONE: 5,
  PREMIUM_QUALITY: 3
};

const VideoDubbing = () => {
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [voiceType, setVoiceType] = useState("clone");
  const [voicePreference, setVoicePreference] = useState("male1");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<'standard' | 'premium'>('standard');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [videoSelectOpen, setVideoSelectOpen] = useState(false);
  
  const { credits, useCredits: spendCredits, hasEnoughCredits } = useCredits();
  const { videos, isLoading: isLoadingVideos, uploadVideo, deleteVideo } = useVideos();

  useEffect(() => {
    if (selectedVideo) {
      loadVideoURL(selectedVideo);
    } else {
      setVideoURL(null);
    }
  }, [selectedVideo]);

  const loadVideoURL = async (video: VideoType) => {
    try {
      if (!user || !video.filename) return;
      
      const filePath = `${user.id}/${video.id}/${video.filename}`;
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast.error('Could not load video');
        return;
      }
      
      setVideoURL(data.signedUrl);
    } catch (error) {
      console.error('Error loading video URL:', error);
      toast.error('Failed to load video');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setIsUploading(true);
      
      let uploadProgress = 0;
      const progressInterval = setInterval(() => {
        uploadProgress += 5;
        setProgress(uploadProgress);
        
        if (uploadProgress >= 95) {
          clearInterval(progressInterval);
        }
      }, 300);
      
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      
      uploadVideo.mutate({
        file,
        title: fileNameWithoutExt
      }, {
        onSuccess: (newVideo) => {
          setProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setProgress(0);
            setSelectedVideo(newVideo);
            setUploadDialogOpen(false);
          }, 500);
        },
        onError: () => {
          clearInterval(progressInterval);
          setIsUploading(false);
          setProgress(0);
        }
      });
    }
  };

  const calculateCost = (): number => {
    if (!selectedVideo || selectedLanguages.length === 0) return 0;
    
    let totalCost = CREDIT_COSTS.BASE_COST;
    totalCost += selectedLanguages.length * CREDIT_COSTS.PER_LANGUAGE;
    if (voiceType === 'clone') {
      totalCost += CREDIT_COSTS.VOICE_CLONE;
    }
    if (qualityLevel === 'premium') {
      totalCost += CREDIT_COSTS.PREMIUM_QUALITY;
    }
    
    return totalCost;
  };

  const totalCost = calculateCost();

  const handleProcessVideo = () => {
    if (!selectedVideo) {
      toast.error("Please select a video first.");
      return;
    }
    
    if (selectedLanguages.length === 0) {
      toast.error("Please select at least one language for dubbing.");
      return;
    }
    
    setShowCreditConfirm(true);
  };

  const confirmAndProcess = () => {
    const cost = calculateCost();
    
    spendCredits.mutate({
      amount: cost,
      service: "Video Dubbing",
      description: `Dubbed video in ${selectedLanguages.length} languages, ${voiceType === 'clone' ? 'with voice cloning' : 'with AI voice'}`
    }, {
      onSuccess: () => {
        setIsProcessing(true);
        
        setTimeout(() => {
          setIsProcessing(false);
          toast.success(`Your video has been dubbed in ${selectedLanguages.length} languages.`);
        }, 3000);
      },
      onError: (error) => {
        toast.error(`Failed to process: ${error.message}`);
      }
    });
  };

  const toggleLanguage = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      setSelectedLanguages(selectedLanguages.filter(code => code !== langCode));
    } else {
      setSelectedLanguages([...selectedLanguages, langCode]);
    }
  };

  const handleDeleteVideo = (video: VideoType) => {
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      deleteVideo.mutate(video.id, {
        onSuccess: () => {
          if (selectedVideo?.id === video.id) {
            setSelectedVideo(null);
          }
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Video Dubbing</h1>
        <p className="text-muted-foreground">
          Convert your videos into multiple languages with AI-powered voice cloning.
        </p>
      </div>

      <CreditConfirmDialog
        open={showCreditConfirm}
        setOpen={setShowCreditConfirm}
        serviceName="Video Dubbing"
        creditCost={totalCost}
        onConfirm={confirmAndProcess}
        description={`This will use ${totalCost} credits to dub your video in ${selectedLanguages.length} languages ${voiceType === 'clone' ? 'with voice cloning' : 'with AI voice'}.`}
      />

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upload">Select Video</TabsTrigger>
          <TabsTrigger value="dub">Dub</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Video</CardTitle>
              <CardDescription>
                Select a video to dub or upload a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedVideo ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {videoURL ? (
                      <video 
                        src={videoURL} 
                        className="w-full h-full object-contain"
                        controls
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{selectedVideo.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Size: {selectedVideo.file_size ? `${(selectedVideo.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(selectedVideo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">No video selected</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please select a video from your library or upload a new one
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Dialog open={videoSelectOpen} onOpenChange={setVideoSelectOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Select from Library
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Your Videos</DialogTitle>
                          <DialogDescription>
                            Select a video from your library to dub
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          {isLoadingVideos ? (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">Loading your videos...</p>
                            </div>
                          ) : videos && videos.length > 0 ? (
                            <div className="space-y-4">
                              {videos.map((video) => (
                                <div 
                                  key={video.id} 
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedVideo(video);
                                    setVideoSelectOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                      <Video className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{video.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(video.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteVideo(video);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No videos found in your library</p>
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setVideoSelectOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              setVideoSelectOpen(false);
                              setUploadDialogOpen(true);
                            }}
                          >
                            Upload New
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-youtube-red hover:bg-youtube-darkred">
                          Upload New Video
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload New Video</DialogTitle>
                          <DialogDescription>
                            Upload a video to get started with dubbing
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                            {isUploading ? (
                              <div className="space-y-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                  <span className="animate-spin">⟳</span>
                                </div>
                                <div>
                                  <p className="font-medium">Uploading video...</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {progress}% complete
                                  </p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div className="bg-youtube-red h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">Drag and drop or click to upload</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Supports MP4, MOV, AVI up to 500MB
                                  </p>
                                </div>
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
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setUploadDialogOpen(false)}
                            disabled={isUploading}
                          >
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedVideo(null)} 
                disabled={!selectedVideo}
              >
                Deselect
              </Button>
              <Button 
                variant="default"
                disabled={!selectedVideo}
                className="bg-youtube-red hover:bg-youtube-darkred"
              >
                Use This Video
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="dub" className="mt-6">
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Dubbing Settings</CardTitle>
                <CardDescription>
                  Configure voice and language settings for your video.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Voice Type</Label>
                    <ServiceCostDisplay 
                      cost={voiceType === 'clone' ? CREDIT_COSTS.VOICE_CLONE : 0} 
                      showLabel={false} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={voiceType === "clone" ? "default" : "outline"}
                      onClick={() => setVoiceType("clone")}
                      className={voiceType === "clone" ? "bg-youtube-red hover:bg-youtube-darkred" : ""}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Clone My Voice
                    </Button>
                    <Button 
                      variant={voiceType === "preset" ? "default" : "outline"}
                      onClick={() => setVoiceType("preset")}
                      className={voiceType === "preset" ? "bg-youtube-red hover:bg-youtube-darkred" : ""}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      Use AI Voice
                    </Button>
                  </div>
                </div>

                {voiceType === "preset" && (
                  <div className="space-y-2">
                    <Label htmlFor="voice-preference">Voice Preference</Label>
                    <Select value={voicePreference} onValueChange={setVoicePreference}>
                      <SelectTrigger id="voice-preference">
                        <SelectValue placeholder="Select voice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male1">Male (Natural)</SelectItem>
                        <SelectItem value="male2">Male (Deep)</SelectItem>
                        <SelectItem value="female1">Female (Natural)</SelectItem>
                        <SelectItem value="female2">Female (Professional)</SelectItem>
                        <SelectItem value="neutral">Gender Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Quality Level</Label>
                    <ServiceCostDisplay 
                      cost={qualityLevel === 'premium' ? CREDIT_COSTS.PREMIUM_QUALITY : 0} 
                      showLabel={false}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={qualityLevel === "standard" ? "default" : "outline"}
                      onClick={() => setQualityLevel("standard")}
                      className={qualityLevel === "standard" ? "bg-youtube-red hover:bg-youtube-darkred" : ""}
                    >
                      Standard
                    </Button>
                    <Button 
                      variant={qualityLevel === "premium" ? "default" : "outline"}
                      onClick={() => setQualityLevel("premium")}
                      className={qualityLevel === "premium" ? "bg-youtube-red hover:bg-youtube-darkred" : ""}
                    >
                      Premium
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Voice Settings</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Speed</span>
                        <span className="text-sm text-muted-foreground">Normal</span>
                      </div>
                      <Slider defaultValue={[50]} max={100} step={1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Pitch</span>
                        <span className="text-sm text-muted-foreground">Default</span>
                      </div>
                      <Slider defaultValue={[50]} max={100} step={1} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Target Languages</CardTitle>
                    <CardDescription>
                      Select the languages you want to dub your video into.
                    </CardDescription>
                  </div>
                  <ServiceCostDisplay 
                    cost={selectedLanguages.length * CREDIT_COSTS.PER_LANGUAGE} 
                    label="Per language" 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant="outline"
                        className={`justify-start ${
                          selectedLanguages.includes(lang.code) 
                            ? "border-youtube-red bg-youtube-red/10 text-youtube-red" 
                            : ""
                        }`}
                        onClick={() => toggleLanguage(lang.code)}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedLanguages.length} languages selected
                  </div>
                  {totalCost > 0 && (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      Total: {totalCost} credits
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleProcessVideo} 
                  disabled={!selectedVideo || isProcessing || selectedLanguages.length === 0 || !hasEnoughCredits(totalCost)}
                  className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
                >
                  {isProcessing ? "Processing..." : hasEnoughCredits(totalCost) ? "Generate Dubbed Videos" : "Not Enough Credits"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Dubbed Videos</CardTitle>
              <CardDescription>
                Preview and download your dubbed videos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedVideo ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No dubbed videos yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a video and generate dubs to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    {videoURL ? (
                      <video 
                        src={videoURL} 
                        className="w-full h-full object-contain"
                        controls
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Available Languages</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Globe className="mr-2 h-4 w-4" />
                        Original (English)
                      </Button>
                      {selectedLanguages.map((code) => (
                        <Button key={code} variant="outline" className="justify-start">
                          <Globe className="mr-2 h-4 w-4" />
                          {languages.find(l => l.code === code)?.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button disabled={!selectedVideo || selectedLanguages.length === 0} variant="outline">
                Download All
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoDubbing;

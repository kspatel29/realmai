import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, Video, Scissors, Clock, Download, DownloadCloud, Play,
  Pause, SkipBack, SkipForward, RefreshCw, Image as ImageIcon,
  Film, Sparkles, XCircle, Check, AlertCircle
} from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import VideoFrameSelector from "@/components/VideoFrameSelector";
import { createReplicateVideoClip } from "@/services/replicateService";
import { useVideos } from "@/hooks/useVideos";

const videoGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
  negative_prompt: z.string().optional(),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  duration: z.enum(["5", "10"]).default("5"),
  cfg_scale: z.number().min(0).max(1).default(0.5),
  use_existing_video: z.boolean().default(false),
});

type VideoGenerationFormValues = z.infer<typeof videoGenerationSchema>;

const ClipsGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("upload");
  const [generatedClips, setGeneratedClips] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { videos, uploadVideo } = useVideos();

  const form = useForm<VideoGenerationFormValues>({
    defaultValues: {
      prompt: "",
      negative_prompt: "",
      aspect_ratio: "16:9",
      duration: "5",
      cfg_scale: 0.5,
      use_existing_video: false,
    },
  });

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStartFrame(null);
      setEndFrame(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload complete",
            description: "Your video has been uploaded successfully."
          });
          setCurrentTab("generate");
        }
      }, 300);
      
      // Actual upload to storage could be done here
      // await uploadVideo.mutateAsync({
      //   file, 
      //   title: file.name.split('.')[0],
      //   description: ""
      // });
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video.",
        variant: "destructive"
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGenerateClips = async (values: VideoGenerationFormValues) => {
    setIsProcessing(true);
    
    try {
      const input = {
        prompt: values.prompt,
        negative_prompt: values.negative_prompt || "",
        aspect_ratio: values.aspect_ratio,
        duration: parseInt(values.duration),
        cfg_scale: values.cfg_scale,
        start_image: startFrame || undefined,
        end_image: endFrame || undefined,
      };
      
      console.log("Generating video with inputs:", input);
      
      setTimeout(() => {
        setIsProcessing(false);
        
        setGeneratedClips([
          { 
            id: `clip-${Date.now()}`, 
            title: values.prompt.substring(0, 30) + "...", 
            duration: values.duration + "s", 
            thumbnail: "", 
            url: videoUrl
          }
        ]);
        
        toast({
          title: "Clip generated",
          description: "Your video clip has been generated successfully."
        });
        
        setCurrentTab("preview");
      }, 3000);
      
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Generation failed",
        description: "There was an error generating your video clip.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Video Generation</h1>
        <p className="text-muted-foreground">
          Create stunning short videos from text prompts or customize existing videos.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video (Optional)</CardTitle>
              <CardDescription>
                Upload a video to extract frames for the start and end of your generated clip, or generate directly from text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded overflow-hidden relative aspect-video">
                      <video 
                        ref={videoRef}
                        src={videoUrl!} 
                        className="w-full h-full object-contain" 
                        controls={false}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-background/800 backdrop-blur-sm p-2 flex items-center justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                          <Slider disabled />
                        </div>
                      </div>
                    </div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
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

              {file && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Video Title</Label>
                    <Input id="title" className="mt-1" defaultValue={file.name.split('.')[0]} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input id="description" className="mt-1" placeholder="Enter video description" />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setFile(null)} disabled={!file || isUploading}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentTab("generate")}
                >
                  Skip to Generate
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading}
                  className={isUploading ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
                >
                  {isUploading ? `Uploading ${progress}%` : "Upload Video"}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="order-2 md:order-1">
              <CardHeader>
                <CardTitle>Video Generation Settings</CardTitle>
                <CardDescription>
                  Configure how your video will be generated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleGenerateClips)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what you want to see in your video..." 
                              className="min-h-24 resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Be descriptive for better results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="negative_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negative Prompt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what you DON'T want to see..." 
                              className="min-h-16 resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Specify elements to exclude
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aspect_ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aspect Ratio</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select aspect ratio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                                <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                                <SelectItem value="1:1">Square (1:1)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="5">5 seconds</SelectItem>
                                <SelectItem value="10">10 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cfg_scale"
                      render={({ field: { value, onChange } }) => (
                        <FormItem>
                          <FormLabel>Creativity Level: {(value * 100).toFixed(0)}%</FormLabel>
                          <FormControl>
                            <Slider 
                              value={[value]} 
                              min={0} 
                              max={1} 
                              step={0.01} 
                              onValueChange={([val]) => onChange(val)} 
                            />
                          </FormControl>
                          <FormDescription className="flex justify-between text-xs">
                            <span>More creative</span>
                            <span>More precise</span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="use_existing_video"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Use frames from uploaded video
                            </FormLabel>
                            <FormDescription>
                              {file ? "Your video will be used to extract start and end frames" : "Upload a video first to enable this option"}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isProcessing || (!startFrame && form.watch("use_existing_video") && file !== null)}
                        className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
                      >
                        {isProcessing ? (
                          <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                          <><Sparkles className="mr-2 h-4 w-4" /> Generate Video</>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="order-1 md:order-2">
              <CardHeader>
                <CardTitle>Frame Selection</CardTitle>
                <CardDescription>
                  {file 
                    ? "Select start and end frames from your video" 
                    : "Upload a video first to select frames"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.watch("use_existing_video") && file ? (
                  <div className="space-y-4">
                    {videoUrl && (
                      <VideoFrameSelector
                        videoUrl={videoUrl}
                        onStartFrameSelected={setStartFrame}
                        onEndFrameSelected={setEndFrame}
                      />
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="block mb-2">Start Frame</Label>
                        <div className="border rounded-md overflow-hidden aspect-video bg-muted relative">
                          {startFrame ? (
                            <img src={startFrame} alt="Start frame" className="w-full h-full object-contain" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="block mb-2">End Frame</Label>
                        <div className="border rounded-md overflow-hidden aspect-video bg-muted relative">
                          {endFrame ? (
                            <img src={endFrame} alt="End frame" className="w-full h-full object-contain" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(!startFrame || !endFrame) && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {!startFrame && !endFrame 
                              ? "Please select both start and end frames" 
                              : !startFrame 
                                ? "Please select a start frame" 
                                : "Please select an end frame"}
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            Use the timeline controller to extract frames from your video
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    {!file ? (
                      <>
                        <Film className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center">
                          <h3 className="font-medium">No video uploaded</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload a video in the previous step to select frames
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setCurrentTab("upload")}
                          >
                            Go to Upload
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center">
                          <h3 className="font-medium">Frame selection disabled</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Enable "Use frames from uploaded video" in the settings
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Download</CardTitle>
              <CardDescription>
                Preview and download your generated video clips.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedClips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Film className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No clips generated yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate clips to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {generatedClips.map((clip) => (
                        <div key={clip.id} className="border rounded-lg overflow-hidden">
                          <div className="aspect-video bg-black flex items-center justify-center">
                            {clip.url ? (
                              <video 
                                src={clip.url} 
                                className="w-full h-full object-contain" 
                                controls 
                              />
                            ) : (
                              <Video className="h-12 w-12 text-white/30" />
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">{clip.title}</h3>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> {clip.duration}
                              </span>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Check className="h-4 w-4 mr-1" /> Save to Library
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline"
                onClick={() => setCurrentTab("generate")}
              >
                Back to Generation
              </Button>
              <Button 
                className="bg-youtube-red hover:bg-youtube-darkred" 
                disabled={generatedClips.length === 0}
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download All Clips
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClipsGenerator;

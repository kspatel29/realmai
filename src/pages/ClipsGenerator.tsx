
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Upload, Scissors, Clock, Download, Sparkles, Wand2, CheckCircle2, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const videoAspectRatios = [
  { id: "portrait", name: "Portrait (9:16)", icon: "■" },
  { id: "square", name: "Square (1:1)", icon: "▣" },
  { id: "landscape", name: "Landscape (16:9)", icon: "▭" },
];

const ClipsGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clipCount, setClipCount] = useState(5);
  const [clipMode, setClipMode] = useState("auto");
  const [clipAspectRatio, setClipAspectRatio] = useState("portrait");
  const [generateTitleOption, setGenerateTitleOption] = useState(true);
  const [generateCaptionsOption, setGenerateCaptionsOption] = useState(true);
  const [addMusicOption, setAddMusicOption] = useState(true);
  const [addBrandingOption, setAddBrandingOption] = useState(true);
  const [generatedClips, setGeneratedClips] = useState<any[]>([]);
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
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
      }
    }, 300);
  };

  const handleGenerateClips = () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generate sample clips
      const clips = Array.from({ length: clipCount }, (_, i) => ({
        id: i + 1,
        title: `Amazing Viral Clip ${i + 1}`,
        duration: `${Math.floor(Math.random() * 20 + 10)} sec`,
        thumbnail: "/placeholder.svg",
        aspect: clipAspectRatio,
        views: Math.floor(Math.random() * 1000),
      }));
      
      setGeneratedClips(clips);
      
      toast({
        title: "Clips generated",
        description: `${clipCount} viral clips have been generated.`
      });
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Clips Generator</h1>
        <p className="text-muted-foreground">
          Automatically generate viral short-form clips from your long-form content.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="clips">Generated Clips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Long-Form Video</CardTitle>
              <CardDescription>
                Upload the video you want to extract viral clips from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-2">
                    <div className="bg-muted rounded h-48 flex items-center justify-center">
                      <Scissors className="h-12 w-12 text-muted-foreground" />
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
                        Supports MP4, MOV, AVI up to 2GB
                      </p>
                    </div>
                    <Input 
                      id="clips-upload" 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('clips-upload')?.click()}
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
                  <div className="flex items-center space-x-2">
                    <Checkbox id="analyze-content" defaultChecked />
                    <label htmlFor="analyze-content" className="text-sm font-medium">
                      Analyze content for viral moments automatically
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setFile(null)} disabled={!file || isUploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className={isUploading ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
              >
                {isUploading ? `Uploading ${progress}%` : "Upload Video"}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
                <CardDescription>
                  Configure how your clips are generated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Clip Generation Mode</Label>
                  <RadioGroup value={clipMode} onValueChange={setClipMode} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="auto" id="auto" />
                      <label htmlFor="auto" className="text-sm font-medium">
                        Fully Automatic
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="assisted" id="assisted" />
                      <label htmlFor="assisted" className="text-sm font-medium">
                        AI-Assisted Selection
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <label htmlFor="manual" className="text-sm font-medium">
                        Manual Selection
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Number of Clips</Label>
                    <span className="text-sm text-muted-foreground">{clipCount} clips</span>
                  </div>
                  <Slider
                    value={[clipCount]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setClipCount(value[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Each clip uses 1 credit from your plan
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Clip Duration</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue placeholder="Select clip duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (15-30 seconds)</SelectItem>
                      <SelectItem value="medium">Medium (30-45 seconds)</SelectItem>
                      <SelectItem value="long">Long (45-60 seconds)</SelectItem>
                      <SelectItem value="auto">Auto (AI optimized)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>
                  Fine-tune your clip generation settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Clip Aspect Ratio</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {videoAspectRatios.map((ratio) => (
                      <Button
                        key={ratio.id}
                        variant="outline"
                        className={`justify-start ${
                          clipAspectRatio === ratio.id 
                            ? "border-youtube-red bg-youtube-red/10 text-youtube-red" 
                            : ""
                        }`}
                        onClick={() => setClipAspectRatio(ratio.id)}
                      >
                        <span className="mr-2 text-xl">{ratio.icon}</span>
                        {ratio.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Enhancement Options</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="generate-title" className="text-sm font-medium">
                          Generate catchy titles
                        </Label>
                      </div>
                      <Switch
                        id="generate-title"
                        checked={generateTitleOption}
                        onCheckedChange={setGenerateTitleOption}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="generate-captions" className="text-sm font-medium">
                          Add automatic captions
                        </Label>
                      </div>
                      <Switch
                        id="generate-captions"
                        checked={generateCaptionsOption}
                        onCheckedChange={setGenerateCaptionsOption}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wand2 className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="add-music" className="text-sm font-medium">
                          Add trending background music
                        </Label>
                      </div>
                      <Switch
                        id="add-music"
                        checked={addMusicOption}
                        onCheckedChange={setAddMusicOption}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="add-branding" className="text-sm font-medium">
                          Add channel branding
                        </Label>
                      </div>
                      <Switch
                        id="add-branding"
                        checked={addBrandingOption}
                        onCheckedChange={setAddBrandingOption}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button 
                  onClick={handleGenerateClips} 
                  disabled={!file || isProcessing}
                  className="ml-auto bg-youtube-red hover:bg-youtube-darkred"
                >
                  {isProcessing ? "Processing..." : "Generate Clips"}
                  <Scissors className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="clips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Clips</CardTitle>
              <CardDescription>
                Preview and download your viral clips.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedClips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Scissors className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No clips generated yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your settings and generate clips to see them here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {generatedClips.map((clip) => (
                      <div key={clip.id} className="border rounded-lg overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40">
                              <Play className="h-8 w-8 text-white" />
                            </Button>
                          </div>
                          <div className={`absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-md`}>
                            {clip.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{clip.title}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">{clip.views} potential views</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="ml-auto space-x-2">
                <Button variant="outline" disabled={generatedClips.length === 0}>
                  Generate More
                </Button>
                <Button 
                  className="bg-youtube-red hover:bg-youtube-darkred"
                  disabled={generatedClips.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All Clips
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClipsGenerator;

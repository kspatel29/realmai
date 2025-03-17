
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Upload, FileText, Scissors, Video, Clock, Download, DownloadCloud } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const ClipsGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
      setGeneratedClips([
        { id: 1, title: "Exciting Moment", duration: "0:42", thumbnail: "" },
        { id: 2, title: "Key Insight", duration: "1:15", thumbnail: "" },
        { id: 3, title: "Highlight", duration: "0:38", thumbnail: "" }
      ]);
      toast({
        title: "Clips generated",
        description: "We've generated 3 clips from your video."
      });
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Clips Generator</h1>
        <p className="text-muted-foreground">
          Automatically create short, engaging clips from your longer videos to share on social media.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Upload the video you want to generate clips from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-2">
                    <div className="bg-muted rounded h-48 flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
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
        
        <TabsContent value="generate" className="mt-6">
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Clip Settings</CardTitle>
                <CardDescription>
                  Configure how your clips will be generated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clip-type">Clip Type</Label>
                  <Select defaultValue="highlights">
                    <SelectTrigger id="clip-type">
                      <SelectValue placeholder="Select clip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highlights">Key Highlights</SelectItem>
                      <SelectItem value="insights">Valuable Insights</SelectItem>
                      <SelectItem value="quotes">Quotable Moments</SelectItem>
                      <SelectItem value="custom">Custom (Manual Selection)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clips-count">Number of Clips</Label>
                  <Select defaultValue="3">
                    <SelectTrigger id="clips-count">
                      <SelectValue placeholder="Select number of clips" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Clip</SelectItem>
                      <SelectItem value="3">3 Clips</SelectItem>
                      <SelectItem value="5">5 Clips</SelectItem>
                      <SelectItem value="10">10 Clips</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Clip Duration</Label>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">30 seconds</span>
                    <span className="text-sm">2 minutes</span>
                  </div>
                  <Slider defaultValue={[45]} max={120} step={15} />
                  <p className="text-xs text-muted-foreground">Selected duration: 45 seconds</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="add-captions" defaultChecked />
                    <label htmlFor="add-captions" className="text-sm font-medium">
                      Add captions to clips
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="add-intro" />
                    <label htmlFor="add-intro" className="text-sm font-medium">
                      Add intro & outro
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="optimize-vertical" defaultChecked />
                    <label htmlFor="optimize-vertical" className="text-sm font-medium">
                      Optimize for vertical (9:16)
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Our AI will analyze your video to find the most engaging moments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>AI Detection Focus</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="focus-energy" defaultChecked />
                      <label htmlFor="focus-energy" className="text-sm font-medium">
                        High energy moments
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="focus-insights" defaultChecked />
                      <label htmlFor="focus-insights" className="text-sm font-medium">
                        Key insights
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="focus-humor" defaultChecked />
                      <label htmlFor="focus-humor" className="text-sm font-medium">
                        Humor & entertainment
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="focus-facts" />
                      <label htmlFor="focus-facts" className="text-sm font-medium">
                        Facts & statistics
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Optimization Target</Label>
                  <Select defaultValue="tiktok">
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram">Instagram Reels</SelectItem>
                      <SelectItem value="youtube">YouTube Shorts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                    <Scissors className="h-8 w-8 text-youtube-red" />
                  </div>
                  <h3 className="font-medium text-lg">Ready to generate clips</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    Our AI will analyze your video and extract the most engaging moments based on your settings.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                <Button 
                  onClick={handleGenerateClips} 
                  disabled={!file || isProcessing}
                  className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
                >
                  {isProcessing ? "Processing..." : "Generate Clips"}
                  <Scissors className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Export Clips</CardTitle>
              <CardDescription>
                Review, edit, and download your generated clips.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedClips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No clips generated yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a video and generate clips to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {generatedClips.map((clip) => (
                        <div key={clip.id} className="border rounded-lg overflow-hidden">
                          <div className="aspect-video bg-black flex items-center justify-center">
                            <Video className="h-12 w-12 text-white/30" />
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
                                Edit
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
            <CardFooter className="flex justify-end border-t pt-6">
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

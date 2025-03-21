import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Play, Pause, Globe, Mic, Wand2, Coins } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import CreditConfirmDialog from "@/components/CreditConfirmDialog";
import { useCredits } from "@/hooks/useCredits";

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
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [voiceType, setVoiceType] = useState("clone");
  const [voicePreference, setVoicePreference] = useState("male1");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<'standard' | 'premium'>('standard');
  const { credits, useCredits: spendCredits, hasEnoughCredits } = useCredits();
  
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

  const calculateCost = (): number => {
    if (!file || selectedLanguages.length === 0) return 0;
    
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
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="dub">Dub</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Upload the video you want to dub into other languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-2">
                    <div className="bg-muted rounded h-48 flex items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
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
                  disabled={!file || isProcessing || selectedLanguages.length === 0 || !hasEnoughCredits(totalCost)}
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
              {!file ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No dubbed videos yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a video and generate dubs to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                    <button
                      className="z-10 h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white" />
                      )}
                    </button>
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
              <Button disabled={!file || selectedLanguages.length === 0} variant="outline">
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

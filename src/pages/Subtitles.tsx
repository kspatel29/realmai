import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Clock, Download, DownloadCloud, Globe, Check, Coins } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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

const formats = [
  { id: "srt", name: "SRT" },
  { id: "vtt", name: "VTT (Web)" },
  { id: "txt", name: "Plain Text" },
  { id: "json", name: "JSON" },
];

const CREDIT_COSTS = {
  BASE_COST: 3,
  PER_LANGUAGE: 2,
  HIGH_ACCURACY: 3,
  PREMIUM_ACCURACY: 6,
  CULTURAL_ADAPTATION: 2
};

const Subtitles = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["srt"]);
  const [progress, setProgress] = useState(0);
  const [editableText, setEditableText] = useState("");
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [accuracyLevel, setAccuracyLevel] = useState<'standard' | 'high' | 'premium'>('standard');
  const [useCulturalAdaptation, setUseCulturalAdaptation] = useState(false);
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
        setEditableText(
          "00:00:01,000 --> 00:00:05,000\nWelcome to this video about RealmAI.\n\n00:00:05,500 --> 00:00:10,000\nToday we'll discuss how to expand your global reach.\n\n00:00:10,500 --> 00:00:15,000\nWith our AI-powered tools, you can reach audiences worldwide."
        );
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
    if (accuracyLevel === 'high') {
      totalCost += CREDIT_COSTS.HIGH_ACCURACY;
    } else if (accuracyLevel === 'premium') {
      totalCost += CREDIT_COSTS.PREMIUM_ACCURACY;
    }
    if (useCulturalAdaptation) {
      totalCost += CREDIT_COSTS.CULTURAL_ADAPTATION;
    }
    
    return totalCost;
  };

  const totalCost = calculateCost();

  const handleProcessSubtitles = () => {
    if (selectedLanguages.length === 0) {
      toast.error("Please select at least one language for subtitles.");
      return;
    }
    
    setShowCreditConfirm(true);
  };

  const confirmAndProcess = () => {
    const cost = calculateCost();
    
    spendCredits.mutate({
      amount: cost,
      service: "Subtitle Generator",
      description: `Generated subtitles in ${selectedLanguages.length} languages, with ${accuracyLevel} accuracy${useCulturalAdaptation ? ' and cultural adaptation' : ''}`
    }, {
      onSuccess: () => {
        setIsProcessing(true);
        
        setTimeout(() => {
          setIsProcessing(false);
          toast.success(`Subtitles have been generated in ${selectedLanguages.length} languages.`);
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

  const toggleFormat = (formatId: string) => {
    if (selectedFormats.includes(formatId)) {
      if (selectedFormats.length > 1) {
        setSelectedFormats(selectedFormats.filter(id => id !== formatId));
      }
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Subtitle Generator</h1>
        <p className="text-muted-foreground">
          Create accurate subtitles in multiple languages automatically.
        </p>
      </div>

      <CreditConfirmDialog
        open={showCreditConfirm}
        setOpen={setShowCreditConfirm}
        serviceName="Subtitle Generator"
        creditCost={totalCost}
        onConfirm={confirmAndProcess}
        description={`This will use ${totalCost} credits to generate subtitles in ${selectedLanguages.length} languages with ${accuracyLevel} accuracy${useCulturalAdaptation ? ' and cultural adaptation' : ''}.`}
      />

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Upload the video you want to generate subtitles for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-2">
                    <div className="bg-muted rounded h-48 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground" />
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
                        Supports MP4, MOV, AVI, or existing subtitle files
                      </p>
                    </div>
                    <Input 
                      id="subtitle-upload" 
                      type="file" 
                      accept="video/*,.srt,.vtt,.txt" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('subtitle-upload')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-transcribe" defaultChecked />
                  <label htmlFor="auto-transcribe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Auto-transcribe original audio
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="burn-subtitles" />
                  <label htmlFor="burn-subtitles" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Burn subtitles into video (hardcoded)
                  </label>
                </div>
              </div>
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
                {isUploading ? `Uploading ${progress}%` : "Upload & Analyze"}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure subtitle generation settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="accuracy-level">Accuracy Level</Label>
                    <ServiceCostDisplay 
                      cost={accuracyLevel === 'high' ? CREDIT_COSTS.HIGH_ACCURACY : 
                            accuracyLevel === 'premium' ? CREDIT_COSTS.PREMIUM_ACCURACY : 0} 
                      showLabel={false} 
                    />
                  </div>
                  <Select value={accuracyLevel} onValueChange={(val: 'standard' | 'high' | 'premium') => setAccuracyLevel(val)}>
                    <SelectTrigger id="accuracy-level">
                      <SelectValue placeholder="Select accuracy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Higher accuracy uses more credits but produces better results
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle-style">Subtitle Style</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="subtitle-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="simplified">Simplified</SelectItem>
                      <SelectItem value="expanded">Expanded (for learning)</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="translate-captions" defaultChecked />
                    <label htmlFor="translate-captions" className="text-sm font-medium">
                      Translate captions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="grammar-check" defaultChecked />
                    <label htmlFor="grammar-check" className="text-sm font-medium">
                      Apply grammar correction
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cultural-adaptation" 
                        checked={useCulturalAdaptation}
                        onCheckedChange={(checked) => setUseCulturalAdaptation(checked === true)}
                      />
                      <label htmlFor="cultural-adaptation" className="text-sm font-medium">
                        Cultural adaptation
                      </label>
                    </div>
                    {useCulturalAdaptation && (
                      <ServiceCostDisplay cost={CREDIT_COSTS.CULTURAL_ADAPTATION} showLabel={false} />
                    )}
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
                      Select the languages you want to generate subtitles in.
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
                  onClick={handleProcessSubtitles} 
                  disabled={!file || isProcessing || selectedLanguages.length === 0 || !hasEnoughCredits(totalCost)}
                  className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
                >
                  {isProcessing ? "Processing..." : hasEnoughCredits(totalCost) ? "Generate Subtitles" : "Not Enough Credits"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Subtitles</CardTitle>
              <CardDescription>
                Make adjustments to the generated subtitles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!editableText ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No subtitles to edit yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a video and generate subtitles first
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="language-select">Select Language</Label>
                    <Button variant="outline" size="sm" className="h-8">
                      <Clock className="mr-2 h-3 w-3" />
                      Adjust Timings
                    </Button>
                  </div>
                  <Select defaultValue="original">
                    <SelectTrigger id="language-select">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original (English)</SelectItem>
                      {selectedLanguages.map(code => (
                        <SelectItem key={code} value={code}>
                          {languages.find(l => l.code === code)?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Textarea 
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  
                  <div className="flex justify-between">
                    <Button variant="outline">
                      Reset to Original
                    </Button>
                    <Button className="bg-youtube-red hover:bg-youtube-darkred">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="download" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Subtitles</CardTitle>
              <CardDescription>
                Download your subtitles in various formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!file ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Download className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No subtitles available yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate subtitles first to download them
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>File Formats</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {formats.map((format) => (
                        <Button
                          key={format.id}
                          variant="outline"
                          className={`justify-start ${
                            selectedFormats.includes(format.id) 
                              ? "border-youtube-red bg-youtube-red/10 text-youtube-red" 
                              : ""
                          }`}
                          onClick={() => toggleFormat(format.id)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {format.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg divide-y">
                    <div className="p-4">
                      <h3 className="font-medium">Original (English)</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">All selected formats</span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    {selectedLanguages.map((code) => (
                      <div key={code} className="p-4">
                        <h3 className="font-medium">{languages.find(l => l.code === code)?.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground">All selected formats</span>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button 
                className="bg-youtube-red hover:bg-youtube-darkred" 
                disabled={!file || selectedLanguages.length === 0}
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download All Subtitles
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subtitles;

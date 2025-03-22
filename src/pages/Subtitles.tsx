import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Clock, Download, DownloadCloud, Globe, Check, Coins, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import CreditConfirmDialog from "@/components/CreditConfirmDialog";
import { useCredits } from "@/hooks/useCredits";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AudioVideoFileUploader from "@/components/AudioVideoFileUploader";
import { generateSubtitles, checkSubtitlesStatus } from "@/services/api/subtitlesService";
import { useQuery } from "@tanstack/react-query";

const MODEL_SIZES = [
  { id: "tiny.en", name: "Tiny (English only)" },
  { id: "tiny", name: "Tiny (Multilingual)" },
  { id: "base.en", name: "Base (English only)" },
  { id: "base", name: "Base (Multilingual)" },
  { id: "small.en", name: "Small (English only)" },
  { id: "small", name: "Small (Multilingual)" },
  { id: "medium.en", name: "Medium (English only)" },
  { id: "medium", name: "Medium (Multilingual)" },
  { id: "large-v1", name: "Large v1" },
  { id: "large-v2", name: "Large v2" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ru", name: "Russian" },
  { code: "ko", name: "Korean" },
  { code: "fr", name: "French" },
  { code: "ja", name: "Japanese" },
  { code: "pt", name: "Portuguese" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "id", name: "Indonesian" },
  { code: "vi", name: "Vietnamese" },
];

const formats = [
  { id: "srt", name: "SRT" },
  { id: "vtt", name: "VTT (Web)" },
];

const CREDIT_COSTS = {
  BASE_COST: 3,
  LARGE_MODEL: 6,
  MEDIUM_MODEL: 4,
  SMALL_MODEL: 3,
  TINY_MODEL: 2,
};

const subtitlesFormSchema = z.object({
  language: z.string().default("en"),
  model_name: z.string().default("small"),
  vad_filter: z.boolean().default(true),
});

type SubtitlesFormValues = z.infer<typeof subtitlesFormSchema>;

const Subtitles = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["srt", "vtt"]);
  const [progress, setProgress] = useState(0);
  const [editableText, setEditableText] = useState("");
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [srtFileUrl, setSrtFileUrl] = useState<string | null>(null);
  const [vttFileUrl, setVttFileUrl] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [isFromVideo, setIsFromVideo] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { credits, useCredits: spendCredits, hasEnoughCredits } = useCredits();
  
  const { toast } = useToast();

  const form = useForm<SubtitlesFormValues>({
    resolver: zodResolver(subtitlesFormSchema),
    defaultValues: {
      language: "en",
      model_name: "small",
      vad_filter: true,
    },
  });

  const watchModelName = form.watch("model_name");

  const { data: predictionStatus } = useQuery({
    queryKey: ['subtitles-status', predictionId],
    queryFn: async () => {
      if (!predictionId) return null;
      return await checkSubtitlesStatus(predictionId);
    },
    enabled: !!predictionId && isProcessing,
    refetchInterval: 3000
  });

  useEffect(() => {
    if (!predictionStatus) return;
    
    if (predictionStatus.status === "succeeded") {
      setIsProcessing(false);
      setPredictionId(null);
      
      if (predictionStatus.output) {
        setSrtFileUrl(predictionStatus.output.srt_file);
        setVttFileUrl(predictionStatus.output.vtt_file);
        setEditableText(predictionStatus.output.preview || "");
        sonnerToast.success("Subtitles have been generated successfully.");
      }
    } else if (predictionStatus.status === "failed") {
      setIsProcessing(false);
      setPredictionId(null);
      sonnerToast.error("Failed to generate subtitles: " + (predictionStatus.error || "Unknown error"));
    }
  }, [predictionStatus]);

  const handleFileUploaded = (url: string, fromVideo: boolean, fileName?: string) => {
    setUploadedFileUrl(url);
    setIsFromVideo(fromVideo);
    if (fileName) {
      setUploadedFileName(fileName);
    }
  };

  const calculateCost = (): number => {
    if (!uploadedFileUrl) return 0;
    
    let totalCost = CREDIT_COSTS.BASE_COST;
    
    if (watchModelName?.includes('large')) {
      totalCost += CREDIT_COSTS.LARGE_MODEL;
    } else if (watchModelName?.includes('medium')) {
      totalCost += CREDIT_COSTS.MEDIUM_MODEL;
    } else if (watchModelName?.includes('small')) {
      totalCost += CREDIT_COSTS.SMALL_MODEL;
    } else if (watchModelName?.includes('tiny')) {
      totalCost += CREDIT_COSTS.TINY_MODEL;
    }
    
    if (isFromVideo) {
      totalCost += 1;
    }
    
    return totalCost;
  };

  const totalCost = calculateCost();

  const handleGenerateSubtitles = () => {
    if (!uploadedFileUrl) {
      sonnerToast.error("Please upload a file first.");
      return;
    }
    
    setShowCreditConfirm(true);
  };

  const confirmAndProcess = async () => {
    const cost = calculateCost();
    const formValues = form.getValues();
    
    spendCredits.mutate({
      amount: cost,
      service: "Subtitle Generator",
      description: `Generated subtitles using ${formValues.model_name} model${isFromVideo ? ' from video' : ''}`
    }, {
      onSuccess: async () => {
        setIsProcessing(true);
        
        try {
          const response = await generateSubtitles({
            audioPath: uploadedFileUrl,
            modelName: formValues.model_name,
            language: formValues.language,
            vadFilter: formValues.vad_filter
          });
          
          if (response) {
            setSrtFileUrl(response.srt_file);
            setVttFileUrl(response.vtt_file);
            setEditableText(response.preview || "");
            setIsProcessing(false);
            sonnerToast.success("Subtitles have been generated successfully.");
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes("id:")) {
            try {
              const idMatch = error.message.match(/id: ([a-zA-Z0-9]+)/);
              if (idMatch && idMatch[1]) {
                setPredictionId(idMatch[1]);
                sonnerToast.info("Subtitle generation has started. This may take a few minutes.");
              } else {
                throw new Error("Failed to extract prediction ID");
              }
            } catch (extractError) {
              setIsProcessing(false);
              sonnerToast.error(`Failed to process: ${extractError instanceof Error ? extractError.message : "An error occurred"}`);
            }
          } else {
            setIsProcessing(false);
            sonnerToast.error(`Failed to process: ${error instanceof Error ? error.message : "An error occurred"}`);
          }
        }
      },
      onError: (error) => {
        sonnerToast.error(`Failed to process: ${error.message}`);
      }
    });
  };

  const handleFormSubmit = (values: SubtitlesFormValues) => {
    console.log("Form values:", values);
    handleGenerateSubtitles();
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
          Create accurate subtitles from audio and video files automatically.
        </p>
      </div>

      <CreditConfirmDialog
        open={showCreditConfirm}
        setOpen={setShowCreditConfirm}
        serviceName="Subtitle Generator"
        creditCost={totalCost}
        onConfirm={confirmAndProcess}
        description={`This will use ${totalCost} credits to generate subtitles using the ${watchModelName} model${isFromVideo ? ' (including video processing)' : ''}.`}
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
              <CardTitle>Upload Audio/Video</CardTitle>
              <CardDescription>
                Upload the audio or video file you want to generate subtitles for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioVideoFileUploader 
                onFileUploaded={handleFileUploaded}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Subtitle Settings</CardTitle>
                      <CardDescription>
                        Configure settings for generating subtitles.
                      </CardDescription>
                    </div>
                    <ServiceCostDisplay cost={totalCost} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="model_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MODEL_SIZES.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Larger models are more accurate but use more credits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The main language in the audio (helps with accuracy)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vad_filter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Voice Activity Detection</FormLabel>
                          <FormDescription>
                            Filter out parts of the audio without speech
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                Powered by OpenAI's Whisper model via Replicate
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="text-sm text-muted-foreground">
                          Processing time depends on file length and model size
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <div className="text-sm text-muted-foreground">
                    {uploadedFileName ? uploadedFileName : "No file selected"}
                  </div>
                  <Button 
                    type="submit"
                    disabled={!uploadedFileUrl || isProcessing || !hasEnoughCredits(totalCost)}
                    className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
                  >
                    {isProcessing ? "Processing..." : hasEnoughCredits(totalCost) ? "Generate Subtitles" : "Not Enough Credits"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
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
                    Upload a file and generate subtitles first
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="format-select">Format</Label>
                    <Button variant="outline" size="sm" className="h-8">
                      <Clock className="mr-2 h-3 w-3" />
                      Adjust Timings
                    </Button>
                  </div>
                  <Select defaultValue="srt">
                    <SelectTrigger id="format-select">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="srt">SRT Format</SelectItem>
                      <SelectItem value="vtt">VTT Format</SelectItem>
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
              {!srtFileUrl && !vttFileUrl ? (
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
                      <h3 className="font-medium">Generated Subtitles</h3>
                      <div className="flex space-x-2 mt-2">
                        {srtFileUrl && selectedFormats.includes("srt") && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={srtFileUrl} download="subtitles.srt">
                              <Download className="mr-2 h-3 w-3" />
                              Download SRT
                            </a>
                          </Button>
                        )}
                        {vttFileUrl && selectedFormats.includes("vtt") && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={vttFileUrl} download="subtitles.vtt">
                              <Download className="mr-2 h-3 w-3" />
                              Download VTT
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button 
                className="bg-youtube-red hover:bg-youtube-darkred" 
                disabled={!srtFileUrl && !vttFileUrl}
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download All Formats
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subtitles;

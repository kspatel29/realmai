
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Components
import VideoUploader from "@/features/clips/components/VideoUploader";
import FrameSelectionPanel from "@/features/clips/components/FrameSelectionPanel";
import VideoGenerationForm, { videoGenerationSchema } from "@/features/clips/components/VideoGenerationForm";
import ClipPreview from "@/features/clips/components/ClipPreview";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

// Hooks
import { useVideoGeneration } from "@/features/clips/hooks/useVideoGeneration";

type VideoGenerationFormValues = z.infer<typeof videoGenerationSchema>;

const ClipsGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("upload");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);

  const { isProcessing, generatedClips, generateVideoClip, videoCost, calculateCost } = useVideoGeneration();

  const form = useForm<VideoGenerationFormValues>({
    defaultValues: {
      prompt: "",
      aspect_ratio: "16:9",
      duration: "5",
      loop: false,
      use_existing_video: false,
      upload_start_frame: false,
      upload_end_frame: false,
    },
  });

  // Handle tab change enforcement
  const handleTabChange = (value: string) => {
    // For generate tab, either require a video file or allow text-only generation
    if (value === "generate" && !file) {
      // Still allow access to generate tab, as users can generate videos from text only
      setCurrentTab(value);
      return;
    }
    
    // For preview tab, only allow if there are generated clips or if processing
    if (value === "preview" && generatedClips.length === 0 && !isProcessing) {
      toast("No clips generated yet. Generate a clip first.");
      return;
    }
    
    setCurrentTab(value);
  };

  // Update cost when duration changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "duration" && value.duration) {
        setIsCalculatingCost(true);
        calculateCost(parseInt(value.duration as string))
          .finally(() => setIsCalculatingCost(false));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, calculateCost]);

  // Get video file's duration when selected
  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
      };
      
      video.onerror = () => {
        console.error("Error getting video duration");
        setVideoDuration(null);
      };
    }
  }, [videoUrl]);

  const handleVideoSelected = (selectedFile: File, url: string) => {
    setFile(selectedFile);
    setVideoUrl(url);
    setStartFrame(null);
    setEndFrame(null);
  };

  const handleUploadComplete = () => {
    setCurrentTab("generate");
  };

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          setStartFrame(event.target.result as string);
        }
      };
      fileReader.readAsDataURL(e.target.files[0]);
    } else {
      // Clear the frame if no file is selected
      setStartFrame(null);
    }
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          setEndFrame(event.target.result as string);
        }
      };
      fileReader.readAsDataURL(e.target.files[0]);
    } else {
      // Clear the frame if no file is selected
      setEndFrame(null);
    }
  };

  const handleGenerateClips = async (values: VideoGenerationFormValues) => {
    generateVideoClip(
      values,
      startFrame,
      endFrame,
      videoUrl,
      () => {
        setCurrentTab("preview");
        toast.success("Video has been generated and saved to your history");
      }
    );
  };

  // Display file duration in a readable format
  const getReadableDuration = () => {
    if (!videoDuration) return "";
    
    const minutes = Math.floor(videoDuration / 60);
    const seconds = Math.floor(videoDuration % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Video Generation</h1>
        <p className="text-muted-foreground">
          Create stunning short videos from text prompts or customize existing videos.
        </p>
      </div>

      {currentTab === "generate" && (
        <div className="flex justify-between items-center rounded-md bg-muted p-3">
          <div className="flex flex-col">
            <div className="font-medium">
              {file ? "Selected Video" : "Output Video"}
            </div>
            <div className="text-sm text-muted-foreground">
              {file ? (
                <>Duration: {getReadableDuration()}</>
              ) : (
                <>Duration: {form.watch("duration")}s</>
              )}
            </div>
          </div>
          <ServiceCostDisplay 
            cost={videoCost} 
            isCalculating={isCalculatingCost} 
          />
        </div>
      )}

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <VideoUploader 
            onVideoSelected={handleVideoSelected}
            onUploadComplete={handleUploadComplete}
            setCurrentTab={setCurrentTab}
          />
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="order-2 md:order-1">
              <VideoGenerationForm 
                form={form}
                isProcessing={isProcessing}
                file={file}
                startFrame={startFrame}
                endFrame={endFrame}
                onSubmit={handleGenerateClips}
                onStartFrameUpload={handleStartFrameUpload}
                onEndFrameUpload={handleEndFrameUpload}
                cost={videoCost}
              />
            </div>

            <div className="order-1 md:order-2">
              <FrameSelectionPanel 
                file={file}
                videoUrl={videoUrl}
                useFrames={form.watch("use_existing_video")}
                startFrame={startFrame}
                endFrame={endFrame}
                onStartFrameSelected={setStartFrame}
                onEndFrameSelected={setEndFrame}
                setCurrentTab={setCurrentTab}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <ClipPreview 
            clips={generatedClips}
            onBackToGeneration={() => setCurrentTab("generate")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClipsGenerator;

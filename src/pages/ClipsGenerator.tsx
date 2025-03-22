
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

// Hooks
import { useVideoGeneration } from "@/features/clips/hooks/useVideoGeneration";

type VideoGenerationFormValues = z.infer<typeof videoGenerationSchema>;

const ClipsGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("upload");

  const { isProcessing, generatedClips, generateVideoClip } = useVideoGeneration();

  const form = useForm<VideoGenerationFormValues>({
    defaultValues: {
      prompt: "",
      negative_prompt: "",
      aspect_ratio: "16:9",
      duration: "5",
      cfg_scale: 0.5,
      use_existing_video: false,
      upload_start_frame: false,
      upload_end_frame: false,
    },
  });

  useEffect(() => {
    // Save generated clips to localStorage for history
    if (generatedClips.length > 0) {
      localStorage.setItem('generatedVideoClips', JSON.stringify(generatedClips));
    }
  }, [generatedClips]);

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
        toast.success("Video has been generated and added to your history");
      }
    );
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

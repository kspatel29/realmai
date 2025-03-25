
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { uploadAudioFile, generateSubtitles } from "@/services/api/subtitlesService";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { useCredits } from "@/hooks/credits";

export const useSubtitlesProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [srtFileUrl, setSrtFileUrl] = useState("");
  const [vttFileUrl, setVttFileUrl] = useState("");
  const [editableText, setEditableText] = useState("");
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  
  // Audio/video element to get duration
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { useCredits } = useCredits();
  const { createSubtitleJob, updateStatus } = useSubtitleJobs();
  
  // Function to get file duration
  const getUploadedFileDuration = useCallback(async (): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!uploadedFileUrl) {
        reject(new Error("No file uploaded"));
        return;
      }
      
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      const audio = audioRef.current;
      audio.src = uploadedFileUrl;
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        console.log(`File duration: ${duration} seconds`);
        resolve(duration);
      };
      
      audio.onerror = () => {
        console.error("Error loading audio file");
        reject(new Error("Failed to load audio file"));
      };
    });
  }, [uploadedFileUrl]);
  
  const handleFileUploaded = async (file: File, url: string) => {
    console.log("File uploaded:", file.name, "URL:", url);
    setUploadedFileUrl(url);
    setUploadedFileName(file.name);
    
    // Create the audio element to get duration
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    audioRef.current.src = url;
  };
  
  const processSubtitles = async (values: SubtitlesFormValues, creditCost: number) => {
    if (!uploadedFileUrl) {
      toast.error("Please upload a file first");
      return;
    }
    
    setIsProcessing(true);
    
    // Estimate wait time based on file size
    try {
      const duration = await getUploadedFileDuration();
      // Rough estimate: 2 seconds per second of audio
      setEstimatedWaitTime(Math.ceil(duration / 30));
    } catch (error) {
      console.error("Error estimating wait time:", error);
      setEstimatedWaitTime(2); // Default wait time in minutes
    }
    
    try {
      // Deduct credits
      const creditResult = await useCredits.mutateAsync({
        amount: creditCost,
        service: "Subtitle Generation",
        description: `Generated subtitles for "${uploadedFileName}"`
      });
      
      console.log("Credits used:", creditResult);
      
      // Create job in database
      const jobData = {
        file_name: uploadedFileName,
        file_url: uploadedFileUrl,
        model_name: values.model_name,
        status: "processing" as const
      };
      
      const job = await createSubtitleJob.mutateAsync(jobData);
      console.log("Subtitle job created:", job);
      
      // Generate subtitles
      const result = await generateSubtitles({
        audioUrl: uploadedFileUrl,
        modelName: values.model_name,
        jobId: job.id
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update UI with results
      console.log("Subtitles generated:", result);
      setSrtFileUrl(result.srtUrl || "");
      setVttFileUrl(result.vttUrl || "");
      setEditableText(result.text || "");
      
      // Update job status
      await updateStatus.mutateAsync({
        id: job.id,
        status: "completed",
        srt_url: result.srtUrl,
        vtt_url: result.vttUrl,
        raw_text: result.text
      });
      
      toast.success("Subtitles generated successfully");
    } catch (error) {
      console.error("Error processing subtitles:", error);
      toast.error("Failed to generate subtitles: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isUploading,
    setIsUploading,
    isProcessing,
    uploadedFileUrl,
    uploadedFileName,
    srtFileUrl,
    vttFileUrl,
    editableText,
    setEditableText,
    estimatedWaitTime,
    handleFileUploaded,
    processSubtitles,
    getUploadedFileDuration
  };
};

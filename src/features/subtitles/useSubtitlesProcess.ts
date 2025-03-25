
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { uploadAudioFile, generateSubtitles, SubtitlesResult } from "@/services/api/subtitlesService";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { useCredits } from "@/hooks/credits";
import { useMutation } from "@tanstack/react-query";

// Extended interface for the subtitle service response
interface ExtendedSubtitlesResult extends SubtitlesResult {
  srtUrl?: string;
  vttUrl?: string;
  text?: string;
  error?: string;
}

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
  
  const { useCredits: spendCredits } = useCredits();
  const { jobs, refreshJobs } = useSubtitleJobs();
  
  // Create mutations for subtitle job operations
  const createSubtitleJob = useMutation({
    mutationFn: async (data: {
      file_name: string;
      file_url: string;
      model_name: string;
      status: string;
    }) => {
      const response = await fetch('/api/subtitle-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create subtitle job');
      }
      
      return response.json();
    }
  });
  
  const updateStatus = useMutation({
    mutationFn: async (data: {
      id: string;
      status: string;
      srt_url?: string;
      vtt_url?: string;
      raw_text?: string;
    }) => {
      const response = await fetch(`/api/subtitle-jobs/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subtitle job status');
      }
      
      return response.json();
    }
  });
  
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
      const creditResult = await spendCredits.mutateAsync({
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
      
      // Generate subtitles - fix the parameter mismatch
      const result = await generateSubtitles({
        audioPath: uploadedFileUrl,
        modelName: values.model_name,
        language: values.language,
        vadFilter: values.vad_filter
      });
      
      // Cast the result to the extended interface with our additional properties
      const extendedResult = result as ExtendedSubtitlesResult;
      
      if (extendedResult.error) {
        throw new Error(extendedResult.error);
      }
      
      // Update UI with results
      console.log("Subtitles generated:", extendedResult);
      setSrtFileUrl(extendedResult.srtUrl || extendedResult.srt_file || "");
      setVttFileUrl(extendedResult.vttUrl || extendedResult.vtt_file || "");
      setEditableText(extendedResult.text || extendedResult.preview || "");
      
      // Update job status
      await updateStatus.mutateAsync({
        id: job.id,
        status: "completed",
        srt_url: extendedResult.srtUrl || extendedResult.srt_file,
        vtt_url: extendedResult.vttUrl || extendedResult.vtt_file,
        raw_text: extendedResult.text || extendedResult.preview
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

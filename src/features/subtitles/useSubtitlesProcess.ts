
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { uploadAudioFile, generateSubtitles, SubtitlesResult, checkSubtitlesStatus } from "@/services/api/subtitlesService";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { useCredits } from "@/hooks/credits";

// Extended interface for the subtitle service response
interface ExtendedSubtitlesResult extends SubtitlesResult {
  srtUrl?: string;
  vttUrl?: string;
  text?: string;
  error?: string;
  predictionId?: string;
  status?: string;
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
  
  const handleFileUploaded = async (file: File) => {
    console.log("File uploaded:", file.name);
    setIsUploading(true);
    
    try {
      // Upload file to Supabase storage
      const url = await uploadAudioFile(file);
      setUploadedFileUrl(url);
      setUploadedFileName(file.name);
      
      // Create the audio element to get duration
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = url;
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
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
      await spendCredits.mutateAsync({
        amount: creditCost,
        service: "Subtitle Generation",
        description: `Generated subtitles for "${uploadedFileName}"`
      });
      
      console.log("Credits deducted, starting subtitle generation");
      
      // Generate subtitles
      const result = await generateSubtitles({
        audioPath: uploadedFileUrl,
        modelName: values.model_name,
        language: values.language,
        vadFilter: values.vad_filter
      });
      
      console.log("Subtitles generation response:", result);
      
      // Check if we got a prediction ID (async processing)
      if ('predictionId' in result && result.predictionId) {
        console.log("Got prediction ID, polling for results:", result.predictionId);
        
        // Poll for results
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          try {
            const statusResult = await checkSubtitlesStatus(result.predictionId);
            console.log(`Polling attempt ${attempts + 1}, status:`, statusResult.status);
            
            if (statusResult.status === 'succeeded' && statusResult.output) {
              const output = statusResult.output;
              setSrtFileUrl(output.srt_file || "");
              setVttFileUrl(output.vtt_file || "");
              setEditableText(output.preview || output.text || "");
              
              toast.success("Subtitles generated successfully!");
              break;
            } else if (statusResult.status === 'failed') {
              throw new Error(statusResult.error || 'Subtitle generation failed');
            }
            
            attempts++;
          } catch (pollError) {
            console.error("Error polling for results:", pollError);
            break;
          }
        }
        
        if (attempts >= maxAttempts) {
          throw new Error("Subtitle generation timed out");
        }
      } else {
        // Direct result
        const extendedResult = result as ExtendedSubtitlesResult;
        
        if (extendedResult.error) {
          throw new Error(extendedResult.error);
        }
        
        setSrtFileUrl(extendedResult.srtUrl || extendedResult.srt_file || "");
        setVttFileUrl(extendedResult.vttUrl || extendedResult.vtt_file || "");
        setEditableText(extendedResult.text || extendedResult.preview || "");
        
        toast.success("Subtitles generated successfully!");
      }
      
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

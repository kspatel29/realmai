
import { useState, useRef, useCallback, useEffect } from "react";
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

interface ProcessingState {
  isProcessing: boolean;
  predictionId?: string;
  formValues?: SubtitlesFormValues;
  uploadedFileUrl?: string;
  uploadedFileName?: string;
  estimatedWaitTime?: number;
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
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);
  
  // Audio/video element to get duration
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { useCredits: spendCredits } = useCredits();
  const { jobs, refreshJobs } = useSubtitleJobs();

  // Load processing state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('subtitles_processing_state');
    if (savedState) {
      try {
        const state: ProcessingState = JSON.parse(savedState);
        if (state.isProcessing && state.predictionId) {
          setIsProcessing(true);
          setCurrentPredictionId(state.predictionId);
          setUploadedFileUrl(state.uploadedFileUrl || "");
          setUploadedFileName(state.uploadedFileName || "");
          setEstimatedWaitTime(state.estimatedWaitTime || 0);
          
          // Resume polling for this prediction
          pollForResults(state.predictionId);
        }
      } catch (error) {
        console.error("Error loading processing state:", error);
        localStorage.removeItem('subtitles_processing_state');
      }
    }
  }, []);

  // Save processing state to localStorage
  const saveProcessingState = (state: ProcessingState) => {
    localStorage.setItem('subtitles_processing_state', JSON.stringify(state));
  };

  // Clear processing state from localStorage
  const clearProcessingState = () => {
    localStorage.removeItem('subtitles_processing_state');
  };
  
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

  const pollForResults = async (predictionId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const statusResult = await checkSubtitlesStatus(predictionId);
        console.log(`Polling attempt ${attempts + 1}, status:`, statusResult.status);
        
        if (statusResult.status === 'succeeded' && statusResult.output) {
          const output = statusResult.output;
          setSrtFileUrl(output.srt_file || "");
          setVttFileUrl(output.vtt_file || "");
          setEditableText(output.preview || output.text || "");
          
          setIsProcessing(false);
          setCurrentPredictionId(null);
          clearProcessingState();
          refreshJobs(); // Refresh the jobs list to show completed job
          
          toast.success("Subtitles generated successfully!");
          break;
        } else if (statusResult.status === 'failed') {
          setIsProcessing(false);
          setCurrentPredictionId(null);
          clearProcessingState();
          throw new Error(statusResult.error || 'Subtitle generation failed');
        }
        
        attempts++;
      } catch (pollError) {
        console.error("Error polling for results:", pollError);
        setIsProcessing(false);
        setCurrentPredictionId(null);
        clearProcessingState();
        toast.error("Failed to check subtitle status: " + (pollError as Error).message);
        break;
      }
    }
    
    if (attempts >= maxAttempts) {
      setIsProcessing(false);
      setCurrentPredictionId(null);
      clearProcessingState();
      toast.error("Subtitle generation timed out");
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
        console.log("Got prediction ID, saving state and polling for results:", result.predictionId);
        
        setCurrentPredictionId(result.predictionId);
        
        // Save processing state to localStorage
        saveProcessingState({
          isProcessing: true,
          predictionId: result.predictionId,
          formValues: values,
          uploadedFileUrl,
          uploadedFileName,
          estimatedWaitTime
        });
        
        // Start polling for results
        pollForResults(result.predictionId);
      } else {
        // Direct result
        const extendedResult = result as ExtendedSubtitlesResult;
        
        if (extendedResult.error) {
          throw new Error(extendedResult.error);
        }
        
        setSrtFileUrl(extendedResult.srtUrl || extendedResult.srt_file || "");
        setVttFileUrl(extendedResult.vttUrl || extendedResult.vtt_file || "");
        setEditableText(extendedResult.text || extendedResult.preview || "");
        
        setIsProcessing(false);
        clearProcessingState();
        refreshJobs(); // Refresh the jobs list
        
        toast.success("Subtitles generated successfully!");
      }
      
    } catch (error) {
      console.error("Error processing subtitles:", error);
      setIsProcessing(false);
      setCurrentPredictionId(null);
      clearProcessingState();
      toast.error("Failed to generate subtitles: " + (error as Error).message);
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
    getUploadedFileDuration,
    currentPredictionId
  };
};

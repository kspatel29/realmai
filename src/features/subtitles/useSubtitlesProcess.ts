
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { generateSubtitles, checkSubtitlesStatus, uploadAudioFile, isAudioFile, createSubtitleJob, updateSubtitleJob } from "@/services/api/subtitlesService";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { useInterval } from "@/hooks/useInterval";

export function useSubtitlesProcess() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [srtFileUrl, setSrtFileUrl] = useState<string | null>(null);
  const [vttFileUrl, setVttFileUrl] = useState<string | null>(null);
  const [editableText, setEditableText] = useState<string | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  // Setup polling interval for checking status
  useInterval(() => {
    const now = Date.now();
    // Only check if it's been at least 3 seconds since last check
    if (predictionId && now - lastCheckTime >= 3000) {
      checkStatus(predictionId, jobId);
      setLastCheckTime(now);
    }
  }, statusCheckInterval);

  const handleFileUploaded = async (file: File) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadedFileName(file.name);
      
      if (!isAudioFile(file)) {
        toast.error("Please upload a valid audio file (mp3, wav, ogg, etc.)");
        setIsUploading(false);
        return;
      }
      
      // Upload the file to get a public URL
      const fileUrl = await uploadAudioFile(file);
      
      // Store both the file name and URL
      setUploadedFileUrl(fileUrl);
      setUploadedFileName(file.name);
      
      console.log("File uploaded, URL stored:", fileUrl);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const processSubtitles = async (values: SubtitlesFormValues, creditCost: number) => {
    if (!user) {
      toast.error("You must be logged in to generate subtitles");
      return;
    }
    
    if (!uploadedFileUrl) {
      toast.error("Please upload an audio file first");
      return;
    }

    console.log("Processing subtitles with file URL:", uploadedFileUrl);
    
    try {
      setIsProcessing(true);
      const modelName = values.model_name;
      const fileSize = uploadedFileName ? uploadedFileName.length : 0; // Just a placeholder, ideally we'd have the actual file size
      
      // Estimate wait time based on model selected and file size
      // This is just an approximation; adjust based on actual performance
      const baseTime = modelName === "large-v2" ? 60 : 30; // seconds
      const estimatedTime = baseTime + (fileSize / 1000000) * 10; // Add 10 seconds per MB
      setEstimatedWaitTime(Math.ceil(estimatedTime));
      
      // Create a job entry in the database
      const newJobId = await createSubtitleJob({
        userId: user.id,
        modelName: values.model_name,
        language: values.language,
        originalFilename: uploadedFileName || undefined
      });
      
      setJobId(newJobId);
      
      // Start the subtitles generation process
      const result = await generateSubtitles({
        audioPath: uploadedFileUrl,
        modelName: values.model_name,
        language: values.language,
        vadFilter: values.vad_filter
      });
      
      // If we get a prediction ID, we need to poll for status
      if ('predictionId' in result) {
        console.log("Got prediction ID:", result.predictionId);
        setPredictionId(result.predictionId);
        
        // Update the job with the prediction ID
        await updateSubtitleJob(newJobId, {
          prediction_id: result.predictionId,
          status: 'processing'
        });
        
        // Start polling for status (check every 5 seconds)
        setStatusCheckInterval(5000);
        setLastCheckTime(Date.now());
        
        toast.info("Subtitles generation started. This may take a few minutes.");
      } else if ('preview' in result) {
        // We got an immediate result
        handleSubtitlesResult(result, newJobId);
      } else {
        throw new Error("Invalid response from generate-subtitles function: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("Error processing subtitles:", error);
      
      if (jobId) {
        try {
          await updateSubtitleJob(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        } catch (updateError) {
          console.error("Failed to update job with error:", updateError);
        }
      }
      
      toast.error("Failed to process subtitles");
      setIsProcessing(false);
      setStatusCheckInterval(null);
    }
  };

  const checkStatus = async (currentPredictionId: string, currentJobId: string | null) => {
    try {
      const statusData = await checkSubtitlesStatus(currentPredictionId);
      
      if (statusData.status === "succeeded" && statusData.output) {
        console.log("Prediction succeeded with output:", statusData.output);
        handleSubtitlesResult(statusData.output, currentJobId);
        return;
      }
      
      if (statusData.status === "failed" || statusData.error) {
        throw new Error(statusData.error || "Subtitles generation failed");
      }
      
      // Still processing, update the job status if needed
      if (currentJobId) {
        await updateSubtitleJob(currentJobId, {
          status: statusData.status
        });
      }
      
      console.log("Still processing, status:", statusData.status);
    } catch (error) {
      console.error("Error checking status:", error);
      
      if (currentJobId) {
        try {
          await updateSubtitleJob(currentJobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        } catch (updateError) {
          console.error("Failed to update job with error:", updateError);
        }
      }
      
      toast.error("Failed to check subtitles status");
      setIsProcessing(false);
      setStatusCheckInterval(null);
    }
  };

  const handleSubtitlesResult = async (result: any, currentJobId: string | null) => {
    try {
      // Stop polling
      setStatusCheckInterval(null);
      
      // Set the results in the UI
      setSrtFileUrl(result.srt_file);
      setVttFileUrl(result.vtt_file);
      setEditableText(result.preview);
      
      // Update the job in the database if we have a job ID
      if (currentJobId) {
        await updateSubtitleJob(currentJobId, {
          status: 'completed',
          srt_url: result.srt_file,
          vtt_url: result.vtt_file,
          preview_text: result.preview
        });
      }
      
      toast.success("Subtitles generated successfully!");
    } catch (error) {
      console.error("Error handling subtitles result:", error);
      toast.error("Error finishing subtitles process");
      
      if (currentJobId) {
        try {
          await updateSubtitleJob(currentJobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        } catch (updateError) {
          console.error("Failed to update job with error:", updateError);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isUploading,
    setIsUploading,
    isProcessing,
    uploadedFileUrl,
    srtFileUrl,
    vttFileUrl,
    uploadedFileName,
    editableText,
    setEditableText,
    estimatedWaitTime,
    handleFileUploaded,
    processSubtitles
  };
}

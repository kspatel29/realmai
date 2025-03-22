
import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { 
  generateSubtitles, 
  checkSubtitlesStatus, 
  createSubtitleJob, 
  updateSubtitleJob 
} from "@/services/api/subtitlesService";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";

export const useSubtitlesProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [srtFileUrl, setSrtFileUrl] = useState<string | null>(null);
  const [vttFileUrl, setVttFileUrl] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [editableText, setEditableText] = useState("");
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [subtitleJobId, setSubtitleJobId] = useState<string | null>(null);
  const { useCredits: spendCredits } = useCredits();
  const { user } = useAuth();

  // Calculate estimated wait time based on model
  const calculateEstimatedTime = (modelName: string) => {
    // large-v2 takes longer than small
    return modelName === "large-v2" ? 4 : 2; // minutes
  };

  // Query for checking job status
  const { data: predictionStatus, error: statusError } = useQuery({
    queryKey: ['subtitles-status', predictionId],
    queryFn: async () => {
      if (!predictionId) return null;
      return await checkSubtitlesStatus(predictionId);
    },
    enabled: !!predictionId && isProcessing,
    refetchInterval: 3000
  });

  // Effect to handle prediction status changes
  useEffect(() => {
    if (!predictionStatus) return;
    
    console.log("Prediction status update:", predictionStatus);
    
    if (predictionStatus.status === "succeeded") {
      if (predictionStatus.output) {
        setSrtFileUrl(predictionStatus.output.srt_file);
        setVttFileUrl(predictionStatus.output.vtt_file);
        setEditableText(predictionStatus.output.preview || "");
        setIsProcessing(false);
        setPredictionId(null);
        setEstimatedWaitTime(null);
        sonnerToast.success("Subtitles have been generated successfully.");
        
        // Update the subtitle job with the results
        if (subtitleJobId) {
          updateSubtitleJob(subtitleJobId, {
            status: 'succeeded',
            srt_url: predictionStatus.output.srt_file,
            vtt_url: predictionStatus.output.vtt_file,
            preview_text: predictionStatus.output.preview
          }).catch(error => {
            console.error("Failed to update subtitle job:", error);
          });
        }
      }
    } else if (predictionStatus.status === "failed") {
      setIsProcessing(false);
      setPredictionId(null);
      setEstimatedWaitTime(null);
      sonnerToast.error("Failed to generate subtitles: " + (predictionStatus.error || "Unknown error"));
      
      // Update the subtitle job with the error
      if (subtitleJobId) {
        updateSubtitleJob(subtitleJobId, {
          status: 'failed',
          error: predictionStatus.error || "Unknown error"
        }).catch(error => {
          console.error("Failed to update subtitle job error:", error);
        });
      }
    } else {
      // Update the status of the job
      if (subtitleJobId) {
        updateSubtitleJob(subtitleJobId, {
          status: predictionStatus.status
        }).catch(error => {
          console.error("Failed to update subtitle job status:", error);
        });
      }
    }
  }, [predictionStatus, subtitleJobId]);

  // Effect to handle status error
  useEffect(() => {
    if (statusError) {
      console.error("Error checking status:", statusError);
      setIsProcessing(false);
      setPredictionId(null);
      setEstimatedWaitTime(null);
      sonnerToast.error(`Error checking status: ${statusError instanceof Error ? statusError.message : "Unknown error"}`);
      
      // Update the subtitle job with the error
      if (subtitleJobId) {
        updateSubtitleJob(subtitleJobId, {
          status: 'failed',
          error: statusError instanceof Error ? statusError.message : "Unknown error"
        }).catch(error => {
          console.error("Failed to update subtitle job error:", error);
        });
      }
    }
  }, [statusError, subtitleJobId]);

  const handleFileUploaded = (url: string, fromVideo: boolean, fileName?: string) => {
    setUploadedFileUrl(url);
    if (fileName) {
      setUploadedFileName(fileName);
    }
  };

  const processSubtitles = async (formValues: SubtitlesFormValues, creditCost: number) => {
    if (!uploadedFileUrl) {
      sonnerToast.error("Please upload a file first.");
      return;
    }
    
    if (!user) {
      sonnerToast.error("You must be logged in to generate subtitles.");
      return;
    }

    setIsProcessing(true);
    setEstimatedWaitTime(calculateEstimatedTime(formValues.model_name));
    
    spendCredits.mutate({
      amount: creditCost,
      service: "Subtitle Generator",
      description: `Generated subtitles using ${formValues.model_name === "large-v2" ? "Best Quality" : "Affordable"} model`
    }, {
      onSuccess: async () => {
        try {
          // Create a subtitle job entry first
          const jobId = await createSubtitleJob({
            userId: user.id,
            modelName: formValues.model_name,
            language: formValues.language,
            originalFilename: uploadedFileName || undefined
          });
          
          setSubtitleJobId(jobId);
          
          const result = await generateSubtitles({
            audioPath: uploadedFileUrl,
            modelName: formValues.model_name,
            language: formValues.language,
            vadFilter: formValues.vad_filter
          });
          
          // Check if the result has a predictionId (async job started)
          if ('predictionId' in result) {
            setPredictionId(result.predictionId);
            sonnerToast.info(`Subtitle generation has started. This may take around ${estimatedWaitTime} minutes.`);
            
            // Update the job with the prediction ID
            await updateSubtitleJob(jobId, {
              prediction_id: result.predictionId,
              status: result.status
            });
            
          } else {
            // Direct output available
            setSrtFileUrl(result.srt_file);
            setVttFileUrl(result.vtt_file);
            setEditableText(result.preview || "");
            setIsProcessing(false);
            sonnerToast.success("Subtitles have been generated successfully.");
            
            // Update the job with the results
            await updateSubtitleJob(jobId, {
              status: 'succeeded',
              srt_url: result.srt_file,
              vtt_url: result.vtt_file,
              preview_text: result.preview
            });
          }
          
        } catch (error) {
          console.error("Generate subtitles error:", error);
          setIsProcessing(false);
          setEstimatedWaitTime(null);
          sonnerToast.error(`Failed to process: ${error instanceof Error ? error.message : "An error occurred"}`);
          
          // Update the job with the error if we have a job ID
          if (subtitleJobId) {
            updateSubtitleJob(subtitleJobId, {
              status: 'failed',
              error: error instanceof Error ? error.message : "An error occurred"
            }).catch(err => {
              console.error("Failed to update subtitle job error:", err);
            });
          }
        }
      },
      onError: (error) => {
        setIsProcessing(false);
        setEstimatedWaitTime(null);
        sonnerToast.error(`Failed to process: ${error.message}`);
      }
    });
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
};

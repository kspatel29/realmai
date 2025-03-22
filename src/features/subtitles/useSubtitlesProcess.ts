
import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { generateSubtitles, checkSubtitlesStatus } from "@/services/api/subtitlesService";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { useCredits } from "@/hooks/useCredits";

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
  const { useCredits: spendCredits } = useCredits();

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
      }
    } else if (predictionStatus.status === "failed") {
      setIsProcessing(false);
      setPredictionId(null);
      setEstimatedWaitTime(null);
      sonnerToast.error("Failed to generate subtitles: " + (predictionStatus.error || "Unknown error"));
    }
  }, [predictionStatus]);

  // Effect to handle status error
  useEffect(() => {
    if (statusError) {
      console.error("Error checking status:", statusError);
      setIsProcessing(false);
      setPredictionId(null);
      setEstimatedWaitTime(null);
      sonnerToast.error(`Error checking status: ${statusError instanceof Error ? statusError.message : "Unknown error"}`);
    }
  }, [statusError]);

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

    setIsProcessing(true);
    setEstimatedWaitTime(calculateEstimatedTime(formValues.model_name));
    
    spendCredits.mutate({
      amount: creditCost,
      service: "Subtitle Generator",
      description: `Generated subtitles using ${formValues.model_name === "large-v2" ? "Best Quality" : "Affordable"} model`
    }, {
      onSuccess: async () => {
        try {
          await generateSubtitles({
            audioPath: uploadedFileUrl,
            modelName: formValues.model_name,
            language: formValues.language,
            vadFilter: formValues.vad_filter
          });
          
          // This should not be reached as generateSubtitles should either return output or throw an error
          sonnerToast.success("Subtitles have been generated successfully.");
          setIsProcessing(false);
          
        } catch (error) {
          console.log("Generate subtitles error:", error);
          
          // Check if this is a "prediction in progress" error with an ID
          if (error instanceof Error && error.message.includes("id:")) {
            try {
              const idMatch = error.message.match(/id: ([a-zA-Z0-9]+)/);
              if (idMatch && idMatch[1]) {
                setPredictionId(idMatch[1]);
                sonnerToast.info(`Subtitle generation has started. This may take around ${estimatedWaitTime} minutes.`);
              } else {
                throw new Error("Failed to extract prediction ID");
              }
            } catch (extractError) {
              setIsProcessing(false);
              setEstimatedWaitTime(null);
              sonnerToast.error(`Failed to process: ${extractError instanceof Error ? extractError.message : "An error occurred"}`);
            }
          } else {
            setIsProcessing(false);
            setEstimatedWaitTime(null);
            sonnerToast.error(`Failed to process: ${error instanceof Error ? error.message : "An error occurred"}`);
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

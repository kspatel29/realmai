
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
  const [isFromVideo, setIsFromVideo] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [editableText, setEditableText] = useState("");
  const { toast } = useToast();
  const { useCredits } = useCredits();

  // Query for checking job status
  const { data: predictionStatus } = useQuery({
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

  const processSubtitles = async (formValues: SubtitlesFormValues, creditCost: number) => {
    if (!uploadedFileUrl) {
      sonnerToast.error("Please upload a file first.");
      return;
    }

    setIsProcessing(true);
    
    useCredits.mutate({
      amount: creditCost,
      service: "Subtitle Generator",
      description: `Generated subtitles using ${formValues.model_name} model${isFromVideo ? ' from video' : ''}`
    }, {
      onSuccess: async () => {
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
        setIsProcessing(false);
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
    isFromVideo,
    uploadedFileName,
    editableText,
    setEditableText,
    handleFileUploaded,
    processSubtitles
  };
};

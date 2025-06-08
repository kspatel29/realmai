
import { useState } from "react";
import { SubtitlesFormValues } from "./subtitlesSchema";
import { generateSubtitles } from "@/services/api/subtitlesService";
import { fileManager } from "@/services/fileManagementService";
import { useAuth } from "@/hooks/useAuth";
import { useSpendCreditsForService } from "@/hooks/useSpendCreditsForService";
import { toast } from "sonner";
import { useSubtitleFileManager } from "@/hooks/useSubtitleFileManager";

export const useSubtitlesProcess = () => {
  const { user } = useAuth();
  const spendCreditsMutation = useSpendCreditsForService();
  const { processAndStoreSubtitleFiles } = useSubtitleFileManager();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileDuration, setUploadedFileDuration] = useState<number | null>(null);
  const [srtFileUrl, setSrtFileUrl] = useState<string | null>(null);
  const [vttFileUrl, setVttFileUrl] = useState<string | null>(null);
  const [editableText, setEditableText] = useState<string>("");
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<string>("0");

  const handleFileUploaded = async (file: File) => {
    if (!user) {
      toast.error("Please log in to upload files");
      return;
    }

    setIsUploading(true);
    
    try {
      console.log("Starting file upload process...");
      
      const uploadResult = await fileManager.uploadFile(file, 'uploads', user.id);
      console.log("File uploaded successfully:", uploadResult);
      
      let duration: number | undefined;
      try {
        duration = await fileManager.getFileDuration(file);
        console.log("File duration:", duration);
      } catch (error) {
        console.warn("Could not get file duration:", error);
      }

      setUploadedFileUrl(uploadResult.publicUrl);
      setUploadedFileName(file.name);
      setUploadedFileDuration(duration || null);
      
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const processSubtitles = async (formValues: SubtitlesFormValues, totalCost: number) => {
    if (!uploadedFileUrl || !user) {
      toast.error("Please upload a file first and ensure you're logged in");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("Starting subtitle processing...");
      
      await spendCreditsMutation.mutateAsync({
        amount: totalCost,
        serviceType: 'subtitles'
      });
      
      const result = await generateSubtitles({
        audioPath: uploadedFileUrl,
        modelName: formValues.model_name,
        language: formValues.language,
        vadFilter: formValues.vad_filter
      });

      console.log("Subtitles generated:", result);

      // Check if result has the expected properties
      if ('srt_url' in result || 'vtt_url' in result) {
        // Process and store the subtitle files in Supabase
        const storedFiles = await processAndStoreSubtitleFiles(
          result.id || 'unknown',
          result.srt_url,
          result.vtt_url
        );
        
        setSrtFileUrl(storedFiles.srtUrl || null);
        setVttFileUrl(storedFiles.vttUrl || null);
        setEditableText(result.preview_text || result.text || "");
        
        toast.success("Subtitles generated and stored successfully!");
      } else {
        toast.error("Subtitles generation completed but no files were produced");
      }
    } catch (error) {
      console.error("Error processing subtitles:", error);
      toast.error("Failed to generate subtitles. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getUploadedFileDuration = async (): Promise<number | null> => {
    return uploadedFileDuration;
  };

  const resetState = () => {
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setUploadedFileDuration(null);
    setSrtFileUrl(null);
    setVttFileUrl(null);
    setEditableText("");
    setEstimatedWaitTime("0");
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
    resetState
  };
};

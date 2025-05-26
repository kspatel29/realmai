
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSpendCreditsForService } from "@/hooks/useSpendCreditsForService";
import { 
  generateSubtitles, 
  checkSubtitlesStatus, 
  uploadAudioFile, 
  createSubtitleJob,
  updateSubtitleJob 
} from "@/services/api/subtitlesService";
import { SubtitlesFormValues } from "./subtitlesSchema";

export const useSubtitlesProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [srtFileUrl, setSrtFileUrl] = useState<string | null>(null);
  const [vttFileUrl, setVttFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [editableText, setEditableText] = useState<string>("");
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<string>("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { spendCredits } = useSpendCreditsForService();

  const handleFileUploaded = useCallback((url: string, fileName: string) => {
    console.log("File uploaded:", { url, fileName });
    setUploadedFileUrl(url);
    setUploadedFileName(fileName);
    setSrtFileUrl(null);
    setVttFileUrl(null);
    setEditableText("");
  }, []);

  const getUploadedFileDuration = useCallback(async (): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!uploadedFileUrl) {
        reject(new Error("No uploaded file URL"));
        return;
      }

      const audio = document.createElement('audio');
      audio.src = uploadedFileUrl;
      
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      
      audio.onerror = () => {
        reject(new Error("Error loading audio file"));
      };
    });
  }, [uploadedFileUrl]);

  const pollForResult = useCallback(async (predictionId: string, jobId: string) => {
    const maxAttempts = 60;
    let attempts = 0;
    
    const poll = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts} for prediction ${predictionId}`);
        
        const result = await checkSubtitlesStatus(predictionId);
        console.log("Polling result:", result);
        
        if (result.status === "succeeded" && result.output) {
          console.log("Subtitles generation completed successfully");
          
          const output = result.output;
          setSrtFileUrl(output.srt_file);
          setVttFileUrl(output.vtt_file);
          setEditableText(output.preview || output.text || "");
          setIsProcessing(false);
          
          // Update the job in database
          await updateSubtitleJob(jobId, {
            status: 'completed',
            srt_url: output.srt_file,
            vtt_url: output.vtt_file,
            preview_text: output.preview || output.text || ""
          });

          // Save to localStorage for history
          const subtitleEntry = {
            id: jobId,
            type: 'subtitle',
            title: uploadedFileName || 'Subtitle Job',
            status: 'completed',
            created_at: new Date().toISOString(),
            srt_url: output.srt_file,
            vtt_url: output.vtt_file,
            preview_text: output.preview || output.text || "",
            original_filename: uploadedFileName
          };

          const savedJobs = localStorage.getItem('subtitleJobs');
          const existingJobs = savedJobs ? JSON.parse(savedJobs) : [];
          const updatedJobs = [subtitleEntry, ...existingJobs.filter((job: any) => job.id !== jobId)];
          localStorage.setItem('subtitleJobs', JSON.stringify(updatedJobs));
          
          // Clear processing state
          setCurrentJobId(null);
          setPredictionId(null);
          localStorage.removeItem('currentSubtitleJob');
          
          toast({
            title: "Subtitles generated",
            description: "Your subtitles are ready for download."
          });
          
          return;
        }
        
        if (result.status === "failed") {
          console.error("Subtitles generation failed:", result.error);
          setIsProcessing(false);
          
          await updateSubtitleJob(jobId, {
            status: 'failed',
            error: result.error || "Generation failed"
          });
          
          // Clear processing state
          setCurrentJobId(null);
          setPredictionId(null);
          localStorage.removeItem('currentSubtitleJob');
          
          toast({
            title: "Generation failed",
            description: result.error || "There was an error generating subtitles.",
            variant: "destructive"
          });
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          console.error("Polling timeout reached");
          setIsProcessing(false);
          
          await updateSubtitleJob(jobId, {
            status: 'failed',
            error: "Processing timeout"
          });
          
          setCurrentJobId(null);
          setPredictionId(null);
          localStorage.removeItem('currentSubtitleJob');
          
          toast({
            title: "Processing timeout",
            description: "The subtitle generation took too long. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error during polling:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setIsProcessing(false);
          setCurrentJobId(null);
          setPredictionId(null);
          localStorage.removeItem('currentSubtitleJob');
          toast({
            title: "Polling error",
            description: "There was an error checking the generation status.",
            variant: "destructive"
          });
        }
      }
    };
    
    poll();
  }, [uploadedFileName, toast]);

  const processSubtitles = useCallback(async (values: SubtitlesFormValues, totalCost: number) => {
    if (!uploadedFileUrl) {
      toast({
        title: "No file uploaded",
        description: "Please upload an audio file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create job entry in database
      const jobId = await createSubtitleJob({
        userId: "current-user", // This should come from auth context
        modelName: values.model_name,
        language: values.language,
        originalFilename: uploadedFileName || undefined
      });
      
      setCurrentJobId(jobId);
      
      // Save current job state to localStorage
      const jobState = {
        jobId,
        uploadedFileUrl,
        uploadedFileName,
        values,
        totalCost,
        timestamp: Date.now()
      };
      localStorage.setItem('currentSubtitleJob', JSON.stringify(jobState));

      console.log("Processing subtitles with params:", {
        audioPath: uploadedFileUrl,
        modelName: values.model_name,
        language: values.language,
        vadFilter: true
      });

      setEstimatedWaitTime("2-3 minutes");

      const result = await generateSubtitles({
        audioPath: uploadedFileUrl,
        modelName: values.model_name,
        language: values.language,
        vadFilter: true,
      });

      if (result.predictionId) {
        console.log("Got prediction ID, starting polling:", result.predictionId);
        setPredictionId(result.predictionId);
        
        // Update job with prediction ID
        await updateSubtitleJob(jobId, {
          prediction_id: result.predictionId,
          status: 'processing'
        });
        
        // Start polling for results
        pollForResult(result.predictionId, jobId);
      } else if (result.preview || result.srt_file) {
        // Direct result
        console.log("Got direct result:", result);
        setSrtFileUrl(result.srt_file);
        setVttFileUrl(result.vtt_file);
        setEditableText(result.preview || result.text || "");
        setIsProcessing(false);
        
        await updateSubtitleJob(jobId, {
          status: 'completed',
          srt_url: result.srt_file,
          vtt_url: result.vtt_file,
          preview_text: result.preview || result.text || ""
        });

        // Save to localStorage for history
        const subtitleEntry = {
          id: jobId,
          type: 'subtitle',
          title: uploadedFileName || 'Subtitle Job',
          status: 'completed',
          created_at: new Date().toISOString(),
          srt_url: result.srt_file,
          vtt_url: result.vtt_file,
          preview_text: result.preview || result.text || "",
          original_filename: uploadedFileName
        };

        const savedJobs = localStorage.getItem('subtitleJobs');
        const existingJobs = savedJobs ? JSON.parse(savedJobs) : [];
        const updatedJobs = [subtitleEntry, ...existingJobs.filter((job: any) => job.id !== jobId)];
        localStorage.setItem('subtitleJobs', JSON.stringify(updatedJobs));
        
        setCurrentJobId(null);
        localStorage.removeItem('currentSubtitleJob');
        
        toast({
          title: "Subtitles generated",
          description: "Your subtitles are ready for download."
        });
      }

    } catch (error) {
      console.error("Error processing subtitles:", error);
      setIsProcessing(false);
      setCurrentJobId(null);
      setPredictionId(null);
      localStorage.removeItem('currentSubtitleJob');
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "There was an error processing your audio.",
        variant: "destructive"
      });
    }
  }, [uploadedFileUrl, uploadedFileName, pollForResult, toast]);

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
    processSubtitles,
    getUploadedFileDuration,
    currentJobId,
    predictionId
  };
};


import { useState, useEffect } from "react";
import { z } from "zod";
import { videoGenerationSchema } from "../components/VideoGenerationForm";
import { ClipData } from "../components/ClipPreview";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/credits";
import { createReplicateVideoClip } from "@/services/replicateService";
import { calculateCostFromFileDuration } from "@/services/api/pricingService";
import { SERVICE_CREDIT_COSTS } from "@/constants/pricing";
import { uploadImageFromDataUrl } from "@/services/imageUploadService";

type VideoGenerationFormValues = z.infer<typeof videoGenerationSchema>;

interface VideoGenerationInput {
  prompt: string;
  aspect_ratio: string;
  duration: number;
  loop: boolean;
  start_image_url?: string;
  end_image_url?: string;
  concepts?: string[];
}

export const useVideoGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedClips, setGeneratedClips] = useState<ClipData[]>([]);
  const [videoCost, setVideoCost] = useState<number | null>(null);
  const { toast } = useToast();
  const { hasEnoughCredits, useCredits: spendCredits } = useCredits();

  const calculateCost = async (durationSeconds: number): Promise<number> => {
    try {
      console.log(`Calculating cost for video_generation with duration ${durationSeconds} seconds`);
      
      // Try to get cost from the edge function
      const cost = await calculateCostFromFileDuration(
        durationSeconds,
        "video_generation"
      );
      console.log(`Video generation cost for ${durationSeconds}s: ${cost} credits`);
      setVideoCost(cost);
      return cost;
    } catch (error) {
      console.error("Error calculating video generation cost:", error);
      // Fallback to client-side calculation
      const fallbackCost = Math.ceil(SERVICE_CREDIT_COSTS.VIDEO_GENERATION.CREDITS_PER_SECOND * durationSeconds);
      setVideoCost(fallbackCost);
      return fallbackCost;
    }
  };

  useEffect(() => {
    // Set initial default cost
    calculateCost(5); // Default for 5 seconds
  }, []);

  const generateVideoClip = async (
    values: VideoGenerationFormValues,
    startFrame: string | null,
    endFrame: string | null,
    videoUrl: string | null,
    onSuccess?: () => void
  ) => {
    const durationSeconds = parseInt(values.duration);
    const cost = await calculateCost(durationSeconds);
    
    // Check if user has enough credits
    if (!hasEnoughCredits(cost)) {
      toast({
        title: "Insufficient credits",
        description: `You need ${cost} credits to generate a ${durationSeconds} second video. Please add more credits.`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Check if we have keyframes (start or end frames)
      const hasKeyframes = (startFrame && startFrame.startsWith('data:')) || (endFrame && endFrame.startsWith('data:'));
      
      // Properly structure the input for the Luma API
      const input: VideoGenerationInput = {
        prompt: values.prompt,
        aspect_ratio: values.aspect_ratio,
        duration: parseInt(values.duration),
        loop: hasKeyframes ? false : values.loop, // Disable loop when using keyframes
      };
      
      // Upload images to storage and get URLs if provided
      if (startFrame && typeof startFrame === 'string' && startFrame.startsWith('data:')) {
        console.log("Uploading start frame to storage...");
        const startImageUrl = await uploadImageFromDataUrl(startFrame, 'start-frame.jpg');
        input.start_image_url = startImageUrl;
        console.log("Start frame uploaded:", startImageUrl);
      }
      
      if (endFrame && typeof endFrame === 'string' && endFrame.startsWith('data:')) {
        console.log("Uploading end frame to storage...");
        const endImageUrl = await uploadImageFromDataUrl(endFrame, 'end-frame.jpg');
        input.end_image_url = endImageUrl;
        console.log("End frame uploaded:", endImageUrl);
      }
      
      // Log if loop was automatically disabled
      if (hasKeyframes && values.loop) {
        console.log("Loop automatically disabled due to keyframes being present");
        toast({
          title: "Loop disabled",
          description: "Loop has been automatically disabled because keyframes are not compatible with looping.",
          variant: "default"
        });
      }
      
      console.log("Generating video with inputs:", input);
      
      // Use credits for the video generation
      spendCredits.mutate(
        {
          amount: cost,
          service: "Video Generation",
          description: `Generated video clip: ${values.prompt.substring(0, 30)}...`
        },
        {
          onSuccess: async () => {
            try {
              // Call the replicate service
              const result = await createReplicateVideoClip(input);
              
              if (result.status === "failed") {
                throw new Error("Video generation failed: " + (result.error || "Unknown error"));
              }
              
              // Get the video URL from the result
              let videoOutput = null;
              
              if (result.output) {
                // Handle both array and string outputs from different models
                videoOutput = Array.isArray(result.output) ? result.output[0] : result.output;
              }
              
              if (!videoOutput) {
                throw new Error("No video output received from the API");
              }
              
              setIsProcessing(false);
              
              const newClip = { 
                id: `clip-${Date.now()}`, 
                title: values.prompt.substring(0, 30) + "...", 
                duration: values.duration + "s", 
                thumbnail: startFrame || "", 
                url: videoOutput
              };
              
              setGeneratedClips([newClip]);
              
              // Save to localStorage for history
              const savedClips = localStorage.getItem('generatedVideoClips');
              const existingClips = savedClips ? JSON.parse(savedClips) : [];
              const updatedClips = [newClip, ...existingClips];
              localStorage.setItem('generatedVideoClips', JSON.stringify(updatedClips));
              
              toast({
                title: "Clip generated",
                description: "Your video clip has been generated successfully."
              });
              
              if (onSuccess) onSuccess();
            } catch (error) {
              console.error("Error during video generation:", error);
              setIsProcessing(false);
              toast({
                title: "Generation failed",
                description: "There was an error generating your video clip: " + (error instanceof Error ? error.message : "Unknown error"),
                variant: "destructive"
              });
            }
          },
          onError: (error) => {
            console.error("Credit deduction failed:", error);
            setIsProcessing(false);
            toast({
              title: "Credit deduction failed",
              description: "There was an error processing your credits.",
              variant: "destructive"
            });
          }
        }
      );
      
    } catch (error) {
      console.error("Error in generateVideoClip:", error);
      setIsProcessing(false);
      toast({
        title: "Generation failed",
        description: "There was an error generating your video clip: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    }
  };

  return {
    isProcessing,
    generatedClips,
    generateVideoClip,
    videoCost: videoCost || 0,
    calculateCost
  };
};

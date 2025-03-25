
import { useState, useEffect } from "react";
import { VideoGenerationFormValues } from "../components/VideoGenerationForm";
import { ClipData } from "../components/ClipPreview";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/credits";
import { createReplicateVideoClip } from "@/services/replicateService";
import { calculateVideoGenerationCost, calculateCostFromFileDuration } from "@/services/api/pricingService";
import { SERVICE_CREDIT_COSTS } from "@/constants/pricing";

export const useVideoGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedClips, setGeneratedClips] = useState<ClipData[]>([]);
  const [videoCost, setVideoCost] = useState<number | null>(null);
  const { toast } = useToast();
  const { hasEnoughCredits, useCredits: spendCredits } = useCredits();

  const calculateCost = async (durationSeconds: number): Promise<number> => {
    try {
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
      // Make sure values are properly structured before sending to the API
      const input: {
        prompt: string,
        negative_prompt: string,
        aspect_ratio: string,
        duration: number,
        cfg_scale: number,
        start_image?: string,
        end_image?: string
      } = {
        prompt: values.prompt,
        negative_prompt: values.negative_prompt || "",
        aspect_ratio: values.aspect_ratio,
        duration: parseInt(values.duration),
        cfg_scale: values.cfg_scale,
      };
      
      // Only add valid start and end frames
      if (values.use_existing_video && startFrame && typeof startFrame === 'string') {
        input.start_image = startFrame;
      }
      
      if (values.use_existing_video && endFrame && typeof endFrame === 'string') {
        input.end_image = endFrame;
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
              
              setGeneratedClips([
                { 
                  id: `clip-${Date.now()}`, 
                  title: values.prompt.substring(0, 30) + "...", 
                  duration: values.duration + "s", 
                  thumbnail: startFrame || "", 
                  url: videoOutput
                }
              ]);
              
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
                description: "There was an error generating your video clip: " + (error.message || "Unknown error"),
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
        description: "There was an error generating your video clip.",
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

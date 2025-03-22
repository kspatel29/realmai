
import { useState } from "react";
import { VideoGenerationFormValues } from "../components/VideoGenerationForm";
import { ClipData } from "../components/ClipPreview";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";
import { createReplicateVideoClip } from "@/services/replicateService";

// Video generation cost in credits
const VIDEO_GENERATION_COST = 10;

export const useVideoGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedClips, setGeneratedClips] = useState<ClipData[]>([]);
  const { toast } = useToast();
  const { useCredits, hasEnoughCredits } = useCredits();

  const generateVideoClip = async (
    values: VideoGenerationFormValues,
    startFrame: string | null,
    endFrame: string | null,
    videoUrl: string | null,
    onSuccess?: () => void
  ) => {
    // Check if user has enough credits
    if (!hasEnoughCredits(VIDEO_GENERATION_COST)) {
      toast({
        title: "Insufficient credits",
        description: `You need ${VIDEO_GENERATION_COST} credits to generate a video. Please add more credits.`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const input = {
        prompt: values.prompt,
        negative_prompt: values.negative_prompt || "",
        aspect_ratio: values.aspect_ratio,
        duration: parseInt(values.duration),
        cfg_scale: values.cfg_scale,
        start_image: startFrame || undefined,
        end_image: endFrame || undefined,
      };
      
      console.log("Generating video with inputs:", input);
      
      // Use credits for the video generation
      useCredits.mutate(
        {
          amount: VIDEO_GENERATION_COST,
          service: "Video Generation",
          description: `Generated video clip: ${values.prompt.substring(0, 30)}...`
        },
        {
          onSuccess: () => {
            // Simplified for demo purposes, in production would make proper API call
            setTimeout(() => {
              setIsProcessing(false);
              
              setGeneratedClips([
                { 
                  id: `clip-${Date.now()}`, 
                  title: values.prompt.substring(0, 30) + "...", 
                  duration: values.duration + "s", 
                  thumbnail: "", 
                  url: videoUrl
                }
              ]);
              
              toast({
                title: "Clip generated",
                description: "Your video clip has been generated successfully."
              });
              
              if (onSuccess) onSuccess();
            }, 3000);
          },
          onError: (error) => {
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
    generateVideoClip
  };
};

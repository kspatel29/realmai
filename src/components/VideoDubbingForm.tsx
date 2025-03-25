import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SUPPORTED_LANGUAGES } from "@/services/sieveApi";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateCostFromFileDuration } from "@/services/api/pricingService";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

// Define the form schema using Zod
const formSchema = z.object({
  target_languages: z.array(z.string()).min(1, "Select at least one language"),
  enable_voice_cloning: z.boolean(),
  preserve_background_audio: z.boolean(),
  enable_lipsyncing: z.boolean(),
  safewords: z.string(),
  translation_dictionary: z.string(),
  start_time: z.number(),
  end_time: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface VideoDubbingFormProps {
  onSubmit: (values: FormValues) => void;
  isProcessing: boolean;
  isVoiceCloning: boolean;
  setIsVoiceCloning: (value: boolean) => void;
  cost: number;
  fileDuration?: number;
}

export default function VideoDubbingForm({
  onSubmit,
  isProcessing,
  isVoiceCloning,
  setIsVoiceCloning,
  cost,
  fileDuration,
}: VideoDubbingFormProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState<number>(0);
  const [isCalculatingCost, setIsCalculatingCost] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_languages: [],
      enable_voice_cloning: true,
      preserve_background_audio: true,
      enable_lipsyncing: false,
      safewords: "",
      translation_dictionary: "",
      start_time: 0,
      end_time: -1,
    },
  });

  // Calculate cost when relevant parameters change
  useEffect(() => {
    const calculateCost = async () => {
      if (!fileDuration) {
        setCalculatedCost(0);
        return;
      }
      
      setIsCalculatingCost(true);
      
      try {
        const enableLipSync = form.watch("enable_lipsyncing");
        const languages = selectedLanguages;
        
        // Get cost based on duration and options
        const newCost = await calculateCostFromFileDuration(
          fileDuration,
          "dubbing",
          {
            enableLipSync,
            languages
          }
        );
        
        console.log(`Dubbing cost calculation: ${fileDuration/60} minutes with ${languages.length} languages, lip sync: ${enableLipSync} = ${newCost} credits`);
        setCalculatedCost(newCost);
      } catch (error) {
        console.error("Error calculating dubbing cost:", error);
        setCalculatedCost(cost); // Fallback to provided cost
      } finally {
        setIsCalculatingCost(false);
      }
    };
    
    calculateCost();
  }, [fileDuration, selectedLanguages, form.watch("enable_lipsyncing"), cost]);

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) {
        const updated = prev.filter((lang) => lang !== language);
        form.setValue("target_languages", updated);
        return updated;
      } else {
        const updated = [...prev, language];
        form.setValue("target_languages", updated);
        return updated;
      }
    });
  };

  const watchEnableVoiceCloning = form.watch("enable_voice_cloning");

  // Update the isVoiceCloning state when toggle changes
  const handleVoiceCloneToggle = (value: boolean) => {
    form.setValue("enable_voice_cloning", value);
    setIsVoiceCloning(value);
  };

  // Display file duration in a readable format
  const getReadableDuration = () => {
    if (!fileDuration) return "";
    
    const minutes = Math.floor(fileDuration / 60);
    const seconds = Math.floor(fileDuration % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fileDuration ? (
          <div className="rounded-md bg-muted p-3 flex justify-between items-center">
            <div>
              <h4 className="font-medium">Video Duration</h4>
              <p className="text-sm text-muted-foreground">{getReadableDuration()}</p>
            </div>
            {calculatedCost > 0 && (
              <ServiceCostDisplay 
                cost={calculatedCost} 
                label={isCalculatingCost ? "calculating..." : "credits"} 
              />
            )}
          </div>
        ) : null}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="target_languages"
            render={() => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Target Languages</FormLabel>
                  <Badge variant="outline" className="font-normal">
                    {selectedLanguages.length} selected
                  </Badge>
                </div>
                <FormDescription>
                  Select the languages you want to dub your video into
                </FormDescription>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <Button
                      key={language.code}
                      type="button"
                      variant="outline"
                      className={`justify-start h-auto py-2 ${
                        selectedLanguages.includes(language.code)
                          ? "border-youtube-red bg-youtube-red/10 text-youtube-red"
                          : ""
                      }`}
                      onClick={() => toggleLanguage(language.code)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{language.flag}</span>
                        <span className="truncate">{language.name}</span>
                      </div>
                      {selectedLanguages.includes(language.code) && (
                        <Check className="ml-auto h-4 w-4 flex-shrink-0" />
                      )}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="enable_voice_cloning"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={handleVoiceCloneToggle}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Voice Cloning</FormLabel>
                    <FormDescription>
                      Match the original speakers' voices in the dubbed audio
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_lipsyncing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Lip Sync</FormLabel>
                    <FormDescription>
                      Sync the mouth movements with the dubbed audio (costs extra)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Switch 
                id="advanced-options"
                checked={showAdvancedOptions} 
                onCheckedChange={setShowAdvancedOptions}
              />
              <div>
                <label
                  htmlFor="advanced-options"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Advanced Options
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure additional dubbing settings
                </p>
              </div>
            </div>
          </div>

          {showAdvancedOptions && (
            <div className="border rounded-lg p-4 space-y-4">
              <FormField
                control={form.control}
                name="preserve_background_audio"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Preserve Background Audio</FormLabel>
                      <FormDescription>
                        Keep original background sounds and music
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safewords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Safewords
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 inline" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-80">
                            <p>Words that should not be translated, such as names or places. Separate with commas.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. John, New York, iPhone"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of words to keep in original language
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t flex justify-between items-center">
          <div className="text-sm">
            <p>
              <span className="font-semibold">{selectedLanguages.length}</span> languages selected
            </p>
            <p className="text-muted-foreground">
              {watchEnableVoiceCloning ? "With voice cloning" : "With AI voices"}
            </p>
          </div>
          <Button
            type="submit"
            className="bg-youtube-red hover:bg-youtube-darkred"
            disabled={isProcessing || selectedLanguages.length === 0 || calculatedCost === 0}
          >
            {isProcessing 
              ? "Processing..." 
              : isCalculatingCost 
                ? "Calculating cost..." 
                : fileDuration && calculatedCost > 0
                  ? `Generate (${calculatedCost} credits)`
                  : "Generate"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}

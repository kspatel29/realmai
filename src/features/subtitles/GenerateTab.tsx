
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";
import { MODEL_SIZES, LANGUAGES } from "./subtitlesConstants";
import { subtitlesFormSchema, SubtitlesFormValues } from "./subtitlesSchema";
import { useCredits } from "@/hooks/useCredits";

interface GenerateTabProps {
  uploadedFileName: string | null;
  uploadedFileUrl: string | null;
  isProcessing: boolean;
  totalCost: number;
  onSubmit: (values: SubtitlesFormValues) => void;
}

const GenerateTab = ({ 
  uploadedFileName, 
  uploadedFileUrl, 
  isProcessing, 
  totalCost, 
  onSubmit 
}: GenerateTabProps) => {
  const { hasEnoughCredits } = useCredits();

  const form = useForm<SubtitlesFormValues>({
    resolver: zodResolver(subtitlesFormSchema),
    defaultValues: {
      language: "en",
      model_name: "small",
      vad_filter: true,
    },
  });

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Subtitle Settings</CardTitle>
                <CardDescription>
                  Configure settings for generating subtitles.
                </CardDescription>
              </div>
              <ServiceCostDisplay cost={totalCost} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MODEL_SIZES.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Larger models are more accurate but use more credits
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The main language in the audio (helps with accuracy)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vad_filter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Voice Activity Detection</FormLabel>
                    <FormDescription>
                      Filter out parts of the audio without speech
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Powered by OpenAI's Whisper model via Replicate
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-muted-foreground">
                    Processing time depends on file length and model size
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
              {uploadedFileName ? uploadedFileName : "No file selected"}
            </div>
            <Button 
              type="submit"
              disabled={!uploadedFileUrl || isProcessing || !hasEnoughCredits(totalCost)}
              className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
            >
              {isProcessing ? "Processing..." : hasEnoughCredits(totalCost) ? "Generate Subtitles" : "Not Enough Credits"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default GenerateTab;

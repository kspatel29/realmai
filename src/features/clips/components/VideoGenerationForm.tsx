
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";

const videoGenerationSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
  negative_prompt: z.string().optional(),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  duration: z.enum(["5", "10"]).default("5"),
  cfg_scale: z.number().min(0).max(1).default(0.5),
  use_existing_video: z.boolean().default(false),
  upload_start_frame: z.boolean().default(false),
  upload_end_frame: z.boolean().default(false),
});

export type VideoGenerationFormValues = z.infer<typeof videoGenerationSchema>;

interface VideoGenerationFormProps {
  form: UseFormReturn<VideoGenerationFormValues>;
  isProcessing: boolean;
  file: File | null;
  startFrame: string | null;
  endFrame: string | null;
  onSubmit: (values: VideoGenerationFormValues) => void;
  onStartFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VideoGenerationForm = ({ 
  form, 
  isProcessing, 
  file, 
  startFrame,
  endFrame,
  onSubmit,
  onStartFrameUpload,
  onEndFrameUpload
}: VideoGenerationFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what you want to see in your video..." 
                  className="min-h-24 resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Be descriptive for better results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="negative_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Negative Prompt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what you DON'T want to see..." 
                  className="min-h-16 resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional: Specify elements to exclude
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="aspect_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspect Ratio</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cfg_scale"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>Creativity Level: {(value * 100).toFixed(0)}%</FormLabel>
              <FormControl>
                <Slider 
                  value={[value]} 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  onValueChange={([val]) => onChange(val)} 
                />
              </FormControl>
              <FormDescription className="flex justify-between text-xs">
                <span>More creative</span>
                <span>More precise</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="use_existing_video"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Use frames from uploaded video
                    </FormLabel>
                    <FormDescription>
                      {file ? "Your video will be used to extract start and end frames" : "Upload a video first to enable this option"}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="upload_start_frame"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex flex-col space-y-1 w-full">
                    <FormLabel>
                      Upload custom start frame
                    </FormLabel>
                    <FormDescription className="mb-2">
                      Upload an image to use as the first frame of your video
                    </FormDescription>
                    {field.value && (
                      <div>
                        {startFrame ? (
                          <div className="relative w-full h-32 mb-2">
                            <img 
                              src={startFrame} 
                              alt="Start frame" 
                              className="w-full h-full object-contain border rounded"
                            />
                          </div>
                        ) : null}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={onStartFrameUpload}
                          className="cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="upload_end_frame"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex flex-col space-y-1 w-full">
                    <FormLabel>
                      Upload custom end frame
                    </FormLabel>
                    <FormDescription className="mb-2">
                      Upload an image to use as the last frame of your video
                    </FormDescription>
                    {field.value && (
                      <div>
                        {endFrame ? (
                          <div className="relative w-full h-32 mb-2">
                            <img 
                              src={endFrame} 
                              alt="End frame" 
                              className="w-full h-full object-contain border rounded"
                            />
                          </div>
                        ) : null}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={onEndFrameUpload}
                          className="cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={isProcessing || 
              (form.watch("use_existing_video") && file !== null && !startFrame) ||
              (form.watch("upload_start_frame") && !startFrame) ||
              (form.watch("upload_end_frame") && !endFrame)}
            className={isProcessing ? "" : "bg-youtube-red hover:bg-youtube-darkred"}
          >
            {isProcessing ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate Video</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { videoGenerationSchema };
export default VideoGenerationForm;

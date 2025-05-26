
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

export const videoGenerationSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(500, "Prompt must be less than 500 characters"),
  aspect_ratio: z.enum(["1:1", "3:4", "4:3", "9:16", "16:9", "9:21", "21:9"]),
  duration: z.enum(["5", "9"]),
  loop: z.boolean(),
  use_existing_video: z.boolean(),
  upload_start_frame: z.boolean(),
  upload_end_frame: z.boolean(),
});

type VideoGenerationFormValues = z.infer<typeof videoGenerationSchema>;

interface VideoGenerationFormProps {
  form: UseFormReturn<VideoGenerationFormValues>;
  isProcessing: boolean;
  file: File | null;
  startFrame: string | null;
  endFrame: string | null;
  onSubmit: (values: VideoGenerationFormValues) => void;
  onStartFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cost: number;
}

const VideoGenerationForm = ({
  form,
  isProcessing,
  file,
  startFrame,
  endFrame,
  onSubmit,
  onStartFrameUpload,
  onEndFrameUpload,
  cost
}: VideoGenerationFormProps) => {
  const useExistingVideo = form.watch("use_existing_video");

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Video Generation Settings
            </CardTitle>
            <CardDescription>
              Configure your video generation parameters
            </CardDescription>
          </div>
          <ServiceCostDisplay cost={cost} />
        </div>
      </CardHeader>
      <CardContent>
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
                      placeholder="Describe the video you want to generate (e.g., 'a cat playing with yarn in slow motion')"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific and descriptive for better results
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                        <SelectItem value="3:4">3:4 (Portrait Classic)</SelectItem>
                        <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                        <SelectItem value="9:21">9:21 (Ultrawide Portrait)</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="9">9 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Available durations: 5 or 9 seconds
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="loop"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Loop Video
                    </FormLabel>
                    <FormDescription>
                      Whether the video should loop seamlessly
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {file && (
              <FormField
                control={form.control}
                name="use_existing_video"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Use uploaded video for frames
                      </FormLabel>
                      <FormDescription>
                        Extract start and end frames from your uploaded video
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {useExistingVideo && (
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium">Frame Upload</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Frame</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onStartFrameUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {startFrame && (
                        <img src={startFrame} alt="Start frame" className="w-full h-32 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Frame</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onEndFrameUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {endFrame && (
                        <img src={endFrame} alt="End frame" className="w-full h-32 object-cover rounded" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? "Generating..." : "Generate Video"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VideoGenerationForm;


import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageOff, Upload } from "lucide-react";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

export const videoGenerationSchema = z.object({
  prompt: z.string().min(3, "Please enter a prompt with at least 3 characters"),
  negative_prompt: z.string().optional(),
  aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]),
  duration: z.string().min(1, "Please enter a duration"),
  cfg_scale: z.number().min(0).max(1),
  use_existing_video: z.boolean().default(false),
  upload_start_frame: z.boolean().default(false),
  upload_end_frame: z.boolean().default(false),
});

type VideoGenerationFormProps = {
  form: UseFormReturn<z.infer<typeof videoGenerationSchema>>;
  isProcessing: boolean;
  file: File | null;
  startFrame: string | null;
  endFrame: string | null;
  onSubmit: (values: z.infer<typeof videoGenerationSchema>) => void;
  onStartFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cost?: number;
};

const VideoGenerationForm = ({
  form,
  isProcessing,
  file,
  startFrame,
  endFrame,
  onSubmit,
  onStartFrameUpload,
  onEndFrameUpload,
  cost = 0,
}: VideoGenerationFormProps) => {
  const watchStartEndFrames = form.watch(["use_existing_video", "upload_start_frame", "upload_end_frame"]);
  const useExistingVideo = watchStartEndFrames[0];
  const uploadStartFrame = watchStartEndFrames[1];
  const uploadEndFrame = watchStartEndFrames[2];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Video</CardTitle>
        <CardDescription>
          Create a new video using AI generation
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the video you want to generate..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be descriptive about scenes, styles, colors, and mood.
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
                      placeholder="Elements you want to avoid..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify what you don't want to see in the video.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aspect_ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isProcessing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                        <SelectItem value="4:3">Standard (4:3)</SelectItem>
                        <SelectItem value="3:4">Portrait (3:4)</SelectItem>
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
                    <FormLabel>Duration (seconds)</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isProcessing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2">2 seconds</SelectItem>
                        <SelectItem value="3">3 seconds</SelectItem>
                        <SelectItem value="4">4 seconds</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="6">6 seconds</SelectItem>
                        <SelectItem value="8">8 seconds</SelectItem>
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
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel>Creativity Level</FormLabel>
                    <span className="text-sm text-muted-foreground">
                      {field.value < 0.4
                        ? "More Creative"
                        : field.value > 0.7
                        ? "More Precise"
                        : "Balanced"}
                    </span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      min={0}
                      max={1}
                      step={0.05}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower values create more creative but less predictable
                    results. Higher values follow your prompt more precisely.
                  </FormDescription>
                  <FormMessage />
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
                        Use uploaded video as reference
                      </FormLabel>
                      <FormDescription>
                        Generate a video based on the start and end frames of
                        your uploaded video.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isProcessing}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {useExistingVideo && (
              <div className="space-y-4 rounded-lg border p-4 pt-2">
                <h4 className="font-medium">Reference Frames</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-frame" className="mb-2 block">
                      Start Frame
                    </Label>
                    {startFrame ? (
                      <div className="relative rounded-md overflow-hidden border aspect-video mb-2">
                        <img
                          src={startFrame}
                          alt="Start frame"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-md border aspect-video mb-2 bg-muted">
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      id="start-frame-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onStartFrameUpload}
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document
                          .getElementById("start-frame-upload")
                          ?.click()
                      }
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Start Frame
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="end-frame" className="mb-2 block">
                      End Frame
                    </Label>
                    {endFrame ? (
                      <div className="relative rounded-md overflow-hidden border aspect-video mb-2">
                        <img
                          src={endFrame}
                          alt="End frame"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-md border aspect-video mb-2 bg-muted">
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      id="end-frame-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onEndFrameUpload}
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("end-frame-upload")?.click()
                      }
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload End Frame
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t p-4">
            <ServiceCostDisplay cost={cost} />
            
            <Button 
              type="submit" 
              disabled={isProcessing || form.formState.isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isProcessing ? "Generating..." : `Generate (${cost} credits)`}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default VideoGenerationForm;

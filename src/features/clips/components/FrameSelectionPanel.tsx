
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageIcon, Film, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoFrameSelector from "@/components/VideoFrameSelector";

interface FrameSelectionPanelProps {
  file: File | null;
  videoUrl: string | null;
  useFrames: boolean;
  startFrame: string | null;
  endFrame: string | null;
  onStartFrameSelected: (frame: string) => void;
  onEndFrameSelected: (frame: string) => void;
  setCurrentTab: (tab: string) => void;
}

const FrameSelectionPanel = ({
  file,
  videoUrl,
  useFrames,
  startFrame,
  endFrame,
  onStartFrameSelected,
  onEndFrameSelected,
  setCurrentTab
}: FrameSelectionPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frame Selection</CardTitle>
        <CardDescription>
          {file 
            ? "Select start and end frames from your video" 
            : "Upload a video first to select frames"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {useFrames && file ? (
          <div className="space-y-4">
            {videoUrl && (
              <VideoFrameSelector
                videoUrl={videoUrl}
                onStartFrameSelected={onStartFrameSelected}
                onEndFrameSelected={onEndFrameSelected}
              />
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="block mb-2">Start Frame</Label>
                <div className="border rounded-md overflow-hidden aspect-video bg-muted relative">
                  {startFrame ? (
                    <img src={startFrame} alt="Start frame" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="block mb-2">End Frame</Label>
                <div className="border rounded-md overflow-hidden aspect-video bg-muted relative">
                  {endFrame ? (
                    <img src={endFrame} alt="End frame" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {(!startFrame || !endFrame) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {!startFrame && !endFrame 
                      ? "Please select both start and end frames" 
                      : !startFrame 
                        ? "Please select a start frame" 
                        : "Please select an end frame"}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Use the timeline controller to extract frames from your video
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            {!file ? (
              <>
                <Film className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-medium">No video uploaded</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a video in the previous step to select frames
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setCurrentTab("upload")}
                  >
                    Go to Upload
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-medium">Frame selection disabled</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enable "Use frames from uploaded video" in the settings
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FrameSelectionPanel;

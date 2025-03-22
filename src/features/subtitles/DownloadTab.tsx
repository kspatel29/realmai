
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, DownloadCloud, FileText } from "lucide-react";
import { FORMATS } from "./subtitlesConstants";

interface DownloadTabProps {
  srtFileUrl: string | null;
  vttFileUrl: string | null;
}

const DownloadTab = ({ srtFileUrl, vttFileUrl }: DownloadTabProps) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["srt", "vtt"]);

  const toggleFormat = (formatId: string) => {
    if (selectedFormats.includes(formatId)) {
      if (selectedFormats.length > 1) {
        setSelectedFormats(selectedFormats.filter(id => id !== formatId));
      }
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Subtitles</CardTitle>
        <CardDescription>
          Download your subtitles in various formats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!srtFileUrl && !vttFileUrl ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No subtitles available yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate subtitles first to download them
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>File Formats</Label>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map((format) => (
                  <Button
                    key={format.id}
                    variant="outline"
                    className={`justify-start ${
                      selectedFormats.includes(format.id) 
                        ? "border-youtube-red bg-youtube-red/10 text-youtube-red" 
                        : ""
                    }`}
                    onClick={() => toggleFormat(format.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {format.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg divide-y">
              <div className="p-4">
                <h3 className="font-medium">Generated Subtitles</h3>
                <div className="flex space-x-2 mt-2">
                  {srtFileUrl && selectedFormats.includes("srt") && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={srtFileUrl} download="subtitles.srt">
                        <Download className="mr-2 h-3 w-3" />
                        Download SRT
                      </a>
                    </Button>
                  )}
                  {vttFileUrl && selectedFormats.includes("vtt") && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={vttFileUrl} download="subtitles.vtt">
                        <Download className="mr-2 h-3 w-3" />
                        Download VTT
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-6">
        <Button 
          className="bg-youtube-red hover:bg-youtube-darkred" 
          disabled={!srtFileUrl && !vttFileUrl}
        >
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download All Formats
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DownloadTab;

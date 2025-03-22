
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DownloadTabProps {
  srtFileUrl: string | null;
  vttFileUrl: string | null;
  subtitlesText: string;
}

const DownloadTab = ({ srtFileUrl, vttFileUrl, subtitlesText }: DownloadTabProps) => {
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    if (subtitlesText) {
      navigator.clipboard.writeText(subtitlesText);
      toast({
        title: "Copied to clipboard",
        description: "The subtitles text has been copied to your clipboard."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Subtitles</CardTitle>
        <CardDescription>
          Download and preview your generated subtitles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!srtFileUrl && !vttFileUrl ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No subtitles available yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate subtitles first to download them
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={!srtFileUrl}
                onClick={() => srtFileUrl && window.open(srtFileUrl, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download SRT
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={!vttFileUrl}
                onClick={() => vttFileUrl && window.open(vttFileUrl, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download VTT
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Subtitle Preview</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard}
                  disabled={!subtitlesText}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
              <Textarea 
                value={subtitlesText} 
                readOnly 
                className="h-[300px] font-mono text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DownloadTab;

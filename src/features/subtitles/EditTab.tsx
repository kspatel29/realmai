
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Clock } from "lucide-react";

interface EditTabProps {
  editableText: string;
  onTextChange: (text: string) => void;
}

const EditTab = ({ editableText, onTextChange }: EditTabProps) => {
  const [format, setFormat] = useState("srt");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Subtitles</CardTitle>
        <CardDescription>
          Make adjustments to the generated subtitles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!editableText ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No subtitles to edit yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a file and generate subtitles first
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="format-select">Format</Label>
              <Button variant="outline" size="sm" className="h-8">
                <Clock className="mr-2 h-3 w-3" />
                Adjust Timings
              </Button>
            </div>
            <Select defaultValue="srt" onValueChange={setFormat}>
              <SelectTrigger id="format-select">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="srt">SRT Format</SelectItem>
                <SelectItem value="vtt">VTT Format</SelectItem>
              </SelectContent>
            </Select>
            
            <Textarea 
              value={editableText}
              onChange={(e) => onTextChange(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex justify-between">
              <Button variant="outline">
                Reset to Original
              </Button>
              <Button className="bg-youtube-red hover:bg-youtube-darkred">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditTab;

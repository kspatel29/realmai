
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AudioFileUploader from "@/components/AudioFileUploader";

interface UploadTabProps {
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onFileUploaded: (url: string, fromVideo: boolean, fileName?: string) => void;
}

const UploadTab = ({ isUploading, setIsUploading, onFileUploaded }: UploadTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Audio</CardTitle>
        <CardDescription>
          Upload an audio file to generate subtitles from.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AudioFileUploader 
          onFileUploaded={onFileUploaded}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </CardContent>
    </Card>
  );
};

export default UploadTab;


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AudioFileUploader from "@/components/AudioFileUploader";

interface UploadTabProps {
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  onFileUploaded: (url: string, fromVideo: boolean, fileName?: string) => void;
}

const UploadTab = ({ isUploading, setIsUploading, onFileUploaded }: UploadTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Audio</CardTitle>
        <CardDescription>
          Upload the audio file you want to generate subtitles for.
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

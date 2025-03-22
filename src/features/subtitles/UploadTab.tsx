
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AudioVideoFileUploader from "@/components/AudioVideoFileUploader";

interface UploadTabProps {
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  onFileUploaded: (url: string, fromVideo: boolean, fileName?: string) => void;
}

const UploadTab = ({ isUploading, setIsUploading, onFileUploaded }: UploadTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Audio/Video</CardTitle>
        <CardDescription>
          Upload the audio or video file you want to generate subtitles for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AudioVideoFileUploader 
          onFileUploaded={onFileUploaded}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </CardContent>
    </Card>
  );
};

export default UploadTab;

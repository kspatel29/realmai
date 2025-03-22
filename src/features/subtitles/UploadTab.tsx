
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AudioFileUploader from "@/components/AudioFileUploader";

interface UploadTabProps {
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onFileUploaded: (file: File) => Promise<void>;
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
          onFileUploaded={(url, fromVideo, fileName) => {
            // This is just an adapter function to handle the type mismatch
            if (typeof url === 'object' && url instanceof File) {
              onFileUploaded(url);
            }
          }}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </CardContent>
    </Card>
  );
};

export default UploadTab;

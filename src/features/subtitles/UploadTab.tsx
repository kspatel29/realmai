
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
          onFileUploaded={(input, fromVideo, fileName) => {
            // This is an adapter function to handle the type mismatch
            // Only process File objects, not URLs
            if (typeof input === 'object' && input !== null && input instanceof File) {
              onFileUploaded(input);
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

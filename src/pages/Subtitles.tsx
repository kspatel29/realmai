
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubtitlesCost } from "@/features/subtitles/useSubtitlesCost";
import { useSubtitlesProcess } from "@/features/subtitles/useSubtitlesProcess";
import { SubtitlesFormValues } from "@/features/subtitles/subtitlesSchema";
import CreditConfirmDialog from "@/components/CreditConfirmDialog";
import UploadTab from "@/features/subtitles/UploadTab";
import GenerateTab from "@/features/subtitles/GenerateTab";
import EditTab from "@/features/subtitles/EditTab";
import DownloadTab from "@/features/subtitles/DownloadTab";
import { toast as sonnerToast } from "sonner";

const Subtitles = () => {
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [formValues, setFormValues] = useState<SubtitlesFormValues | null>(null);
  
  const {
    isUploading,
    setIsUploading,
    isProcessing,
    uploadedFileUrl,
    srtFileUrl,
    vttFileUrl,
    isFromVideo,
    uploadedFileName,
    editableText,
    setEditableText,
    handleFileUploaded,
    processSubtitles
  } = useSubtitlesProcess();
  
  const { calculateCost, setIsFromVideo: setCostIsFromVideo } = useSubtitlesCost();

  const handleFileUpload = (url: string, fromVideo: boolean, fileName?: string) => {
    handleFileUploaded(url, fromVideo, fileName);
    setCostIsFromVideo(fromVideo);
  };

  const handleGenerateSubtitles = (values: SubtitlesFormValues) => {
    if (!uploadedFileUrl) {
      sonnerToast.error("Please upload a file first.");
      return;
    }
    
    setFormValues(values);
    setShowCreditConfirm(true);
  };

  const confirmAndProcess = () => {
    if (formValues) {
      const cost = calculateCost(formValues.model_name);
      processSubtitles(formValues, cost);
    }
  };

  const totalCost = calculateCost(formValues?.model_name);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Subtitle Generator</h1>
        <p className="text-muted-foreground">
          Create accurate subtitles from audio and video files automatically.
        </p>
      </div>

      <CreditConfirmDialog
        open={showCreditConfirm}
        setOpen={setShowCreditConfirm}
        serviceName="Subtitle Generator"
        creditCost={totalCost}
        onConfirm={confirmAndProcess}
        description={`This will use ${totalCost} credits to generate subtitles using the ${formValues?.model_name} model${isFromVideo ? ' (including video processing)' : ''}.`}
      />

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <UploadTab
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            onFileUploaded={handleFileUpload}
          />
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <GenerateTab
            uploadedFileName={uploadedFileName}
            uploadedFileUrl={uploadedFileUrl}
            isProcessing={isProcessing}
            totalCost={totalCost}
            onSubmit={handleGenerateSubtitles}
          />
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          <EditTab
            editableText={editableText}
            onTextChange={setEditableText}
          />
        </TabsContent>
        
        <TabsContent value="download" className="mt-6">
          <DownloadTab
            srtFileUrl={srtFileUrl}
            vttFileUrl={vttFileUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subtitles;

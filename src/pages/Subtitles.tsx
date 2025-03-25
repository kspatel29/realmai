
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubtitlesCost } from "@/features/subtitles/useSubtitlesCost";
import { useSubtitlesProcess } from "@/features/subtitles/useSubtitlesProcess";
import { SubtitlesFormValues } from "@/features/subtitles/subtitlesSchema";
import CreditConfirmDialog from "@/components/CreditConfirmDialog";
import UploadTab from "@/features/subtitles/UploadTab";
import GenerateTab from "@/features/subtitles/GenerateTab";
import DownloadTab from "@/features/subtitles/DownloadTab";
import { toast as sonnerToast } from "sonner";
import { calculateCostFromFileDuration } from "@/services/api/pricingService";
import ServiceCostDisplay from "@/components/ServiceCostDisplay";

const Subtitles = () => {
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [formValues, setFormValues] = useState<SubtitlesFormValues | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("upload");
  
  const {
    isUploading,
    setIsUploading,
    isProcessing,
    uploadedFileUrl,
    srtFileUrl,
    vttFileUrl,
    uploadedFileName,
    editableText,
    setEditableText,
    estimatedWaitTime,
    handleFileUploaded,
    processSubtitles,
    getUploadedFileDuration
  } = useSubtitlesProcess();
  
  const { calculateCost } = useSubtitlesCost();

  // Handle tab change enforcement
  const handleTabChange = (value: string) => {
    // Only allow navigation to generate tab if file is uploaded
    if (value === "generate" && !uploadedFileUrl) {
      sonnerToast.error("Please upload a file first");
      return;
    }
    
    setActiveTab(value);
  };

  useEffect(() => {
    const updateFileDuration = async () => {
      if (uploadedFileUrl) {
        try {
          const duration = await getUploadedFileDuration();
          setFileDuration(duration);
        } catch (error) {
          console.error("Error getting file duration:", error);
        }
      }
    };
    
    updateFileDuration();
  }, [uploadedFileUrl, getUploadedFileDuration]);

  useEffect(() => {
    const updateCost = async () => {
      if (!formValues) {
        const cost = await calculateCost();
        setTotalCost(cost);
        return;
      }
      
      setIsCalculatingCost(true);
      
      try {
        if (fileDuration) {
          const isPremiumModel = formValues.model_name === "large-v2";
          
          const cost = await calculateCostFromFileDuration(
            fileDuration,
            "subtitles",
            { isPremiumModel }
          );
          
          console.log(`Subtitles cost for ${fileDuration}s video with ${isPremiumModel ? "premium" : "basic"} model: ${cost} credits`);
          setTotalCost(cost);
        } else {
          const cost = await calculateCost(formValues.model_name);
          setTotalCost(cost);
        }
      } catch (error) {
        console.error("Error calculating subtitles cost:", error);
        const cost = await calculateCost(formValues.model_name);
        setTotalCost(cost);
      } finally {
        setIsCalculatingCost(false);
      }
    };
    
    updateCost();
  }, [formValues, fileDuration, calculateCost]);

  const handleGenerateSubtitles = (values: SubtitlesFormValues) => {
    console.log("Generate subtitles with file URL:", uploadedFileUrl);
    
    if (!uploadedFileUrl) {
      sonnerToast.error("Please upload a file first.");
      return;
    }
    
    setFormValues(values);
    setShowCreditConfirm(true);
  };

  const confirmAndProcess = async () => {
    if (formValues) {
      processSubtitles(formValues, totalCost);
    }
  };
  
  const getReadableDuration = () => {
    if (!fileDuration) return "";
    
    const minutes = Math.floor(fileDuration / 60);
    const seconds = Math.floor(fileDuration % 60);
    return `${minutes}m ${seconds}s`;
  };

  // Go to next step after upload
  const goToNextStep = () => {
    if (uploadedFileUrl) {
      setActiveTab("generate");
    } else {
      sonnerToast.error("Please upload a file first");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Subtitle Generator</h1>
        <p className="text-muted-foreground">
          Create accurate subtitles from audio files automatically.
        </p>
      </div>

      {fileDuration && (
        <div className="rounded-md bg-muted p-3 flex justify-between items-center">
          <div>
            <h4 className="font-medium">Audio/Video Duration</h4>
            <p className="text-sm text-muted-foreground">{getReadableDuration()}</p>
          </div>
          <ServiceCostDisplay 
            cost={totalCost} 
            label="credits" 
            isCalculating={isCalculatingCost} 
          />
        </div>
      )}

      <CreditConfirmDialog
        open={showCreditConfirm}
        setOpen={setShowCreditConfirm}
        serviceName="Subtitle Generator"
        creditCost={totalCost}
        onConfirm={confirmAndProcess}
        description={`This will use ${totalCost} credits to generate subtitles using the ${formValues?.model_name === "large-v2" ? "Best Quality" : "Affordable"} model.`}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <div className="space-y-4">
            <UploadTab
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              onFileUploaded={(file: File) => {
                return new Promise<void>((resolve) => {
                  const fileReader = new FileReader();
                  fileReader.onload = (e) => {
                    if (e.target?.result && typeof e.target.result === 'string') {
                      handleFileUploaded(file, e.target.result);
                    }
                    resolve();
                  };
                  fileReader.readAsDataURL(file);
                });
              }}
            />
            
            {uploadedFileUrl && (
              <div className="flex justify-end">
                <button
                  onClick={goToNextStep}
                  className="px-4 py-2 rounded-md bg-youtube-red hover:bg-youtube-darkred text-white font-medium"
                >
                  Next Step
                </button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <GenerateTab
            uploadedFileName={uploadedFileName}
            uploadedFileUrl={uploadedFileUrl}
            isProcessing={isProcessing}
            estimatedWaitTime={estimatedWaitTime}
            totalCost={totalCost}
            onSubmit={handleGenerateSubtitles}
          />
        </TabsContent>
      </Tabs>
      
      {(srtFileUrl || vttFileUrl) && (
        <DownloadTab
          srtFileUrl={srtFileUrl}
          vttFileUrl={vttFileUrl}
          subtitlesText={editableText}
        />
      )}
    </div>
  );
};

export default Subtitles;


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DubbingJobsList from "@/components/DubbingJobsList";
import SubtitleJobsList from "@/components/SubtitleJobsList";
import { useDubbingJobs } from "@/hooks/dubbingJobs";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import ClipPreview from "@/features/clips/components/ClipPreview";
import { useState, useEffect } from "react";

const History = () => {
  const { jobs, isLoading, refetch } = useDubbingJobs();
  const { jobs: subtitleJobs, isLoading: isSubtitlesLoading, refreshJobs } = useSubtitleJobs();
  const [videoClips, setVideoClips] = useState<any[]>([]);

  // Retrieve saved video clips from localStorage
  useEffect(() => {
    const savedClips = localStorage.getItem('generatedVideoClips');
    if (savedClips) {
      try {
        const parsedClips = JSON.parse(savedClips);
        setVideoClips(parsedClips);
      } catch (error) {
        console.error("Error parsing saved clips:", error);
      }
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">History</h1>
        <p className="text-muted-foreground">
          View your past jobs and their status.
        </p>
      </div>

      <Tabs defaultValue="dubbing" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="dubbing">Dubbing</TabsTrigger>
          <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
          <TabsTrigger value="videos">Video Clips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dubbing" className="mt-6">
          <DubbingJobsList 
            jobs={jobs} 
            onRefresh={refetch} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="subtitles" className="mt-6">
          <SubtitleJobsList />
        </TabsContent>
        
        <TabsContent value="videos" className="mt-6">
          <ClipPreview 
            clips={videoClips}
            onBackToGeneration={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;

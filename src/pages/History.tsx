import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DubbingJobsList from "@/components/DubbingJobsList";
import SubtitleJobsList from "@/components/SubtitleJobsList";
import { useDubbingJobs } from "@/hooks/dubbingJobs";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { useSubtitleJobsSync } from "@/hooks/useSubtitleJobsSync";
import { useSubtitleJobsRecovery } from "@/hooks/useSubtitleJobsRecovery";
import ClipPreview from "@/features/clips/components/ClipPreview";
import { useState, useEffect } from "react";

interface SubtitleHistoryJob {
  id: string;
  type: string;
  title: string;
  status: string;
  created_at: string;
  srt_url?: string;
  vtt_url?: string;
  preview_text?: string;
  original_filename?: string;
}

const History = () => {
  const { jobs, isLoading, refetch } = useDubbingJobs();
  const { jobs: subtitleJobs, isLoading: isSubtitlesLoading, refreshJobs } = useSubtitleJobs();
  const [videoClips, setVideoClips] = useState<any[]>([]);
  const [localSubtitleJobs, setLocalSubtitleJobs] = useState<SubtitleHistoryJob[]>([]);

  // Sync completed subtitle jobs from database
  useSubtitleJobsSync();
  
  // Add recovery mechanism for missed completed jobs
  useSubtitleJobsRecovery();

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

  // Retrieve saved subtitle jobs from localStorage
  useEffect(() => {
    const savedSubtitleJobs = localStorage.getItem('subtitleJobs');
    if (savedSubtitleJobs) {
      try {
        const parsedJobs = JSON.parse(savedSubtitleJobs);
        setLocalSubtitleJobs(parsedJobs);
      } catch (error) {
        console.error("Error parsing saved subtitle jobs:", error);
      }
    }
  }, []);

  // Combine database subtitle jobs with local subtitle jobs
  const allSubtitleJobs = [...subtitleJobs, ...localSubtitleJobs].reduce((acc, job) => {
    const exists = acc.find(existingJob => existingJob.id === job.id);
    if (!exists) {
      acc.push(job);
    }
    return acc;
  }, [] as any[]);

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
          <TabsTrigger value="subtitles">Subtitles ({allSubtitleJobs.length})</TabsTrigger>
          <TabsTrigger value="videos">Video Clips ({videoClips.length})</TabsTrigger>
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

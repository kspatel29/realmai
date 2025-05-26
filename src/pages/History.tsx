
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DubbingJobsList from "@/components/DubbingJobsList";
import SubtitleJobsList from "@/components/SubtitleJobsList";
import VideoClipsHistory from "@/components/VideoClipsHistory";
import { useDubbingJobs } from "@/hooks/dubbingJobs";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";
import { useVideoClips } from "@/hooks/useVideoClips";
import { useState } from "react";

const History = () => {
  const { jobs: dubbingJobs, isLoading: isDubbingLoading, refetch: refetchDubbing } = useDubbingJobs();
  const { jobs: subtitleJobs, isLoading: isSubtitlesLoading, refreshJobs: refreshSubtitles } = useSubtitleJobs();
  const { clips: videoClips, isLoading: isVideoClipsLoading, refetch: refetchVideoClips } = useVideoClips();
  const [currentTab, setCurrentTab] = useState("dubbing");

  const totalJobs = dubbingJobs.length + subtitleJobs.length + videoClips.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">History</h1>
        <p className="text-muted-foreground">
          View your past jobs and their outputs across all services. Total jobs: {totalJobs}
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="dubbing">
            Dubbing ({dubbingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="subtitles">
            Subtitles ({subtitleJobs.length})
          </TabsTrigger>
          <TabsTrigger value="video-clips">
            Video Clips ({videoClips.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dubbing" className="mt-6">
          <DubbingJobsList 
            jobs={dubbingJobs} 
            onRefresh={refetchDubbing} 
            isLoading={isDubbingLoading} 
          />
        </TabsContent>
        
        <TabsContent value="subtitles" className="mt-6">
          <SubtitleJobsList />
        </TabsContent>
        
        <TabsContent value="video-clips" className="mt-6">
          <VideoClipsHistory 
            clips={videoClips}
            isLoading={isVideoClipsLoading}
            onRefresh={refetchVideoClips}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;

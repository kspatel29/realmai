
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DubbingJobsList from "@/components/DubbingJobsList";
import SubtitleJobsList from "@/components/SubtitleJobsList";
import { useDubbingJobs } from "@/hooks/dubbingJobs";
import { useSubtitleJobs } from "@/hooks/useSubtitleJobs";

const History = () => {
  const { jobs, isLoading, refetch } = useDubbingJobs();
  const { jobs: subtitleJobs, isLoading: isSubtitlesLoading, refreshJobs } = useSubtitleJobs();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">History</h1>
        <p className="text-muted-foreground">
          View your past jobs and their status.
        </p>
      </div>

      <Tabs defaultValue="dubbing" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dubbing">Dubbing</TabsTrigger>
          <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default History;

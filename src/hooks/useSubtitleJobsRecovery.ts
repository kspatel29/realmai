
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { checkSubtitlesStatus, updateSubtitleJob } from '@/services/api/subtitlesService';
import { toast } from 'sonner';

export const useSubtitleJobsRecovery = () => {
  const { user } = useAuth();

  useEffect(() => {
    const recoverPendingJobs = async () => {
      if (!user) return;

      try {
        // Find jobs that are still marked as processing but might be completed
        const { data: pendingJobs, error } = await supabase
          .from('subtitle_jobs')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['starting', 'processing'])
          .not('prediction_id', 'is', null);

        if (error || !pendingJobs?.length) return;

        console.log(`Found ${pendingJobs.length} pending subtitle jobs to check`);

        // Check each pending job
        for (const job of pendingJobs) {
          if (!job.prediction_id) continue;

          try {
            const result = await checkSubtitlesStatus(job.prediction_id);
            console.log(`Recovery check for job ${job.id}:`, result);

            if ((result.status === 'succeeded' || result.status === 'completed') && result.output) {
              // Job is actually completed, update it
              const output = result.output;
              let srtUrl = output.srt_file || output.srt_url || '';
              let vttUrl = output.vtt_file || output.vtt_url || '';
              let previewText = output.preview || output.text || output.preview_text || '';

              await updateSubtitleJob(job.id, {
                status: 'completed',
                srt_url: srtUrl,
                vtt_url: vttUrl,
                preview_text: previewText
              });

              // Save to localStorage for history
              const subtitleEntry = {
                id: job.id,
                type: 'subtitle',
                title: job.original_filename || 'Subtitle Job',
                status: 'completed',
                created_at: job.created_at,
                srt_url: srtUrl,
                vtt_url: vttUrl,
                preview_text: previewText,
                original_filename: job.original_filename
              };

              const savedJobs = localStorage.getItem('subtitleJobs');
              const existingJobs = savedJobs ? JSON.parse(savedJobs) : [];
              const updatedJobs = [subtitleEntry, ...existingJobs.filter((savedJob: any) => savedJob.id !== job.id)];
              localStorage.setItem('subtitleJobs', JSON.stringify(updatedJobs));

              console.log(`Recovered completed subtitle job: ${job.id}`);
              toast.success(`Subtitle job "${job.original_filename || 'Audio file'}" has been completed!`);
            } else if (result.status === 'failed' || result.status === 'error') {
              // Job failed, update status
              await updateSubtitleJob(job.id, {
                status: 'failed',
                error: result.error || 'Generation failed'
              });
              console.log(`Marked failed subtitle job: ${job.id}`);
            }
          } catch (error) {
            console.error(`Error checking job ${job.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error during subtitle jobs recovery:', error);
      }
    };

    // Run recovery check when component mounts
    recoverPendingJobs();

    // Set up periodic recovery check every 30 seconds
    const recoveryInterval = setInterval(recoverPendingJobs, 30000);

    return () => {
      clearInterval(recoveryInterval);
    };
  }, [user]);

  return {};
};

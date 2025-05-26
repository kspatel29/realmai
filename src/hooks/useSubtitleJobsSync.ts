
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useSubtitleJobsSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    const syncCompletedJobs = async () => {
      if (!user) return;

      try {
        // Fetch completed jobs from database
        const { data: dbJobs, error } = await supabase
          .from('subtitle_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (error) {
          console.error('Error fetching completed jobs:', error);
          return;
        }

        // Get existing local jobs
        const localJobs = JSON.parse(localStorage.getItem('subtitleJobs') || '[]');
        
        // Add any completed database jobs that aren't in localStorage
        let hasNewJobs = false;
        const updatedJobs = [...localJobs];

        dbJobs?.forEach(dbJob => {
          const existsLocally = localJobs.find((localJob: any) => localJob.id === dbJob.id);
          
          if (!existsLocally && dbJob.status === 'completed') {
            updatedJobs.unshift({
              id: dbJob.id,
              type: 'subtitle',
              title: dbJob.original_filename || 'Subtitle Job',
              status: 'completed',
              created_at: dbJob.created_at,
              srt_url: dbJob.srt_url,
              vtt_url: dbJob.vtt_url,
              preview_text: dbJob.preview_text,
              original_filename: dbJob.original_filename
            });
            hasNewJobs = true;
          }
        });

        if (hasNewJobs) {
          localStorage.setItem('subtitleJobs', JSON.stringify(updatedJobs));
          console.log(`Synced ${dbJobs?.length || 0} completed subtitle jobs`);
        }

      } catch (error) {
        console.error('Error syncing subtitle jobs:', error);
      }
    };

    syncCompletedJobs();
  }, [user]);

  return {};
};

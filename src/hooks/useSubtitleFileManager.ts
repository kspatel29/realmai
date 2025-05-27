
import { useState } from 'react';
import { downloadAndStoreSubtitleFiles } from '@/services/videoClipsService';
import { supabase } from '@/integrations/supabase/client';

export const useSubtitleFileManager = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAndStoreSubtitleFiles = async (
    jobId: string,
    srtUrl?: string,
    vttUrl?: string
  ) => {
    if (!srtUrl && !vttUrl) return { srtUrl, vttUrl };
    
    setIsProcessing(true);
    
    try {
      // Download and store files in Supabase
      const storedFiles = await downloadAndStoreSubtitleFiles(srtUrl, vttUrl, jobId);
      
      // Update the subtitle job with the new URLs
      const { error } = await supabase
        .from('subtitle_jobs')
        .update({
          srt_url: storedFiles.srtUrl || srtUrl,
          vtt_url: storedFiles.vttUrl || vttUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating subtitle job with stored URLs:', error);
        return { srtUrl, vttUrl }; // Return original URLs on error
      }

      console.log('Subtitle files processed and stored successfully');
      return {
        srtUrl: storedFiles.srtUrl || srtUrl,
        vttUrl: storedFiles.vttUrl || vttUrl
      };
    } catch (error) {
      console.error('Error processing subtitle files:', error);
      return { srtUrl, vttUrl }; // Return original URLs on error
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processAndStoreSubtitleFiles,
    isProcessing
  };
};


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobStatus {
  id: string;
  status: 'starting' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgressCallback {
  (progress: number, status: string): void;
}

export class JobManagerService {
  private static instance: JobManagerService;
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private progressCallbacks: Map<string, JobProgressCallback[]> = new Map();

  public static getInstance(): JobManagerService {
    if (!JobManagerService.instance) {
      JobManagerService.instance = new JobManagerService();
    }
    return JobManagerService.instance;
  }

  async startJob(
    jobType: 'dubbing' | 'subtitles' | 'video_generation',
    jobData: any,
    onProgress?: JobProgressCallback
  ): Promise<string> {
    try {
      let jobId: string;
      
      switch (jobType) {
        case 'dubbing':
          jobId = await this.createDubbingJob(jobData);
          break;
        case 'subtitles':
          jobId = await this.createSubtitleJob(jobData);
          break;
        case 'video_generation':
          jobId = await this.createVideoGenerationJob(jobData);
          break;
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }

      if (onProgress) {
        this.addProgressCallback(jobId, onProgress);
      }

      this.startPolling(jobId, jobType);
      return jobId;
    } catch (error) {
      console.error('Job start error:', error);
      throw error;
    }
  }

  private async createDubbingJob(jobData: any): Promise<string> {
    const { data, error } = await supabase
      .from('dubbing_jobs')
      .insert({
        user_id: jobData.userId,
        sieve_job_id: jobData.sieveJobId,
        status: 'starting',
        languages: jobData.languages
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  private async createSubtitleJob(jobData: any): Promise<string> {
    const { data, error } = await supabase
      .from('subtitle_jobs')
      .insert({
        user_id: jobData.userId,
        model_name: jobData.modelName,
        language: jobData.language,
        original_filename: jobData.originalFilename,
        prediction_id: jobData.predictionId,
        status: 'starting'
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  private async createVideoGenerationJob(jobData: any): Promise<string> {
    // For video generation, we'll create a service usage log entry
    const { data, error } = await supabase
      .from('service_usage_logs')
      .insert({
        user_id: jobData.userId,
        service_type: 'video_generation',
        credits_used: jobData.creditsUsed,
        status: 'processing',
        metadata: {
          prompt: jobData.prompt,
          duration: jobData.duration,
          prediction_id: jobData.predictionId
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  addProgressCallback(jobId: string, callback: JobProgressCallback): void {
    if (!this.progressCallbacks.has(jobId)) {
      this.progressCallbacks.set(jobId, []);
    }
    this.progressCallbacks.get(jobId)!.push(callback);
  }

  private startPolling(jobId: string, jobType: string): void {
    if (this.pollIntervals.has(jobId)) {
      return; // Already polling
    }

    const interval = setInterval(async () => {
      try {
        const status = await this.checkJobStatus(jobId, jobType);
        
        // Notify progress callbacks
        const callbacks = this.progressCallbacks.get(jobId) || [];
        callbacks.forEach(callback => {
          callback(status.progress || 0, status.status);
        });

        // Stop polling if job is complete
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          this.stopPolling(jobId);
          
          if (status.status === 'completed') {
            toast.success(`${jobType} job completed successfully`);
          } else if (status.status === 'failed') {
            toast.error(`${jobType} job failed: ${status.error || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Job polling error:', error);
        this.stopPolling(jobId);
      }
    }, 5000); // Poll every 5 seconds

    this.pollIntervals.set(jobId, interval);
  }

  private async checkJobStatus(jobId: string, jobType: string): Promise<JobStatus> {
    let tableName: string;
    
    switch (jobType) {
      case 'dubbing':
        tableName = 'dubbing_jobs';
        break;
      case 'subtitles':
        tableName = 'subtitle_jobs';
        break;
      case 'video_generation':
        tableName = 'service_usage_logs';
        break;
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      status: data.status,
      error: data.error,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  stopPolling(jobId: string): void {
    const interval = this.pollIntervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(jobId);
    }
    this.progressCallbacks.delete(jobId);
  }

  cancelJob(jobId: string): void {
    this.stopPolling(jobId);
    // Additional cancellation logic can be added here
  }

  cleanup(): void {
    // Clean up all intervals
    this.pollIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollIntervals.clear();
    this.progressCallbacks.clear();
  }
}

export const jobManager = JobManagerService.getInstance();

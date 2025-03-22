
export interface DubbingJob {
  id: string;
  user_id: string;
  sieve_job_id: string;
  status: string;
  languages: string[];
  created_at: string;
  updated_at: string;
  output_url?: string;
  error?: string;
}

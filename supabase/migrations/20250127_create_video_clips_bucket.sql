
-- Create the video-clips storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-clips', 'video-clips', true);

-- Create policy for video-clips bucket to allow authenticated users to upload
CREATE POLICY "Users can upload video clips" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'video-clips' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for video-clips bucket to allow users to view their own clips
CREATE POLICY "Users can view their own video clips" ON storage.objects
FOR SELECT USING (
  bucket_id = 'video-clips' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for video-clips bucket to allow public access (for generated clips)
CREATE POLICY "Public access to video clips" ON storage.objects
FOR SELECT USING (bucket_id = 'video-clips');

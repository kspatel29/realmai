
import { supabase } from "@/integrations/supabase/client";

export const uploadImageFromDataUrl = async (dataUrl: string, fileName: string): Promise<string> => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create a unique file name
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('video-frames')
      .upload(uniqueFileName, blob, {
        contentType: blob.type,
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('video-frames')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

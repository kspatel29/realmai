
import { API_KEY, API_BASE_URL } from './config';

export const getFileUploadUrl = async (fileName: string, contentType: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/push/inputs/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        fileName,
        contentType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get upload URL');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting file upload URL:', error);
    throw error;
  }
};

export const verifyOutputUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error verifying output URL:', error);
    return false;
  }
};

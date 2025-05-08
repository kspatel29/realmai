import { useState } from 'react';

export const useSubtitleFiles = () => {
  const [previewContent, setPreviewContent] = useState<string>('');

  const fetchAndPreviewFile = async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      setPreviewContent(text);
      return text;
    } catch (error) {
      console.error('Error fetching subtitle file:', error);
      return null;
    }
  };

  const downloadFile = async (url: string, fileType: 'srt' | 'vtt') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `subtitles.${fileType}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return {
    previewContent,
    fetchAndPreviewFile,
    downloadFile,
  };
};

export interface SieveLanguage {
  code: string;
  name: string;
  flag: string;
}

export interface SieveDubbingResponse {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "finished";
  created_at: string;
  updated_at: string;
  function: string;
  inputs: Record<string, any>;
  outputs?: {
    output_0?: {
      url: string;
    };
  };
  error?: {
    message: string;
  };
}

export interface DubbingOptions {
  target_language: string;
  enable_voice_cloning?: boolean;
  preserve_background_audio?: boolean;
  enable_lipsyncing?: boolean;
  safewords?: string;
  translation_dictionary?: string;
  start_time?: number;
  end_time?: number;
}

export const SUPPORTED_LANGUAGES: SieveLanguage[] = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "portuguese", name: "Portuguese", flag: "🇵🇹" },
  { code: "mandarin", name: "Mandarin", flag: "🇨🇳" },
  { code: "spanish", name: "Spanish", flag: "🇪🇸" },
  { code: "french", name: "French", flag: "🇫🇷" },
  { code: "german", name: "German", flag: "🇩🇪" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵" },
  { code: "arabic", name: "Arabic", flag: "🇦🇪" },
  { code: "russian", name: "Russian", flag: "🇷🇺" },
  { code: "korean", name: "Korean", flag: "🇰🇷" },
  { code: "indonesian", name: "Indonesian", flag: "🇮🇩" },
  { code: "italian", name: "Italian", flag: "🇮🇹" },
  { code: "dutch", name: "Dutch", flag: "🇳🇱" },
  { code: "turkish", name: "Turkish", flag: "🇹🇷" },
  { code: "polish", name: "Polish", flag: "🇵🇱" },
  { code: "swedish", name: "Swedish", flag: "🇸🇪" },
  { code: "tagalog", name: "Tagalog", flag: "🇵🇭" },
  { code: "malay", name: "Malay", flag: "🇲🇾" },
  { code: "romanian", name: "Romanian", flag: "🇷🇴" },
  { code: "ukrainian", name: "Ukrainian", flag: "🇺🇦" },
  { code: "greek", name: "Greek", flag: "🇬🇷" },
  { code: "czech", name: "Czech", flag: "🇨🇿" },
  { code: "danish", name: "Danish", flag: "🇩🇰" },
  { code: "finnish", name: "Finnish", flag: "🇫🇮" },
  { code: "bulgarian", name: "Bulgarian", flag: "🇧🇬" },
  { code: "croatian", name: "Croatian", flag: "🇭🇷" },
  { code: "slovak", name: "Slovak", flag: "🇸🇰" },
  { code: "tamil", name: "Tamil", flag: "🇮🇳" }
];

export const LIPSYNC_BACKENDS = [
  { value: "sievesync-1.1", label: "SieveSync 1.1 (Recommended)" },
  { value: "sync-1.9.0-beta", label: "Sync 1.9.0 Beta" },
  { value: "hummingbird", label: "Hummingbird" },
  { value: "latentsync", label: "LatentSync" }
];

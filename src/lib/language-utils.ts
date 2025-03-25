
/**
 * Extracts the language name from a language code or full language string
 * @param language Language code or full language string (e.g., "en-US" or "English (United States)")
 * @returns Simplified language name
 */
export function extractLanguageName(language: string): string {
  // If language is already a full name with parentheses (e.g., "English (United States)")
  if (language.includes('(')) {
    return language.split('(')[0].trim();
  }
  
  // Common language code mappings
  const languageMap: Record<string, string> = {
    'en': 'English',
    'en-US': 'English',
    'en-GB': 'English (UK)',
    'es': 'Spanish',
    'es-ES': 'Spanish',
    'es-MX': 'Spanish (Mexico)',
    'fr': 'French',
    'fr-FR': 'French',
    'de': 'German',
    'de-DE': 'German',
    'it': 'Italian',
    'it-IT': 'Italian',
    'pt': 'Portuguese',
    'pt-BR': 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
    'ru': 'Russian',
    'ru-RU': 'Russian',
    'ja': 'Japanese',
    'ja-JP': 'Japanese',
    'ko': 'Korean',
    'ko-KR': 'Korean',
    'zh': 'Chinese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'tr': 'Turkish',
    'pl': 'Polish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'id': 'Indonesian',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'el': 'Greek',
    'he': 'Hebrew'
  };
  
  // If we have a direct mapping, use it
  if (language in languageMap) {
    return languageMap[language];
  }
  
  // If it's a hyphenated code we don't recognize (like 'en-CA'), try the primary code
  const primaryCode = language.split('-')[0];
  if (primaryCode in languageMap) {
    return languageMap[primaryCode];
  }
  
  // If all else fails, return the original string with first letter capitalized
  return language.charAt(0).toUpperCase() + language.slice(1);
}

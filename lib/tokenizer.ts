import { WordToken } from '@/types';

/**
 * Hebrew Unicode ranges
 */
const HEBREW_LETTERS = /[\u05D0-\u05EA]/;
const HEBREW_DIACRITICS = /[\u0591-\u05C7]/;
const SOF_PASUK = '\u05C3';

/**
 * Tokenizes Hebrew text into individual word tokens for RSVP display
 * @param text - The Hebrew text to tokenize
 * @returns Array of WordToken objects
 */
export function tokenizeHebrew(text: string): WordToken[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  let normalized = text.trim();
  
  if (normalized.length === 0) {
    return [];
  }

  // Strip HTML tags, HTML entities, and Hebrew section markers
  normalized = normalized
    .replace(/<[^>]+>/g, ' ')  // Replace HTML tags with space
    .replace(/&nbsp;/g, ' ')   // Replace &nbsp; with space
    .replace(/&amp;/g, '&')    // Replace &amp; with &
    .replace(/&lt;/g, '<')     // Replace &lt; with <
    .replace(/&gt;/g, '>')     // Replace &gt; with >
    .replace(/&quot;/g, '"')   // Replace &quot; with "
    .replace(/&#39;/g, "'")   // Replace &#39; with '
    .replace(/\{[פס]\}/g, ''); // Remove Hebrew section markers {פ} (setumah) and {ס} (petucha)

  // Add space between punctuation and next word, but keep punctuation attached to previous word
  // This handles cases like "word׃,nextword" -> "word׃, nextword"
  normalized = normalized
    .replace(/([,\u05C3])([\u05D0-\u05EA])/g, '$1 $2')  // Add space after comma/sof pasuk if followed by Hebrew letter
    .replace(/\s+/g, ' ');  // Normalize multiple spaces to single space

  // Split by whitespace
  const words = normalized.split(/\s+/).filter(word => word.length > 0);

  return words.map((word, index) => {
    const cleanWord = word.trim();
    // Use Array.from to handle Unicode characters correctly
    const chars = Array.from(cleanWord);
    const length = chars.length;
    
    // Check for various word properties
    const hasNikkud = HEBREW_DIACRITICS.test(cleanWord);
    const hasComma = cleanWord.includes(',');
    const hasPeriod = cleanWord.includes('.');
    const hasSofPasuk = cleanWord.includes(SOF_PASUK);
    const isLong = length > 8;
    const isShort = length <= 2;

    return {
      text: cleanWord,
      index,
      length,
      hasNikkud,
      hasComma,
      hasPeriod,
      hasSofPasuk,
      isLong,
      isShort,
    };
  });
}

/**
 * Groups consecutive short words together to improve reading flow
 * @param tokens - Array of word tokens
 * @param maxGroupSize - Maximum number of words to group together (default: 3)
 * @returns Array of grouped tokens
 */
export function groupSmallWords(
  tokens: WordToken[],
  maxGroupSize: number = 3
): WordToken[] {
  if (!tokens.length) return [];

  const result: WordToken[] = [];
  let currentGroup: WordToken[] = [];

  for (const token of tokens) {
    if (token.isShort && currentGroup.length < maxGroupSize) {
      currentGroup.push(token);
    } else {
      // Flush current group if exists
      if (currentGroup.length > 0) {
        result.push(createGroupToken(currentGroup, result.length));
        currentGroup = [];
      }
      // Add current token
      result.push({
        ...token,
        index: result.length,
      });
    }
  }

  // Flush remaining group
  if (currentGroup.length > 0) {
    result.push(createGroupToken(currentGroup, result.length));
  }

  return result;
}

/**
 * Creates a grouped token from multiple short tokens
 */
function createGroupToken(tokens: WordToken[], index: number): WordToken {
  const combinedText = tokens.map(t => t.text).join(' ');
  const chars = Array.from(combinedText);
  
  return {
    text: combinedText,
    index,
    length: chars.length,
    hasNikkud: tokens.some(t => t.hasNikkud),
    hasComma: tokens[tokens.length - 1]?.hasComma ?? false,
    hasPeriod: tokens[tokens.length - 1]?.hasPeriod ?? false,
    hasSofPasuk: tokens[tokens.length - 1]?.hasSofPasuk ?? false,
    isLong: chars.length > 8,
    isShort: false, // Grouped tokens are never short
  };
}

/**
 * Checks if text contains Hebrew characters
 * @param text - Text to check
 * @returns True if text contains Hebrew letters
 */
export function isHebrew(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return HEBREW_LETTERS.test(text);
}

/**
 * Cleans Hebrew text by removing extra whitespace and normalizing
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function cleanHebrewText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .replace(/^\s+|\s+$/g, '') // Trim
    .trim();
}

/**
 * Counts words in Hebrew text (Unicode-aware)
 * @param text - Text to count
 * @returns Number of words
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

import { WordToken } from '@/types';
import { Language } from './i18n';

/**
 * How long a word stays on screen at the given speed (words per minute).
 * Used both by the reader's timer and by the reading-time estimate, so the
 * estimate matches what actually plays.
 */
export function wordDelayMs(word: WordToken, wpm: number, targumPace = 1): number {
  // Base delay in milliseconds: 60000ms / WPM
  const baseDelay = 60000 / wpm;
  let multiplier = 1.0;

  // Apply multipliers based on word properties
  if (word.isShort) multiplier *= 0.7;      // Short words: faster
  if (word.isLong) multiplier *= 1.3;       // Long words: slower
  if (word.hasComma) multiplier *= 1.2;     // Comma: slight pause
  if (word.hasPeriod) multiplier *= 1.5;    // Period: longer pause
  if (word.hasSofPasuk) multiplier *= 1.8;  // Sof pasuk: longest pause
  if (word.hasNikkud) multiplier *= 1.1;    // Nikkud: slightly slower
  if (word.source?.kind === 'targum') multiplier /= targumPace; // Aramaic: user's slower pace

  return baseDelay * multiplier;
}

/**
 * Time left from each word to the end: entry i is the time to read words
 * i..end, so entry 0 is the total. Ignores warm-up, which only adds a few
 * seconds each time playback starts.
 */
export function timeRemainingFrom(words: WordToken[], wpm: number, targumPace = 1): Float64Array {
  const remaining = new Float64Array(words.length + 1);
  for (let i = words.length - 1; i >= 0; i--) {
    remaining[i] = remaining[i + 1] + wordDelayMs(words[i], wpm, targumPace);
  }
  return remaining;
}

/** "1h 12m" / "1 ש׳ 12 דק׳", rounded to the minute ("<1m" under a minute) */
export function formatDuration(ms: number, lang: Language): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const [h, m, under] = lang === 'he' ? ['ש׳', 'דק׳', 'פחות מדקה'] : ['h', 'm', '<1m'];
  const sep = lang === 'he' ? ' ' : '';

  if (totalMinutes < 1) return under;
  if (hours === 0) return `${minutes}${sep}${m}`;
  if (minutes === 0) return `${hours}${sep}${h}`;
  return `${hours}${sep}${h} ${minutes}${sep}${m}`;
}

import { ReadingMode, WordToken } from '@/types';
import { findPasukStart } from './reading';

/**
 * Reading position per parsha, saved in the browser. Never throws: if storage
 * is unavailable the reader just starts from the beginning.
 */

const PREFIX = 'maver-sedra:progress:';

export interface ReadingProgress {
  /** Mode the position was saved in */
  mode: ReadingMode;
  /** Word index within that mode's sequence */
  index: number;
  /** Pasuk being read, e.g. "Genesis 1:5", used to resume in another mode */
  ref: string;
  /** 0-100, for showing on the parsha card */
  percent: number;
  /** When it was saved (ms since epoch) */
  savedAt: number;
}

export function loadProgress(slug: string): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(PREFIX + slug);
    return raw ? JSON.parse(raw) as ReadingProgress : null;
  } catch {
    return null;
  }
}

export function saveProgress(slug: string, progress: Omit<ReadingProgress, 'savedAt'>): void {
  try {
    localStorage.setItem(PREFIX + slug, JSON.stringify({ ...progress, savedAt: Date.now() }));
  } catch {
    // Storage full or unavailable; progress just isn't kept
  }
}

export function clearProgress(slug: string): void {
  try {
    localStorage.removeItem(PREFIX + slug);
  } catch {
    // Nothing to clear
  }
}

/**
 * Where to start reading: the exact word if the saved position is from the
 * same mode, otherwise the start of the saved pasuk
 */
export function resumeIndex(tokens: WordToken[], mode: ReadingMode, saved: ReadingProgress | null): number {
  if (!saved) return 0;
  if (saved.mode === mode && tokens[saved.index]?.source?.ref === saved.ref) {
    return saved.index;
  }
  return findPasukStart(tokens, saved.ref);
}

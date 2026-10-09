import { ReadingMode, WordSource, WordToken } from '@/types';
import { tokenizeHebrew } from './tokenizer';

/** One pasuk of the parsha with its targum */
export interface ParshaVerse {
  /** e.g. "Genesis 1:5" */
  ref: string;
  /** Torah text, cleaned for reading */
  text: string;
  /** Targum Onkelos, cleaned for reading */
  targum: string;
  /** Whether a section ({פ} / {ס}) ends after this pasuk */
  endsSection: boolean;
}

/** Reading modes in the order they're offered (labels live in lib/i18n.ts) */
export const READING_MODES: ReadingMode[] = ['pasuk', 'section', 'parsha', 'once'];

/**
 * Builds the word sequence for reading a parsha in the given mode.
 * Every word carries its source (mikra/targum, which pass, which pasuk),
 * and the last word of every pasuk is marked as ending one, so the reader
 * pauses there and verse navigation works for the targum too.
 */
export function buildReading(verses: ParshaVerse[], mode: ReadingMode): WordToken[] {
  const tokens: WordToken[] = [];

  const read = (chunk: ParshaVerse[], kind: WordSource['kind'], pass: WordSource['pass']) => {
    for (const verse of chunk) {
      const words = tokenizeHebrew(kind === 'mikra' ? verse.text : verse.targum);
      if (words.length === 0) continue;
      words[words.length - 1].hasSofPasuk = true;
      for (const word of words) {
        tokens.push({
          ...word,
          index: tokens.length,
          source: { kind, pass, ref: verse.ref },
        });
      }
    }
  };

  if (mode === 'once') {
    read(verses, 'mikra', 1);
    return tokens;
  }

  for (const chunk of chunksFor(verses, mode)) {
    read(chunk, 'mikra', 1);
    read(chunk, 'mikra', 2);
    read(chunk, 'targum', 1);
  }
  return tokens;
}

function chunksFor(verses: ParshaVerse[], mode: Exclude<ReadingMode, 'once'>): ParshaVerse[][] {
  if (mode === 'pasuk') return verses.map((v) => [v]);
  if (mode === 'parsha') return [verses];

  const chunks: ParshaVerse[][] = [];
  let current: ParshaVerse[] = [];
  for (const verse of verses) {
    current.push(verse);
    if (verse.endsSection) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/**
 * Where to resume after switching modes: the first Torah word of the pasuk
 * being read, or the start if it can't be found
 */
export function findPasukStart(tokens: WordToken[], ref: string | undefined): number {
  if (!ref) return 0;
  const index = tokens.findIndex((t) => t.source?.ref === ref && t.source.kind === 'mikra');
  return Math.max(0, index);
}

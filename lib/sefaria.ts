import { Aliyah } from '@/types';
import { readCache, writeCache } from './cache';

const SEFARIA_BASE_URL = 'https://www.sefaria.org/api';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days; the text doesn't change

/**
 * Sefaria API response for text fetching
 */
interface SefariaTextResponse {
  he?: SefariaVerses; // Hebrew verses
  text?: SefariaVerses; // English verses
  heRef?: string; // Hebrew reference
  ref?: string; // English reference
  length?: number; // Number of verses
  title?: string; // Book title
  sections?: number[]; // [chapter, verse] of the first verse
}

/**
 * Sefaria returns a string for a single verse, an array for a range within one
 * chapter, and an array of arrays (one per chapter) for a cross-chapter range
 */
type SefariaVerses = string | SefariaVerses[];

function flattenVerses(verses: SefariaVerses | undefined): string[] {
  if (verses === undefined) return [];
  if (typeof verses === 'string') return [verses];
  return verses.flatMap(flattenVerses);
}

/**
 * Chapter and verse of each verse in a response, starting from `sections`
 * (a nested response starts a new chapter at verse 1 for each inner array)
 */
function verseRefs(verses: SefariaVerses | undefined, [chapter, verse]: number[]): VerseRef[] {
  if (verses === undefined) return [];
  if (typeof verses === 'string') return [{ chapter, verse }];
  if (verses.every((v) => typeof v === 'string')) {
    return verses.map((_, i) => ({ chapter, verse: verse + i }));
  }
  return verses.flatMap((inner, i) => verseRefs(inner, [chapter + i, i === 0 ? verse : 1]));
}

/** A {פ} or {ס} marker at the very end of a verse closes a Torah section */
const SECTION_END = /<span class="mam-spi-(pe|samekh)">[^<]*<\/span>(\s|&nbsp;|&thinsp;|<br\s*\/?>)*$/;

/**
 * Result from fetching text
 */
export interface SefariaTextResult {
  hebrewVerses: string[];
  englishVerses: string[];
  reference: string;
  hebrewReference: string;
  /** Chapter and verse of each entry in hebrewVerses */
  verseRefs: VerseRef[];
  /** Whether each verse closes a section ({פ} / {ס}); always false for targum */
  sectionEnds: boolean[];
}

export interface VerseRef {
  chapter: number;
  verse: number;
}

/**
 * Interface for the Sefaria API client
 */
export interface SefariaClient {
  /** Get text for a specific reference */
  getText(ref: string): Promise<SefariaTextResult | null>;
  /** Get text for an aliyah */
  getAliyahText(aliyah: Aliyah): Promise<SefariaTextResult | null>;
  /** Get Targum Onkelos for an aliyah */
  getTargumText(aliyah: Aliyah): Promise<SefariaTextResult | null>;
  /** Get text for multiple verses range */
  getVersesText(book: string, startChapter: number, startVerse: number, endChapter: number, endVerse: number): Promise<SefariaTextResult | null>;
}

/**
 * Creates a Sefaria API client with caching
 */
export function createSefariaClient(): SefariaClient {
  return {
    getText,
    getAliyahText,
    getTargumText,
    getVersesText,
  };
}

/**
 * Fetches a Sefaria API response, or null on any error
 */
async function fetchJson(url: string): Promise<SefariaTextResponse | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Sefaria API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json() as SefariaTextResponse;
  } catch (error) {
    console.error('Sefaria API fetch error:', error);
    return null;
  }
}

/**
 * Turns one verse of Sefaria's Hebrew HTML into plain text to read:
 * drops editorial footnotes, the ketiv of ketiv/qere pairs (keeping the qere,
 * which is what is read aloud), section markers ({פ} / {ס}), inverted nuns and
 * paseq marks, and unwraps formatting tags like the large first letter in
 * <big>בְּ</big>רֵאשִׁ֖ית without splitting the word.
 */
export function cleanHebrewVerse(html: string): string {
  return html
    .replace(/<sup class="footnote-marker">.*?<\/sup>/g, '')
    .replace(/<i class="footnote">.*?<\/i>/g, '')
    .replace(/<span class="mam-kq-k">.*?<\/span>/g, '')
    .replace(/<span class="mam-spi-[^"]*">.*?<\/span>/g, ' ')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(nbsp|thinsp);/g, ' ')
    .replace(/[\u05C0\u05C6]/g, ' ') // paseq, inverted nun
    .replace(/[[\]]/g, '') // brackets around the qere
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Turns one verse of Sefaria's Onkelos (Metsudah edition) into plain text:
 * drops the editorial alternate readings in parentheses ("(נ"א ...)"),
 * unwraps the bold highlighting, and ends the verse with a sof pasuk instead
 * of a colon so the reader pauses there as it does for the Torah text.
 */
export function cleanTargumVerse(html: string): string {
  return html
    .replace(/\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s*:/g, '\u05C3')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts book name to Sefaria format
 */
function convertBookName(book: string): string {
  const bookMap: Record<string, string> = {
    'Genesis': 'Genesis',
    'Exodus': 'Exodus',
    'Leviticus': 'Leviticus',
    'Numbers': 'Numbers',
    'Deuteronomy': 'Deuteronomy',
  };
  
  return bookMap[book] || book;
}

/**
 * Builds a Sefaria reference string
 */
function buildReference(book: string, startChapter: number, startVerse: number, endChapter?: number, endVerse?: number): string {
  const convertedBook = convertBookName(book);
  
  if (endChapter === undefined || endVerse === undefined) {
    // Single verse
    return `${convertedBook}.${startChapter}.${startVerse}`;
  }
  
  if (startChapter === endChapter) {
    // Same chapter
    return `${convertedBook}.${startChapter}.${startVerse}-${endVerse}`;
  }
  
  // Different chapters
  return `${convertedBook}.${startChapter}.${startVerse}-${endChapter}.${endVerse}`;
}

/**
 * Gets text for a specific reference, with the Hebrew cleaned for reading
 */
async function getText(ref: string): Promise<SefariaTextResult | null> {
  return fetchText(ref, cleanHebrewVerse);
}

async function fetchText(ref: string, clean: (html: string) => string): Promise<SefariaTextResult | null> {
  // context=0: otherwise Sefaria pads the range out to whole chapters
  const url = `${SEFARIA_BASE_URL}/texts/${encodeURIComponent(ref)}?context=0`;
  const cacheKey = `v2:${url}`;

  const cached = readCache<SefariaTextResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchJson(url);
  if (!data) {
    return null;
  }

  const rawHebrew = flattenVerses(data.he);
  const result: SefariaTextResult = {
    hebrewVerses: rawHebrew.map(clean),
    englishVerses: flattenVerses(data.text),
    reference: data.ref || ref,
    hebrewReference: data.heRef || '',
    verseRefs: verseRefs(data.he, data.sections ?? [1, 1]),
    sectionEnds: rawHebrew.map((v) => SECTION_END.test(v)),
  };
  writeCache(cacheKey, result, CACHE_DURATION);
  return result;
}

/**
 * Gets text for an aliyah
 */
async function getAliyahText(aliyah: Aliyah): Promise<SefariaTextResult | null> {
  const ref = buildReference(aliyah.book, aliyah.startChapter, aliyah.startVerse, aliyah.endChapter, aliyah.endVerse);
  return getText(ref);
}

/**
 * Gets Targum Onkelos for an aliyah (it is verse-for-verse with the Torah)
 */
async function getTargumText(aliyah: Aliyah): Promise<SefariaTextResult | null> {
  const ref = buildReference(`Onkelos ${aliyah.book}`, aliyah.startChapter, aliyah.startVerse, aliyah.endChapter, aliyah.endVerse);
  return fetchText(ref, cleanTargumVerse);
}

/**
 * Gets text for a range of verses
 */
async function getVersesText(
  book: string,
  startChapter: number,
  startVerse: number,
  endChapter: number,
  endVerse: number
): Promise<SefariaTextResult | null> {
  const ref = buildReference(book, startChapter, startVerse, endChapter, endVerse);
  return getText(ref);
}

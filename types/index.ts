/**
 * Core data types for MAVER Sedra - RSVP Torah Reader
 */

/** Represents a single aliyah (Torah reading section) */
export interface Aliyah {
  /** Aliyah number (1-7, or maftir) */
  number: number;
  /** Book of the Torah */
  book: string;
  /** Starting chapter */
  startChapter: number;
  /** Starting verse */
  startVerse: number;
  /** Ending chapter */
  endChapter: number;
  /** Ending verse */
  endVerse: number;
  /** Number of verses in this aliyah */
  verseCount: number;
  /** Hebrew text content */
  text?: string;
}

/** Represents the haftarah (prophetic reading) */
export interface Haftara {
  /** Book of the Prophets */
  book: string;
  /** Starting chapter */
  startChapter: number;
  /** Starting verse */
  startVerse: number;
  /** Ending chapter */
  endChapter: number;
  /** Ending verse */
  endVerse: number;
  /** Hebrew text content (optional) */
  text?: string;
}

/** Represents a weekly Torah portion (parsha) */
export interface Parsha {
  /** English name (e.g., "Bereshit") */
  name: string;
  /** Hebrew name */
  hebrewName: string;
  /** Date of the Shabbat */
  date: string;
  /** Book of the Torah */
  book: string;
  /** Parsha number (1-54) */
  parshaNum: number;
  /** Array of aliyot for this parsha */
  aliyot: Aliyah[];
  /** Haftarah reading */
  haftara?: Haftara;
  /** Total number of verses */
  totalVerses: number;
}

/** Date-independent parsha data, as stored in lib/parshiot.ts */
export type ParshaInfo = Omit<Parsha, 'date' | 'haftara'>;

/** Represents a tokenized Hebrew word for RSVP display */
export interface WordToken {
  /** The word text */
  text: string;
  /** Index in the sequence */
  index: number;
  /** Character length (Unicode-aware) */
  length: number;
  /** Whether the word has Hebrew vowels (nikkud) */
  hasNikkud: boolean;
  /** Whether the word ends with a comma */
  hasComma: boolean;
  /** Whether the word ends with a period */
  hasPeriod: boolean;
  /** Whether the word ends with sof pasuk (׃) */
  hasSofPasuk: boolean;
  /** Whether this is a long word (>8 characters) */
  isLong: boolean;
  /** Whether this is a short word (<=2 characters) */
  isShort: boolean;
  /** Where the word comes from, when reading a parsha (see lib/reading.ts) */
  source?: WordSource;
}

/** Which pass over which pasuk a word belongs to */
export interface WordSource {
  /** Torah text or Targum Onkelos */
  kind: 'mikra' | 'targum';
  /** 1 or 2 for the two readings of the Torah text; 1 for targum */
  pass: 1 | 2;
  /** e.g. "Genesis 1:5" */
  ref: string;
}

/**
 * How to read the parsha:
 * - once: the Torah text once, no targum
 * - pasuk: each pasuk twice, then its targum (shnayim mikra v'echad targum)
 * - section: each section (up to a {פ} or {ס}) twice, then its targum
 * - parsha: the whole parsha twice, then the whole targum
 */
export type ReadingMode = 'once' | 'pasuk' | 'section' | 'parsha';

/** User preferences for the reader */
export interface UserPreferences {
  /** Reading speed in words per minute */
  speed: number;
  /** Color theme */
  theme: 'light' | 'dark';
  /** Font size preference */
  fontSize: 'small' | 'medium' | 'large';
  /** Follow the Israel reading schedule; unset means guess from the timezone */
  israel?: boolean;
  /** How to read the parsha (Torah twice and targum, and in what chunks) */
  readingMode: ReadingMode;
}

/** Hebcal API response types */

/** Single event from Hebcal API */
export interface HebcalEvent {
  /** Event title */
  title: string;
  /** Event date (ISO format) */
  date: string;
  /** Event category */
  category: string;
  /** Hebrew date/name */
  hebrew?: string;
  /** Leyning (Torah reading) details */
  leyning?: HebcalLeyning;
}

/** Leyning details from Hebcal API */
export interface HebcalLeyning {
  /** Aliyah 1 range (e.g., "Exodus 10:1-10:11") */
  "1": string;
  /** Aliyah 2 range */
  "2": string;
  /** Aliyah 3 range */
  "3": string;
  /** Aliyah 4 range */
  "4": string;
  /** Aliyah 5 range */
  "5": string;
  /** Aliyah 6 range */
  "6": string;
  /** Aliyah 7 range */
  "7": string;
  /** Full torah reading range */
  torah: string;
  /** Haftarah reading range */
  haftarah: string;
  /** Maftir reading range */
  maftir: string;
  /** Triennial reading (optional) */
  triennial?: Record<string, string>;
}

/** Haftarah details from Hebcal */
export interface HebcalHaftara {
  /** Haftarah reference string (e.g., "Jeremiah 46:13-28") */
  haftara: string;
  /** Number of verses */
  verses?: number;
  /** Text content (if available) */
  text?: string;
}

/** Sefaria API response types */

/** Sefaria API response for text fetching */
export interface SefariaTextResponse {
  /** Array of Hebrew verses */
  he?: string[];
  /** Array of English verses */
  text?: string[];
  /** Hebrew reference */
  heRef?: string;
  /** English reference */
  ref?: string;
  /** Number of verses */
  length?: number;
  /** Book title */
  title?: string;
}

/** Result from Sefaria text fetch */
export interface SefariaTextResult {
  /** Hebrew verses */
  hebrewVerses: string[];
  /** English verses */
  englishVerses: string[];
  /** English reference */
  reference: string;
  /** Hebrew reference */
  hebrewReference: string;
}

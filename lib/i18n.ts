import { ReadingMode } from '@/types';
import { APP_NAME } from './constants';

export type Language = 'en' | 'he';

/**
 * Every piece of UI text, in English and Hebrew. Parsha names, Torah and
 * targum text come from the data and are not translated here.
 */
const en = {
  appName: APP_NAME,
  tagline: 'RSVP Torah Reader',
  languageToggle: 'עברית',
  languageToggleLabel: 'Switch to Hebrew',

  // Homepage
  schedule: 'Reading schedule',
  diaspora: 'Diaspora',
  israel: 'Israel',
  loadingParshiot: 'Loading parsha data...',
  loadError: 'Error loading parsha. Please try again later.',
  thisWeek: 'This Week',
  startReading: 'Start Reading',
  continueReading: 'Continue Reading',
  startOverFromBeginning: 'Start over from the beginning',
  upcoming: 'Upcoming Parshiot',
  noData: 'No parsha data available. Please check your internet connection.',
  aboutTitle: 'What is RSVP Reading?',
  aboutRsvp:
    'Rapid Serial Visual Presentation (RSVP) displays text one word at a time in a fixed position. ' +
    'This eliminates eye movement (saccades) and allows you to read at 300-600+ words per minute while maintaining comprehension.',
  aboutUse: 'Perfect for busy individuals who want to complete the weekly Torah reading efficiently.',
  footerTagline: 'Read the weekly parsha faster with RSVP technology',

  // Parsha card
  // Hebrew uses the Hebrew name, so both languages take (name, hebrewName)
  parshaTitle: ((name: string) => `Parashat ${name}`) as (name: string, hebrewName: string) => string,
  verseStats: (verses: number, aliyot: number) => `${verses} verses • ${aliyot} aliyot`,
  continuePercent: (percent: number) => `Continue · ${percent}%`,

  // Reader page
  loadingParsha: 'Loading parsha...',
  notFoundTitle: 'Parsha Not Found',
  notFoundBody: (name: string) =>
    `We couldn't find the parsha "${name}". It may not exist or there was an error loading it.`,
  backToHome: 'Back to Home',
  noTextTitle: 'No Text Available',
  noTextBody: 'The text for this parsha is not available yet. Please try again later.',
  readerTitle: (name: string, hebrewName: string) =>
    hebrewName ? `${hebrewName} - Parashat ${name}` : `Parashat ${name}`,

  // Reader
  noTextToDisplay: 'No text to display',
  goBack: 'Go Back',
  back: 'Back',
  startOver: 'Start over',
  startOverLabel: 'Start over from the beginning',
  startOverConfirm: 'Start over from the beginning?',
  shortcuts: 'Space: Play/Pause • ← →: Navigate • ↑ ↓: Speed • Esc: Back',
  torah: 'Torah',
  secondTime: '(2nd)',
  targum: 'Targum Onkelos',
  play: 'Play',
  pause: 'Pause',
  rewind: 'Rewind 10 words',
  forward: 'Forward 10 words',

  // Speed
  speed: 'Speed',
  wpm: 'WPM',
  warmUp: 'Warm-up',
  on: 'On',
  off: 'Off',
  warmingUp: (current: number, target: number) => `Warming up: ${current} → ${target}`,
  warmUpOnHint: 'Starts at half speed and builds up to your speed over the first 30 words',
  warmUpOffHint: 'Starts right away at your speed',
  disableWarmUp: 'Turn off warm-up',
  enableWarmUp: 'Turn on warm-up',
  slower: 'Decrease speed',
  faster: 'Increase speed',

  // Reading modes
  readingModeTitle: 'Twice & Targum',
  readingModeLabel: 'Reading mode',
  modes: {
    pasuk: { label: 'Pasuk', description: 'Each pasuk twice, then its targum' },
    section: { label: 'Section', description: 'Each section (until פ / ס) twice, then its targum' },
    parsha: { label: 'Parsha', description: 'The whole parsha twice, then the whole targum' },
    once: { label: 'Torah only', description: 'The Torah text once, no targum' },
  } satisfies Record<ReadingMode, { label: string; description: string }>,

  // Targum pace
  targumPaceTitle: 'Targum speed',
  targumPaceSame: 'Same',
  targumPaceDescription: (percent: number) =>
    percent === 100 ? 'Targum at your reading speed' : `Targum at ${percent}% of your reading speed`,

  // Credits
  credits: {
    torah: 'Torah text',
    torahTitle: 'Miqra according to the Masorah',
    targum: 'Targum Onkelos',
    targumTitle: 'Sifsei Chachomim Chumash, Metsudah Publications, 2009',
    schedule: 'Parsha schedule',
    scheduleTitle: 'Hebcal Jewish Calendar',
    via: 'via',
  },
};

export type Strings = typeof en;

const he: Strings = {
  appName: 'תיבה',
  tagline: 'קריאת התורה מילה אחר מילה',
  languageToggle: 'English',
  languageToggleLabel: 'Switch to English',

  schedule: 'לוח הקריאה',
  diaspora: 'חוץ לארץ',
  israel: 'ארץ ישראל',
  loadingParshiot: 'טוען את הפרשיות...',
  loadError: 'שגיאה בטעינת הפרשה. נסו שוב מאוחר יותר.',
  thisWeek: 'השבוע',
  startReading: 'התחלת קריאה',
  continueReading: 'המשך קריאה',
  startOverFromBeginning: 'להתחיל מההתחלה',
  upcoming: 'הפרשיות הבאות',
  noData: 'אין נתוני פרשה. בדקו את החיבור לאינטרנט.',
  aboutTitle: 'מהי קריאת RSVP?',
  aboutRsvp:
    'בשיטת RSVP (הצגה חזותית סדרתית מהירה) הטקסט מוצג מילה אחר מילה באותו מקום על המסך. ' +
    'כך העיניים לא צריכות לנוע לאורך השורה, ואפשר לקרוא מהר יותר בלי לאבד את ההבנה.',
  aboutUse: 'מתאים למי שרוצה להספיק את הפרשה השבועית, ולקיים שנים מקרא ואחד תרגום, גם בשבוע עמוס.',
  footerTagline: 'לקרוא את פרשת השבוע מהר יותר בשיטת RSVP',

  parshaTitle: (name: string, hebrewName: string) => `פרשת ${hebrewName || name}`,
  verseStats: (verses: number, aliyot: number) => `${verses} פסוקים • ${aliyot} עליות`,
  continuePercent: (percent: number) => `המשך · ${percent}%`,

  loadingParsha: 'טוען את הפרשה...',
  notFoundTitle: 'הפרשה לא נמצאה',
  notFoundBody: (name: string) => `לא מצאנו את הפרשה "${name}". ייתכן שהיא לא קיימת או שאירעה שגיאה בטעינה.`,
  backToHome: 'חזרה לדף הבית',
  noTextTitle: 'הטקסט אינו זמין',
  noTextBody: 'הטקסט של הפרשה עדיין אינו זמין. נסו שוב מאוחר יותר.',
  readerTitle: (name: string, hebrewName: string) => `פרשת ${hebrewName || name}`,

  noTextToDisplay: 'אין טקסט להצגה',
  goBack: 'חזרה',
  back: 'חזרה',
  startOver: 'מההתחלה',
  startOverLabel: 'להתחיל מההתחלה',
  startOverConfirm: 'להתחיל מההתחלה?',
  shortcuts: 'רווח: הפעלה/עצירה • ← →: דילוג • ↑ ↓: מהירות • Esc: חזרה',
  torah: 'מקרא',
  secondTime: '(פעם שנייה)',
  targum: 'תרגום אונקלוס',
  play: 'הפעלה',
  pause: 'עצירה',
  rewind: 'אחורה 10 מילים',
  forward: 'קדימה 10 מילים',

  speed: 'מהירות',
  wpm: 'מילים לדקה',
  warmUp: 'האצה הדרגתית',
  on: 'פעילה',
  off: 'כבויה',
  warmingUp: (current: number, target: number) => `מאיץ: ${current} ← ${target}`,
  warmUpOnHint: 'מתחיל בחצי מהירות ומאיץ עד המהירות שלך במשך 30 המילים הראשונות',
  warmUpOffHint: 'מתחיל מיד במהירות שלך',
  disableWarmUp: 'כיבוי האצה הדרגתית',
  enableWarmUp: 'הפעלת האצה הדרגתית',
  slower: 'האטה',
  faster: 'האצה',

  readingModeTitle: 'שנים מקרא ואחד תרגום',
  readingModeLabel: 'אופן הקריאה',
  modes: {
    pasuk: { label: 'פסוק', description: 'כל פסוק פעמיים ואחריו התרגום' },
    section: { label: 'פסקה', description: 'כל פסקה (עד פ / ס) פעמיים ואחריה התרגום' },
    parsha: { label: 'כל הפרשה', description: 'כל הפרשה פעמיים ואחריה כל התרגום' },
    once: { label: 'מקרא בלבד', description: 'המקרא פעם אחת, בלי תרגום' },
  },

  targumPaceTitle: 'מהירות התרגום',
  targumPaceSame: 'כמו המקרא',
  targumPaceDescription: (percent: number) =>
    percent === 100 ? 'התרגום במהירות הקריאה' : `התרגום ב־${percent}% ממהירות הקריאה`,

  credits: {
    torah: 'נוסח המקרא',
    torahTitle: 'מקרא על פי המסורה',
    targum: 'תרגום אונקלוס',
    targumTitle: 'חומש שפתי חכמים, הוצאת מצודה, 2009',
    schedule: 'לוח הפרשות',
    scheduleTitle: 'לוח השנה של Hebcal',
    via: 'דרך',
  },
};

export const STRINGS: Record<Language, Strings> = { en, he };

/** Default language when none is saved: Hebrew for Hebrew-language browsers */
export function detectLanguage(): Language {
  try {
    return navigator.language.toLowerCase().startsWith('he') ? 'he' : 'en';
  } catch {
    return 'en';
  }
}

const BOOKS_HE: Record<string, string> = {
  Genesis: 'בראשית',
  Exodus: 'שמות',
  Leviticus: 'ויקרא',
  Numbers: 'במדבר',
  Deuteronomy: 'דברים',
};

export function bookName(book: string, lang: Language): string {
  return lang === 'he' ? BOOKS_HE[book] ?? book : book;
}

/**
 * Hebrew numeral for chapter and verse numbers (1-499), e.g. 15 -> טו, 122 -> קכב.
 * 15 and 16 are written טו / טז rather than spelling a divine name.
 */
export function hebrewNumeral(n: number): string {
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const rest = n % 100;
  const tail = rest === 15 ? 'טו' : rest === 16 ? 'טז' : tens[Math.floor(rest / 10)] + ones[rest % 10];
  return hundreds[Math.floor(n / 100)] + tail;
}

export function chapterVerse(chapter: number, verse: number, lang: Language): string {
  return lang === 'he' ? `${hebrewNumeral(chapter)}:${hebrewNumeral(verse)}` : `${chapter}:${verse}`;
}

/** "Genesis 1:5" in the given language, e.g. "בראשית א:ה" */
export function formatRef(ref: string, lang: Language): string {
  const match = ref.match(/^(.+) (\d+):(\d+)$/);
  if (!match) return ref;
  return `${bookName(match[1], lang)} ${chapterVerse(Number(match[2]), Number(match[3]), lang)}`;
}

/** Short Shabbat date for parsha cards, e.g. "Sat, Oct 10" / "שבת, 10 באוק׳" */
export function formatShortDate(date: Date, lang: Language): string {
  return date.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

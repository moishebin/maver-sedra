import { Parsha, Aliyah } from '@/types';
import { createHebcalClient, findParsha } from './hebcal';
import { createSefariaClient } from './sefaria';

const hebcalClient = createHebcalClient();
const sefariaClient = createSefariaClient();

// Set to true to skip Sefaria API calls (use Hebcal text only)
const SKIP_SEFARIA = false;

/**
 * Fetches a parsha with full Hebrew text from Sefaria
 * Combines Hebcal metadata with Sefaria Hebrew text
 * 
 * @param parshaName - Name of the parsha to fetch
 * @returns Parsha with Hebrew text populated in aliyot
 */
export async function fetchParshaWithText(parshaName: string): Promise<Parsha | null> {
  // First, get parsha metadata from Hebcal
  const parsha = await hebcalClient.getParshaByName(parshaName);
  
  if (!parsha) {
    console.error(`Parsha not found: ${parshaName}`);
    return null;
  }
  
  // If skipping Sefaria, return parsha as-is
  if (SKIP_SEFARIA) {
    return parsha;
  }
  
  try {
    // Fetch Hebrew text for each aliyah from Sefaria
    const aliyotWithText = await Promise.all(
      parsha.aliyot.map(async (aliyah) => {
        const textResult = await sefariaClient.getAliyahText(aliyah);
        
        if (textResult && textResult.hebrewVerses.length > 0) {
          // Combine verses into a single text string
          const hebrewText = textResult.hebrewVerses.join(' ');
          return {
            ...aliyah,
            text: hebrewText,
          };
        }
        
        // If Sefaria fetch fails, return aliyah without text
        return aliyah;
      })
    );
    
    // Fetch haftara text if available
    let haftaraWithText = parsha.haftara;
    if (parsha.haftara) {
      const haftaraRef = `${parsha.haftara.book}.${parsha.haftara.startChapter}.${parsha.haftara.startVerse}-${parsha.haftara.endChapter}.${parsha.haftara.endVerse}`;
      const haftaraResult = await sefariaClient.getText(haftaraRef);
      
      if (haftaraResult && haftaraResult.hebrewVerses.length > 0) {
        haftaraWithText = {
          ...parsha.haftara,
          text: haftaraResult.hebrewVerses.join(' '),
        };
      }
    }
    
    return {
      ...parsha,
      aliyot: aliyotWithText,
      haftara: haftaraWithText,
    };
  } catch (error) {
    console.error('Error fetching Sefaria text:', error);
    // Return parsha without Sefaria text as fallback
    return parsha;
  }
}

/**
 * Fetches the current week's parsha with full Hebrew text
 * 
 * @returns Current parsha with Hebrew text populated
 */
export async function fetchCurrentParshaWithText(): Promise<Parsha | null> {
  const currentParsha = await hebcalClient.getCurrentParsha();
  
  if (!currentParsha) {
    return null;
  }
  
  return fetchParshaWithText(currentParsha.name);
}

/**
 * Fetches parsha for a specific date with full Hebrew text
 * 
 * @param date - Date in YYYY-MM-DD format
 * @returns Parsha for that date with Hebrew text
 */
export async function fetchParshaForDateWithText(date: string): Promise<Parsha | null> {
  const parsha = await hebcalClient.getParshaForDate(date);
  
  if (!parsha) {
    return null;
  }
  
  return fetchParshaWithText(parsha.name);
}

/**
 * Fetches full parsha text (all aliyot combined) for reading the entire parsha
 * 
 * @param parshaName - Name of the parsha
 * @returns Full Hebrew text of the entire parsha
 */
export async function fetchFullParshaText(parshaName: string): Promise<string | null> {
  const parsha = findParsha(parshaName);
  
  if (!parsha) {
    console.error(`No parsha found for: ${parshaName}`);
    return null;
  }
  
  const first = parsha.aliyot[0];
  const last = parsha.aliyot[parsha.aliyot.length - 1];
  const result = await sefariaClient.getVersesText(
    first.book,
    first.startChapter,
    first.startVerse,
    last.endChapter,
    last.endVerse
  );
  
  if (!result || result.hebrewVerses.length === 0) {
    return null;
  }
  
  return result.hebrewVerses.join(' ');
}

/**
 * Fetches text for a specific aliyah
 * 
 * @param aliyah - Aliyah object with book, chapter, and verse info
 * @returns Hebrew text for that aliyah
 */
export async function fetchAliyahText(aliyah: Aliyah): Promise<string | null> {
  const result = await sefariaClient.getAliyahText(aliyah);
  
  if (!result || result.hebrewVerses.length === 0) {
    return null;
  }
  
  return result.hebrewVerses.join(' ');
}

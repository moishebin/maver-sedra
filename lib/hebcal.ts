import { Parsha, ParshaInfo, Haftara, HebcalEvent } from '@/types';
import { PARSHIOT } from './parshiot';
import { readCache, writeCache } from './cache';

const HEBCAL_BASE_URL = 'https://www.hebcal.com';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/** The parts of a Hebcal parashat event we keep (and cache) */
interface ShabbatReading {
  title: string;
  date: string;
  haftarah?: string;
}

/**
 * Options for the Hebcal client
 */
export interface HebcalClientOptions {
  /** Use the Israel reading schedule instead of the diaspora one */
  israel?: boolean;
}

/**
 * Interface for the Hebcal API client
 */
export interface HebcalClient {
  /** Get the parsha for the upcoming (or current) Shabbat */
  getCurrentParsha(): Promise<Parsha | null>;
  /** Get parsha for a specific date */
  getParshaForDate(date: string): Promise<Parsha | null>;
  /** Get all parshiot for a year */
  getYearParshiot(year: number): Promise<Parsha[]>;
  /** Get parsha by name or URL slug */
  getParshaByName(name: string): Promise<Parsha | null>;
  /** Get parshiot for a date range (±3 months) */
  getParshiotForDateRange(centerDate: Date): Promise<Parsha[]>;
}

/**
 * Creates a Hebcal API client with caching
 */
export function createHebcalClient(options: HebcalClientOptions = {}): HebcalClient {
  const israel = options.israel ?? false;

  async function fetchParshiot(start: Date, end: Date): Promise<Parsha[]> {
    const url = `${HEBCAL_BASE_URL}/hebcal?cfg=json&start=${toLocalISODate(start)}&end=${toLocalISODate(end)}&s=on&leyning=on&i=${israel ? 'on' : 'off'}`;

    let readings = readCache<ShabbatReading[]>(url);
    if (!readings) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Hebcal API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json() as { items?: HebcalEvent[] };
      readings = (data.items ?? [])
        .filter((item) => item.category === 'parashat')
        .map((item) => ({ title: item.title, date: item.date, haftarah: item.leyning?.haftarah }));
      writeCache(url, readings, CACHE_DURATION);
    }

    return readings
      .map(transformReading)
      .filter((parsha): parsha is Parsha => parsha !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Gets the parsha for the next Shabbat on or after today. Looks two weeks
   * ahead because a Shabbat that falls on a festival has no parsha.
   */
  async function getCurrentParsha(): Promise<Parsha | null> {
    try {
      const today = new Date();
      const end = new Date(today);
      end.setDate(today.getDate() + 14);
      const parshiot = await fetchParshiot(today, end);
      return parshiot[0] ?? null;
    } catch (error) {
      console.error('Error getting current parsha:', error);
      return null;
    }
  }

  async function getParshaForDate(date: string): Promise<Parsha | null> {
    try {
      const day = parseLocalDate(date);
      const parshiot = await fetchParshiot(day, day);
      return parshiot[0] ?? null;
    } catch (error) {
      console.error('Error getting parsha for date:', error);
      return null;
    }
  }

  async function getParshiotForDateRange(centerDate: Date): Promise<Parsha[]> {
    try {
      const start = new Date(centerDate);
      start.setMonth(start.getMonth() - 3);
      const end = new Date(centerDate);
      end.setMonth(end.getMonth() + 3);
      return await fetchParshiot(start, end);
    } catch (error) {
      console.error('Error getting parshiot for date range:', error);
      return [];
    }
  }

  async function getYearParshiot(year: number): Promise<Parsha[]> {
    try {
      return await fetchParshiot(new Date(year, 0, 1), new Date(year, 11, 31));
    } catch (error) {
      console.error('Error getting parshiot for year:', error);
      return [];
    }
  }

  return {
    getCurrentParsha,
    getParshaForDate,
    getYearParshiot,
    getParshaByName,
    getParshiotForDateRange,
  };
}

/**
 * URL slug for a parsha name, e.g. "Achrei Mot-Kedoshim" -> "achrei-mot-kedoshim"
 */
export function parshaSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Alternate transliterations, keyed by their normalized form */
const NAME_ALIASES: Record<string, string> = {
  shemini: 'Shmini',
  shelach: 'Sh’lach',
  vayelech: 'Vayeilech',
  naso: 'Nasso',
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a parsha in the static table by name, slug or common alternate spelling
 */
export function findParsha(name: string): ParshaInfo | null {
  const normalized = normalizeName(name);
  const target = normalizeName(NAME_ALIASES[normalized] ?? name);
  return PARSHIOT.find((p) => normalizeName(p.name) === target) ?? null;
}

/**
 * Gets parsha by name. Works for any parsha regardless of the current date,
 * since it reads from the static table rather than Hebcal.
 */
async function getParshaByName(name: string): Promise<Parsha | null> {
  const info = findParsha(name);
  if (!info) {
    console.error(`No parsha found for: ${name}`);
    return null;
  }
  return { ...info, date: '' };
}

/**
 * Turns a Hebcal Shabbat reading into our Parsha type, taking the aliyot
 * from the static table and the date and haftarah from Hebcal
 */
function transformReading(reading: ShabbatReading): Parsha | null {
  const info = findParsha(reading.title.replace(/^Parashat /, ''));
  if (!info) {
    console.warn(`Unknown parsha from Hebcal: ${reading.title}`);
    return null;
  }

  return {
    ...info,
    date: reading.date,
    haftara: parseHaftaraRange(reading.haftarah),
  };
}

/**
 * Parse a haftarah string like "Jeremiah 46:13-28" or
 * "II Kings 12:1-17 | Shabbat Shekalim". Multi-part haftarot
 * ("Isaiah 1:1-5, 2:3") are not supported and return undefined.
 */
function parseHaftaraRange(haftaraStr: string | undefined): Haftara | undefined {
  if (!haftaraStr) return undefined;

  const range = haftaraStr.split('|')[0].trim();
  const match = range.match(/^(.+?)\s+(\d+):(\d+)-(?:(\d+):)?(\d+)$/);
  if (!match) return undefined;

  const startChapter = parseInt(match[2], 10);
  return {
    book: match[1],
    startChapter,
    startVerse: parseInt(match[3], 10),
    endChapter: match[4] ? parseInt(match[4], 10) : startChapter,
    endVerse: parseInt(match[5], 10),
  };
}

/** Formats a date as YYYY-MM-DD in the user's local timezone */
function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD as a local date (new Date() would read it as UTC) */
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

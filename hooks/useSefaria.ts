'use client';

import { useState, useEffect, useCallback } from 'react';
import { Aliyah, Parsha } from '@/types';
import { ParshaVerse } from '@/lib/reading';
import { createSefariaClient, SefariaTextResult } from '@/lib/sefaria';

const sefariaClient = createSefariaClient();

/**
 * Options for the useSefariaText hook
 */
interface UseSefariaTextOptions {
  /** Aliyah to fetch text for */
  aliyah?: Aliyah;
  /** Parsha to fetch full text for */
  parsha?: Parsha;
  /** Whether to fetch full parsha or just aliyot */
  fetchFullParsha?: boolean;
}

/**
 * Return value from useSefariaText hook
 */
interface UseSefariaTextReturn {
  /** The fetched Hebrew text verses */
  hebrewText: string[];
  /** The fetched English text verses */
  englishText: string[];
  /** Combined Hebrew text as a single string */
  fullHebrewText: string;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
  /** Function to manually refetch data */
  refetch: () => void;
}

/**
 * Hook for fetching Hebrew text from Sefaria API
 * 
 * @example
 * // Fetch text for a specific aliyah
 * const { hebrewText, isLoading } = useSefariaText({ aliyah });
 * 
 * @example  
 * // Fetch full parsha text
 * const { hebrewText, isLoading } = useSefariaText({ parsha, fetchFullParsha: true });
 */
export function useSefariaText(options?: UseSefariaTextOptions): UseSefariaTextReturn {
  const { aliyah, parsha, fetchFullParsha = false } = options || {};

  const [hebrewText, setHebrewText] = useState<string[]>([]);
  const [englishText, setEnglishText] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchText = useCallback(async () => {
    // Reset state
    setHebrewText([]);
    setEnglishText([]);
    setError(null);

    // Validate options
    if (!aliyah && !parsha) {
      return;
    }

    setIsLoading(true);

    try {
      let result: SefariaTextResult | null = null;

      if (aliyah && !fetchFullParsha) {
        // Fetch text for a single aliyah
        result = await sefariaClient.getAliyahText(aliyah);
      } else if (parsha && fetchFullParsha) {
        // Fetch full parsha text
        const first = parsha.aliyot[0];
        const last = parsha.aliyot[parsha.aliyot.length - 1];
        if (first && last) {
          result = await sefariaClient.getVersesText(first.book, first.startChapter, first.startVerse, last.endChapter, last.endVerse);
        }
      }

      if (result) {
        setHebrewText(result.hebrewVerses);
        setEnglishText(result.englishVerses);
      } else {
        throw new Error('Failed to fetch text from Sefaria');
      }
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error fetching text');
      setError(fetchError);
      console.error('useSefariaText error:', fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [aliyah, parsha, fetchFullParsha]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchText();
  }, [fetchText]);

  const refetch = useCallback(() => {
    fetchText();
  }, [fetchText]);

  // Combine Hebrew text into a single string
  const fullHebrewText = hebrewText.join(' ');

  return {
    hebrewText,
    englishText,
    fullHebrewText,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching every pasuk of a parsha with its Targum Onkelos
 *
 * @example
 * const { verses, isLoading } = useParshaVerses(parsha);
 */
export function useParshaVerses(parsha: Parsha | null) {
  const [verses, setVerses] = useState<ParshaVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVerses = useCallback(async () => {
    if (!parsha) {
      setVerses([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const perAliyah = await Promise.all(
        parsha.aliyot.map(async (aliyah) => {
          const [torah, targum] = await Promise.all([
            sefariaClient.getAliyahText(aliyah),
            sefariaClient.getTargumText(aliyah),
          ]);
          if (!torah || !targum) {
            throw new Error(`Could not load aliyah ${aliyah.number} of ${parsha.name}`);
          }
          return torah.hebrewVerses.map((text, i): ParshaVerse => {
            const { chapter, verse } = torah.verseRefs[i];
            return {
              ref: `${aliyah.book} ${chapter}:${verse}`,
              text,
              targum: targum.hebrewVerses[i] ?? '',
              endsSection: torah.sectionEnds[i],
            };
          });
        })
      );

      setVerses(perAliyah.flat());
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error fetching parsha text');
      setError(fetchError);
      console.error('useParshaVerses error:', fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [parsha]);

  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  return {
    verses,
    isLoading,
    error,
    refetch: fetchVerses,
  };
}

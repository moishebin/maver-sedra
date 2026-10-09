'use client';

import { useState, useEffect, useCallback } from 'react';
import { Parsha } from '@/types';
import { createHebcalClient } from '@/lib/hebcal';

/**
 * Options for the useParsha hook
 */
interface UseParshaOptions {
  /** Parsha name to fetch (optional) */
  parshaName?: string;
  /** Date to fetch parsha for (optional) */
  date?: string;
  /** Use the Israel reading schedule for date-based lookups */
  israel?: boolean;
  /** Set to false to hold off fetching (e.g. until preferences load) */
  enabled?: boolean;
}

/**
 * Return value from useParsha hook
 */
interface UseParshaReturn {
  /** The fetched parsha data or null */
  parsha: Parsha | null;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
  /** Function to manually refetch data */
  refetch: () => void;
}

/**
 * Hook for fetching parsha data from Hebcal API
 * Handles loading states, caching, and error handling
 */
export function useParsha(options?: UseParshaOptions): UseParshaReturn {
  const { parshaName, date, israel = false, enabled = true } = options || {};

  const [parsha, setParsha] = useState<Parsha | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParsha = useCallback(async () => {
    if (!enabled) return;

    const hebcalClient = createHebcalClient({ israel });
    setIsLoading(true);
    setError(null);

    try {
      let result: Parsha | null = null;

      if (parshaName) {
        result = await hebcalClient.getParshaByName(parshaName);
      } else if (date) {
        result = await hebcalClient.getParshaForDate(date);
      } else {
        result = await hebcalClient.getCurrentParsha();
      }
      
      if (!result) {
        throw new Error('No parsha found');
      }

      setParsha(result);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error fetching parsha');
      setError(fetchError);
      console.error('useParsha error:', fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [parshaName, date, israel, enabled]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchParsha();
  }, [fetchParsha]);

  const refetch = useCallback(() => {
    fetchParsha();
  }, [fetchParsha]);

  return {
    parsha,
    isLoading,
    error,
    refetch,
  };
}

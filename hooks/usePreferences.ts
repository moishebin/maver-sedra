'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingMode, UserPreferences } from '@/types';

const STORAGE_KEY = 'maver-sedra:preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  speed: 250,
  theme: 'dark',
  fontSize: 'medium',
  readingMode: 'pasuk',
};

/**
 * Return value from usePreferences hook
 */
interface UsePreferencesReturn {
  /** Current user preferences */
  preferences: UserPreferences;
  /** Whether stored preferences have been read (always false during SSR) */
  isLoaded: boolean;
  /** Whether to use the Israel reading schedule */
  israel: boolean;
  /** Update reading speed (WPM) */
  updateSpeed: (speed: number) => void;
  /** Update color theme */
  updateTheme: (theme: 'light' | 'dark') => void;
  /** Update font size */
  updateFontSize: (size: 'small' | 'medium' | 'large') => void;
  /** Switch between the Israel and diaspora reading schedules */
  updateIsrael: (israel: boolean) => void;
  /** Update how the parsha is read (pasuk / section / parsha / once) */
  updateReadingMode: (mode: ReadingMode) => void;
  /** Reset to default preferences */
  reset: () => void;
}

function readStored(): Partial<UserPreferences> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Saves only the changed fields, merged into what is stored, so several
 * components using this hook don't overwrite each other's changes
 */
function persist(patch: Partial<UserPreferences> | null) {
  try {
    if (patch === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStored(), ...patch }));
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

/**
 * Hook for managing user preferences with localStorage persistence
 * Safe for SSR (no window access during server-side rendering)
 */
export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setPreferences({
      ...DEFAULT_PREFERENCES,
      ...readStored(),
    });
    setIsLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...patch }));
    persist(patch);
  }, []);

  const updateSpeed = useCallback((speed: number) => {
    update({ speed: Math.max(100, Math.min(600, speed)) });
  }, [update]);

  const updateTheme = useCallback((theme: 'light' | 'dark') => {
    update({ theme });
  }, [update]);

  const updateFontSize = useCallback((fontSize: 'small' | 'medium' | 'large') => {
    update({ fontSize });
  }, [update]);

  const updateIsrael = useCallback((israel: boolean) => {
    update({ israel });
  }, [update]);

  const updateReadingMode = useCallback((readingMode: ReadingMode) => {
    update({ readingMode });
  }, [update]);

  const reset = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    persist(null);
  }, []);

  return {
    preferences,
    isLoaded,
    israel: preferences.israel ?? (isLoaded && isIsraelTimezone()),
    updateSpeed,
    updateTheme,
    updateFontSize,
    updateIsrael,
    updateReadingMode,
    reset,
  };
}

function isIsraelTimezone(): boolean {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Jerusalem';
  } catch {
    return false;
  }
}

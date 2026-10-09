// Application constants

export const APP_NAME = 'MAVER Sedra';
export const APP_DESCRIPTION = 'RSVP Torah Reader for the Weekly Parsha';

export const DEFAULT_SPEED = 250; // WPM
export const MIN_SPEED = 100;
export const MAX_SPEED = 600;

export const STORAGE_KEYS = {
  preferences: 'maver-sedra-prefs',
  progress: (parshaName: string) => `maver-sedra-progress-${parshaName}`,
  cache: (key: string) => `maver-sedra-cache-${key}`,
};

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
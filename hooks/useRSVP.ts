'use client';

import { useState, useEffect, useCallback } from 'react';
import { WordToken } from '@/types';

/**
 * Options for the useRSVP hook
 */
interface UseRSVPOptions {
  /** Array of word tokens to display */
  words: WordToken[];
  /** Initial reading speed in WPM (default: 250) */
  initialSpeed?: number;
  /** Starting word index (default: 0) */
  initialIndex?: number;
  /** Callback when reading completes */
  onComplete?: () => void;
  /** Callback on each word change with new index */
  onProgress?: (index: number) => void;
  /** Enable speed ramp up when starting (default: true) */
  enableRampUp?: boolean;
  /** Starting ramp speed as percentage of target (default: 0.5 = 50%) */
  rampStartPercent?: number;
  /** Number of words to ramp up over (default: 30) */
  rampWords?: number;
  /** Targum speed as a fraction of the reading speed (default: 1) */
  targumPace?: number;
}

/**
 * Return value from useRSVP hook
 */
interface UseRSVPReturn {
  /** Current word index */
  currentIndex: number;
  /** Whether RSVP is currently playing */
  isPlaying: boolean;
  /** Current speed in WPM (may be ramping) */
  speed: number;
  /** Target speed in WPM (user's desired speed) */
  targetSpeed: number;
  /** Reading progress percentage (0-100) */
  progress: number;
  /** Current word token or null */
  currentWord: WordToken | null;
  /** Start playing */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause */
  toggle: () => void;
  /** Rewind by N words */
  rewind: (words: number) => void;
  /** Fast forward by N words */
  forward: (words: number) => void;
  /** Set reading speed (WPM) */
  setSpeed: (wpm: number) => void;
  /** Jump to specific word index */
  jumpTo: (index: number) => void;
  /** Skip the warm-up ramp and jump to target speed */
  skipRamp: () => void;
  /** Whether ramp mode is currently enabled */
  rampEnabled: boolean;
  /** Toggle ramp mode on/off */
  toggleRamp: () => void;
}

/**
 * Hook for RSVP (Rapid Serial Visual Presentation) reading logic
 * Controls word-by-word display timing with smart delays
 */
export function useRSVP(options: UseRSVPOptions): UseRSVPReturn {
  const {
    words,
    initialSpeed = 250,
    initialIndex = 0,
    onComplete,
    onProgress,
    enableRampUp = true,
    rampStartPercent = 0.5,
    rampWords = 30,
    targumPace = 1,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [targetSpeed, setTargetSpeed] = useState(initialSpeed);
  const [rampedSpeed, setRampedSpeed] = useState(initialSpeed);
  const [rampWordsRead, setRampWordsRead] = useState(0);
  const [rampEnabled, setRampEnabled] = useState(enableRampUp);

  // Calculate the current ramped speed based on progress
  const calculateRampedSpeed = useCallback((wordsRead: number): number => {
    if (!rampEnabled || wordsRead >= rampWords) {
      return targetSpeed;
    }
    const startSpeed = targetSpeed * rampStartPercent;
    const progress = wordsRead / rampWords;
    // Ease-in-out curve: progress^2 for smooth acceleration
    const easeProgress = progress * progress;
    return startSpeed + (targetSpeed - startSpeed) * easeProgress;
  }, [rampEnabled, rampStartPercent, rampWords, targetSpeed]);

  // Calculate delay for a specific word based on its properties
  const getDelay = useCallback((word: WordToken, currentSpeed: number): number => {
    // Base delay in milliseconds: 60000ms / WPM
    const baseDelay = 60000 / currentSpeed;
    let multiplier = 1.0;

    // Apply multipliers based on word properties
    if (word.isShort) multiplier *= 0.7;      // Short words: faster
    if (word.isLong) multiplier *= 1.3;       // Long words: slower
    if (word.hasComma) multiplier *= 1.2;     // Comma: slight pause
    if (word.hasPeriod) multiplier *= 1.5;    // Period: longer pause
    if (word.hasSofPasuk) multiplier *= 1.8;  // Sof pasuk: longest pause
    if (word.hasNikkud) multiplier *= 1.1;    // Nikkud: slightly slower
    if (word.source?.kind === 'targum') multiplier /= targumPace; // Aramaic: user's slower pace

    return baseDelay * multiplier;
  }, [targumPace]);

  // Update ramped speed whenever target speed or ramp progress changes
  useEffect(() => {
    const newRampedSpeed = calculateRampedSpeed(rampWordsRead);
    setRampedSpeed(newRampedSpeed);
  }, [targetSpeed, rampWordsRead, calculateRampedSpeed]);

  // Main timer effect - advances to next word
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length || words.length === 0) {
      return;
    }

    const word = words[currentIndex];
    const delay = getDelay(word, rampedSpeed);

    const timer = setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => {
          const next = prev + 1;
          onProgress?.(next);
          return next;
        });
        // Increment ramp words read
        setRampWordsRead(prev => prev + 1);
      } else {
        // Reached end
        setIsPlaying(false);
        onComplete?.();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, rampedSpeed, words, getDelay, onComplete, onProgress]);

  // Control functions
  const play = useCallback(() => {
    if (words.length > 0 && currentIndex < words.length) {
      // Reset ramp when starting from paused state (only if ramp is enabled)
      if (rampEnabled) {
        setRampWordsRead(0);
      }
      setIsPlaying(true);
    }
  }, [words.length, currentIndex, rampEnabled]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Helper function to find the start of the current/previous verse
  const findVerseStart = useCallback((currentIdx: number): number => {
    // Search backwards from current position to find a sof pasuk
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (words[i]?.hasSofPasuk) {
        // Return the word after the sof pasuk (start of next verse)
        return Math.min(i + 1, words.length - 1);
      }
    }
    // If no sof pasuk found, return start of text
    return 0;
  }, [words]);

  // Helper function to find the start of the next verse
  const findNextVerseStart = useCallback((currentIdx: number): number => {
    // Search forwards from current position to find a sof pasuk
    for (let i = currentIdx; i < words.length; i++) {
      if (words[i]?.hasSofPasuk) {
        // Return the word after the sof pasuk (start of next verse)
        return Math.min(i + 1, words.length - 1);
      }
    }
    // If no sof pasuk found, stay at current position
    return currentIdx;
  }, [words]);

  const rewind = useCallback((n: number) => {
    setCurrentIndex(prev => {
      const targetIndex = Math.max(0, prev - n);
      // Find the start of the verse that contains or precedes the target
      const verseStart = findVerseStart(targetIndex);
      onProgress?.(verseStart);
      return verseStart;
    });
  }, [onProgress, findVerseStart]);

  const forward = useCallback((n: number) => {
    setCurrentIndex(prev => {
      const targetIndex = Math.min(words.length - 1, prev + n);
      // Find the start of the next verse after the target
      const nextVerseStart = findNextVerseStart(targetIndex);
      onProgress?.(nextVerseStart);
      return nextVerseStart;
    });
  }, [words.length, onProgress, findNextVerseStart]);

  const setSpeed = useCallback((wpm: number) => {
    // Clamp speed to reasonable range (100-600 WPM)
    const clampedWpm = Math.max(100, Math.min(600, wpm));
    setTargetSpeed(clampedWpm);
    // If not ramping, also set ramped speed immediately
    if (!rampEnabled) {
      setRampedSpeed(clampedWpm);
    }
  }, [rampEnabled]);

  const jumpTo = useCallback((index: number) => {
    setCurrentIndex(() => {
      const newIndex = Math.max(0, Math.min(words.length - 1, index));
      onProgress?.(newIndex);
      return newIndex;
    });
  }, [words.length, onProgress]);

  const skipRamp = useCallback(() => {
    // Jump directly to target speed
    setRampedSpeed(targetSpeed);
    setRampWordsRead(rampWords);
  }, [targetSpeed, rampWords]);

  const toggleRamp = useCallback(() => {
    setRampEnabled(prev => {
      const newEnabled = !prev;
      if (!newEnabled) {
        // Disabling ramp: immediately set rampedSpeed to targetSpeed and set rampWordsRead to rampWords
        setRampedSpeed(targetSpeed);
        setRampWordsRead(rampWords);
      } else {
        // Enabling ramp: if currently playing, reset rampWordsRead to 0 to start ramping from current position
        if (isPlaying) {
          setRampWordsRead(0);
        }
      }
      return newEnabled;
    });
  }, [targetSpeed, rampWords, isPlaying]);

  // Calculate progress percentage
  const progress = words.length > 0
    ? (currentIndex / (words.length - 1)) * 100
    : 0;

  // Get current word
  const currentWord = words[currentIndex] || null;

  return {
    currentIndex,
    isPlaying,
    speed: rampedSpeed,
    targetSpeed,
    progress,
    currentWord,
    play,
    pause,
    toggle,
    rewind,
    forward,
    setSpeed,
    jumpTo,
    skipRamp,
    rampEnabled,
    toggleRamp,
  };
}

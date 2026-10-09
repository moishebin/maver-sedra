'use client';

import { useEffect, useCallback, ReactNode } from 'react';
import { WordToken } from '@/types';
import { useRSVP } from '@/hooks/useRSVP';
import { usePreferences } from '@/hooks/usePreferences';
import { WordDisplay } from './WordDisplay';
import { ProgressBar } from './ProgressBar';
import { PlayControls } from '../controls/PlayControls';
import { SpeedControl } from '../controls/SpeedControl';
import { ArrowLeft, RotateCcw } from 'lucide-react';

/**
 * Props for the RSVPReader component
 */
interface RSVPReaderProps {
  /** Array of word tokens to display */
  words: WordToken[];
  /** Title to display (parsha name) */
  title: string;
  /** Initial reading speed in WPM (default: 250) */
  initialSpeed?: number;
  /** Starting word index (default: 0) */
  initialIndex?: number;
  /** Callback when reading completes */
  onComplete?: () => void;
  /** Callback to go back (e.g., to homepage) */
  onBack?: () => void;
  /** Callback on each word change with the new index */
  onProgress?: (index: number) => void;
  /** Extra settings shown under the speed control */
  children?: ReactNode;
}

/** "Genesis 1:5 · Torah (2nd)" style label for where a word comes from */
function sourceLabel(word: WordToken): string | null {
  const source = word.source;
  if (!source) return null;
  if (source.kind === 'targum') return `${source.ref} · Targum Onkelos`;
  return `${source.ref} · Torah${source.pass === 2 ? ' (2nd)' : ''}`;
}

/**
 * Main RSVP Reader component
 * Displays words one at a time with controls and progress bar
 */
export function RSVPReader({
  words,
  title,
  initialSpeed,
  initialIndex = 0,
  onComplete,
  onBack,
  onProgress,
  children,
}: RSVPReaderProps) {
  const { preferences, isLoaded: prefsLoaded, updateSpeed } = usePreferences();
  
  // Use preferences speed or initial speed or default
  const defaultSpeed = initialSpeed || preferences.speed || 250;

  const {
    currentIndex,
    isPlaying,
    speed,
    targetSpeed,
    currentWord,
    toggle,
    rewind,
    forward,
    pause,
    jumpTo,
    setSpeed,
    rampEnabled,
    toggleRamp,
  } = useRSVP({
    words,
    initialSpeed: defaultSpeed,
    initialIndex,
    onComplete,
    onProgress,
  });

  // Saved preferences load after the first render, so apply the saved speed
  // once they arrive (unless the caller asked for a specific speed)
  useEffect(() => {
    if (prefsLoaded && !initialSpeed) {
      setSpeed(preferences.speed);
    }
    // Only on load: later speed changes come from the reader itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsLoaded]);

  // Sync speed with preferences
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    updateSpeed(newSpeed);
  }, [setSpeed, updateSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          rewind(10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          forward(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleSpeedChange(speed + 25);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSpeedChange(speed - 25);
          break;
        case 'Escape':
          e.preventDefault();
          onBack?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, rewind, forward, handleSpeedChange, speed, onBack]);

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">No text to display</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate" dir="rtl">
          {title}
        </h1>
        <div className="w-16 flex justify-end">
          {currentIndex > 0 && (
            <button
              onClick={() => {
                pause();
                if (window.confirm('Start over from the beginning?')) jumpTo(0);
              }}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              title="Start over"
              aria-label="Start over from the beginning"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Word Display */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl">
          {currentWord.source && (
            <p
              className={`text-sm tracking-wide ${
                currentWord.source.kind === 'targum' ? 'text-amber-400' : 'text-gray-400'
              }`}
            >
              {sourceLabel(currentWord)}
            </p>
          )}
          <WordDisplay
            word={currentWord}
            isPlaying={isPlaying}
            size="lg"
          />
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-8 mt-8">
          {/* Progress Bar */}
          <ProgressBar
            current={currentIndex}
            total={words.length}
          />

          {/* Play Controls */}
          <PlayControls
            isPlaying={isPlaying}
            onPlayPause={toggle}
            onRewind={() => rewind(10)}
            onForward={() => forward(10)}
            canRewind={currentIndex > 0}
            canForward={currentIndex < words.length - 1}
          />

          {/* Speed Control */}
          <SpeedControl
            speed={speed}
            targetSpeed={targetSpeed}
            onSpeedChange={handleSpeedChange}
            rampEnabled={rampEnabled}
            onToggleRamp={toggleRamp}
          />

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        <p className="hidden sm:block">
          Space: Play/Pause • ← →: Navigate • ↑ ↓: Speed • Esc: Back
        </p>
      </footer>
    </div>
  );
}

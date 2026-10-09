'use client';

import { Play, Pause, Rewind, FastForward } from 'lucide-react';

/**
 * Props for the PlayControls component
 */
interface PlayControlsProps {
  /** Whether RSVP is currently playing */
  isPlaying: boolean;
  /** Callback when play/pause is toggled */
  onPlayPause: () => void;
  /** Callback when rewind is clicked */
  onRewind: () => void;
  /** Callback when forward is clicked */
  onForward: () => void;
  /** Whether rewind is enabled */
  canRewind: boolean;
  /** Whether forward is enabled */
  canForward: boolean;
}

/**
 * Playback control buttons for RSVP reader
 * Includes play/pause, rewind, and fast forward
 */
export function PlayControls({
  isPlaying,
  onPlayPause,
  onRewind,
  onForward,
  canRewind,
  canForward,
}: PlayControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Rewind Button */}
      <button
        onClick={onRewind}
        disabled={!canRewind}
        className={`p-4 rounded-full transition-all duration-200 ${
          canRewind
            ? 'bg-gray-700 hover:bg-gray-600 text-white active:scale-95'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Rewind 10 words"
      >
        <Rewind className="w-6 h-6" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className="p-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8" />
        ) : (
          <Play className="w-8 h-8 ml-1" />
        )}
      </button>

      {/* Forward Button */}
      <button
        onClick={onForward}
        disabled={!canForward}
        className={`p-4 rounded-full transition-all duration-200 ${
          canForward
            ? 'bg-gray-700 hover:bg-gray-600 text-white active:scale-95'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
        aria-label="Forward 10 words"
      >
        <FastForward className="w-6 h-6" />
      </button>
    </div>
  );
}

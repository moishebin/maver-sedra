'use client';

import { ReadingMode } from '@/types';
import { READING_MODES } from '@/lib/reading';

/**
 * Props for the ReadingModeControl component
 */
interface ReadingModeControlProps {
  /** Currently selected mode */
  mode: ReadingMode;
  /** Callback when the mode changes */
  onModeChange: (mode: ReadingMode) => void;
}

/**
 * Picks how the parsha is read: twice and targum per pasuk, per section,
 * for the whole parsha, or the Torah text once
 */
export function ReadingModeControl({ mode, onModeChange }: ReadingModeControlProps) {
  const selected = READING_MODES.find((m) => m.value === mode);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-gray-400 uppercase tracking-wide">
        Twice &amp; Targum
      </div>
      <div
        role="radiogroup"
        aria-label="Reading mode"
        className="flex flex-wrap justify-center rounded-lg bg-gray-800 p-1 text-sm"
      >
        {READING_MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => onModeChange(value)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              mode === value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-xs text-gray-500 text-center">{selected.description}</p>
      )}
    </div>
  );
}

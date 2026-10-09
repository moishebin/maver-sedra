'use client';

import { ReadingMode } from '@/types';
import { READING_MODES } from '@/lib/reading';
import { useLanguage } from '../LanguageProvider';

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
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-gray-400 uppercase tracking-wide">
        {t.readingModeTitle}
      </div>
      <div
        role="radiogroup"
        aria-label={t.readingModeLabel}
        className="flex flex-wrap justify-center rounded-lg bg-gray-800 p-1 text-sm"
      >
        {READING_MODES.map((value) => (
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
            {t.modes[value].label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">{t.modes[mode].description}</p>
    </div>
  );
}

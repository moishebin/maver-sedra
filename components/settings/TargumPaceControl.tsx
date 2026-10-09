'use client';

import { useLanguage } from '../LanguageProvider';

/** Targum speeds offered, as fractions of the reading speed */
const PACES = [1, 0.85, 0.7, 0.55];

/**
 * Props for the TargumPaceControl component
 */
interface TargumPaceControlProps {
  /** Current targum pace (fraction of the reading speed) */
  pace: number;
  /** Callback when the pace changes */
  onPaceChange: (pace: number) => void;
}

/**
 * Picks how much slower the targum plays than the Torah text, since the
 * Aramaic words are harder to read
 */
export function TargumPaceControl({ pace, onPaceChange }: TargumPaceControlProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-gray-400 uppercase tracking-wide">
        {t.targumPaceTitle}
      </div>
      <div
        role="radiogroup"
        aria-label={t.targumPaceTitle}
        className="flex flex-wrap justify-center rounded-lg bg-gray-800 p-1 text-sm"
      >
        {PACES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={pace === value}
            onClick={() => onPaceChange(value)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              pace === value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {value === 1 ? t.targumPaceSame : `${Math.round(value * 100)}%`}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">
        {t.targumPaceDescription(Math.round(pace * 100))}
      </p>
    </div>
  );
}

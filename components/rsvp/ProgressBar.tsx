'use client';

import { ReactNode } from 'react';

/**
 * Props for the ProgressBar component
 */
interface ProgressBarProps {
  /** Current word index */
  current: number;
  /** Total number of words */
  total: number;
  /** Optional label text */
  label?: string;
  /** Extra text shown after the percentage (e.g. time left) */
  detail?: ReactNode;
}

/**
 * Progress bar component for RSVP reader
 * Shows reading progress with visual bar and percentage
 */
export function ProgressBar({
  current,
  total,
  label,
  detail,
}: ProgressBarProps) {
  // Calculate percentage (avoid division by zero)
  const percentage = total > 0 ? (current / (total - 1)) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Format numbers for display
  const displayCurrent = Math.min(current + 1, total);
  const displayTotal = total;

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-500">
            {displayCurrent} / {displayTotal}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 start-0 h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="text-center text-xs text-gray-500">
        {Math.round(clampedPercentage)}%
        {detail && <> · {detail}</>}
      </div>
    </div>
  );
}

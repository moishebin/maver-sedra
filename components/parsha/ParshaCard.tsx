'use client';

import { Parsha } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { parseLocalDate, parshaSlug } from '@/lib/hebcal';
import { loadProgress } from '@/lib/progress';

/**
 * Props for the ParshaCard component
 */
interface ParshaCardProps {
  /** The parsha to display */
  parsha: Parsha;
  /** Whether this is the current week's parsha */
  isCurrent?: boolean;
}

/**
 * Displays a parsha in a card format
 * Used on the homepage for current and upcoming parshiot
 */
export function ParshaCard({ parsha, isCurrent = false }: ParshaCardProps) {
  const slug = parshaSlug(parsha.name);

  // Saved reading progress lives in the browser, so read it after mount
  const [percent, setPercent] = useState<number | null>(null);
  useEffect(() => {
    setPercent(loadProgress(slug)?.percent ?? null);
  }, [slug]);

  const formattedDate = parseLocalDate(parsha.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Format the book reference (e.g., "Genesis 1:1-6:8")
  const firstAliyah = parsha.aliyot[0];
  const lastAliyah = parsha.aliyot[parsha.aliyot.length - 1];
  const reference = firstAliyah && lastAliyah
    ? `${parsha.book} ${firstAliyah.startChapter}:${firstAliyah.startVerse}-${lastAliyah.endChapter}:${lastAliyah.endVerse}`
    : parsha.book;

  return (
    <Link
      href={`/parsha/${slug}`}
      className={`block p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
        isCurrent
          ? 'bg-blue-600 hover:bg-blue-500 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
      }`}
    >
      <div className="space-y-2">
        {/* Date */}
        <div className={`text-sm ${isCurrent ? 'text-blue-200' : 'text-gray-400'}`}>
          {formattedDate}
        </div>

        {/* Parsha Names */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold" dir="rtl">
            {parsha.hebrewName || parsha.name}
          </h3>
          <p className={`text-sm ${isCurrent ? 'text-blue-100' : 'text-gray-400'}`}>
            Parashat {parsha.name}
          </p>
        </div>

        {/* Reference & Stats */}
        <div className={`text-sm pt-2 border-t ${
          isCurrent ? 'border-blue-400' : 'border-gray-700'
        }`}>
          <p>{reference}</p>
          <p className={isCurrent ? 'text-blue-200' : 'text-gray-500'}>
            {parsha.totalVerses} verses • {parsha.aliyot.length} aliyot
          </p>
        </div>

        {/* Saved progress */}
        {percent !== null && (
          <div className="pt-2 space-y-1">
            <p className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-blue-400'}`}>
              Continue · {percent}%
            </p>
            <div className={`h-1 rounded-full ${isCurrent ? 'bg-blue-400/50' : 'bg-gray-700'}`}>
              <div
                className={`h-full rounded-full ${isCurrent ? 'bg-white' : 'bg-blue-500'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

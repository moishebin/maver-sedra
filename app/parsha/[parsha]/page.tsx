'use client';

import { useRouter } from 'next/navigation';
import { useParsha } from '@/hooks/useParsha';
import { useParshaVerses } from '@/hooks/useSefaria';
import { usePreferences } from '@/hooks/usePreferences';
import { RSVPReader } from '@/components/rsvp/RSVPReader';
import { ReadingModeControl } from '@/components/settings/ReadingModeControl';
import { buildReading } from '@/lib/reading';
import { parshaSlug } from '@/lib/hebcal';
import { clearProgress, loadProgress, resumeIndex, saveProgress } from '@/lib/progress';
import { ReadingMode } from '@/types';
import { useCallback, useMemo } from 'react';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ParshaPageProps {
  params: {
    parsha: string;
  };
}

export default function ParshaPage({ params }: ParshaPageProps) {
  const router = useRouter();
  const parshaName = decodeURIComponent(params.parsha);
  const { parsha, isLoading: isLoadingParsha, error: parshaError } = useParsha({ parshaName });
  const { verses, isLoading: isLoadingText, error: textError } = useParshaVerses(parsha);
  const { preferences, isLoaded: prefsLoaded, updateReadingMode } = usePreferences();
  const mode = preferences.readingMode;

  const wordTokens = useMemo(() => buildReading(verses, mode), [verses, mode]);

  // Progress is saved per parsha on every word. On load, and after switching
  // modes (which rebuilds the word list), the reader starts where it left off.
  const slug = parsha ? parshaSlug(parsha.name) : null;
  const startIndex = useMemo(
    () => (slug && wordTokens.length > 0 ? resumeIndex(wordTokens, mode, loadProgress(slug)) : 0),
    [slug, wordTokens, mode]
  );

  const handleProgress = useCallback((index: number) => {
    const ref = wordTokens[index]?.source?.ref;
    if (!slug || !ref) return;
    // Back at the very start (e.g. "Start over") means no progress to resume
    if (index === 0) {
      clearProgress(slug);
      return;
    }
    saveProgress(slug, {
      mode,
      index,
      ref,
      percent: Math.round((index / Math.max(1, wordTokens.length - 1)) * 100),
    });
  }, [slug, wordTokens, mode]);

  const handleModeChange = (newMode: ReadingMode) => {
    updateReadingMode(newMode);
  };

  const isLoading = isLoadingParsha || isLoadingText || !prefsLoaded;
  const error = parshaError || textError;

  const handleBack = () => {
    router.push('/');
  };

  const handleComplete = () => {
    // Finished: next visit starts from the beginning
    if (slug) clearProgress(slug);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading parsha...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !parsha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Parsha Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            We couldn&apos;t find the parsha &quot;{parshaName}&quot;. It may not exist or there was an error loading it.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // No text available
  if (wordTokens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No Text Available
          </h2>
          <p className="text-gray-400 mb-6">
            The text for this parsha is not available yet. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = parsha.hebrewName 
    ? `${parsha.hebrewName} - Parashat ${parsha.name}`
    : `Parashat ${parsha.name}`;

  return (
    <RSVPReader
      // Remount on mode change so the reader starts at the resumed pasuk
      key={mode}
      words={wordTokens}
      title={displayTitle}
      initialIndex={startIndex}
      onComplete={handleComplete}
      onBack={handleBack}
      onProgress={handleProgress}
    >
      <ReadingModeControl mode={mode} onModeChange={handleModeChange} />
    </RSVPReader>
  );
}

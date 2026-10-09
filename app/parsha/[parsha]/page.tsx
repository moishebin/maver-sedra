'use client';

import { useRouter } from 'next/navigation';
import { useParsha } from '@/hooks/useParsha';
import { useParshaVerses } from '@/hooks/useSefaria';
import { usePreferences } from '@/hooks/usePreferences';
import { RSVPReader } from '@/components/rsvp/RSVPReader';
import { ReadingModeControl } from '@/components/settings/ReadingModeControl';
import { TargumPaceControl } from '@/components/settings/TargumPaceControl';
import { buildReading } from '@/lib/reading';
import { parshaSlug } from '@/lib/hebcal';
import { clearProgress, loadProgress, resumeIndex, saveProgress } from '@/lib/progress';
import { ReadingMode } from '@/types';
import { useCallback, useMemo } from 'react';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

interface ParshaPageProps {
  params: {
    parsha: string;
  };
}

export default function ParshaPage({ params }: ParshaPageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const parshaName = decodeURIComponent(params.parsha);
  const { parsha, isLoading: isLoadingParsha, error: parshaError } = useParsha({ parshaName });
  const { verses, isLoading: isLoadingText, error: textError } = useParshaVerses(parsha);
  const { preferences, isLoaded: prefsLoaded, updateReadingMode, updateTargumPace } = usePreferences();
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
          <p className="text-gray-400">{t.loadingParsha}</p>
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
            {t.notFoundTitle}
          </h2>
          <p className="text-gray-400 mb-6">
            {t.notFoundBody(parshaName)}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
            {t.backToHome}
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
            {t.noTextTitle}
          </h2>
          <p className="text-gray-400 mb-6">
            {t.noTextBody}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
            {t.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = t.readerTitle(parsha.name, parsha.hebrewName);

  return (
    <RSVPReader
      // Remount on mode change so the reader starts at the resumed pasuk
      key={mode}
      words={wordTokens}
      title={displayTitle}
      initialIndex={startIndex}
      targumPace={mode === 'once' ? 1 : preferences.targumPace}
      onComplete={handleComplete}
      onBack={handleBack}
      onProgress={handleProgress}
    >
      <ReadingModeControl mode={mode} onModeChange={handleModeChange} />
      {mode !== 'once' && (
        <TargumPaceControl pace={preferences.targumPace} onPaceChange={updateTargumPace} />
      )}
    </RSVPReader>
  );
}

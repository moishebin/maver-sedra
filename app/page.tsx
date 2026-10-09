'use client';

import { useParsha } from '@/hooks/useParsha';
import { usePreferences } from '@/hooks/usePreferences';
import { createHebcalClient, parseLocalDate, parshaSlug } from '@/lib/hebcal';
import { clearProgress, loadProgress } from '@/lib/progress';
import { useRouter } from 'next/navigation';
import { ParshaCard } from '@/components/parsha/ParshaCard';
import { useState, useEffect } from 'react';
import { Parsha } from '@/types';
import Link from 'next/link';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isLoaded: prefsLoaded, israel, updateIsrael } = usePreferences();
  const { parsha: currentParsha, isLoading: isLoadingCurrent, error: currentError } = useParsha({
    israel,
    enabled: prefsLoaded,
  });
  const [upcomingParshiot, setUpcomingParshiot] = useState<Parsha[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);

  // Fetch upcoming parshiot
  useEffect(() => {
    if (!prefsLoaded) return;

    async function fetchUpcoming() {
      setIsLoadingUpcoming(true);
      try {
        // Fetch parshiot for ±3 months around today (sorted by date)
        const today = new Date();
        const allParshiot = await createHebcalClient({ israel }).getParshiotForDateRange(today);

        // The first parsha on or after today is this week's; list the next 4
        today.setHours(0, 0, 0, 0);
        const upcoming = allParshiot
          .filter(p => parseLocalDate(p.date) >= today)
          .slice(1, 5);

        setUpcomingParshiot(upcoming);
      } catch (error) {
        console.error('Error fetching upcoming parshiot:', error);
      } finally {
        setIsLoadingUpcoming(false);
      }
    }

    fetchUpcoming();
  }, [israel, prefsLoaded]);

  const hasProgress = currentParsha ? loadProgress(parshaSlug(currentParsha.name)) !== null : false;

  const isLoading = !prefsLoaded || isLoadingCurrent || isLoadingUpcoming;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">MAVER Sedra</h1>
                <p className="text-sm text-gray-400">RSVP Torah Reader</p>
              </div>
            </div>
            <div
              role="group"
              aria-label="Reading schedule"
              className="flex rounded-lg bg-gray-800 p-1 text-sm"
            >
              {[
                { label: 'Diaspora', value: false },
                { label: 'Israel', value: true },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={israel === value}
                  onClick={() => updateIsrael(value)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    israel === value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-400">Loading parsha data...</span>
          </div>
        )}

        {/* Error State */}
        {currentError && (
          <div className="flex items-center justify-center py-12 bg-red-900/20 rounded-xl border border-red-800">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="ml-3 text-red-400">
              Error loading parsha. Please try again later.
            </span>
          </div>
        )}

        {/* Current Parsha */}
        {!isLoading && !currentError && currentParsha && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                This Week
              </span>
            </div>
            <ParshaCard parsha={currentParsha} isCurrent={true} />
          </section>
        )}

        {/* Start Reading Button */}
        {!isLoading && currentParsha && (
          <div className="flex flex-col items-center gap-3">
            <Link
              href={`/parsha/${parshaSlug(currentParsha.name)}`}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {hasProgress ? 'Continue Reading' : 'Start Reading'}
            </Link>
            {hasProgress && (
              <button
                type="button"
                onClick={() => {
                  const slug = parshaSlug(currentParsha.name);
                  clearProgress(slug);
                  router.push(`/parsha/${slug}`);
                }}
                className="text-sm text-gray-400 hover:text-white underline underline-offset-4"
              >
                Start over from the beginning
              </button>
            )}
          </div>
        )}

        {/* Upcoming Parshiot */}
        {!isLoading && upcomingParshiot.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300">
              Upcoming Parshiot
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingParshiot.map((parsha) => (
                <ParshaCard key={parsha.name} parsha={parsha} />
              ))}
            </div>
          </section>
        )}

        {/* No Data State */}
        {!isLoading && !currentParsha && !currentError && (
          <div className="flex items-center justify-center py-12 bg-yellow-900/20 rounded-xl border border-yellow-800">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <span className="ml-3 text-yellow-400">
              No parsha data available. Please check your internet connection.
            </span>
          </div>
        )}

        {/* About Section */}
        <section className="border-t border-gray-800 pt-8">
          <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-300">
              What is RSVP Reading?
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Rapid Serial Visual Presentation (RSVP) displays text one word at a time 
              in a fixed position. This eliminates eye movement (saccades) and allows 
              you to read at 300-600+ words per minute while maintaining comprehension.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Perfect for busy individuals who want to complete the weekly Torah reading efficiently.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            MAVER Sedra - Read the weekly parsha faster with RSVP technology
          </p>
        </div>
      </footer>
    </div>
  );
}

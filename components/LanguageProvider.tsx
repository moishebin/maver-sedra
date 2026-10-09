'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { detectLanguage, Language, STRINGS, Strings } from '@/lib/i18n';
import { persist, readStored } from '@/hooks/usePreferences';

interface LanguageContextValue {
  lang: Language;
  t: Strings;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: STRINGS.en,
  setLanguage: () => {},
});

/**
 * Holds the UI language for the whole app (so switching it updates every
 * component at once) and keeps <html lang/dir> in sync: Hebrew is RTL.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    setLang(readStored().language ?? detectLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLanguage = useCallback((next: Language) => {
    setLang(next);
    persist({ language: next });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: STRINGS[lang], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

/** Button that switches between Hebrew and English */
export function LanguageToggle() {
  const { lang, t, setLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLanguage(lang === 'he' ? 'en' : 'he')}
      aria-label={t.languageToggleLabel}
      lang={lang === 'he' ? 'en' : 'he'}
      className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
    >
      {t.languageToggle}
    </button>
  );
}

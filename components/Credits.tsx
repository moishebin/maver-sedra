'use client';

import { useLanguage } from './LanguageProvider';

/**
 * Attribution for the texts and calendar data the app uses, as their licenses
 * require. Keep in sync with the versions Sefaria serves (lib/sefaria.ts).
 */
export function Credits() {
  const { t } = useLanguage();
  const c = t.credits;

  const sources = [
    {
      what: c.torah,
      title: c.torahTitle,
      via: { name: 'Sefaria', url: 'https://www.sefaria.org/Genesis.1' },
      license: { name: 'CC BY-SA', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
    },
    {
      what: c.targum,
      title: c.targumTitle,
      via: { name: 'Sefaria', url: 'https://www.sefaria.org/Onkelos_Genesis.1' },
      license: { name: 'CC BY-NC', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
    },
    {
      what: c.schedule,
      title: c.scheduleTitle,
      via: { name: 'Hebcal.com', url: 'https://www.hebcal.com/' },
      license: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
    },
  ];

  return (
    <footer className="border-t border-gray-800 px-4 py-6 text-xs text-gray-500">
      <ul className="max-w-4xl mx-auto space-y-1 text-center">
        {sources.map(({ what, title, via, license }) => (
          <li key={via.url}>
            {what}: {title}, {c.via}{' '}
            <a href={via.url} className="underline hover:text-gray-300" target="_blank" rel="noopener noreferrer">
              {via.name}
            </a>{' '}
            (
            <a href={license.url} className="underline hover:text-gray-300" target="_blank" rel="noopener noreferrer">
              {license.name}
            </a>
            )
          </li>
        ))}
      </ul>
    </footer>
  );
}

/**
 * Attribution for the texts and calendar data the app uses, as their licenses
 * require. Keep in sync with the versions Sefaria serves (lib/sefaria.ts).
 */
const SOURCES = [
  {
    what: 'Torah text',
    title: 'Miqra according to the Masorah',
    via: { name: 'Sefaria', url: 'https://www.sefaria.org/Genesis.1' },
    license: { name: 'CC BY-SA', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  },
  {
    what: 'Targum Onkelos',
    title: 'Sifsei Chachomim Chumash, Metsudah Publications, 2009',
    via: { name: 'Sefaria', url: 'https://www.sefaria.org/Onkelos_Genesis.1' },
    license: { name: 'CC BY-NC', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  },
  {
    what: 'Parsha schedule',
    title: 'Hebcal Jewish Calendar',
    via: { name: 'Hebcal.com', url: 'https://www.hebcal.com/' },
    license: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  },
];

export function Credits() {
  return (
    <footer className="border-t border-gray-800 px-4 py-6 text-xs text-gray-500">
      <ul className="max-w-4xl mx-auto space-y-1 text-center">
        {SOURCES.map(({ what, title, via, license }) => (
          <li key={what}>
            {what}: {title}, via{' '}
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

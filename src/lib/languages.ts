/**
 * languages.ts — the canonical list of programming languages tracked by the
 * RepoPicks trend engine.
 *
 * Kept in its own module (instead of inside scripts/run-trend-etl.ts) so that
 * Next.js routes/components can import it at runtime. Importing the ETL
 * script directly would execute the pipeline as a side effect — never do that.
 */
export const LANGUAGES_TO_TRACK: string[] = [
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'JavaScript',
  'C++',
  'Java',
  'Swift',
  'Kotlin',
  'C#',
];

/** URL-safe slug for a language, e.g. "C++" -> "cpp", "C#" -> "csharp". */
export function languageSlug(language: string): string {
  const lower = language.toLowerCase();
  if (lower === 'c++') return 'cpp';
  if (lower === 'c#') return 'csharp';
  return lower.replace(/[^a-z0-9]+/g, '-');
}

/** Reverse lookup: slug -> canonical language name (case-insensitive). */
export function languageFromSlug(slug: string): string | null {
  const clean = slug.toLowerCase().replace(/\.xml$/, '');
  for (const lang of LANGUAGES_TO_TRACK) {
    if (languageSlug(lang) === clean || lang.toLowerCase() === clean) {
      return lang;
    }
  }
  return null;
}

/**
 * Site-wide configuration.
 *
 * NEWSLETTER_URL — one-time setup:
 *  1. Create a free publication on Buttondown (buttondown.com) or Substack.
 *  2. In the publication settings, turn on RSS-to-email (or "import via RSS")
 *     and point it at:  https://clever-volta-lac.vercel.app/picks.xml
 *  3. Copy your publication's public subscribe URL and paste it below
 *     (or set the NEXT_PUBLIC_NEWSLETTER_URL env var in Vercel).
 *
 * After that single step, the weekly email goes out automatically —
 * no further work needed, ever.
 */
export const NEWSLETTER_URL: string =
  process.env.NEXT_PUBLIC_NEWSLETTER_URL || '';

export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://clever-volta-lac.vercel.app';

export const PICKS_RSS_URL = `${SITE_URL}/picks.xml`;

export const INSTAGRAM_URL = 'https://www.instagram.com/repopicks';

export const CONTACT_EMAIL = 'hello@repopicks.dev';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://clever-volta-lac.vercel.app'),
  title: {
    default: 'RepoPicks | Trending open-source, handpicked daily',
    template: '%s | RepoPicks',
  },
  description: 'RepoPicks — trending GitHub repositories, handpicked daily. Discover breakout open-source projects and developer tools ranked by true star velocity.',
  keywords: ['github trending', 'trending repositories', 'open source', 'star velocity', 'developer tools', 'repopicks'],
  authors: [{ name: 'RepoPicks' }],
  openGraph: {
    title: 'RepoPicks | Trending open-source, handpicked daily',
    description: 'Trending GitHub repositories, handpicked daily. Discover breakout open-source projects and developer tools ranked by true star velocity.',
    type: 'website',
    siteName: 'RepoPicks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepoPicks | Trending open-source, handpicked daily',
    description: 'Discover breakout open-source repositories and tools ranked by true star velocity.',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

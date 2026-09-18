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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gittrend-engine.vercel.app'),
  title: {
    default: 'GitTrend | Production-Grade GitHub Repository Discovery & Star Velocity Analytics',
    template: '%s | GitTrend',
  },
  description: 'Discover trending GitHub repositories, track breakout open source projects, and explore developer tools ranked by true star velocity momentum.',
  keywords: ['github trending', 'trending repositories', 'open source', 'star velocity', 'developer tools', 'github analytics'],
  authors: [{ name: 'GitTrend Engine Team' }],
  openGraph: {
    title: 'GitTrend | Production-Grade GitHub Repository Discovery & Star Velocity Analytics',
    description: 'Discover trending GitHub repositories, track breakout open source projects, and explore developer tools ranked by true star velocity momentum.',
    type: 'website',
    siteName: 'GitTrend',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitTrend | Production-Grade GitHub Repository Discovery',
    description: 'Discover breakout open source repositories and tools ranked by true star velocity.',
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

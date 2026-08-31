import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'v01df0rg3 | terminal',
  description: 'The terminal-style home of v01df0rg3.',
  metadataBase: new URL('https://v01df0rg3.github.io'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: '/',
    title: 'v01df0rg3 | terminal',
    description: 'A terminal-style portfolio.',
    siteName: 'v01df0rg3',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'v01df0rg3 — a terminal-style portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'v01df0rg3 | terminal',
    description: 'A terminal-style portfolio.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

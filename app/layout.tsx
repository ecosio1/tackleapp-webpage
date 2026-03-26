/**
 * Root Layout
 */

import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tackle - AI Fishing Assistant | Never Fish Blind Again',
  description: 'Get real-time fishing conditions, AI fish identification, and expert advice. Download Tackle for iPhone and catch more fish.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,500&display=swap" rel="stylesheet" />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1CPFPNR9LF"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1CPFPNR9LF');
        `}
      </Script>
      <body>{children}</body>
    </html>
  );
}

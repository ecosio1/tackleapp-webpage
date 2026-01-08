/**
 * Root Layout
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tackle - AI Fishing Assistant',
  description: 'Never fish blind again. Get real-time conditions, AI fish ID, and expert advice with Tackle.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}




/**
 * Blog Layout
 */

import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-page">
      <Header />
      <main className="blog-container">
        {children}
      </main>
      <footer className="site-footer">
        <nav className="footer-nav">
          <Link href="/features">Features</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p>&copy; 2026 Tackle. All rights reserved.</p>
      </footer>
    </div>
  );
}

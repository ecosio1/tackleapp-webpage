/**
 * Blog Layout
 */

import { Header } from '@/components/layout/Header';

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
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
        <p>&copy; 2024 Tackle. All rights reserved.</p>
      </footer>
    </div>
  );
}

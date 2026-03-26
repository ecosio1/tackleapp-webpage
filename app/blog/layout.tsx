/**
 * Blog Layout
 */

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
      <Footer />
    </div>
  );
}

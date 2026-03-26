import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HowToLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="page-container">{children}</main>
      <Footer />
    </>
  );
}

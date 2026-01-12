'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <nav className="site-header">
      <div className="main-nav">
        <Link href="/" className="logo-link">
          <div className="logo-container">
            <Image
              src="/logo.png"
              alt="Tackle Logo"
              width={40}
              height={40}
              className="logo-image"
            />
            <span className="logo">tackle.</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link
            href="https://apps.apple.com/app/tackle"
            className="cta-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download App
          </Link>
        </div>
      </div>

      <style jsx>{`
        .logo-link {
          text-decoration: none;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-image {
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .logo-container {
            gap: 8px;
          }
        }
      `}</style>
    </nav>
  );
}

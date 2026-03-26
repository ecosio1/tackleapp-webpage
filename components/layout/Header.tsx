'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [blogSubOpen, setBlogSubOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/blog') return pathname.startsWith('/blog');
    return pathname === href;
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
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
            <Link href="/features" className={isActive('/features') ? 'nav-link-active' : ''}>Features</Link>
            <Link href="/how-it-works" className={isActive('/how-it-works') ? 'nav-link-active' : ''}>How It Works</Link>
            <Link href="/blog" className={isActive('/blog') ? 'nav-link-active' : ''}>Blog</Link>
            <Link href="/feed" className={isActive('/feed') ? 'nav-link-active' : ''}>Feed</Link>
            <Link href="/about" className={isActive('/about') ? 'nav-link-active' : ''}>About</Link>
            <Link href="/contact" className={isActive('/contact') ? 'nav-link-active' : ''}>Contact</Link>
            <Link
              href="https://apps.apple.com/app/tackle"
              className="cta-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download App
            </Link>
          </div>
          <button
            className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`menu-overlay ${menuOpen ? 'menu-overlay-visible' : ''}`}
        onClick={closeMenu}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="drawer-header">
          <Link href="/" className="logo-link" onClick={closeMenu}>
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
          <button className="close-button" onClick={closeMenu} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="drawer-nav">
          <Link href="/features" onClick={closeMenu} className={isActive('/features') ? 'drawer-link-active' : ''}>Features</Link>
          <Link href="/how-it-works" onClick={closeMenu} className={isActive('/how-it-works') ? 'drawer-link-active' : ''}>How It Works</Link>
          <div>
            <button
              className={`drawer-blog-toggle ${isActive('/blog') ? 'drawer-link-active' : ''}`}
              onClick={() => setBlogSubOpen(!blogSubOpen)}
            >
              Blog
              <ChevronDown className={`w-4 h-4 transition-transform ${blogSubOpen ? 'rotate-180' : ''}`} />
            </button>
            {blogSubOpen && (
              <div className="drawer-sub-nav">
                <Link href="/blog" onClick={closeMenu}>All Posts</Link>
                <Link href="/blog/category/fishing-tips" onClick={closeMenu}>Fishing Tips</Link>
                <Link href="/blog/category/techniques" onClick={closeMenu}>Techniques</Link>
                <Link href="/blog/category/gear-reviews" onClick={closeMenu}>Gear Reviews</Link>
                <Link href="/blog/category/species" onClick={closeMenu}>Species</Link>
                <Link href="/blog/category/conditions" onClick={closeMenu}>Conditions</Link>
              </div>
            )}
          </div>
          <Link href="/feed" onClick={closeMenu} className={isActive('/feed') ? 'drawer-link-active' : ''}>Feed</Link>
          <Link href="/about" onClick={closeMenu} className={isActive('/about') ? 'drawer-link-active' : ''}>About</Link>
          <Link href="/contact" onClick={closeMenu} className={isActive('/contact') ? 'drawer-link-active' : ''}>Contact</Link>
        </nav>
        <div className="drawer-cta">
          <Link
            href="https://apps.apple.com/app/tackle"
            className="cta-link drawer-cta-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
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

        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          gap: 5px;
          z-index: 1001;
        }

        .hamburger-line {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text-primary, #1a1d24);
          border-radius: 2px;
          transition: all 300ms ease;
          transform-origin: center;
        }

        .hamburger-open .hamburger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .hamburger-open .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger-open .hamburger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        @media (max-width: 768px) {
          .hamburger {
            display: flex;
          }

          .logo-container {
            gap: 8px;
          }
        }
      `}</style>

      <style jsx global>{`
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: opacity 300ms ease, visibility 300ms ease;
          z-index: 998;
        }

        .menu-overlay-visible {
          opacity: 1;
          visibility: visible;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 300px;
          max-width: 85vw;
          height: 100vh;
          background: var(--bg-white, #fafbfc);
          box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
          transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .mobile-drawer-open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light, rgba(0, 0, 0, 0.07));
        }

        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-primary, #1a1d24);
          border-radius: 8px;
          transition: background 150ms ease;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          padding: 24px;
          gap: 8px;
        }

        .drawer-nav a,
        .drawer-blog-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 16px;
          color: var(--text-primary, #1a1d24);
          text-decoration: none;
          font-size: 17px;
          font-weight: 500;
          border-radius: 12px;
          transition: all 150ms ease;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .drawer-nav a:hover,
        .drawer-blog-toggle:hover {
          background: rgba(37, 99, 235, 0.08);
          color: var(--primary-blue, #3b82f6);
        }

        .drawer-link-active {
          color: var(--primary-blue, #3b82f6) !important;
          background: rgba(37, 99, 235, 0.08) !important;
          font-weight: 600 !important;
        }

        .drawer-sub-nav {
          display: flex;
          flex-direction: column;
          padding-left: 16px;
          gap: 2px;
        }

        .drawer-sub-nav a {
          font-size: 15px;
          padding: 12px 16px;
          color: var(--text-secondary, rgba(26, 29, 36, 0.7));
          font-weight: 400;
        }

        .drawer-sub-nav a:hover {
          color: var(--primary-blue, #3b82f6);
        }

        .drawer-cta {
          margin-top: auto;
          padding: 24px;
          border-top: 1px solid var(--border-light, rgba(0, 0, 0, 0.07));
        }

        .drawer-cta-link {
          display: block !important;
          width: 100%;
          text-align: center;
        }

        /* Dark mode for mobile drawer */
        @media (prefers-color-scheme: dark) {
          .mobile-drawer {
            background: #141419;
          }

          .drawer-header {
            border-bottom-color: rgba(255, 255, 255, 0.08);
          }

          .close-button {
            color: #f5f5f7;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .drawer-nav a {
            color: #f5f5f7;
          }

          .drawer-nav a:hover {
            background: rgba(52, 211, 153, 0.1);
            color: #34D399;
          }

          .drawer-cta {
            border-top-color: rgba(255, 255, 255, 0.08);
          }

          .hamburger-line {
            background: #f5f5f7;
          }
        }
      `}</style>
    </>
  );
}

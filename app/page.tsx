'use client';

/**
 * Home Page - Landing Page
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';
import PhoneMockup from '@/components/landing/PhoneMockup';
import contentIndex from '@/content/_system/contentIndex.json';
import feedIndex from '@/content/_system/feedIndex.json';
import { FeedCard } from '@/components/feed/FeedCard';
import type { FeedItemIndexEntry } from '@/lib/types/feed';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const animatedRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lock body scroll when menu is open
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

  // Scroll animation with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    animatedRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.body}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Image src="/logo.png" alt="Tackle Logo" className={styles.logoImg} width={40} height={40} />
            <span className={styles.logoText}>tackle.</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/features">Features</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/feed">Feed</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className={styles.navRight}>
            <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank">
              Download App
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
              <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
              <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.menuOverlay} ${menuOpen ? styles.menuOverlayVisible : ''}`}
        onClick={closeMenu}
      />

      {/* Mobile Menu Drawer */}
      <div className={`${styles.mobileDrawer} ${menuOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>
            <Image src="/logo.png" alt="Tackle Logo" className={styles.logoImg} width={40} height={40} />
            <span className={styles.logoText}>tackle.</span>
          </div>
          <button className={styles.closeButton} onClick={closeMenu} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className={styles.drawerNav}>
          <Link href="/features" onClick={closeMenu}>Features</Link>
          <Link href="/how-it-works" onClick={closeMenu}>How It Works</Link>
          <Link href="/blog" onClick={closeMenu}>Blog</Link>
          <Link href="/feed" onClick={closeMenu}>Feed</Link>
          <Link href="/about" onClick={closeMenu}>About</Link>
          <Link href="/contact" onClick={closeMenu}>Contact</Link>
        </nav>
        <div className={styles.drawerCta}>
          <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank" onClick={closeMenu}>
            Download App
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Your AI-Powered<br />Fishing Assistant
            </h1>
            <p className={styles.heroDescription}>
              Get real-time conditions, instant fish ID, and expert advice—all in your pocket. Never fish blind again.
            </p>
            <div className={styles.heroButtons}>
              <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank">
                Download for iPhone
              </Link>
              <Link href="/features" className={styles.btnSecondary}>
                Explore Features
              </Link>
            </div>
            {/* Social Proof */}
            <div className={styles.socialProof}>
              <span className={styles.userCount}>10,000+</span>
              <span className={styles.userLabel}>anglers catching more fish</span>
            </div>
          </div>
          <div className={styles.heroImage}>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Everything you need to catch more fish</h2>
          <div className={styles.featuresGrid}>
            <div
              className={`${styles.featureCard} ${styles.animateOnScroll}`}
              ref={(el) => { animatedRefs.current[0] = el; }}
            >
              <div className={styles.featureImage}>
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.cardVideo}
                >
                  <source src="/fish-id-video.mp4" type="video/mp4" />
                </video>
              </div>
              <div className={styles.featureContent}>
                <h3>99% Accurate Fish ID</h3>
                <p>Snap a photo and instantly identify any fish with advanced AI. Know your catch in seconds.</p>
              </div>
            </div>

            <div
              className={`${styles.featureCard} ${styles.animateOnScroll}`}
              ref={(el) => { animatedRefs.current[1] = el; }}
            >
              <div className={styles.featureImage}>
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.cardVideo}
                >
                  <source src="/weather-video.mp4" type="video/mp4" />
                </video>
              </div>
              <div className={styles.featureContent}>
                <h3>Real-Time Conditions</h3>
                <p>Daily fishing scores based on weather, tides, and moon phases. Plan your perfect trip.</p>
              </div>
            </div>

            <div
              className={`${styles.featureCard} ${styles.animateOnScroll}`}
              ref={(el) => { animatedRefs.current[2] = el; }}
            >
              <div className={styles.featureImage}>
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.cardVideo}
                >
                  <source src="/ai-captain-video.mp4" type="video/mp4" />
                </video>
              </div>
              <div className={styles.featureContent}>
                <h3>AI Captain Chat</h3>
                <p>Get expert advice 24/7. Ask about bait, locations, techniques—your personal fishing guide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How Tackle Works</h2>
          <div className={styles.howItWorksGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Download the App</h3>
              <p>Get Tackle free on the App Store. Set up takes less than a minute.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Check Conditions</h3>
              <p>See real-time fishing scores based on weather, tides, and moon phases for your location.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Catch More Fish</h3>
              <p>Use AI-powered insights and fish ID to make every trip more successful.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof Section */}
      <section className={styles.testimonial}>
        <div className={styles.testimonialContainer}>
          <div className={styles.testimonialImage}>
            <Image
              src="/images/quote-angler.jpg"
              alt="Angler using Tackle on the water"
              width={540}
              height={660}
              className={styles.testimonialPhoto}
            />
          </div>
          <div className={styles.testimonialContent}>
            <blockquote className={styles.testimonialQuote}>
              &ldquo;Tackle changed how I plan every trip. The conditions and AI captain are like having a local guide in your pocket.&rdquo;
            </blockquote>
            <div className={styles.testimonialAuthor}>
              <span className={styles.testimonialName}>Jake M.</span>
              <span className={styles.testimonialRole}>Inshore Angler / Tampa Bay, FL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Content Feed Section */}
      {feedIndex.items.length > 0 && (
        <section className={styles.feedPreview}>
          <div className={styles.container}>
            <div className={styles.feedPreviewHeader}>
              <h2>What Anglers Are Watching</h2>
              <Link href="/feed" className={styles.viewAllLink}>
                View all content
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className={styles.feedGrid}>
              {(feedIndex.items as FeedItemIndexEntry[]).slice(0, 6).map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Preview Section */}
      <section className={styles.blogPreview}>
        <div className={styles.container}>
          <div className={styles.blogPreviewHeader}>
            <h2>Fishing Tips & Guides</h2>
            <Link href="/blog" className={styles.viewAllLink}>
              View all articles
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className={styles.blogGrid}>
            {contentIndex.blogPosts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.blogCard}>
                <div className={styles.blogCardImage}>
                  <Image
                    src={post.heroImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className={styles.blogCardCategory}>
                    {post.category.replace('-', ' ')}
                  </span>
                </div>
                <div className={styles.blogCardContent}>
                  <h3 className={styles.blogCardTitle}>{post.title}</h3>
                  <p className={styles.blogCardExcerpt}>{post.description}</p>
                  <div className={styles.blogCardMeta}>
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{Math.ceil(post.wordCount / 200)} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to catch more fish?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of anglers using Tackle to improve their fishing success.
          </p>
          <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank">
            Download for iPhone
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLinks}>
            <Link href="/features">Features</Link>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/feed">Feed</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <p className={styles.footerCopy}>&copy; 2026 Tackle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <h3 className={styles.brandName}>tackle.</h3>
            <p className={styles.brandTagline}>Your AI-powered fishing assistant</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <h4>Product</h4>
              <Link href="/features">Features</Link>
              <Link href="/how-it-works">How It Works</Link>
              <Link href="https://apps.apple.com/app/tackle" target="_blank">Download App</Link>
            </div>

            <div className={styles.linkColumn}>
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div className={styles.linkColumn}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.copyright}>&copy; 2026 Tackle. All rights reserved.</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Facebook">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

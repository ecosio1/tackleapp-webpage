'use client';

import { useState, useEffect } from 'react';
import styles from './PhoneMockup.module.css';

const videos = [
  { src: '/weather-video.mp4', title: 'Weather Conditions' },
  { src: '/fish-id-video.mp4', title: 'Fish ID' },
  { src: '/navigation-video..mp4', title: 'Navigation' },
  { src: '/ai-captain-video.mp4', title: 'AI Captain' },
];

export default function PhoneMockup() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % videos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.phoneMockup}>
      <div className={styles.phoneFrame}>
        <div className={styles.phoneScreen}>
          <div className={styles.carouselContainer}>
            {videos.map((video, index) => (
              <div
                key={index}
                className={`${styles.carouselSlide} ${
                  index === currentSlide ? styles.active : ''
                }`}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={styles.video}
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
          <div className={styles.carouselDots}>
            {videos.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === currentSlide ? styles.activeDot : ''
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

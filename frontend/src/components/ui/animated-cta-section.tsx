'use client';

import React from 'react';
import styles from './animated-cta-section.module.css';

const AnimatedCTASection = () => {
  const lineWrapperTops = ['10%', '30%', '50%', '70%', '90%'];

  return (
    <section className={styles.section}>
      {/* Grid Background */}
      <div className={styles.gridBackground} />

      {/* Animated Background Lines */}
      <div className={styles.linesContainer}>
        {lineWrapperTops.map((top, index) => (
          <div key={index} className={styles.lineWrapper} style={{ top }}>
            <div className={styles.lineTrack}>
              <div className={`${styles.line} ${index % 2 !== 0 ? styles.lineReverse : ''}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Corner Lines - hidden on mobile via CSS */}
      <div className={styles.cornerLines}>
        <svg
          className={styles.cornerSvgLeft}
          viewBox="0 0 120 60"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50"
        >
          <path d="M120 0 L20 0 Q0 0 0 20 L0 60" />
        </svg>
        <svg
          className={styles.cornerSvgRight}
          viewBox="0 0 120 60"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50"
        >
          <path d="M120 0 L20 0 Q0 0 0 20 L0 60" />
        </svg>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <h1 className={styles.heading}>
          Ready to Secure
          <br />
          <span className={styles.gradientText}>Your Smart Contracts?</span>
        </h1>
        <p className={styles.description}>
          Start auditing today with 3 free audits. No wallet connection required.
        </p>
        <div className={styles.buttons}>
          <a href="#audit" className={styles.buttonPrimary}>
            Start Free Audit
          </a>
          <a href="/docs" className={styles.buttonSecondary}>
            View Documentation
          </a>
        </div>
      </div>
    </section>
  );
};

export default function CtaSection() {
  return <AnimatedCTASection />;
}

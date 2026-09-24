"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Story.module.css";

const HEADLINE = ["Made for moments", "worth sharing."];

/* The photograph drifts ~28px across the whole section */
const DRIFT = 28;

export default function Story() {
  const sectionRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* --- Reveal once, when the section is properly in view ----------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* --- Very subtle parallax on the photograph ---------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let visible = false;

    const write = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const span = rect.height + window.innerHeight || 1;
      /* 0 as the section enters, 1 as it leaves */
      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / span, 0),
        1
      );
      section.style.setProperty("--shift", `${(progress - 0.5) * -2 * DRIFT}px`);
    };

    const onScroll = () => {
      if (!frame && visible) frame = requestAnimationFrame(write);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "200px" }
    );
    observer.observe(section);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${ready ? styles.ready : ""}`}
      aria-labelledby="story-heading"
    >
      {/* The ivory rises out of the hero on a soft curve */}
      <svg
        className={styles.capTop}
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,100 L0,40 C240,2 520,0 820,26 C1080,48 1280,64 1440,58 L1440,100 Z"
          fill="#f6f0e7"
        />
      </svg>

      {/* Background: two warm fields and a set of faint rings echoing the
          dish and the rings that form on melting chocolate. */}
      <div className={styles.field} aria-hidden="true">
        <svg
          className={styles.fieldSvg}
          viewBox="0 0 1440 960"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="ffFieldA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c98a5c" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#c98a5c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ffFieldB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8d6b52" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8d6b52" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="180" cy="230" rx="520" ry="400" fill="url(#ffFieldA)" />
          <ellipse cx="1290" cy="820" rx="480" ry="380" fill="url(#ffFieldB)" />
          <g
            fill="none"
            stroke="#a87a55"
            strokeOpacity="0.1"
            strokeWidth="1"
          >
            <circle cx="1238" cy="212" r="96" />
            <circle cx="1238" cy="212" r="150" />
            <circle cx="1238" cy="212" r="208" />
            <circle cx="1238" cy="212" r="270" />
          </g>
        </svg>
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.rise}`} style={{ "--d": "80ms" }}>
            The Fondue Flame
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="story-heading" className={styles.headline}>
            {HEADLINE.map((line, index) => (
              <span key={line} className={styles.line}>
                <span
                  className={styles.lineInner}
                  style={{ "--d": `${220 + index * 90}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className={`${styles.body} ${styles.rise}`} style={{ "--d": "460ms" }}>
            Inspired by the warmth of candlelight and the joy of sharing chocolate
            fondue, Fondue Flame transforms a simple moment into an experience
            worth remembering.
          </p>

          <div className={`${styles.detail} ${styles.rise}`} style={{ "--d": "600ms" }}>
            <p className={styles.count}>
              <span className={styles.countNum}>02 / 03</span>
              <span className={styles.countLabel}>People</span>
            </p>
            <span className={styles.detailRule} aria-hidden="true" />
            <p className={styles.detailText}>
              Designed for an intimate experience shared together.
            </p>
          </div>

          <div className={`${styles.ctaRow} ${styles.rise}`} style={{ "--d": "730ms" }}>
            <Link href="/#experience" className={styles.cta}>
              Discover the Experience
              <span className={styles.ctaArrow} aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.frame} style={{ "--d": "340ms" }}>
            <Image
              src="/story/product.jpg"
              alt="The Fondue Flame ceramic fondue candle, its centre tealight lit and melted chocolate in the surrounding well, beside the brand gift box"
              width={1500}
              height={1862}
              sizes="(max-width: 1023px) 92vw, 52vw"
              className={styles.photo}
            />
            <span className={styles.captionFoot} aria-hidden="true" />
            <p className={styles.caption}>Candlelight · Chocolate · Connection</p>
          </div>
        </div>
      </div>

      {/* Settles into chocolate for the section that follows */}
      <svg
        className={styles.capBottom}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,120 L1440,120 L1440,46 C1180,80 900,94 600,74 C360,58 160,36 0,14 Z"
          fill="#26150c"
        />
      </svg>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

const HEADLINE = ["Share the", "Experience."];

/* Parallax factors: the page moves at 1. Anything slower lags behind,
   which is what reads as depth. Media 0.85x, copy 0.65x. */
const MEDIA_LAG = 0.15;
const COPY_LAG = 0.35;
const MAX_SCALE = 0.035;

export default function Hero() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* --- Entrance: release on the first frame after hydration -------- */
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /* --- Autoplay the loop, unless motion is not wanted --------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.muted = true; /* iOS needs the property, not just the attribute */
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {}); /* poster stands in */
  }, []);

  /* --- Parallax: one rAF-throttled listener, gated to the viewport -- */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const small = window.matchMedia("(max-width: 767px)");
    let frame = 0;
    let visible = true;

    const write = () => {
      frame = 0;
      const y = window.scrollY;
      const span = hero.offsetHeight || 1;
      const progress = Math.min(y / span, 1);

      hero.style.setProperty("--media-y", `${y * MEDIA_LAG}px`);
      hero.style.setProperty("--media-scale", `${1 + progress * MAX_SCALE}`);

      /* On phones the copy stays put and stays legible — drifting and
         fading it just made the hero text look broken while scrolling. */
      if (small.matches) {
        hero.style.setProperty("--copy-y", "0px");
        hero.style.setProperty("--copy-o", "1");
        return;
      }
      hero.style.setProperty("--copy-y", `${y * COPY_LAG}px`);
      hero.style.setProperty("--copy-o", `${Math.max(1 - progress * 1.7, 0)}`);
    };

    const onScroll = () => {
      if (!frame && visible) frame = requestAnimationFrame(write);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "100px" }
    );
    observer.observe(hero);

    write();
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
      ref={heroRef}
      className={`${styles.hero} ${ready ? styles.ready : ""}`}
      aria-label="Fondue Flame"
    >
      <div className={styles.media}>
        <video
          ref={videoRef}
          className={styles.video}
          poster="/hero/hero-poster.jpg"
          preload="auto"
          muted
          loop
          playsInline
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        >
          {/* WebM first — ~40% lighter where it is supported */}
          <source src="/hero/hero-loop.webm" type="video/webm" />
          <source src="/hero/hero-loop.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={styles.wash} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.rise}`} style={{ "--d": "150ms" }}>
            The Chocolate Fondue Experience
          </p>

          <h1 className={styles.headline}>
            {HEADLINE.map((line, index) => (
              <span key={line} className={styles.line}>
                <span
                  className={styles.lineInner}
                  style={{ "--d": `${300 + index * 90}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "500ms" }}>
            A beautifully simple chocolate fondue experience, created for sharing.
          </p>

          <p className={`${styles.meta} ${styles.rise}`} style={{ "--d": "580ms" }}>
            <span className={styles.metaRule} aria-hidden="true" />
            Made for 2 to 3 people
          </p>

          <div className={`${styles.actions} ${styles.rise}`} style={{ "--d": "650ms" }}>
            <Link href="/#experience" className={styles.ctaPrimary}>
              Discover the Experience
            </Link>
            <Link href="/wholesale" className={styles.ctaGhost}>
              Wholesale
              <span className={styles.ctaArrow} aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>

   
    </section>
  );
}

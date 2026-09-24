"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./ShareMoment.module.css";

const HEADLINE = ["Made for more", "than chocolate."];

/* The frame lags the page by ~26px across the section */
const DRIFT = 26;

export default function ShareMoment() {
  const sectionRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* --- Reveal once the frame is properly in view ------------------- */
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
      { threshold: 0.22 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* --- Almost imperceptible parallax ------------------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const small = window.matchMedia("(max-width: 767px)");
    let frame = 0;
    let visible = false;

    const write = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const span = rect.height + window.innerHeight || 1;
      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / span, 0),
        1
      );
      const range = small.matches ? DRIFT * 0.45 : DRIFT;
      section.style.setProperty("--drift", `${(progress - 0.5) * -2 * range}px`);
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
      aria-labelledby="moment-heading"
    >
      <div className={styles.media}>
        {/* Art-directed, not just resized: the wide crop holds its negative
            space on the left, the tall one holds it above. A <picture>
            means only the matching file is ever downloaded. */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/moment/share-tall.jpg" />
          <img
            src="/moment/share-wide.jpg"
            alt="Two people sharing the Fondue Flame at a candlelit table, one dipping a strawberry into the melted chocolate"
            width={2048}
            height={1152}
            decoding="async"
            className={styles.photo}
          />
        </picture>
      </div>

      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.washFoot} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.rise}`} style={{ "--d": "140ms" }}>
            Share the Moment
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="moment-heading" className={styles.headline}>
            {HEADLINE.map((line, index) => (
              <span key={line} className={styles.line}>
                <span
                  className={styles.lineInner}
                  style={{ "--d": `${300 + index * 100}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "600ms" }}>
            Date nights, celebrations, dinner tables and quiet evenings in.
            Fondue Flame turns sharing chocolate into a moment worth remembering.
          </p>

          
          <div className={`${styles.ctaRow} ${styles.rise}`} style={{ "--d": "880ms" }}>
            <Link href="/#experience" className={styles.cta}>
              Create the moment
              <span className={styles.ctaArrow} aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>

      <p className={styles.caption}>Candlelight / Chocolate / Connection</p>
    </section>
  );
}

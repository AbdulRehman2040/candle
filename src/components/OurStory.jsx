"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./OurStory.module.css";

const HEADLINE = ["It started with", "a simple question."];

const STORY = [
  "Inspired by the warmth of candlelight and the joy of sharing chocolate fondue, we set out to create an experience that combines both.",
];

/* The photograph drifts ~24px across the section — almost unnoticed */
const DRIFT = 24;

export default function OurStory() {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [quoteLit, setQuoteLit] = useState(false);

  /* --- Section reveal ---------------------------------------------- */
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
      { threshold: 0.16 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* --- The quote lights up as it reaches the middle of the screen --- */
  useEffect(() => {
    const quote = quoteRef.current;
    if (!quote) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setQuoteLit(true);
          observer.disconnect();
        }
      },
      /* A band across the centre of the viewport */
      { rootMargin: "-38% 0px -38% 0px" }
    );
    observer.observe(quote);
    return () => observer.disconnect();
  }, []);

  /* --- Gentle parallax inside the frame ---------------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reduced = window.matchMedia("(max-width: 1023px)");
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
      const range = reduced.matches ? DRIFT * 0.5 : DRIFT;
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
      id="our-story"
      className={`${styles.section} ${ready ? styles.ready : ""}`}
      aria-labelledby="our-story-heading"
    >
      <p className={styles.ghost} aria-hidden="true">
        01
      </p>

      <div className={styles.inner}>
        <div className={styles.visual}>
          <div className={styles.frame}>
            <Image
              src="/story/origin-new.jpg"
              alt="The Fondue Flame ceramic candle resting in its gift box, the brand name printed on the front"
              width={1500}
              height={1500}
              sizes="(max-width: 1023px) 92vw, 54vw"
              className={styles.photo}
            />
          </div>
        </div>

        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.rise}`} style={{ "--d": "120ms" }}>
            Our Story
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="our-story-heading" className={styles.headline}>
            {HEADLINE.map((line, index) => (
              <span key={line} className={styles.line}>
                <span
                  className={styles.lineInner}
                  style={{ "--d": `${260 + index * 90}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <blockquote
            ref={quoteRef}
            className={`${styles.quote} ${styles.rise} ${
              quoteLit ? styles.quoteLit : ""
            }`}
            style={{ "--d": "520ms" }}
          >
            <span className={styles.quoteRule} aria-hidden="true" />
            <p className={styles.quoteText}>
              “What if a candle could bring people together in a completely new
              way?”
            </p>
          </blockquote>

          <div className={styles.story}>
            {STORY.map((para, index) => (
              <p
                key={para.slice(0, 24)}
                className={`${styles.para} ${styles.rise}`}
                style={{ "--d": `${660 + index * 130}ms` }}
              >
                {para}
              </p>
            ))}
          </div>

          

        </div>
      </div>
    </section>
  );
}

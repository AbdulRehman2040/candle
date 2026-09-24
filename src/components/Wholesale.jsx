"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Wholesale.module.css";

const HEADLINE = ["Bring Fondue Flame", "to your customers."];

const POINTS = [
  {
    num: "01",
    title: "Distinctive",
    text: "A memorable concept designed to stand apart on shelf and in-store.",
  },
  {
    num: "02",
    title: "Giftable",
    text: "Premium presentation makes Fondue Flame naturally suited to gifting and special occasions.",
  },
  {
    num: "03",
    title: "Experience-led",
    text: "More than a product. An intimate chocolate experience designed to be shared.",
  },
];

/* The photograph drifts ~30px across the section */
const DRIFT = 30;

export default function Wholesale() {
  const sectionRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* --- Reveal once ------------------------------------------------- */
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
      { threshold: 0.15 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* --- Subtle drift on the photograph ------------------------------ */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const small = window.matchMedia("(max-width: 1023px)");
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
      const range = small.matches ? DRIFT * 0.5 : DRIFT;
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
      id="stockists"
      className={`${styles.section} ${ready ? styles.ready : ""}`}
      aria-labelledby="wholesale-heading"
    >
      {/* The brand mark, almost subliminal */}
      <svg
        className={styles.mark}
        viewBox="0 0 120 170"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M60 4C60 42 96 60 96 100c0 26-16 46-36 46S24 126 24 100C24 74 44 62 52 40c2 22 18 26 18 48 0 14-8 22-16 24 14 2 26-10 26-28C80 58 66 36 60 4Z"
          fill="#e3ac83"
        />
      </svg>

      <div className={styles.inner}>
        <div className={styles.visual}>
          <div className={styles.frame}>
            <Image
              src="/wholesale/set.jpg"
              alt="The Fondue Flame gift box opened to show the ceramic fondue candle in its insert, beside the brand card and a pouch of chocolate callets"
              width={928}
              height={1152}
              sizes="(max-width: 1023px) 92vw, 50vw"
              className={styles.photo}
            />
          </div>
          <p className={styles.label}>
            For retailers
            <br />
            Hospitality
            <br />
            &amp; selected partners
          </p>
        </div>

        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.rise}`} style={{ "--d": "120ms" }}>
            Wholesale
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="wholesale-heading" className={styles.headline}>
            {HEADLINE.map((line, index) => (
              <span key={line} className={styles.line}>
                <span
                  className={styles.lineInner}
                  style={{ "--d": `${260 + index * 100}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "540ms" }}>
            Fondue Flame combines thoughtful presentation, candlelight and
            chocolate into a distinctive shared experience designed for 2 to 3
            people.
          </p>
          <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "660ms" }}>
            We’re building relationships with selected retailers, hospitality
            businesses and wholesale partners.
          </p>

          <ol className={styles.points}>
            {POINTS.map((item, index) => (
              <li
                key={item.num}
                className={`${styles.point} ${styles.rise}`}
                style={{ "--d": `${800 + index * 130}ms` }}
              >
                <p className={styles.pointHead}>
                  <span className={styles.pointNum}>{item.num}</span>
                  <span className={styles.pointTitle}>{item.title}</span>
                </p>
                <p className={styles.pointText}>{item.text}</p>
              </li>
            ))}
          </ol>

          <div className={`${styles.actions} ${styles.rise}`} style={{ "--d": "1220ms" }}>
            <Link href="/wholesale" className={styles.ctaPrimary}>
              Become a stockist
              <span className={styles.ctaArrow} aria-hidden="true">
                &rarr;
              </span>
            </Link>
            <Link href="/wholesale#enquiry" className={styles.ctaGhost}>
              Wholesale enquiries
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <p className={`${styles.micro} ${styles.rise}`} style={{ "--d": "1340ms" }}>
            Interested in stocking Fondue Flame? Tell us a little about your
            business and our team will be in touch.
          </p>
        </div>
      </div>
    </section>
  );
}

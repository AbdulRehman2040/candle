"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Experience.module.css";

const STAGES = [
  {
    num: "01",
    label: "Light",
    text: "Begin with the warmth of candlelight.",
    src: "/experience/light.jpg",
    alt: "A hand lowering a lit match to the tealight at the centre of the Fondue Flame dish",
  },
  {
    num: "02",
    label: "Melt",
    text: "Let the chocolate slowly become smooth and indulgent.",
    src: "/experience/melt.jpg",
    alt: "Chocolate melting into a glossy pool in the well around the lit centre candle",
  },
  {
    num: "03",
    label: "Dip",
    text: "Choose strawberries, fruit, marshmallows or your favourite treats.",
    src: "/experience/dip.jpg",
    alt: "A strawberry on a slim skewer entering the melted chocolate",
  },
  {
    num: "04",
    label: "Share",
    text: "An experience created for 2 to 3 people to enjoy together.",
    src: "/experience/share.jpg",
    alt: "Two people reaching in with skewers to share the Fondue Flame at a candlelit table",
  },
];

const CLOSING = ["A simple ritual,", "made to be shared."];

export default function Experience() {
  const sectionRef = useRef(null);
  const closingRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [closingReady, setClosingReady] = useState(false);

  /* --- All four stages reveal together, lightly staggered ---------- */
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
      { threshold: 0.12 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* --- The closing statement reveals on its own -------------------- */
  useEffect(() => {
    const node = closingRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setClosingReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className={`${styles.section} ${ready ? styles.ready : ""}`}
      aria-labelledby="experience-heading"
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            The Experience
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="experience-heading" className={styles.headline}>
            Light. Melt.
            
            Dip. Share.
          </h2>
        </div>

        <ol className={styles.steps}>
          {STAGES.map((item, index) => (
            <li
              key={item.num}
              className={styles.step}
              style={{ "--d": `${index * 120}ms` }}
            >
              <div className={styles.frame}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={928}
                  height={1152}
                  sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 24vw"
                  className={styles.shot}
                />
              </div>
              <p className={styles.stepHead}>
                <span className={styles.stepNum}>{item.num}</span>
                <span className={styles.stepLabel}>{item.label}</span>
              </p>
              <p className={styles.stepText}>{item.text}</p>
            </li>
          ))}
        </ol>
      </div>

  
    </section>
  );
}

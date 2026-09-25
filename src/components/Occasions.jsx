"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Occasions.module.css";

const ITEMS = [
  {
    num: "01",
    name: "Celebrations & Weddings",
    note: "A warm centrepiece down a long table, from receptions to anniversaries.",
    src: "/occasions/celebrations.jpg",
    alt: "An elegant wedding table set with candles and flowers",
  },
  {
    num: "02",
    name: "Dinner Parties",
    note: "Something to gather around once the plates are cleared.",
    src: "/occasions/dinners.jpg",
    alt: "Friends sharing a fondue dinner by a fireplace",
  },
  {
    num: "03",
    name: "Birthdays & Gatherings",
    note: "A shared centrepiece that gets everyone around the table talking.",
    src: "/occasions/hen.jpg",
    alt: "Friends laughing around a candlelit table set for a celebration",
  },
  {
    num: "04",
    name: "Christmas",
    note: "Candlelight, chocolate and the slow part of the evening.",
    src: "/occasions/christmas.jpg",
    alt: "A Christmas table dressed with pine, candles and neutral linen",
  },
  {
    num: "05",
    name: "Fundraisers & Community Events",
    note: "Simple to set up, simple to serve, and it draws people in.",
    src: "/occasions/fundraisers.jpg",
    alt: "A community hall trestle table with Fondue Flame dishes and bowls of fruit being shared",
  },
  {
    num: "06",
    name: "Quiet Evenings In",
    note: "Two people, a little chocolate and no rush.",
    src: "/occasions/evenings.jpg",
    alt: "Two glasses and candles beside a lit fireplace on a quiet evening",
  },
];

const MORE = [
  "Corporate events",
  "Valentine's",
  "Baby showers",
  "Gifting",
];

export default function Occasions() {
  const sectionRef = useRef(null);
  const [ready, setReady] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      id="occasions"
      className={`${styles.section} ${ready ? styles.ready : ""}`}
      aria-labelledby="occasions-heading"
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            Occasions
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="occasions-heading" className={styles.headline}>
            More than a date night.
          </h2>

          <p className={styles.lead}>
            Fondue Flame works as well down a long celebration table as it does
            on a side table for two. One warm, shareable centrepiece for
            weddings, dinners, fundraisers and quiet nights in.
          </p>
        </div>

        <ol className={styles.grid}>
          {ITEMS.map((item, index) => (
            <li
              key={item.num}
              className={styles.item}
              style={{ "--d": `${index * 130}ms` }}
            >
              <div className={styles.card}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={1600}
                  sizes="(max-width: 719px) 92vw, (max-width: 1023px) 46vw, 31vw"
                  className={styles.shot}
                />
                <span className={styles.scrim} aria-hidden="true" />
                <div className={styles.caption}>
                  <p className={styles.capHead}>
                    <span className={styles.num}>{item.num}</span>
                    <span className={styles.name}>{item.name}</span>
                  </p>
                  <p className={styles.note}>{item.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.more}>
          <p className={styles.moreLabel}>Also for</p>
          <ul className={styles.moreList}>
            {MORE.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

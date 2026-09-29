"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./WhereToBuy.module.css";
import { mapUrl, telHref, monogram } from "@/data/stockists";

const HEADLINE = ["Find it near you."];

/* Tonal variants of the brand copper — enough to separate the cards
   without turning the row into a colour chart. */
const TONES = ["#8a5430", "#a85c31", "#6f4123"];

/* `regions` comes from the database (see src/lib/stockists.js), falling
   back to the static list. Three cards is the whole section — one shop
   per region so the row shows geographic spread, not three from one city. */
export default function WhereToBuy({ regions = [], placeholder = false }) {
  const featured = regions
    .slice(0, 3)
    .map((region) => region.shops?.[0])
    .filter(Boolean);

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
      { threshold: 0.14 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="where-to-buy"
      className={`${styles.section} ${ready ? styles.ready : ""}`}
      aria-labelledby="where-to-buy-heading"
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={`${styles.eyebrow} ${styles.rise}`} style={{ "--d": "100ms" }}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            Where to Buy
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>

          <h2 id="where-to-buy-heading" className={styles.headline}>
            {HEADLINE.map((line, index) => (
              <span key={line} className={styles.line}>
                <span
                  className={styles.lineInner}
                  style={{ "--d": `${240 + index * 90}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "440ms" }}>
            Fondue Flame is carried by independent shops across the UK. Here are
            a few of them.
          </p>
        </div>

        <ul className={styles.grid}>
          {featured.map((shop, index) => (
            <li
              key={`${shop.name}-${shop.postcode}`}
              className={`${styles.item} ${styles.rise}`}
              style={{ "--d": `${580 + index * 110}ms`, "--tone": TONES[index] }}
            >
              <article className={styles.card}>
                {/* Tab: logo and shop name on the filled ground */}
                <header className={styles.tab}>
                  <span className={styles.logoCircle}>
                    {shop.logo ? (
                      <Image
                        src={shop.logo}
                        alt=""
                        width={96}
                        height={96}
                        className={styles.logo}
                      />
                    ) : (
                      <span className={styles.monogram} aria-hidden="true">
                        {monogram(shop.name)}
                      </span>
                    )}
                  </span>
                  <span className={styles.tabText}>
                    <span className={styles.shopName}>{shop.name}</span>
                    <span className={styles.region}>{shop.town}</span>
                  </span>
                </header>

                {/* Body: the details */}
                <div className={styles.body}>
                  <address className={styles.address}>
                    <span>{shop.street}</span>
                    <span>{shop.town}</span>
                    <span className={styles.postcode}>{shop.postcode}</span>
                  </address>

                  <a className={styles.phone} href={telHref(shop.phone)}>
                    <span className={styles.srOnly}>Call {shop.name} on </span>
                    {shop.phone}
                  </a>

                  {placeholder && shop.note && (
                    <p className={styles.note}>{shop.note}</p>
                  )}

                  <a
                    className={styles.mapLink}
                    href={mapUrl(shop)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Directions
                    <span className={styles.srOnly}> to {shop.name}</span>
                    <span className={styles.arrow} aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className={`${styles.actions} ${styles.rise}`} style={{ "--d": "960ms" }}>
          <Link href="/wholesale" className={styles.ctaGhost}>
            Stock Fondue Flame
          </Link>
        </div>
      </div>
    </section>
  );
}

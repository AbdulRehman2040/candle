"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

/* Only destinations that exist: the homepage, its sections, stockists
   and wholesale. */
const LINKS = [
  { label: "The Experience", href: "/#experience" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Occasions", href: "/#occasions" },
  { label: "Where to Buy", href: "/stockists" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Enquiries", href: "/wholesale#enquiry" },
];

export default function Footer() {
  const footerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`${styles.footer} ${ready ? styles.ready : ""}`}
    >
      <div className={styles.inner}>
        {/* Row one: the mark and the links, on one baseline */}
        <div className={`${styles.top} ${styles.rise}`} style={{ "--d": "120ms" }}>
          <Link href="/" className={styles.brand} aria-label="Fondue Flame, home">
            <Image
              src="/logo-mark.png"
              alt="Fondue Flame"
              width={1218}
              height={481}
              sizes="280px"
              className={styles.brandLogo}
            />
          </Link>

          <nav aria-label="Footer">
            <ul className={styles.nav}>
              {LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Row two: legal, split to the edges */}
        <div className={`${styles.bottom} ${styles.rise}`} style={{ "--d": "220ms" }}>
          <p className={styles.copyright}>&copy; {year} Fondue Flame</p>
          <p className={styles.credit}>
            Designed by{" "}
            <a
              href="https://websitelift.co.uk"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.creditLink}
            >
              WebsiteLift
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

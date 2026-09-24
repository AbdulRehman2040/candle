"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

/* Only destinations that exist: the homepage, its sections, and wholesale. */
const LINKS = [
  { label: "The Experience", href: "/#experience" },
  { label: "Our Story", href: "/#our-story" },
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
      <svg
        className={styles.cap}
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,100 L0,42 C250,6 540,2 840,28 C1090,50 1290,64 1440,58 L1440,100 Z"
          fill="#241511"
        />
      </svg>

      <div className={styles.inner}>
        <div className={`${styles.bar} ${styles.rise}`} style={{ "--d": "120ms" }}>
          <Link href="/" aria-label="Fondue Flame, home">
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

          <p className={styles.copyright}>&copy; {year} Fondue Flame Ltd</p>
        </div>
      </div>
    </footer>
  );
}

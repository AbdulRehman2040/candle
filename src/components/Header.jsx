"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "The Experience", href: "/#experience" },
  { label: "Occasions", href: "/#occasions" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Where to Buy", href: "/stockists" },
  { label: "Wholesale", href: "/wholesale" },
];

const WHOLESALE = { label: "Wholesale Enquiries", href: "/wholesale" };

/* Hysteresis keeps the state from flickering around the threshold */
const SCROLL_ENTER = 24;
const SCROLL_EXIT = 8;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  const isActive = useCallback(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  /* --- Scroll state: one rAF-throttled passive listener ------------ */
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled((was) => (was ? y > SCROLL_EXIT : y > SCROLL_ENTER));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* --- Close the panel on navigation ------------------------------- */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  /* --- Panel side effects: scroll lock, Escape, desktop breakpoint -- */
  useEffect(() => {
    if (!menuOpen) return;

    const { body } = document;
    const toggle = toggleRef.current;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);

    closeRef.current?.focus({ preventScroll: true });

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
      toggle?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  /* Only the homepage puts a hero behind the header. Everywhere else the
     bar starts solid, otherwise cream nav would sit on an ivory page. */
  const overHero = pathname === "/";
  const solid = !overHero || scrolled || menuOpen;

  return (
    <header
      className={`${styles.header} ${solid ? styles.solid : ""}`}
      data-state={solid ? "solid" : "top"}
    >
      <div className={styles.surface} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      {/* Utility strip — placeholder brand copy; collapses away on scroll */}
      

      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="Fondue Flame, home">
          {/* Two cuts of the mark, cross-faded with the bar. The dark one is
              a bolder cut and ~11% wider at equal height, so it renders at
              0.9x to keep both the same width through the fade. */}
          <Image
            src="/logo-mark.png"
            alt="Fondue Flame"
            width={1218}
            height={481}
            sizes="190px"
            priority
            className={styles.logoImg}
          />
          <Image
            src="/logo-mark-dark.png"
            alt=""
            aria-hidden="true"
            width={1218}
            height={432}
            sizes="190px"
            className={styles.logoImgDark}
          />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {NAV_LINKS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.link} ${active ? styles.active : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.ctaWrap}>
          <Link href={WHOLESALE.href} className={styles.cta}>
            {WHOLESALE.label}
          </Link>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={`${styles.toggle} ${menuOpen ? styles.toggleOpen : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="ff-mobile-menu"
        >
          <span className={styles.bars} aria-hidden="true">
            <span className={styles.bar} />
            <span className={styles.bar} />
          </span>
        </button>
      </div>

      <div
        id="ff-mobile-menu"
        ref={panelRef}
        className={`${styles.panel} ${menuOpen ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
      >
        {/* The panel carries its own bar, so there is always an obvious
            way out rather than a hamburger that has quietly become an X. */}
        <div className={styles.panelBar}>
          <Link href="/" className={styles.panelLogo} aria-label="Fondue Flame, home">
            <Image
              src="/logo-mark-dark.png"
              alt="Fondue Flame"
              width={1218}
              height={432}
              sizes="170px"
            />
          </Link>
          <button
            ref={closeRef}
            type="button"
            className={styles.panelClose}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <span className={styles.closeMark} aria-hidden="true" />
            <span className={styles.closeLabel}>Close</span>
          </button>
        </div>

        <nav className={styles.panelNav} aria-label="Mobile">
          <ul className={styles.panelList}>
            {NAV_LINKS.map((item, index) => {
              const active = isActive(item.href);
              return (
                <li
                  key={item.href}
                  className={styles.panelItem}
                  style={{ "--i": index }}
                >
                  <Link
                    href={item.href}
                    className={`${styles.panelLink} ${active ? styles.panelActive : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            <li
              className={`${styles.panelItem} ${styles.panelDivider}`}
              style={{ "--i": NAV_LINKS.length }}
            >
              <Link
                href={WHOLESALE.href}
                className={`${styles.panelLink} ${styles.panelCta} ${
                  isActive(WHOLESALE.href) ? styles.panelActive : ""
                }`}
                aria-current={isActive(WHOLESALE.href) ? "page" : undefined}
              >
                {WHOLESALE.label}
              </Link>
            </li>
          </ul>
        </nav>

        <p className={styles.panelFoot}>Share the Experience</p>
      </div>
    </header>
  );
}

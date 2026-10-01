"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./StockistList.module.css";
import { mapUrl, telHref, monogram } from "@/data/stockists";

function ShopCard({ shop }) {
  const website = shop.website
    ? shop.website.startsWith("http")
      ? shop.website
      : `https://${shop.website}`
    : null;

  return (
    <li className={styles.item}>
      <article className={styles.card}>
        <div className={styles.head}>
          <span className={styles.logoBox}>
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt=""
                width={120}
                height={120}
                className={styles.logo}
                unoptimized
              />
            ) : (
              <span className={styles.monogram} aria-hidden="true">
                {monogram(shop.name)}
              </span>
            )}
          </span>
          <h2 className={styles.shopName}>{shop.name}</h2>
        </div>

        <address className={styles.address}>
          <span>{shop.street}</span>
          <span>{shop.town}</span>
          <span className={styles.postcode}>{shop.postcode}</span>
        </address>

        {shop.phone && (
          <a className={styles.phone} href={telHref(shop.phone)}>
            <span className={styles.srOnly}>Call {shop.name} on </span>
            {shop.phone}
          </a>
        )}

        <div className={styles.actions}>
          <a
            className={styles.btn}
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

          {website && (
            <a
              className={styles.btn}
              href={website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
              <span className={styles.srOnly}> for {shop.name}</span>
              <span className={styles.arrow} aria-hidden="true">
                &rarr;
              </span>
            </a>
          )}
        </div>
      </article>
    </li>
  );
}

/* Every shop here comes from Supabase, managed at /admin. */
export default function StockistList({ shops = [] }) {
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /* Match on shop name, town or postcode — the three things someone
     actually types when looking for somewhere near them. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((shop) =>
      [shop.name, shop.town, shop.postcode].join(" ").toLowerCase().includes(q)
    );
  }, [query, shops]);

  /* No shops at all — a different situation from "nothing matched" */
  if (shops.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Stockists coming soon.</p>
        <p className={styles.emptyText}>
          We are building our list of shops. In the meantime,{" "}
          <Link href="/wholesale" className={styles.inlineLink}>
            get in touch
          </Link>{" "}
          if you would like to stock Fondue Flame.
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`${styles.root} ${ready ? styles.ready : ""}`}>
      <div className={styles.searchRow}>
        <label className={styles.searchLabel} htmlFor="stockist-search">
          Search by shop, town or postcode
        </label>
        <div className={styles.searchField}>
          <input
            id="stockist-search"
            type="search"
            className={styles.search}
            placeholder="e.g. Manchester, or M1 2AB"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQuery("")}
            >
              Clear
            </button>
          )}
        </div>
        <p className={styles.count} aria-live="polite">
          {query
            ? `${filtered.length} of ${shops.length} ${
                shops.length === 1 ? "stockist" : "stockists"
              }`
            : `${shops.length} ${shops.length === 1 ? "stockist" : "stockists"}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No stockists match that search.</p>
          <p className={styles.emptyText}>
            Try a town or a postcode area, or{" "}
            <button
              type="button"
              className={styles.inlineButton}
              onClick={() => setQuery("")}
            >
              see every stockist
            </button>
            .
          </p>
        </div>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((shop) => (
            <ShopCard key={shop.id || `${shop.name}-${shop.postcode}`} shop={shop} />
          ))}
        </ul>
      )}

      <aside className={styles.retailer}>
        <p className={styles.retailerText}>
          Run a shop and would like to stock Fondue Flame?
        </p>
        <Link href="/wholesale" className={styles.retailerCta}>
          Wholesale enquiries
          <span className={styles.arrow} aria-hidden="true">
            &rarr;
          </span>
        </Link>
      </aside>
    </div>
  );
}

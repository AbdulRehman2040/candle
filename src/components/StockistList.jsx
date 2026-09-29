"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./StockistList.module.css";
import { ONLINE, mapUrl, telHref, monogram } from "@/data/stockists";

function ShopRow({ shop }) {
  return (
    <li className={styles.card}>
      {/* Logo, or the shop's initials until a logo is supplied */}
      <div className={styles.logoWrap}>
        {shop.logo ? (
          <Image
            src={shop.logo}
            alt=""
            width={120}
            height={120}
            className={styles.logo}
          />
        ) : (
          <span className={styles.monogram} aria-hidden="true">
            {monogram(shop.name)}
          </span>
        )}
      </div>

      <div className={styles.details}>
        <p className={styles.shopName}>{shop.name}</p>

        <address className={styles.address}>
          {shop.street}, {shop.town}, <span className={styles.postcode}>{shop.postcode}</span>
        </address>

        {shop.note && <p className={styles.note}>{shop.note}</p>}
      </div>

      <div className={styles.actions}>
        <a className={styles.phone} href={telHref(shop.phone)}>
          <span className={styles.srOnly}>Call {shop.name} on </span>
          {shop.phone}
        </a>
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
    </li>
  );
}

/* `regions` comes from the database (src/lib/stockists.js); `placeholder`
   is true only while it is falling back to the static sample list. */
export default function StockistList({ regions = [], placeholder = false }) {
  const TOTAL_SHOPS = regions.reduce((n, r) => n + r.shops.length, 0);

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
    if (!q) return regions;
    return regions.map((region) => ({
      ...region,
      shops: region.shops.filter((shop) =>
        [shop.name, shop.town, shop.postcode]
          .join(" ")
          .toLowerCase()
          .includes(q)
      ),
    })).filter((region) => region.shops.length > 0);
  }, [query, regions]);

  const shown = filtered.reduce((n, r) => n + r.shops.length, 0);

  return (
    <div ref={rootRef} className={`${styles.root} ${ready ? styles.ready : ""}`}>
      {placeholder && (
        <p className={styles.notice} role="status">
          <strong className={styles.noticeTitle}>Placeholder listings.</strong>{" "}
          The shops below are invented examples so this page can be reviewed.
          Replace them with the real stockist list before going live.
        </p>
      )}

      {/* --- Search ---------------------------------------------------- */}
      <div className={styles.searchRow}>
        <label className={styles.searchLabel} htmlFor="stockist-search">
          Search by shop, town or postcode
        </label>
        <div className={styles.searchField}>
          <input
            id="stockist-search"
            type="search"
            className={styles.search}
            placeholder="e.g. Manchester, or M0 0AA"
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
            ? `${shown} of ${TOTAL_SHOPS} ${
                TOTAL_SHOPS === 1 ? "stockist" : "stockists"
              }`
            : `${TOTAL_SHOPS} ${TOTAL_SHOPS === 1 ? "stockist" : "stockists"}`}
        </p>
      </div>

      {/* --- Results --------------------------------------------------- */}
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
        filtered.map((region) => (
          <section
            key={region.id}
            id={region.id}
            className={styles.region}
            aria-labelledby={`region-${region.id}`}
          >
            <h2 id={`region-${region.id}`} className={styles.regionName}>
              {region.name}
            </h2>

            <ul className={styles.cards}>
              {region.shops.map((shop) => (
                <ShopRow key={`${shop.name}-${shop.postcode}`} shop={shop} />
              ))}
            </ul>
          </section>
        ))
      )}

      {/* --- Online --------------------------------------------------- */}
      <section className={styles.online} aria-labelledby="online-heading">
        <h2 id="online-heading" className={styles.regionName}>
          Order online
        </h2>
        <ul className={styles.cards}>
          {ONLINE.map((seller) => (
            <li key={seller.name} className={styles.card}>
              <div className={styles.logoWrap}>
                <span className={styles.monogram} aria-hidden="true">
                  {monogram(seller.name)}
                </span>
              </div>
              <div className={styles.details}>
                <p className={styles.shopName}>{seller.name}</p>
                <p className={styles.note}>{seller.detail}</p>
              </div>
              <div className={styles.actions}>
                {seller.href ? (
                  <a
                    className={styles.mapLink}
                    href={seller.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit store
                    <span className={styles.arrow} aria-hidden="true">
                      &rarr;
                    </span>
                  </a>
                ) : (
                  /* No URL yet — plain text rather than a dead link */
                  <span className={styles.pending}>Link to follow</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Retailer prompt ------------------------------------------- */}
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

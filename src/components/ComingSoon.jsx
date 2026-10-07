import Image from "next/image";
import Link from "next/link";
import styles from "./ComingSoon.module.css";

/* Shown on Where to Buy while the "Coming soon" switch is on in the
   dashboard, in place of the stockist list. */
export default function ComingSoon() {
  return (
    <section className={styles.wrap} aria-labelledby="coming-soon-title">
      <div className={styles.text}>
        <p className={styles.eyebrow}>Where to Buy</p>
        <h1 id="coming-soon-title" className={styles.title}>
          Coming <em>soon.</em>
        </h1>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.lead}>
          Fondue Flame is finding its way onto the shelves of independent shops
          across the UK. Our list of stockists will appear here very soon.
        </p>
        <p className={styles.sub}>
          Run a shop and would like to stock us? We would love to hear from you.
        </p>
        <div className={styles.actions}>
          <Link href="/wholesale" className={styles.primary}>
            Become a stockist
          </Link>
          <Link href="/" className={styles.secondary}>
            Back to home
          </Link>
        </div>
      </div>

      <div className={styles.media}>
        <div className={styles.frame}>
          <Image
            src="/story/product.jpg"
            alt="A Fondue Flame set with a lit candle and a chocolate-dipped strawberry"
            fill
            sizes="(min-width: 900px) 40vw, 90vw"
            className={styles.img}
            priority
          />
        </div>
        <span className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          Stockists launching soon
        </span>
      </div>
    </section>
  );
}

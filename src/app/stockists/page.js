import StockistList from "@/components/StockistList";
import styles from "./stockists.module.css";
import { getStockists } from "@/lib/stockists";

export const metadata = {
  title: "Where to Buy | Fondue Flame",
  description:
    "Find a shop near you carrying Fondue Flame, or order online. Independent stockists across the UK.",
};

/* Re-read the stockist list at most once a minute, so shops added in the
   dashboard appear on the site without a redeploy. */
export const revalidate = 60;

export default async function StockistsPage() {
  const { shops } = await getStockists();

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Where to Buy</p>
        <h1 className={styles.title}>Find Fondue Flame near you.</h1>
        <p className={styles.lead}>
          Fondue Flame is carried by independent shops across the UK. Search by
          town or postcode to find your nearest stockist, or order online.
        </p>
      </section>

      <section className={styles.body} aria-label="Stockists">
        <StockistList shops={shops} />
      </section>
    </div>
  );
}

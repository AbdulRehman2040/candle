import Image from "next/image";
import WholesaleForm from "@/components/WholesaleForm";
import styles from "./wholesale.module.css";

export const metadata = {
  title: "Wholesale Enquiries | Fondue Flame",
  description:
    "Bring Fondue Flame to your customers. Tell us about your business and we will be in touch to discuss wholesale opportunities.",
};

const POINTS = [
  {
    num: "01",
    title: "Retailers",
    text: "Independent stores, gift retailers and other suitable retail partners.",
  },
  {
    num: "02",
    title: "Hospitality",
    text: "Selected hospitality businesses looking to offer a distinctive shared experience.",
  },
  {
    num: "03",
    title: "Wholesale Partners",
    text: "Businesses interested in introducing Fondue Flame to their customers.",
  },
];

export default function WholesalePage() {
  return (
    <>
      <div className={styles.page}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Wholesale</p>
          <h1 className={styles.title}>Bring Fondue Flame to your customers.</h1>
          <p className={styles.lead}>
            Interested in stocking Fondue Flame? Tell us a little about your
            business and we’ll be in touch.
          </p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>
            We welcome enquiries from retailers, hospitality businesses and
            selected wholesale partners.
          </p>
        </section>

        <div className={styles.main}>
          <aside className={styles.aside}>
            <h2 className={styles.asideTitle}>Become a Stockist</h2>
            <p className={styles.asideText}>
              Fondue Flame is a premium chocolate fondue experience created
              around candlelight, connection and sharing.
            </p>
            <p className={styles.asideText}>
              Complete the enquiry form and tell us about your business. We’ll
              review your details and get in touch to discuss wholesale
              opportunities.
            </p>

            <ol className={styles.points}>
              {POINTS.map((item) => (
                <li key={item.num} className={styles.point}>
                  <p className={styles.pointHead}>
                    <span className={styles.pointNum}>{item.num}</span>
                    <span className={styles.pointTitle}>{item.title}</span>
                  </p>
                  <p className={styles.pointText}>{item.text}</p>
                </li>
              ))}
            </ol>

            <Image
              src="/wholesale/set.jpg"
              alt="The Fondue Flame gift box opened to show the ceramic fondue candle in its insert, beside the brand card and a pouch of chocolate callets"
              width={928}
              height={1152}
              sizes="(max-width: 1023px) 92vw, 37vw"
              className={styles.asidePhoto}
            />
          </aside>

          <div id="enquiry">
            <WholesaleForm />
          </div>
        </div>
      </div>

      <section className={styles.closing}>
        <p className={styles.closingEyebrow}>Share the Experience</p>
        <p className={styles.closingTitle}>
          Something worth sharing. Something worth stocking.
        </p>
      </section>
    </>
  );
}

import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Experience from "@/components/Experience";
import OurStory from "@/components/OurStory";
import ShareMoment from "@/components/ShareMoment";
import Wholesale from "@/components/Wholesale";

export default function Home() {
  return (
    <>
      <Hero />
      <Story />
      <Experience />

      {/* Chocolate into cream. A curve, not a long fade — a linear blend
          between these two ends up muddy grey through its middle. */}
      <div
        aria-hidden="true"
        className="relative h-[clamp(56px,7vw,124px)] w-full bg-[#241511]"
      >
        <svg
          className="absolute inset-0 block h-full w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 L1440,120 L1440,38 C1180,74 900,88 600,66 C360,48 160,26 0,8 Z"
            fill="#f5efe6"
          />
        </svg>
      </div>

      <OurStory />

      {/* Experience into opportunity: the lifestyle frame already fades to
          the wholesale ground colour, so these two meet with no seam. */}
      <ShareMoment />
      <Wholesale />

    </>
  );
}

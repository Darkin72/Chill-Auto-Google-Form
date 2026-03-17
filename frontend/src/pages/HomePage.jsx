import { useRef } from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import StatsSection from "../components/StatsSection";
import CTASection from "../components/CTASection";

export default function HomePage() {
  const howRef = useRef(null);
  const featRef = useRef(null);
  const ctaRef = useRef(null);

  const scrollTo = (ref) => {
    if (ref && ref.current)
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen text-gray-800">
      {/* ===== HERO ===== */}
      <HeroSection scrollTo={scrollTo} howRef={howRef} />

      {/* ===== FEATURES ===== */}
      <FeaturesSection scrollTo={scrollTo} ctaRef={ctaRef} featRef={featRef} />

      {/* ===== HOW IT WORKS ===== */}
      <HowItWorksSection howRef={howRef} />

      {/* ===== STATS / BENEFITS ===== */}
      <StatsSection />

      {/* ===== CTA ===== */}
      <CTASection ctaRef={ctaRef} scrollTo={scrollTo} featRef={featRef} />
    </div>
  );
}

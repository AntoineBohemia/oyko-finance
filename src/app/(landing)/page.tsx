import { Header } from "@/components/marketing/header-navigation/header";
import { BentoSection } from "./bento-section";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { FeaturesGrid } from "./features-grid";
import { Footer } from "./footer";
import { GradientBackground } from "./gradient-bg";
import { HeroSection } from "./hero-section";

export default function LandingPage() {
    return (
        <>
            <Header />
            <main>
                <GradientBackground variant="mesh" noise noiseOpacity={0.015} className="pt-16 md:pt-20">
                    <HeroSection />
                </GradientBackground>
                <BentoSection />
                <FeaturesGrid />
                <FaqSection />
                <CtaSection />
            </main>
            <Footer />
        </>
    );
}

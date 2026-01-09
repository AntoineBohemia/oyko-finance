import { Header } from "@/components/marketing/header-navigation/header";
import { CTAIPhoneMockup04 } from "@/components/marketing/cta/cta-iphone-mockup-04";
import { FaqSection } from "./faq-section";
import { FeaturesCarousel } from "./features-carousel";
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
                <FeaturesCarousel />
                <FeaturesGrid />
                <FaqSection />
                <CTAIPhoneMockup04 />
            </main>
            <Footer />
        </>
    );
}

"use client";

import { ArrowRight, PlayCircle } from "@untitledui/icons";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { Header } from "@/components/marketing/header-navigation/header";

export const HeroScreenMockup06 = () => {
    return (
        <div className="relative overflow-hidden bg-primary">
            {/* Background pattern */}
            <img
                alt="Grid of dots"
                aria-hidden="true"
                loading="lazy"
                src="https://www.untitledui.com/patterns/light/grid-dot-sm-desktop.svg"
                className="pointer-events-none absolute top-0 left-1/2 z-0 hidden max-w-none -translate-x-1/2 md:block dark:brightness-[0.2]"
            />
            <img
                alt="Grid of dots"
                aria-hidden="true"
                loading="lazy"
                src="https://www.untitledui.com/patterns/light/grid-dot-sm-mobile.svg"
                className="pointer-events-none absolute top-0 left-1/2 z-0 max-w-none -translate-x-1/2 md:hidden dark:brightness-[0.2]"
            />

            <Header />
            <section className="relative overflow-hidden py-16 md:pb-24">
                <div className="mx-auto grid max-w-container grid-cols-1 items-center justify-items-center gap-16 px-4 md:px-8 lg:grid-cols-2 lg:justify-items-start">
                    <div className="flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-left">
                        <a href="#" className="rounded-full outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
                            <BadgeGroup className="hidden md:flex" size="lg" addonText="We're hiring!" iconTrailing={ArrowRight} theme="light" color="brand">
                                Join our remote team
                            </BadgeGroup>
                            <BadgeGroup className="md:hidden" size="md" addonText="We're hiring!" iconTrailing={ArrowRight} theme="light" color="brand">
                                Join our remote team
                            </BadgeGroup>
                        </a>

                        <h1 className="mt-4 text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl">
                            Beautiful banking to grow smarter
                        </h1>
                        <p className="mt-4 max-w-lg text-lg text-balance text-tertiary md:mt-6 md:text-xl">
                            Powerful, self-serve product and growth analytics to help you budget, forecast, and save.
                        </p>
                        <div className="mt-8 flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start md:mt-12">
                            <Button iconLeading={PlayCircle} color="secondary" size="xl">
                                Demo
                            </Button>
                            <Button size="xl">Sign up</Button>
                        </div>
                    </div>

                    <div className="relative lg:h-full lg:min-h-177">
                        {/* Light mode image (hidden in dark mode) */}
                        <img
                            alt="Macbook Pro Screen Mockup"
                            className="inset-0 h-auto w-full max-w-none object-cover md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left dark:hidden"
                            src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp"
                        />
                        {/* Dark mode image (hidden in light mode) */}
                        <img
                            alt="Macbook Pro Screen Mockup"
                            className="inset-0 h-auto w-full max-w-none object-cover not-dark:hidden md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left"
                            src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-dark.webp"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

"use client";

import { ArrowRight, PlayCircle } from "@untitledui/icons";
import Link from "next/link";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden py-16 md:pb-24">
            <div className="mx-auto grid max-w-container grid-cols-1 items-center justify-items-center gap-16 px-4 md:px-8 lg:grid-cols-2 lg:justify-items-start">
                <div className="flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-left">
                    <Link href="#features">
                        <BadgeGroup className="hidden md:flex" size="lg" addonText="Nouveau" iconTrailing={ArrowRight} theme="light" color="brand">
                            Synchronisation bancaire
                        </BadgeGroup>
                        <BadgeGroup className="md:hidden" size="md" addonText="Nouveau" iconTrailing={ArrowRight} theme="light" color="brand">
                            Synchronisation bancaire
                        </BadgeGroup>
                    </Link>

                    <h1 className="mt-4 text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl">
                        Gérez vos finances personnelles simplement
                    </h1>
                    <p className="mt-4 max-w-lg text-lg text-balance text-tertiary md:mt-6 md:text-xl">
                        Suivez vos dépenses, gérez votre budget et faites grandir votre patrimoine. Tout en un seul endroit.
                    </p>
                    <div className="mt-8 flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start md:mt-12">
                        <Link href="/login">
                            <Button iconLeading={PlayCircle} color="secondary" size="xl">
                                Démo
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="xl">Commencer gratuitement</Button>
                        </Link>
                    </div>
                </div>

                <div className="relative lg:h-full lg:min-h-177">
                    {/* Light mode image (hidden in dark mode) */}
                    <img
                        alt="Dashboard de l'application Oyko"
                        className="inset-0 h-auto w-full max-w-none object-cover md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left dark:hidden"
                        src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp"
                    />
                    {/* Dark mode image (hidden in light mode) */}
                    <img
                        alt="Dashboard de l'application Oyko"
                        className="inset-0 h-auto w-full max-w-none object-cover not-dark:hidden md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left"
                        src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-dark.webp"
                    />
                </div>
            </div>
        </section>
    );
};

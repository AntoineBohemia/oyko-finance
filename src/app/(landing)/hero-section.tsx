"use client";

import { ArrowRight, PlayCircle } from "@untitledui/icons";
import Link from "next/link";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden pt-6 pb-12 md:py-16 md:pb-24">
            <div className="mx-auto grid max-w-container grid-cols-1 items-center justify-items-center gap-10 px-4 md:gap-16 md:px-8 lg:grid-cols-2 lg:justify-items-start">
                {/* Contenu texte */}
                <div className="flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-left">
                    {/* Badge - touch target amélioré */}
                    <Link href="#features" className="group -m-2 rounded-full p-2 active:opacity-80">
                        <BadgeGroup
                            className="hidden transition-transform duration-150 group-active:scale-[0.98] md:flex"
                            size="lg"
                            addonText="Nouveau"
                            iconTrailing={ArrowRight}
                            theme="light"
                            color="brand"
                        >
                            Synchronisation bancaire
                        </BadgeGroup>
                        <BadgeGroup
                            className="transition-transform duration-150 group-active:scale-[0.98] md:hidden"
                            size="md"
                            addonText="Nouveau"
                            iconTrailing={ArrowRight}
                            theme="light"
                            color="brand"
                        >
                            Synchronisation bancaire
                        </BadgeGroup>
                    </Link>

                    {/* Titre - taille mobile optimisée */}
                    <h1 className="mt-4 text-display-sm font-semibold text-primary md:text-display-lg lg:text-display-xl">
                        Gérez vos finances personnelles simplement
                    </h1>

                    {/* Sous-titre */}
                    <p className="mt-3 max-w-lg text-md text-tertiary md:mt-6 md:text-xl">
                        Suivez vos dépenses, gérez votre budget et faites grandir votre patrimoine. Tout en un seul endroit.
                    </p>

                    {/* CTA Buttons - row sur mobile, touch-friendly */}
                    <div className="mt-6 flex w-full flex-row items-stretch justify-center gap-3 md:mt-12 md:w-auto md:justify-start">
                        <Link href="/login" className="shrink-0">
                            <Button iconLeading={PlayCircle} color="secondary" size="lg" className="md:size-xl">
                                Démo
                            </Button>
                        </Link>
                        <Link href="/signup" className="shrink-0">
                            <Button size="lg" className="md:size-xl">
                                Commencer
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Image mockup */}
                <div className="relative w-full lg:h-full lg:min-h-177">
                    <img
                        alt="Dashboard de l'application Oyko"
                        className="inset-0 h-auto w-full max-w-none object-cover md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left dark:hidden"
                        src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-light.webp"
                    />
                    <img
                        alt="Dashboard de l'application Oyko"
                        className="inset-0 hidden h-auto w-full max-w-none object-cover md:h-90 md:w-auto lg:absolute lg:h-full lg:object-left dark:block"
                        src="https://www.untitledui.com/marketing/screen-mockups/mackbook-pro-screen-mockup-dark.webp"
                    />
                </div>
            </div>
        </section>
    );
};

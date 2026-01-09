"use client";

import Link from "next/link";
import { Button } from "@/components/base/buttons/button";

export const CtaSection = () => {
    return (
        <section className="relative bg-primary py-16 md:py-24">
            {/* Gradient de transition depuis la section précédente */}
            <div
                className="pointer-events-none absolute inset-x-0 -top-24 h-32"
                style={{
                    background: "linear-gradient(to bottom, transparent, var(--color-bg-primary) 70%)",
                }}
                aria-hidden="true"
            />

            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-12 md:rounded-3xl md:px-12 md:py-16 lg:px-16 lg:py-20">
                    {/* Background gradient decoration */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.15), transparent 50%)",
                        }}
                        aria-hidden="true"
                    />

                    <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
                        <h2 className="text-display-sm font-semibold text-white md:text-display-md lg:text-display-lg">
                            Prêt à reprendre le contrôle de vos finances ?
                        </h2>
                        <p className="mt-4 text-lg text-white/80 md:mt-5 md:text-xl">
                            Rejoignez des milliers d'utilisateurs qui gèrent leurs finances simplement avec Oyko. Gratuit, pour toujours.
                        </p>

                        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:mt-10">
                            <Link href="/signup">
                                <Button size="xl" color="secondary">
                                    Commencer gratuitement
                                </Button>
                            </Link>
                            <Link href="mailto:contact@oyko.fr">
                                <Button
                                    size="xl"
                                    color="link-gray"
                                    className="text-white/90 hover:text-white"
                                >
                                    Nous contacter
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

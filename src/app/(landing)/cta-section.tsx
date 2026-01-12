"use client";

import Link from "next/link";
import { Button } from "@/components/base/buttons/button";

export const CtaSection = () => {
    return (
        <section className="relative bg-primary py-12 md:py-24">
            {/* Gradient de transition */}
            <div
                className="pointer-events-none absolute inset-x-0 -top-24 h-32"
                style={{
                    background: "linear-gradient(to bottom, transparent, var(--color-bg-primary) 70%)",
                }}
                aria-hidden="true"
            />

            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-5 py-8 md:rounded-3xl md:px-12 md:py-16 lg:px-16 lg:py-20">
                    {/* Background gradient decoration */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.15), transparent 50%)",
                        }}
                        aria-hidden="true"
                    />

                    <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
                        <h2 className="text-display-xs font-semibold text-white md:text-display-md lg:text-display-lg">Prêt à reprendre le contrôle ?</h2>
                        <p className="mt-3 text-md text-white/80 md:mt-5 md:text-xl">Rejoignez des milliers d'utilisateurs. Gratuit, pour toujours.</p>

                        {/* Buttons - always row */}
                        <div className="mt-6 flex flex-row items-center gap-3 md:mt-10">
                            <Link href="/signup">
                                <Button size="lg" color="secondary" className="md:size-xl">
                                    Commencer
                                </Button>
                            </Link>
                            <Link href="mailto:contact@oyko.fr">
                                <Button size="lg" color="link-gray" className="md:size-xl text-white/90 active:text-white">
                                    Contact
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, Target01, PiggyBank01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { IPhoneMockup } from "@/components/shared-assets/iphone-mockup";

export const CTAIPhoneMockup04 = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="relative grid grid-cols-1 overflow-hidden rounded-2xl bg-brand-600 md:rounded-3xl lg:min-h-120 lg:grid-cols-2 lg:items-center">
                    {/* Background gradient decoration */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.15), transparent 50%)",
                        }}
                        aria-hidden="true"
                    />

                    <div className="relative z-10 flex flex-1 flex-col px-6 pt-10 pb-12 sm:p-12 lg:p-16">
                        <h2 className="text-display-sm font-semibold text-white xl:text-display-md">
                            Votre patrimoine, partout avec vous
                        </h2>
                        <p className="mt-4 text-lg text-white/80 md:mt-5 lg:text-xl">
                            Suivez vos finances en temps réel et recevez des alertes intelligentes pour ne jamais manquer une opportunité.
                        </p>
                        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center md:mt-12">
                            <Link href="/signup">
                                <Button size="xl" color="secondary">
                                    Commencer gratuitement
                                </Button>
                            </Link>
                            <Link href="mailto:contact@oyko.fr">
                                <Button
                                    size="xl"
                                    color="tertiary"
                                    className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                                >
                                    Nous contacter
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <IPhoneMockup
                        image="https://www.untitledui.com/marketing/screen-mockups/dashboard-mobile-mockup-light-01.webp"
                        imageDark="https://www.untitledui.com/marketing/screen-mockups/dashboard-mobile-mockup-dark-01.webp"
                        className="top-10 right-16 max-h-70 w-full max-w-67 justify-self-center drop-shadow-2xl lg:absolute lg:max-h-none lg:max-w-78.5"
                    />

                    {/* Notifications financières */}
                    <ul className="absolute bottom-10 left-1/2 hidden -translate-x-2 flex-col gap-3 lg:flex" aria-hidden="true">
                        {/* Notification: Dépense */}
                        <li className="flex w-full max-w-xs gap-3 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-lg ring-1 ring-black/5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-error-50">
                                <ArrowUpRight className="size-5 text-error-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">Carrefour Market</p>
                                <p className="text-sm text-gray-500">Alimentation</p>
                            </div>
                            <span className="text-sm font-semibold text-error-600">-47,32 &euro;</span>
                        </li>

                        {/* Notification: Revenu */}
                        <li className="flex w-full max-w-xs gap-3 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-lg ring-1 ring-black/5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-50">
                                <ArrowDownLeft className="size-5 text-success-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">Virement recu</p>
                                <p className="text-sm text-gray-500">Salaire Mars</p>
                            </div>
                            <span className="text-sm font-semibold text-success-600">+2 450,00 &euro;</span>
                        </li>

                        {/* Notification: Objectif atteint */}
                        <li className="flex w-full max-w-xs gap-3 rounded-xl bg-white/95 p-4 opacity-80 shadow-lg backdrop-blur-lg ring-1 ring-black/5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                                <Target01 className="size-5 text-brand-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">Objectif atteint !</p>
                                <p className="text-sm text-gray-500">Vacances ete 2024</p>
                            </div>
                            <span className="text-sm font-semibold text-brand-600">100%</span>
                        </li>

                        {/* Notification: Alerte budget */}
                        <li className="flex w-full max-w-xs gap-3 rounded-xl bg-white/95 p-4 opacity-60 shadow-lg backdrop-blur-lg ring-1 ring-black/5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-50">
                                <PiggyBank01 className="size-5 text-warning-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">Budget Restaurants</p>
                                <p className="text-sm text-gray-500">85% utilise ce mois</p>
                            </div>
                            <span className="text-sm font-semibold text-warning-600">Alerte</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

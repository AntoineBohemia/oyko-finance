"use client";

import { ArrowDownLeft, ArrowUpRight, PiggyBank01, Target01 } from "@untitledui/icons";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { IPhoneMockup } from "@/components/shared-assets/iphone-mockup";

// =============================================================================
// NOTIFICATION CARD - Extrait pour réutilisation
// =============================================================================

interface NotificationProps {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle: string;
    amount: string;
    amountColor: string;
    opacity?: string;
}

const NotificationCard = ({ icon, iconBg, title, subtitle, amount, amountColor, opacity = "opacity-100" }: NotificationProps) => (
    <li className={`flex w-full gap-3 rounded-xl bg-white/95 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-lg md:p-4 ${opacity}`}>
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full md:size-10 ${iconBg}`}>{icon}</div>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 md:text-sm">{subtitle}</p>
        </div>
        <span className={`text-sm font-semibold ${amountColor}`}>{amount}</span>
    </li>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CTAIPhoneMockup04 = () => {
    return (
        <section className="bg-primary py-12 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-brand-600 md:rounded-3xl lg:grid lg:min-h-120 lg:grid-cols-2 lg:items-center">
                    {/* Background gradient decoration */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.15), transparent 50%)",
                        }}
                        aria-hidden="true"
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col px-5 pt-8 pb-6 sm:p-10 lg:p-16">
                        <h2 className="text-display-xs font-semibold text-white md:text-display-sm xl:text-display-md">Votre patrimoine, partout avec vous</h2>
                        <p className="mt-3 text-md text-white/80 md:mt-5 md:text-lg lg:text-xl">
                            Suivez vos finances en temps réel et recevez des alertes intelligentes.
                        </p>

                        {/* CTA Buttons - always row */}
                        <div className="mt-6 flex flex-row items-center gap-3 md:mt-10">
                            <Link href="/signup">
                                <Button size="lg" color="secondary" className="md:px-5 md:py-3 md:text-md">
                                    Commencer
                                </Button>
                            </Link>
                            <Link href="mailto:contact@oyko.fr">
                                <Button size="lg" color="tertiary" className="text-white active:bg-white/10 md:px-5 md:py-3 md:text-md">
                                    Contact
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile: Notifications preview (horizontal scroll) */}
                    <div className="relative px-5 pb-6 lg:hidden">
                        <ul className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                            <li className="flex w-[260px] shrink-0 snap-start gap-3 rounded-xl bg-white/95 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-lg">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-50">
                                    <ArrowDownLeft className="size-4 text-success-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Virement reçu</p>
                                    <p className="text-xs text-gray-500">Salaire Mars</p>
                                </div>
                                <span className="text-sm font-semibold text-success-600">+2 450 €</span>
                            </li>
                            <li className="flex w-[260px] shrink-0 snap-start gap-3 rounded-xl bg-white/95 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-lg">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50">
                                    <Target01 className="size-4 text-brand-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Objectif atteint !</p>
                                    <p className="text-xs text-gray-500">Vacances été 2024</p>
                                </div>
                                <span className="text-sm font-semibold text-brand-600">100%</span>
                            </li>
                            <li className="flex w-[260px] shrink-0 snap-start gap-3 rounded-xl bg-white/95 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-lg">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-50">
                                    <PiggyBank01 className="size-4 text-warning-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Budget Restaurants</p>
                                    <p className="text-xs text-gray-500">85% utilisé ce mois</p>
                                </div>
                                <span className="text-sm font-semibold text-warning-600">Alerte</span>
                            </li>
                        </ul>
                    </div>

                    {/* Desktop: iPhone mockup */}
                    <IPhoneMockup
                        image="https://www.untitledui.com/marketing/screen-mockups/dashboard-mobile-mockup-light-01.webp"
                        imageDark="https://www.untitledui.com/marketing/screen-mockups/dashboard-mobile-mockup-dark-01.webp"
                        className="top-10 right-16 hidden max-h-70 w-full max-w-67 justify-self-center drop-shadow-2xl lg:absolute lg:block lg:max-h-none lg:max-w-78.5"
                    />

                    {/* Desktop: Notifications stack */}
                    <ul className="absolute bottom-10 left-1/2 hidden -translate-x-2 flex-col gap-3 lg:flex" aria-hidden="true">
                        <NotificationCard
                            icon={<ArrowUpRight className="size-5 text-error-600" />}
                            iconBg="bg-error-50"
                            title="Carrefour Market"
                            subtitle="Alimentation"
                            amount="-47,32 €"
                            amountColor="text-error-600"
                        />
                        <NotificationCard
                            icon={<ArrowDownLeft className="size-5 text-success-600" />}
                            iconBg="bg-success-50"
                            title="Virement reçu"
                            subtitle="Salaire Mars"
                            amount="+2 450 €"
                            amountColor="text-success-600"
                        />
                        <NotificationCard
                            icon={<Target01 className="size-5 text-brand-600" />}
                            iconBg="bg-brand-50"
                            title="Objectif atteint !"
                            subtitle="Vacances été 2024"
                            amount="100%"
                            amountColor="text-brand-600"
                            opacity="opacity-80"
                        />
                        <NotificationCard
                            icon={<PiggyBank01 className="size-5 text-warning-600" />}
                            iconBg="bg-warning-50"
                            title="Budget Restaurants"
                            subtitle="85% utilisé ce mois"
                            amount="Alerte"
                            amountColor="text-warning-600"
                            opacity="opacity-60"
                        />
                    </ul>
                </div>
            </div>
        </section>
    );
};

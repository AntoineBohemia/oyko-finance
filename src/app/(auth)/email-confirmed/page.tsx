"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CheckCircle, ShieldTick, Stars02 } from "@untitledui/icons";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { GradientBackground } from "@/app/(landing)/gradient-bg";

function EmailConfirmedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/onboarding";
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push(next);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router, next]);

    return (
        <GradientBackground variant="mesh" noise noiseOpacity={0.015} className="min-h-screen">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10 p-8">
                <Link href="/">
                    <UntitledLogo />
                </Link>
            </header>

            {/* Content */}
            <div className="flex min-h-screen items-center justify-center px-4 py-24">
                <div className="flex w-full max-w-md flex-col gap-8">
                    <div className="flex flex-col items-center gap-6 text-center">
                        {/* Success icon with celebration effect */}
                        <div className="relative">
                            {/* Animated celebration rings */}
                            <div className="absolute -inset-3 animate-pulse rounded-full bg-success-200/60 dark:bg-success-800/40" style={{ animationDuration: '1.5s' }} />
                            <div className="absolute -inset-6 rounded-full bg-success-100/40 dark:bg-success-900/30" />
                            <div className="absolute -inset-9 rounded-full bg-success-50/30 dark:bg-success-950/20" />
                            <FeaturedIcon color="success" theme="light" size="xl" className="relative z-10">
                                <CheckCircle className="size-7" />
                            </FeaturedIcon>
                        </div>

                        <div className="flex flex-col gap-2 md:gap-3">
                            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">
                                Email confirmé !
                            </h1>
                            <p className="text-md text-tertiary">
                                Votre adresse email a été vérifiée avec succès.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl bg-primary/60 backdrop-blur-md p-6 shadow-lg ring-1 ring-white/10 dark:ring-white/5">
                        <div className="flex items-center gap-4">
                            <FeaturedIcon color="success" theme="light" size="md" className="shrink-0">
                                <ShieldTick className="size-5" />
                            </FeaturedIcon>
                            <p className="font-semibold text-primary">
                                Votre compte est maintenant activé
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <FeaturedIcon color="brand" theme="light" size="md" className="shrink-0">
                                <Stars02 className="size-5" />
                            </FeaturedIcon>
                            <p className="font-semibold text-primary">
                                Prêt à gérer vos finances
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button href={next} size="lg" iconTrailing={ArrowRight} className="w-full">
                            Continuer vers l'application
                        </Button>
                        {/* Countdown progress indicator */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-1 w-32 overflow-hidden rounded-full bg-tertiary/20">
                                <div
                                    className="h-full bg-brand-600 transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 5) * 100}%` }}
                                />
                            </div>
                            <p className="text-center text-sm text-tertiary">
                                Redirection automatique dans {countdown} seconde{countdown > 1 ? "s" : ""}...
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-center text-sm text-tertiary">© <span className="font-display">Oyko</span> 2025</p>
            </footer>
        </GradientBackground>
    );
}

export default function EmailConfirmedPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <div className="animate-pulse text-tertiary">Chargement...</div>
            </div>
        }>
            <EmailConfirmedContent />
        </Suspense>
    );
}

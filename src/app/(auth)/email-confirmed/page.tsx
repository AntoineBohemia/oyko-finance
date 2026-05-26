"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CheckCircle, ShieldTick, Stars02 } from "@untitledui/icons";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { GradientBackground } from "@/app/(landing)/gradient-bg";

function EmailConfirmedContent() {
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/onboarding";

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
                <div className="flex w-full max-w-md flex-col gap-8 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
                    <div className="flex flex-col items-center gap-6 text-center">
                        {/* Success icon with celebration effect */}
                        <div className="relative">
                            <div className="absolute -inset-3 animate-pulse rounded-full bg-success-200/60" style={{ animationDuration: '1.5s' }} />
                            <div className="absolute -inset-6 rounded-full bg-success-100/40" />
                            <div className="absolute -inset-9 rounded-full bg-success-50/30" />
                            <FeaturedIcon color="success" theme="light" size="xl" className="relative z-10">
                                <CheckCircle className="size-7" />
                            </FeaturedIcon>
                        </div>

                        <div className="flex flex-col gap-2 md:gap-3">
                            <h1 className="text-display-xs font-semibold text-gray-900 md:text-display-sm">
                                Email confirmé !
                            </h1>
                            <p className="text-md text-gray-500">
                                Votre adresse email a été vérifiée avec succès.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-5">
                        <div className="flex items-center gap-4">
                            <FeaturedIcon color="success" theme="light" size="md" className="shrink-0">
                                <ShieldTick className="size-5" />
                            </FeaturedIcon>
                            <p className="font-semibold text-gray-900">
                                Votre compte est maintenant activé
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <FeaturedIcon color="brand" theme="light" size="md" className="shrink-0">
                                <Stars02 className="size-5" />
                            </FeaturedIcon>
                            <p className="font-semibold text-gray-900">
                                Prêt à gérer vos finances
                            </p>
                        </div>
                    </div>

                    <Button href={next} size="lg" iconTrailing={ArrowRight} className="w-full">
                        Continuer vers l'application
                    </Button>
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

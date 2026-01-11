"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Mail01, Send01, CursorClick01, Rocket01 } from "@untitledui/icons";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { GradientBackground } from "@/app/(landing)/gradient-bg";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

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
                        {/* Animated icon with pulse effect */}
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping rounded-full bg-brand-200 opacity-20 dark:bg-brand-800" style={{ animationDuration: '2s' }} />
                            <div className="absolute -inset-3 rounded-full bg-brand-100/50 dark:bg-brand-900/30" />
                            <div className="absolute -inset-6 rounded-full bg-brand-50/50 dark:bg-brand-950/30" />
                            <FeaturedIcon color="brand" theme="light" size="xl" className="relative z-10">
                                <Mail01 className="size-7" />
                            </FeaturedIcon>
                        </div>

                        <div className="flex flex-col gap-2 md:gap-3">
                            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">
                                Vérifiez votre email
                            </h1>
                            <p className="text-md text-tertiary">
                                Nous avons envoyé un lien de confirmation à{" "}
                                {email ? (
                                    <span className="font-medium text-brand-600 dark:text-brand-400">{email}</span>
                                ) : (
                                    "votre adresse email"
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-2xl bg-primary/60 backdrop-blur-md p-6 shadow-lg ring-1 ring-white/10 dark:ring-white/5">
                        <div className="flex items-start gap-4">
                            <FeaturedIcon color="brand" theme="light" size="md" className="shrink-0">
                                <Send01 className="size-5" />
                            </FeaturedIcon>
                            <div>
                                <p className="font-semibold text-primary">Ouvrez votre boîte de réception</p>
                                <p className="text-sm text-tertiary">Cherchez un email de Oyko</p>
                            </div>
                        </div>
                        <div className="ml-5 h-6 w-px bg-brand-200 dark:bg-brand-800" />
                        <div className="flex items-start gap-4">
                            <FeaturedIcon color="brand" theme="light" size="md" className="shrink-0">
                                <CursorClick01 className="size-5" />
                            </FeaturedIcon>
                            <div>
                                <p className="font-semibold text-primary">Cliquez sur le lien</p>
                                <p className="text-sm text-tertiary">Pour confirmer votre adresse email</p>
                            </div>
                        </div>
                        <div className="ml-5 h-6 w-px bg-brand-200 dark:bg-brand-800" />
                        <div className="flex items-start gap-4">
                            <FeaturedIcon color="brand" theme="light" size="md" className="shrink-0">
                                <Rocket01 className="size-5" />
                            </FeaturedIcon>
                            <div>
                                <p className="font-semibold text-primary">Configurez votre compte</p>
                                <p className="text-sm text-tertiary">Définissez vos objectifs financiers</p>
                            </div>
                        </div>
                    </div>

                    <div className="z-10 flex flex-col gap-4">
                        <p className="text-center text-sm text-tertiary">
                            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{" "}
                            <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
                                réessayez
                            </Link>
                        </p>
                    </div>

                    <div className="z-10 flex justify-center">
                        <Button color="link-gray" size="md" href="/login" iconLeading={ArrowLeft}>
                            Retour à la connexion
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-tertiary">© Oyko 2025</p>
                    <a href="mailto:contact@oyko.fr" className="flex items-center gap-2 text-sm text-tertiary hover:text-secondary">
                        <Mail01 className="size-4" />
                        contact@oyko.fr
                    </a>
                </div>
            </footer>
        </GradientBackground>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <div className="animate-pulse text-tertiary">Chargement...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

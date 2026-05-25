"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, ArrowRight, Mail01, Send01, CursorClick01, Rocket01, RefreshCw01 } from "@untitledui/icons";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { GradientBackground } from "@/app/(landing)/gradient-bg";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "";
    const errorParam = searchParams.get("error") || "";
    const [isSkipping, setIsSkipping] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState(errorParam);

    const handleResendEmail = async () => {
        if (!email || isResending) return;
        setIsResending(true);
        setResendError("");
        setResendSuccess(false);

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setResendSuccess(true);
            } else {
                const data = await res.json().catch(() => ({}));
                setResendError(data.detail || "Impossible de renvoyer l'email. Réessayez plus tard.");
            }
        } catch {
            setResendError("Erreur réseau. Vérifiez votre connexion.");
        } finally {
            setIsResending(false);
        }
    };

    const handleSkipVerification = async () => {
        setIsSkipping(true);
        try {
            await fetch("/api/auth/skip-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
        } catch {
            // Ignore - redirect to login anyway
        }
        router.push("/login");
    };

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

                    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
                        <div className="flex items-start gap-4">
                            <FeaturedIcon color="brand" theme="light" size="md" className="shrink-0">
                                <Send01 className="size-5" />
                            </FeaturedIcon>
                            <div>
                                <p className="font-semibold text-primary">Ouvrez votre boîte de réception</p>
                                <p className="text-sm text-tertiary">Cherchez un email de <span className="font-display">Oyko</span></p>
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

                    <div className="z-10 flex flex-col gap-3">
                        {/* Resend email button */}
                        <Button
                            size="lg"
                            color="secondary"
                            onClick={handleResendEmail}
                            isDisabled={isResending || resendSuccess}
                            iconLeading={RefreshCw01}
                            className="w-full justify-center"
                        >
                            {isResending ? "Envoi en cours..." : resendSuccess ? "Email renvoyé !" : "Renvoyer l'email"}
                        </Button>

                        {resendSuccess && (
                            <p className="text-center text-sm text-success-600">
                                Un nouvel email a été envoyé. Vérifiez votre boîte de réception.
                            </p>
                        )}
                        {resendError && (
                            <p className="text-center text-sm text-error-600">
                                {resendError}
                            </p>
                        )}

                        {/* Skip verification — dev only */}
                        {IS_DEV && (
                            <Button
                                size="lg"
                                onClick={handleSkipVerification}
                                isDisabled={isSkipping}
                                iconTrailing={ArrowRight}
                                className="w-full justify-center"
                            >
                                {isSkipping ? "Redirection..." : "Passer la vérification (dev)"}
                            </Button>
                        )}

                        <p className="text-center text-sm text-tertiary">
                            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou cliquez sur renvoyer.
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
                    <p className="text-sm text-tertiary">© <span className="font-display">Oyko</span> 2025</p>
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

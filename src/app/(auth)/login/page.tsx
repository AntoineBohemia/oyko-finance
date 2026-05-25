"use client";

import { Suspense, useState } from "react";
import { AlertCircle, Mail01 } from "@untitledui/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MockFrame } from "react-mockframe";
import "react-mockframe/styles/mockframe-iphones.min.css";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { PasswordInput } from "@/components/base/input/input-password";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { cx } from "@/utils/cx";

// =============================================================================
// OYKO PHONE SCREEN — Dashboard preview inside phone mockup
// =============================================================================

const OykoScreen = () => (
    <div className="flex h-full flex-col bg-[#08090D] px-5 pt-3 pb-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[11px] text-gray-500">Bonjour, Antoine</p>
                <p className="text-sm font-semibold text-white">Mon Dashboard</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#BEFF00]/15 ring-1 ring-[#BEFF00]/20">
                <span className="text-xs font-bold text-[#BEFF00]">A</span>
            </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">Solde disponible</p>
            <div className="mt-1.5 flex items-baseline gap-0.5">
                <span className="font-mono text-3xl font-bold tracking-tight text-white">1 247</span>
                <span className="font-mono text-lg font-bold text-gray-600">,50 €</span>
            </div>
            <div className="mt-3.5 flex items-center gap-2.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
                    <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#BEFF00] to-[#9ACC00]" />
                </div>
                <span className="font-mono text-[10px] font-semibold text-[#BEFF00]">62%</span>
            </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
            {[
                { emoji: "🍔", name: "Alimentation", spent: "280 €", pct: 70 },
                { emoji: "🚇", name: "Transport", spent: "65 €", pct: 35 },
                { emoji: "🎮", name: "Loisirs", spent: "175 €", pct: 88 },
                { emoji: "👕", name: "Vêtements", spent: "45 €", pct: 20 },
            ].map((env) => (
                <div key={env.name} className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.05]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs">{env.emoji}</span>
                        <span className="text-[10px] font-medium text-gray-300">{env.name}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs font-semibold text-white">{env.spent}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className={cx("h-full rounded-full", env.pct > 80 ? "bg-amber-500" : "bg-gradient-to-r from-white/70 to-white/40")}
                            style={{ width: `${env.pct}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-500">Récent</p>
            <div className="flex flex-col divide-y divide-white/[0.04]">
                {[
                    { name: "Carrefour Market", cat: "Alimentation", amount: "-47,32 €", positive: false },
                    { name: "Salaire Mai", cat: "Revenus", amount: "+2 800 €", positive: true },
                    { name: "Netflix", cat: "Abonnement", amount: "-13,99 €", positive: false },
                    { name: "SNCF", cat: "Transport", amount: "-35,00 €", positive: false },
                ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className={cx("flex size-6 items-center justify-center rounded-full text-[9px]", tx.positive ? "bg-[#BEFF00]/10 text-[#BEFF00]" : "bg-white/[0.04] text-gray-500")}>
                                {tx.positive ? "↓" : "↑"}
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-200">{tx.name}</p>
                                <p className="text-[9px] text-gray-600">{tx.cat}</p>
                            </div>
                        </div>
                        <span className={cx("font-mono text-[11px] font-medium", tx.positive ? "text-[#BEFF00]" : "text-gray-400")}>{tx.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// =============================================================================
// LOGIN FORM
// =============================================================================

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                    return;
                }
                if (res.status === 401) {
                    setError("Email ou mot de passe incorrect");
                } else {
                    setError(data.detail || "Erreur de connexion");
                }
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            if (data.user?.onboardingCompleted === false) {
                router.push("/onboarding");
            } else {
                router.push(redirectTo);
            }
            router.refresh();
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("La connexion Google sera disponible prochainement.");
    };

    return (
        <section className="grid min-h-screen grid-cols-1 bg-primary lg:grid-cols-2">
            {/* Left — Form */}
            <div className="flex flex-col bg-primary">
                <header className="hidden p-8 md:block">
                    <Link href="/">
                        <UntitledLogo />
                    </Link>
                </header>

                <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8">
                    <div className="flex w-full flex-col gap-8 sm:max-w-90">
                        <div className="flex flex-col gap-6">
                            <Link href="/" className="lg:hidden">
                                <UntitledLogoMinimal className="size-10" />
                            </Link>

                            <div className="flex flex-col gap-2 md:gap-3">
                                <h1 className="text-xl font-semibold text-primary md:text-display-xs">Connexion</h1>
                                <p className="text-md text-tertiary">Bon retour ! Entrez vos identifiants.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-lg bg-error-50 p-4 dark:bg-error-900/20">
                                <AlertCircle className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" />
                                <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
                            </div>
                        )}

                        <Form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-5">
                                <Input
                                    isRequired
                                    hideRequiredIndicator
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="Entrez votre email"
                                    size="md"
                                    value={email}
                                    onChange={setEmail}
                                />
                                <PasswordInput
                                    isRequired
                                    hideRequiredIndicator
                                    label="Mot de passe"
                                    name="password"
                                    size="md"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={setPassword}
                                />
                            </div>

                            <div className="flex items-center">
                                <Checkbox label="Se souvenir de moi" name="remember" isSelected={remember} onChange={setRemember} />
                                <Button color="link-color" size="md" href="#" className="ml-auto">
                                    Mot de passe oublié
                                </Button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button type="submit" size="lg" isDisabled={isLoading}>
                                    {isLoading ? "Connexion..." : "Se connecter"}
                                </Button>
                                <SocialButton social="google" theme="color" onClick={handleGoogleSignIn} disabled={isLoading}>
                                    Continuer avec Google
                                </SocialButton>
                            </div>
                        </Form>

                        <div className="flex justify-center gap-1 text-center">
                            <span className="text-sm text-tertiary">Pas encore de compte ?</span>
                            <Button href="/signup" color="link-color" size="md">
                                S&apos;inscrire
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="hidden justify-between p-8 pt-11 lg:flex">
                    <p className="text-sm text-tertiary">© <span className="font-display">Oyko</span> 2025</p>
                    <a href="mailto:contact@oyko.fr" className="flex items-center gap-2 text-sm text-tertiary">
                        <Mail01 className="size-4 text-fg-quaternary" />
                        contact@oyko.fr
                    </a>
                </footer>
            </div>

            {/* Right — Phone mockup */}
            <div className="relative hidden items-center justify-center overflow-hidden bg-secondary lg:flex">
                <div className="pointer-events-none" style={{ transform: "scale(0.85)" }}>
                    <MockFrame device="iPhone 17" color="black">
                        <OykoScreen />
                    </MockFrame>
                </div>
            </div>
        </section>
    );
}

// =============================================================================
// PAGE
// =============================================================================

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-primary text-primary">Chargement...</div>}>
            <LoginForm />
        </Suspense>
    );
}

"use client";

import { Suspense, useState } from "react";
import { AlertCircle } from "@untitledui/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { PasswordInput } from "@/components/base/input/input-password";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Vérification basique
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // Messages d'erreur en français
                if (signInError.message === "Invalid login credentials") {
                    setError("Email ou mot de passe incorrect");
                } else if (signInError.message === "Email not confirmed") {
                    setError("Veuillez confirmer votre email avant de vous connecter");
                } else {
                    setError(signInError.message);
                }
                setIsLoading(false);
                return;
            }

            if (data.user) {
                // Vérifier si le profil a été complété (onboarding)
                const { data: profile } = await supabase.from("profiles").select("revenus_mensuels").eq("id", data.user.id).single();

                // Si le profil n'a pas de revenus configurés, rediriger vers onboarding
                if (!profile?.revenus_mensuels || profile.revenus_mensuels === 0) {
                    router.push("/onboarding");
                } else {
                    router.push(redirectTo);
                }
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
                },
            });

            if (oauthError) {
                setError("Erreur lors de la connexion avec Google");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    return (
        <section className="grid min-h-screen grid-cols-1 bg-primary lg:grid-cols-[640px_1fr]">
            <div className="flex flex-col bg-primary">
                <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8 md:py-32">
                    <div className="flex w-full flex-col gap-8 sm:max-w-90">
                        <div className="flex flex-col gap-6 md:gap-20">
                            <Link href="/">
                                <UntitledLogo className="max-md:hidden" />
                                <UntitledLogoMinimal className="size-10 md:hidden" />
                            </Link>
                            <div className="flex flex-col gap-2 md:gap-3">
                                <h1 className="text-display-xs font-semibold text-primary md:text-display-md">Connexion</h1>
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
                                S'inscrire
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="hidden p-8 pt-11 lg:block">
                    <p className="text-sm text-tertiary">© Oyko 2025</p>
                </footer>
            </div>

            <div className="relative hidden items-center overflow-hidden bg-tertiary pl-24 lg:flex">
                <div className="rounded-[9.03px] bg-primary p-[0.9px] shadow-lg ring-[0.56px] ring-utility-gray-300 ring-inset md:rounded-[26.95px] md:p-[3.5px] md:ring-[1.68px]">
                    <div className="rounded-[7.9px] bg-primary p-0.5 shadow-modern-mockup-inner-md md:rounded-[23.58px] md:p-1 md:shadow-modern-mockup-inner-lg">
                        <div className="relative overflow-hidden rounded-[6.77px] bg-utility-gray-50 ring-[0.56px] ring-utility-gray-200 md:rounded-[20.21px] md:ring-[1.68px]">
                            {/* Light mode image (hidden in dark mode) */}
                            <img
                                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                                className="max-h-168.5 max-w-none object-cover object-left-top dark:hidden"
                                alt="Dashboard mockup showing application interface"
                            />
                            {/* Dark mode image (hidden in light mode) */}
                            <img
                                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                                className="max-h-168.5 max-w-none object-cover object-left-top not-dark:hidden"
                                alt="Dashboard mockup showing application interface"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-primary text-primary">Chargement...</div>}>
            <LoginForm />
        </Suspense>
    );
}

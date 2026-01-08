"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Wallet03 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
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
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("revenus_mensuels")
                    .eq("id", data.user.id)
                    .single();

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
                        <div className="flex flex-col gap-6 md:gap-12">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                                    <Wallet03 className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-semibold text-primary">Budget App</span>
                            </Link>
                            <div className="flex flex-col gap-2 md:gap-3">
                                <h1 className="text-display-xs font-semibold text-primary md:text-display-md">Connexion</h1>
                                <p className="text-md text-tertiary">Bon retour ! Entrez vos identifiants.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-lg bg-error-50 p-4">
                                <AlertCircle className="h-5 w-5 text-error-600" />
                                <p className="text-sm text-error-700">{error}</p>
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
                                <Input
                                    isRequired
                                    hideRequiredIndicator
                                    label="Mot de passe"
                                    type="password"
                                    name="password"
                                    size="md"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={setPassword}
                                />
                            </div>

                            <div className="flex items-center">
                                <Checkbox
                                    label="Se souvenir de moi"
                                    name="remember"
                                    isSelected={remember}
                                    onChange={setRemember}
                                />
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
                    <p className="text-sm text-tertiary">© Budget App 2025</p>
                </footer>
            </div>

            <div className="relative hidden items-center overflow-hidden bg-brand-600 lg:flex">
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
                        <Wallet03 className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="mb-4 text-display-sm font-semibold text-white">Gérez votre budget simplement</h2>
                    <p className="max-w-md text-lg text-white/80">
                        Suivez vos dépenses, planifiez votre épargne et atteignez vos objectifs financiers.
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-8 text-white/90">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-display-xs font-bold">10k+</span>
                            <span className="text-sm text-white/70">Utilisateurs</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-display-xs font-bold">50M€</span>
                            <span className="text-sm text-white/70">Gérés</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-display-xs font-bold">4.9</span>
                            <span className="text-sm text-white/70">Note App</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

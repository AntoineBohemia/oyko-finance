"use client";

import { useState } from "react";
import { AlertCircle, Check, Mail01 } from "@untitledui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { createClient } from "@/lib/supabase/client";
import { cx } from "@/utils/cx";

const PASSWORD_REQUIREMENTS = [
    { id: "length", label: "Au moins 8 caractères", check: (p: string) => p.length >= 8 },
    { id: "uppercase", label: "Une majuscule", check: (p: string) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "Une minuscule", check: (p: string) => /[a-z]/.test(p) },
    { id: "number", label: "Un chiffre", check: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const supabase = createClient();

    const passwordChecks = PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        passed: req.check(password),
    }));

    const allPasswordChecksPassed = passwordChecks.every((c) => c.passed);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Veuillez entrer une adresse email valide");
            return;
        }

        setStep(2);
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!allPasswordChecksPassed) {
            setError("Le mot de passe ne respecte pas tous les critères");
            return;
        }

        if (!passwordsMatch) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            // Séparer le nom en prénom et nom
            const nameParts = name.trim().split(" ");
            const prenom = nameParts[0];
            const nom = nameParts.slice(1).join(" ") || "";

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        prenom,
                        nom,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
                },
            });

            if (signUpError) {
                if (signUpError.message.includes("already registered")) {
                    setError("Un compte existe déjà avec cet email. Connectez-vous plutôt.");
                } else {
                    setError(signUpError.message);
                }
                setIsLoading(false);
                return;
            }

            // Vérifier si la confirmation email est requise
            if (data.user && !data.session) {
                // Email de confirmation envoyé
                setSuccess("Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.");
                setIsLoading(false);
            } else if (data.session) {
                // Connexion directe (si confirmation email désactivée)
                router.push("/onboarding");
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        setError("");

        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
                },
            });

            if (oauthError) {
                setError("Erreur lors de l'inscription avec Google");
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
                <header className="hidden pt-8 pl-8 lg:block">
                    <Link href="/">
                        <UntitledLogo />
                    </Link>
                </header>
                <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8 md:py-0">
                    <div className="flex w-full flex-col gap-8 sm:max-w-90">
                        <div className="flex flex-col gap-6">
                            <Link href="/" className="lg:hidden">
                                <UntitledLogoMinimal className="size-10" />
                            </Link>

                            <div className="flex flex-col gap-2 md:gap-3">
                                <h1 className="text-display-xs font-semibold text-primary md:text-display-md">
                                    {step === 1 ? "Créer un compte" : "Choisir un mot de passe"}
                                </h1>
                                <p className="text-md text-tertiary">
                                    {step === 1 ? "Commencez à gérer votre budget dès maintenant." : "Choisissez un mot de passe sécurisé."}
                                </p>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex items-center gap-2">
                            <div className={cx("h-2 flex-1 rounded-full", step >= 1 ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700")} />
                            <div className={cx("h-2 flex-1 rounded-full", step >= 2 ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700")} />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-lg bg-error-50 p-4 dark:bg-error-900/20">
                                <AlertCircle className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" />
                                <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-3 rounded-lg bg-success-50 p-4 dark:bg-success-900/20">
                                <Check className="h-5 w-5 shrink-0 text-success-600 dark:text-success-400" />
                                <p className="text-sm text-success-700 dark:text-success-300">{success}</p>
                            </div>
                        )}

                        {step === 1 && (
                            <Form onSubmit={handleStep1Submit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-5">
                                    <Input
                                        isRequired
                                        hideRequiredIndicator
                                        label="Nom complet"
                                        type="text"
                                        name="name"
                                        placeholder="Entrez votre nom"
                                        size="md"
                                        value={name}
                                        onChange={setName}
                                    />
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
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button type="submit" size="lg">
                                        Continuer
                                    </Button>
                                    <SocialButton social="google" theme="color" onClick={handleGoogleSignUp}>
                                        S'inscrire avec Google
                                    </SocialButton>
                                </div>
                            </Form>
                        )}

                        {step === 2 && (
                            <Form onSubmit={handleStep2Submit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            isRequired
                                            hideRequiredIndicator
                                            label="Mot de passe"
                                            type="password"
                                            name="password"
                                            placeholder="Créez un mot de passe"
                                            size="md"
                                            value={password}
                                            onChange={setPassword}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            {passwordChecks.map((check) => (
                                                <div
                                                    key={check.id}
                                                    className={cx(
                                                        "flex items-center gap-2 text-sm transition-colors",
                                                        check.passed ? "text-success-600 dark:text-success-400" : "text-tertiary",
                                                    )}
                                                >
                                                    <div
                                                        className={cx(
                                                            "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                                                            check.passed ? "bg-success-100 dark:bg-success-900/30" : "bg-gray-100 dark:bg-gray-800",
                                                        )}
                                                    >
                                                        {check.passed && <Check className="h-3 w-3" />}
                                                    </div>
                                                    {check.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Input
                                        isRequired
                                        hideRequiredIndicator
                                        label="Confirmer le mot de passe"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirmez votre mot de passe"
                                        size="md"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                    />
                                    {confirmPassword && !passwordsMatch && (
                                        <p className="text-sm text-error-600 dark:text-error-400">Les mots de passe ne correspondent pas</p>
                                    )}
                                    {passwordsMatch && (
                                        <p className="flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
                                            <Check className="h-4 w-4" />
                                            Les mots de passe correspondent
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button type="submit" size="lg" isDisabled={!allPasswordChecksPassed || !passwordsMatch || isLoading}>
                                        {isLoading ? "Création du compte..." : "Créer mon compte"}
                                    </Button>
                                    <Button type="button" color="secondary" size="lg" onClick={() => setStep(1)}>
                                        Retour
                                    </Button>
                                </div>
                            </Form>
                        )}

                        <div className="flex justify-center gap-1 text-center">
                            <span className="text-sm text-tertiary">Déjà un compte ?</span>
                            <Button href="/login" color="link-color" size="md">
                                Se connecter
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="hidden justify-between px-8 pt-4 pb-8 lg:flex">
                    <p className="text-sm text-tertiary">© Budget App 2025</p>

                    <a href="mailto:help@budgetapp.com" className="flex items-center gap-2 text-sm text-tertiary">
                        <Mail01 className="size-4 text-fg-quaternary" />
                        help@budgetapp.com
                    </a>
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

"use client";

import { useState } from "react";
import { AlertCircle, Check, Mail01 } from "@untitledui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MockFrame } from "react-mockframe";
import "react-mockframe/styles/mockframe-laptops.min.css";
import { Button } from "@/components/base/buttons/button";
import { OykoDesktopScreen } from "@/components/shared-assets/oyko-desktop-screen";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { PasswordInput } from "@/components/base/input/input-password";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { cx } from "@/utils/cx";

// =============================================================================
// PASSWORD REQUIREMENTS
// =============================================================================

const PASSWORD_REQUIREMENTS = [
    { id: "length", label: "Au moins 8 caractères", check: (p: string) => p.length >= 8 },
    { id: "uppercase", label: "Une majuscule", check: (p: string) => /[A-Z]/.test(p) },
    { id: "lowercase", label: "Une minuscule", check: (p: string) => /[a-z]/.test(p) },
    { id: "number", label: "Un chiffre", check: (p: string) => /[0-9]/.test(p) },
];

// =============================================================================
// SIGNUP PAGE
// =============================================================================

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
            const nameParts = name.trim().split(" ");
            const prenom = nameParts[0];
            const nom = nameParts.slice(1).join(" ") || "";

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, prenom, nom }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (data.detail?.includes("already") || data.detail?.includes("existe")) {
                    setError("Un compte existe déjà avec cet email. Connectez-vous plutôt.");
                } else {
                    setError(data.detail || "Erreur lors de l'inscription");
                }
                setIsLoading(false);
                return;
            }

            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError("L'inscription Google sera disponible prochainement.");
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
                                <h1 className="text-xl font-semibold text-primary md:text-display-xs">
                                    {step === 1 ? "Créer un compte" : "Choisir un mot de passe"}
                                </h1>
                                <p className="text-md text-tertiary">
                                    {step === 1 ? "Commencez à gérer votre budget dès maintenant." : "Choisissez un mot de passe sécurisé."}
                                </p>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex items-center gap-2">
                            <div className={cx("h-2 flex-1 rounded-full", step >= 1 ? "bg-brand-600" : "bg-gray-200")} />
                            <div className={cx("h-2 flex-1 rounded-full", step >= 2 ? "bg-brand-600" : "bg-gray-200")} />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 rounded-lg bg-error-50 p-4">
                                <AlertCircle className="h-5 w-5 shrink-0 text-error-600" />
                                <p className="text-sm text-error-700">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-3 rounded-lg bg-success-50 p-4">
                                <Check className="h-5 w-5 shrink-0 text-success-600" />
                                <p className="text-sm text-success-700">{success}</p>
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
                                        S&apos;inscrire avec Google
                                    </SocialButton>
                                </div>
                            </Form>
                        )}

                        {step === 2 && (
                            <Form onSubmit={handleStep2Submit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-3">
                                        <PasswordInput
                                            isRequired
                                            hideRequiredIndicator
                                            label="Mot de passe"
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
                                                        check.passed ? "text-success-600" : "text-tertiary",
                                                    )}
                                                >
                                                    <div
                                                        className={cx(
                                                            "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                                                            check.passed ? "bg-success-100" : "bg-gray-100",
                                                        )}
                                                    >
                                                        {check.passed && <Check className="h-3 w-3" />}
                                                    </div>
                                                    {check.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <PasswordInput
                                        isRequired
                                        hideRequiredIndicator
                                        label="Confirmer le mot de passe"
                                        name="confirmPassword"
                                        placeholder="Confirmez votre mot de passe"
                                        size="md"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                    />
                                    {confirmPassword && !passwordsMatch && (
                                        <p className="text-sm text-error-600">Les mots de passe ne correspondent pas</p>
                                    )}
                                    {passwordsMatch && (
                                        <p className="flex items-center gap-2 text-sm text-success-600">
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

                <footer className="hidden justify-between p-8 pt-11 lg:flex">
                    <p className="text-sm text-tertiary">© <span className="font-display">Oyko</span> 2025</p>
                    <a href="mailto:contact@oyko.fr" className="flex items-center gap-2 text-sm text-tertiary">
                        <Mail01 className="size-4 text-fg-quaternary" />
                        contact@oyko.fr
                    </a>
                </footer>
            </div>

            {/* Right — MacBook Pro mockup */}
            <div className="relative hidden items-center overflow-hidden bg-secondary py-12 pr-12 pl-20 lg:flex">
                <div className="pointer-events-none w-full">
                    <MockFrame device="MacBook Pro 2020">
                        <OykoDesktopScreen />
                    </MockFrame>
                </div>
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, AlertCircle, Loading02, Bank } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { createClient } from "@/lib/supabase/client";

export default function BankCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [status, setStatus] = useState<"loading" | "syncing" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [syncResult, setSyncResult] = useState<{ accounts: number; transactions: number } | null>(null);

    useEffect(() => {
        async function handleCallback() {
            // Bridge peut renvoyer des paramètres comme item_id, status, etc.
            const itemId = searchParams.get("item_id");
            const bridgeStatus = searchParams.get("status");

            console.log("Bridge callback params:", { itemId, status: bridgeStatus });

            // Vérifier si erreur de Bridge
            if (bridgeStatus === "error") {
                setStatus("error");
                setErrorMessage("La connexion avec votre banque a échoué. Veuillez réessayer.");
                return;
            }

            // Si on a un item_id, la connexion a réussi
            if (itemId || bridgeStatus === "success") {
                setStatus("syncing");

                try {
                    // Récupérer le token de l'utilisateur
                    const { data: { session } } = await supabase.auth.getSession();

                    if (!session) {
                        setStatus("error");
                        setErrorMessage("Session expirée. Veuillez vous reconnecter.");
                        return;
                    }

                    // Déclencher une synchronisation
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bridge-sync`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({ refresh: false }),
                        }
                    );

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || "Erreur de synchronisation");
                    }

                    const result = await response.json();
                    setSyncResult(result);
                    setStatus("success");
                } catch (error) {
                    console.error("Sync error:", error);
                    setStatus("error");
                    setErrorMessage((error as Error).message || "Erreur lors de la synchronisation");
                }
            } else {
                // Pas de paramètres, probablement un accès direct
                setStatus("success");
            }
        }

        handleCallback();
    }, [searchParams, supabase]);

    const handleContinue = () => {
        // Vérifier si on vient de l'onboarding
        const fromOnboarding = sessionStorage.getItem("bank_connect_from_onboarding");
        if (fromOnboarding) {
            sessionStorage.removeItem("bank_connect_from_onboarding");
            router.push("/onboarding?step=6&bank_connected=true");
        } else {
            router.push("/dashboard");
        }
    };

    const handleRetry = () => {
        router.push("/onboarding?step=6");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary_alt p-4">
            <div className="w-full max-w-md rounded-xl bg-primary_alt p-8 shadow-lg ring-1 ring-secondary ring-inset">
                {/* Loading */}
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                            <Loading02 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-primary">Connexion en cours...</h1>
                        <p className="text-tertiary">Traitement de la réponse de votre banque</p>
                    </div>
                )}

                {/* Syncing */}
                {status === "syncing" && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                            <Loading02 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-primary">Synchronisation...</h1>
                        <p className="text-tertiary">Récupération de vos comptes et transactions</p>
                    </div>
                )}

                {/* Success */}
                {status === "success" && (
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
                            <Check className="h-8 w-8 text-success-600 dark:text-success-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-xl font-semibold text-primary">Connexion réussie !</h1>
                            <p className="text-tertiary">
                                Votre compte bancaire est maintenant connecté à Oyko.
                            </p>
                        </div>

                        {syncResult && (
                            <div className="w-full rounded-lg bg-success-50 p-4 dark:bg-success-900/20">
                                <div className="flex items-center justify-center gap-6">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold text-success-700 dark:text-success-300">
                                            {syncResult.accounts}
                                        </span>
                                        <span className="text-sm text-success-600 dark:text-success-400">
                                            {syncResult.accounts > 1 ? "Comptes" : "Compte"}
                                        </span>
                                    </div>
                                    <div className="h-10 w-px bg-success-200 dark:bg-success-800" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold text-success-700 dark:text-success-300">
                                            {syncResult.transactions}
                                        </span>
                                        <span className="text-sm text-success-600 dark:text-success-400">
                                            Transactions
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button size="lg" color="primary" onClick={handleContinue} className="w-full">
                            Continuer
                        </Button>
                    </div>
                )}

                {/* Error */}
                {status === "error" && (
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
                            <AlertCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-xl font-semibold text-primary">Connexion échouée</h1>
                            <p className="text-tertiary">{errorMessage}</p>
                        </div>

                        <div className="flex w-full flex-col gap-3">
                            <Button size="lg" color="primary" onClick={handleRetry} className="w-full">
                                Réessayer
                            </Button>
                            <Button size="lg" color="secondary" onClick={handleContinue} className="w-full">
                                Continuer sans connecter de banque
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center gap-2 text-sm text-tertiary">
                <Bank className="h-4 w-4" />
                <span>Connexion sécurisée via Bridge</span>
            </div>
        </div>
    );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, AlertCircle, Loading02, Bank } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

export default function BankCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <BankCallbackContent />
    </Suspense>
  );
}

function CallbackLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary_alt p-4">
      <div className="w-full max-w-md rounded-xl bg-primary_alt p-8 shadow-lg ring-1 ring-secondary ring-inset">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
            <Loading02 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-xl font-semibold text-primary">
            Chargement...
          </h1>
        </div>
      </div>
    </div>
  );
}

function BankCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<
    "loading" | "syncing" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [syncResult, setSyncResult] = useState<{
    accounts: number;
    transactions: number;
  } | null>(null);

  const mapSyncResult = (data: Record<string, unknown>) => ({
    accounts: (data.accountsSynced ?? data.accounts ?? 0) as number,
    transactions: (data.transactionsImported ?? data.transactions ?? 0) as number,
  });

  useEffect(() => {
    async function handleCallback() {
      const ref = searchParams.get("ref");
      const itemId = searchParams.get("item_id");
      const callbackStatus = searchParams.get("status");

      if (callbackStatus === "error") {
        setStatus("error");
        setErrorMessage(
          "La connexion avec votre banque a echoue. Veuillez reessayer.",
        );
        return;
      }

      if (ref || itemId || callbackStatus === "success") {
        setStatus("syncing");

        try {
          const response = await fetch("/api/bank/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref, itemId }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Erreur de synchronisation");
          }

          const result = await response.json();
          setSyncResult(mapSyncResult(result));
          setStatus("success");
        } catch (error) {
          setStatus("error");
          setErrorMessage(
            (error as Error).message ||
              "Erreur lors de la synchronisation",
          );
        }
      } else {
        setStatus("success");
      }
    }

    handleCallback();
  }, [searchParams]);

  const handleContinue = () => {
    const fromOnboarding = sessionStorage.getItem(
      "bank_connect_from_onboarding",
    );
    if (fromOnboarding) {
      sessionStorage.removeItem("bank_connect_from_onboarding");
      router.push("/onboarding?step=5&bank_connected=true");
    } else {
      router.push("/dashboard");
    }
  };

  const handleRetry = () => {
    router.push("/onboarding?step=5");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary_alt p-4">
      <div className="w-full max-w-md rounded-xl bg-primary_alt p-8 shadow-lg ring-1 ring-secondary ring-inset">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
              <Loading02 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
            </div>
            <h1 className="text-xl font-semibold text-primary">
              Connexion en cours...
            </h1>
            <p className="text-tertiary">
              Traitement de la reponse de votre banque
            </p>
          </div>
        )}

        {status === "syncing" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
              <Loading02 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
            </div>
            <h1 className="text-xl font-semibold text-primary">
              Synchronisation...
            </h1>
            <p className="text-tertiary">
              Recuperation de vos comptes et transactions
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
              <Check className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-primary">
                Connexion reussie !
              </h1>
              <p className="text-tertiary">
                Votre compte bancaire est maintenant connecte a Oyko.
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

            <Button
              size="lg"
              color="primary"
              onClick={handleContinue}
              className="w-full"
            >
              Continuer
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
              <AlertCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-primary">
                Connexion echouee
              </h1>
              <p className="text-tertiary">{errorMessage}</p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <Button
                size="lg"
                color="primary"
                onClick={handleRetry}
                className="w-full"
              >
                Reessayer
              </Button>
              <Button
                size="lg"
                color="secondary"
                onClick={handleContinue}
                className="w-full"
              >
                Continuer sans connecter de banque
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-tertiary">
        <Bank className="h-4 w-4" />
        <span>Connexion securisee via GoCardless</span>
      </div>
    </div>
  );
}

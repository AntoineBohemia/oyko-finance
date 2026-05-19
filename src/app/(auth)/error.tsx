"use client";

import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-2 text-xl font-semibold text-primary">
          Erreur d'authentification
        </h1>
        <p className="mb-6 text-sm text-tertiary">{error.message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Réessayer
          </button>
          <Link
            href="/login"
            className="rounded-lg border border-secondary px-4 py-2 text-sm font-medium text-primary hover:bg-secondary"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

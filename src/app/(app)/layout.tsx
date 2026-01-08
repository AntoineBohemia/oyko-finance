import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";

/**
 * Layout protégé pour toutes les pages de l'application (app)
 *
 * Ce Server Component vérifie l'authentification AVANT de rendre le contenu.
 * C'est une couche de sécurité supplémentaire en plus du middleware.
 *
 * Avantages:
 * - Double vérification (middleware + layout)
 * - Pas de flash de contenu non autorisé
 * - Accès aux données utilisateur pour les enfants
 */
export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Vérification de l'authentification côté serveur
  // Utilise getUser() qui valide le token auprès du serveur Supabase
  // (plus sécurisé que getSession() qui ne vérifie que localement)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Si pas d'utilisateur ou erreur, rediriger vers login
  if (error || !user) {
    redirect("/login");
  }

  // L'utilisateur est authentifié, on peut rendre l'application
  return <AppShell>{children}</AppShell>;
}

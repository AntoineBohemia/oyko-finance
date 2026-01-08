import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { User } from "@supabase/supabase-js";

/**
 * Récupère l'utilisateur courant côté serveur
 * Retourne null si non authentifié
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Récupère l'utilisateur courant ou redirige vers login
 * À utiliser dans les Server Components des pages protégées
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Récupère le profil complet de l'utilisateur depuis la table profiles
 */
export async function getUserProfile() {
  const supabase = await createClient();
  const user = await requireUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}

/**
 * Déconnecte l'utilisateur
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

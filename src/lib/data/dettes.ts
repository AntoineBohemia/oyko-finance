import { api } from "@/lib/api/client";
import type { Profile } from "@/types/api";

// Types pour les donnees des dettes
export type TypeDette =
  | "etudiant"
  | "immobilier"
  | "conso"
  | "auto"
  | "personnel"
  | "autre";

export interface DetteData {
  id: string;
  nom: string;
  type: TypeDette;
  capitalInitial: number;
  capitalRestant: number;
  tauxAnnuel: number;
  mensualite: number;
  jourPrelevement: number;
  dateDebut: Date | null;
  dateFin: Date | null;
  prochainPrelevement: Date;
  compteId: string | null;
  compteNom: string | null;
  preteur: string;
  imageUrl: string | null;
  notes: string | null;
}

export interface DettesPageData {
  profile: Profile | null;
  dettes: DetteData[];
  comptes: { id: string; nom: string }[];
}

// Recuperer toutes les donnees pour la page dettes
export async function getDettesData(): Promise<DettesPageData> {
  const data = await api<DettesPageData>("/api/v1/liabilities");

  // Convertir les dates string en Date objects
  if (data.dettes) {
    data.dettes = data.dettes.map((d) => ({
      ...d,
      dateDebut: d.dateDebut ? new Date(d.dateDebut) : null,
      dateFin: d.dateFin ? new Date(d.dateFin) : null,
      prochainPrelevement: new Date(d.prochainPrelevement),
    }));
  }

  return data;
}

// Ajouter une nouvelle dette
export async function addDette(data: {
  nom: string;
  type: TypeDette;
  capitalInitial: number;
  capitalRestant: number;
  tauxAnnuel: number;
  mensualite: number;
  jourPrelevement: number;
  dateFin: string;
  preteur: string;
  compteId: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await api("/api/v1/liabilities", { method: "POST", body: data });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur",
    };
  }
}

// Mettre a jour une dette
export async function updateDette(
  detteId: string,
  data: Partial<{
    nom: string;
    capitalRestant: number;
    mensualite: number;
    notes: string;
  }>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api("/api/v1/liabilities/" + detteId, { method: "PUT", body: data });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur",
    };
  }
}

// Supprimer une dette
export async function deleteDette(
  detteId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await api("/api/v1/liabilities/" + detteId, { method: "DELETE" });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur",
    };
  }
}

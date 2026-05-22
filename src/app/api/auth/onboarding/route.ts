import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Onboarding composite endpoint.
 * Appelle plusieurs endpoints backend pour initialiser le compte utilisateur :
 * 1. PUT /api/v1/profile (revenus, epargne, mode de gestion)
 * 2. POST /api/v1/accounts (pour chaque compte)
 * 3. POST /api/v1/recurring-charges (pour chaque charge fixe)
 * 4. PUT /api/v1/categories/:id (budget des enveloppes)
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Non authentifie" },
      { status: 401 },
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const errors: string[] = [];

  try {
    // 1. Mettre à jour le profil
    const profileRes = await fetch(`${API_URL}/api/v1/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        revenusMensuels: body.revenus_mensuels,
        objectifEpargne: body.objectif_epargne,
        modeGestion: "complet",
      }),
    });
    if (!profileRes.ok) {
      errors.push("Erreur mise à jour profil");
    }

    // 2. Créer les comptes
    if (body.comptes?.length > 0) {
      for (const compte of body.comptes) {
        const res = await fetch(`${API_URL}/api/v1/accounts`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            nom: compte.nom,
            banque: compte.banque || "",
            type: compte.type || "courant",
            solde: compte.solde || 0,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errors.push(`Compte "${compte.nom}": ${err.detail || "erreur"}`);
        }
      }
    }

    // 3. Créer les charges fixes
    if (body.charges_fixes?.length > 0) {
      for (const charge of body.charges_fixes) {
        const res = await fetch(`${API_URL}/api/v1/recurring-charges`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            nom: charge.nom,
            montant: charge.montant || 0,
            frequence: "mensuel",
            jourDuMois: charge.jour_prelevement || 1,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errors.push(`Charge "${charge.nom}": ${err.detail || "erreur"}`);
        }
      }
    }

    // 4. Mettre à jour les budgets des enveloppes (catégories)
    if (body.enveloppes?.length > 0) {
      // D'abord récupérer les catégories existantes
      const catsRes = await fetch(`${API_URL}/api/v1/categories`, { headers });
      if (catsRes.ok) {
        const categories = await catsRes.json();
        const catList = Array.isArray(categories) ? categories : categories.categories || [];

        for (const env of body.enveloppes) {
          // Trouver la catégorie par nom (fuzzy: ignore pluriel, accents)
          const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/s$/, "");
          const cat = catList.find(
            (c: { nom: string }) => normalize(c.nom) === normalize(env.nom),
          );
          if (cat) {
            await fetch(`${API_URL}/api/v1/categories/${cat.id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify({
                budgetMensuel: env.budget || 0,
              }),
            });
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: true, warnings: errors },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { detail: (e as Error).message || "Erreur onboarding" },
      { status: 500 },
    );
  }
}

function mapAccountType(type: string): string {
  switch (type) {
    case "courant":
      return "CHECKING";
    case "epargne":
      return "SAVINGS";
    case "cash":
      return "CASH";
    default:
      return "OTHER";
  }
}

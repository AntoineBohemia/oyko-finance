import { NextRequest, NextResponse } from "next/server";
import {
    DEMO_PROFILE,
    DEMO_COMPTES,
    DEMO_CHARGES_FIXES,
    DEMO_ENVELOPPES,
    getDemoTransactions,
    DEMO_INVESTISSEMENTS,
    DEMO_DETTES,
} from "@/lib/data/demo-seed";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ detail: "Non authentifié" }, { status: 401 });
    }

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const stats = { profile: false, comptes: 0, charges: 0, enveloppes: 0, transactions: 0, investissements: 0, dettes: 0 };

    try {
        // 1. Profile
        const profileRes = await fetch(`${API_URL}/api/v1/profile`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                revenusMensuels: DEMO_PROFILE.revenus_mensuels,
                objectifEpargne: DEMO_PROFILE.objectif_epargne,
                modeGestion: DEMO_PROFILE.mode_gestion,
            }),
        });
        stats.profile = profileRes.ok;

        // 2. Accounts
        const compteIds: Record<string, string> = {};
        for (const compte of DEMO_COMPTES) {
            const res = await fetch(`${API_URL}/api/v1/accounts`, {
                method: "POST",
                headers,
                body: JSON.stringify(compte),
            });
            if (res.ok) {
                const data = await res.json();
                compteIds[compte.nom] = data.id;
                stats.comptes++;
            }
        }

        // Use first account as default for transactions
        const defaultCompteId = Object.values(compteIds)[0] || "";

        // 3. Recurring charges
        for (const charge of DEMO_CHARGES_FIXES) {
            const res = await fetch(`${API_URL}/api/v1/recurring-charges`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    nom: charge.nom,
                    montant: charge.montant,
                    frequence: "mensuel",
                    jourDuMois: charge.jour_prelevement,
                }),
            });
            if (res.ok) stats.charges++;
        }

        // 4. Enveloppes (update category budgets)
        const catsRes = await fetch(`${API_URL}/api/v1/categories`, { headers });
        if (catsRes.ok) {
            const categories = await catsRes.json();
            const catList = Array.isArray(categories) ? categories : categories.categories || [];

            const normalize = (s: string) =>
                s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/s$/, "");

            for (const env of DEMO_ENVELOPPES) {
                const cat = catList.find((c: { nom: string }) => normalize(c.nom) === normalize(env.nom));
                if (cat) {
                    const res = await fetch(`${API_URL}/api/v1/categories/${cat.id}`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify({ budgetMensuel: env.budget }),
                    });
                    if (res.ok) stats.enveloppes++;
                }
            }

            // 5. Transactions (need compteId + categorieId)
            const transactions = getDemoTransactions();
            for (const tx of transactions) {
                const cat = catList.find((c: { nom: string }) => normalize(c.nom) === normalize(tx.categorie));
                const res = await fetch(`${API_URL}/api/v1/transactions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        description: tx.description,
                        montant: tx.montant,
                        type: tx.type,
                        dateTransaction: tx.dateTransaction,
                        compteId: defaultCompteId,
                        categorieId: cat?.id || null,
                    }),
                });
                if (res.ok) stats.transactions++;
            }
        }

        // 6. Investments
        for (const inv of DEMO_INVESTISSEMENTS) {
            const res = await fetch(`${API_URL}/api/v1/investments`, {
                method: "POST",
                headers,
                body: JSON.stringify(inv),
            });
            if (res.ok) stats.investissements++;
        }

        // 7. Debts
        for (const dette of DEMO_DETTES) {
            const res = await fetch(`${API_URL}/api/v1/liabilities`, {
                method: "POST",
                headers,
                body: JSON.stringify(dette),
            });
            if (res.ok) stats.dettes++;
        }

        // Set demo mode cookie in response
        const response = NextResponse.json({ success: true, stats });
        response.cookies.set("demo_mode", "true", {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: "lax",
        });

        return response;
    } catch (e) {
        return NextResponse.json(
            { detail: (e as Error).message || "Erreur création démo", stats },
            { status: 500 },
        );
    }
}

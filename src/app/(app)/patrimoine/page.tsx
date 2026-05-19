import { getPatrimoineData } from "@/lib/data/patrimoine";
import PatrimoineClient from "./patrimoine-client";

export default async function PatrimoinePage() {
    let data;
    try {
        data = await getPatrimoineData();
    } catch {
        // Fallback si l'API echoue
        data = {
            profile: null,
            comptes: [],
            investissements: [],
            dettes: [],
            evolutionPatrimoine: [],
            totaux: {
                totalLiquidites: 0,
                totalInvestissements: 0,
                totalActifs: 0,
                totalDettes: 0,
                valeurNette: 0,
                totalPlusValue: 0,
                totalPlusValuePercent: 0,
                totalMensualitesDettes: 0,
            },
        };
    }

    // Sérialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        dettes: (data.dettes || []).map((d) => ({
            ...d,
            prochainPrelevement: d.prochainPrelevement instanceof Date
                ? d.prochainPrelevement.toISOString()
                : (d.prochainPrelevement || new Date().toISOString()),
        })),
    };

    return <PatrimoineClient initialData={serializedData} />;
}

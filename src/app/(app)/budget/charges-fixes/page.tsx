import { getChargesFixesData } from "@/lib/data/charges-fixes";
import ChargesFixesClient from "./charges-fixes-client";

export default async function ChargesFixesPage() {
    const data = await getChargesFixesData();

    // Serialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        chargesFixes: data.chargesFixes.map((cf) => ({
            ...cf,
            prochainPrelevement: cf.prochainPrelevement.toISOString(),
            dateDebut: cf.dateDebut?.toISOString() ?? null,
            dateFin: cf.dateFin?.toISOString() ?? null,
        })),
        timeline: data.timeline.map((cf) => ({
            ...cf,
            prochainPrelevement: cf.prochainPrelevement.toISOString(),
            dateDebut: cf.dateDebut?.toISOString() ?? null,
            dateFin: cf.dateFin?.toISOString() ?? null,
        })),
        totaux: {
            ...data.totaux,
            prochainPrelevement: data.totaux.prochainPrelevement
                ? {
                      ...data.totaux.prochainPrelevement,
                      prochainPrelevement: data.totaux.prochainPrelevement.prochainPrelevement.toISOString(),
                      dateDebut: data.totaux.prochainPrelevement.dateDebut?.toISOString() ?? null,
                      dateFin: data.totaux.prochainPrelevement.dateFin?.toISOString() ?? null,
                  }
                : null,
        },
    };

    return <ChargesFixesClient initialData={serializedData} />;
}

import { getDettesData } from "@/lib/data/dettes";
import DettesClient from "./dettes-client";

export default async function DettesPage() {
    const data = await getDettesData();

    // Serialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        dettes: data.dettes.map((d) => ({
            ...d,
            dateDebut: d.dateDebut?.toISOString() ?? null,
            dateFin: d.dateFin?.toISOString() ?? null,
            prochainPrelevement: d.prochainPrelevement.toISOString(),
        })),
    };

    return <DettesClient initialData={serializedData} />;
}

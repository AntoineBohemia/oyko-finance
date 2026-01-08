import { getPatrimoineData } from "@/lib/data/patrimoine";
import PatrimoineClient from "./patrimoine-client";

export default async function PatrimoinePage() {
    const data = await getPatrimoineData();

    // Sérialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        dettes: data.dettes.map((d) => ({
            ...d,
            prochainPrelevement: d.prochainPrelevement.toISOString(),
        })),
    };

    return <PatrimoineClient initialData={serializedData} />;
}

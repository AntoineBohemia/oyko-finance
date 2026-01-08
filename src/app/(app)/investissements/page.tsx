import { getInvestissementsData } from "@/lib/data/investissements";
import InvestissementsClient from "./investissements-client";

export default async function InvestissementsPage() {
    const data = await getInvestissementsData();

    // Sérialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        investissements: data.investissements.map((inv) => ({
            ...inv,
            dateAchat: inv.dateAchat?.toISOString() ?? null,
        })),
    };

    return <InvestissementsClient initialData={serializedData} />;
}

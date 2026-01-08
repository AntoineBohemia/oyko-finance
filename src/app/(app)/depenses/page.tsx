import { getDepensesData } from "@/lib/data/depenses";
import DepensesClient from "./depenses-client";

interface PageProps {
    searchParams: Promise<{ periode?: string }>;
}

export default async function DepensesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const periode = params.periode || "this-week";

    const data = await getDepensesData(periode);

    // Sérialiser les dates pour le transfert client
    const serializedData = {
        ...data,
        transactions: data.transactions.map((t) => ({
            ...t,
            date: t.date.toISOString(),
        })),
    };

    return (
        <DepensesClient
            initialData={serializedData}
            initialPeriode={periode}
        />
    );
}

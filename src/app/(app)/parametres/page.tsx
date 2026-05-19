import { getParametresData } from "@/lib/data/parametres";
import ParametresClient from "./parametres-client";

export default async function ParametresPage() {
    let data;
    try {
        data = await getParametresData();
    } catch {
        data = {
            profile: null,
            categories: [],
            chargesFixes: [],
            comptes: [],
            totaux: { totalChargesFixes: 0, totalComptes: 0 },
        };
    }

    return <ParametresClient initialData={data} />;
}

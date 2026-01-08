import { getParametresData } from "@/lib/data/parametres";
import ParametresClient from "./parametres-client";

export default async function ParametresPage() {
    const data = await getParametresData();

    return <ParametresClient initialData={data} />;
}

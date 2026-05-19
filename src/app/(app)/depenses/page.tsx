import { redirect } from "next/navigation";

interface PageProps {
    searchParams: Promise<{ periode?: string }>;
}

export default async function DepensesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const periode = params.periode;

    if (periode) {
        redirect(`/budget?tab=transactions&periode=${periode}`);
    }

    redirect("/budget?tab=transactions");
}

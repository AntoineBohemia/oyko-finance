import { redirect } from "next/navigation";

export default function ChargesFixesPage() {
    redirect("/budget?tab=charges-fixes");
}

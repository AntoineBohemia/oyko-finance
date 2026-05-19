import { redirect } from "next/navigation";

export default function AbonnementsRedirect() {
    redirect("/budget?tab=charges-fixes");
}

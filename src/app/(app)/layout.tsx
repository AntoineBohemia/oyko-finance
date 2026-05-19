import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IS_DEV_MODE } from "@/lib/dev/config";
import { AppShell } from "./app-shell";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const devCookie = cookieStore.get("dev_mode")?.value === "true";

  if (!IS_DEV_MODE && !devCookie) {
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
      redirect("/login");
    }
  }

  return <AppShell>{children}</AppShell>;
}

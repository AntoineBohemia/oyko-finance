import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { RouteProvider } from "@/providers/router-provider";
import { QueryProvider } from "@/providers/query-provider";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { cx } from "@/utils/cx";

const fraunces = Fraunces({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-fraunces",
    axes: ["WONK", "SOFT"],
});

export const metadata: Metadata = {
    title: "Oyko — Gérez vos finances personnelles simplement",
    description: "Suivez vos dépenses, gérez votre budget et faites grandir votre patrimoine. Tout en un seul endroit.",
    verification: {
        google: "xU2GYOI0qCbzTTa1zdf2Dlp4FDGYEQiHAJB2V-IF7EA",
    },
};

export const viewport: Viewport = {
    themeColor: "#1C1917",
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={cx(fraunces.variable, GeistSans.variable, GeistMono.variable, "bg-primary antialiased")}>
                <RouteProvider>
                    <QueryProvider>
                        {children}
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                style: {
                                    background: "#1C1917",
                                    color: "#FAFAF9",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontFamily: "var(--font-body)",
                                    fontSize: "14px",
                                },
                            }}
                        />
                    </QueryProvider>
                </RouteProvider>
            </body>
        </html>
    );
}

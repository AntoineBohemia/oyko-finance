"use client";

import { useMemo, useState } from "react";
import { Bank, Calendar, ChevronLeft, ChevronRight, Plus, X, Link01, TrendUp01, TrendDown01, Wallet02, CreditCard01, PiggyBank01, ArrowUpRight } from "@untitledui/icons";
import Link from "next/link";
import { ImportCSVModal } from "./import-csv-modal";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { AnimatedAmount } from "@/components/base/animated-amount/animated-amount";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { PageTransition } from "@/components/base/page-transition/page-transition";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { StaggerList, StaggerItem } from "@/components/base/stagger-list/stagger-list";
import { useCreateTransaction } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, formatDateRelative, getProgressColor, getProgressColorOnDark } from "@/utils/format";
import type { CategorieVariable, PatrimoineData } from "@/lib/data/dashboard";
import type { Profile, Compte } from "@/types/api";

type ViewMode = "semaine" | "mois";

// Types pour les données sérialisées (dates en string)
interface SerializedDashboardData {
    profile: Profile | null;
    comptes: Compte[];
    categories: CategorieVariable[];
    chargesFixes: {
        id: string;
        nom: string;
        montant: number;
        icone: string;
        dateProchain: string;
    }[];
    transactions: {
        id: string;
        description: string;
        montant: number;
        date: string;
        categorieId: string;
        type: "variable" | "fixe" | "revenu";
    }[];
    patrimoine: PatrimoineData;
}

interface DashboardClientProps {
    initialData: SerializedDashboardData;
}

// ============================================
// HELPERS
// ============================================

const getWeekNumber = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

const getWeekDates = (year: number, weekNum: number): { start: Date; end: Date } => {
    const startOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNum - 1) * 7 - startOfYear.getDay() + 1;
    const start = new Date(year, 0, 1 + daysOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
};

const getDaysRemainingInMonth = (date: Date): number => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.getDate() - date.getDate();
};

const getMonthName = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", { month: "long" });
};

const getCompteIcon = (type: string) => {
    switch (type) {
        case "courant": case "CHECKING": return Bank;
        case "epargne": case "SAVINGS": return PiggyBank01;
        case "CREDIT_CARD": return CreditCard01;
        default: return Wallet02;
    }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const queryClient = useQueryClient();
    const createTransaction = useCreateTransaction();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentWeekNum = getWeekNumber(today);
    const currentMonth = today.getMonth();

    const viewMode: ViewMode = (initialData.profile?.mode_gestion === "mois" || initialData.profile?.mode_gestion === "FULL") ? "mois" : "semaine";
    const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isBankConnecting, setIsBankConnecting] = useState(false);
    const [localCategories, setLocalCategories] = useState(initialData.categories);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState<string | null>(null);
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseCompte, setExpenseCompte] = useState(initialData.comptes[0]?.id ?? "");
    const [expenseDate, setExpenseDate] = useState("today");

    const profile = initialData.profile;
    const revenusMensuels = profile?.revenus_mensuels ?? 0;
    const prenom = profile?.prenom ?? "Utilisateur";
    const categories = initialData.categories;
    const budgetVariableMensuel = categories.reduce((acc, cat) => acc + cat.budgetMensuel, 0);

    const chargesFixes = useMemo(() => {
        return initialData.chargesFixes.map((cf) => ({
            ...cf,
            dateProchain: new Date(cf.dateProchain),
        }));
    }, [initialData.chargesFixes]);

    const totalChargesFixes = chargesFixes.reduce((acc, c) => acc + c.montant, 0);

    const transactions = useMemo(() => {
        return initialData.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
        }));
    }, [initialData.transactions]);

    const comptes = initialData.comptes.map((c) => ({
        id: c.id,
        label: c.nom,
        solde: c.solde ?? 0,
        type: c.type ?? "courant",
        banque: c.banque ?? "",
    }));

    const patrimoine = initialData.patrimoine;
    const weekDates = getWeekDates(selectedYear, selectedWeek);
    const daysRemaining = getDaysRemainingInMonth(today);
    const monthName = getMonthName(weekDates.start);

    // Calculs
    const weekTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (t.type !== "variable") return false;
            return t.date >= weekDates.start && t.date <= weekDates.end;
        });
    }, [transactions, weekDates.start, weekDates.end]);

    const depensesMoisVariables = transactions
        .filter((t) => t.type === "variable")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const chargesFixesMois = transactions
        .filter((t) => t.type === "fixe")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const revenusMois = transactions
        .filter((t) => t.type === "revenu")
        .reduce((acc, t) => acc + t.montant, 0);

    const budgetHebdo = budgetVariableMensuel / 4;
    const depenseSemaine = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
    const resteHebdo = budgetHebdo - depenseSemaine;
    const pourcentageHebdo = budgetHebdo > 0 ? (depenseSemaine / budgetHebdo) * 100 : 0;

    const budgetMensuel = budgetVariableMensuel;
    const depenseMois = depensesMoisVariables;
    const resteMois = budgetMensuel - depenseMois;
    const pourcentageMois = budgetMensuel > 0 ? (depenseMois / budgetMensuel) * 100 : 0;

    const disponibleMensuel = revenusMois - chargesFixesMois;

    const budgetData = viewMode === "semaine"
        ? { total: budgetHebdo, spent: depenseSemaine, remaining: resteHebdo, percentage: pourcentageHebdo, label: "Budget Semaine" }
        : { total: budgetMensuel, spent: depenseMois, remaining: resteMois, percentage: pourcentageMois, label: "Budget Mois" };

    const enveloppes = useMemo(() => {
        const monthTransactions = transactions.filter((t) => t.type === "variable");
        return categories.map((cat) => {
            const budgetCat = viewMode === "semaine" ? cat.budgetMensuel / 4 : cat.budgetMensuel;
            const relevantTransactions = viewMode === "semaine" ? weekTransactions : monthTransactions;
            const depenseCat = relevantTransactions
                .filter((t) => t.categorieId === cat.id)
                .reduce((acc, t) => acc + Math.abs(t.montant), 0);
            const resteCat = budgetCat - depenseCat;
            const pourcentageCat = budgetCat > 0 ? (depenseCat / budgetCat) * 100 : 0;
            return { ...cat, budgetHebdo: budgetCat, depense: depenseCat, reste: resteCat, pourcentage: pourcentageCat };
        });
    }, [categories, weekTransactions, transactions, viewMode]);

    const lastTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
    }, [transactions]);

    const hasBankConnection = initialData.comptes.length > 0;

    const prochainsPrelevements = [...chargesFixes]
        .filter((c) => c.dateProchain >= today)
        .sort((a, b) => a.dateProchain.getTime() - b.dateProchain.getTime())
        .slice(0, 4);

    // Navigation
    const goToPreviousWeek = () => {
        if (selectedWeek <= 1) { setSelectedYear((y) => y - 1); setSelectedWeek(52); }
        else { setSelectedWeek((w) => w - 1); }
    };
    const goToNextWeek = () => {
        if (selectedWeek >= 52) { setSelectedYear((y) => y + 1); setSelectedWeek(1); }
        else { setSelectedWeek((w) => w + 1); }
    };
    const canGoPrevious = selectedYear > currentYear - 1 || (selectedYear === currentYear - 1 && selectedWeek > currentWeekNum);
    const canGoNext = selectedYear < currentYear || (selectedYear === currentYear && selectedWeek < currentWeekNum);

    // Handlers
    const handleConnectBank = async () => {
        setIsBankConnecting(true);
        try {
            const res = await fetch("/api/bank/connect", { method: "POST" });
            if (!res.ok) throw new Error("Erreur de connexion");
            const data = await res.json();
            const connectUrl = data.connectUrl || data.connect_url;
            if (connectUrl && !connectUrl.includes("mock-bank")) {
                window.location.href = connectUrl;
                return;
            }
            const syncRes = await fetch("/api/bank/sync", { method: "POST" });
            if (syncRes.ok) {
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                queryClient.invalidateQueries({ queryKey: ["transactions"] });
                queryClient.invalidateQueries({ queryKey: ["accounts"] });
            }
        } catch (error) {
            console.error("Bank connection error:", error);
            setIsBankConnecting(false);
        }
    };

    const resetModal = () => {
        setExpenseAmount(""); setExpenseCategory(null); setExpenseDescription("");
        setExpenseCompte(comptes[0]?.id ?? ""); setExpenseDate("today");
    };

    const handleAddExpense = () => {
        if (!expenseAmount || !expenseCategory || !profile) return;
        let transactionDate = new Date();
        if (expenseDate === "yesterday") transactionDate.setDate(transactionDate.getDate() - 1);
        createTransaction.mutate({
            montant: parseFloat(expenseAmount), categorieId: expenseCategory,
            compteId: expenseCompte, description: expenseDescription || undefined,
            type: "depense", date: transactionDate,
        }, {
            onSuccess: () => {
                setIsExpenseModalOpen(false);
                resetModal();
            },
            onError: (error) => console.error("Erreur:", error),
        });
    };

    // Total solde comptes
    const totalSolde = comptes.reduce((acc, c) => acc + c.solde, 0);

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-primary">Chargement...</h1>
                    <p className="text-tertiary">Récupération de vos données...</p>
                </div>
            </div>
        );
    }

    return (
        <PageTransition className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* HEADER */}
                {/* ============================================ */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="font-display text-display-xs font-semibold text-primary lg:text-display-sm">
                            Bonjour, {prenom}
                        </h1>
                        <p className="text-md text-tertiary">
                            {viewMode === "semaine"
                                ? `Semaine ${selectedWeek} · ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${selectedYear}`
                                : `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${selectedYear}`
                            } · {daysRemaining} jours restants
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {viewMode === "semaine" && (
                            <div className="flex items-center gap-1">
                                <ButtonUtility size="sm" color="secondary" icon={ChevronLeft} onClick={goToPreviousWeek} isDisabled={!canGoPrevious} />
                                <ButtonUtility size="sm" color="secondary" icon={ChevronRight} onClick={goToNextWeek} isDisabled={!canGoNext} />
                            </div>
                        )}
                        <DialogTrigger isOpen={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                            <Button size="md" iconLeading={Plus}>Dépense</Button>
                            <ModalOverlay isDismissable>
                                <Modal className="max-w-md">
                                    <Dialog>
                                        <div className="w-full rounded-xl bg-primary shadow-xl">
                                            <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                                <h3 className="text-lg font-semibold text-primary">Ajouter une dépense</h3>
                                                <ButtonUtility size="sm" color="tertiary" icon={X} onClick={() => { setIsExpenseModalOpen(false); resetModal(); }} />
                                            </div>
                                            <div className="flex flex-col gap-5 px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-primary">Montant *</label>
                                                    <div className="relative">
                                                        <Input type="number" placeholder="0,00" value={expenseAmount} onChange={(v) => setExpenseAmount(v)} inputClassName="text-display-sm font-bold text-center pr-12" size="md" autoFocus />
                                                        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium text-tertiary">€</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-primary">Catégorie *</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {categories.map((cat) => (
                                                            <button key={cat.id} type="button" onClick={() => setExpenseCategory(cat.id)} className={cx("flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-sm font-medium transition-all", expenseCategory === cat.id ? "bg-gray-900 text-white" : "bg-gray-50 text-tertiary hover:bg-gray-100")}>
                                                                <span className="text-xl">{cat.icone}</span>
                                                                <span className="text-xs">{cat.nom}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Input label="Description (optionnel)" placeholder="Carrefour Market" value={expenseDescription} onChange={(v) => setExpenseDescription(v)} size="md" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select label="Compte" selectedKey={expenseCompte} onSelectionChange={(key) => setExpenseCompte(key as string)} items={comptes} size="md">{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
                                                    <Select label="Date" selectedKey={expenseDate} onSelectionChange={(key) => setExpenseDate(key as string)} items={[{ id: "today", label: "Aujourd'hui" }, { id: "yesterday", label: "Hier" }]} size="md">{(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}</Select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                                <Button size="md" color="secondary" onClick={() => { setIsExpenseModalOpen(false); resetModal(); }}>Annuler</Button>
                                                <Button size="md" onClick={handleAddExpense} isDisabled={!expenseAmount || !expenseCategory || createTransaction.isPending}>{createTransaction.isPending ? "Ajout..." : "Ajouter"}</Button>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Modal>
                            </ModalOverlay>
                        </DialogTrigger>
                    </div>
                </div>

                {/* ============================================ */}
                {/* BANNIÈRE ONBOARDING */}
                {/* ============================================ */}

                {/* ============================================ */}
                {/* COMPTES (cartes horizontales) */}
                {/* ============================================ */}
                {comptes.length > 0 ? (
                    <StaggerList className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {comptes.slice(0, 4).map((compte) => {
                            const Icon = getCompteIcon(compte.type);
                            return (
                                <StaggerItem key={compte.id} className="flex items-center gap-4 rounded-lg border border-[#E5E2DC] bg-white p-5 shadow-xs">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                        <Icon className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-tertiary">{compte.label}</p>
                                        <p className="text-xl font-bold text-primary">{formatCurrencySimple(compte.solde)}</p>
                                    </div>
                                </StaggerItem>
                            );
                        })}
                    </StaggerList>
                ) : (
                    <div className="mb-8 flex items-center justify-between rounded-lg border border-[#E5E2DC] bg-white p-6">
                        <div>
                            <p className="font-semibold text-primary">Connectez votre banque</p>
                            <p className="text-sm text-tertiary">Importez automatiquement vos comptes et transactions</p>
                        </div>
                        <Button size="md" iconLeading={isBankConnecting ? undefined : Link01} onClick={handleConnectBank} isDisabled={isBankConnecting}>
                            {isBankConnecting ? "Connexion..." : "Connecter"}
                        </Button>
                    </div>
                )}

                {/* ============================================ */}
                {/* GRILLE PRINCIPALE : Budget + Dépenses par catégorie */}
                {/* ============================================ */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Budget card (3 cols) — Hero card anthracite */}
                    <div className="flex flex-col gap-5 rounded-lg bg-gray-900 p-6 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-300">{budgetData.label}</h2>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">{budgetData.percentage.toFixed(0)}%</span>
                        </div>
                        <div>
                            <AnimatedAmount value={budgetData.spent} className="font-mono text-display-md font-bold tabular-nums text-white lg:text-display-lg" />
                            <span className="ml-2 text-lg text-gray-500">/ {formatCurrencySimple(budgetData.total)}</span>
                        </div>
                        <ProgressBar value={Math.min(budgetData.percentage, 100)} className="h-2 bg-gray-700" progressClassName={budgetData.percentage > 80 ? "bg-[#D97706]" : "bg-[#BEFF00]"} />
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Reste : <span className="font-semibold text-white">{formatCurrencySimple(Math.max(0, budgetData.remaining))}</span></span>
                            <span>{daysRemaining}j restants</span>
                        </div>
                    </div>

                    {/* Résumé mensuel (2 cols) */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs lg:col-span-2">
                        <h2 className="text-sm font-semibold tracking-wider text-tertiary uppercase">Ce mois</h2>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100"><TrendUp01 className="h-4 w-4 text-stone-600" /></div>
                                    <span className="text-sm text-tertiary">Revenus</span>
                                </div>
                                <span className="font-semibold text-primary">{formatCurrencySimple(revenusMois)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100"><TrendDown01 className="h-4 w-4 text-stone-600" /></div>
                                    <span className="text-sm text-tertiary">Dépenses</span>
                                </div>
                                <span className="font-semibold text-primary">{formatCurrencySimple(depensesMoisVariables + chargesFixesMois)}</span>
                            </div>
                            <div className="border-t border-secondary pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-primary">Disponible</span>
                                    <span className="font-mono text-xl font-bold text-gray-900">{formatCurrencySimple(disponibleMensuel)}</span>
                                </div>
                            </div>
                            {patrimoine.valeurNette > 0 && (
                                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                                    <span className="text-xs text-tertiary">Patrimoine net</span>
                                    <span className="text-sm font-semibold text-primary">{formatCurrencySimple(patrimoine.valeurNette)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* ENVELOPPES */}
                {/* ============================================ */}
                {enveloppes.length > 0 && (
                    <div className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary">Enveloppes</h2>
                            {enveloppes.length > 4 && (
                                <Link href="/budget?tab=enveloppes" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                                    Voir toutes ({enveloppes.length})
                                </Link>
                            )}
                        </div>
                        <StaggerList className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {enveloppes.slice(0, 4).map((env) => (
                                <StaggerItem key={env.id} className="flex flex-col gap-3 rounded-lg border border-[#E5E2DC] bg-white p-4 shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{env.icone}</span>
                                        <span className="text-sm font-medium text-primary">{env.nom}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-lg font-semibold text-primary">{formatCurrencySimple(env.depense)}</p>
                                        <p className="text-xs text-tertiary">sur {formatCurrencySimple(env.budgetHebdo)}</p>
                                    </div>
                                    <ProgressBar value={Math.min(env.pourcentage, 100)} className="h-1.5" progressClassName={getProgressColor(env.pourcentage)} />
                                    <p className={cx("text-xs font-medium", env.reste >= 0 ? "text-[#608B00]" : "text-primary")}>
                                        {env.reste >= 0 ? `${formatCurrencySimple(env.reste)} restant` : `${formatCurrencySimple(Math.abs(env.reste))} dépassé`}
                                    </p>
                                </StaggerItem>
                            ))}
                        </StaggerList>
                    </div>
                )}

                {/* ============================================ */}
                {/* DEUX COLONNES : Transactions + Prélèvements */}
                {/* ============================================ */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Transactions récentes */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary">Transactions récentes</h2>
                            <Link href="/budget?tab=transactions" className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700">
                                Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        {lastTransactions.length > 0 ? (
                            <div className="flex flex-col divide-y divide-secondary">
                                {lastTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between rounded-lg px-2 py-3 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className={cx("flex h-9 w-9 items-center justify-center rounded-full", tx.montant < 0 ? "bg-stone-100" : "bg-[#FAFFE4]")}>
                                                {tx.montant < 0
                                                    ? <TrendDown01 className="h-4 w-4 text-stone-600" />
                                                    : <TrendUp01 className="h-4 w-4 text-[#608B00]" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-primary">{tx.description || "Transaction"}</p>
                                                <p className="text-xs text-tertiary">{formatDateRelative(tx.date)}</p>
                                            </div>
                                        </div>
                                        <p className={cx("text-sm font-semibold tabular-nums", tx.montant < 0 ? "text-primary" : "text-[#608B00]")}>
                                            {tx.montant > 0 ? "+" : ""}{formatCurrencySimple(tx.montant)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-[#E5E2DC] bg-white py-16 px-8">
                                <p className="font-display text-lg font-semibold text-primary">Aucune transaction</p>
                                <p className="max-w-sm text-center text-sm text-tertiary">Ajoutez votre premiere depense ou importez vos transactions pour commencer le suivi.</p>
                                <div className="flex gap-2">
                                    <Button size="sm" color="link-color" onClick={() => setIsExpenseModalOpen(true)}>Ajouter</Button>
                                    <Button size="sm" color="link-color" onClick={() => setIsImportModalOpen(true)}>Importer</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prochains prélèvements */}
                    <div className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary">Prochains prélèvements</h2>
                            <Calendar className="h-5 w-5 text-tertiary" />
                        </div>
                        {prochainsPrelevements.length > 0 ? (
                            <div className="flex flex-col divide-y divide-secondary">
                                {prochainsPrelevements.map((charge) => (
                                    <div key={charge.id} className="flex items-center justify-between rounded-lg px-2 py-3 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-lg">{charge.icone}</span>
                                            <div>
                                                <p className="text-sm font-medium text-primary">{charge.nom}</p>
                                                <p className="text-xs text-tertiary">{formatDateRelative(charge.dateProchain)}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold tabular-nums text-primary">{formatCurrencySimple(charge.montant)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-[#E5E2DC] bg-white py-16 px-8">
                                <p className="font-display text-lg font-semibold text-primary">Aucun prelevement</p>
                                <p className="max-w-sm text-center text-sm text-tertiary">Configurez vos charges fixes pour suivre vos prelevements a venir.</p>
                                <Link href="/budget?tab=charges-fixes">
                                    <Button size="sm" color="link-color">Configurer</Button>
                                </Link>
                            </div>
                        )}
                        <Link href="/budget?tab=charges-fixes">
                            <Button size="sm" color="link-color" iconTrailing={ChevronRight} className="w-full justify-center">Voir tout</Button>
                        </Link>
                    </div>
                </div>

                {/* Import CSV Modal */}
                <ImportCSVModal
                    isOpen={isImportModalOpen}
                    onOpenChange={setIsImportModalOpen}
                    profile={profile}
                    categories={localCategories}
                    comptes={comptes.map(c => ({ id: c.id, label: c.label }))}
                    onCategoriesChange={setLocalCategories}
                />
            </div>
        </PageTransition>
    );
}

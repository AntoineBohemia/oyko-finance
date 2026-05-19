"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Settings01, X } from "@untitledui/icons";
import { PageTransition } from "@/components/base/page-transition/page-transition";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, getProgressColor } from "@/utils/format";
import type { BudgetData, Enveloppe, ChargeFixBudget } from "@/lib/data/budget";
import type { Profile } from "@/types/api";

// Types pour les données sérialisées
interface SerializedBudgetData {
    profile: Profile | null;
    revenusMois: number;
    enveloppes: Enveloppe[];
    chargesFixes: ChargeFixBudget[];
    transactions: {
        id: string;
        description: string;
        montant: number;
        date: string;
        categorieId: string;
        type: "variable" | "fixe" | "revenu";
    }[];
    totalChargesFixes: number;
}

interface BudgetClientProps {
    initialData: SerializedBudgetData;
    initialMonth: number;
    initialYear: number;
}

// ============================================
// HELPERS
// ============================================

const getMonthName = (month: number, year: number): string => {
    const date = new Date(year, month);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const getDaysRemainingInMonth = (date: Date): number => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.getDate() - date.getDate();
};

const getWeekDates = (year: number, weekNum: number): { start: Date; end: Date } => {
    const startOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNum - 1) * 7 - startOfYear.getDay() + 1;
    const start = new Date(year, 0, 1 + daysOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
};

const getChargeStatus = (
    charge: ChargeFixBudget,
    today: Date,
    currentMonth: number,
    currentYear: number
): { label: string; color: "success" | "warning" | "gray" } => {
    if (charge.estPreleve) {
        return { label: "Prélevé", color: "success" };
    }

    // Si on regarde un autre mois que le mois courant
    if (today.getMonth() !== currentMonth || today.getFullYear() !== currentYear) {
        return { label: `${charge.jourPrelevement}`, color: "gray" };
    }

    const daysUntil = charge.jourPrelevement - today.getDate();
    if (daysUntil < 0) {
        return { label: "Mois prochain", color: "gray" };
    }
    if (daysUntil === 0) {
        return { label: "Aujourd'hui", color: "warning" };
    }
    if (daysUntil <= 7) {
        return { label: `J-${daysUntil}`, color: "warning" };
    }

    const monthNames = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
    return { label: `${charge.jourPrelevement} ${monthNames[currentMonth]}`, color: "gray" };
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function BudgetClient({ initialData, initialMonth, initialYear }: BudgetClientProps) {
    const router = useRouter();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState({ month: initialMonth, year: initialYear });
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [expandedEnvelope, setExpandedEnvelope] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Données du profil
    const profile = initialData.profile;
    const revenusMois = initialData.revenusMois;
    const enveloppes = initialData.enveloppes;
    const chargesFixes = initialData.chargesFixes;
    const totalChargesFixes = initialData.totalChargesFixes;

    // Transactions avec dates reconverties
    const transactions = useMemo(() => {
        return initialData.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
        }));
    }, [initialData.transactions]);

    // État pour la modale d'édition
    const [editEnvelopes, setEditEnvelopes] = useState(
        enveloppes.map((e) => ({ id: e.id, nom: e.nom, icone: e.icone, budget: e.budgetMensuel }))
    );

    const daysRemaining = getDaysRemainingInMonth(today);
    const monthName = getMonthName(currentMonth.month, currentMonth.year);

    // Calculs pour le budget disponible
    const budgetVariableTotal = enveloppes.reduce((acc, e) => acc + e.budgetMensuel, 0);
    const disponiblePourVariables = revenusMois - totalChargesFixes;

    // Dépenses par enveloppe
    const depensesParEnveloppe = useMemo(() => {
        return enveloppes.map((env) => {
            const depenses = transactions
                .filter((t) => t.type === "variable" && t.categorieId === env.id)
                .reduce((acc, t) => acc + Math.abs(t.montant), 0);
            const reste = env.budgetMensuel - depenses;
            const pourcentage = env.budgetMensuel > 0 ? (depenses / env.budgetMensuel) * 100 : 0;
            const status = pourcentage > 100 ? "above" : pourcentage > 80 ? "watch" : "ok";
            return { ...env, depense: depenses, reste, pourcentage, status };
        });
    }, [enveloppes, transactions]);

    // Total dépensé ce mois (variables uniquement)
    const totalDepenseVariables = depensesParEnveloppe.reduce((acc, e) => acc + e.depense, 0);
    const pourcentageMois = disponiblePourVariables > 0 ? (totalDepenseVariables / disponiblePourVariables) * 100 : 0;
    const resteADepenser = disponiblePourVariables - totalDepenseVariables;

    // Transactions pour l'enveloppe sélectionnée
    const transactionsEnveloppe = useMemo(() => {
        if (!expandedEnvelope) return [];
        return transactions
            .filter((t) => t.type === "variable" && t.categorieId === expandedEnvelope)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [expandedEnvelope, transactions]);

    // Calculs par semaine
    const weeksData = useMemo(() => {
        const weeks = [];
        const budgetHebdo = disponiblePourVariables / 4;

        for (let w = 1; w <= 4; w++) {
            const weekDates = getWeekDates(currentMonth.year, w + (currentMonth.month * 4));
            // Ajuster pour le mois courant
            const monthStart = new Date(currentMonth.year, currentMonth.month, 1);
            const monthEnd = new Date(currentMonth.year, currentMonth.month + 1, 0);

            // Calculer les dates de la semaine dans le mois
            const weekStart = new Date(currentMonth.year, currentMonth.month, 1 + (w - 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            // S'assurer qu'on ne dépasse pas le mois
            if (weekEnd > monthEnd) {
                weekEnd.setTime(monthEnd.getTime());
            }

            const weekTransactions = transactions.filter((t) => {
                if (t.type !== "variable") return false;
                return t.date >= weekStart && t.date <= weekEnd;
            });
            const depense = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
            weeks.push({
                num: w,
                start: weekStart,
                end: weekEnd,
                budget: budgetHebdo,
                depense,
                reste: budgetHebdo - depense,
            });
        }
        return weeks;
    }, [disponiblePourVariables, transactions, currentMonth]);

    // Dépenses par catégorie pour la semaine sélectionnée
    const weekCategoryData = useMemo(() => {
        const week = weeksData[selectedWeek - 1];
        if (!week) return [];

        return enveloppes
            .map((env) => {
                const budgetHebdo = env.budgetMensuel / 4;
                const weekTransactions = transactions.filter((t) => {
                    if (t.type !== "variable" || t.categorieId !== env.id) return false;
                    return t.date >= week.start && t.date <= week.end;
                });
                const depense = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
                return { ...env, budgetHebdo, depense };
            })
            .filter((e) => e.depense > 0);
    }, [selectedWeek, weeksData, enveloppes, transactions]);

    // Navigation mois
    const goToPreviousMonth = () => {
        const newMonth = currentMonth.month === 0 ? 11 : currentMonth.month - 1;
        const newYear = currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year;
        setCurrentMonth({ month: newMonth, year: newYear });
        router.push(`/budget?month=${newMonth}&year=${newYear}`);
    };

    const goToNextMonth = () => {
        const newMonth = currentMonth.month === 11 ? 0 : currentMonth.month + 1;
        const newYear = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year;
        setCurrentMonth({ month: newMonth, year: newYear });
        router.push(`/budget?month=${newMonth}&year=${newYear}`);
    };

    // Handlers
    const handleSaveEnvelopes = async () => {
        if (!profile) return;
        setIsSaving(true);

        try {
            const { updateCategoryBudget } = await import("@/lib/data/budget");
            for (const env of editEnvelopes) {
                await updateCategoryBudget(env.id, env.budget);
            }
            setIsEditModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const totalEditEnvelopes = editEnvelopes.reduce((acc, e) => acc + e.budget, 0);
    const nonAttribue = disponiblePourVariables - totalEditEnvelopes;

    // Message si pas de données
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

    const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    return (
        <PageTransition className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* SECTION 1: HEADER */}
                {/* ============================================ */}
                <div className="mb-6 flex flex-col gap-4 border-b border-secondary pb-5 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-semibold text-primary capitalize lg:text-display-xs">Budget · {monthName}</h1>
                        <p className="text-sm text-tertiary">Gérez vos enveloppes et charges fixes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Button size="sm" color="tertiary" iconLeading={ChevronLeft} onClick={goToPreviousMonth} aria-label="Mois précédent" />
                            <Button size="sm" color="tertiary" iconLeading={ChevronRight} onClick={goToNextMonth} aria-label="Mois suivant" />
                        </div>
                        <DialogTrigger isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                            <Button size="md" color="secondary" iconLeading={Settings01}>
                                Modifier les enveloppes
                            </Button>

                            <ModalOverlay isDismissable>
                                <Modal className="max-w-lg">
                                    <Dialog>
                                        <div className="w-full rounded-xl bg-primary shadow-xl">
                                            {/* Modal Header */}
                                            <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-primary">Modifier les enveloppes</h3>
                                                    <p className="text-sm text-tertiary">Disponible : {formatCurrencySimple(disponiblePourVariables)}/mois</p>
                                                </div>
                                                <ButtonUtility size="sm" color="tertiary" icon={X} onClick={() => setIsEditModalOpen(false)} />
                                            </div>

                                            {/* Modal Body */}
                                            <div className="flex flex-col gap-4 px-6 py-5">
                                                {editEnvelopes.map((env, index) => (
                                                    <div key={env.id} className="flex items-center gap-3">
                                                        <span className="text-xl">{env.icone}</span>
                                                        <span className="min-w-24 text-sm font-medium text-primary">{env.nom}</span>
                                                        <div className="relative flex-1">
                                                            <Input
                                                                type="number"
                                                                value={env.budget.toString()}
                                                                onChange={(v) => {
                                                                    const newEnvelopes = [...editEnvelopes];
                                                                    newEnvelopes[index].budget = parseFloat(v) || 0;
                                                                    setEditEnvelopes(newEnvelopes);
                                                                }}
                                                                inputClassName="text-right pr-8"
                                                                size="sm"
                                                            />
                                                            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-tertiary">€</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="mt-2 border-t border-secondary pt-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-tertiary">Total attribué :</span>
                                                        <span className="font-semibold text-primary">{formatCurrencySimple(totalEditEnvelopes)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-tertiary">Non attribué :</span>
                                                        <span className={cx("font-semibold", nonAttribue < 0 ? "text-finance-loss" : "text-finance-gain")}>
                                                            {formatCurrencySimple(nonAttribue)}
                                                            {nonAttribue < 0 && " ⚠️"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Link href="/parametres">
                                                    <Button size="sm" color="link-color" iconLeading={Plus} className="self-start">
                                                        Ajouter une catégorie
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                                <Button size="md" color="secondary" onClick={() => setIsEditModalOpen(false)}>
                                                    Annuler
                                                </Button>
                                                <Button size="md" onClick={handleSaveEnvelopes} isDisabled={isSaving}>
                                                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                                                </Button>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Modal>
                            </ModalOverlay>
                        </DialogTrigger>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 2: RÉSUMÉ MOIS (Hero Card) */}
                {/* ============================================ */}
                <div className="mb-8 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:p-6">
                    <h2 className="mb-4 text-sm font-semibold tracking-wider text-tertiary uppercase">Résumé du mois</h2>

                    <div className="flex flex-col gap-4">
                        {/* Calcul du disponible */}
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-tertiary">Revenus</span>
                                <span className="font-semibold text-finance-gain">{formatCurrencySimple(revenusMois)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">− Charges fixes</span>
                                <span className="text-primary">{formatCurrencySimple(totalChargesFixes)}</span>
                            </div>
                            <div className="flex justify-between border-t border-tertiary/20 pt-2">
                                <span className="font-medium text-primary">= Disponible pour dépenses variables</span>
                                <span className="font-bold text-primary">{formatCurrencySimple(disponiblePourVariables)}</span>
                            </div>
                        </div>

                        {/* Statut du mois */}
                        <div className="flex flex-col gap-2 rounded-lg bg-primary p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                    <span className="text-sm text-tertiary">Dépensé ce mois : </span>
                                    <span className="text-lg font-semibold text-primary">{formatCurrencySimple(totalDepenseVariables)}</span>
                                    <span className="text-sm text-tertiary"> ({pourcentageMois.toFixed(0)}% du budget)</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div>
                                    <span className="text-sm text-tertiary">Reste à dépenser : </span>
                                    <span className={cx("text-lg font-semibold", resteADepenser >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                        {formatCurrencySimple(Math.abs(resteADepenser))}
                                    </span>
                                    <span className="text-sm text-tertiary"> ({daysRemaining} jours restants)</span>
                                </div>
                            </div>

                            <ProgressBar value={Math.min(pourcentageMois, 100)} className="mt-2 h-3" progressClassName={getProgressColor(pourcentageMois)} />
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 3: ENVELOPPES VARIABLES */}
                {/* ============================================ */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-primary">Enveloppes variables</h2>
                        <Button size="sm" color="link-color" iconTrailing={ChevronRight} onClick={() => setIsEditModalOpen(true)}>
                            Modifier
                        </Button>
                    </div>

                    {enveloppes.length > 0 ? (
                        <>
                            {/* Desktop: Table */}
                            <div className="hidden lg:block">
                                <TableCard.Root className="rounded-xl">
                                    <Table aria-label="Enveloppes">
                                        <Table.Header>
                                            <Table.Head id="categorie" isRowHeader label="Catégorie" className="w-full" />
                                            <Table.Head id="prevu" label="Prévu" />
                                            <Table.Head id="depense" label="Dépensé" />
                                            <Table.Head id="reste" label="Reste" />
                                            <Table.Head id="statut" label="Statut" className="min-w-48" />
                                        </Table.Header>

                                        <Table.Body items={depensesParEnveloppe}>
                                            {(env) => (
                                                <Table.Row
                                                    id={env.id}
                                                    className="cursor-pointer hover:bg-secondary/50"
                                                    onAction={() => setExpandedEnvelope(expandedEnvelope === env.id ? null : env.id)}
                                                >
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{env.icone}</span>
                                                            <span className="text-sm font-medium text-primary">{env.nom}</span>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <span className="text-sm text-tertiary">{formatCurrencySimple(env.budgetMensuel)}</span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <span className="text-sm font-medium text-primary">{formatCurrencySimple(env.depense)}</span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <span className={cx("text-sm font-semibold", env.reste >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                                            {env.reste >= 0 ? formatCurrencySimple(env.reste) : `-${formatCurrencySimple(Math.abs(env.reste))}`}
                                                        </span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-3">
                                                            <ProgressBar
                                                                value={Math.min(env.pourcentage, 100)}
                                                                className="h-2 w-24"
                                                                progressClassName={getProgressColor(env.pourcentage)}
                                                            />
                                                            <Badge
                                                                size="sm"
                                                                type="pill-color"
                                                                color={env.status === "ok" ? "success" : env.status === "watch" ? "gray" : "gray"}
                                                            >
                                                                {env.status === "ok" ? "OK" : env.status === "watch" ? "À surveiller" : "Au-delà du prévu"}
                                                            </Badge>
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            )}
                                        </Table.Body>
                                    </Table>
                                </TableCard.Root>

                                {/* Détail des transactions de l'enveloppe sélectionnée */}
                                {expandedEnvelope && transactionsEnveloppe.length > 0 && (
                                    <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                                        <p className="mb-3 text-sm font-medium text-tertiary">
                                            Transactions - {enveloppes.find((e) => e.id === expandedEnvelope)?.nom}
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {transactionsEnveloppe.map((t) => (
                                                <div key={t.id} className="flex items-center justify-between rounded bg-primary px-3 py-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-primary">{t.description}</span>
                                                        <span className="text-xs text-tertiary">
                                                            {t.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary">{formatCurrencySimple(Math.abs(t.montant))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile: Cards */}
                            <div className="grid grid-cols-2 gap-3 lg:hidden">
                                {depensesParEnveloppe.map((env) => (
                                    <div key={env.id} className="flex flex-col gap-2 rounded-xl bg-primary p-4 border border-[#E5E2DC] bg-white">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{env.icone}</span>
                                            <span className="text-sm font-medium text-primary">{env.nom}</span>
                                        </div>
                                        <p className="text-lg font-semibold text-primary">{formatCurrencySimple(env.depense)}</p>
                                        <p className="text-xs text-tertiary">sur {formatCurrencySimple(env.budgetMensuel)}</p>
                                        <ProgressBar value={Math.min(env.pourcentage, 100)} className="h-1.5" progressClassName={getProgressColor(env.pourcentage)} />
                                        <p className={cx("text-xs font-medium", env.reste >= 0 ? "text-finance-gain" : "text-tertiary")}>
                                            {env.reste >= 0 ? `${formatCurrencySimple(env.reste)} restant` : `${formatCurrencySimple(Math.abs(env.reste))} au-delà`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl bg-secondary p-8 text-center">
                            <p className="text-tertiary">Aucune catégorie de dépense configurée.</p>
                            <Link href="/parametres">
                                <Button size="sm" color="link-color" className="mt-2">
                                    Configurer les catégories
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ============================================ */}
                {/* SECTION 4: CHARGES FIXES */}
                {/* ============================================ */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-primary">Charges fixes</h2>
                        <Link href="/abonnements">
                            <Button size="sm" color="link-color" iconTrailing={ChevronRight}>
                                Gérer les abonnements
                            </Button>
                        </Link>
                    </div>

                    {chargesFixes.length > 0 ? (
                        <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                            <Table aria-label="Charges fixes">
                                <Table.Header>
                                    <Table.Head id="charge" isRowHeader label="Charge" className="w-full" />
                                    <Table.Head id="montant" label="Montant" />
                                    <Table.Head id="statut" label="Statut" />
                                    <Table.Head id="date" label="Date" className="max-lg:hidden" />
                                </Table.Header>

                                <Table.Body items={chargesFixes}>
                                    {(charge) => {
                                        const status = getChargeStatus(charge, today, currentMonth.month, currentMonth.year);
                                        return (
                                            <Table.Row id={charge.id}>
                                                <Table.Cell>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{charge.icone}</span>
                                                        <span className="text-sm font-medium text-primary">{charge.nom}</span>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm font-medium text-primary">{formatCurrencySimple(charge.montant)}</span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex items-center gap-1.5">
                                                        {charge.estPreleve && <Check className="size-3.5 text-success-primary" />}
                                                        <Badge size="sm" type="pill-color" color={status.color}>
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell className="max-lg:hidden">
                                                    <span className="text-sm text-tertiary">
                                                        {charge.jourPrelevement} {monthNames[currentMonth.month].substring(0, 4)}
                                                    </span>
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    }}
                                </Table.Body>
                            </Table>

                            <div className="border-t border-secondary px-4 py-3 lg:px-6">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-primary">Total mensuel</span>
                                    <span className="text-sm font-bold text-primary">{formatCurrencySimple(totalChargesFixes)}</span>
                                </div>
                            </div>
                        </TableCard.Root>
                    ) : (
                        <div className="rounded-xl bg-secondary p-8 text-center">
                            <p className="text-tertiary">Aucune charge fixe configurée.</p>
                            <Link href="/abonnements">
                                <Button size="sm" color="link-color" className="mt-2">
                                    Ajouter des charges fixes
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ============================================ */}
                {/* SECTION 5: VUE SEMAINE */}
                {/* ============================================ */}
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Vue par semaine</h2>

                    {/* Tabs semaines */}
                    <div className="mb-4 flex gap-2 overflow-x-auto px-0.5 pt-0.5 pb-2">
                        {weeksData.map((week) => (
                            <button
                                key={week.num}
                                onClick={() => setSelectedWeek(week.num)}
                                className={cx(
                                    "flex shrink-0 flex-col items-center rounded-lg px-4 py-2 text-sm transition-all",
                                    selectedWeek === week.num
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-50 text-tertiary hover:bg-gray-100",
                                )}
                            >
                                <span className="font-medium">Sem {week.num}</span>
                                <span className="text-xs">{formatCurrencySimple(week.depense)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Détail de la semaine sélectionnée */}
                    {weeksData[selectedWeek - 1] && (
                        <div className="rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset">
                            <div className="mb-4 flex flex-col gap-1">
                                <p className="text-sm font-semibold text-primary">
                                    Semaine {selectedWeek} ({weeksData[selectedWeek - 1].start.getDate()}-{weeksData[selectedWeek - 1].end.getDate()}{" "}
                                    {monthNames[currentMonth.month]})
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="text-tertiary">
                                        Budget : <span className="font-medium text-primary">{formatCurrencySimple(weeksData[selectedWeek - 1].budget)}</span>
                                    </span>
                                    <span className="text-tertiary">
                                        Dépensé : <span className="font-medium text-primary">{formatCurrencySimple(weeksData[selectedWeek - 1].depense)}</span>
                                    </span>
                                    <span className="text-tertiary">
                                        Reste :{" "}
                                        <span
                                            className={cx(
                                                "font-semibold",
                                                weeksData[selectedWeek - 1].reste >= 0 ? "text-finance-gain" : "text-finance-loss",
                                            )}
                                        >
                                            {formatCurrencySimple(Math.abs(weeksData[selectedWeek - 1].reste))}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Par catégorie */}
                            {weekCategoryData.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-medium text-tertiary">Par catégorie :</p>
                                    <div className="flex flex-wrap gap-3">
                                        {weekCategoryData.map((cat) => (
                                            <div key={cat.id} className="flex items-center gap-2 rounded bg-primary px-3 py-2">
                                                <span>{cat.icone}</span>
                                                <span className="text-sm text-tertiary">{cat.nom}</span>
                                                <span className="text-sm font-medium text-primary">
                                                    {formatCurrencySimple(cat.depense)} / {formatCurrencySimple(cat.budgetHebdo)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {weekCategoryData.length === 0 && <p className="text-sm text-tertiary">Aucune dépense cette semaine</p>}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

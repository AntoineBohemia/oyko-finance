"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Edit01, Plus, Settings01, X } from "@untitledui/icons";
import Link from "next/link";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, getProgressColor } from "@/utils/format";

// ============================================
// TYPES
// ============================================

interface Enveloppe {
    id: string;
    nom: string;
    icone: string;
    couleur: string;
    budgetMensuel: number;
}

interface ChargeFix {
    id: string;
    nom: string;
    icone: string;
    montant: number;
    jourPrelevement: number;
    estPreleve: boolean;
}

interface TransactionMois {
    id: string;
    description: string;
    montant: number;
    date: Date;
    categorieId: string;
    type: "variable" | "fixe" | "revenu";
}

// ============================================
// DONNÉES
// ============================================

const REVENUS_MOIS = 1800; // Salaire + Freelance + Aides

const ENVELOPPES: Enveloppe[] = [
    { id: "alim", nom: "Alimentation", icone: "🍔", couleur: "#ef4444", budgetMensuel: 400 },
    { id: "transport", nom: "Transport", icone: "🚇", couleur: "#f97316", budgetMensuel: 100 },
    { id: "loisirs", nom: "Loisirs", icone: "🎮", couleur: "#3b82f6", budgetMensuel: 150 },
    { id: "vetements", nom: "Vêtements", icone: "👕", couleur: "#ec4899", budgetMensuel: 100 },
    { id: "autre", nom: "Autre", icone: "📦", couleur: "#6b7280", budgetMensuel: 100 },
];

const CHARGES_FIXES: ChargeFix[] = [
    { id: "loyer", nom: "Loyer", icone: "🏠", montant: 650, jourPrelevement: 3, estPreleve: true },
    { id: "navigo", nom: "Navigo", icone: "🚇", montant: 86.4, jourPrelevement: 5, estPreleve: true },
    { id: "spotify", nom: "Spotify", icone: "🎵", montant: 5.99, jourPrelevement: 4, estPreleve: true },
    { id: "netflix", nom: "Netflix", icone: "🎬", montant: 13.49, jourPrelevement: 15, estPreleve: false },
    { id: "mobile", nom: "Free Mobile", icone: "📱", montant: 12.99, jourPrelevement: 20, estPreleve: false },
    { id: "icloud", nom: "iCloud+", icone: "☁️", montant: 2.99, jourPrelevement: 12, estPreleve: false },
    { id: "gym", nom: "Basic Fit", icone: "💪", montant: 29.99, jourPrelevement: 1, estPreleve: false },
    { id: "pret", nom: "Prêt étudiant", icone: "🎓", montant: 150, jourPrelevement: 25, estPreleve: false },
];

const TOTAL_CHARGES_FIXES = CHARGES_FIXES.reduce((acc, c) => acc + c.montant, 0);

const TRANSACTIONS_JANVIER: TransactionMois[] = [
    // Variables
    { id: "tr-1", description: "Carrefour", montant: -32.5, date: new Date(2026, 0, 2), categorieId: "alim", type: "variable" },
    { id: "tr-2", description: "Métro tickets", montant: -4.2, date: new Date(2026, 0, 3), categorieId: "transport", type: "variable" },
    { id: "tr-3", description: "Boulangerie", montant: -8.5, date: new Date(2026, 0, 4), categorieId: "alim", type: "variable" },
    { id: "tr-4", description: "Carrefour Market", montant: -47.82, date: new Date(2026, 0, 6), categorieId: "alim", type: "variable" },
    { id: "tr-5", description: "Uber", montant: -12.5, date: new Date(2026, 0, 6), categorieId: "transport", type: "variable" },
    { id: "tr-6", description: "Cinéma", montant: -11.5, date: new Date(2026, 0, 7), categorieId: "loisirs", type: "variable" },
    { id: "tr-7", description: "Picard", montant: -23.4, date: new Date(2026, 0, 8), categorieId: "alim", type: "variable" },
    { id: "tr-8", description: "Zara", montant: -45.0, date: new Date(2026, 0, 9), categorieId: "vetements", type: "variable" },
    { id: "tr-9", description: "Amazon", montant: -19.99, date: new Date(2026, 0, 10), categorieId: "autre", type: "variable" },
    { id: "tr-10", description: "Uber Eats", montant: -18.5, date: new Date(2026, 0, 10), categorieId: "alim", type: "variable" },
    { id: "tr-11", description: "Cinéma UGC", montant: -12.5, date: new Date(2026, 0, 11), categorieId: "loisirs", type: "variable" },
    // Fixes
    { id: "tr-f1", description: "Loyer", montant: -650, date: new Date(2026, 0, 3), categorieId: "loyer", type: "fixe" },
    { id: "tr-f2", description: "Navigo", montant: -86.4, date: new Date(2026, 0, 5), categorieId: "navigo", type: "fixe" },
    { id: "tr-f3", description: "Spotify", montant: -5.99, date: new Date(2026, 0, 4), categorieId: "spotify", type: "fixe" },
    // Revenus
    { id: "tr-r1", description: "Salaire", montant: 1450, date: new Date(2026, 0, 5), categorieId: "salaire", type: "revenu" },
    { id: "tr-r2", description: "Freelance", montant: 350, date: new Date(2026, 0, 2), categorieId: "freelance", type: "revenu" },
];

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

const getChargeStatus = (charge: ChargeFix, today: Date): { label: string; color: "success" | "warning" | "gray" } => {
    if (charge.estPreleve) {
        return { label: "Prélevé", color: "success" };
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
    return { label: `${charge.jourPrelevement} janv`, color: "gray" };
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function BudgetPage() {
    const today = new Date(2026, 0, 11); // Simule le 11 janvier 2026
    const [currentMonth, setCurrentMonth] = useState({ month: 0, year: 2026 });
    const [selectedWeek, setSelectedWeek] = useState(2);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [expandedEnvelope, setExpandedEnvelope] = useState<string | null>(null);

    // État pour la modale d'édition
    const [editEnvelopes, setEditEnvelopes] = useState(ENVELOPPES.map((e) => ({ id: e.id, nom: e.nom, icone: e.icone, budget: e.budgetMensuel })));

    const daysRemaining = getDaysRemainingInMonth(today);
    const monthName = getMonthName(currentMonth.month, currentMonth.year);

    // Calculs pour le budget disponible
    const budgetVariableTotal = ENVELOPPES.reduce((acc, e) => acc + e.budgetMensuel, 0);
    const disponiblePourVariables = REVENUS_MOIS - TOTAL_CHARGES_FIXES;

    // Dépenses par enveloppe
    const depensesParEnveloppe = useMemo(() => {
        return ENVELOPPES.map((env) => {
            const depenses = TRANSACTIONS_JANVIER.filter((t) => t.type === "variable" && t.categorieId === env.id).reduce(
                (acc, t) => acc + Math.abs(t.montant),
                0,
            );
            const reste = env.budgetMensuel - depenses;
            const pourcentage = (depenses / env.budgetMensuel) * 100;
            const status = pourcentage > 100 ? "depasse" : pourcentage > 80 ? "attention" : "ok";
            return { ...env, depense: depenses, reste, pourcentage, status };
        });
    }, []);

    // Total dépensé ce mois (variables uniquement)
    const totalDepenseVariables = depensesParEnveloppe.reduce((acc, e) => acc + e.depense, 0);
    const pourcentageMois = (totalDepenseVariables / disponiblePourVariables) * 100;
    const resteADepenser = disponiblePourVariables - totalDepenseVariables;

    // Transactions pour l'enveloppe sélectionnée
    const transactionsEnveloppe = useMemo(() => {
        if (!expandedEnvelope) return [];
        return TRANSACTIONS_JANVIER.filter((t) => t.type === "variable" && t.categorieId === expandedEnvelope).sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
        );
    }, [expandedEnvelope]);

    // Calculs par semaine
    const weeksData = useMemo(() => {
        const weeks = [];
        const budgetHebdo = disponiblePourVariables / 4;

        for (let w = 1; w <= 4; w++) {
            const weekDates = getWeekDates(2026, w);
            const weekTransactions = TRANSACTIONS_JANVIER.filter((t) => {
                if (t.type !== "variable") return false;
                return t.date >= weekDates.start && t.date <= weekDates.end;
            });
            const depense = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
            weeks.push({
                num: w,
                start: weekDates.start,
                end: weekDates.end,
                budget: budgetHebdo,
                depense,
                reste: budgetHebdo - depense,
            });
        }
        return weeks;
    }, [disponiblePourVariables]);

    // Dépenses par catégorie pour la semaine sélectionnée
    const weekCategoryData = useMemo(() => {
        const week = weeksData[selectedWeek - 1];
        if (!week) return [];

        return ENVELOPPES.map((env) => {
            const budgetHebdo = env.budgetMensuel / 4;
            const weekTransactions = TRANSACTIONS_JANVIER.filter((t) => {
                if (t.type !== "variable" || t.categorieId !== env.id) return false;
                return t.date >= week.start && t.date <= week.end;
            });
            const depense = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
            return { ...env, budgetHebdo, depense };
        }).filter((e) => e.depense > 0);
    }, [selectedWeek, weeksData]);

    // Navigation mois
    const goToPreviousMonth = () => {
        setCurrentMonth((prev) => {
            if (prev.month === 0) return { month: 11, year: prev.year - 1 };
            return { month: prev.month - 1, year: prev.year };
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth((prev) => {
            if (prev.month === 11) return { month: 0, year: prev.year + 1 };
            return { month: prev.month + 1, year: prev.year };
        });
    };

    // Handlers
    const handleSaveEnvelopes = () => {
        console.log("Enveloppes sauvegardées:", editEnvelopes);
        setIsEditModalOpen(false);
    };

    const totalEditEnvelopes = editEnvelopes.reduce((acc, e) => acc + e.budget, 0);
    const nonAttribue = disponiblePourVariables - totalEditEnvelopes;

    return (
        <div className="min-h-screen bg-primary">
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

                                            <Button size="sm" color="link-color" iconLeading={Plus} className="self-start">
                                                Ajouter une catégorie
                                            </Button>
                                        </div>

                                        {/* Modal Footer */}
                                        <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                            <Button size="md" color="secondary" onClick={() => setIsEditModalOpen(false)}>
                                                Annuler
                                            </Button>
                                            <Button size="md" onClick={handleSaveEnvelopes}>
                                                Enregistrer
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
                                <span className="font-semibold text-finance-gain">{formatCurrencySimple(REVENUS_MOIS)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-tertiary">− Charges fixes</span>
                                <span className="text-primary">{formatCurrencySimple(TOTAL_CHARGES_FIXES)}</span>
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
                                                        color={env.status === "ok" ? "success" : env.status === "attention" ? "warning" : "error"}
                                                    >
                                                        {env.status === "ok" ? "OK" : env.status === "attention" ? "Attention" : "Dépassé"}
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
                                    Transactions - {ENVELOPPES.find((e) => e.id === expandedEnvelope)?.nom}
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
                            <div key={env.id} className="flex flex-col gap-2 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{env.icone}</span>
                                    <span className="text-sm font-medium text-primary">{env.nom}</span>
                                </div>
                                <p className="text-lg font-semibold text-primary">{formatCurrencySimple(env.depense)}</p>
                                <p className="text-xs text-tertiary">sur {formatCurrencySimple(env.budgetMensuel)}</p>
                                <ProgressBar value={Math.min(env.pourcentage, 100)} className="h-1.5" progressClassName={getProgressColor(env.pourcentage)} />
                                <p className={cx("text-xs font-medium", env.reste >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                    {env.reste >= 0 ? `${formatCurrencySimple(env.reste)} restant` : `${formatCurrencySimple(Math.abs(env.reste))} dépassé`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 4: CHARGES FIXES */}
                {/* ============================================ */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-primary">Charges fixes</h2>
                        <Link href="/parametres">
                            <Button size="sm" color="link-color" iconTrailing={ChevronRight}>
                                Gérer les abonnements
                            </Button>
                        </Link>
                    </div>

                    <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                        <Table aria-label="Charges fixes">
                            <Table.Header>
                                <Table.Head id="charge" isRowHeader label="Charge" className="w-full" />
                                <Table.Head id="montant" label="Montant" />
                                <Table.Head id="statut" label="Statut" />
                                <Table.Head id="date" label="Date" className="max-lg:hidden" />
                            </Table.Header>

                            <Table.Body items={CHARGES_FIXES}>
                                {(charge) => {
                                    const status = getChargeStatus(charge, today);
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
                                                <span className="text-sm text-tertiary">{charge.jourPrelevement} janv</span>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                }}
                            </Table.Body>
                        </Table>

                        <div className="border-t border-secondary px-4 py-3 lg:px-6">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-primary">Total mensuel</span>
                                <span className="text-sm font-bold text-primary">{formatCurrencySimple(TOTAL_CHARGES_FIXES)}</span>
                            </div>
                        </div>
                    </TableCard.Root>
                </div>

                {/* ============================================ */}
                {/* SECTION 5: VUE SEMAINE */}
                {/* ============================================ */}
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Vue par semaine</h2>

                    {/* Tabs semaines */}
                    <div className="e mb-4 flex gap-2 overflow-x-auto px-0.5 pt-0.5 pb-2">
                        {weeksData.map((week) => (
                            <button
                                key={week.num}
                                onClick={() => setSelectedWeek(week.num)}
                                className={cx(
                                    "flex shrink-0 flex-col items-center rounded-lg px-4 py-2 text-sm transition-all",
                                    selectedWeek === week.num
                                        ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500"
                                        : "bg-secondary text-tertiary hover:bg-secondary_hover",
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
                                    Semaine {selectedWeek} ({weeksData[selectedWeek - 1].start.getDate()}-{weeksData[selectedWeek - 1].end.getDate()} janvier)
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
        </div>
    );
}

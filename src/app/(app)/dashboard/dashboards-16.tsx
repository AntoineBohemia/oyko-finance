"use client";

import { useMemo, useState } from "react";
import { ArrowUp, Calendar, ChevronLeft, ChevronRight, Plus, X } from "@untitledui/icons";
import Link from "next/link";
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, formatDateRelative, getProgressColor, getProgressColorOnDark } from "@/utils/format";

// ============================================
// DONNÉES UTILISATEUR
// ============================================

const USER_PROFILE = {
    prenom: "Antoine",
    objectifEpargneMensuel: 200,
    revenusMensuels: 1980, // Salaire + Freelance + Aides
};

// ============================================
// CATÉGORIES VARIABLES (Enveloppes)
// ============================================

interface CategorieVariable {
    id: string;
    nom: string;
    icone: string;
    couleur: string;
    budgetMensuel: number;
}

const CATEGORIES_VARIABLES: CategorieVariable[] = [
    { id: "alim", nom: "Alimentation", icone: "🍔", couleur: "#ef4444", budgetMensuel: 400 },
    { id: "transport", nom: "Transport", icone: "🚇", couleur: "#f97316", budgetMensuel: 100 },
    { id: "loisirs", nom: "Loisirs", icone: "🎮", couleur: "#3b82f6", budgetMensuel: 150 },
    { id: "vetements", nom: "Vêtements", icone: "👕", couleur: "#ec4899", budgetMensuel: 80 },
    { id: "autre", nom: "Autre", icone: "📦", couleur: "#6b7280", budgetMensuel: 53.15 },
];

const BUDGET_VARIABLE_MENSUEL = CATEGORIES_VARIABLES.reduce((acc, cat) => acc + cat.budgetMensuel, 0);

// ============================================
// CHARGES FIXES
// ============================================

interface ChargeFix {
    id: string;
    nom: string;
    montant: number;
    icone: string;
    dateProchain: Date;
}

const CHARGES_FIXES: ChargeFix[] = [
    { id: "loyer", nom: "Loyer", montant: 650, icone: "🏠", dateProchain: new Date(2026, 1, 3) },
    { id: "navigo", nom: "Navigo", montant: 86.4, icone: "🚇", dateProchain: new Date(2026, 1, 5) },
    { id: "spotify", nom: "Spotify", montant: 5.99, icone: "🎵", dateProchain: new Date(2026, 1, 4) },
    { id: "netflix", nom: "Netflix", montant: 13.49, icone: "🎬", dateProchain: new Date(2026, 0, 15) },
    { id: "mobile", nom: "Free Mobile", montant: 12.99, icone: "📱", dateProchain: new Date(2026, 0, 20) },
    { id: "gym", nom: "Basic Fit", montant: 29.99, icone: "🏋️", dateProchain: new Date(2026, 1, 1) },
    { id: "pret", nom: "Prêt étudiant", montant: 150, icone: "🎓", dateProchain: new Date(2026, 0, 25) },
];

const TOTAL_CHARGES_FIXES = CHARGES_FIXES.reduce((acc, c) => acc + c.montant, 0);

// ============================================
// TRANSACTIONS JANVIER 2026
// ============================================

interface TransactionJanvier {
    id: string;
    description: string;
    montant: number;
    date: Date;
    categorieId: string;
    type: "variable" | "fixe" | "revenu";
}

const TRANSACTIONS_JANVIER: TransactionJanvier[] = [
    // Semaine 1 (1-5 janv)
    { id: "tr-1", description: "Carrefour", montant: -32.5, date: new Date(2026, 0, 2), categorieId: "alim", type: "variable" },
    { id: "tr-2", description: "Métro tickets", montant: -4.2, date: new Date(2026, 0, 3), categorieId: "transport", type: "variable" },
    { id: "tr-3", description: "Loyer Janvier", montant: -650, date: new Date(2026, 0, 3), categorieId: "loyer", type: "fixe" },
    { id: "tr-4", description: "Boulangerie", montant: -8.5, date: new Date(2026, 0, 4), categorieId: "alim", type: "variable" },
    { id: "tr-5", description: "Spotify", montant: -5.99, date: new Date(2026, 0, 4), categorieId: "spotify", type: "fixe" },
    { id: "tr-6", description: "Salaire", montant: 1450, date: new Date(2026, 0, 5), categorieId: "salaire", type: "revenu" },
    { id: "tr-7", description: "Navigo", montant: -86.4, date: new Date(2026, 0, 5), categorieId: "navigo", type: "fixe" },

    // Semaine 2 (6-12 janv)
    { id: "tr-8", description: "Carrefour Market", montant: -47.82, date: new Date(2026, 0, 6), categorieId: "alim", type: "variable" },
    { id: "tr-9", description: "Uber", montant: -12.5, date: new Date(2026, 0, 6), categorieId: "transport", type: "variable" },
    { id: "tr-10", description: "Cinéma", montant: -11.5, date: new Date(2026, 0, 7), categorieId: "loisirs", type: "variable" },
    { id: "tr-11", description: "Picard", montant: -23.4, date: new Date(2026, 0, 8), categorieId: "alim", type: "variable" },
    { id: "tr-12", description: "Zara", montant: -45.0, date: new Date(2026, 0, 9), categorieId: "vetements", type: "variable" },
    { id: "tr-13", description: "Amazon", montant: -19.99, date: new Date(2026, 0, 10), categorieId: "autre", type: "variable" },
];

// ============================================
// COMPTES (pour la modale)
// ============================================

const COMPTES = [
    { id: "courant", label: "Compte courant", solde: 1847.32 },
    { id: "cash", label: "Cash", solde: 85 },
    { id: "n26", label: "N26", solde: 124.5 },
];

// ============================================
// CALCULS DE DATES ET SEMAINES
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

// ============================================
// PATRIMOINE RAPIDE
// ============================================

const PATRIMOINE = {
    valeurNette: 9518.62,
    variationMois: 0.4, // +0.4% ce mois
};

// Données fictives pour la répartition du patrimoine par type d'actif
// Utilise les nouvelles couleurs standardisées --color-asset-*
const REPARTITION_PATRIMOINE = [
    { name: "Liquidités", value: 2056.82, className: "text-asset-liquidity" },
    { name: "Épargne", value: 4500, className: "text-asset-savings" },
    { name: "Assurance vie", value: 1850, className: "text-asset-stocks" },
    { name: "Actions", value: 890, className: "text-asset-real-estate" },
    { name: "Crypto", value: 221.8, className: "text-asset-crypto" },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function AccueilPage() {
    const today = new Date(2026, 0, 7); // Simule le 7 janvier 2026
    const currentWeekNum = getWeekNumber(today);
    const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // État de la modale
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState<string | null>(null);
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseCompte, setExpenseCompte] = useState("courant");
    const [expenseDate, setExpenseDate] = useState("today");

    const weekDates = getWeekDates(today.getFullYear(), selectedWeek);
    const daysRemaining = getDaysRemainingInMonth(today);
    const monthName = getMonthName(today);
    const year = today.getFullYear();

    // Calcul des dépenses de la semaine sélectionnée
    const weekTransactions = useMemo(() => {
        return TRANSACTIONS_JANVIER.filter((t) => {
            if (t.type !== "variable") return false;
            const transDate = t.date;
            return transDate >= weekDates.start && transDate <= weekDates.end;
        });
    }, [selectedWeek, weekDates.start, weekDates.end]);

    // Budget hebdomadaire
    const budgetHebdo = BUDGET_VARIABLE_MENSUEL / 4;
    const depenseSemaine = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
    const resteHebdo = budgetHebdo - depenseSemaine;
    const pourcentageHebdo = (depenseSemaine / budgetHebdo) * 100;

    // Calcul par catégorie (enveloppe)
    const enveloppes = useMemo(() => {
        return CATEGORIES_VARIABLES.map((cat) => {
            const budgetHebdoCat = cat.budgetMensuel / 4;
            const depenseCat = weekTransactions.filter((t) => t.categorieId === cat.id).reduce((acc, t) => acc + Math.abs(t.montant), 0);
            const resteCat = budgetHebdoCat - depenseCat;
            const pourcentageCat = (depenseCat / budgetHebdoCat) * 100;
            return {
                ...cat,
                budgetHebdo: budgetHebdoCat,
                depense: depenseCat,
                reste: resteCat,
                pourcentage: pourcentageCat,
            };
        });
    }, [weekTransactions]);

    // Calcul du résumé du mois
    const depensesMoisVariables = TRANSACTIONS_JANVIER.filter((t) => t.type === "variable").reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const chargesFixesMois = TRANSACTIONS_JANVIER.filter((t) => t.type === "fixe").reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const revenusMois = TRANSACTIONS_JANVIER.filter((t) => t.type === "revenu").reduce((acc, t) => acc + t.montant, 0);

    // Prochains prélèvements (tri par date)
    const prochainsPrelevements = [...CHARGES_FIXES]
        .filter((c) => c.dateProchain >= today)
        .sort((a, b) => a.dateProchain.getTime() - b.dateProchain.getTime())
        .slice(0, 4);

    // Navigation semaine
    const goToPreviousWeek = () => setSelectedWeek((w) => Math.max(1, w - 1));
    const goToNextWeek = () => setSelectedWeek((w) => Math.min(52, w + 1));

    // Reset modal state
    const resetModal = () => {
        setExpenseAmount("");
        setExpenseCategory(null);
        setExpenseDescription("");
        setExpenseCompte("courant");
        setExpenseDate("today");
    };

    const handleAddExpense = () => {
        // Ici on ajouterait la logique pour sauvegarder la dépense
        console.log({
            montant: parseFloat(expenseAmount),
            categorie: expenseCategory,
            description: expenseDescription,
            compte: expenseCompte,
            date: expenseDate,
        });
        setIsExpenseModalOpen(false);
        resetModal();
    };

    return (
        <div className="min-h-screen bg-primary">
            <div className="mx-auto max-w-container px-4 py-6 lg:px-8 lg:py-8">
                {/* ============================================ */}
                {/* SECTION 1: HEADER */}
                {/* ============================================ */}
                <div className="mb-6 flex flex-col gap-4 border-b border-secondary pb-5 lg:mb-8">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
                                Semaine {selectedWeek} · {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
                            </h1>
                            <p className="text-sm text-tertiary">{daysRemaining} jours restants ce mois</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" color="secondary" iconLeading={ChevronLeft} onClick={goToPreviousWeek} isDisabled={selectedWeek <= 1}>
                                Sem. {selectedWeek - 1}
                            </Button>
                            <Button size="sm" color="secondary" iconTrailing={ChevronRight} onClick={goToNextWeek} isDisabled={selectedWeek >= 52}>
                                Sem. {selectedWeek + 1}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 2: CARD BUDGET SEMAINE (Hero) */}
                {/* ============================================ */}
                <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 shadow-lg lg:p-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-semibold text-white/90">Budget Semaine</h2>
                            <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-display-md font-bold text-white lg:text-display-lg">{formatCurrencySimple(depenseSemaine)}</span>
                                <span className="text-lg text-white/70">/ {formatCurrencySimple(budgetHebdo)}</span>
                                <span className="text-sm text-white/60">({pourcentageHebdo.toFixed(0)}%)</span>
                            </div>
                            <p className="text-md text-white/80">
                                Reste : <span className="font-semibold">{formatCurrencySimple(Math.max(0, resteHebdo))}</span>
                            </p>
                        </div>

                        <ProgressBar
                            value={Math.min(pourcentageHebdo, 100)}
                            className="h-3 bg-white/20"
                            progressClassName={getProgressColorOnDark(pourcentageHebdo)}
                        />

                        <DialogTrigger isOpen={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                            <Button
                                size="lg"
                                color="secondary"
                                iconLeading={Plus}
                                className="w-full justify-center bg-white text-brand-700 hover:bg-white/90 sm:w-auto"
                            >
                                Ajouter une dépense
                            </Button>

                            <ModalOverlay isDismissable>
                                <Modal className="max-w-md">
                                    <Dialog>
                                        <div className="w-full rounded-xl bg-primary shadow-xl">
                                            {/* Modal Header */}
                                            <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                                <h3 className="text-lg font-semibold text-primary">Ajouter une dépense</h3>
                                                <ButtonUtility
                                                    size="sm"
                                                    color="tertiary"
                                                    icon={X}
                                                    onClick={() => {
                                                        setIsExpenseModalOpen(false);
                                                        resetModal();
                                                    }}
                                                />
                                            </div>

                                            {/* Modal Body */}
                                            <div className="flex flex-col gap-5 px-6 py-5">
                                                {/* Montant */}
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-primary">Montant *</label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder="0,00"
                                                            value={expenseAmount}
                                                            onChange={(v) => setExpenseAmount(v)}
                                                            inputClassName="text-display-sm font-bold text-center pr-12"
                                                            size="md"
                                                            autoFocus
                                                        />
                                                        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium text-tertiary">€</span>
                                                    </div>
                                                </div>

                                                {/* Catégorie */}
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-medium text-primary">Catégorie *</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {CATEGORIES_VARIABLES.map((cat) => (
                                                            <button
                                                                key={cat.id}
                                                                type="button"
                                                                onClick={() => setExpenseCategory(cat.id)}
                                                                className={cx(
                                                                    "flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                                                    expenseCategory === cat.id
                                                                        ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500"
                                                                        : "bg-secondary text-tertiary hover:bg-secondary_hover",
                                                                )}
                                                            >
                                                                <span className="text-xl">{cat.icone}</span>
                                                                <span className="text-xs">{cat.nom}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <Input
                                                    label="Description (optionnel)"
                                                    placeholder="Carrefour Market"
                                                    value={expenseDescription}
                                                    onChange={(v) => setExpenseDescription(v)}
                                                    size="md"
                                                />

                                                {/* Compte et Date */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select
                                                        label="Compte"
                                                        selectedKey={expenseCompte}
                                                        onSelectionChange={(key) => setExpenseCompte(key as string)}
                                                        items={COMPTES}
                                                        size="md"
                                                    >
                                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                                    </Select>

                                                    <Select
                                                        label="Date"
                                                        selectedKey={expenseDate}
                                                        onSelectionChange={(key) => setExpenseDate(key as string)}
                                                        items={[
                                                            { id: "today", label: "Aujourd'hui" },
                                                            { id: "yesterday", label: "Hier" },
                                                            { id: "other", label: "Autre..." },
                                                        ]}
                                                        size="md"
                                                    >
                                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                                <Button
                                                    size="md"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setIsExpenseModalOpen(false);
                                                        resetModal();
                                                    }}
                                                >
                                                    Annuler
                                                </Button>
                                                <Button size="md" onClick={handleAddExpense} isDisabled={!expenseAmount || !expenseCategory}>
                                                    Ajouter
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
                {/* SECTION 3: ENVELOPPES */}
                {/* ============================================ */}
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Enveloppes</h2>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
                        {enveloppes.map((env) => (
                            <button
                                key={env.id}
                                className="flex flex-col gap-3 rounded-xl bg-primary p-4 text-left shadow-xs ring-1 ring-secondary transition-all ring-inset hover:shadow-md hover:ring-brand-200"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{env.icone}</span>
                                    <span className="text-sm font-medium text-primary">{env.nom}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-lg font-semibold text-primary">{formatCurrencySimple(env.depense)}</p>
                                    <p className="text-xs text-tertiary">sur {formatCurrencySimple(env.budgetHebdo)}</p>
                                </div>
                                <ProgressBar value={Math.min(env.pourcentage, 100)} className="h-1.5" progressClassName={getProgressColor(env.pourcentage)} />
                                <p className={cx("text-xs font-medium", env.reste >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                    {env.reste >= 0 ? `${formatCurrencySimple(env.reste)} restant` : `${formatCurrencySimple(Math.abs(env.reste))} dépassé`}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 4: RÉSUMÉ DU MOIS */}
                {/* ============================================ */}
                <div className="mb-8 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset lg:p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-primary">Résumé du mois</h2>
                        <Link href="/budget">
                            <Button size="sm" color="link-color" iconTrailing={ChevronRight}>
                                Voir le budget complet
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-tertiary">Revenus</span>
                            <span className="text-xl font-semibold text-finance-gain">{formatCurrencySimple(revenusMois)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-tertiary">Charges fixes</span>
                            <span className="text-xl font-semibold text-primary">{formatCurrencySimple(chargesFixesMois)}</span>
                            <span className="text-xs text-tertiary">/{formatCurrencySimple(TOTAL_CHARGES_FIXES)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-tertiary">Variable prévu</span>
                            <span className="text-xl font-semibold text-primary">{formatCurrencySimple(BUDGET_VARIABLE_MENSUEL)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-tertiary">Épargne</span>
                            <span className="text-xl font-semibold text-utility-blue-500">{formatCurrencySimple(USER_PROFILE.objectifEpargneMensuel)}</span>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 5: DEUX COLONNES */}
                {/* ============================================ */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Colonne gauche: PATRIMOINE RAPIDE */}
                    <div className="flex flex-col gap-4 rounded-xl p-5 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-tertiary">Valeur nette</span>
                            <BadgeWithIcon type="pill-color" color="success" iconLeading={ArrowUp} size="sm" className="shrink-0 whitespace-nowrap">
                                +{PATRIMOINE.variationMois}% ce mois
                            </BadgeWithIcon>
                        </div>

                        {/* Donut Chart avec valeur au centre - Taille md */}
                        <div className="relative mx-auto flex flex-1 items-center justify-center">
                            <ResponsiveContainer width={240} height={240}>
                                <RechartsPieChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                    <Tooltip content={<ChartTooltipContent isPieChart />} formatter={(value) => formatCurrencySimple(value as number)} />
                                    <Pie
                                        isAnimationActive={false}
                                        startAngle={-270}
                                        endAngle={-630}
                                        stroke="none"
                                        data={REPARTITION_PATRIMOINE}
                                        dataKey="value"
                                        nameKey="name"
                                        fill="currentColor"
                                        innerRadius={72}
                                        outerRadius={115}
                                        className="[&_.recharts-sector]:cursor-pointer [&_.recharts-sector]:transition-[filter,opacity] [&_.recharts-sector]:duration-200 [&_.recharts-sector:hover]:brightness-110 [&_.recharts-sector:hover]:drop-shadow-md"
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                            {/* Valeur au centre */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl font-semibold text-primary">{formatCurrencySimple(PATRIMOINE.valeurNette)}</p>
                                <p className="text-xs text-tertiary">Total</p>
                            </div>
                        </div>

                        {/* Légende compacte */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                            {REPARTITION_PATRIMOINE.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5">
                                    <span className={cx("h-2 w-2 rounded-full", item.className, "bg-current")} />
                                    <span className="text-xs text-tertiary">{item.name}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/patrimoine">
                            <Button size="sm" color="link-color" iconTrailing={ChevronRight} className="w-full justify-center">
                                Voir détails
                            </Button>
                        </Link>
                    </div>

                    {/* Colonne droite: PROCHAINS PRÉLÈVEMENTS */}
                    <div className="flex flex-col gap-4 rounded-xl p-5 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-primary">Prochains prélèvements</p>
                            <FeaturedIcon size="sm" color="gray" theme="modern" icon={Calendar} />
                        </div>
                        <div className="flex flex-col gap-2">
                            {prochainsPrelevements.map((charge) => (
                                <div key={charge.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{charge.icone}</span>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium text-primary">{charge.nom}</p>
                                            <p className="text-xs text-tertiary">{formatDateRelative(charge.dateProchain)}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-primary">{formatCurrencySimple(charge.montant)}</p>
                                </div>
                            ))}
                        </div>
                        <Link href="/budget">
                            <Button size="sm" color="link-color" iconTrailing={ChevronRight} className="w-full justify-center">
                                Voir tout
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

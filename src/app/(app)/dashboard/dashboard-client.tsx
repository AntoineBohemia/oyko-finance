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
import { createClient } from "@/lib/supabase/client";
import type { DashboardData, CategorieVariable, PatrimoineData, PatrimoineRepartition } from "@/lib/data/dashboard";
import type { Profile, Compte } from "@/types/database.types";

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
// FONCTIONS UTILITAIRES
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
// COMPOSANT PRINCIPAL
// ============================================

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const today = new Date();
    const currentWeekNum = getWeekNumber(today);
    const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // État de la modale
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState<string | null>(null);
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseCompte, setExpenseCompte] = useState(initialData.comptes[0]?.id ?? "");
    const [expenseDate, setExpenseDate] = useState("today");

    // Données du profil
    const profile = initialData.profile;
    const revenusMensuels = profile?.revenus_mensuels ?? 0;
    const objectifEpargneMensuel = profile?.objectif_epargne ?? 0;
    const prenom = profile?.prenom ?? "Utilisateur";

    // Catégories (enveloppes)
    const categories = initialData.categories;
    const budgetVariableMensuel = categories.reduce((acc, cat) => acc + cat.budgetMensuel, 0);

    // Charges fixes avec dates reconverties
    const chargesFixes = useMemo(() => {
        return initialData.chargesFixes.map((cf) => ({
            ...cf,
            dateProchain: new Date(cf.dateProchain),
        }));
    }, [initialData.chargesFixes]);

    const totalChargesFixes = chargesFixes.reduce((acc, c) => acc + c.montant, 0);

    // Transactions avec dates reconverties
    const transactions = useMemo(() => {
        return initialData.transactions.map((t) => ({
            ...t,
            date: new Date(t.date),
        }));
    }, [initialData.transactions]);

    // Comptes pour la modale
    const comptes = initialData.comptes.map((c) => ({
        id: c.id,
        label: c.nom,
        solde: c.solde ?? 0,
    }));

    // Patrimoine
    const patrimoine = initialData.patrimoine;

    const weekDates = getWeekDates(today.getFullYear(), selectedWeek);
    const daysRemaining = getDaysRemainingInMonth(today);
    const monthName = getMonthName(today);
    const year = today.getFullYear();

    // Calcul des dépenses de la semaine sélectionnée
    const weekTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (t.type !== "variable") return false;
            const transDate = t.date;
            return transDate >= weekDates.start && transDate <= weekDates.end;
        });
    }, [transactions, weekDates.start, weekDates.end]);

    // Budget hebdomadaire
    const budgetHebdo = budgetVariableMensuel / 4;
    const depenseSemaine = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
    const resteHebdo = budgetHebdo - depenseSemaine;
    const pourcentageHebdo = budgetHebdo > 0 ? (depenseSemaine / budgetHebdo) * 100 : 0;

    // Calcul par catégorie (enveloppe)
    const enveloppes = useMemo(() => {
        return categories.map((cat) => {
            const budgetHebdoCat = cat.budgetMensuel / 4;
            const depenseCat = weekTransactions
                .filter((t) => t.categorieId === cat.id)
                .reduce((acc, t) => acc + Math.abs(t.montant), 0);
            const resteCat = budgetHebdoCat - depenseCat;
            const pourcentageCat = budgetHebdoCat > 0 ? (depenseCat / budgetHebdoCat) * 100 : 0;
            return {
                ...cat,
                budgetHebdo: budgetHebdoCat,
                depense: depenseCat,
                reste: resteCat,
                pourcentage: pourcentageCat,
            };
        });
    }, [categories, weekTransactions]);

    // Calcul du résumé du mois
    const depensesMoisVariables = transactions
        .filter((t) => t.type === "variable")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const chargesFixesMois = transactions
        .filter((t) => t.type === "fixe")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const revenusMois = transactions
        .filter((t) => t.type === "revenu")
        .reduce((acc, t) => acc + t.montant, 0);

    // Prochains prélèvements (tri par date)
    const prochainsPrelevements = [...chargesFixes]
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
        setExpenseCompte(comptes[0]?.id ?? "");
        setExpenseDate("today");
    };

    const handleAddExpense = async () => {
        if (!expenseAmount || !expenseCategory || !profile) return;

        const supabase = createClient();

        // Déterminer la date
        let transactionDate = new Date();
        if (expenseDate === "yesterday") {
            transactionDate.setDate(transactionDate.getDate() - 1);
        }

        const { error } = await supabase.from("transactions").insert({
            user_id: profile.id,
            compte_id: expenseCompte || null,
            categorie_id: expenseCategory,
            type: "depense",
            montant: -Math.abs(parseFloat(expenseAmount)),
            description: expenseDescription || null,
            date_transaction: transactionDate.toISOString(),
        });

        if (error) {
            console.error("Erreur lors de l'ajout:", error);
            return;
        }

        setIsExpenseModalOpen(false);
        resetModal();
        // Recharger la page pour afficher la nouvelle transaction
        window.location.reload();
    };

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
                                                        {categories.map((cat) => (
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
                                                        items={comptes}
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
                    {enveloppes.length > 0 ? (
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
                    ) : (
                        <div className="rounded-xl bg-secondary p-8 text-center">
                            <p className="text-tertiary">Aucune catégorie de dépense configurée.</p>
                            <Link href="/settings">
                                <Button size="sm" color="link-color" className="mt-2">
                                    Configurer les catégories
                                </Button>
                            </Link>
                        </div>
                    )}
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
                            <span className="text-xs text-tertiary">/{formatCurrencySimple(totalChargesFixes)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-tertiary">Variable prévu</span>
                            <span className="text-xl font-semibold text-primary">{formatCurrencySimple(budgetVariableMensuel)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-tertiary">Épargne</span>
                            <span className="text-xl font-semibold text-utility-blue-500">{formatCurrencySimple(objectifEpargneMensuel)}</span>
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
                                {patrimoine.variationMois >= 0 ? "+" : ""}{patrimoine.variationMois.toFixed(1)}% ce mois
                            </BadgeWithIcon>
                        </div>

                        {/* Donut Chart avec valeur au centre */}
                        <div className="relative mx-auto flex flex-1 items-center justify-center">
                            <ResponsiveContainer width={240} height={240}>
                                <RechartsPieChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                    <Tooltip content={<ChartTooltipContent isPieChart />} formatter={(value) => formatCurrencySimple(value as number)} />
                                    <Pie
                                        isAnimationActive={false}
                                        startAngle={-270}
                                        endAngle={-630}
                                        stroke="none"
                                        data={patrimoine.repartition}
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
                                <p className="text-xl font-semibold text-primary">{formatCurrencySimple(patrimoine.valeurNette)}</p>
                                <p className="text-xs text-tertiary">Total</p>
                            </div>
                        </div>

                        {/* Légende compacte */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                            {patrimoine.repartition.map((item) => (
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
                        {prochainsPrelevements.length > 0 ? (
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
                        ) : (
                            <div className="flex flex-1 items-center justify-center rounded-lg bg-secondary p-6">
                                <p className="text-sm text-tertiary">Aucun prélèvement à venir</p>
                            </div>
                        )}
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

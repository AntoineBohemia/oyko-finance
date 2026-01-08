"use client";

import { useState } from "react";
import { CreditCard01, CurrencyEuro, FilterLines, Lock01, PiggyBank01, Plus, SearchLg, Send01, Wallet03 } from "@untitledui/icons";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis } from "recharts";
import { NavItemButton } from "@/components/application/app-navigation/base-components/nav-item-button";
import { HeaderNavigationBase } from "@/components/application/app-navigation/header-navigation";
import { Carousel } from "@/components/application/carousel/carousel-base";
import { CarouselIndicator } from "@/components/application/carousel/carousel-indicator";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { MetricChangeIndicator } from "@/components/application/metrics/metrics";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableRowActionsDropdown } from "@/components/application/table/table";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { MastercardIcon, VisaIcon } from "@/components/foundations/payment-icons";
import { CreditCard } from "@/components/shared-assets/credit-card/credit-card";

// ============================================
// TYPES
// ============================================

type CompteType = "Courant" | "Épargne" | "Cash" | "Investissement";

// ============================================
// COMPOSANT ACCOUNT CARD
// ============================================

const AccountCard = ({
    data,
    title,
    value,
    change,
    statut,
}: {
    data: Array<{ name: string; value: number; className: string }>;
    title: string;
    value: string;
    change: string;
    statut?: "Actif" | "Gelé";
}) => (
    <div className="relative flex flex-col flex-wrap gap-x-6 gap-y-5 rounded-xl bg-primary_alt px-4 py-5 shadow-xs ring-1 ring-secondary ring-inset lg:flex-row lg:p-6">
        <div className="h-30 w-30">
            <ResponsiveContainer>
                <PieChart>
                    <RechartsTooltip
                        content={<ChartTooltipContent isPieChart />}
                        formatter={(value) => (value as number).toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 })}
                    />
                    <Pie
                        isAnimationActive={false}
                        startAngle={-270}
                        endAngle={-630}
                        stroke="none"
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        fill="currentColor"
                        innerRadius={45}
                        outerRadius={60}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center gap-2">
                <p className="hidden text-md font-semibold text-primary lg:block">{title}</p>
                {statut === "Gelé" && <Lock01 className="h-4 w-4 text-blue-500" />}
            </div>
            <div className="absolute top-4 right-4 lg:top-5 lg:right-5">
                <TableRowActionsDropdown />
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-tertiary">Solde actuel</p>
                <div className="flex items-end justify-between gap-4">
                    <p className="text-display-sm font-semibold text-primary">{value}</p>
                    <MetricChangeIndicator trend="positive" type="trend" value={change} className="mb-0.5" />
                </div>
            </div>
        </div>
    </div>
);

// ============================================
// DONNÉES PIE CHARTS
// ============================================

const pieChartCompteCourant = [
    { name: "Disponible", value: 1200, className: "text-utility-brand-600" },
    { name: "Réservé", value: 350, className: "text-utility-brand-500" },
    { name: "En attente", value: 150, className: "text-utility-brand-400" },
    { name: "Plafond restant", value: 300, className: "text-utility-brand-300" },
];

const pieChartEpargne = [
    { name: "Capital", value: 4500, className: "text-utility-gray-600" },
    { name: "Intérêts", value: 520, className: "text-utility-gray-500" },
    { name: "Bonus", value: 180, className: "text-utility-gray-400" },
];

// ============================================
// DONNÉES ÉVOLUTION SOLDE
// ============================================

const evolutionSolde = [
    { date: "2025-01-01", courant: 1200, epargne: 4200 },
    { date: "2025-02-01", courant: 1450, epargne: 4350 },
    { date: "2025-03-01", courant: 1100, epargne: 4500 },
    { date: "2025-04-01", courant: 1680, epargne: 4600 },
    { date: "2025-05-01", courant: 1520, epargne: 4750 },
    { date: "2025-06-01", courant: 1350, epargne: 4850 },
    { date: "2025-07-01", courant: 1890, epargne: 4950 },
    { date: "2025-08-01", courant: 1420, epargne: 5000 },
    { date: "2025-09-01", courant: 1750, epargne: 5050 },
    { date: "2025-10-01", courant: 1620, epargne: 5100 },
    { date: "2025-11-01", courant: 1930, epargne: 5150 },
    { date: "2025-12-01", courant: 1847, epargne: 5200 },
];

// ============================================
// DONNÉES TRANSACTIONS RÉCENTES
// ============================================

const formatCurrency = (amount: number): string => {
    const formatted = Math.abs(amount).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
    return amount >= 0 ? `+ ${formatted}` : `- ${formatted}`;
};

const transactions = [
    {
        id: "tr-01",
        paymentMethod: {
            type: "Visa se terminant par 4521",
            ending: "4521",
            expiry: "Exp. 06/2027",
            logo: <VisaIcon className="h-8 w-11.5" />,
        },
        amount: -47.82,
        description: "Carrefour Market",
    },
    {
        id: "tr-02",
        paymentMethod: {
            type: "Mastercard se terminant par 7823",
            ending: "7823",
            expiry: "Exp. 12/2026",
            logo: <MastercardIcon className="h-8 w-11.5" />,
        },
        amount: -86.4,
        description: "Navigo Janvier",
    },
    {
        id: "tr-03",
        paymentMethod: {
            type: "Virement reçu",
            email: "Salaire Alternance",
            logo: <CurrencyEuro className="h-8 w-8 rounded-full bg-success-50 p-1.5 text-success-600" />,
        },
        amount: 1450.0,
        description: "Stripe SAS",
    },
    {
        id: "tr-04",
        paymentMethod: {
            type: "Visa se terminant par 4521",
            ending: "4521",
            expiry: "Exp. 06/2027",
            logo: <VisaIcon className="h-8 w-11.5" />,
        },
        amount: -5.99,
        description: "Spotify Premium",
    },
    {
        id: "tr-05",
        paymentMethod: {
            type: "Espèces",
            email: "Retrait Cash",
            logo: <Wallet03 className="h-8 w-8 rounded-full bg-warning-50 p-1.5 text-warning-600" />,
        },
        amount: -8.5,
        description: "Boulangerie Paul",
    },
    {
        id: "tr-06",
        paymentMethod: {
            type: "Prélèvement",
            email: "Loyer Janvier",
            logo: <CreditCard01 className="h-8 w-8 rounded-full bg-gray-100 p-1.5 text-gray-600" />,
        },
        amount: -650.0,
        description: "SCI Habitat",
    },
    {
        id: "tr-07",
        paymentMethod: {
            type: "Virement reçu",
            email: "Mission Freelance",
            logo: <CurrencyEuro className="h-8 w-8 rounded-full bg-success-50 p-1.5 text-success-600" />,
        },
        amount: 350.0,
        description: "Client Web",
    },
    {
        id: "tr-08",
        paymentMethod: {
            type: "Virement épargne",
            email: "Livret A",
            logo: <PiggyBank01 className="h-8 w-8 rounded-full bg-brand-50 p-1.5 text-brand-600" />,
        },
        amount: -200.0,
        description: "Épargne mensuelle",
    },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ComptesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCompte, setNewCompte] = useState({
        nom: "",
        type: "" as CompteType | "",
        banque: "",
        soldeInitial: "",
        numeroCarte: "",
        plafond: "",
        notes: "",
    });

    const handleCreateCompte = () => {
        console.log("Nouveau compte:", newCompte);
        setIsModalOpen(false);
        setNewCompte({ nom: "", type: "", banque: "", soldeInitial: "", numeroCarte: "", plafond: "", notes: "" });
    };

    return (
        <div className="bg-secondary_alt">
            <main className="pt-8 pb-12 lg:pt-12 lg:pb-24">
                <div className="flex flex-col gap-8">
                    {/* Page header */}
                    <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row">
                            <div className="flex flex-col gap-0.5 lg:gap-1">
                                <p className="text-xl font-semibold text-primary lg:text-display-xs">Mes Comptes</p>
                                <p className="text-md text-tertiary">Gérez vos comptes bancaires et suivez vos soldes.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button size="md" color="secondary" iconLeading={Send01}>
                                    Transférer
                                </Button>
                                <Button size="md" iconLeading={Plus} onClick={() => setIsModalOpen(true)}>
                                    Nouveau compte
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-4 lg:flex-row">
                            <ButtonGroup defaultSelectedKeys={["12-months"]}>
                                <ButtonGroupItem id="12-months">
                                    <span className="max-lg:hidden">12 mois</span>
                                    <span className="lg:hidden">12m</span>
                                </ButtonGroupItem>
                                <ButtonGroupItem id="30-days">
                                    <span className="max-lg:hidden">30 jours</span>
                                    <span className="lg:hidden">30j</span>
                                </ButtonGroupItem>
                                <ButtonGroupItem id="7-days">
                                    <span className="max-lg:hidden">7 jours</span>
                                    <span className="lg:hidden">7j</span>
                                </ButtonGroupItem>
                                <ButtonGroupItem id="24-hours">
                                    <span className="max-lg:hidden">24 heures</span>
                                    <span className="lg:hidden">24h</span>
                                </ButtonGroupItem>
                            </ButtonGroup>

                            <div className="flex gap-3">
                                <DateRangePicker />
                                <Button size="md" color="secondary" iconLeading={FilterLines}>
                                    Filtres
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 lg:gap-6">
                        {/* Account Cards */}
                        <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-x-6 gap-y-5 px-4 lg:grid-cols-2 lg:px-8">
                            <AccountCard data={pieChartCompteCourant} title="Compte courant" value="1 847,32 €" change="3,4%" statut="Actif" />
                            <AccountCard data={pieChartEpargne} title="Livret A" value="5 200,00 €" change="2,1%" statut="Actif" />
                        </div>

                        <div className="mx-auto flex w-full max-w-container flex-col gap-8 px-4 lg:flex-row lg:gap-6 lg:px-8">
                            {/* Colonne gauche - Graphique + Cartes */}
                            <div className="flex flex-1 flex-col gap-8 lg:gap-6">
                                {/* Balance over time */}
                                <div className="relative flex flex-col flex-wrap gap-y-5 rounded-xl bg-primary_alt px-4 py-5 shadow-xs ring-1 ring-secondary ring-inset lg:p-6">
                                    <div className="absolute top-5 right-4 lg:top-6 lg:right-6">
                                        <TableRowActionsDropdown />
                                    </div>

                                    <p className="text-lg font-semibold text-primary">Évolution des soldes</p>
                                    <div className="flex h-50 flex-col gap-2">
                                        <ResponsiveContainer className="h-full">
                                            <AreaChart
                                                data={evolutionSolde}
                                                className="text-tertiary [&_.recharts-text]:text-xs"
                                                margin={{ left: 5, right: 5 }}
                                            >
                                                <CartesianGrid vertical={false} stroke="currentColor" className="text-utility-gray-100" />

                                                <XAxis
                                                    fill="currentColor"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickMargin={10}
                                                    interval="preserveStartEnd"
                                                    dataKey="date"
                                                    tickFormatter={(value) => new Date(value).toLocaleString("fr-FR", { month: "short" })}
                                                />

                                                <RechartsTooltip
                                                    content={<ChartTooltipContent />}
                                                    formatter={(value) =>
                                                        (value as number).toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: "EUR",
                                                            minimumFractionDigits: 0,
                                                        })
                                                    }
                                                    labelFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                                                    cursor={{ className: "stroke-utility-brand-600 stroke-2" }}
                                                />

                                                <Area
                                                    isAnimationActive={false}
                                                    className="text-utility-brand-600 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                                    dataKey="courant"
                                                    name="Compte courant"
                                                    type="monotone"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    fill="none"
                                                    activeDot={{ className: "fill-bg-primary stroke-utility-brand-600 stroke-2" }}
                                                />

                                                <Area
                                                    isAnimationActive={false}
                                                    className="text-utility-gray-500 [&_.recharts-area-area]:translate-y-[6px] [&_.recharts-area-area]:[clip-path:inset(0_0_6px_0)]"
                                                    dataKey="epargne"
                                                    name="Livret A"
                                                    type="monotone"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    fill="none"
                                                    activeDot={{ className: "fill-bg-primary stroke-utility-gray-500 stroke-2" }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Your cards */}
                                <div className="relative flex flex-col overflow-hidden rounded-xl bg-primary_alt shadow-xs ring-1 ring-secondary ring-inset">
                                    <div className="absolute top-5 right-4 lg:top-6 lg:right-6">
                                        <TableRowActionsDropdown />
                                    </div>

                                    <div className="flex flex-col gap-5 px-4 py-5 lg:p-6">
                                        <p className="text-lg font-semibold text-primary">Vos cartes</p>
                                        {/* Desktop */}
                                        <div className="hidden flex-wrap gap-8 lg:flex">
                                            <div className="flex flex-col gap-4">
                                                <CreditCard width={316} type="brand-dark" className="dark:hidden" />
                                                <CreditCard width={316} type="transparent-gradient" className="hidden dark:block" />
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-secondary">Dépensé ce mois</p>
                                                        <span className="text-sm text-tertiary">844,71 €</span>
                                                    </div>
                                                    <ProgressBar value={56} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <div className="relative">
                                                    <CreditCard width={316} type="gray-strip" className="dark:hidden" />
                                                    <CreditCard width={316} type="transparent-gradient" className="hidden dark:block" />
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 rounded-full bg-blue-500/90 px-3 py-1.5">
                                                            <Lock01 className="h-4 w-4 text-white" />
                                                            <span className="text-sm font-medium text-white">Carte gelée</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-secondary">Dépensé ce mois</p>
                                                        <span className="text-sm text-tertiary">0,00 €</span>
                                                    </div>
                                                    <ProgressBar value={0} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Mobile Carousel */}
                                        <Carousel.Root className="flex flex-col gap-5 lg:hidden">
                                            <Carousel.Content overflowHidden={false} className="gap-5">
                                                <Carousel.Item className="basis-auto">
                                                    <CreditCard width={272} type="brand-dark" className="dark:hidden" />
                                                    <CreditCard width={272} type="transparent-gradient" className="hidden dark:block" />
                                                </Carousel.Item>
                                                <Carousel.Item className="basis-auto">
                                                    <div className="relative">
                                                        <CreditCard width={272} type="gray-strip" className="dark:hidden" />
                                                        <CreditCard width={272} type="transparent-gradient" className="hidden dark:block" />
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                                                            <div className="flex items-center gap-2 rounded-full bg-blue-500/90 px-3 py-1.5">
                                                                <Lock01 className="h-4 w-4 text-white" />
                                                                <span className="text-sm font-medium text-white">Gelée</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Carousel.Item>
                                            </Carousel.Content>
                                            <CarouselIndicator size="lg" framed={false} />
                                        </Carousel.Root>
                                    </div>
                                    <div className="flex justify-end border-t border-secondary px-6 py-4 lg:px-6 lg:py-4">
                                        <Button size="md" color="secondary">
                                            Gérer les cartes
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne droite - Transactions récentes */}
                            <div>
                                <div className="relative flex flex-col flex-wrap gap-y-5 rounded-xl bg-primary_alt px-4 py-5 shadow-xs ring-1 ring-secondary ring-inset lg:w-100 lg:p-6">
                                    <div className="absolute top-5 right-4 lg:top-6 lg:right-6">
                                        <TableRowActionsDropdown />
                                    </div>

                                    <p className="text-lg font-semibold text-primary">Dernières transactions</p>
                                    <div className="flex flex-col gap-4">
                                        <Table
                                            aria-label="Dernières transactions"
                                            className="relative after:pointer-events-none after:absolute after:inset-0 after:border-t after:border-secondary"
                                        >
                                            <Table.Header className="hidden">
                                                <Table.Head id="merchant" isRowHeader className="w-full" />
                                                <Table.Head id="amount" />
                                            </Table.Header>
                                            <Table.Body items={transactions} className="border-b border-secondary">
                                                {(item) => (
                                                    <Table.Row id={item.id}>
                                                        <Table.Cell className="w-full px-0">
                                                            <div className="flex items-center gap-3">
                                                                {item.paymentMethod.logo}
                                                                <div className="flex flex-col">
                                                                    <p className="text-sm font-medium text-primary">
                                                                        <span className="hidden lg:inline">{item.paymentMethod.type}</span>
                                                                        <span className="lg:hidden">
                                                                            {item.paymentMethod.ending
                                                                                ? `Se terminant par ${item.paymentMethod.ending}`
                                                                                : item.paymentMethod.type}
                                                                        </span>
                                                                    </p>
                                                                    <p className="text-sm text-nowrap text-tertiary">
                                                                        {item.paymentMethod.expiry || item.paymentMethod.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell
                                                            className={`pr-0 text-sm text-nowrap ${item.amount >= 0 ? "text-finance-gain" : "text-primary"}`}
                                                        >
                                                            {formatCurrency(item.amount)}
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )}
                                            </Table.Body>
                                        </Table>
                                        <div className="flex justify-end">
                                            <Button size="md" color="link-color">
                                                Voir tout
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modale nouveau compte */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-md">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Nouveau compte</h2>
                                    <p className="text-sm text-tertiary">Ajoutez un nouveau compte bancaire</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <Input
                                        label="Nom du compte"
                                        placeholder="Ex: Compte courant principal"
                                        value={newCompte.nom}
                                        onChange={(value) => setNewCompte({ ...newCompte, nom: value })}
                                        isRequired
                                    />

                                    <Select
                                        label="Type de compte"
                                        selectedKey={newCompte.type}
                                        onSelectionChange={(v) => setNewCompte({ ...newCompte, type: v as CompteType })}
                                        items={[
                                            { id: "Courant", label: "Compte courant" },
                                            { id: "Épargne", label: "Compte épargne" },
                                            { id: "Cash", label: "Cash / Espèces" },
                                            { id: "Investissement", label: "Compte investissement" },
                                        ]}
                                        isRequired
                                    >
                                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                    </Select>

                                    <Input
                                        label="Banque"
                                        placeholder="Ex: Boursorama, BNP, N26..."
                                        value={newCompte.banque}
                                        onChange={(value) => setNewCompte({ ...newCompte, banque: value })}
                                        isRequired
                                    />

                                    <Input
                                        label="Solde initial (€)"
                                        type="number"
                                        placeholder="0.00"
                                        value={newCompte.soldeInitial}
                                        onChange={(value) => setNewCompte({ ...newCompte, soldeInitial: value })}
                                        isRequired
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="N° carte (4 derniers)"
                                            placeholder="1234"
                                            maxLength={4}
                                            value={newCompte.numeroCarte}
                                            onChange={(value) => setNewCompte({ ...newCompte, numeroCarte: value })}
                                        />
                                        <Input
                                            label="Plafond CB (€)"
                                            type="number"
                                            placeholder="2000"
                                            value={newCompte.plafond}
                                            onChange={(value) => setNewCompte({ ...newCompte, plafond: value })}
                                        />
                                    </div>

                                    <TextArea
                                        label="Notes (optionnel)"
                                        placeholder="Informations supplémentaires..."
                                        value={newCompte.notes}
                                        onChange={(value: string) => setNewCompte({ ...newCompte, notes: value })}
                                        rows={2}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 border-t border-secondary pt-6">
                                    <Button color="secondary" onClick={close}>
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        onClick={handleCreateCompte}
                                        isDisabled={!newCompte.nom || !newCompte.type || !newCompte.banque || !newCompte.soldeInitial}
                                    >
                                        Créer le compte
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </div>
    );
}

"use client";

import { useMemo, useState } from "react";
import {
    AlertCircle,
    Calculator,
    ChevronRight,
    Edit01,
    FilterLines,
    PlusCircle,
    SearchLg,
    Trash01,
    TrendDown01,
    TrendUp01,
    Upload04,
    XClose,
} from "@untitledui/icons";
import { type SortDescriptor } from "react-aria-components";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { MetricsSimple } from "@/components/application/metrics/metrics";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PaginationPageMinimalCenter } from "@/components/application/pagination/pagination";
import { Table, TableCard } from "@/components/application/table/table";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithButton } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";

// ============================================
// TYPES
// ============================================

type TypeDette = "etudiant" | "conso" | "immo" | "personnel";

interface Dette {
    id: string;
    nom: string;
    type: TypeDette;
    capitalInitial: number;
    capitalRestant: number;
    tauxAnnuel: number;
    mensualite: number;
    dateDebut: Date;
    dateFin: Date;
    prochainPrelevement: Date;
    compte: string;
    preteur: string;
    imageUrl?: string;
    notes?: string;
}

interface Echeance {
    date: Date;
    capital: number;
    interets: number;
    total: number;
    restantApres: number;
}

// ============================================
// DONNÉES
// ============================================

const verticalTabs = [
    { id: "all", label: "Toutes" },
    { id: "etudiant", label: "Étudiant" },
    { id: "conso", label: "Consommation" },
    { id: "immo", label: "Immobilier" },
    { id: "personnel", label: "Personnel" },
];

const dettes: Dette[] = [
    {
        id: "dette-01",
        nom: "Prêt étudiant",
        type: "etudiant",
        capitalInitial: 15000,
        capitalRestant: 12450,
        tauxAnnuel: 0.75,
        mensualite: 156.25,
        dateDebut: new Date(2023, 8, 1),
        dateFin: new Date(2031, 8, 1),
        prochainPrelevement: new Date(2026, 0, 5),
        compte: "Compte courant",
        preteur: "BNP Paribas",
        imageUrl: "https://www.untitledui.com/logos/images/Ephemeral.jpg",
    },
    {
        id: "dette-02",
        nom: "Crédit ordinateur",
        type: "conso",
        capitalInitial: 1500,
        capitalRestant: 625,
        tauxAnnuel: 3.9,
        mensualite: 62.5,
        dateDebut: new Date(2024, 5, 1),
        dateFin: new Date(2026, 5, 1),
        prochainPrelevement: new Date(2026, 0, 15),
        compte: "Compte courant",
        preteur: "Boursorama",
        imageUrl: "https://www.untitledui.com/logos/images/Stack3d Lab.jpg",
    },
    {
        id: "dette-03",
        nom: "Prêt familial",
        type: "personnel",
        capitalInitial: 3000,
        capitalRestant: 1800,
        tauxAnnuel: 0,
        mensualite: 100,
        dateDebut: new Date(2024, 0, 1),
        dateFin: new Date(2026, 5, 1),
        prochainPrelevement: new Date(2026, 0, 1),
        compte: "Compte courant",
        preteur: "Parents",
        imageUrl: "https://www.untitledui.com/logos/images/Warpspeed.jpg",
        notes: "Remboursement flexible, pas d'intérêts",
    },
];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const formatDate = (date: Date): string => date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const formatDateLong = (date: Date): string => date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

const formatDateFull = (date: Date): string => date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getJMoinsBadge = (date: Date): { label: string; color: "success" | "warning" | "error" | "gray" } => {
    const days = getDaysUntil(date);
    if (days < 0) return { label: "Passé", color: "gray" };
    if (days === 0) return { label: "Aujourd'hui", color: "error" };
    if (days <= 3) return { label: `J-${days}`, color: "error" };
    if (days <= 7) return { label: `J-${days}`, color: "warning" };
    return { label: `J-${days}`, color: "success" };
};

const getTypeLabel = (type: TypeDette): string => {
    const labels: Record<TypeDette, string> = {
        etudiant: "Étudiant",
        conso: "Conso",
        immo: "Immobilier",
        personnel: "Personnel",
    };
    return labels[type];
};

const getTypeColor = (type: TypeDette): "brand" | "success" | "warning" | "error" => {
    const colors: Record<TypeDette, "brand" | "success" | "warning" | "error"> = {
        etudiant: "brand",
        conso: "warning",
        immo: "success",
        personnel: "error",
    };
    return colors[type];
};

const getTypePieColor = (type: TypeDette): string => {
    const colors: Record<TypeDette, string> = {
        etudiant: "#7c3aed",
        conso: "#f59e0b",
        immo: "#10b981",
        personnel: "#ef4444",
    };
    return colors[type];
};

const getProgressionPourcent = (dette: Dette): number => {
    const rembourse = dette.capitalInitial - dette.capitalRestant;
    return (rembourse / dette.capitalInitial) * 100;
};

// Génère l'échéancier d'une dette
const genererEcheancier = (dette: Dette, nbMois: number = 12): Echeance[] => {
    const echeances: Echeance[] = [];
    let restant = dette.capitalRestant;
    const tauxMensuel = dette.tauxAnnuel / 100 / 12;

    for (let i = 0; i < nbMois && restant > 0; i++) {
        const date = new Date(dette.prochainPrelevement);
        date.setMonth(date.getMonth() + i);

        const interets = restant * tauxMensuel;
        const capital = Math.min(dette.mensualite - interets, restant);
        const total = capital + interets;
        restant = Math.max(0, restant - capital);

        echeances.push({
            date,
            capital,
            interets,
            total,
            restantApres: restant,
        });
    }

    return echeances;
};

// Calcule la nouvelle date de fin si remboursement anticipé
const calculerFinAnticipee = (dette: Dette, mensualiteSupp: number): { nouvelleFin: Date; moisGagnes: number; economieInterets: number } => {
    if (mensualiteSupp <= 0) {
        return { nouvelleFin: dette.dateFin, moisGagnes: 0, economieInterets: 0 };
    }

    const nouvelleMensualite = dette.mensualite + mensualiteSupp;
    const tauxMensuel = dette.tauxAnnuel / 100 / 12;
    let restant = dette.capitalRestant;
    let mois = 0;
    let totalInteretsNouveau = 0;

    while (restant > 0 && mois < 360) {
        const interets = restant * tauxMensuel;
        totalInteretsNouveau += interets;
        const capital = Math.min(nouvelleMensualite - interets, restant);
        restant = Math.max(0, restant - capital);
        mois++;
    }

    // Calcul intérêts actuels
    let restantActuel = dette.capitalRestant;
    let totalInteretsActuel = 0;
    let moisActuel = 0;

    while (restantActuel > 0 && moisActuel < 360) {
        const interets = restantActuel * tauxMensuel;
        totalInteretsActuel += interets;
        const capital = Math.min(dette.mensualite - interets, restantActuel);
        restantActuel = Math.max(0, restantActuel - capital);
        moisActuel++;
    }

    const nouvelleFin = new Date(dette.prochainPrelevement);
    nouvelleFin.setMonth(nouvelleFin.getMonth() + mois);

    return {
        nouvelleFin,
        moisGagnes: moisActuel - mois,
        economieInterets: totalInteretsActuel - totalInteretsNouveau,
    };
};

// ============================================
// CALCULS GLOBAUX
// ============================================

const totalRestant = dettes.reduce((acc, d) => acc + d.capitalRestant, 0);
const totalInitial = dettes.reduce((acc, d) => acc + d.capitalInitial, 0);
const totalRembourse = totalInitial - totalRestant;
const totalMensualites = dettes.reduce((acc, d) => acc + d.mensualite, 0);

// Date de fin la plus lointaine
const finLaPlusLointaine = dettes.reduce((acc, d) => (d.dateFin > acc ? d.dateFin : acc), dettes[0]?.dateFin || new Date());

// Timeline des prochaines échéances
const timeline = dettes
    .map((d) => ({ dette: d, date: d.prochainPrelevement }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6);

// Répartition par type
const repartitionTypes = Object.entries(
    dettes.reduce(
        (acc, d) => {
            acc[d.type] = (acc[d.type] || 0) + d.capitalRestant;
            return acc;
        },
        {} as Record<string, number>,
    ),
).map(([type, value]) => ({
    name: getTypeLabel(type as TypeDette),
    value,
    color: getTypePieColor(type as TypeDette),
}));

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function DettesPage() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const [selectedTab, setSelectedTab] = useState("all");
    const [selectedDette, setSelectedDette] = useState<Dette | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [simulateurMontant, setSimulateurMontant] = useState<string>("");

    const [newDette, setNewDette] = useState({
        nom: "",
        type: "" as TypeDette | "",
        capitalInitial: "",
        capitalRestant: "",
        tauxAnnuel: "",
        mensualite: "",
        dateFin: "",
        preteur: "",
        compte: "",
        notes: "",
    });

    // Filtrage
    const filteredDettes = useMemo(() => {
        return dettes.filter((d) => {
            if (selectedTab === "all") return true;
            return d.type === selectedTab;
        });
    }, [selectedTab]);

    // Tri
    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return filteredDettes;

        return filteredDettes.toSorted((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof a];
            const second = b[sortDescriptor.column as keyof typeof b];

            if (first instanceof Date && second instanceof Date) {
                return sortDescriptor.direction === "ascending" ? first.getTime() - second.getTime() : second.getTime() - first.getTime();
            }

            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }

            return 0;
        });
    }, [sortDescriptor, filteredDettes]);

    // Échéancier de la dette sélectionnée
    const echeancier = useMemo(() => {
        if (!selectedDette) return [];
        return genererEcheancier(selectedDette, 12);
    }, [selectedDette]);

    // Simulation remboursement anticipé
    const simulation = useMemo(() => {
        if (!selectedDette || !simulateurMontant) return null;
        const montant = parseFloat(simulateurMontant);
        if (isNaN(montant) || montant <= 0) return null;
        return calculerFinAnticipee(selectedDette, montant);
    }, [selectedDette, simulateurMontant]);

    const handleCreateDette = () => {
        console.log("Nouvelle dette:", newDette);
        setIsModalOpen(false);
        setNewDette({
            nom: "",
            type: "",
            capitalInitial: "",
            capitalRestant: "",
            tauxAnnuel: "",
            mensualite: "",
            dateFin: "",
            preteur: "",
            compte: "",
            notes: "",
        });
    };

    return (
        <div className="flex min-h-screen">
            {/* Main content */}
            <main className="flex w-full min-w-0 flex-1 flex-col gap-8 bg-primary pt-8 pb-12 shadow-none lg:pt-12 lg:pb-24">
                <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                    {/* Page header */}
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                            <div className="flex flex-col gap-0.5 md:gap-1">
                                <p className="text-xl font-semibold text-primary lg:text-display-xs">Dettes</p>
                                <p className="text-md text-tertiary">Suivez vos emprunts et remboursements</p>
                            </div>
                            <div className="flex flex-col gap-4 lg:flex-row">
                                <div className="flex items-start gap-3">
                                    <Button iconLeading={Upload04} color="secondary" size="md">
                                        Exporter
                                    </Button>
                                    <Button iconLeading={PlusCircle} color="primary" size="md" onClick={() => setIsModalOpen(true)}>
                                        Nouvelle dette
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-container gap-8 px-4 lg:gap-16 lg:px-8">
                    {/* Tabs verticaux */}
                    <Tabs
                        orientation="vertical"
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        className="w-auto max-lg:hidden"
                    >
                        <TabList size="sm" type="line" items={verticalTabs} className="items-start" />
                    </Tabs>

                    <div className="mx-auto flex w-full min-w-0 flex-1 flex-col lg:gap-6">
                        {/* Métriques */}
                        <div className="grid w-full grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricsSimple title={formatCurrency(totalRestant)} subtitle="Total restant dû" type="modern" trend="negative" className="ring-2 ring-error-200" />
                            <MetricsSimple
                                title={formatCurrency(totalRembourse)}
                                subtitle="Déjà remboursé"
                                change={`${((totalRembourse / totalInitial) * 100).toFixed(0)}%`}
                                type="modern"
                                trend="positive"
                            />
                            <MetricsSimple title={formatCurrency(totalMensualites)} subtitle="Mensualités totales" type="modern" trend="negative" />
                            <MetricsSimple title={formatDateLong(finLaPlusLointaine)} subtitle="Libéré en" type="modern" trend="positive" />
                        </div>

                        {/* Filtres */}
                        <div className="flex w-full flex-col gap-6">
                            <div className="hidden justify-between gap-4 lg:flex">
                                <div className="flex gap-3">
                                    <Button iconTrailing={XClose} size="md" color="secondary">
                                        Tous types
                                    </Button>
                                    <Button iconLeading={FilterLines} size="md" color="secondary">
                                        Plus de filtres
                                    </Button>
                                </div>
                                <Input icon={SearchLg} shortcut aria-label="Rechercher" placeholder="Rechercher" size="sm" className="w-80" />
                            </div>
                            <div className="mt-8 flex flex-col gap-3 lg:hidden">
                                <Input icon={SearchLg} shortcut aria-label="Rechercher" placeholder="Rechercher" size="sm" />
                                <Button iconLeading={FilterLines} size="md" color="secondary">
                                    Plus de filtres
                                </Button>
                                <div className="flex gap-3">
                                    <BadgeWithButton color="brand" size="md" type="pill-color" buttonLabel="Clear" onButtonClick={() => {}}>
                                        Tous types
                                    </BadgeWithButton>
                                </div>
                            </div>

                            {/* Table */}
                            <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                                <Table
                                    aria-label="Dettes"
                                    selectionMode="single"
                                    selectedKeys={selectedDette ? [selectedDette.id] : []}
                                    onSelectionChange={(keys) => {
                                        const selectedId = Array.from(keys)[0];
                                        const dette = dettes.find((d) => d.id === selectedId);
                                        setSelectedDette(dette || null);
                                    }}
                                    sortDescriptor={sortDescriptor}
                                    onSortChange={setSortDescriptor}
                                >
                                    <Table.Header>
                                        <Table.Head id="nom" isRowHeader allowsSorting label="Dette" className="w-full" />
                                        <Table.Head id="type" label="Type" />
                                        <Table.Head id="capitalInitial" allowsSorting label="Capital" className="max-lg:hidden" />
                                        <Table.Head id="capitalRestant" allowsSorting label="Restant" />
                                        <Table.Head id="tauxAnnuel" label="Taux" className="max-lg:hidden" />
                                        <Table.Head id="mensualite" allowsSorting label="Mensualité" className="max-lg:hidden" />
                                        <Table.Head id="progression" label="Progression" className="min-w-32 max-lg:hidden" />
                                        <Table.Head id="prochainPrelevement" allowsSorting label="Prochaine" />
                                        <Table.Head id="actions" />
                                    </Table.Header>
                                    <Table.Body items={sortedItems}>
                                        {(dette) => {
                                            const progression = getProgressionPourcent(dette);
                                            const jMoins = getJMoinsBadge(dette.prochainPrelevement);

                                            return (
                                                <Table.Row id={dette.id} className="cursor-pointer selected:bg-secondary">
                                                    <Table.Cell>
                                                        <div className="group flex items-center gap-3 outline-hidden">
                                                            <Avatar src={dette.imageUrl} alt={dette.nom} size="md" initials={dette.nom.substring(0, 2)} />
                                                            <div>
                                                                <p className="text-sm font-medium text-primary">{dette.nom}</p>
                                                                <p className="text-sm text-tertiary">{dette.preteur}</p>
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge size="sm" type="pill-color" color={getTypeColor(dette.type)}>
                                                            {getTypeLabel(dette.type)}
                                                        </Badge>
                                                    </Table.Cell>
                                                    <Table.Cell className="max-lg:hidden">
                                                        <span className="text-sm text-tertiary">{formatCurrency(dette.capitalInitial)}</span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <span className="text-sm font-medium text-primary">{formatCurrency(dette.capitalRestant)}</span>
                                                    </Table.Cell>
                                                    <Table.Cell className="max-lg:hidden">
                                                        <span className="text-sm text-tertiary">{dette.tauxAnnuel.toFixed(2)}%</span>
                                                    </Table.Cell>
                                                    <Table.Cell className="max-lg:hidden">
                                                        <span className="text-sm font-medium text-primary">{formatCurrency(dette.mensualite)}</span>
                                                    </Table.Cell>
                                                    <Table.Cell className="max-lg:hidden">
                                                        <div className="flex flex-col gap-1">
                                                            <ProgressBar min={0} max={100} value={progression} />
                                                            <span className="text-xs text-tertiary">{progression.toFixed(0)}% remboursé</span>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm text-primary">{formatDate(dette.prochainPrelevement)}</span>
                                                            <Badge size="sm" type="pill-color" color={jMoins.color}>
                                                                {jMoins.label}
                                                            </Badge>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="px-4">
                                                        <div className="flex justify-end gap-0.5">
                                                            <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} />
                                                            <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit01} />
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        }}
                                    </Table.Body>
                                </Table>
                            </TableCard.Root>
                            <PaginationPageMinimalCenter page={1} total={1} />
                        </div>

                        {/* Échéancier dette sélectionnée */}
                        {selectedDette && (
                            <div className="flex flex-col gap-4 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={selectedDette.imageUrl} alt={selectedDette.nom} size="md" initials={selectedDette.nom.substring(0, 2)} />
                                        <div>
                                            <p className="text-lg font-semibold text-primary">{selectedDette.nom}</p>
                                            <p className="text-sm text-tertiary">Échéancier des 12 prochains mois</p>
                                        </div>
                                    </div>
                                    <Badge size="md" type="pill-color" color={getTypeColor(selectedDette.type)}>
                                        {getTypeLabel(selectedDette.type)}
                                    </Badge>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-secondary">
                                                <th className="py-3 pr-4 text-left font-medium text-tertiary">Date</th>
                                                <th className="px-4 py-3 text-right font-medium text-tertiary">Capital</th>
                                                <th className="px-4 py-3 text-right font-medium text-tertiary">Intérêts</th>
                                                <th className="px-4 py-3 text-right font-medium text-tertiary">Total</th>
                                                <th className="py-3 pl-4 text-right font-medium text-tertiary">Restant après</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {echeancier.map((e, i) => (
                                                <tr key={i} className="border-b border-secondary last:border-0">
                                                    <td className="py-3 pr-4 text-primary">{formatDateFull(e.date)}</td>
                                                    <td className="px-4 py-3 text-right text-primary">{formatCurrency(e.capital)}</td>
                                                    <td className="px-4 py-3 text-right text-tertiary">{formatCurrency(e.interets)}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-primary">{formatCurrency(e.total)}</td>
                                                    <td className="py-3 pl-4 text-right text-tertiary">{formatCurrency(e.restantApres)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Sidebar droite */}
            <div className="sticky top-0 hidden h-screen w-80 flex-col overflow-hidden border-l border-secondary bg-secondary_subtle xl:flex">
                {/* Timeline échéances */}
                <div className="flex w-full flex-wrap items-start justify-between gap-4 border-b border-secondary bg-alpha-white/90 px-6 py-5 backdrop-blur">
                    <p className="text-lg font-semibold text-primary">Prochaines échéances</p>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
                    {timeline.map(({ dette, date }) => {
                        const jMoins = getJMoinsBadge(date);
                        return (
                            <div
                                key={dette.id}
                                className={cx(
                                    "flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary",
                                    selectedDette?.id === dette.id && "bg-secondary ring-1 ring-brand",
                                )}
                                onClick={() => setSelectedDette(dette)}
                            >
                                <Avatar src={dette.imageUrl} alt={dette.nom} size="sm" initials={dette.nom.substring(0, 2)} />
                                <div className="flex flex-1 flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary">{dette.nom}</p>
                                        <span className="text-sm font-semibold text-primary">{formatCurrency(dette.mensualite)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-tertiary">{formatDateFull(date)}</p>
                                        <Badge size="sm" type="pill-color" color={jMoins.color}>
                                            {jMoins.label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Donut répartition */}
                <div className="flex flex-col gap-4 border-t border-secondary bg-primary px-6 py-5">
                    <p className="text-sm font-semibold text-primary">Répartition par type</p>
                    <div className="flex items-center gap-4">
                        <div className="h-24 w-24">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={repartitionTypes}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                        paddingAngle={2}
                                    >
                                        {repartitionTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                            {repartitionTypes.map((type) => (
                                <div key={type.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
                                        <span className="text-xs text-tertiary">{type.name}</span>
                                    </div>
                                    <span className="text-xs font-medium text-primary">{formatCurrency(type.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Simulateur remboursement anticipé */}
                {selectedDette && (
                    <div className="flex flex-col gap-4 border-t border-secondary bg-primary px-6 py-5">
                        <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-tertiary" />
                            <p className="text-sm font-semibold text-primary">Simulateur</p>
                        </div>
                        <p className="text-xs text-tertiary">Ajoutez un montant mensuel pour voir l'impact sur {selectedDette.nom}</p>

                        <Input
                            placeholder="0 €/mois"
                            type="number"
                            value={simulateurMontant}
                            onChange={(value) => setSimulateurMontant(value)}
                            size="sm"
                        />

                        {simulation && (
                            <div className="flex flex-col gap-2 rounded-lg bg-success-50 p-3">
                                <div className="flex items-center gap-2">
                                    <TrendUp01 className="h-4 w-4 text-finance-gain-subtle" />
                                    <span className="text-sm font-medium text-success-700">Libéré en {formatDateLong(simulation.nouvelleFin)}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-finance-gain">
                                    <span>🎉 {simulation.moisGagnes} mois gagnés</span>
                                    <span>💰 {formatCurrency(simulation.economieInterets)} d'intérêts économisés</span>
                                </div>
                            </div>
                        )}

                        {!simulation && simulateurMontant && <p className="text-xs text-tertiary">Entrez un montant valide</p>}
                    </div>
                )}

                {/* Alerte si dette proche */}
                {timeline[0] && getDaysUntil(timeline[0].date) <= 5 && (
                    <div className="flex items-center gap-3 border-t border-secondary bg-warning-50 px-6 py-4">
                        <AlertCircle className="h-5 w-5 text-warning-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-warning-700">
                                {timeline[0].dette.nom} dans {getDaysUntil(timeline[0].date)} jour(s)
                            </p>
                            <p className="text-xs text-warning-600">{formatCurrency(timeline[0].dette.mensualite)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modale nouvelle dette */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Nouvelle dette</h2>
                                    <p className="text-sm text-tertiary">Ajoutez un emprunt à suivre</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Nom"
                                            placeholder="Ex: Prêt étudiant"
                                            value={newDette.nom}
                                            onChange={(value) => setNewDette({ ...newDette, nom: value })}
                                            isRequired
                                        />
                                        <Select
                                            label="Type"
                                            selectedKey={newDette.type}
                                            onSelectionChange={(v) => setNewDette({ ...newDette, type: v as TypeDette })}
                                            items={[
                                                { id: "etudiant", label: "Étudiant" },
                                                { id: "conso", label: "Consommation" },
                                                { id: "immo", label: "Immobilier" },
                                                { id: "personnel", label: "Personnel" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Capital emprunté (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newDette.capitalInitial}
                                            onChange={(value) => setNewDette({ ...newDette, capitalInitial: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Capital restant (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newDette.capitalRestant}
                                            onChange={(value) => setNewDette({ ...newDette, capitalRestant: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            label="Taux annuel (%)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newDette.tauxAnnuel}
                                            onChange={(value) => setNewDette({ ...newDette, tauxAnnuel: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Mensualité (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newDette.mensualite}
                                            onChange={(value) => setNewDette({ ...newDette, mensualite: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Fin prévue"
                                            type="date"
                                            value={newDette.dateFin}
                                            onChange={(value) => setNewDette({ ...newDette, dateFin: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Prêteur"
                                            placeholder="Ex: BNP Paribas"
                                            value={newDette.preteur}
                                            onChange={(value) => setNewDette({ ...newDette, preteur: value })}
                                            isRequired
                                        />
                                        <Select
                                            label="Compte de prélèvement"
                                            selectedKey={newDette.compte}
                                            onSelectionChange={(v) => setNewDette({ ...newDette, compte: v as string })}
                                            items={[
                                                { id: "Compte courant", label: "Compte courant" },
                                                { id: "Livret A", label: "Livret A" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <TextArea
                                        label="Notes (optionnel)"
                                        placeholder="Conditions particulières, contact..."
                                        value={newDette.notes}
                                        onChange={(value) => setNewDette({ ...newDette, notes: value })}
                                        rows={2}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3">
                                    <Button color="secondary" size="lg" onClick={close} className="flex-1">
                                        Annuler
                                    </Button>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        onClick={handleCreateDette}
                                        className="flex-1"
                                        isDisabled={
                                            !newDette.nom ||
                                            !newDette.type ||
                                            !newDette.capitalInitial ||
                                            !newDette.capitalRestant ||
                                            !newDette.mensualite ||
                                            !newDette.dateFin ||
                                            !newDette.preteur ||
                                            !newDette.compte
                                        }
                                    >
                                        Créer
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

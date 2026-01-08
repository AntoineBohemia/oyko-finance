"use client";

import { useMemo, useState } from "react";
import {
    AlertCircle,
    Calendar as CalendarIcon,
    CreditCard01,
    Edit01,
    FilterLines,
    Globe02,
    PlusCircle,
    SearchLg,
    Trash01,
    Upload04,
    XClose,
} from "@untitledui/icons";
import { type SortDescriptor } from "react-aria-components";
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { FeedItem } from "@/components/application/activity-feed/activity-feed";
import { Calendar, type CalendarEvent } from "@/components/application/calendar/calendar";
import { ChartTooltipContent } from "@/components/application/charts/charts-base";
import { MetricsSimple } from "@/components/application/metrics/metrics";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { PaginationPageMinimalCenter } from "@/components/application/pagination/pagination";
import { Table, TableCard, TableRowActionsDropdown } from "@/components/application/table/table";
import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithButton } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";

// ============================================
// TYPES
// ============================================

type Frequence = "mensuel" | "annuel" | "trimestriel" | "hebdo";
type Statut = "actif" | "inactif";
type Categorie = "Streaming" | "Transport" | "Télécom" | "Sport" | "Musique" | "Presse" | "Cloud" | "Autre";

interface Abonnement {
    id: string;
    nom: string;
    montant: number;
    frequence: Frequence;
    jourPrelevement: number;
    prochainPrelevement: Date;
    categorie: Categorie;
    compte: string;
    statut: Statut;
    imageUrl?: string;
    urlGestion?: string;
    dateDebut?: Date;
    notes?: string;
}

// ============================================
// DONNÉES
// ============================================

const horizontalTabs = [
    { id: "liste", label: "Liste" },
    { id: "calendrier", label: "Calendrier" },
    { id: "historique", label: "Historique" },
];

const verticalTabs = [
    { id: "all", label: "Tous" },
    { id: "actif", label: "Actifs" },
    { id: "inactif", label: "Inactifs" },
    { id: "mensuel", label: "Mensuel" },
    { id: "annuel", label: "Annuel" },
];

const abonnements: Abonnement[] = [
    {
        id: "abo-01",
        nom: "Netflix",
        montant: 13.49,
        frequence: "mensuel",
        jourPrelevement: 15,
        prochainPrelevement: new Date(2026, 0, 15),
        categorie: "Streaming",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/Ephemeral.jpg",
        urlGestion: "https://netflix.com/account",
    },
    {
        id: "abo-02",
        nom: "Spotify",
        montant: 5.99,
        frequence: "mensuel",
        jourPrelevement: 4,
        prochainPrelevement: new Date(2026, 1, 4),
        categorie: "Musique",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/Stack3d Lab.jpg",
    },
    {
        id: "abo-03",
        nom: "Free Mobile",
        montant: 12.99,
        frequence: "mensuel",
        jourPrelevement: 20,
        prochainPrelevement: new Date(2026, 0, 20),
        categorie: "Télécom",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/Warpspeed.jpg",
    },
    {
        id: "abo-04",
        nom: "Basic Fit",
        montant: 29.99,
        frequence: "mensuel",
        jourPrelevement: 1,
        prochainPrelevement: new Date(2026, 1, 1),
        categorie: "Sport",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/CloudWatch.jpg",
    },
    {
        id: "abo-05",
        nom: "Navigo",
        montant: 86.4,
        frequence: "mensuel",
        jourPrelevement: 5,
        prochainPrelevement: new Date(2026, 1, 5),
        categorie: "Transport",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/ContrastAI.jpg",
    },
    {
        id: "abo-06",
        nom: "iCloud+",
        montant: 2.99,
        frequence: "mensuel",
        jourPrelevement: 12,
        prochainPrelevement: new Date(2026, 0, 12),
        categorie: "Cloud",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/Convergence.jpg",
    },
    {
        id: "abo-07",
        nom: "Amazon Prime",
        montant: 69.9,
        frequence: "annuel",
        jourPrelevement: 28,
        prochainPrelevement: new Date(2026, 5, 28),
        categorie: "Streaming",
        compte: "Compte courant",
        statut: "actif",
        imageUrl: "https://www.untitledui.com/logos/images/Sisyphus.jpg",
    },
    {
        id: "abo-08",
        nom: "Le Monde",
        montant: 19.99,
        frequence: "mensuel",
        jourPrelevement: 10,
        prochainPrelevement: new Date(2026, 0, 10),
        categorie: "Presse",
        compte: "Compte courant",
        statut: "inactif",
        imageUrl: "https://www.untitledui.com/logos/images/Ephemeral.jpg",
    },
];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const formatDate = (date: Date): string => date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const formatDateLong = (date: Date): string => date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });

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

const getCoutMensuel = (abo: Abonnement): number => {
    switch (abo.frequence) {
        case "annuel":
            return abo.montant / 12;
        case "trimestriel":
            return abo.montant / 3;
        case "hebdo":
            return abo.montant * 4.33;
        default:
            return abo.montant;
    }
};

const getCoutAnnuel = (abo: Abonnement): number => {
    switch (abo.frequence) {
        case "annuel":
            return abo.montant;
        case "trimestriel":
            return abo.montant * 4;
        case "hebdo":
            return abo.montant * 52;
        default:
            return abo.montant * 12;
    }
};

const getFrequenceLabel = (freq: Frequence): string => {
    switch (freq) {
        case "annuel":
            return "/an";
        case "trimestriel":
            return "/trim.";
        case "hebdo":
            return "/sem.";
        default:
            return "/mois";
    }
};

const getCategorieColor = (cat: Categorie): string => {
    const colors: Record<Categorie, string> = {
        Streaming: "#7c3aed",
        Transport: "#06b6d4",
        Télécom: "#10b981",
        Sport: "#f59e0b",
        Musique: "#ec4899",
        Presse: "#6366f1",
        Cloud: "#14b8a6",
        Autre: "#6b7280",
    };
    return colors[cat];
};

// ============================================
// CALCULS
// ============================================

const abonnementsActifs = abonnements.filter((a) => a.statut === "actif");
const totalMensuel = abonnementsActifs.reduce((acc, a) => acc + getCoutMensuel(a), 0);
const totalAnnuel = abonnementsActifs.reduce((acc, a) => acc + getCoutAnnuel(a), 0);

// Prochain prélèvement
const prochainPrelevement = abonnementsActifs
    .filter((a) => getDaysUntil(a.prochainPrelevement) >= 0)
    .sort((a, b) => a.prochainPrelevement.getTime() - b.prochainPrelevement.getTime())[0];

// Timeline des 10 prochains
const timeline = abonnementsActifs
    .filter((a) => getDaysUntil(a.prochainPrelevement) >= 0)
    .sort((a, b) => a.prochainPrelevement.getTime() - b.prochainPrelevement.getTime())
    .slice(0, 10);

// Répartition par catégorie
const repartitionCategories = Object.entries(
    abonnementsActifs.reduce(
        (acc, a) => {
            const cat = a.categorie;
            acc[cat] = (acc[cat] || 0) + getCoutMensuel(a);
            return acc;
        },
        {} as Record<string, number>,
    ),
).map(([name, value]) => ({
    name,
    value,
    color: getCategorieColor(name as Categorie),
}));

// ============================================
// GÉNÉRATION EVENTS CALENDRIER
// ============================================

const generateCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const today = new Date();
    const startMonth = today.getMonth();
    const startYear = today.getFullYear();

    abonnementsActifs.forEach((abo) => {
        // Générer pour 12 mois
        for (let i = 0; i < 12; i++) {
            const month = (startMonth + i) % 12;
            const year = startYear + Math.floor((startMonth + i) / 12);
            const day = Math.min(abo.jourPrelevement, new Date(year, month + 1, 0).getDate());

            const eventDate = new Date(year, month, day, 9, 0);
            const eventEnd = new Date(year, month, day, 9, 30);

            events.push({
                id: `${abo.id}-${year}-${month}`,
                title: `${abo.nom} - ${formatCurrency(abo.montant)}`,
                start: eventDate,
                end: eventEnd,
                color: abo.categorie === "Streaming" ? "brand" : abo.categorie === "Transport" ? "blue" : abo.categorie === "Sport" ? "orange" : "gray",
                dot: true,
            });
        }
    });

    return events;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function AbonnementsPage() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const [selectedTab, setSelectedTab] = useState("all");
    const [selectedView, setSelectedView] = useState("liste");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newAbonnement, setNewAbonnement] = useState({
        nom: "",
        montant: "",
        frequence: "" as Frequence | "",
        jourPrelevement: "",
        categorie: "" as Categorie | "",
        compte: "",
        urlGestion: "",
        notes: "",
    });

    // Filtrage
    const filteredAbonnements = useMemo(() => {
        return abonnements.filter((a) => {
            switch (selectedTab) {
                case "actif":
                    return a.statut === "actif";
                case "inactif":
                    return a.statut === "inactif";
                case "mensuel":
                    return a.frequence === "mensuel";
                case "annuel":
                    return a.frequence === "annuel";
                default:
                    return true;
            }
        });
    }, [selectedTab]);

    // Tri
    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return filteredAbonnements;

        return filteredAbonnements.toSorted((a, b) => {
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
    }, [sortDescriptor, filteredAbonnements]);

    // Events calendrier
    const calendarEvents = useMemo(() => generateCalendarEvents(), []);

    const handleCreateAbonnement = () => {
        console.log("Nouvel abonnement:", newAbonnement);
        setIsModalOpen(false);
        setNewAbonnement({
            nom: "",
            montant: "",
            frequence: "",
            jourPrelevement: "",
            categorie: "",
            compte: "",
            urlGestion: "",
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
                                <p className="text-xl font-semibold text-primary lg:text-display-xs">Abonnements</p>
                                <p className="text-md text-tertiary">Gérez vos prélèvements récurrents</p>
                            </div>
                            <div className="flex flex-col gap-4 lg:flex-row">
                                <div className="flex items-start gap-3">
                                    <Button iconLeading={Upload04} color="secondary" size="md">
                                        Importer
                                    </Button>
                                    <Button iconLeading={PlusCircle} color="primary" size="md" onClick={() => setIsModalOpen(true)}>
                                        Nouvel abonnement
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Tabs
                            orientation="horizontal"
                            selectedKey={selectedView}
                            onSelectionChange={(key) => setSelectedView(key as string)}
                            className="-mx-4 pl-4"
                        >
                            <TabList size="sm" type="underline" items={horizontalTabs} />
                        </Tabs>
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
                            <MetricsSimple title={abonnementsActifs.length.toString()} subtitle="Abonnements actifs" type="modern" trend="positive" />
                            <MetricsSimple title={formatCurrency(totalMensuel)} subtitle="Coût mensuel" type="modern" trend="positive" change="100%" />
                            <MetricsSimple title={formatCurrency(totalAnnuel)} subtitle="Coût annuel" type="modern" trend="positive" />
                            {prochainPrelevement && (
                                <MetricsSimple
                                    title={prochainPrelevement.nom}
                                    subtitle={`${formatDate(prochainPrelevement.prochainPrelevement)} • ${formatCurrency(prochainPrelevement.montant)}`}
                                    type="modern"
                                    trend="positive"
                                />
                            )}
                        </div>

                        {/* Vue Liste */}
                        {selectedView === "liste" && (
                            <div className="flex w-full flex-col gap-6">
                                {/* Filtres */}
                                <div className="hidden justify-between gap-4 lg:flex">
                                    <div className="flex gap-3">
                                        <Button iconTrailing={XClose} size="md" color="secondary">
                                            Tous statuts
                                        </Button>
                                        <Button iconTrailing={XClose} size="md" color="secondary">
                                            Toutes fréquences
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
                                            Tous statuts
                                        </BadgeWithButton>
                                        <BadgeWithButton color="brand" size="md" type="pill-color" buttonLabel="Clear" onButtonClick={() => {}}>
                                            Toutes fréq.
                                        </BadgeWithButton>
                                    </div>
                                </div>

                                {/* Table */}
                                <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                                    <Table aria-label="Abonnements" selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
                                        <Table.Header>
                                            <Table.Head id="nom" isRowHeader allowsSorting label="Abonnement" className="w-full" />
                                            <Table.Head id="statut" label="Statut" />
                                            <Table.Head id="montant" allowsSorting label="Montant" className="max-lg:hidden" />
                                            <Table.Head id="coutMensuel" label="Coût/mois" className="max-lg:hidden" />
                                            <Table.Head id="prochainPrelevement" allowsSorting label="Prochain" />
                                            <Table.Head id="categorie" label="Catégorie" className="max-lg:hidden" />
                                            <Table.Head id="actions" />
                                        </Table.Header>
                                        <Table.Body items={sortedItems}>
                                            {(abo) => {
                                                const jMoins = getJMoinsBadge(abo.prochainPrelevement);
                                                const coutMensuel = getCoutMensuel(abo);

                                                return (
                                                    <Table.Row id={abo.id} className="selected:bg-primary">
                                                        <Table.Cell>
                                                            <div className="group flex items-center gap-3 outline-hidden">
                                                                <Avatar src={abo.imageUrl} alt={abo.nom} size="md" initials={abo.nom.substring(0, 2)} />
                                                                <div>
                                                                    <p className="text-sm font-medium text-primary">{abo.nom}</p>
                                                                    <p className="text-sm text-tertiary">
                                                                        {formatCurrency(abo.montant)}
                                                                        {getFrequenceLabel(abo.frequence)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Badge
                                                                size="sm"
                                                                type="pill-color"
                                                                color={abo.statut === "actif" ? "success" : "gray"}
                                                                className="capitalize"
                                                            >
                                                                {abo.statut === "actif" ? "Actif" : "Inactif"}
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell className="max-lg:hidden">
                                                            <span className="text-sm font-medium text-primary">{formatCurrency(abo.montant)}</span>
                                                        </Table.Cell>
                                                        <Table.Cell className="max-lg:hidden">
                                                            <span className="text-sm text-tertiary">{formatCurrency(coutMensuel)}</span>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm text-primary">{formatDate(abo.prochainPrelevement)}</span>
                                                                <Badge size="sm" type="pill-color" color={jMoins.color}>
                                                                    {jMoins.label}
                                                                </Badge>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className="max-lg:hidden">
                                                            <Badge size="sm" type="pill-color" color="gray">
                                                                {abo.categorie}
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell className="px-4">
                                                            <div className="flex justify-end gap-0.5">
                                                                {abo.urlGestion && (
                                                                    <ButtonUtility
                                                                        size="xs"
                                                                        color="tertiary"
                                                                        tooltip="Gérer"
                                                                        icon={Globe02}
                                                                        onClick={() => window.open(abo.urlGestion, "_blank")}
                                                                    />
                                                                )}
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
                        )}

                        {/* Vue Calendrier */}
                        {selectedView === "calendrier" && (
                            <div className="flex w-full flex-col gap-6">
                                <Calendar events={calendarEvents} view="month" className="h-[700px]" />
                            </div>
                        )}

                        {/* Vue Historique (placeholder) */}
                        {selectedView === "historique" && (
                            <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
                                <CalendarIcon className="h-12 w-12 text-quaternary" />
                                <p className="text-lg font-medium text-tertiary">Historique des prélèvements</p>
                                <p className="text-sm text-quaternary">Bientôt disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Sidebar droite */}
            <div className="sticky top-0 hidden h-screen w-80 flex-col overflow-hidden border-l border-secondary bg-secondary_subtle xl:flex">
                {/* Timeline */}
                <div className="flex w-full flex-wrap items-start justify-between gap-4 border-b border-secondary bg-alpha-white/90 px-6 py-5 backdrop-blur">
                    <p className="text-lg font-semibold text-primary">Prochains prélèvements</p>
                </div>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                    {timeline.map((abo) => {
                        const jMoins = getJMoinsBadge(abo.prochainPrelevement);
                        return (
                            <div key={abo.id} className="flex items-start gap-3">
                                <Avatar src={abo.imageUrl} alt={abo.nom} size="sm" initials={abo.nom.substring(0, 2)} />
                                <div className="flex flex-1 flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary">{abo.nom}</p>
                                        <span className="text-sm font-semibold text-primary">{formatCurrency(abo.montant)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-tertiary">{formatDateLong(abo.prochainPrelevement)}</p>
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
                    <p className="text-sm font-semibold text-primary">Répartition par catégorie</p>
                    <div className="flex items-center gap-4">
                        <div className="h-24 w-24">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={repartitionCategories}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                        paddingAngle={2}
                                    >
                                        {repartitionCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                            {repartitionCategories.slice(0, 4).map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs text-tertiary">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-medium text-primary">{formatCurrency(cat.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alerte prochain */}
                {prochainPrelevement && getDaysUntil(prochainPrelevement.prochainPrelevement) <= 3 && (
                    <div className="flex items-center gap-3 border-t border-secondary bg-warning-50 px-6 py-4">
                        <AlertCircle className="h-5 w-5 text-warning-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-warning-700">
                                {prochainPrelevement.nom} dans {getDaysUntil(prochainPrelevement.prochainPrelevement)} jour(s)
                            </p>
                            <p className="text-xs text-warning-600">{formatCurrency(prochainPrelevement.montant)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modale nouvel abonnement */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Nouvel abonnement</h2>
                                    <p className="text-sm text-tertiary">Ajoutez un prélèvement récurrent</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Nom"
                                            placeholder="Ex: Netflix"
                                            value={newAbonnement.nom}
                                            onChange={(value) => setNewAbonnement({ ...newAbonnement, nom: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Montant (€)"
                                            type="number"
                                            placeholder="0.00"
                                            value={newAbonnement.montant}
                                            onChange={(value) => setNewAbonnement({ ...newAbonnement, montant: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Fréquence"
                                            selectedKey={newAbonnement.frequence}
                                            onSelectionChange={(v) => setNewAbonnement({ ...newAbonnement, frequence: v as Frequence })}
                                            items={[
                                                { id: "mensuel", label: "Mensuel" },
                                                { id: "annuel", label: "Annuel" },
                                                { id: "trimestriel", label: "Trimestriel" },
                                                { id: "hebdo", label: "Hebdomadaire" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <Input
                                            label="Jour de prélèvement"
                                            type="number"
                                            placeholder="15"
                                            value={newAbonnement.jourPrelevement}
                                            onChange={(value) => setNewAbonnement({ ...newAbonnement, jourPrelevement: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Catégorie"
                                            selectedKey={newAbonnement.categorie}
                                            onSelectionChange={(v) => setNewAbonnement({ ...newAbonnement, categorie: v as Categorie })}
                                            items={[
                                                { id: "Streaming", label: "Streaming" },
                                                { id: "Musique", label: "Musique" },
                                                { id: "Transport", label: "Transport" },
                                                { id: "Télécom", label: "Télécom" },
                                                { id: "Sport", label: "Sport" },
                                                { id: "Presse", label: "Presse" },
                                                { id: "Cloud", label: "Cloud" },
                                                { id: "Autre", label: "Autre" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <Select
                                            label="Compte"
                                            selectedKey={newAbonnement.compte}
                                            onSelectionChange={(v) => setNewAbonnement({ ...newAbonnement, compte: v as string })}
                                            items={[
                                                { id: "Compte courant", label: "Compte courant" },
                                                { id: "Livret A", label: "Livret A" },
                                            ]}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>

                                    <Input
                                        label="URL de gestion (optionnel)"
                                        type="url"
                                        placeholder="https://..."
                                        value={newAbonnement.urlGestion}
                                        onChange={(value) => setNewAbonnement({ ...newAbonnement, urlGestion: value })}
                                    />

                                    <TextArea
                                        label="Notes (optionnel)"
                                        placeholder="Comment annuler, conditions..."
                                        value={newAbonnement.notes}
                                        onChange={(value) => setNewAbonnement({ ...newAbonnement, notes: value })}
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
                                        onClick={handleCreateAbonnement}
                                        className="flex-1"
                                        isDisabled={
                                            !newAbonnement.nom ||
                                            !newAbonnement.montant ||
                                            !newAbonnement.frequence ||
                                            !newAbonnement.jourPrelevement ||
                                            !newAbonnement.categorie ||
                                            !newAbonnement.compte
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

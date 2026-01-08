"use client";

import { useMemo, useState } from "react";
import {
    AlertCircle,
    Calendar as CalendarIcon,
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
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Calendar, type CalendarEvent } from "@/components/application/calendar/calendar";
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
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";
import { createClient } from "@/lib/supabase/client";
import type { RepartitionCategorie } from "@/lib/data/charges-fixes";
import type { Profile, Compte, Categorie } from "@/types/database.types";

// ============================================
// TYPES
// ============================================

interface SerializedChargeFix {
    id: string;
    nom: string;
    montant: number;
    frequence: "hebdo" | "mensuel" | "trimestriel" | "annuel";
    jourPrelevement: number;
    prochainPrelevement: string;
    categorieId: string | null;
    categorieNom: string;
    compteId: string | null;
    compteNom: string;
    estActif: boolean;
    dateDebut: string | null;
    dateFin: string | null;
    notes: string | null;
    icone: string | null;
    couleur: string | null;
    coutMensuel: number;
    coutAnnuel: number;
}

interface SerializedTotaux {
    nombreActifs: number;
    nombreInactifs: number;
    totalMensuel: number;
    totalAnnuel: number;
    prochainPrelevement: SerializedChargeFix | null;
}

interface SerializedChargesFixesData {
    profile: Profile | null;
    chargesFixes: SerializedChargeFix[];
    comptes: Compte[];
    categories: Categorie[];
    timeline: SerializedChargeFix[];
    repartitionCategories: RepartitionCategorie[];
    totaux: SerializedTotaux;
}

interface ChargesFixesClientProps {
    initialData: SerializedChargesFixesData;
}

// ============================================
// CONSTANTES
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

const FREQUENCES = [
    { id: "mensuel", label: "Mensuel" },
    { id: "annuel", label: "Annuel" },
    { id: "trimestriel", label: "Trimestriel" },
    { id: "hebdo", label: "Hebdomadaire" },
];

const CATEGORIES_DEFAUT = [
    { id: "Streaming", label: "Streaming" },
    { id: "Musique", label: "Musique" },
    { id: "Transport", label: "Transport" },
    { id: "Telecom", label: "Telecom" },
    { id: "Sport", label: "Sport" },
    { id: "Presse", label: "Presse" },
    { id: "Cloud", label: "Cloud" },
    { id: "Logement", label: "Logement" },
    { id: "Assurance", label: "Assurance" },
    { id: "Autre", label: "Autre" },
];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string =>
    amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const formatDate = (date: Date): string =>
    date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const formatDateLong = (date: Date): string =>
    date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });

const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getJMoinsBadge = (date: Date): { label: string; color: "success" | "warning" | "error" | "gray" } => {
    const days = getDaysUntil(date);
    if (days < 0) return { label: "Passe", color: "gray" };
    if (days === 0) return { label: "Aujourd'hui", color: "error" };
    if (days <= 3) return { label: `J-${days}`, color: "error" };
    if (days <= 7) return { label: `J-${days}`, color: "warning" };
    return { label: `J-${days}`, color: "success" };
};

const getFrequenceLabel = (freq: string): string => {
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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ChargesFixesClient({ initialData }: ChargesFixesClientProps) {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
    const [selectedTab, setSelectedTab] = useState("all");
    const [selectedView, setSelectedView] = useState("liste");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newChargeFix, setNewChargeFix] = useState({
        nom: "",
        montant: "",
        frequence: "mensuel",
        jourPrelevement: "",
        categorieId: "",
        compteId: "",
        urlGestion: "",
        notes: "",
    });

    // Donnees
    const profile = initialData.profile;
    const chargesFixes = initialData.chargesFixes;
    const comptes = initialData.comptes;
    const categories = initialData.categories;
    const timeline = initialData.timeline;
    const repartitionCategories = initialData.repartitionCategories;
    const totaux = initialData.totaux;

    // Filtrage
    const filteredChargesFixes = useMemo(() => {
        return chargesFixes.filter((cf) => {
            switch (selectedTab) {
                case "actif":
                    return cf.estActif;
                case "inactif":
                    return !cf.estActif;
                case "mensuel":
                    return cf.frequence === "mensuel";
                case "annuel":
                    return cf.frequence === "annuel";
                default:
                    return true;
            }
        });
    }, [selectedTab, chargesFixes]);

    // Tri
    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return filteredChargesFixes;

        return [...filteredChargesFixes].sort((a, b) => {
            const column = sortDescriptor.column as keyof SerializedChargeFix;

            if (column === "prochainPrelevement") {
                const first = new Date(a.prochainPrelevement).getTime();
                const second = new Date(b.prochainPrelevement).getTime();
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            const first = a[column];
            const second = b[column];

            if (typeof first === "number" && typeof second === "number") {
                return sortDescriptor.direction === "ascending" ? first - second : second - first;
            }

            if (typeof first === "string" && typeof second === "string") {
                const result = first.localeCompare(second);
                return sortDescriptor.direction === "ascending" ? result : -result;
            }

            return 0;
        });
    }, [sortDescriptor, filteredChargesFixes]);

    // Events calendrier
    const calendarEvents = useMemo((): CalendarEvent[] => {
        const events: CalendarEvent[] = [];
        const today = new Date();
        const startMonth = today.getMonth();
        const startYear = today.getFullYear();

        const chargesActives = chargesFixes.filter((cf) => cf.estActif);

        chargesActives.forEach((cf) => {
            // Generer pour 12 mois
            for (let i = 0; i < 12; i++) {
                const month = (startMonth + i) % 12;
                const year = startYear + Math.floor((startMonth + i) / 12);
                const day = Math.min(cf.jourPrelevement, new Date(year, month + 1, 0).getDate());

                const eventDate = new Date(year, month, day, 9, 0);
                const eventEnd = new Date(year, month, day, 9, 30);

                events.push({
                    id: `${cf.id}-${year}-${month}`,
                    title: `${cf.nom} - ${formatCurrency(cf.montant)}`,
                    start: eventDate,
                    end: eventEnd,
                    color: cf.categorieNom === "Streaming" ? "brand" : cf.categorieNom === "Transport" ? "blue" : cf.categorieNom === "Sport" ? "orange" : "gray",
                    dot: true,
                });
            }
        });

        return events;
    }, [chargesFixes]);

    // Reset modal
    const resetNewChargeFix = () => {
        setNewChargeFix({
            nom: "",
            montant: "",
            frequence: "mensuel",
            jourPrelevement: "",
            categorieId: "",
            compteId: "",
            urlGestion: "",
            notes: "",
        });
    };

    // Handlers
    const handleCreateChargeFix = async () => {
        if (!profile || !newChargeFix.nom || !newChargeFix.montant || !newChargeFix.jourPrelevement) return;

        setIsSaving(true);
        const supabase = createClient();

        const { error } = await supabase.from("charges_fixes").insert({
            user_id: profile.id,
            nom: newChargeFix.nom,
            montant: parseFloat(newChargeFix.montant),
            frequence: newChargeFix.frequence,
            jour_prelevement: parseInt(newChargeFix.jourPrelevement),
            categorie_id: newChargeFix.categorieId || null,
            compte_id: newChargeFix.compteId || null,
            notes: newChargeFix.notes || null,
            est_actif: true,
        });

        if (!error) {
            setIsModalOpen(false);
            resetNewChargeFix();
            window.location.reload();
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette charge fixe ?")) return;

        const supabase = createClient();
        const { error } = await supabase.from("charges_fixes").delete().eq("id", id);

        if (!error) {
            window.location.reload();
        }
    };

    const handleToggleActive = async (id: string, estActif: boolean) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("charges_fixes")
            .update({ est_actif: !estActif })
            .eq("id", id);

        if (!error) {
            window.location.reload();
        }
    };

    // Message si pas de donnees
    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-primary">Chargement...</h1>
                    <p className="text-tertiary">Recuperation de vos donnees...</p>
                </div>
            </div>
        );
    }

    // Prochain prelevement
    const prochainPrel = totaux.prochainPrelevement
        ? {
              ...totaux.prochainPrelevement,
              prochainPrelevementDate: new Date(totaux.prochainPrelevement.prochainPrelevement),
          }
        : null;

    return (
        <div className="flex min-h-screen">
            {/* Main content */}
            <main className="flex w-full min-w-0 flex-1 flex-col gap-8 bg-primary pt-8 pb-12 shadow-none lg:pt-12 lg:pb-24">
                <div className="mx-auto flex w-full max-w-container flex-col gap-5 px-4 lg:px-8">
                    {/* Page header */}
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                            <div className="flex flex-col gap-0.5 md:gap-1">
                                <p className="text-xl font-semibold text-primary lg:text-display-xs">Charges fixes</p>
                                <p className="text-md text-tertiary">Gerez vos prelevements recurrents</p>
                            </div>
                            <div className="flex flex-col gap-4 lg:flex-row">
                                <div className="flex items-start gap-3">
                                    <Button iconLeading={Upload04} color="secondary" size="md">
                                        Importer
                                    </Button>
                                    <Button iconLeading={PlusCircle} color="primary" size="md" onClick={() => setIsModalOpen(true)}>
                                        Nouvelle charge fixe
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
                        {/* Metriques */}
                        <div className="grid w-full grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricsSimple title={totaux.nombreActifs.toString()} subtitle="Charges actives" type="modern" trend="positive" />
                            <MetricsSimple title={formatCurrency(totaux.totalMensuel)} subtitle="Cout mensuel" type="modern" trend="positive" change="100%" />
                            <MetricsSimple title={formatCurrency(totaux.totalAnnuel)} subtitle="Cout annuel" type="modern" trend="positive" />
                            {prochainPrel && (
                                <MetricsSimple
                                    title={prochainPrel.nom}
                                    subtitle={`${formatDate(prochainPrel.prochainPrelevementDate)} - ${formatCurrency(prochainPrel.montant)}`}
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
                                            Toutes frequences
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
                                            Toutes freq.
                                        </BadgeWithButton>
                                    </div>
                                </div>

                                {/* Table */}
                                <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
                                    <Table aria-label="Charges fixes" selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
                                        <Table.Header>
                                            <Table.Head id="nom" isRowHeader allowsSorting label="Charge fixe" className="w-full" />
                                            <Table.Head id="estActif" label="Statut" />
                                            <Table.Head id="montant" allowsSorting label="Montant" className="max-lg:hidden" />
                                            <Table.Head id="coutMensuel" label="Cout/mois" className="max-lg:hidden" />
                                            <Table.Head id="prochainPrelevement" allowsSorting label="Prochain" />
                                            <Table.Head id="categorieNom" label="Categorie" className="max-lg:hidden" />
                                            <Table.Head id="actions" />
                                        </Table.Header>
                                        <Table.Body items={sortedItems}>
                                            {(cf) => {
                                                const prochainDate = new Date(cf.prochainPrelevement);
                                                const jMoins = getJMoinsBadge(prochainDate);

                                                return (
                                                    <Table.Row id={cf.id} className="selected:bg-primary">
                                                        <Table.Cell>
                                                            <div className="group flex items-center gap-3 outline-hidden">
                                                                <Avatar alt={cf.nom} size="md" initials={cf.nom.substring(0, 2)} />
                                                                <div>
                                                                    <p className="text-sm font-medium text-primary">{cf.nom}</p>
                                                                    <p className="text-sm text-tertiary">
                                                                        {formatCurrency(cf.montant)}
                                                                        {getFrequenceLabel(cf.frequence)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleActive(cf.id, cf.estActif)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Badge
                                                                    size="sm"
                                                                    type="pill-color"
                                                                    color={cf.estActif ? "success" : "gray"}
                                                                    className="capitalize"
                                                                >
                                                                    {cf.estActif ? "Actif" : "Inactif"}
                                                                </Badge>
                                                            </button>
                                                        </Table.Cell>
                                                        <Table.Cell className="max-lg:hidden">
                                                            <span className="text-sm font-medium text-primary">{formatCurrency(cf.montant)}</span>
                                                        </Table.Cell>
                                                        <Table.Cell className="max-lg:hidden">
                                                            <span className="text-sm text-tertiary">{formatCurrency(cf.coutMensuel)}</span>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm text-primary">{formatDate(prochainDate)}</span>
                                                                <Badge size="sm" type="pill-color" color={jMoins.color}>
                                                                    {jMoins.label}
                                                                </Badge>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className="max-lg:hidden">
                                                            <Badge size="sm" type="pill-color" color="gray">
                                                                {cf.categorieNom}
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell className="px-4">
                                                            <div className="flex justify-end gap-0.5">
                                                                <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} onClick={() => handleDelete(cf.id)} />
                                                                <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit01} />
                                                            </div>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                );
                                            }}
                                        </Table.Body>
                                    </Table>
                                </TableCard.Root>
                                {sortedItems.length > 0 && <PaginationPageMinimalCenter page={1} total={1} />}
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
                                <p className="text-lg font-medium text-tertiary">Historique des prelevements</p>
                                <p className="text-sm text-quaternary">Bientot disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Sidebar droite */}
            <div className="sticky top-0 hidden h-screen w-80 flex-col overflow-hidden border-l border-secondary bg-secondary_subtle xl:flex">
                {/* Timeline */}
                <div className="flex w-full flex-wrap items-start justify-between gap-4 border-b border-secondary bg-alpha-white/90 px-6 py-5 backdrop-blur">
                    <p className="text-lg font-semibold text-primary">Prochains prelevements</p>
                </div>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                    {timeline.length > 0 ? (
                        timeline.map((cf) => {
                            const prochainDate = new Date(cf.prochainPrelevement);
                            const jMoins = getJMoinsBadge(prochainDate);
                            return (
                                <div key={cf.id} className="flex items-start gap-3">
                                    <Avatar alt={cf.nom} size="sm" initials={cf.nom.substring(0, 2)} />
                                    <div className="flex flex-1 flex-col gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary">{cf.nom}</p>
                                            <span className="text-sm font-semibold text-primary">{formatCurrency(cf.montant)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-tertiary">{formatDateLong(prochainDate)}</p>
                                            <Badge size="sm" type="pill-color" color={jMoins.color}>
                                                {jMoins.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-tertiary">Aucun prelevement a venir</p>
                    )}
                </div>

                {/* Donut repartition */}
                {repartitionCategories.length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-secondary bg-primary px-6 py-5">
                        <p className="text-sm font-semibold text-primary">Repartition par categorie</p>
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
                )}

                {/* Alerte prochain */}
                {prochainPrel && getDaysUntil(prochainPrel.prochainPrelevementDate) <= 3 && (
                    <div className="flex items-center gap-3 border-t border-secondary bg-warning-50 px-6 py-4">
                        <AlertCircle className="h-5 w-5 text-warning-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-warning-700">
                                {prochainPrel.nom} dans {getDaysUntil(prochainPrel.prochainPrelevementDate)} jour(s)
                            </p>
                            <p className="text-xs text-warning-600">{formatCurrency(prochainPrel.montant)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modale nouvelle charge fixe */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                {/* Header */}
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">Nouvelle charge fixe</h2>
                                    <p className="text-sm text-tertiary">Ajoutez un prelevement recurrent</p>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Nom"
                                            placeholder="Ex: Netflix"
                                            value={newChargeFix.nom}
                                            onChange={(value) => setNewChargeFix({ ...newChargeFix, nom: value })}
                                            isRequired
                                        />
                                        <Input
                                            label="Montant"
                                            type="number"
                                            placeholder="0.00"
                                            value={newChargeFix.montant}
                                            onChange={(value) => setNewChargeFix({ ...newChargeFix, montant: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Frequence"
                                            selectedKey={newChargeFix.frequence}
                                            onSelectionChange={(v) => setNewChargeFix({ ...newChargeFix, frequence: v as string })}
                                            items={FREQUENCES}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <Input
                                            label="Jour de prelevement"
                                            type="number"
                                            placeholder="15"
                                            value={newChargeFix.jourPrelevement}
                                            onChange={(value) => setNewChargeFix({ ...newChargeFix, jourPrelevement: value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {categories.length > 0 ? (
                                            <Select
                                                label="Categorie"
                                                selectedKey={newChargeFix.categorieId}
                                                onSelectionChange={(v) => setNewChargeFix({ ...newChargeFix, categorieId: v as string })}
                                                items={categories.map((c) => ({ id: c.id, label: c.nom }))}
                                            >
                                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                            </Select>
                                        ) : (
                                            <Select
                                                label="Categorie"
                                                selectedKey={newChargeFix.categorieId}
                                                onSelectionChange={(v) => setNewChargeFix({ ...newChargeFix, categorieId: v as string })}
                                                items={CATEGORIES_DEFAUT}
                                            >
                                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                            </Select>
                                        )}

                                        {comptes.length > 0 ? (
                                            <Select
                                                label="Compte"
                                                selectedKey={newChargeFix.compteId}
                                                onSelectionChange={(v) => setNewChargeFix({ ...newChargeFix, compteId: v as string })}
                                                items={comptes.map((c) => ({ id: c.id, label: c.nom }))}
                                            >
                                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                            </Select>
                                        ) : (
                                            <Input
                                                label="Compte"
                                                placeholder="Compte courant"
                                                value={newChargeFix.compteId}
                                                onChange={(value) => setNewChargeFix({ ...newChargeFix, compteId: value })}
                                            />
                                        )}
                                    </div>

                                    <TextArea
                                        label="Notes (optionnel)"
                                        placeholder="Comment annuler, conditions..."
                                        value={newChargeFix.notes}
                                        onChange={(value) => setNewChargeFix({ ...newChargeFix, notes: value })}
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
                                        onClick={handleCreateChargeFix}
                                        className="flex-1"
                                        isDisabled={!newChargeFix.nom || !newChargeFix.montant || !newChargeFix.jourPrelevement || isSaving}
                                    >
                                        {isSaving ? "Creation..." : "Creer"}
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

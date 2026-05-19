"use client";

import { useMemo, useState } from "react";
import {
    AlertCircle,
    Edit01,
    PlusCircle,
    SearchLg,
    Trash01,
    X,
} from "@untitledui/icons";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Calendar, type CalendarEvent } from "@/components/application/calendar/calendar";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, formatDateShort, getDaysUntil, getJMoinsBadge, getFrequenceLabel } from "@/utils/format";
import type { RepartitionCategorie } from "@/lib/data/charges-fixes";
import type { Profile, Compte } from "@/types/api";
import type { CategoryResponse as Categorie } from "@/types/api";

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

export interface ChargesFixesTabProps {
    initialData: SerializedChargesFixesData;
}

// ============================================
// CONSTANTES
// ============================================

const FILTER_PILLS = [
    { id: "all", label: "Tous" },
    { id: "actif", label: "Actifs" },
    { id: "inactif", label: "Inactifs" },
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

// Icônes par catégorie (fallback sur les initiales)
const CATEGORY_ICONS: Record<string, string> = {
    Streaming: "🎬",
    Musique: "🎵",
    Transport: "🚗",
    Telecom: "📱",
    Sport: "🏋️",
    Presse: "📰",
    Cloud: "☁️",
    Logement: "🏠",
    Assurance: "🛡️",
    Autre: "📦",
};

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string =>
    amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const getCategoryIcon = (cf: SerializedChargeFix): string => {
    if (cf.icone) return cf.icone;
    return CATEGORY_ICONS[cf.categorieNom] || "📦";
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function ChargesFixesTab({ initialData }: ChargesFixesTabProps) {
    const [selectedView, setSelectedView] = useState<"cards" | "calendrier">("cards");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const [newChargeFix, setNewChargeFix] = useState({
        nom: "",
        montant: "",
        frequence: "mensuel",
        jourPrelevement: "",
        categorieId: "",
        compteId: "",
        notes: "",
    });

    const profile = initialData.profile;
    const chargesFixes = initialData.chargesFixes;
    const comptes = initialData.comptes;
    const categories = initialData.categories;
    const repartitionCategories = initialData.repartitionCategories;
    const totaux = initialData.totaux;

    // Filtrage
    const filteredChargesFixes = useMemo(() => {
        let filtered = chargesFixes.filter((cf) => {
            switch (selectedFilter) {
                case "actif": return cf.estActif;
                case "inactif": return !cf.estActif;
                default: return true;
            }
        });

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((cf) =>
                cf.nom.toLowerCase().includes(q) || cf.categorieNom.toLowerCase().includes(q)
            );
        }

        // Tri par prochain prélèvement
        return filtered.sort((a, b) =>
            new Date(a.prochainPrelevement).getTime() - new Date(b.prochainPrelevement).getTime()
        );
    }, [selectedFilter, searchQuery, chargesFixes]);

    // Events calendrier
    const calendarEvents = useMemo((): CalendarEvent[] => {
        const events: CalendarEvent[] = [];
        const today = new Date();
        const startMonth = today.getMonth();
        const startYear = today.getFullYear();

        const chargesActives = chargesFixes.filter((cf) => cf.estActif);

        chargesActives.forEach((cf) => {
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
                    color: cf.categorieNom === "Logement" ? "brand" : cf.categorieNom === "Transport" ? "blue" : cf.categorieNom === "Sport" ? "orange" : "gray",
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
            notes: "",
        });
    };

    // Handlers
    const handleCreateChargeFix = async () => {
        if (!profile || !newChargeFix.nom || !newChargeFix.montant || !newChargeFix.jourPrelevement) return;

        setIsSaving(true);

        try {
            const { addChargeFix } = await import("@/lib/data/charges-fixes");
            await addChargeFix({
                nom: newChargeFix.nom,
                montant: parseFloat(newChargeFix.montant),
                frequence: newChargeFix.frequence,
                jour_prelevement: parseInt(newChargeFix.jourPrelevement),
                categorie_id: newChargeFix.categorieId || undefined,
                compte_id: newChargeFix.compteId || undefined,
                notes: newChargeFix.notes || undefined,
            });

            setIsModalOpen(false);
            resetNewChargeFix();
            window.location.reload();
        } catch (error) {
            console.error("Erreur création charge fixe:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette charge fixe ?")) return;

        try {
            const { deleteChargeFix } = await import("@/lib/data/charges-fixes");
            await deleteChargeFix(id);
            window.location.reload();
        } catch (error) {
            console.error("Erreur suppression charge fixe:", error);
        }
    };

    const handleToggleActive = async (id: string, estActif: boolean) => {
        try {
            const { toggleChargeFixActive } = await import("@/lib/data/charges-fixes");
            await toggleChargeFixActive(id, !estActif);
            window.location.reload();
        } catch (error) {
            console.error("Erreur toggle charge fixe:", error);
        }
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-primary">Chargement...</h1>
                    <p className="text-tertiary">Récupération de vos données...</p>
                </div>
            </div>
        );
    }

    // Prochain prelevement alert
    const prochainPrel = totaux.prochainPrelevement
        ? {
              ...totaux.prochainPrelevement,
              prochainPrelevementDate: new Date(totaux.prochainPrelevement.prochainPrelevement),
          }
        : null;

    return (
        <div className="flex flex-col gap-6">
            {/* ============================================ */}
            {/* ALERTE PROCHAIN PRÉLÈVEMENT */}
            {/* ============================================ */}
            {prochainPrel && getDaysUntil(prochainPrel.prochainPrelevementDate) <= 3 && (
                <div className="flex items-center gap-3 rounded-xl bg-warning-50 p-4 ring-1 ring-warning-200 ring-inset">
                    <AlertCircle className="h-5 w-5 shrink-0 text-warning-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-warning-700">
                            {prochainPrel.nom} dans {getDaysUntil(prochainPrel.prochainPrelevementDate)} jour(s)
                        </p>
                        <p className="text-xs text-warning-600">{formatCurrency(prochainPrel.montant)}</p>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* BARRE FILTRES + ACTIONS */}
            {/* ============================================ */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Pills de filtre */}
                <div className="flex items-center gap-2">
                    {FILTER_PILLS.map((pill) => (
                        <button
                            key={pill.id}
                            onClick={() => setSelectedFilter(pill.id)}
                            className={cx(
                                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                                selectedFilter === pill.id
                                    ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                                    : "text-tertiary hover:bg-secondary hover:text-primary"
                            )}
                        >
                            {pill.label}
                            {pill.id === "all" && (
                                <span className="ml-1.5 text-xs text-quaternary">{chargesFixes.length}</span>
                            )}
                            {pill.id === "actif" && (
                                <span className="ml-1.5 text-xs text-quaternary">{totaux.nombreActifs}</span>
                            )}
                            {pill.id === "inactif" && (
                                <span className="ml-1.5 text-xs text-quaternary">{totaux.nombreInactifs}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle Cards / Calendrier */}
                    <div className="flex rounded-lg ring-1 ring-secondary">
                        <button
                            onClick={() => setSelectedView("cards")}
                            className={cx(
                                "rounded-l-lg px-3 py-1.5 text-xs font-medium transition-all",
                                selectedView === "cards"
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-tertiary hover:text-primary"
                            )}
                        >
                            Cards
                        </button>
                        <button
                            onClick={() => setSelectedView("calendrier")}
                            className={cx(
                                "rounded-r-lg px-3 py-1.5 text-xs font-medium transition-all",
                                selectedView === "calendrier"
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-tertiary hover:text-primary"
                            )}
                        >
                            Calendrier
                        </button>
                    </div>

                    {selectedView === "cards" && (
                        <Input
                            icon={SearchLg}
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(v) => setSearchQuery(v)}
                            size="sm"
                            className="w-48"
                        />
                    )}
                    <Button iconLeading={PlusCircle} color="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                        Nouvelle
                    </Button>
                </div>
            </div>

            {/* ============================================ */}
            {/* VUE CALENDRIER */}
            {/* ============================================ */}
            {selectedView === "calendrier" && (
                <div className="rounded-xl ring-1 ring-secondary ring-inset">
                    <Calendar events={calendarEvents} view="month" className="h-[700px]" />
                </div>
            )}

            {/* ============================================ */}
            {/* GRILLE DE CARDS */}
            {/* ============================================ */}
            {selectedView === "cards" && (filteredChargesFixes.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredChargesFixes.map((cf) => {
                        const prochainDate = new Date(cf.prochainPrelevement);
                        const jMoins = getJMoinsBadge(prochainDate);
                        const isExpanded = expandedCard === cf.id;

                        return (
                            <div
                                key={cf.id}
                                className={cx(
                                    "group relative flex flex-col gap-3 rounded-xl p-4 ring-1 transition-all",
                                    cf.estActif
                                        ? "bg-primary ring-secondary hover:ring-brand-200 hover:shadow-xs"
                                        : "bg-secondary/50 ring-secondary opacity-75"
                                )}
                            >
                                {/* Header: icône + nom + montant */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl">
                                            {getCategoryIcon(cf)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-primary">{cf.nom}</p>
                                            <p className="text-xs text-tertiary">{cf.categorieNom}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-primary">{formatCurrency(cf.coutMensuel)}</p>
                                        <p className="text-xs text-quaternary">/mois</p>
                                    </div>
                                </div>

                                {/* Info: prochain + statut */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-tertiary">{formatDateShort(prochainDate)}</span>
                                        <Badge size="sm" type="pill-color" color={jMoins.color}>
                                            {jMoins.label}
                                        </Badge>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(cf.id, cf.estActif)}
                                        className="cursor-pointer"
                                    >
                                        <Badge
                                            size="sm"
                                            type="pill-color"
                                            color={cf.estActif ? "success" : "gray"}
                                        >
                                            {cf.estActif ? "Actif" : "Inactif"}
                                        </Badge>
                                    </button>
                                </div>

                                {/* Montant original si différent du mensuel */}
                                {cf.frequence !== "mensuel" && (
                                    <p className="text-xs text-quaternary">
                                        {formatCurrency(cf.montant)}{getFrequenceLabel(cf.frequence)}
                                    </p>
                                )}

                                {/* Actions (visible on hover desktop, always on mobile) */}
                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                                    <ButtonUtility size="xs" color="tertiary" tooltip="Modifier" icon={Edit01} />
                                    <ButtonUtility size="xs" color="tertiary" tooltip="Supprimer" icon={Trash01} onClick={() => handleDelete(cf.id)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-secondary py-16">
                    <p className="text-sm text-tertiary">
                        {searchQuery ? "Aucun résultat" : "Aucune charge fixe configurée"}
                    </p>
                    {!searchQuery && (
                        <Button size="sm" color="link-color" onClick={() => setIsModalOpen(true)}>
                            Ajouter une charge fixe
                        </Button>
                    )}
                </div>
            ))}

            {/* ============================================ */}
            {/* FOOTER : TOTAUX */}
            {/* ============================================ */}
            {filteredChargesFixes.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary p-4 ring-1 ring-secondary ring-inset">
                    <div className="flex flex-wrap gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-tertiary">Total mensuel</span>
                            <span className="text-lg font-bold text-primary">{formatCurrency(totaux.totalMensuel)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-tertiary">Total annuel</span>
                            <span className="text-lg font-bold text-primary">{formatCurrency(totaux.totalAnnuel)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-tertiary">Charges actives</span>
                            <span className="text-lg font-bold text-primary">{totaux.nombreActifs}</span>
                        </div>
                    </div>

                    {/* Mini donut répartition */}
                    {repartitionCategories.length > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={repartitionCategories}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={18}
                                            outerRadius={30}
                                            paddingAngle={2}
                                        >
                                            {repartitionCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {repartitionCategories.slice(0, 3).map((cat) => (
                                    <div key={cat.name} className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs text-tertiary">{cat.name}</span>
                                    </div>
                                ))}
                                {repartitionCategories.length > 3 && (
                                    <span className="text-xs text-quaternary">+{repartitionCategories.length - 3} autres</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================ */}
            {/* MODALE NOUVELLE CHARGE FIXE */}
            {/* ============================================ */}
            <ModalOverlay isOpen={isModalOpen} onOpenChange={setIsModalOpen} isDismissable>
                <Modal className="max-w-lg">
                    <Dialog className="flex-col">
                        {({ close }) => (
                            <div className="flex w-full flex-col gap-6 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-lg font-semibold text-primary">Nouvelle charge fixe</h2>
                                        <p className="text-sm text-tertiary">Ajoutez un prélèvement récurrent</p>
                                    </div>
                                    <ButtonUtility size="sm" color="tertiary" icon={X} onClick={close} />
                                </div>

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
                                            label="Fréquence"
                                            selectedKey={newChargeFix.frequence}
                                            onSelectionChange={(v) => setNewChargeFix({ ...newChargeFix, frequence: v as string })}
                                            items={FREQUENCES}
                                            isRequired
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>

                                        <Input
                                            label="Jour de prélèvement"
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
                                                label="Catégorie"
                                                selectedKey={newChargeFix.categorieId}
                                                onSelectionChange={(v) => setNewChargeFix({ ...newChargeFix, categorieId: v as string })}
                                                items={categories.map((c) => ({ id: c.id, label: c.nom }))}
                                            >
                                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                            </Select>
                                        ) : (
                                            <Select
                                                label="Catégorie"
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
                                        {isSaving ? "Création..." : "Créer"}
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

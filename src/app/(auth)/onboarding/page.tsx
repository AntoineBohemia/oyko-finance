"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Bank,
    Calendar,
    Check,
    CreditCard01,
    Home02,
    Lightbulb02,
    Minus,
    MusicNote01,
    Phone02,
    PiggyBank01,
    Plus,
    Rocket01,
    Trash01,
    Tv03,
    Wallet03,
    Zap,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPES
// ============================================

interface ChargeFix {
    id: string;
    nom: string;
    montant: number;
    jourPrelevement: number;
    categorie: string;
    icon: React.ElementType;
}

interface Enveloppe {
    id: string;
    nom: string;
    budget: number;
    icon: string;
    color: string;
}

interface Compte {
    id: string;
    nom: string;
    banque: string;
    solde: number;
    type: "courant" | "epargne" | "cash";
}

// ============================================
// DONNÉES INITIALES
// ============================================

const CHARGES_SUGGESTIONS = [
    { nom: "Loyer / Crédit immobilier", icon: Home02, categorie: "Logement" },
    { nom: "Abonnement téléphone", icon: Phone02, categorie: "Téléphone" },
    { nom: "Abonnement internet", icon: Zap, categorie: "Internet" },
    { nom: "Électricité / Gaz", icon: Zap, categorie: "Énergie" },
    { nom: "Assurance habitation", icon: Home02, categorie: "Assurance" },
    { nom: "Netflix", icon: Tv03, categorie: "Streaming" },
    { nom: "Spotify", icon: MusicNote01, categorie: "Musique" },
    { nom: "Salle de sport", icon: Zap, categorie: "Sport" },
    { nom: "Transport", icon: CreditCard01, categorie: "Transport" },
];

const ENVELOPPES_DEFAULT: Enveloppe[] = [
    { id: "env-1", nom: "Alimentation", budget: 400, icon: "🍔", color: "text-orange-500" },
    { id: "env-2", nom: "Transport", budget: 100, icon: "🚇", color: "text-blue-500" },
    { id: "env-3", nom: "Loisirs", budget: 150, icon: "🎮", color: "text-purple-500" },
    { id: "env-4", nom: "Vêtements", budget: 100, icon: "👕", color: "text-pink-500" },
    { id: "env-5", nom: "Imprévus", budget: 100, icon: "🚨", color: "text-red-500" },
];

// Catégorie obligatoire qui ne peut pas être supprimée
const MANDATORY_CATEGORY = "Imprévus";

const STEPS = [
    { id: 1, title: "Revenus", icon: "💰" },
    { id: 2, title: "Charges fixes", icon: "🏠" },
    { id: 3, title: "Budget", icon: "📊" },
    { id: 4, title: "Épargne", icon: "🎯" },
    { id: 5, title: "Mode", icon: "📅" },
    { id: 6, title: "Comptes", icon: "🏦" },
];

// ============================================
// HELPERS
// ============================================

const formatCurrency = (amount: number): string => amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const generateId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // États des données
    const [revenus, setRevenus] = useState("");
    const [chargesFixes, setChargesFixes] = useState<ChargeFix[]>([]);
    const [objectifEpargne, setObjectifEpargne] = useState("");
    const [enveloppes, setEnveloppes] = useState<Enveloppe[]>(ENVELOPPES_DEFAULT);
    const [modeGestion, setModeGestion] = useState<"semaine" | "mois">("semaine");
    const [comptes, setComptes] = useState<Compte[]>([]);

    // États formulaires temporaires
    const [newCharge, setNewCharge] = useState({ nom: "", montant: "", jourPrelevement: "1", categorie: "" });
    const [newCompte, setNewCompte] = useState({ nom: "", banque: "", solde: "", type: "" as "courant" | "epargne" | "cash" | "" });
    const [newEnveloppe, setNewEnveloppe] = useState({ nom: "", budget: "", icon: "📌" });

    // Calculs
    const revenusNum = parseFloat(revenus) || 0;
    const totalChargesFixes = chargesFixes.reduce((acc, c) => acc + c.montant, 0);
    const epargneNum = parseFloat(objectifEpargne) || 0;
    const totalEnveloppes = enveloppes.reduce((acc, e) => acc + e.budget, 0);
    const resteAPourVivre = revenusNum - totalChargesFixes - epargneNum;
    const budgetNonAttribue = resteAPourVivre - totalEnveloppes;
    const totalComptes = comptes.reduce((acc, c) => acc + c.solde, 0);
    const budgetHebdo = resteAPourVivre / 4.33;

    // Navigation
    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 1:
                return revenusNum > 0;
            case 2:
                return true; // Charges fixes optionnelles
            case 3:
                return true; // Épargne optionnelle
            case 4:
                return enveloppes.length > 0;
            case 5:
                return true;
            case 6:
                return true; // Comptes optionnels
            default:
                return true;
        }
    }, [currentStep, revenusNum, enveloppes]);

    const handleNext = () => {
        if (currentStep < 7) {
            // Quand on passe à l'étape 4 (Épargne), initialiser avec le restant après budget
            if (currentStep === 3) {
                const restant = revenusNum - totalChargesFixes - totalEnveloppes;
                setObjectifEpargne(Math.max(0, restant).toString());
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Récupérer l'utilisateur connecté
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("Vous devez être connecté pour continuer");
                setIsLoading(false);
                return;
            }

            // 1. Mettre à jour le profil utilisateur
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    revenus_mensuels: revenusNum,
                    objectif_epargne: epargneNum,
                    mode_gestion: modeGestion,
                })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // 2. Créer les catégories par défaut via la fonction SQL
            const { error: categoriesError } = await supabase.rpc("create_default_categories", {
                p_user_id: user.id,
            });

            // Ignorer l'erreur si les catégories existent déjà
            if (categoriesError && !categoriesError.message.includes("duplicate")) {
                console.warn("Categories warning:", categoriesError);
            }

            // 3. Créer les comptes bancaires
            if (comptes.length > 0) {
                const comptesData = comptes.map((c, index) => ({
                    user_id: user.id,
                    nom: c.nom,
                    banque: c.banque,
                    type: c.type,
                    solde: c.solde,
                    ordre: index,
                }));

                const { error: comptesError } = await supabase
                    .from("comptes")
                    .insert(comptesData);

                if (comptesError) throw comptesError;
            }

            // 4. Créer les charges fixes
            if (chargesFixes.length > 0) {
                const chargesData = chargesFixes.map((c) => ({
                    user_id: user.id,
                    nom: c.nom,
                    montant: c.montant,
                    jour_prelevement: c.jourPrelevement,
                }));

                const { error: chargesError } = await supabase
                    .from("charges_fixes")
                    .insert(chargesData);

                if (chargesError) throw chargesError;
            }

            // 5. Mettre à jour les budgets des catégories (enveloppes)
            for (const env of enveloppes) {
                await supabase
                    .from("categories")
                    .update({ budget_mensuel: env.budget })
                    .eq("user_id", user.id)
                    .eq("nom", env.nom)
                    .eq("type", "depense");
            }

            // Rediriger vers le dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            console.error("Onboarding error:", err);
            setError("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    // Handlers charges fixes
    const handleAddCharge = () => {
        if (!newCharge.nom || !newCharge.montant) return;
        const charge: ChargeFix = {
            id: generateId(),
            nom: newCharge.nom,
            montant: parseFloat(newCharge.montant),
            jourPrelevement: parseInt(newCharge.jourPrelevement),
            categorie: newCharge.categorie || "Autre",
            icon: CHARGES_SUGGESTIONS.find((s) => s.nom === newCharge.nom)?.icon || CreditCard01,
        };
        setChargesFixes([...chargesFixes, charge]);
        setNewCharge({ nom: "", montant: "", jourPrelevement: "1", categorie: "" });
    };

    const handleAddSuggestion = (suggestion: (typeof CHARGES_SUGGESTIONS)[0]) => {
        setNewCharge({
            nom: suggestion.nom,
            montant: "",
            jourPrelevement: "1",
            categorie: suggestion.categorie,
        });
    };

    const handleRemoveCharge = (id: string) => {
        setChargesFixes(chargesFixes.filter((c) => c.id !== id));
    };

    // Handlers enveloppes
    const handleUpdateEnveloppe = (id: string, budget: number) => {
        setEnveloppes(enveloppes.map((e) => (e.id === id ? { ...e, budget } : e)));
    };

    const handleAddEnveloppe = () => {
        if (!newEnveloppe.nom || !newEnveloppe.budget) return;
        const enveloppe: Enveloppe = {
            id: generateId(),
            nom: newEnveloppe.nom,
            budget: parseFloat(newEnveloppe.budget),
            icon: newEnveloppe.icon,
            color: "text-gray-500",
        };
        setEnveloppes([...enveloppes, enveloppe]);
        setNewEnveloppe({ nom: "", budget: "", icon: "📌" });
    };

    const handleRemoveEnveloppe = (id: string) => {
        setEnveloppes(enveloppes.filter((e) => e.id !== id));
    };

    // Handlers comptes
    const handleAddCompte = () => {
        if (!newCompte.nom || !newCompte.solde || !newCompte.type) return;
        const compte: Compte = {
            id: generateId(),
            nom: newCompte.nom,
            banque: newCompte.banque || "Non spécifié",
            solde: parseFloat(newCompte.solde),
            type: newCompte.type,
        };
        setComptes([...comptes, compte]);
        setNewCompte({ nom: "", banque: "", solde: "", type: "" });
    };

    const handleRemoveCompte = (id: string) => {
        setComptes(comptes.filter((c) => c.id !== id));
    };

    const progressPercent = ((currentStep - 1) / 6) * 100;

    return (
        <div className="flex min-h-screen flex-col bg-secondary_alt">
            {/* Header avec progress */}
            <header className="sticky top-0 z-10 border-b border-secondary bg-primary_alt/95 backdrop-blur">
                <div className="mx-auto max-w-2xl px-4 py-4 lg:px-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                                    <Wallet03 className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-semibold text-primary">Budget App</span>
                            </div>
                            {currentStep <= 6 && (
                                <span className="text-sm text-tertiary">
                                    Étape {currentStep}/6
                                </span>
                            )}
                        </div>
                        {currentStep <= 6 && (
                            <div className="flex flex-col gap-2">
                                <ProgressBar min={0} max={100} value={progressPercent} />
                                <div className="flex justify-between">
                                    {STEPS.map((step) => (
                                        <div
                                            key={step.id}
                                            className={cx(
                                                "flex items-center gap-1 text-xs transition-colors",
                                                currentStep >= step.id ? "text-brand-600" : "text-tertiary",
                                            )}
                                        >
                                            <span>{step.icon}</span>
                                            <span className="hidden sm:inline">{step.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="flex flex-1 flex-col">
                <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 lg:px-8">
                    {/* ÉTAPE 1: REVENUS */}
                    {currentStep === 1 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <span className="text-4xl">💰</span>
                                <h1 className="text-2xl font-semibold text-primary">Vos revenus</h1>
                                <p className="text-tertiary">Quel est votre revenu net mensuel ?</p>
                            </div>

                            <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-primary">Revenus mensuels nets</label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            placeholder="Ex: 2150"
                                            value={revenus}
                                            onChange={(value) => setRevenus(value)}
                                            className="flex-1 text-center text-xl"
                                        />
                                        <span className="text-lg font-medium text-tertiary">€/mois</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-lg bg-brand-50 p-4">
                                    <Lightbulb02 className="h-5 w-5 shrink-0 text-brand-600" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium text-brand-700">Conseil</p>
                                        <p className="text-sm text-brand-600">
                                            Incluez tous vos revenus réguliers : salaire, aides, pensions...
                                        </p>
                                    </div>
                                </div>

                                {revenusNum > 0 && (
                                    <div className="border-t border-secondary pt-4">
                                        <p className="text-center text-lg">
                                            <span className="text-tertiary">Total mensuel : </span>
                                            <span className="font-semibold text-primary">{formatCurrency(revenusNum)}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 2: CHARGES FIXES */}
                    {currentStep === 2 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <span className="text-4xl">🏠</span>
                                <h1 className="text-2xl font-semibold text-primary">Charges fixes</h1>
                                <p className="text-tertiary">Ajoutez vos dépenses récurrentes obligatoires</p>
                            </div>

                            <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                {/* Suggestions rapides */}
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-medium text-tertiary">Suggestions rapides</p>
                                    <div className="flex flex-wrap gap-2">
                                        {CHARGES_SUGGESTIONS.filter((s) => !chargesFixes.some((c) => c.nom === s.nom)).map((suggestion) => (
                                            <button
                                                key={suggestion.nom}
                                                onClick={() => handleAddSuggestion(suggestion)}
                                                className="flex items-center gap-2 rounded-full border border-secondary bg-primary px-3 py-1.5 text-sm text-primary transition-colors hover:border-brand hover:bg-brand-50"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                {suggestion.nom}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Formulaire ajout */}
                                {newCharge.nom && (
                                    <div className="flex flex-col gap-4 rounded-lg border border-brand bg-brand-50 p-4">
                                        <p className="text-sm font-medium text-brand-700">{newCharge.nom}</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                type="number"
                                                placeholder="Montant"
                                                value={newCharge.montant}
                                                onChange={(value) => setNewCharge({ ...newCharge, montant: value })}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Jour (1-31)"
                                                value={newCharge.jourPrelevement}
                                                onChange={(value) => setNewCharge({ ...newCharge, jourPrelevement: value })}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" color="primary" onClick={handleAddCharge} isDisabled={!newCharge.montant}>
                                                Ajouter
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="secondary"
                                                onClick={() => setNewCharge({ nom: "", montant: "", jourPrelevement: "1", categorie: "" })}
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Liste des charges ajoutées */}
                                {chargesFixes.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-medium text-tertiary">Vos charges fixes</p>
                                        <div className="flex flex-col gap-2">
                                            {chargesFixes.map((charge) => {
                                                const Icon = charge.icon;
                                                return (
                                                    <div
                                                        key={charge.id}
                                                        className="flex items-center justify-between rounded-lg border border-secondary bg-primary p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="h-5 w-5 text-tertiary" />
                                                            <div>
                                                                <p className="text-sm font-medium text-primary">{charge.nom}</p>
                                                                <p className="text-xs text-tertiary">Jour {charge.jourPrelevement}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-primary">{formatCurrency(charge.montant)}</span>
                                                            <ButtonUtility
                                                                size="xs"
                                                                color="tertiary"
                                                                icon={Trash01}
                                                                tooltip="Supprimer"
                                                                onClick={() => handleRemoveCharge(charge.id)}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="border-t border-secondary pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-tertiary">Total charges fixes</span>
                                        <span className="text-xl font-semibold text-finance-loss">-{formatCurrency(totalChargesFixes)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 3: BUDGET / ENVELOPPES */}
                    {currentStep === 3 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <span className="text-4xl">📊</span>
                                <h1 className="text-2xl font-semibold text-primary">Budget mensuel</h1>
                                <p className="text-tertiary">
                                    Définissez vos catégories de dépenses. Moins vous budgétez, plus vous pourrez épargner !
                                </p>
                            </div>

                            {/* Info disponible */}
                            <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-brand-600">Disponible après charges</span>
                                    <span className="text-xl font-bold text-brand-700">{formatCurrency(revenusNum - totalChargesFixes)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-brand-600">Reste pour épargne</span>
                                    <span className={cx("text-xl font-bold", (revenusNum - totalChargesFixes - totalEnveloppes) >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                        {formatCurrency(revenusNum - totalChargesFixes - totalEnveloppes)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                {/* Liste des enveloppes */}
                                <div className="flex flex-col gap-4">
                                    {enveloppes.map((enveloppe) => {
                                        const disponible = revenusNum - totalChargesFixes;
                                        const percent = disponible > 0 ? (enveloppe.budget / disponible) * 100 : 0;
                                        const isMandatory = enveloppe.nom === MANDATORY_CATEGORY;
                                        return (
                                            <div key={enveloppe.id} className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{enveloppe.icon}</span>
                                                        <span className="text-sm font-medium text-primary">{enveloppe.nom}</span>
                                                        {isMandatory && (
                                                            <Badge size="sm" type="pill-color" color="error">
                                                                Obligatoire
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={enveloppe.budget.toString()}
                                                            onChange={(value) => handleUpdateEnveloppe(enveloppe.id, parseFloat(value) || 0)}
                                                            className="w-24 text-right"
                                                        />
                                                        <span className="text-sm text-tertiary">€</span>
                                                        {!isMandatory && (
                                                            <ButtonUtility
                                                                size="xs"
                                                                color="tertiary"
                                                                icon={Trash01}
                                                                tooltip="Supprimer"
                                                                onClick={() => handleRemoveEnveloppe(enveloppe.id)}
                                                            />
                                                        )}
                                                        {isMandatory && <div className="w-7" />}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className={cx("h-full rounded-full transition-all", isMandatory ? "bg-error-400" : "bg-brand-500")}
                                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-12 text-right text-xs text-tertiary">{percent.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Ajouter une catégorie */}
                                <div className="flex flex-col gap-3 border-t border-secondary pt-4">
                                    <p className="text-sm font-medium text-tertiary">Ajouter une catégorie</p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nom"
                                            value={newEnveloppe.nom}
                                            onChange={(value) => setNewEnveloppe({ ...newEnveloppe, nom: value })}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Budget"
                                            value={newEnveloppe.budget}
                                            onChange={(value) => setNewEnveloppe({ ...newEnveloppe, budget: value })}
                                            className="w-24"
                                        />
                                        <Button size="md" color="secondary" iconLeading={Plus} onClick={handleAddEnveloppe} isDisabled={!newEnveloppe.nom || !newEnveloppe.budget}>
                                            Ajouter
                                        </Button>
                                    </div>
                                </div>

                                {/* Récapitulatif */}
                                <div className="flex flex-col gap-2 border-t border-secondary pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-tertiary">Total budgété</span>
                                        <span className="font-medium text-primary">{formatCurrency(totalEnveloppes)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-tertiary">Disponible pour épargne</span>
                                        <span className={cx("font-bold", (revenusNum - totalChargesFixes - totalEnveloppes) >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                            {formatCurrency(revenusNum - totalChargesFixes - totalEnveloppes)}
                                        </span>
                                    </div>
                                </div>

                                {/* Conseil */}
                                <div className="flex items-start gap-3 rounded-lg bg-brand-50 p-4">
                                    <Lightbulb02 className="h-5 w-5 shrink-0 text-brand-600" />
                                    <p className="text-sm text-brand-700">
                                        Astuce : La catégorie <strong>Imprévus</strong> vous protège des dépenses inattendues. Ne la supprimez pas !
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 4: ÉPARGNE */}
                    {currentStep === 4 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <span className="text-4xl">🎯</span>
                                <h1 className="text-2xl font-semibold text-primary">Votre épargne</h1>
                                <p className="text-tertiary">Voici ce qu'il vous reste à épargner chaque mois</p>
                            </div>

                            <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                <div className="flex flex-col gap-4">
                                    <label className="text-sm font-medium text-primary">Épargne mensuelle</label>

                                    {/* Input avec boutons +/- */}
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setObjectifEpargne(Math.max(0, epargneNum - 50).toString())}
                                            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-secondary bg-primary text-tertiary transition-colors hover:border-error-300 hover:bg-error-50 hover:text-error-600 active:scale-95"
                                        >
                                            <Minus className="h-6 w-6" />
                                        </button>

                                        <div className="flex flex-col items-center">
                                            <div className="flex items-baseline gap-1">
                                                <input
                                                    type="number"
                                                    value={objectifEpargne}
                                                    onChange={(e) => setObjectifEpargne(e.target.value)}
                                                    className="w-32 border-none bg-transparent text-center text-4xl font-bold text-primary outline-none focus:ring-0"
                                                    min="0"
                                                    step="50"
                                                />
                                                <span className="text-2xl text-tertiary">€</span>
                                            </div>
                                            {/* Pourcentage du salaire */}
                                            {revenusNum > 0 && (
                                                <Badge
                                                    size="md"
                                                    type="pill-color"
                                                    color={epargneNum / revenusNum >= 0.2 ? "success" : epargneNum / revenusNum >= 0.1 ? "warning" : "gray"}
                                                >
                                                    {((epargneNum / revenusNum) * 100).toFixed(1)}% de vos revenus
                                                </Badge>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setObjectifEpargne((epargneNum + 50).toString())}
                                            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-secondary bg-primary text-tertiary transition-colors hover:border-success-300 hover:bg-success-50 hover:text-success-600 active:scale-95"
                                        >
                                            <Plus className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                {epargneNum >= revenusNum * 0.1 && (
                                    <div className="flex items-start gap-3 rounded-lg bg-success-50 p-4">
                                        <Check className="h-5 w-5 shrink-0 text-success-600" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-success-700">Excellent objectif !</p>
                                            <p className="text-sm text-success-600">
                                                Vous épargnez plus de 10% de vos revenus, c'est une très bonne habitude.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {epargneNum < revenusNum * 0.1 && epargneNum > 0 && (
                                    <div className="flex items-start gap-3 rounded-lg bg-warning-50 p-4">
                                        <Lightbulb02 className="h-5 w-5 shrink-0 text-warning-600" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-warning-700">Conseil</p>
                                            <p className="text-sm text-warning-600">
                                                Essayez d'atteindre 10% de vos revenus ({formatCurrency(revenusNum * 0.1)}) pour une épargne efficace.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Récapitulatif */}
                                <div className="flex flex-col gap-3 border-t border-secondary pt-4">
                                    <p className="text-sm font-medium text-tertiary">Récapitulatif mensuel</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tertiary">Revenus</span>
                                            <span className="font-medium text-primary">{formatCurrency(revenusNum)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tertiary">Charges fixes</span>
                                            <span className="font-medium text-finance-loss">-{formatCurrency(totalChargesFixes)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tertiary">Budget dépenses</span>
                                            <span className="font-medium text-finance-loss">-{formatCurrency(totalEnveloppes)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tertiary">Épargne</span>
                                            <span className="font-medium text-finance-gain">{formatCurrency(epargneNum)}</span>
                                        </div>
                                        <div className="my-1 border-t border-secondary" />
                                        <div className="flex justify-between">
                                            <span className="font-medium text-primary">Balance</span>
                                            <span className={cx("text-lg font-semibold", (revenusNum - totalChargesFixes - totalEnveloppes - epargneNum) >= 0 ? "text-finance-gain" : "text-finance-loss")}>
                                                {formatCurrency(revenusNum - totalChargesFixes - totalEnveloppes - epargneNum)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 5: MODE DE GESTION */}
                    {currentStep === 5 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <span className="text-4xl">📅</span>
                                <h1 className="text-2xl font-semibold text-primary">Mode de gestion</h1>
                                <p className="text-tertiary">Comment préférez-vous gérer votre budget ?</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Option Semaine */}
                                <button
                                    onClick={() => setModeGestion("semaine")}
                                    className={cx(
                                        "flex flex-col gap-3 rounded-xl p-6 text-left transition-all ring-1 ring-inset",
                                        modeGestion === "semaine"
                                            ? "bg-brand-50 ring-2 ring-brand"
                                            : "bg-primary_alt ring-secondary hover:ring-brand",
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📅</span>
                                            <span className="text-lg font-semibold text-primary">À LA SEMAINE</span>
                                        </div>
                                        {modeGestion === "semaine" && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-tertiary">
                                        Contrôle serré, idéal pour bien gérer son budget. Vous avez un montant hebdomadaire à ne pas dépasser.
                                    </p>
                                    <div className="rounded-lg bg-primary p-3">
                                        <p className="text-sm text-tertiary">Budget hebdomadaire</p>
                                        <p className="text-xl font-semibold text-brand-600">~{formatCurrency(budgetHebdo)}/semaine</p>
                                    </div>
                                </button>

                                {/* Option Mois */}
                                <button
                                    onClick={() => setModeGestion("mois")}
                                    className={cx(
                                        "flex flex-col gap-3 rounded-xl p-6 text-left transition-all ring-1 ring-inset",
                                        modeGestion === "mois"
                                            ? "bg-brand-50 ring-2 ring-brand"
                                            : "bg-primary_alt ring-secondary hover:ring-brand",
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📆</span>
                                            <span className="text-lg font-semibold text-primary">AU MOIS</span>
                                        </div>
                                        {modeGestion === "mois" && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-tertiary">
                                        Vue globale mensuelle. Plus de flexibilité dans la répartition de vos dépenses.
                                    </p>
                                    <div className="rounded-lg bg-primary p-3">
                                        <p className="text-sm text-tertiary">Budget mensuel</p>
                                        <p className="text-xl font-semibold text-brand-600">{formatCurrency(resteAPourVivre)}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 6: COMPTES */}
                    {currentStep === 6 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 text-center">
                                <span className="text-4xl">🏦</span>
                                <h1 className="text-2xl font-semibold text-primary">Vos comptes</h1>
                                <p className="text-tertiary">Ajoutez vos comptes bancaires pour suivre vos soldes</p>
                            </div>

                            <div className="flex flex-col gap-6 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                {/* Formulaire ajout compte */}
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm font-medium text-tertiary">Nouveau compte</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Input
                                            placeholder="Nom du compte"
                                            value={newCompte.nom}
                                            onChange={(value) => setNewCompte({ ...newCompte, nom: value })}
                                        />
                                        <Input
                                            placeholder="Banque (optionnel)"
                                            value={newCompte.banque}
                                            onChange={(value) => setNewCompte({ ...newCompte, banque: value })}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Solde actuel"
                                            value={newCompte.solde}
                                            onChange={(value) => setNewCompte({ ...newCompte, solde: value })}
                                        />
                                        <Select
                                            placeholder="Type de compte"
                                            selectedKey={newCompte.type}
                                            onSelectionChange={(v) => setNewCompte({ ...newCompte, type: v as "courant" | "epargne" | "cash" })}
                                            items={[
                                                { id: "courant", label: "Compte courant" },
                                                { id: "epargne", label: "Compte épargne" },
                                                { id: "cash", label: "Cash / Espèces" },
                                            ]}
                                        >
                                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                        </Select>
                                    </div>
                                    <Button
                                        size="md"
                                        color="secondary"
                                        iconLeading={Plus}
                                        onClick={handleAddCompte}
                                        isDisabled={!newCompte.nom || !newCompte.solde || !newCompte.type}
                                        className="self-start"
                                    >
                                        Ajouter le compte
                                    </Button>
                                </div>

                                {/* Liste des comptes */}
                                {comptes.length > 0 && (
                                    <div className="flex flex-col gap-3 border-t border-secondary pt-4">
                                        <p className="text-sm font-medium text-tertiary">Vos comptes</p>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {comptes.map((compte) => (
                                                <div
                                                    key={compte.id}
                                                    className="flex items-center justify-between rounded-lg border border-secondary bg-primary p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                            {compte.type === "courant" && <Bank className="h-5 w-5 text-brand-600" />}
                                                            {compte.type === "epargne" && <PiggyBank01 className="h-5 w-5 text-success-600" />}
                                                            {compte.type === "cash" && <Wallet03 className="h-5 w-5 text-warning-600" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-primary">{compte.nom}</p>
                                                            <p className="text-xs text-tertiary">{compte.banque}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-primary">{formatCurrency(compte.solde)}</span>
                                                        <ButtonUtility
                                                            size="xs"
                                                            color="tertiary"
                                                            icon={Trash01}
                                                            tooltip="Supprimer"
                                                            onClick={() => handleRemoveCompte(compte.id)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Total */}
                                {comptes.length > 0 && (
                                    <div className="border-t border-secondary pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-tertiary">Solde total</span>
                                            <span className="text-xl font-semibold text-finance-gain">{formatCurrency(totalComptes)}</span>
                                        </div>
                                    </div>
                                )}

                                {comptes.length === 0 && (
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4">
                                        <Lightbulb02 className="h-5 w-5 text-gray-500" />
                                        <p className="text-sm text-tertiary">
                                            Vous pourrez ajouter vos comptes plus tard dans les paramètres.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 7: RÉCAPITULATIF */}
                    {currentStep === 7 && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
                                    <Check className="h-8 w-8 text-success-600" />
                                </div>
                                <h1 className="text-2xl font-semibold text-primary">Tout est prêt !</h1>
                                <p className="text-tertiary">Voici le récapitulatif de votre configuration</p>
                            </div>

                            <div className="flex flex-col gap-4 rounded-xl bg-primary_alt p-6 shadow-xs ring-1 ring-secondary ring-inset">
                                <div className="flex items-center justify-between border-b border-secondary pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">💰</span>
                                        <span className="text-primary">Revenus mensuels</span>
                                    </div>
                                    <span className="text-lg font-semibold text-primary">{formatCurrency(revenusNum)}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-secondary pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🏠</span>
                                        <span className="text-primary">Charges fixes</span>
                                    </div>
                                    <span className="text-lg font-semibold text-finance-loss">-{formatCurrency(totalChargesFixes)}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-secondary pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🎯</span>
                                        <span className="text-primary">Épargne mensuelle</span>
                                    </div>
                                    <span className="text-lg font-semibold text-finance-gain">{formatCurrency(epargneNum)}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-secondary pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">💳</span>
                                        <span className="text-primary">Budget variable</span>
                                    </div>
                                    <span className="text-lg font-semibold text-brand-600">{formatCurrency(resteAPourVivre)}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-secondary pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📅</span>
                                        <span className="text-primary">Mode</span>
                                    </div>
                                    <Badge size="md" type="pill-color" color="brand">
                                        {modeGestion === "semaine" ? `Semaine (~${formatCurrency(budgetHebdo)}/sem)` : "Mois"}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between border-b border-secondary pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📊</span>
                                        <span className="text-primary">Enveloppes</span>
                                    </div>
                                    <span className="text-lg font-medium text-primary">{enveloppes.length} catégories</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🏦</span>
                                        <span className="text-primary">Comptes</span>
                                    </div>
                                    <span className="text-lg font-medium text-primary">
                                        {comptes.length > 0 ? `${comptes.length} (${formatCurrency(totalComptes)})` : "Aucun"}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 rounded-lg bg-error-50 p-4">
                                    <AlertCircle className="h-5 w-5 shrink-0 text-error-600" />
                                    <p className="text-sm text-error-700">{error}</p>
                                </div>
                            )}

                            <Button size="xl" color="primary" iconTrailing={isLoading ? undefined : Rocket01} onClick={handleFinish} isDisabled={isLoading} className="w-full">
                                {isLoading ? "Enregistrement en cours..." : "Commencer à gérer mon budget"}
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer navigation */}
            {currentStep <= 6 && (
                <footer className="sticky bottom-0 border-t border-secondary bg-primary_alt/95 backdrop-blur">
                    <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 lg:px-8">
                        <Button
                            size="lg"
                            color="secondary"
                            iconLeading={ArrowLeft}
                            onClick={handlePrevious}
                            isDisabled={currentStep === 1}
                        >
                            Précédent
                        </Button>

                        <Button
                            size="lg"
                            color="primary"
                            iconTrailing={ArrowRight}
                            onClick={handleNext}
                            isDisabled={!canProceed}
                        >
                            {currentStep === 6 ? "Terminer" : "Suivant"}
                        </Button>
                    </div>
                </footer>
            )}
        </div>
    );
}

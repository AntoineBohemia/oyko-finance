"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Bank, Calendar, ChevronLeft, ChevronRight, Plus, Upload01, X, AlertCircle, CheckCircle, Link01 } from "@untitledui/icons";
import * as XLSX from "xlsx";
import Link from "next/link";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import { formatCurrencySimple, formatDateRelative, getProgressColor, getProgressColorOnDark } from "@/utils/format";
import { createClient } from "@/lib/supabase/client";
import type { CategorieVariable, PatrimoineData } from "@/lib/data/dashboard";
import type { Profile, Compte } from "@/types/database.types";

type ViewMode = "semaine" | "mois";

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
    const currentYear = today.getFullYear();
    const currentWeekNum = getWeekNumber(today);
    const currentMonth = today.getMonth();

    // View mode toggle
    const [viewMode, setViewMode] = useState<ViewMode>("semaine");
    const [selectedWeek, setSelectedWeek] = useState(currentWeekNum);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isBankConnecting, setIsBankConnecting] = useState(false);

    // État de l'import
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importedTransactions, setImportedTransactions] = useState<Array<{
        date: string;
        description: string;
        montant: number;
        categorie: string | null;
        isAutoCategorie: boolean;
    }>>([]);
    const [importStep, setImportStep] = useState<"upload" | "categorized" | "uncategorized" | "success">("upload");
    const [importError, setImportError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [currentUncategorizedIndex, setCurrentUncategorizedIndex] = useState(0);

    // État création catégorie dans import
    const [isCreatingCategoryInImport, setIsCreatingCategoryInImport] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
    const [newCategoryBudget, setNewCategoryBudget] = useState("");
    const [localCategories, setLocalCategories] = useState(initialData.categories);

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

    const weekDates = getWeekDates(selectedYear, selectedWeek);
    const daysRemaining = getDaysRemainingInMonth(today);
    const monthName = getMonthName(weekDates.start); // Mois basé sur la semaine sélectionnée
    const displayYear = selectedYear;

    // Calcul des dépenses de la semaine sélectionnée
    const weekTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (t.type !== "variable") return false;
            const transDate = t.date;
            return transDate >= weekDates.start && transDate <= weekDates.end;
        });
    }, [transactions, weekDates.start, weekDates.end]);

    // Calcul du résumé du mois (calculé d'abord car utilisé par budgetData)
    const depensesMoisVariables = transactions
        .filter((t) => t.type === "variable")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const chargesFixesMois = transactions
        .filter((t) => t.type === "fixe")
        .reduce((acc, t) => acc + Math.abs(t.montant), 0);

    const revenusMois = transactions
        .filter((t) => t.type === "revenu")
        .reduce((acc, t) => acc + t.montant, 0);

    // Budget hebdomadaire
    const budgetHebdo = budgetVariableMensuel / 4;
    const depenseSemaine = weekTransactions.reduce((acc, t) => acc + Math.abs(t.montant), 0);
    const resteHebdo = budgetHebdo - depenseSemaine;
    const pourcentageHebdo = budgetHebdo > 0 ? (depenseSemaine / budgetHebdo) * 100 : 0;

    // Budget mensuel
    const budgetMensuel = budgetVariableMensuel;
    const depenseMois = depensesMoisVariables;
    const resteMois = budgetMensuel - depenseMois;
    const pourcentageMois = budgetMensuel > 0 ? (depenseMois / budgetMensuel) * 100 : 0;

    // Disponible mensuel (Revenus - Charges fixes - Épargne = Budget variable)
    const disponibleMensuel = revenusMois - chargesFixesMois;

    // Budget data selon le mode
    const budgetData = viewMode === "semaine"
        ? {
            total: budgetHebdo,
            spent: depenseSemaine,
            remaining: resteHebdo,
            percentage: pourcentageHebdo,
            label: "Budget Semaine"
        }
        : {
            total: budgetMensuel,
            spent: depenseMois,
            remaining: resteMois,
            percentage: pourcentageMois,
            label: "Budget Mois"
        };

    // Calcul par catégorie (enveloppe) - adapté au viewMode
    const enveloppes = useMemo(() => {
        // Calculer les dépenses mensuelles par catégorie
        const monthTransactions = transactions.filter((t) => t.type === "variable");

        return categories.map((cat) => {
            const budgetCat = viewMode === "semaine" ? cat.budgetMensuel / 4 : cat.budgetMensuel;
            const relevantTransactions = viewMode === "semaine" ? weekTransactions : monthTransactions;
            const depenseCat = relevantTransactions
                .filter((t) => t.categorieId === cat.id)
                .reduce((acc, t) => acc + Math.abs(t.montant), 0);
            const resteCat = budgetCat - depenseCat;
            const pourcentageCat = budgetCat > 0 ? (depenseCat / budgetCat) * 100 : 0;
            return {
                ...cat,
                budgetHebdo: budgetCat,
                depense: depenseCat,
                reste: resteCat,
                pourcentage: pourcentageCat,
            };
        });
    }, [categories, weekTransactions, transactions, viewMode]);

    // Dernières transactions (5 max)
    const lastTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);
    }, [transactions]);

    // Vérifier si l'utilisateur a une connexion bancaire
    const hasBankConnection = initialData.comptes.length > 0; // Simplifié pour l'instant

    // Prochains prélèvements (tri par date)
    const prochainsPrelevements = [...chargesFixes]
        .filter((c) => c.dateProchain >= today)
        .sort((a, b) => a.dateProchain.getTime() - b.dateProchain.getTime())
        .slice(0, 4);

    // Navigation semaine (avec changement d'année)
    const goToPreviousWeek = () => {
        if (selectedWeek <= 1) {
            setSelectedYear((y) => y - 1);
            setSelectedWeek(52);
        } else {
            setSelectedWeek((w) => w - 1);
        }
    };
    const goToNextWeek = () => {
        if (selectedWeek >= 52) {
            setSelectedYear((y) => y + 1);
            setSelectedWeek(1);
        } else {
            setSelectedWeek((w) => w + 1);
        }
    };

    // Limites de navigation (pas plus d'un an dans le passé, pas dans le futur)
    const canGoPrevious = selectedYear > currentYear - 1 || (selectedYear === currentYear - 1 && selectedWeek > currentWeekNum);
    const canGoNext = selectedYear < currentYear || (selectedYear === currentYear && selectedWeek < currentWeekNum);

    // Handler connexion bancaire
    const handleConnectBank = async () => {
        setIsBankConnecting(true);
        try {
            const { data: { session } } = await createClient().auth.getSession();
            if (!session) {
                setIsBankConnecting(false);
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/bridge-connect`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Erreur de connexion");
            }

            const { connect_url } = await response.json();
            window.location.href = connect_url;
        } catch (error) {
            console.error("Bank connection error:", error);
            setIsBankConnecting(false);
        }
    };

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

    // ============================================
    // IMPORT CSV/XLSX
    // ============================================

    const resetImportModal = useCallback(() => {
        setImportedTransactions([]);
        setImportStep("upload");
        setImportError(null);
        setIsCreatingCategoryInImport(false);
        setNewCategoryName("");
        setNewCategoryIcon("📦");
        setNewCategoryBudget("");
        setIsImporting(false);
        setCurrentUncategorizedIndex(0);
    }, []);

    const parseFile = useCallback(async (file: File) => {
        setImportError(null);

        try {
            const isCSV = file.name.toLowerCase().endsWith(".csv");
            let jsonData: Record<string, unknown>[] = [];

            if (isCSV) {
                // Pour les CSV français (Crédit Agricole, etc.), on parse manuellement
                // car ils utilisent ; comme séparateur et ont des champs multilignes
                const textDecoder = new TextDecoder("iso-8859-1"); // Encodage français
                const arrayBuffer = await file.arrayBuffer();
                const text = textDecoder.decode(arrayBuffer);
                const separator = text.includes(";") ? ";" : ",";

                // Parser CSV avec support des champs multilignes (guillemets)
                const parseCSVWithMultiline = (csvText: string, sep: string): string[][] => {
                    const rows: string[][] = [];
                    let currentRow: string[] = [];
                    let currentField = "";
                    let inQuotes = false;

                    for (let i = 0; i < csvText.length; i++) {
                        const char = csvText[i];
                        const nextChar = csvText[i + 1];

                        if (char === '"') {
                            if (inQuotes && nextChar === '"') {
                                // Guillemet échappé
                                currentField += '"';
                                i++;
                            } else {
                                // Début ou fin de champ entre guillemets
                                inQuotes = !inQuotes;
                            }
                        } else if (char === sep && !inQuotes) {
                            // Fin de champ
                            currentRow.push(currentField.trim());
                            currentField = "";
                        } else if ((char === "\n" || char === "\r") && !inQuotes) {
                            // Fin de ligne (seulement si pas dans des guillemets)
                            if (char === "\r" && nextChar === "\n") {
                                i++; // Sauter le \n après \r
                            }
                            if (currentField || currentRow.length > 0) {
                                currentRow.push(currentField.trim());
                                if (currentRow.some(f => f)) { // Ignorer les lignes vides
                                    rows.push(currentRow);
                                }
                                currentRow = [];
                                currentField = "";
                            }
                        } else {
                            currentField += char;
                        }
                    }

                    // Dernière ligne
                    if (currentField || currentRow.length > 0) {
                        currentRow.push(currentField.trim());
                        if (currentRow.some(f => f)) {
                            rows.push(currentRow);
                        }
                    }

                    return rows;
                };

                const allRows = parseCSVWithMultiline(text, separator);

                // Trouver la ligne d'en-tête
                let headerIndex = -1;
                let headers: string[] = [];

                for (let i = 0; i < Math.min(allRows.length, 20); i++) {
                    const rowLower = allRows[i].map(c => c.toLowerCase()).join(" ");
                    if (rowLower.includes("date") && (rowLower.includes("libellé") || rowLower.includes("libelle") || rowLower.includes("débit") || rowLower.includes("debit"))) {
                        headerIndex = i;
                        headers = allRows[i].map(h => h.replace(/"/g, "").trim());
                        break;
                    }
                }

                if (headerIndex === -1) {
                    // Fallback: essayer avec xlsx
                    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { raw: false });
                } else {
                    // Parser les lignes de données
                    for (let i = headerIndex + 1; i < allRows.length; i++) {
                        const values = allRows[i];
                        const firstVal = values[0] || "";

                        // Ignorer les lignes qui ne commencent pas par une date
                        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(firstVal)) continue;

                        // Créer l'objet avec les en-têtes
                        const row: Record<string, unknown> = {};
                        headers.forEach((h, idx) => {
                            if (values[idx] !== undefined) {
                                // Nettoyer les espaces multiples et retours à la ligne
                                row[h] = values[idx].replace(/\s+/g, " ").trim();
                            }
                        });

                        jsonData.push(row);
                    }
                }
            } else {
                // Pour XLSX, utiliser xlsx directement
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array", cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { raw: false });
            }

            if (jsonData.length === 0) {
                setImportError("Le fichier est vide ou le format n'est pas reconnu.");
                return;
            }

            // Détection automatique des colonnes
            const firstRow = jsonData[0];
            const keys = Object.keys(firstRow);

            // Chercher les colonnes pertinentes (flexible)
            const findColumn = (patterns: string[]) => {
                return keys.find(k =>
                    patterns.some(p => k.toLowerCase().includes(p.toLowerCase()))
                );
            };

            const dateCol = findColumn(["date"]);
            const descCol = findColumn(["libellé", "libelle", "description", "label", "intitulé"]);
            const debitCol = findColumn(["débit", "debit"]);
            const creditCol = findColumn(["crédit", "credit"]);
            const amountCol = findColumn(["montant", "amount"]);

            if (!dateCol) {
                setImportError(`Colonne "Date" non trouvée. Colonnes trouvées: ${keys.join(", ")}`);
                return;
            }

            const parsed = jsonData
                .map((row) => {
                    // Parser le montant (gérer Débit/Crédit séparés ou montant unique)
                    let montant = 0;

                    if (debitCol && row[debitCol]) {
                        const raw = String(row[debitCol])
                            .replace(/[^\d,.\-]/g, "")
                            .replace(",", ".");
                        montant = -Math.abs(parseFloat(raw) || 0); // Débit = négatif
                    } else if (creditCol && row[creditCol]) {
                        const raw = String(row[creditCol])
                            .replace(/[^\d,.\-]/g, "")
                            .replace(",", ".");
                        montant = Math.abs(parseFloat(raw) || 0); // Crédit = positif
                    } else if (amountCol && row[amountCol]) {
                        const raw = String(row[amountCol])
                            .replace(/[^\d,.\-]/g, "")
                            .replace(",", ".");
                        montant = parseFloat(raw) || 0;
                    }

                    // Parser la date
                    let dateStr = "";
                    if (dateCol && row[dateCol]) {
                        const rawDate = row[dateCol];
                        if (rawDate instanceof Date) {
                            dateStr = rawDate.toISOString().split("T")[0];
                        } else {
                            const dateValue = String(rawDate);
                            // Format DD/MM/YYYY
                            const frMatch = dateValue.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                            if (frMatch) {
                                dateStr = `${frMatch[3]}-${frMatch[2]}-${frMatch[1]}`;
                            } else {
                                const parsedDate = new Date(dateValue);
                                if (!isNaN(parsedDate.getTime())) {
                                    dateStr = parsedDate.toISOString().split("T")[0];
                                }
                            }
                        }
                    }

                    // Nettoyer la description
                    let description = "";
                    if (descCol && row[descCol]) {
                        description = String(row[descCol])
                            .replace(/\s+/g, " ")
                            .replace(/X\d{4}\s*/g, "") // Enlever les numéros de carte
                            .replace(/\d{2}\/\d{2}\s*$/g, "") // Enlever les dates à la fin
                            .trim();
                    }

                    return {
                        date: dateStr || new Date().toISOString().split("T")[0],
                        description,
                        montant,
                        categorie: null as string | null,
                        isAutoCategorie: false,
                    };
                })
                .filter((t) => t.montant !== 0 && t.date); // Filtrer les transactions sans montant

            if (parsed.length === 0) {
                setImportError("Aucune transaction valide trouvée dans le fichier.");
                return;
            }

            // Auto-catégorisation par mots-clés
            const categoryPatterns: Record<string, string[]> = {
                // Patterns pour chaque type de catégorie (nom de catégorie en minuscule)
                "courses": ["carrefour", "lidl", "auchan", "leclerc", "intermarche", "monoprix", "franprix", "picard", "casino", "super u", "market", "primeur", "boucherie", "boulang"],
                "alimentation": ["carrefour", "lidl", "auchan", "leclerc", "intermarche", "monoprix", "franprix", "picard", "casino", "super u", "market", "primeur", "boucherie", "boulang"],
                "restaurant": ["uber eats", "deliveroo", "just eat", "mcdonalds", "mcdonald", "burger king", "kfc", "starbucks", "restaurant", "brasserie", "cafe", "café", "pizza", "sushi", "kebab"],
                "restauration": ["uber eats", "deliveroo", "just eat", "mcdonalds", "mcdonald", "burger king", "kfc", "starbucks", "restaurant", "brasserie", "cafe", "café", "pizza", "sushi", "kebab"],
                "transport": ["sncf", "ratp", "uber", "bolt", "blablacar", "parking", "essence", "total", "shell", "bp ", "esso", "station", "peage", "autoroute", "taxi", "vtc"],
                "loisirs": ["spotify", "netflix", "amazon prime", "disney", "cinema", "cinéma", "concert", "theatre", "théâtre", "musee", "musée", "parc", "bowling", "escape"],
                "shopping": ["amazon", "fnac", "darty", "zalando", "zara", "h&m", "uniqlo", "nike", "adidas", "decathlon", "asos", "shein", "vinted", "leboncoin"],
                "santé": ["pharmacie", "doctolib", "medecin", "médecin", "docteur", "hopital", "hôpital", "clinique", "dentiste", "ophtalmo", "kine", "kiné"],
                "sante": ["pharmacie", "doctolib", "medecin", "médecin", "docteur", "hopital", "hôpital", "clinique", "dentiste", "ophtalmo", "kine", "kiné"],
                "abonnement": ["spotify", "netflix", "apple.com", "amazon prime", "disney", "deezer", "canal", "orange", "sfr", "free", "bouygues", "sosh"],
                "abonnements": ["spotify", "netflix", "apple.com", "amazon prime", "disney", "deezer", "canal", "orange", "sfr", "free", "bouygues", "sosh"],
            };

            // Trouver la catégorie correspondante pour chaque transaction
            const parsedWithCategories = parsed.map((t) => {
                const descLower = t.description.toLowerCase();

                // Chercher un match dans les patterns
                for (const cat of categories) {
                    const catNameLower = cat.nom.toLowerCase();
                    const patterns = categoryPatterns[catNameLower];

                    if (patterns) {
                        const matched = patterns.some(pattern => descLower.includes(pattern));
                        if (matched) {
                            return { ...t, categorie: cat.id, isAutoCategorie: true };
                        }
                    }
                }

                return t;
            });

            setImportedTransactions(parsedWithCategories);
            // Si des transactions sont auto-catégorisées, aller à l'étape de validation
            // Sinon, aller directement à l'étape des non-catégorisées
            const hasCategorized = parsedWithCategories.some(t => t.isAutoCategorie);
            setImportStep(hasCategorized ? "categorized" : "uncategorized");
        } catch (err) {
            console.error("Erreur parsing:", err);
            setImportError("Erreur lors de la lecture du fichier. Vérifiez le format.");
        }
    }, [categories]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
    }, [parseFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) parseFile(file);
    }, [parseFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    // Emojis disponibles pour nouvelle catégorie
    const availableIcons = ["🛒", "🍔", "🚗", "🎬", "🛍️", "💊", "📱", "📚", "✈️", "🏠", "💡", "🎁", "📦"];

    const handleCreateCategoryInImport = async () => {
        if (!profile || !newCategoryName.trim()) return;

        const supabase = createClient();

        const { data, error } = await supabase
            .from("categories")
            .insert({
                user_id: profile.id,
                nom: newCategoryName.trim(),
                icone: newCategoryIcon,
                budget_mensuel: parseFloat(newCategoryBudget) || 0,
                type: "depense",
            })
            .select()
            .single();

        if (error) {
            console.error("Erreur création catégorie:", error);
            return;
        }

        // Ajouter la nouvelle catégorie aux listes locales
        const newCat: CategorieVariable = {
            id: data.id,
            nom: data.nom,
            icone: data.icone ?? "📦",
            couleur: data.couleur ?? "#7F56D9",
            budgetMensuel: data.budget_mensuel ?? 0,
        };

        setLocalCategories((prev) => [...prev, newCat]);

        // Appliquer la nouvelle catégorie à la transaction actuelle (non catégorisée)
        const uncategorized = importedTransactions.filter(t => !t.categorie);
        const currentTransaction = uncategorized[currentUncategorizedIndex];
        if (currentTransaction) {
            const transactionIndex = importedTransactions.findIndex(t => t === currentTransaction);
            if (transactionIndex !== -1) {
                setImportedTransactions((prev) => prev.map((t, i) =>
                    i === transactionIndex ? { ...t, categorie: data.id } : t
                ));
            }
        }

        // Reset le formulaire
        setIsCreatingCategoryInImport(false);
        setNewCategoryName("");
        setNewCategoryIcon("📦");
        setNewCategoryBudget("");
    };

    const handleImportConfirm = async () => {
        if (!profile || importedTransactions.length === 0) return;

        setIsImporting(true);
        const supabase = createClient();
        const defaultCompteId = comptes[0]?.id || null;

        // Insérer toutes les transactions
        const transactionsToInsert = importedTransactions.map((t) => ({
            user_id: profile.id,
            compte_id: defaultCompteId,
            categorie_id: t.categorie,
            type: "depense" as const,
            montant: t.montant < 0 ? t.montant : -Math.abs(t.montant),
            description: t.description || null,
            date_transaction: new Date(t.date).toISOString(),
        }));

        const { error } = await supabase.from("transactions").insert(transactionsToInsert);

        if (error) {
            setImportError("Erreur lors de l'import: " + error.message);
            setIsImporting(false);
            return;
        }

        setImportStep("success");
        setIsImporting(false);

        // Recharger après 1.5s
        setTimeout(() => {
            setIsImportModalOpen(false);
            resetImportModal();
            window.location.reload();
        }, 1500);
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
                                {viewMode === "semaine"
                                    ? `Semaine ${selectedWeek} · ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${displayYear}`
                                    : `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${displayYear}`
                                }
                            </h1>
                            <p className="text-sm text-tertiary">
                                {daysRemaining} jours restants ce mois
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Toggle Hebdo/Mois */}
                            <div className="flex rounded-lg border border-secondary bg-primary">
                                <button
                                    onClick={() => setViewMode("semaine")}
                                    className={cx(
                                        "px-3 py-1.5 text-sm font-medium rounded-l-md transition-all",
                                        viewMode === "semaine"
                                            ? "bg-brand-600 text-white"
                                            : "text-tertiary hover:text-primary hover:bg-secondary"
                                    )}
                                >
                                    Semaine
                                </button>
                                <button
                                    onClick={() => setViewMode("mois")}
                                    className={cx(
                                        "px-3 py-1.5 text-sm font-medium rounded-r-md transition-all",
                                        viewMode === "mois"
                                            ? "bg-brand-600 text-white"
                                            : "text-tertiary hover:text-primary hover:bg-secondary"
                                    )}
                                >
                                    Mois
                                </button>
                            </div>

                            {/* Navigation semaine (visible uniquement en mode semaine) */}
                            {viewMode === "semaine" && (
                                <div className="flex items-center gap-1">
                                    <ButtonUtility
                                        size="sm"
                                        color="secondary"
                                        icon={ChevronLeft}
                                        onClick={goToPreviousWeek}
                                        isDisabled={!canGoPrevious}
                                        tooltip={selectedWeek <= 1 ? `S52 ${selectedYear - 1}` : `Sem. ${selectedWeek - 1}`}
                                    />
                                    <ButtonUtility
                                        size="sm"
                                        color="secondary"
                                        icon={ChevronRight}
                                        onClick={goToNextWeek}
                                        isDisabled={!canGoNext}
                                        tooltip={selectedWeek >= 52 ? `S1 ${selectedYear + 1}` : `Sem. ${selectedWeek + 1}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 2: CARD BUDGET (Hero) */}
                {/* ============================================ */}
                <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 shadow-lg lg:p-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-lg font-semibold text-white/90">{budgetData.label}</h2>
                            <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-display-md font-bold text-white lg:text-display-lg">{formatCurrencySimple(budgetData.spent)}</span>
                                <span className="text-lg text-white/70">/ {formatCurrencySimple(budgetData.total)}</span>
                                <span className="text-sm text-white/60">({budgetData.percentage.toFixed(0)}%)</span>
                            </div>
                            <p className="text-md text-white/80">
                                Reste : <span className="font-semibold">{formatCurrencySimple(Math.max(0, budgetData.remaining))}</span>
                            </p>
                        </div>

                        <ProgressBar
                            value={Math.min(budgetData.percentage, 100)}
                            className="h-3 bg-white/20"
                            progressClassName={getProgressColorOnDark(budgetData.percentage)}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Bouton principal: Connexion banque (si pas connecté) */}
                            {!hasBankConnection && (
                                <Button
                                    size="lg"
                                    color="secondary"
                                    iconLeading={isBankConnecting ? undefined : Link01}
                                    onClick={handleConnectBank}
                                    isDisabled={isBankConnecting}
                                    className="w-full justify-center bg-white text-brand-700 hover:bg-white/90 sm:w-auto"
                                >
                                    {isBankConnecting ? "Connexion..." : "Connecter ma banque"}
                                </Button>
                            )}

                            {/* Bouton Dépense cash */}
                            <DialogTrigger isOpen={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                                <Button
                                    size="lg"
                                    color="secondary"
                                    iconLeading={Plus}
                                    className={cx(
                                        "w-full justify-center sm:w-auto",
                                        hasBankConnection
                                            ? "bg-white text-brand-700 hover:bg-white/90"
                                            : "bg-white/20 text-white hover:bg-white/30"
                                    )}
                                >
                                    Dépense cash
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

                            {/* Bouton Import */}
                            <DialogTrigger isOpen={isImportModalOpen} onOpenChange={(open) => {
                                setIsImportModalOpen(open);
                                if (!open) resetImportModal();
                            }}>
                                <Button
                                    size="lg"
                                    color="secondary"
                                    iconLeading={Upload01}
                                    className="w-full justify-center bg-white/20 text-white hover:bg-white/30 sm:ml-auto sm:w-auto"
                                >
                                    Importer
                                </Button>

                                <ModalOverlay isDismissable>
                                    <Modal className="max-w-lg">
                                        <Dialog>
                                            <div className="w-full rounded-xl bg-primary shadow-xl">
                                                {/* Modal Header */}
                                                <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
                                                    <h3 className="text-lg font-semibold text-primary">Importer des transactions</h3>
                                                    <ButtonUtility
                                                        size="sm"
                                                        color="tertiary"
                                                        icon={X}
                                                        onClick={() => {
                                                            setIsImportModalOpen(false);
                                                            resetImportModal();
                                                        }}
                                                    />
                                                </div>

                                                {/* Modal Body */}
                                                <div className="px-6 py-5">
                                                    {importStep === "upload" && (
                                                        <div className="flex flex-col gap-4">
                                                            {/* Zone de drop */}
                                                            <div
                                                                onDrop={handleDrop}
                                                                onDragOver={handleDragOver}
                                                                onDragLeave={handleDragLeave}
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className={cx(
                                                                    "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
                                                                    isDragging
                                                                        ? "border-brand-500 bg-brand-50"
                                                                        : "border-secondary hover:border-brand-300 hover:bg-secondary"
                                                                )}
                                                            >
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                                                                    <Upload01 className="h-6 w-6 text-brand-600" />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-sm font-medium text-primary">
                                                                        Glissez votre fichier ici
                                                                    </p>
                                                                    <p className="text-xs text-tertiary">ou cliquez pour parcourir</p>
                                                                </div>
                                                                <p className="text-xs text-tertiary">CSV, XLSX, XLS</p>
                                                            </div>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept=".csv,.xlsx,.xls"
                                                                onChange={handleFileSelect}
                                                                className="hidden"
                                                            />

                                                            {/* Erreur */}
                                                            {importError && (
                                                                <div className="flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
                                                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                                    <p>{importError}</p>
                                                                </div>
                                                            )}

                                                            {/* Info */}
                                                            <div className="rounded-lg bg-secondary p-3">
                                                                <p className="text-xs text-tertiary">
                                                                    <span className="font-medium text-secondary">Format attendu :</span> colonnes date, description/libellé, montant.
                                                                    Les exports bancaires standards sont généralement compatibles.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ÉTAPE 1: Validation des transactions auto-catégorisées */}
                                                    {importStep === "categorized" && (
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">1</div>
                                                                <p className="text-sm font-semibold text-primary">Transactions auto-catégorisées</p>
                                                            </div>

                                                            <p className="text-xs text-tertiary">
                                                                {importedTransactions.filter(t => t.isAutoCategorie).length} transaction{importedTransactions.filter(t => t.isAutoCategorie).length > 1 ? "s" : ""} détectée{importedTransactions.filter(t => t.isAutoCategorie).length > 1 ? "s" : ""} automatiquement. Vérifiez les catégories avant de continuer.
                                                            </p>

                                                            {/* Tableau des transactions auto-catégorisées */}
                                                            <div className="max-h-64 overflow-auto rounded-lg border border-secondary">
                                                                <table className="w-full text-sm">
                                                                    <thead className="sticky top-0 bg-secondary">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-left font-medium text-tertiary">Date</th>
                                                                            <th className="px-3 py-2 text-left font-medium text-tertiary">Description</th>
                                                                            <th className="px-3 py-2 text-left font-medium text-tertiary">Catégorie</th>
                                                                            <th className="px-3 py-2 text-right font-medium text-tertiary">Montant</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-secondary">
                                                                        {importedTransactions.filter(t => t.isAutoCategorie).map((t, i) => {
                                                                            const cat = localCategories.find(c => c.id === t.categorie);
                                                                            return (
                                                                                <tr key={i} className="hover:bg-secondary/50">
                                                                                    <td className="px-3 py-2 text-xs text-tertiary whitespace-nowrap">{t.date}</td>
                                                                                    <td className="max-w-40 truncate px-3 py-2 text-xs text-primary" title={t.description}>{t.description}</td>
                                                                                    <td className="px-3 py-2">
                                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
                                                                                            <span>{cat?.icone}</span>
                                                                                            <span>{cat?.nom}</span>
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className={cx(
                                                                                        "px-3 py-2 text-right text-xs font-medium whitespace-nowrap",
                                                                                        t.montant < 0 ? "text-finance-loss" : "text-finance-gain"
                                                                                    )}>
                                                                                        {formatCurrencySimple(t.montant)}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Info sur les non-catégorisées */}
                                                            {importedTransactions.filter(t => !t.isAutoCategorie).length > 0 && (
                                                                <div className="rounded-lg bg-warning-50 p-3">
                                                                    <p className="text-xs text-warning-700">
                                                                        <span className="font-semibold">{importedTransactions.filter(t => !t.isAutoCategorie).length}</span> transaction{importedTransactions.filter(t => !t.isAutoCategorie).length > 1 ? "s" : ""} non catégorisée{importedTransactions.filter(t => !t.isAutoCategorie).length > 1 ? "s" : ""} à traiter ensuite.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* ÉTAPE 2: Gestion des transactions non catégorisées */}
                                                    {importStep === "uncategorized" && (() => {
                                                        const uncategorized = importedTransactions.filter(t => !t.categorie);
                                                        const currentTransaction = uncategorized[currentUncategorizedIndex];
                                                        const totalUncategorized = uncategorized.length;

                                                        if (totalUncategorized === 0) {
                                                            // Pas de transactions non catégorisées, afficher un résumé
                                                            return (
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 text-xs font-semibold text-success-700">✓</div>
                                                                        <p className="text-sm font-semibold text-primary">Toutes les transactions sont catégorisées</p>
                                                                    </div>
                                                                    <p className="text-xs text-tertiary">
                                                                        {importedTransactions.length} transaction{importedTransactions.length > 1 ? "s" : ""} prête{importedTransactions.length > 1 ? "s" : ""} à être importée{importedTransactions.length > 1 ? "s" : ""}.
                                                                    </p>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div className="flex flex-col gap-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">2</div>
                                                                        <p className="text-sm font-semibold text-primary">Catégoriser les transactions</p>
                                                                    </div>
                                                                    <span className="text-xs text-tertiary">
                                                                        {currentUncategorizedIndex + 1} / {totalUncategorized}
                                                                    </span>
                                                                </div>

                                                                {/* Transaction actuelle */}
                                                                {currentTransaction && (
                                                                    <div className="rounded-xl border border-secondary bg-secondary/30 p-4">
                                                                        <div className="mb-3 flex items-start justify-between gap-4">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-primary">{currentTransaction.description || "Sans description"}</p>
                                                                                <p className="text-xs text-tertiary">{currentTransaction.date}</p>
                                                                            </div>
                                                                            <p className={cx(
                                                                                "text-lg font-semibold whitespace-nowrap",
                                                                                currentTransaction.montant < 0 ? "text-finance-loss" : "text-finance-gain"
                                                                            )}>
                                                                                {formatCurrencySimple(currentTransaction.montant)}
                                                                            </p>
                                                                        </div>

                                                                        {/* Sélection catégorie */}
                                                                        <div className="flex flex-col gap-2">
                                                                            <p className="text-xs font-medium text-secondary">Choisir une catégorie :</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {localCategories.map((cat) => (
                                                                                    <button
                                                                                        key={cat.id}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            // Mettre à jour la catégorie de cette transaction
                                                                                            const uncatIndex = importedTransactions.findIndex(
                                                                                                t => t === currentTransaction
                                                                                            );
                                                                                            if (uncatIndex !== -1) {
                                                                                                setImportedTransactions(prev => prev.map((t, i) =>
                                                                                                    i === uncatIndex ? { ...t, categorie: cat.id } : t
                                                                                                ));
                                                                                            }
                                                                                            // Passer à la suivante ou terminer
                                                                                            if (currentUncategorizedIndex < totalUncategorized - 1) {
                                                                                                setCurrentUncategorizedIndex(i => i + 1);
                                                                                            }
                                                                                        }}
                                                                                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary ring-1 ring-secondary transition-all hover:ring-brand-300"
                                                                                    >
                                                                                        <span className="text-base">{cat.icone}</span>
                                                                                        <span>{cat.nom}</span>
                                                                                    </button>
                                                                                ))}
                                                                            </div>

                                                                            {/* Bouton nouvelle catégorie */}
                                                                            {!isCreatingCategoryInImport && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setIsCreatingCategoryInImport(true)}
                                                                                    className="mt-1 flex items-center gap-1.5 self-start rounded-lg border border-dashed border-tertiary px-3 py-2 text-xs font-medium text-tertiary transition-all hover:border-brand-500 hover:text-brand-600"
                                                                                >
                                                                                    <Plus className="h-3.5 w-3.5" />
                                                                                    <span>Créer une catégorie</span>
                                                                                </button>
                                                                            )}

                                                                            {/* Formulaire création catégorie */}
                                                                            {isCreatingCategoryInImport && (
                                                                                <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50/50 p-3">
                                                                                    <p className="mb-2 text-xs font-semibold text-primary">Nouvelle catégorie</p>
                                                                                    <div className="flex flex-col gap-3">
                                                                                        <Input
                                                                                            placeholder="Nom de la catégorie"
                                                                                            value={newCategoryName}
                                                                                            onChange={(v) => setNewCategoryName(v)}
                                                                                            size="sm"
                                                                                        />
                                                                                        <div className="flex flex-wrap gap-1.5">
                                                                                            {availableIcons.map((icon) => (
                                                                                                <button
                                                                                                    key={icon}
                                                                                                    type="button"
                                                                                                    onClick={() => setNewCategoryIcon(icon)}
                                                                                                    className={cx(
                                                                                                        "flex h-8 w-8 items-center justify-center rounded-md text-base transition-all",
                                                                                                        newCategoryIcon === icon
                                                                                                            ? "bg-brand-100 ring-2 ring-brand-500"
                                                                                                            : "bg-primary hover:bg-secondary"
                                                                                                    )}
                                                                                                >
                                                                                                    {icon}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                        <Input
                                                                                            placeholder="Budget mensuel (€)"
                                                                                            type="number"
                                                                                            value={newCategoryBudget}
                                                                                            onChange={(v) => setNewCategoryBudget(v)}
                                                                                            size="sm"
                                                                                        />
                                                                                        <div className="flex gap-2">
                                                                                            <Button
                                                                                                size="sm"
                                                                                                color="secondary"
                                                                                                onClick={() => {
                                                                                                    setIsCreatingCategoryInImport(false);
                                                                                                    setNewCategoryName("");
                                                                                                    setNewCategoryIcon("📦");
                                                                                                    setNewCategoryBudget("");
                                                                                                }}
                                                                                                className="flex-1"
                                                                                            >
                                                                                                Annuler
                                                                                            </Button>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                onClick={async () => {
                                                                                                    await handleCreateCategoryInImport();
                                                                                                    // Après création, passer à la suivante si applicable
                                                                                                    if (currentUncategorizedIndex < totalUncategorized - 1) {
                                                                                                        setCurrentUncategorizedIndex(i => i + 1);
                                                                                                    }
                                                                                                }}
                                                                                                isDisabled={!newCategoryName.trim()}
                                                                                                className="flex-1"
                                                                                            >
                                                                                                Créer et appliquer
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Navigation et actions */}
                                                                <div className="flex items-center justify-between">
                                                                    <Button
                                                                        size="sm"
                                                                        color="link-gray"
                                                                        onClick={() => {
                                                                            if (currentUncategorizedIndex > 0) {
                                                                                setCurrentUncategorizedIndex(i => i - 1);
                                                                            }
                                                                        }}
                                                                        isDisabled={currentUncategorizedIndex === 0}
                                                                    >
                                                                        ← Précédente
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        color="link-gray"
                                                                        onClick={() => {
                                                                            if (currentUncategorizedIndex < totalUncategorized - 1) {
                                                                                setCurrentUncategorizedIndex(i => i + 1);
                                                                            }
                                                                        }}
                                                                        isDisabled={currentUncategorizedIndex >= totalUncategorized - 1}
                                                                    >
                                                                        Passer →
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {importError && (
                                                        <div className="flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700">
                                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                                            <p>{importError}</p>
                                                        </div>
                                                    )}

                                                    {importStep === "success" && (
                                                        <div className="flex flex-col items-center gap-4 py-8">
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
                                                                <CheckCircle className="h-8 w-8 text-success-600" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-lg font-semibold text-primary">Import réussi !</p>
                                                                <p className="text-sm text-tertiary">
                                                                    {importedTransactions.length} transaction{importedTransactions.length > 1 ? "s" : ""} importée{importedTransactions.length > 1 ? "s" : ""}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Modal Footer */}
                                                {importStep !== "success" && (
                                                    <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                                        {/* Bouton retour/annuler */}
                                                        <Button
                                                            size="md"
                                                            color="secondary"
                                                            onClick={() => {
                                                                if (importStep === "categorized") {
                                                                    setImportStep("upload");
                                                                    setImportedTransactions([]);
                                                                } else if (importStep === "uncategorized") {
                                                                    // Si on avait des transactions auto-catégorisées, retourner à cette étape
                                                                    const hasCategorized = importedTransactions.some(t => t.isAutoCategorie);
                                                                    setImportStep(hasCategorized ? "categorized" : "upload");
                                                                    if (!hasCategorized) setImportedTransactions([]);
                                                                    setCurrentUncategorizedIndex(0);
                                                                } else {
                                                                    setIsImportModalOpen(false);
                                                                    resetImportModal();
                                                                }
                                                            }}
                                                        >
                                                            {importStep === "upload" ? "Annuler" : "Retour"}
                                                        </Button>

                                                        {/* Bouton principal selon l'étape */}
                                                        {importStep === "categorized" && (
                                                            <Button
                                                                size="md"
                                                                onClick={() => {
                                                                    const hasUncategorized = importedTransactions.some(t => !t.categorie);
                                                                    if (hasUncategorized) {
                                                                        setImportStep("uncategorized");
                                                                        setCurrentUncategorizedIndex(0);
                                                                    } else {
                                                                        // Toutes catégorisées, importer directement
                                                                        handleImportConfirm();
                                                                    }
                                                                }}
                                                            >
                                                                {importedTransactions.some(t => !t.categorie)
                                                                    ? "Valider et continuer"
                                                                    : `Importer ${importedTransactions.length} transaction${importedTransactions.length > 1 ? "s" : ""}`
                                                                }
                                                            </Button>
                                                        )}
                                                        {importStep === "uncategorized" && (
                                                            <Button
                                                                size="md"
                                                                onClick={handleImportConfirm}
                                                                isDisabled={isImporting || importedTransactions.length === 0}
                                                            >
                                                                {isImporting ? "Import..." : `Importer ${importedTransactions.length} transaction${importedTransactions.length > 1 ? "s" : ""}`}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Dialog>
                                    </Modal>
                                </ModalOverlay>
                            </DialogTrigger>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 3: ENVELOPPES (max 4) */}
                {/* ============================================ */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-primary">Enveloppes</h2>
                        {enveloppes.length > 4 && (
                            <Link href="/parametres" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                                Voir toutes ({enveloppes.length})
                            </Link>
                        )}
                    </div>
                    {enveloppes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {enveloppes.slice(0, 4).map((env) => (
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
                            <Link href="/parametres">
                                <Button size="sm" color="link-color" className="mt-2">
                                    Configurer les catégories
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ============================================ */}
                {/* SECTION 4: RÉSUMÉ DU MOIS (compact) */}
                {/* ============================================ */}
                <div className="mb-8 rounded-xl bg-secondary/50 p-4 ring-1 ring-secondary ring-inset">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-tertiary">Revenus</span>
                            <span className="font-semibold text-finance-gain">{formatCurrencySimple(revenusMois)}</span>
                        </div>
                        <span className="text-tertiary">−</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-tertiary">Charges</span>
                            <span className="font-semibold text-primary">{formatCurrencySimple(chargesFixesMois)}</span>
                        </div>
                        <span className="text-tertiary">=</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-tertiary">Disponible</span>
                            <span className="text-lg font-bold text-brand-600">{formatCurrencySimple(disponibleMensuel)}</span>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* SECTION 5: DEUX COLONNES */}
                {/* ============================================ */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Colonne gauche: DERNIÈRES TRANSACTIONS */}
                    <div className="flex flex-col gap-4 rounded-xl p-5 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary">Dernières transactions</h2>
                            <Link href="/depenses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                                Voir tout
                            </Link>
                        </div>
                        {lastTransactions.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {lastTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-medium text-primary">{tx.description || "Sans description"}</p>
                                            <p className="text-xs text-tertiary">{formatDateRelative(tx.date)}</p>
                                        </div>
                                        <p className={cx(
                                            "text-sm font-semibold",
                                            tx.montant < 0 ? "text-finance-loss" : "text-finance-gain"
                                        )}>
                                            {formatCurrencySimple(tx.montant)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-1 items-center justify-center rounded-lg bg-secondary p-6">
                                <p className="text-sm text-tertiary">Aucune transaction</p>
                            </div>
                        )}
                    </div>

                    {/* Colonne droite: PROCHAINS PRÉLÈVEMENTS */}
                    <div className="flex flex-col gap-4 rounded-xl p-5 shadow-xs ring-1 ring-secondary ring-inset">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary">Prochains prélèvements</h2>
                            <Calendar className="h-5 w-5 text-tertiary" />
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
                        <Link href="/budget/charges-fixes">
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

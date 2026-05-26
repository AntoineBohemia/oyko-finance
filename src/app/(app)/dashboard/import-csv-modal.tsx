"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Upload01, X, AlertCircle, CheckCircle } from "@untitledui/icons";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { formatCurrencySimple } from "@/utils/format";
import type { CategorieVariable } from "@/lib/data/dashboard";
import type { Profile } from "@/types/api";
import { api } from "@/lib/api/client";
import { addTransaction } from "@/lib/data/depenses";

interface ImportCSVModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    profile: Profile | null;
    categories: CategorieVariable[];
    comptes: { id: string; label: string }[];
    onCategoriesChange?: (categories: CategorieVariable[]) => void;
}

export function ImportCSVModal({ isOpen, onOpenChange, profile, categories, comptes, onCategoriesChange }: ImportCSVModalProps) {
    const queryClient = useQueryClient();
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
    const [newCategoryIcon, setNewCategoryIcon] = useState("\uD83D\uDCE6");
    const [newCategoryBudget, setNewCategoryBudget] = useState("");
    const [localCategories, setLocalCategories] = useState(categories);

    const resetImportModal = useCallback(() => {
        setImportedTransactions([]);
        setImportStep("upload");
        setImportError(null);
        setIsCreatingCategoryInImport(false);
        setNewCategoryName("");
        setNewCategoryIcon("\uD83D\uDCE6");
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
                const textDecoder = new TextDecoder("iso-8859-1");
                const arrayBuffer = await file.arrayBuffer();
                const text = textDecoder.decode(arrayBuffer);
                const separator = text.includes(";") ? ";" : ",";

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
                                currentField += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === sep && !inQuotes) {
                            currentRow.push(currentField.trim());
                            currentField = "";
                        } else if ((char === "\n" || char === "\r") && !inQuotes) {
                            if (char === "\r" && nextChar === "\n") {
                                i++;
                            }
                            if (currentField || currentRow.length > 0) {
                                currentRow.push(currentField.trim());
                                if (currentRow.some(f => f)) {
                                    rows.push(currentRow);
                                }
                                currentRow = [];
                                currentField = "";
                            }
                        } else {
                            currentField += char;
                        }
                    }

                    if (currentField || currentRow.length > 0) {
                        currentRow.push(currentField.trim());
                        if (currentRow.some(f => f)) {
                            rows.push(currentRow);
                        }
                    }

                    return rows;
                };

                const allRows = parseCSVWithMultiline(text, separator);

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
                    const XLSX = await import("xlsx");
                    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { raw: false });
                } else {
                    for (let i = headerIndex + 1; i < allRows.length; i++) {
                        const values = allRows[i];
                        const firstVal = values[0] || "";

                        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(firstVal)) continue;

                        const row: Record<string, unknown> = {};
                        headers.forEach((h, idx) => {
                            if (values[idx] !== undefined) {
                                row[h] = values[idx].replace(/\s+/g, " ").trim();
                            }
                        });

                        jsonData.push(row);
                    }
                }
            } else {
                const XLSX = await import("xlsx");
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

            const firstRow = jsonData[0];
            const keys = Object.keys(firstRow);

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
                    let montant = 0;

                    if (debitCol && row[debitCol]) {
                        const raw = String(row[debitCol])
                            .replace(/[^\d,.\-]/g, "")
                            .replace(",", ".");
                        montant = -Math.abs(parseFloat(raw) || 0);
                    } else if (creditCol && row[creditCol]) {
                        const raw = String(row[creditCol])
                            .replace(/[^\d,.\-]/g, "")
                            .replace(",", ".");
                        montant = Math.abs(parseFloat(raw) || 0);
                    } else if (amountCol && row[amountCol]) {
                        const raw = String(row[amountCol])
                            .replace(/[^\d,.\-]/g, "")
                            .replace(",", ".");
                        montant = parseFloat(raw) || 0;
                    }

                    let dateStr = "";
                    if (dateCol && row[dateCol]) {
                        const rawDate = row[dateCol];
                        if (rawDate instanceof Date) {
                            dateStr = rawDate.toISOString().split("T")[0];
                        } else {
                            const dateValue = String(rawDate);
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

                    let description = "";
                    if (descCol && row[descCol]) {
                        description = String(row[descCol])
                            .replace(/\s+/g, " ")
                            .replace(/X\d{4}\s*/g, "")
                            .replace(/\d{2}\/\d{2}\s*$/g, "")
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
                .filter((t) => t.montant !== 0 && t.date);

            if (parsed.length === 0) {
                setImportError("Aucune transaction valide trouvée dans le fichier.");
                return;
            }

            // Auto-catégorisation par mots-clés
            const categoryPatterns: Record<string, string[]> = {
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

            const parsedWithCategories = parsed.map((t) => {
                const descLower = t.description.toLowerCase();

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
    const availableIcons = ["\uD83D\uDED2", "\uD83C\uDF54", "\uD83D\uDE97", "\uD83C\uDFAC", "\uD83D\uDECD\uFE0F", "\uD83D\uDC8A", "\uD83D\uDCF1", "\uD83D\uDCDA", "\u2708\uFE0F", "\uD83C\uDFE0", "\uD83D\uDCA1", "\uD83C\uDF81", "\uD83D\uDCE6"];

    const handleCreateCategoryInImport = async () => {
        if (!profile || !newCategoryName.trim()) return;

        let data: { id: string };
        try {
            data = await api<{ id: string }>("/api/v1/categories", {
                method: "POST",
                body: {
                    nom: newCategoryName.trim(),
                    icone: newCategoryIcon,
                    budgetMensuel: parseFloat(newCategoryBudget) || 0,
                },
            });
        } catch (err) {
            console.error("Erreur création catégorie:", err);
            return;
        }

        const newCat: CategorieVariable = {
            id: data.id,
            nom: newCategoryName.trim(),
            icone: newCategoryIcon || "\uD83D\uDCE6",
            couleur: "#1C1917",
            budgetMensuel: parseFloat(newCategoryBudget) || 0,
        };

        setLocalCategories((prev) => [...prev, newCat]);
        onCategoriesChange?.([...localCategories, newCat]);

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

        setIsCreatingCategoryInImport(false);
        setNewCategoryName("");
        setNewCategoryIcon("\uD83D\uDCE6");
        setNewCategoryBudget("");
    };

    const handleImportConfirm = async () => {
        if (!profile || importedTransactions.length === 0) return;

        setIsImporting(true);
        const defaultCompteId = comptes[0]?.id || "";

        try {
            for (const t of importedTransactions) {
                await addTransaction({
                    montant: Math.abs(t.montant),
                    categorieId: t.categorie || "",
                    compteId: defaultCompteId,
                    description: t.description || undefined,
                    type: "depense",
                    date: new Date(t.date),
                });
            }
        } catch (err) {
            setImportError("Erreur lors de l'import: " + (err instanceof Error ? err.message : "Erreur inconnue"));
            setIsImporting(false);
            return;
        }

        setImportStep("success");
        setIsImporting(false);

        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["budget"] });
            onOpenChange(false);
            resetImportModal();
        }, 1500);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) resetImportModal();
        }}>
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
                                        onOpenChange(false);
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
                                        return (
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 text-xs font-semibold text-success-700">{"\u2713"}</div>
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
                                                                        const uncatIndex = importedTransactions.findIndex(
                                                                            t => t === currentTransaction
                                                                        );
                                                                        if (uncatIndex !== -1) {
                                                                            setImportedTransactions(prev => prev.map((t, i) =>
                                                                                i === uncatIndex ? { ...t, categorie: cat.id } : t
                                                                            ));
                                                                        }
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
                                                                                setNewCategoryIcon("\uD83D\uDCE6");
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
                                                    {"\u2190"} Précédente
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
                                                    Passer {"\u2192"}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {importError && importStep !== "upload" && (
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
                                                const hasCategorized = importedTransactions.some(t => t.isAutoCategorie);
                                                setImportStep(hasCategorized ? "categorized" : "upload");
                                                if (!hasCategorized) setImportedTransactions([]);
                                                setCurrentUncategorizedIndex(0);
                                            } else {
                                                onOpenChange(false);
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
    );
}

/**
 * Utilitaires de formatage pour l'application finance
 * ====================================================
 */

// ============================================
// FORMATAGE MONÉTAIRE
// ============================================

/**
 * Formate un montant avec signe (+ ou -)
 * @example formatCurrency(150) // "+ 150,00 €"
 * @example formatCurrency(-47.82) // "- 47,82 €"
 */
export const formatCurrency = (amount: number): string => {
    const formatted = Math.abs(amount).toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
    });
    return amount >= 0 ? `+ ${formatted}` : `- ${formatted}`;
};

/**
 * Formate un montant simple sans signe
 * @example formatCurrencySimple(1847.32) // "1 847,32 €"
 */
export const formatCurrencySimple = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
    });
};

/**
 * Formate un montant en version compacte
 * @example formatCurrencyCompact(10467) // "10.5k €"
 * @example formatCurrencyCompact(500) // "500 €"
 */
export const formatCurrencyCompact = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M €`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k €`;
    }
    return `${amount.toFixed(0)} €`;
};

/**
 * Formate un montant pour les graphiques (sans symbole €)
 * @example formatCurrencyChart(10467) // "10.5k"
 */
export const formatCurrencyChart = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toFixed(0);
};

// ============================================
// FORMATAGE DATES
// ============================================

/**
 * Formate une date avec jour de la semaine et heure
 * @example formatDateTime(new Date()) // "lun. 6, 14:30"
 */
export const formatDateTime = (date: Date): string =>
    date.toLocaleString("fr-FR", {
        weekday: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

/**
 * Formate une date courte
 * @example formatDateShort(new Date()) // "6 janv."
 */
export const formatDateShort = (date: Date): string =>
    date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
    });

/**
 * Formate une date complète
 * @example formatDateFull(new Date()) // "6 janvier 2026"
 */
export const formatDateFull = (date: Date): string =>
    date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

/**
 * Formate une date pour les graphiques (mois abrégé)
 * @example formatDateChart("2026-01-01") // "janv."
 */
export const formatDateChart = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("fr-FR", {
        month: "short",
    });

/**
 * Formate une date relative (dans X jours, etc.)
 * @example formatDateRelative(demain) // "Demain"
 * @example formatDateRelative(dans5jours) // "Dans 5 jours"
 */
export const formatDateRelative = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        const absDiff = Math.abs(diffDays);
        if (absDiff === 1) return "Hier";
        if (absDiff < 7) return `Il y a ${absDiff} jours`;
        return formatDateShort(date);
    }

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    if (diffDays < 14) return "La semaine prochaine";
    return formatDateShort(date);
};

/**
 * Formate uniquement l'heure
 * @example formatTime(new Date()) // "14:30"
 */
export const formatTime = (date: Date): string =>
    date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

// ============================================
// FORMATAGE POURCENTAGES
// ============================================

/**
 * Formate un pourcentage
 * @example formatPercent(12.5) // "12.5%"
 * @example formatPercent(12.567, 1) // "12.6%"
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Formate un pourcentage avec signe
 * @example formatPercentSigned(12.5) // "+12.5%"
 * @example formatPercentSigned(-5.2) // "-5.2%"
 */
export const formatPercentSigned = (value: number, decimals: number = 1): string => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(decimals)}%`;
};

// ============================================
// HELPERS DIVERS
// ============================================

/**
 * Génère des initiales à partir d'un nom
 * @example getInitials("Carrefour Market") // "CA"
 * @example getInitials("Spotify") // "SP"
 */
export const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return name.slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
};

/**
 * Obtient une clé unique pour un jour (pour grouper les transactions)
 * @example getDayKey(new Date(2026, 0, 6)) // "2026-0-6"
 */
export const getDayKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

/**
 * Calcule le coût mensuel d'un abonnement selon sa fréquence
 */
export const calculateMonthlyCost = (montant: number, frequence: string): number => {
    switch (frequence) {
        case "Mensuel":
            return montant;
        case "Annuel":
            return montant / 12;
        case "Trimestriel":
            return montant / 3;
        case "Hebdo":
            return montant * 4.33;
        default:
            return montant;
    }
};

/**
 * Calcule le coût annuel d'un abonnement selon sa fréquence
 */
export const calculateYearlyCost = (montant: number, frequence: string): number => {
    switch (frequence) {
        case "Mensuel":
            return montant * 12;
        case "Annuel":
            return montant;
        case "Trimestriel":
            return montant * 4;
        case "Hebdo":
            return montant * 52;
        default:
            return montant * 12;
    }
};

/**
 * Détermine la couleur d'une progress bar selon le pourcentage
 * Gradation plus fine pour une meilleure UX
 */
export const getProgressColor = (percent: number): string => {
    if (percent > 100) return "bg-error-500";
    if (percent > 90) return "bg-orange-500";
    if (percent > 75) return "bg-warning-500";
    if (percent > 50) return "bg-success-500";
    return "bg-success-400";
};

/**
 * Détermine la couleur d'une progress bar pour les fonds sombres (hero cards)
 * Utilise des couleurs plus vives et contrastées
 */
export const getProgressColorOnDark = (percent: number): string => {
    if (percent > 100) return "bg-red-400";
    if (percent > 90) return "bg-orange-400";
    if (percent > 75) return "bg-amber-400";
    if (percent > 50) return "bg-lime-400";
    return "bg-emerald-400";
};

/**
 * Détermine la couleur d'un badge selon le statut
 */
export const getStatusColor = (statut: string): "success" | "warning" | "error" | "gray" | "blue" => {
    switch (statut) {
        case "Actif":
        case "En cours":
            return "success";
        case "Gelé":
        case "En pause":
            return "blue";
        case "Fermé":
        case "Remboursé":
            return "gray";
        default:
            return "gray";
    }
};

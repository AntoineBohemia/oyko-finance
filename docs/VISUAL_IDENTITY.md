# Oyko — Identité Visuelle

> Document de référence pour l'identité visuelle d'Oyko. Chaque décision de design, chaque composant, chaque ligne de CSS doit respecter ce document. Aucun compromis.
>
> Direction artistique : **"Banque privée digitale"** — élégance sobre, monochrome chaud, touches d'accent rares et chirurgicales. Référence principale : Carta.

---

## 1. Philosophie

### Le mot directeur

**Élégant.**

Chaque écran, chaque interaction, chaque pixel doit servir cette impression. Pas "joli", pas "cool", pas "moderne" — élégant. La différence : l'élégance vient de la retenue, pas de l'accumulation.

### Principes fondamentaux

1. **Monochrome d'abord.** L'interface vit en nuances d'anthracite chaud. La couleur est un événement, pas un état par défaut.
2. **Le lime est chirurgical.** Il apparaît sur les CTA principaux, les gains financiers, l'état actif de la navigation, et c'est tout. Sa rareté fait sa puissance.
3. **La typographie est l'identité.** Fraunces pour les titres donne le caractère. Pas besoin de décorations, d'illustrations complexes ou d'effets — la font parle.
4. **L'espace est un luxe.** Généreuses marges, padding confortables. L'interface respire. Chaque élément a de la place.
5. **Un seul mode, parfait.** Pas de dark mode. Toute l'énergie concentrée sur un univers unique et maîtrisé.

---

## 2. Palette de couleurs

### Couleurs fondamentales

| Rôle | Hex | Nom | Usage |
|------|-----|-----|-------|
| **Brand / Texte principal** | `#1C1917` | Anthracite chaud (stone-900) | Texte, titres, icônes, sidebar |
| **Accent** | `#BEFF00` | Lime | CTA principal, gains, état actif nav, highlights rares |
| **Fond principal** | `#F5F3EF` | Pierre clair | Background de toute l'app |
| **Fond cards** | `#FFFFFF` | Blanc cassé | Surface des cards |
| **Bordures** | `#E5E2DC` | Pierre moyen | Borders cards, séparateurs, lignes de tableau |
| **Texte secondaire** | `#78716C` | Stone-500 | Labels, descriptions, texte d'aide |
| **Texte tertiaire** | `#A8A29E` | Stone-400 | Placeholders, métadonnées |
| **Disabled** | `#D6D3D1` | Stone-300 | États désactivés |

### Palette Lime (accent) — usage restreint

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FAFFE4` | Background badge gain, fond très léger |
| 100 | `#F3FFC4` | Hover léger sur éléments accent |
| 200 | `#E6FF90` | — |
| 300 | `#D5FF50` | — |
| **400** | **`#BEFF00`** | **Accent principal — CTA, gains, actif nav** |
| 500 | `#A7E600` | Hover sur CTA |
| 600 | `#83B800` | Pressed sur CTA |
| 700 | `#608B00` | Texte lime sur fond clair (accessibilité) |
| 800 | `#4D6D07` | — |
| 900 | `#415C0B` | — |
| 950 | `#213400` | — |

### Palette Anthracite chaud (stone) — usage dominant

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FAFAF9` | — |
| 100 | `#F5F5F4` | — |
| 200 | `#E7E5E4` | Borders secondaires |
| 300 | `#D6D3D1` | Disabled |
| 400 | `#A8A29E` | Texte tertiaire, placeholders |
| 500 | `#78716C` | Texte secondaire |
| 600 | `#57534E` | Texte icônes inactives |
| 700 | `#44403C` | — |
| 800 | `#292524` | Sidebar fond, éléments foncés |
| **900** | **`#1C1917`** | **Texte principal, titres, brand** |
| 950 | `#0C0A09` | Noir profond (usage rare) |

### Couleurs sémantiques — restreintes

Les couleurs sémantiques sont **désaturées et chaudes** pour rester cohérentes avec l'univers. Pas de rouge vif, pas de vert standard.

| Rôle | Hex | Usage |
|------|-----|-------|
| **Gains** | `#BEFF00` (lime-400) | Montants positifs, tendances à la hausse |
| **Pertes** | `#1C1917` (anthracite) | Montants négatifs — neutre, non-jugeant. Différencié par le signe `-` et le poids typographique |
| **Warning** | `#D97706` | Enveloppe budget proche du seuil (> 80%) |
| **Error** | `#B91C1C` | Erreurs système uniquement (formulaires, API). JAMAIS pour des données financières |

### Règles absolues

- ❌ **JAMAIS** de rouge sur un montant négatif ou un dépassement de budget
- ❌ **JAMAIS** de couleur sémantique (rouge/vert/orange) pour juger les finances de l'utilisateur
- ✅ Le lime est réservé aux : CTA principal, gains financiers, état actif navigation, indicateurs positifs
- ✅ Le warning (`#D97706`) est réservé aux seuils de budget (information, pas jugement)
- ✅ Le error (`#B91C1C`) est réservé aux erreurs techniques (champ invalide, échec API)

---

## 3. Typographie

### Familles

| Rôle | Font | Source | Fallback |
|------|------|--------|----------|
| **Display / Titres** | **Fraunces** (variable, axes: WONK, SOFT, wght, opsz) | Google Fonts | Georgia, serif |
| **Body / Interface** | **Geist Sans** | Vercel/npm `geist` | -apple-system, system-ui, sans-serif |
| **Monospace / Montants** | **Geist Mono** | Vercel/npm `geist` | ui-monospace, monospace |

### Échelle typographique

| Token | Taille | Line-height | Poids | Font | Usage |
|-------|--------|-------------|-------|------|-------|
| `display-2xl` | 72px | 1.1 | 600 | Fraunces | Landing hero uniquement |
| `display-xl` | 60px | 1.1 | 600 | Fraunces | — |
| `display-lg` | 48px | 1.1 | 600 | Fraunces | Titres de page |
| `display-md` | 36px | 1.2 | 600 | Fraunces | Sous-titres importants |
| `display-sm` | 30px | 1.2 | 600 | Fraunces | Titres de section |
| `display-xs` | 24px | 1.3 | 600 | Fraunces | Titres de card |
| `text-xl` | 20px | 1.5 | 400 | Geist Sans | Lead text |
| `text-lg` | 18px | 1.55 | 400 | Geist Sans | — |
| `text-md` | 16px | 1.5 | 400 | Geist Sans | Body par défaut |
| `text-sm` | 14px | 1.4 | 400 | Geist Sans | Labels, descriptions |
| `text-xs` | 12px | 1.5 | 400 | Geist Sans | Métadonnées, captions |
| `mono-lg` | 32px | 1.2 | 500 | Geist Mono | Montant principal dashboard |
| `mono-md` | 24px | 1.3 | 500 | Geist Mono | Montants cards |
| `mono-sm` | 16px | 1.4 | 400 | Geist Mono | Montants inline |
| `mono-xs` | 14px | 1.4 | 400 | Geist Mono | Montants tableaux |

### Fraunces — axes variables

Fraunces possède 5 axes de variation. Réglages recommandés pour Oyko :

| Axe | Valeur | Effet |
|-----|--------|-------|
| `WONK` | `1` | Active les formes "wonky" (expressives). C'est le caractère de la font. |
| `SOFT` | `50` | Adoucit les terminaisons (mi-chemin entre sharp et soft). Élégant sans être rigide. |
| `wght` | `600` | Semi-bold pour les titres. Pas trop lourd, pas trop fin. |
| `opsz` | Auto (lié à font-size) | Optical sizing automatique. |

### Chiffres financiers

Tous les montants affichés utilisent Geist Mono avec :
- `font-variant-numeric: tabular-nums` — alignement vertical des chiffres
- Formatage : `2 847,50 €` (espace insécable milliers, virgule décimale, symbole € après)
- Gains : couleur lime `#BEFF00` (ou `#608B00` lime-700 si sur fond clair pour accessibilité)
- Pertes : couleur anthracite `#1C1917`, préfixé par `−` (signe moins typographique, pas un tiret)
- Animation : `@number-flow/react` pour les transitions de valeur

---

## 4. Iconographie

### Librairie

**Phosphor Icons** — style **duotone**.

Package : `@phosphor-icons/react`

### Style et usage

| Contexte | Taille | Style | Couleurs |
|----------|--------|-------|----------|
| Navigation sidebar | 24px | Duotone | Inactif : stone-500 / Actif : lime-400 |
| Boutons | 20px | Duotone | Même couleur que le texte du bouton |
| Cards / Headers | 24px | Duotone | Anthracite stone-600 / fill stone-200 |
| Empty states | 48px | Duotone | Anthracite stone-400 / fill lime-400 (touche d'accent) |
| Tableaux | 16px | Regular (pas duotone) | Stone-500 |
| Badges / inline | 14px | Regular | Hérite du texte |

### Couleur duotone

Le style duotone de Phosphor utilise 2 couleurs : une couleur de trait et une couleur de remplissage.

- **Par défaut** : trait `#1C1917` (anthracite) + fill `#E7E5E4` (stone-200)
- **État actif** : trait `#1C1917` + fill `#BEFF00` (lime)
- **Empty states** : trait `#A8A29E` (stone-400) + fill `#BEFF00` (lime)

### Mapping des icônes principales

| Fonction | Icône Phosphor | Remplace (Untitled UI) |
|----------|---------------|----------------------|
| Dashboard | `House` | Home |
| Dépenses | `Receipt` | Receipt |
| Budget | `Wallet` | Wallet02 |
| Patrimoine | `ChartPie` | PieChart |
| Paramètres | `GearSix` | Settings01 |
| Ajouter | `Plus` | Plus |
| Supprimer | `Trash` | Trash01 |
| Modifier | `PencilSimple` | Edit |
| Tendance hausse | `TrendUp` | TrendUp01 |
| Tendance baisse | `TrendDown` | TrendDown01 |
| Banque | `Bank` | Bank |
| Épargne | `PiggyBank` | PiggyBank01 |
| Carte | `CreditCard` | CreditCard01 |
| Calendrier | `Calendar` | Calendar |
| Recherche | `MagnifyingGlass` | SearchLg |
| Fermer | `X` | X |
| Chevron | `CaretRight` / `CaretLeft` | ChevronRight / ChevronLeft |
| Upload | `UploadSimple` | Upload01 |
| Lien | `Link` | Link01 |
| Aide | `Question` | HelpCircle |
| Alerte | `Warning` | AlertCircle |
| Succès | `Check` | Check |
| Loading | `CircleNotch` (animate-spin) | Loading02 |

---

## 5. Composants — Directives de style

### Cards

```
Background:      #FFFFFF (blanc cassé)
Border:          1px solid #E5E2DC
Border-radius:   8px (rounded-lg)
Padding:         24px (p-6)
Shadow:          aucune
Hover:           aucun changement (pas d'effet hover sur les cards statiques)
```

Les cards sont **plates**. Pas d'ombre, pas de gradient, pas d'effet skeuomorphique. La border fine suffit à délimiter. Le contenu à l'intérieur crée la hiérarchie.

### Boutons

**Primaire (CTA principal)**
```
Background:      #BEFF00 (lime-400)
Text:            #1C1917 (anthracite)
Border:          none
Border-radius:   8px
Padding:         12px 20px
Font:            Geist Sans, 14px, semi-bold (600)
Hover:           #A7E600 (lime-500)
Pressed:         #83B800 (lime-600), scale(0.98)
```

**Secondaire**
```
Background:      transparent
Text:            #1C1917
Border:          1px solid #E5E2DC
Border-radius:   8px
Padding:         12px 20px
Font:            Geist Sans, 14px, medium (500)
Hover:           background #FAFAF9 (stone-50)
Pressed:         background #F5F5F4 (stone-100), scale(0.98)
```

**Tertiaire / Ghost**
```
Background:      transparent
Text:            #78716C (stone-500)
Border:          none
Padding:         12px 20px
Font:            Geist Sans, 14px, medium (500)
Hover:           text #1C1917
```

**Destructif**
```
Background:      transparent
Text:            #B91C1C
Border:          1px solid #B91C1C33 (20% opacity)
Hover:           background #B91C1C0A (4% opacity)
```

### Inputs

```
Background:      #FFFFFF
Border:          1px solid #E5E2DC
Border-radius:   8px
Padding:         10px 14px
Font:            Geist Sans, 16px
Placeholder:     #A8A29E (stone-400)
Focus:           border 2px solid #1C1917 (anthracite, pas de couleur)
Invalid:         border 2px solid #B91C1C
```

Le focus est en **anthracite**, pas en bleu ou en lime. Cohérent avec le monochrome.

### Badges

```
Background:      #F5F3EF (pierre) ou couleur sémantique très claire
Text:            #1C1917 ou couleur sémantique foncée
Border-radius:   6px (rounded-md)
Padding:         2px 10px
Font:            Geist Sans, 12px, medium (500)
```

Badge gain : `bg: #FAFFE4, text: #608B00` (lime très clair + lime foncé)
Badge perte : `bg: #F5F5F4, text: #57534E` (stone neutre)
Badge warning : `bg: #FEF3C7, text: #92400E`

### Progress bars (enveloppes budget)

```
Track:           #E7E5E4 (stone-200)
Fill (< 80%):    #1C1917 (anthracite)
Fill (≥ 80%):    #D97706 (warning)
Fill (= 100%):   #1C1917 (anthracite, pas de rouge)
Height:          6px
Border-radius:   3px (rounded-full)
Animation:       width transition 300ms ease-out
```

Pas de rouge même à 100% dépassé. L'anthracite reste neutre. Le warning apparaît uniquement dans la zone 80-99% pour **informer**, pas pour **juger**.

### Tableaux

```
Header:          Geist Sans, 12px, medium, uppercase, letter-spacing 0.05em, color stone-500
Rows:            border-bottom 1px solid #E5E2DC
Row hover:       background #FAFAF9
Cell text:       Geist Sans, 14px, color #1C1917
Cell secondary:  color #78716C
Cell montant:    Geist Mono, 14px, tabular-nums
```

---

## 6. Layout

### Structure globale

```
┌──────────┬──────────────────────────────────────┐
│          │                                      │
│ Sidebar  │            Content Area              │
│  68px    │         max-width: 1280px            │
│  dark    │          padding: 32px               │
│          │                                      │
│          │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Sidebar (desktop)

```
Width:           68px
Background:      #1C1917 (anthracite-900)
Border-right:    none (le contraste fond suffit)
Icônes:          24px, Phosphor duotone
Inactif:         stone-500 (#78716C)
Actif:           lime-400 (#BEFF00) + indicateur à gauche (barre verticale 3px lime, rounded)
Hover:           stone-300 (#D6D3D1)
Logo:            en haut, adapté couleurs blanches
User avatar:     en bas, 32px, rounded-full
```

### Sidebar (mobile)

```
Trigger:         Hamburger icon dans header sticky (h-56px, bg #F5F3EF, border-bottom #E5E2DC)
Drawer:          vaul, width 280px, background #1C1917
Animation:       spring physics (vaul par défaut)
Backdrop:        rgba(28,25,23, 0.5) + backdrop-blur-sm
```

### Dashboard — Bento Grid

```
Desktop (lg+):
┌─────────────────────────┬────────────┐
│                         │            │
│   Solde disponible      │  Patrimoine│
│   (2 cols, Fraunces     │   net      │
│    + Geist Mono grand)  │  (1 col)   │
│                         │            │
├────────┬────────┬───────┴────────────┤
│  Env.  │  Env.  │                    │
│ Alim.  │ Transp.│   Évolution        │
├────────┼────────┤   patrimoine       │
│  Env.  │  Env.  │   (area chart      │
│ Loisirs│ Vêtem. │    lime gradient)  │
├────────┴────────┼────────────────────┤
│                 │                    │
│  Charges fixes  │   Transactions     │
│  à venir        │   récentes         │
│                 │                    │
└─────────────────┴────────────────────┘

Mobile:
Stack vertical, pleine largeur, même ordre de priorité.
```

### Spacing

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-xs` | 4px | Écarts micro (entre icône et texte) |
| `space-sm` | 8px | Padding interne compact |
| `space-md` | 16px | Gap entre éléments dans une card |
| `space-lg` | 24px | Padding card, gap entre cards |
| `space-xl` | 32px | Padding zone de contenu |
| `space-2xl` | 48px | Séparation entre sections majeures |
| `space-3xl` | 64px | Marges de page sur desktop |

### Border radius

```
Cards:           8px (rounded-lg)
Boutons:         8px (rounded-lg)
Inputs:          8px (rounded-lg)
Badges:          6px (rounded-md)
Avatar:          9999px (rounded-full)
Progress bar:    9999px (rounded-full)
Sidebar active:  4px (indicateur)
```

Tout à **8px**. Uniformité absolue. Pas de `rounded-[40px]`, pas de `rounded-2xl`. Un seul radius pour tout.

---

## 7. Data Visualization (Charts)

### Librairie

**Nivo** (`@nivo/line`, `@nivo/bar`, `@nivo/pie`)

Remplace Recharts. Avantages : theming intégré, animations react-spring, meilleur rendu SVG.

### Thème Nivo global

```javascript
const oykoChartTheme = {
  background: "transparent",
  text: {
    fontSize: 12,
    fontFamily: "Geist Sans, sans-serif",
    fill: "#78716C", // stone-500
  },
  axis: {
    ticks: {
      text: {
        fontSize: 11,
        fill: "#A8A29E", // stone-400
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fontFamily: "Geist Sans, sans-serif",
        fill: "#78716C",
      },
    },
  },
  grid: {
    line: {
      stroke: "#E7E5E4", // stone-200
      strokeWidth: 1,
      strokeDasharray: "4 4",
    },
  },
  tooltip: {
    container: {
      background: "#1C1917",
      color: "#FAFAF9",
      fontSize: 13,
      fontFamily: "Geist Sans, sans-serif",
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0px 4px 12px rgba(28,25,23,0.15)",
    },
  },
  crosshair: {
    line: {
      stroke: "#1C1917",
      strokeWidth: 1,
      strokeDasharray: "4 4",
    },
  },
};
```

### Traitement par type de chart

**Évolution patrimoine — Area Chart (la star)**
```
Ligne:           #BEFF00 (lime-400), strokeWidth 2
Fill:            gradient #BEFF00 (opacity 0.3) → transparent
Points:          aucun (courbe lisse)
Grille:          horizontal uniquement, dashed stone-200
Axes:            stone-400, labels en Geist Sans 11px
Animation:       spring (react-spring via Nivo)
```

**Dépenses par jour/semaine — Bar Chart**
```
Barres:          #D6D3D1 (stone-300)
Barre active:    #BEFF00 (lime-400) — jour/semaine en cours
Border-radius:   4px (top)
Grille:          aucune
Axes:            x seulement, stone-400
Hover:           barre → #1C1917 (anthracite)
```

**Répartition catégories — Donut/Pie**
```
Segments:        nuances de stone (200, 300, 400, 500, 600, 700)
Plus gros segment: #BEFF00 (lime)
Inner radius:    60% (donut, pas pie plein)
Border:          2px #FFFFFF entre segments
Labels:          extérieurs, Geist Sans 12px
```

**Sparklines inline (cards)**
```
Ligne:           #A8A29E (stone-400), strokeWidth 1.5
Pas d'axe, pas de grille, pas de tooltip
Hauteur:         32-40px
Largeur:         100% de la card
```

---

## 8. Animations & Interactions

### Librairie

**Motion** (`motion` — déjà installé, Framer Motion v12)

Niveau : **Expressif** — transitions de page, micro-interactions, stagger, spring physics.

### Tokens d'animation

| Token | Valeur | Usage |
|-------|--------|-------|
| `transition-fast` | `150ms ease-out` | Hover states, color changes |
| `transition-base` | `200ms ease-out` | Apparition éléments, toggles |
| `transition-slow` | `300ms ease-out` | Transitions de page |
| `spring-bounce` | `{ type: "spring", stiffness: 300, damping: 25 }` | Drawers, modales |
| `spring-gentle` | `{ type: "spring", stiffness: 200, damping: 30 }` | Éléments UI, cards |

### Transitions de page

```typescript
// Chaque page wrappée dans un composant PageTransition
const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier
};
```

### Stagger (listes et grilles)

```typescript
// Les items de liste (transactions, enveloppes) apparaissent en cascade
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05, // 50ms entre chaque item
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};
```

### Micro-interactions

| Élément | Interaction | Animation |
|---------|-------------|-----------|
| Bouton primaire | Press | `scale(0.98)`, 100ms |
| Card cliquable | Hover | `translateY(-1px)`, transition-fast |
| Montants financiers | Changement de valeur | `@number-flow/react` — morphing fluide |
| Progress bar | Apparition | Width 0→valeur, 400ms ease-out |
| Icône nav active | Changement | Spring scale 0.8→1, lime color |
| Toast | Entrée | Slide-up + fade-in, spring-bounce |
| Drawer mobile | Ouverture | Spring physics via vaul |
| Skeleton loader | Attente | Pulse animation (opacity 0.4→1→0.4) |
| Badge gain | Apparition | Scale 0.9→1, opacity fade, spring-gentle |

### Montants animés (@number-flow/react)

```typescript
// Tous les montants financiers principaux utilisent NumberFlow
<NumberFlow
  value={soldeDisponible}
  format={{
    style: "currency",
    currency: "EUR",
    locale: "fr-FR",
  }}
  className="font-mono text-mono-lg font-medium"
/>
```

---

## 9. Textures & Éléments décoratifs

### Grain de fond

Un noise SVG subtil appliqué en pseudo-élément `::after` sur le body ou le layout principal.

```css
.grain::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* noise SVG inline */
  z-index: 9999;
}
```

Opacity : **3%**. Juste assez pour sentir la texture, pas assez pour gêner la lecture.

### Éléments géométriques

Des formes **très subtiles** (cercles, lignes fines) en `#E5E2DC` (border color) à opacity 30-50%, positionnées en arrière-plan de certaines sections :

- **Dashboard hero** : un grand cercle en pointillés (comme Carta) derrière la card solde
- **Pages vides / onboarding** : lignes de grille fines en fond

Ces éléments sont **purement décoratifs** et doivent rester quasi invisibles. Si on hésite, on les enlève.

---

## 10. Empty States

### Structure

```
┌─────────────────────────────────┐
│                                 │
│     [Icône Phosphor duotone]    │
│          48px                   │
│    anthracite + fill lime       │
│                                 │
│     Titre en Fraunces           │
│     display-xs (24px)           │
│                                 │
│     Description en Geist Sans   │
│     text-sm, stone-500          │
│                                 │
│     [CTA Bouton Primaire]       │
│                                 │
└─────────────────────────────────┘
```

### Exemples

| Page | Icône | Titre | Description | CTA |
|------|-------|-------|-------------|-----|
| Transactions vides | `Receipt` | Aucune transaction | Commencez par ajouter votre première dépense | Ajouter une transaction |
| Enveloppes vides | `Wallet` | Pas encore d'enveloppes | Créez vos catégories de dépenses pour suivre votre budget | Créer une enveloppe |
| Investissements vides | `ChartLine` | Votre portfolio est vide | Ajoutez vos premiers investissements pour suivre leur évolution | Ajouter un investissement |
| Comptes vides | `Bank` | Aucun compte | Connectez votre banque ou ajoutez un compte manuellement | Ajouter un compte |

---

## 11. Command Palette (⌘K)

### Librairie

**cmdk** (`cmdk`)

### Style

```
Backdrop:        rgba(28,25,23, 0.5) + backdrop-blur-sm
Container:       bg #FFFFFF, border 1px #E5E2DC, rounded-lg, shadow-xl
                 max-width 560px, centré verticalement (top 20%)
Input:           pas de border, font Geist Sans 16px, placeholder stone-400
                 Icône MagnifyingGlass à gauche
Items:           padding 12px 16px, hover bg #FAFAF9
                 Icône Phosphor 20px + label Geist Sans 14px
Groups:          label uppercase Geist Sans 11px stone-400, letter-spacing 0.05em
Shortcut badge:  bg #F5F3EF, font Geist Mono 11px, rounded-md
Selected:        bg #F5F3EF, pas de couleur d'accent
```

### Commandes disponibles

| Commande | Icône | Raccourci |
|----------|-------|-----------|
| Aller au Dashboard | `House` | — |
| Aller aux Dépenses | `Receipt` | — |
| Aller au Budget | `Wallet` | — |
| Aller au Patrimoine | `ChartPie` | — |
| Aller aux Paramètres | `GearSix` | — |
| Ajouter une transaction | `Plus` | `T` |
| Ajouter une enveloppe | `Plus` | `E` |
| Changer de période | `Calendar` | — |
| Rechercher une transaction | `MagnifyingGlass` | — |

---

## 12. Toasts (sonner)

### Style

```
Position:        bottom-right
Background:      #1C1917 (anthracite)
Text:            #FAFAF9 (blanc cassé)
Border-radius:   8px
Font:            Geist Sans, 14px
Icône succès:    Check, lime-400
Icône erreur:    Warning, #B91C1C
Icône info:      Info, stone-400
Animation:       slide-up + fade-in (sonner par défaut)
```

Les toasts sont **dark sur fond clair** — ils ressortent naturellement sans couleur d'accent.

---

## 13. Librairies — Résumé des changements

### À ajouter

| Package | Version | Usage |
|---------|---------|-------|
| `@phosphor-icons/react` | latest | Icônes duotone |
| `@nivo/line` | latest | Area charts, line charts |
| `@nivo/bar` | latest | Bar charts |
| `@nivo/pie` | latest | Donut charts |
| `@number-flow/react` | latest | Montants animés |
| `sonner` | latest | Toasts |
| `vaul` | latest | Drawer mobile |
| `cmdk` | latest | Command palette |
| `geist` | latest | Fonts Geist Sans + Geist Mono |

### À supprimer

| Package | Raison |
|---------|--------|
| `@untitledui/icons` | Remplacé par Phosphor Icons |
| `@untitledui/file-icons` | Plus nécessaire |
| `next-themes` | Plus de dark mode |
| `recharts` | Remplacé par Nivo |

### À conserver

| Package | Raison |
|---------|--------|
| `motion` | Animations (déjà installé) |
| `react-aria-components` | Accessibilité (fondation solide) |
| `tailwindcss` | Styling (adapter les tokens) |
| `tailwindcss-react-aria-components` | Intégration RAC + Tailwind |
| `class-variance-authority` | Variants composants |
| `tailwind-merge` | Merge classes |
| `embla-carousel-react` | Carrousel (si utilisé) |
| `tailwindcss-animate` | Utilitaires animation CSS |

---

## 14. Migration — Ordre d'exécution

### Phase 1 — Fondations (faire en premier)

1. **Installer les nouvelles dépendances** (Phosphor, Nivo, NumberFlow, sonner, vaul, cmdk, geist)
2. **Remplacer les fonts** dans `layout.tsx` (Fraunces + Geist Sans + Geist Mono)
3. **Réécrire `theme.css`** avec la nouvelle palette (stone, lime, suppression des 250+ couleurs Untitled UI inutilisées)
4. **Supprimer `next-themes`** et le ThemeProvider — un seul mode
5. **Mettre à jour `globals.css`** — grain texture, reset des custom variants dark

### Phase 2 — Composants de base

6. **Boutons** — nouvelle palette, rounded-lg, comportements hover/pressed
7. **Inputs** — nouveau style, focus anthracite
8. **Cards** — flat + border fine, suppression gradients/shadows skeuomorphiques
9. **Badges** — nouvelle palette, rounded-md
10. **Progress bars** — anthracite/warning, pas de rouge
11. **Tableaux** — nouveau style headers, rows, montants mono

### Phase 3 — Layout & Navigation

12. **App Shell** — sidebar dark permanente, icônes Phosphor, indicateur lime
13. **Mobile** — header + drawer vaul
14. **Toasts** — intégrer sonner, themer en dark
15. **Command palette** — intégrer cmdk

### Phase 4 — Pages

16. **Dashboard** — bento grid, hero card solde (Fraunces + Geist Mono), sparklines
17. **Budget** — enveloppes redesign, progress bars
18. **Dépenses** — charts Nivo (bar chart anthracite + lime), liste transactions
19. **Patrimoine** — area chart lime, donut monochrome, sparklines
20. **Paramètres** — style cohérent

### Phase 5 — Polish

21. **Transitions de page** — Motion `AnimatePresence` + variants
22. **Stagger animations** — listes et grilles
23. **Number flow** — montants animés sur dashboard et patrimoine
24. **Empty states** — Phosphor duotone + Fraunces
25. **Éléments géométriques** — cercles pointillés sur dashboard
26. **Grain** — texture noise sur le body

### Phase 6 — Nettoyage

27. **Supprimer** `@untitledui/icons`, `@untitledui/file-icons`, `recharts`, `next-themes`
28. **Supprimer** les couleurs inutilisées dans theme.css (brand purple, gray-blue, etc.)
29. **Supprimer** les composants dark mode (`dark:`, `.dark-mode`)
30. **Audit** — vérifier qu'aucun violet/purple Untitled UI ne subsiste

---

## 15. Checklist de conformité

Avant de considérer la migration terminée, chaque point doit être vérifié :

- [x] Aucune trace de violet/purple (#7f56d9) dans le code
- [ ] Aucune trace de `@untitledui/icons` dans les imports *(95 fichiers — migration Phosphor à planifier)*
- [ ] Aucune trace de `recharts` dans les imports *(18 fichiers — migration Nivo à planifier)*
- [x] Aucune trace de `next-themes` ou de dark mode
- [x] Tous les montants financiers utilisent Geist Mono + tabular-nums
- [x] Aucun montant négatif n'est affiché en rouge
- [x] Le lime n'apparaît que sur : CTA principal, gains, nav active, chart patrimoine star, empty states
- [x] Toutes les cards (base) sont flat + border 1px #E5E2DC + rounded-lg
- [x] La sidebar est dark (#1C1917) avec indicateur lime *(icônes Phosphor: après migration)*
- [x] Les transitions de page utilisent fade + scale(0.98→1)
- [x] Les montants principaux utilisent @number-flow/react
- [x] Le grain de fond est visible à 3% opacity
- [x] Fraunces est utilisée pour TOUS les titres (display-xs et au-dessus)
- [x] Geist Sans est utilisée pour TOUT le body text
- [x] Les toasts utilisent sonner avec style dark
- [ ] Le drawer mobile utilise vaul *(installé, intégration manuelle à faire)*
- [ ] La command palette (⌘K) fonctionne *(installé, à implémenter)*

---

_Document d'identité visuelle Oyko. Toute déviation doit être justifiée et documentée. Le compromis est l'ennemi de l'identité._

# Propositions de corrections Backend — Intégration Frontend

> Ce document recense les points identifiés lors des tests d'intégration frontend ↔ backend. Il ne s'agit pas de directives mais de suggestions à valider avec le code backend. Certains points pourraient être des choix intentionnels côté backend.

---

## 1. Dashboard — Patrimoine `totalActifs` ne prend pas en compte les comptes bancaires

### Constat

Après onboarding avec 2 comptes (Compte courant 2 450 € + Livret A 3 000 €), le dashboard retourne :

```json
"patrimoine": {
    "totalActifs": 0,
    "totalDettes": 0,
    "valeurNette": 0
}
```

### Analyse du code

Dans `DashboardService.java`, le calcul semble ne prendre en compte que les investissements :

```java
var investments = investmentService.listInvestments(userId);
long totalAssets = investments.stream().mapToLong(i -> i.currentValueCents()).sum();
```

Les soldes des comptes bancaires (`Account.currentBalanceCents()`) ne seraient pas inclus dans `totalAssets`. Est-ce que ce serait un oubli ?

### Proposition

Il faudrait peut-être additionner les comptes et les investissements :

```java
var accounts = accountService.listAccounts(userId);
var investments = investmentService.listInvestments(userId);

long totalAccountsCents = accounts.stream()
    .mapToLong(a -> a.currentBalanceCents())
    .sum();
long totalInvestmentsCents = investments.stream()
    .mapToLong(i -> i.currentValueCents())
    .sum();
long totalAssets = totalAccountsCents + totalInvestmentsCents;
```

À confirmer : est-ce que le patrimoine côté dashboard était intentionnellement limité aux investissements, ou est-ce que les comptes devraient être inclus ?

---

## 2. Budget — Enveloppes vides malgré l'onboarding

### Constat

Après l'onboarding qui crée 3 enveloppes (Alimentation 400€, Transport 100€, Loisirs 150€), le budget retourne :

```json
"enveloppes": []
```

### Analyse

Le `BudgetService` filtre correctement les catégories :

```java
var categories = categoryService.listCategories(userId).stream()
    .filter(c -> !c.income() && c.monthlyBudgetCents() != null)
    .toList();
```

La condition `monthlyBudgetCents() != null` est logique. L'onboarding frontend envoie bien `{ budgetMensuel: 400 }` via `PUT /api/v1/categories/{id}`.

Deux hypothèses possibles :

**Hypothèse A** — L'onboarding frontend met à jour les mauvaises catégories. Il récupère les catégories système via `GET /categories` et essaie de trouver "Alimentation" par nom. Si le matching échoue (ex: la catégorie système s'appelle "Alimentation" mais le match est case-sensitive ou avec accent), le PUT n'est jamais appelé.

**Hypothèse B** — Le `PUT /categories/{id}` accepte `budgetMensuel` et le convertit correctement, mais quelque chose empêche la persistance. Peut-être que les catégories système (`system = true`) ne sont pas modifiables ?

### Vérifications suggérées

1. Vérifier que le `CategoryResource.updateCategory()` autorise la modification des catégories système (ou que l'onboarding crée des catégories utilisateur)
2. Vérifier dans la base de données si `monthly_budget_cents` est bien persisté après un `PUT /categories/{id}` avec `{ budgetMensuel: 400 }`
3. Tester manuellement :

```bash
# Récupérer l'ID de la catégorie Alimentation
curl -s http://localhost:8080/api/v1/categories -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
for c in json.load(sys.stdin):
    if c['nom'] == 'Alimentation':
        print(c['id'], c.get('budgetMensuel'))
"

# Mettre à jour son budget
curl -X PUT http://localhost:8080/api/v1/categories/$CAT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budgetMensuel": 400}'

# Vérifier que le budget est persisté
curl -s "http://localhost:8080/api/v1/budget?month=4&year=2026" -H "Authorization: Bearer $TOKEN"
```

---

## 3. Recurring Charges — Champ `actif` vs `estActif`

### Constat

Le `RecurringChargeResponse.java` retourne le champ :

```java
boolean actif
```

Le frontend attendait initialement `estActif`. On a ajouté un fallback côté frontend (`raw.estActif ?? raw.actif`) pour gérer les deux, mais il serait plus propre d'avoir une convention unique.

### Question

Est-ce que `actif` est le nom définitif côté API ? Si oui, le frontend est déjà compatible (fallback en place). Si le backend préférait renommer en `estActif` pour être cohérent avec d'autres champs booléens de l'API (comme `estPreleve` dans le budget), ce serait plus homogène.

Pas bloquant — le frontend gère les deux noms.

---

## 4. Transaction types — Enum backend vs strings frontend

### Constat

Le backend `CreateTransactionRequest` attend un enum pour le type :

```
DEBIT, CREDIT, TRANSFER, FEE, INTEREST, REFUND, RECURRING, OTHER
```

Mais les réponses du backend (ex: `GET /transactions`) retournent le type en français :

```json
"type": "depense"
```

### Ce qui a été fait côté frontend

Le frontend convertit maintenant à l'envoi :
- `"depense"` → `"DEBIT"`
- `"revenu"` → `"CREDIT"`

Et à la réception, il accepte les deux conventions :
- `"DEBIT"` ou `"depense"` → traité comme dépense
- `"CREDIT"` ou `"revenu"` → traité comme revenu

### Question

Est-ce que cette asymétrie (enum à l'envoi, string en français au retour) est intentionnelle ? Si oui, c'est géré. Si c'était un oubli, unifier sur une seule convention simplifierait les choses.

---

## 5. Dashboard — Transactions avec champs réduits

### Constat

L'endpoint `/api/v1/dashboard` retourne les transactions avec un sous-ensemble de champs :

```json
{
    "id": "...",
    "description": "Carrefour Market",
    "montant": -42.3,
    "date": "2026-05-20"
}
```

Alors que `/api/v1/transactions` retourne :

```json
{
    "id": "...",
    "description": "Carrefour Market",
    "montant": -42.3,
    "dateTransaction": "2026-05-20",
    "categorieId": "...",
    "categorieNom": "Alimentation",
    "categorieIcone": "shopping-cart",
    "compteId": "...",
    "compteNom": "Compte courant",
    "type": "depense"
}
```

### Impact

Le frontend du dashboard essaie d'utiliser `type` et `categorieId` pour filtrer les transactions (variables vs fixes vs revenus). Comme ces champs sont absents du dashboard endpoint, le filtrage ne fonctionne pas correctement.

### Proposition

Serait-il possible d'ajouter au minimum `type` et `categorieId` dans la réponse des transactions du dashboard ? Les champs `categorieNom`, `categorieIcone`, `compteNom` seraient un bonus mais pas indispensables.

Un DTO intermédiaire pourrait être :

```java
public record DashboardTransactionResponse(
    UUID id,
    String description,
    BigDecimal montant,
    LocalDate date,
    String type,         // ajout
    UUID categorieId     // ajout
) {}
```

---

## Résumé

| # | Problème | Sévérité | Côté |
|---|---|---|---|
| 1 | Patrimoine totalActifs ignore les comptes | **Élevée** | Backend |
| 2 | Enveloppes vides après onboarding | **Élevée** | À investiguer (backend ou frontend onboarding) |
| 3 | `actif` vs `estActif` naming | Faible | Convention (géré côté frontend) |
| 4 | Transaction type enum vs string | Faible | Convention (géré côté frontend) |
| 5 | Dashboard transactions champs réduits | **Moyenne** | Backend DTO |

---

*Document généré le 21 mai 2026 suite aux tests d'intégration E2E. À discuter avec le backend avant toute modification.*

# Fix requis : Enveloppes vides après onboarding

## Contexte

Après l'onboarding, le frontend appelle `PUT /api/v1/categories/{id}` avec `{ "budgetMensuel": 400 }` sur les catégories système (Alimentation, Transport, Loisirs) pour leur assigner un budget. Mais l'appel retourne **404 "Category not found"**.

Les enveloppes restent vides dans le budget car aucune catégorie n'a de `monthlyBudgetCents` persisté.

## Cause racine

Dans `CategoryService.java` ligne 106-108, la méthode `findOwnedCategory` utilise :

```java
private CategoryModel findOwnedCategory(UUID userId, UUID categoryId) {
    return categoryRepository.findByIdAndUserId(categoryId, userId)
        .orElseThrow(() -> new NotFoundException("CATEGORY_NOT_FOUND", "Category not found"));
}
```

Et dans `CategoryRepository.java` ligne 16 :

```java
Optional<CategoryModel> findByIdAndUserId(UUID id, UUID userId);
```

Cette requête Spring Data JPA génère `WHERE id = :id AND user_id = :userId`. Or les catégories système ont `user_id = NULL` (elles ne sont la propriété d'aucun utilisateur). Donc `findByIdAndUserId` ne les trouve jamais.

Le `listCategories` fonctionne correctement car il utilise une autre requête (ligne 13) :

```java
@Query("SELECT c FROM CategoryModel c WHERE c.userId = :userId OR c.system = true ORDER BY c.sortOrder")
```

Mais `findOwnedCategory` ne bénéficie pas de cette logique.

## Fix proposé

Ajouter une méthode dans `CategoryRepository` qui cherche aussi les catégories système :

```java
@Query("SELECT c FROM CategoryModel c WHERE c.id = :id AND (c.userId = :userId OR c.system = true)")
Optional<CategoryModel> findByIdAndUserIdOrSystem(UUID id, UUID userId);
```

Puis dans `CategoryService.findOwnedCategory`, utiliser cette nouvelle méthode :

```java
private CategoryModel findOwnedCategory(UUID userId, UUID categoryId) {
    return categoryRepository.findByIdAndUserIdOrSystem(categoryId, userId)
        .orElseThrow(() -> new NotFoundException("CATEGORY_NOT_FOUND", "Category not found"));
}
```

## Impact

- `updateCategory` pourra trouver les catégories système → le budget sera persisté
- `deleteCategory` les trouvera aussi, mais le guard `if (model.isSystem()) throw ForbiddenException` empêche toujours leur suppression
- `updateCategory` autorise déjà la modification du budget sur les catégories système (guards individuels sur nom/icône/couleur), seul le `findOwnedCategory` bloquait

## Test à mettre à jour

Le test `CategoryServiceTest` mock `findByIdAndUserId` — il faudra aussi mocker la nouvelle méthode `findByIdAndUserIdOrSystem`. Ou renommer pour garder le même nom de méthode.

## Vérification

```bash
# Après le fix, avec un user onboardé :
TOKEN="..."
CAT_ID="e6c84918-..."  # ID de la catégorie Alimentation

# Doit retourner 200 (plus 404)
curl -X PUT http://localhost:8080/api/v1/categories/$CAT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budgetMensuel": 400}'

# Le budget doit apparaître
curl "http://localhost:8080/api/v1/budget?month=4&year=2026" \
  -H "Authorization: Bearer $TOKEN"
# → enveloppes: [{nom: "Alimentation", budgetMensuel: 400, ...}]
```

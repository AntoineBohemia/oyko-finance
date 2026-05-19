# Oyko : Décisions Techniques

> Document de référence des choix techniques pour le backend Oyko.
> Format : ADR (Architecture Decision Records) consolidé.
> Auteur : Antoine Moulin.

Pour chaque décision : le contexte, les alternatives évaluées, le choix retenu, les justifications, les conséquences (positives et négatives).

L'objectif n'est pas de prouver que le choix retenu est "le meilleur" dans l'absolu, mais de démontrer qu'il a été pris en connaissance de cause, en assumant ses trade-offs.

---

## 1. Fondations

### 1.1 Langage : Java

**Contexte.** Quel langage pour le backend Oyko, sachant que l'objectif est de servir une candidature alternance dans le secteur bancaire français ?

**Options considérées.**

- Java
- Kotlin (interopérable Java, plus moderne, moins verbeux)
- C# / .NET (langage de mon quotidien chez Silogis)
- Go (performant, simple, montant en banque)
- TypeScript / Node.js (cohérent avec mon front Next.js)

**Choix retenu.** Java.

**Justifications.**

- Java reste dominant en banque française, particulièrement chez SG, BNP, Natixis, BPCE, CA-TS.
- Mon expérience C# au quotidien rend la transition Java naturelle (concepts identiques : POO classique, typage fort, JIT, garbage collector).
- L'écosystème Spring couvrant OAuth2, DSP2, sécurité bancaire est plus mature en Java que dans les alternatives.
- L'objectif portfolio est explicitement de démontrer une compétence Java en construction.

**Conséquences.**

- Verbosité supérieure à Kotlin (boilerplate sur les POJO, getters/setters, mitigé par les records depuis Java 14).
- Compilation plus lente que Go.
- Écosystème immense, mature, documenté.

---

### 1.2 Version Java : Java 25 LTS

**Contexte.** Quelle version Java pour démarrer un nouveau projet en 2026 ?

**Options considérées.**

- Java 17 LTS (2021, encore très répandu en banque)
- Java 21 LTS (2023, Virtual Threads stables)
- Java 25 LTS (2025, dernière LTS)

**Choix retenu.** Java 25 LTS.

**Justifications.**

- Support Oracle assuré jusqu'en 2033, donc longévité du projet.
- Spring Initializr et Spring Boot 4 supportent Java 25 nativement depuis fin 2025.
- Java 21 sort de la phase free Oracle updates en septembre 2026, soit pendant la durée de l'alternance ciblée.
- Java 17 reste valide mais introduit une dette technique dès le démarrage.

**Conséquences.**

- Compact Object Headers réduisent l'usage du heap d'environ 22% en passant les headers d'objets de 12-16 octets à 8 octets.
- Virtual Threads gagnent en stabilité (utiles pour les appels concurrents à Bridge ou aux services externes).
- Pattern matching et records améliorent la lisibilité du code.
- Adoption en banque encore en cours mais le momentum est clair sur Java 21+.

---

### 1.3 Framework : Spring Boot

**Contexte.** Quel framework backend Java pour Oyko ?

**Options considérées.**

- Spring Boot 4 (l'incumbent en banque)
- Quarkus (alternative cloud-native, optimisée GraalVM)
- Micronaut (compile-time DI, similaire Quarkus)
- Java EE / Jakarta EE pur (sans framework de productivité)

**Choix retenu.** Spring Boot 4.

**Justifications.**

- Standard absolu en banque française. Toutes les offres alternance Java de SG, BNP, Natixis mentionnent Spring Boot, aucune ne mentionne Quarkus.
- Écosystème mature pour les besoins métier banque : Spring Security, Spring Data JPA, Spring OAuth2.
- Antoine étant débutant Java, concentrer l'effort d'apprentissage sur l'écosystème dominant plutôt que disperser.

**Conséquences.**

- Quarkus aurait été pertinent dans un contexte startup cloud-native (démarrage en millisecondes en native image, footprint mémoire réduit). Non bloquant pour Oyko qui est un service long-lived.
- Spring Boot a un cold start de plusieurs secondes.
- Réflexion runtime de Spring Boot consomme plus de mémoire que Quarkus compile-time, sans impact à mon échelle.
- Quarkus reste mentionnable comme veille technique (exposition via projets EPITA).

---

### 1.4 Build tool : Maven

**Contexte.** Quel outil de build pour le projet ?

**Options considérées.**

- Maven (XML descriptif, conventions strictes)
- Gradle (DSL Groovy ou Kotlin, plus flexible)

**Choix retenu.** Maven.

**Justifications.**

- Standard en banque française. Une amie chez BNP a confirmé que Maven y est utilisé en quasi-exclusivité.
- Convention sur configuration : un projet Spring Boot Maven est lisible immédiatement par n'importe quel dev Java.
- Pas de besoin spécifique de flexibilité que Gradle apporterait.

**Conséquences.**

- Configuration verbose (XML).
- Builds plus lents que Gradle sur des projets multi-modules très gros (non pertinent à mon échelle).
- Outillage IDE excellent.

---

### 1.5 Base de données : PostgreSQL

**Contexte.** Quel SGBD pour persister les données Oyko (users, comptes, transactions, budgets, patrimoine) ?

**Options considérées.**

- PostgreSQL (open source, riche)
- MySQL / MariaDB (open source, plus simple)
- Oracle (référence banque mais payant)
- MongoDB (NoSQL document, flexible)

**Choix retenu.** PostgreSQL.

**Justifications.**

- Référence open source pour les SGBD relationnels.
- Types riches utiles pour Oyko : JSONB (payload Bridge brut), arrays, types money natifs, UUID natif.
- Maturité éprouvée, support communautaire massif.
- Compatible avec les outils Spring Data JPA sans friction.

**Conséquences.**

- Pas d'Oracle (souvent demandé en banque), mais migration PostgreSQL vers Oracle reste possible si nécessaire car le schéma standard SQL est compatible à 95%.
- MongoDB aurait été inadapté : transactions financières par nature relationnelles (intégrité référentielle, transactions ACID).

---

## 2. Architecture

### 2.1 Style architectural : Monolithe modulaire

**Contexte.** Comment organiser le déploiement de l'application ? Un seul service, plusieurs services, fonctions séparées ?

**Options considérées.**

- Monolithe non modulaire (tout dans un package)
- Monolithe modulaire (une application, modules à frontières explicites)
- Microservices (services déployés séparément)
- Serverless / Functions-as-a-Service (chaque endpoint une fonction)

**Choix retenu.** Monolithe modulaire.

**Justifications.**

- Projet solo en apprentissage : la complexité opérationnelle des microservices (observabilité distribuée, déploiements multiples, transactions cross-service, contrats d'API entre services) est disproportionnée par rapport au gain.
- Le monolithe non modulaire est ingérable au-delà de quelques fichiers, impossibilité de raisonner sur des frontières claires.
- Le serverless est inadapté : Oyko est un service long-lived avec pool de connexions et jobs périodiques, le scale-to-zero n'apporte rien et ajoute du cold start et de la complexité.

**Conséquences.**

- Une seule unité de déploiement (simple).
- Frontières internes explicites par module (apprentissage architecture propre).
- Microservices recommandé pour app demandant scaling important avec divers équipes. Si Oyko devait scaler à plusieurs équipes, le module Bridge serait le candidat naturel à un extract en microservice, et la frontière propre rend cet extract mécanique.

---

### 2.2 Vérification d'architecture : ArchUnit

**Contexte.** Comment garantir que les règles d'architecture posées au démarrage du projet ne dérivent pas au fil du temps, particulièrement en travaillant seul sans peer review ?

**Options considérées.**

- Code reviews uniquement (impossible en solo)
- SonarQube (règles d'architecture externes au repo)
- Spring Modulith (vérification + features avancées comme events inter-modules)
- ArchUnit (tests d'architecture exécutés comme tests JUnit)

**Choix retenu.** ArchUnit.

**Justifications.**

- Les règles d'architecture deviennent des tests JUnit qui tournent à chaque build. Si quelqu'un (moi inclus) viole une règle, le build casse comme un test qui échoue.
- Solution mature (depuis 2017), mainstream Java, 6000+ stars GitHub.
- Règles versionnées avec le code, contrairement à Sonar qui vit dans une instance externe.
- Mécanisme self-discipline pour un dev solo qui peut dériver sous pression.

**Règles concrètement mises en place.**

- Architecture en couches : les controllers ne peuvent pas accéder directement aux repositories, ils passent obligatoirement par un service.
- Isolation des modules : le module budget ne peut pas dépendre du module bridge, et inversement.
- Pas de cycles entre modules.
- Conventions de nommage : classes annotées @Service finissent par "Service", classes annotées @RestController finissent par "Controller".
- Interdictions techniques : pas de java.util.Date au profit de java.time, pas de System.out au profit de SLF4J.

**Conséquences.**

- Coût initial : écrire 8 à 12 règles au démarrage.
- Coût récurrent : nul tant que l'architecture ne change pas, faible quand on l'adapte.
- Documentation exécutable : les règles d'architecture vivent dans le code et ne peuvent pas dériver de la réalité.

---

### 2.3 Découpage en modules : par feature métier

**Contexte.** Comment découper le code en modules ?

**Options considérées.**

- Découpage par couche technique (tous les controllers ensemble, tous les services ensemble, etc.)
- Découpage par feature métier (un module = un domaine fonctionnel)

**Choix retenu.** Découpage par feature.

**Modules.**

- `auth/` : authentification, gestion des sessions, JWT
- `account/` : comptes bancaires (un user a plusieurs comptes)
- `transaction/` : transactions bancaires (budget par enveloppes)
- `budget/` : règles budgétaires, enveloppes mensuelles
- `bridge/` : intégration de l'agrégateur Open Banking
- `patrimony/` : patrimoine global (liquidités, investissements, dettes)
- `shared/` : éléments transversaux uniquement

**Justifications.**

- Cohésion forte par domaine métier : tout ce qui concerne le budget est dans `budget/`, peu importe que ce soit un controller, un service ou un repository.
- Frontières claires entre domaines : un développeur travaillant sur le budget n'a pas à naviguer dans les controllers des autres modules pour comprendre.
- Modularité réelle : ArchUnit peut imposer que les modules ne se dépendent pas cycliquement.
- Préparation à une éventuelle extraction microservice : chaque module a une frontière nette.

**Conséquences.**

- Risque de duplication si on partage trop tardivement (mitigé par `shared/`).
- Lisibilité immédiate de la cartographie fonctionnelle du projet en regardant l'arborescence.

---

### 2.4 Module `shared/` : Shared Kernel discipliné

**Contexte.** Certains concepts sont vraiment transverses à tous les modules. Comment les gérer sans tomber dans un fourre-tout ?

**Contenu strict autorisé dans `shared/`.**

- `money/` : Value objects Money et Currency, utilisés par account, transaction, budget, patrimony.
- `exception/` : Exceptions techniques communes (BusinessException, NotFoundException, ValidationException).
- `result/` : Result types pour les retours de service (Result<T, Error>).
- `audit/` : Annotations et listeners JPA pour @CreatedDate, @LastModifiedDate.

**Justifications.**

- Le pattern Shared Kernel est explicitement reconnu en DDD (Eric Evans). C'est l'un des huit patterns stratégiques officiels.
- Money est un value object stable, utilisé dans 5+ modules. Le dupliquer ouvrirait des bugs d'arrondi ou de conversion.
- Les exceptions communes évitent la duplication des hiérarchies d'erreurs.

**Règles d'admission dans `shared/`.** Pour qu'une classe rentre, elle doit valider les 4 critères :

1. Universalité : utilisée par au moins 3 modules.
2. Stabilité : change rarement.
3. Cohésion : c'est une primitive technique ou domaine pur, pas un mix de concepts.
4. Absence de logique métier spécifique à un module.

**Conséquences.**

- Discipline d'usage requise. Sans ces règles, `shared/` devient un fourre-tout.
- Vérification ArchUnit possible : "aucune classe de shared/ ne peut dépendre d'un module métier".

---

### 2.5 Organisation des couches : 4 couches explicites

**Contexte.** Au sein d'un module, comment organiser les couches internes ?

**Options considérées.**

- Couches techniques flat (Controller / Service / Repository à plat)
- Architecture hexagonale pure (domain au centre, ports et adapters)
- 4 couches explicites (Presentation / Domain / Data / Converter)

**Choix retenu.** 4 couches explicites, avec séparation Entity (domaine) / Model (data) puriste.

**Structure type d'un module.**

```
auth/
├── presentation/
│   ├── api/
│   │   ├── request/
│   │   │   ├── LoginRequest.java
│   │   │   └── RegisterRequest.java
│   │   └── response/
│   │       ├── UserResponse.java
│   │       └── TokenResponse.java
│   └── rest/
│       └── AuthResource.java
├── domain/
│   ├── service/
│   │   └── AuthService.java
│   └── entity/
│       └── User.java               (POJO métier pur, sans JPA)
├── data/
│   ├── model/
│   │   └── UserModel.java          (annoté @Entity, @Table, @Column)
│   └── repository/
│       └── UserRepository.java     (interface Spring Data JPA)
└── converter/
    └── UserConverter.java          (mapping Entity ↔ Model)
```

**Justifications.**

- Convention enseignée à l'école et utilisée dans l'écosystème BNP (validée par une alternante BNP).
- Séparation rigoureuse Entity (domaine pur, sans dépendance JPA) / Model (persistance avec annotations Hibernate). Le domaine peut survivre à un changement d'ORM.
- Le converter explicite le rôle de conversion, qui est central et souvent négligé.

**Alternative écartée : architecture hexagonale pure.**

- L'hexagonal complet impose des ports (interfaces) en entrée et sortie, des adapters concrets, et une inversion stricte des dépendances. Domain au centre, ports d'entrée (controllers), ports de sortie (repositories).
- Coût d'organisation important : pour chaque module, plus d'interfaces, plus de fichiers de mapping.
- Bénéfice marginal en solo : le découplage du framework ne se monétise que si on change vraiment d'infrastructure, ce qui n'est pas planifié à 12-18 mois.

**Esprit hexagonal conservé localement où ça compte.**

- Le client Bridge est isolé derrière une interface `BankAggregatorClient` dans le module `bridge`, avec une implémentation `BridgeHttpClient`. Permet un swap vers GoCardless ou Powens.
- Les value objects (`Money`, `IBAN`) sont du domaine pur, sans annotation JPA, convertis vers la persistance via `AttributeConverter`.

**Conséquences.**

- Plus de classes (Entity + Model + Converter) que dans un Spring Boot mainstream qui fusionne souvent les deux.
- Tests unitaires plus simples sur le domaine (pas besoin de JPA).
- Lisibilité immédiate pour un dev BNP/SG qui connaît la convention.

---

## 3. Persistance

### 3.1 ORM : Spring Data JPA + Hibernate

**Contexte.** Comment persister les entités en base ?

**Options considérées.**

- Spring Data JPA + Hibernate (l'ORM standard Java)
- jOOQ (générateur SQL typé, plus proche du SQL natif)
- MyBatis (mapping SQL manuel, contrôle fin)
- JDBC direct (sans ORM)

**Choix retenu.** Spring Data JPA + Hibernate.

**Justifications.**

- Standard absolu en banque. Toutes les offres SG/BNP mentionnent JPA/Hibernate.
- Productivité élevée : repositories générés automatiquement par convention de nommage.
- Mapping objet-relationnel mature, écosystème massif.
- Génération de schéma au démarrage en dev, migrations Flyway en prod.
- Requêtes dérivées de signatures de méthodes, @Query JPQL pour cas complexes.

**Conséquences et risques connus.**

- **N+1 queries** : si on itère sur une collection et qu'on accède à une relation lazy à chaque itération, l'ORM fait N+1 requêtes au lieu d'une. À surveiller avec des fetch joins explicites.
- **Lazy loading mal géré** : si on accède à une relation après la fermeture de la session JPA, on déclenche `LazyInitializationException`. À gérer par DTO projection au niveau du service.
- **Dirty checking** : toute modification d'entité managed déclenche un UPDATE au commit, même non explicite. Comportement à comprendre pour éviter les surprises.
- Boilerplate sur les requêtes complexes, mitigé par @Query JPQL ou Specifications JPA.

---

### 3.2 Migrations de schéma : Flyway

**Contexte.** Comment gérer l'évolution du schéma de base au fil des versions ?

**Options considérées.**

- Flyway (versions SQL séquentielles)
- Liquibase (versions XML/YAML, plus flexible)
- Génération auto Hibernate (`ddl-auto: update`)

**Choix retenu.** Flyway.

**Justifications.**

- Standard en banque.
- SQL natif lisible, pas de DSL intermédiaire.
- Versionning séquentiel strict, prévisible.
- Permet de désactiver totalement `ddl-auto` en prod (anti-pattern dangereux).

**Conséquences.**

- Pas de rollback automatique des migrations (à gérer manuellement si besoin).
- Discipline requise : une migration appliquée en prod ne se modifie plus.

---

### 3.3 Pool de connexions : HikariCP

**Choix retenu.** HikariCP, par défaut dans Spring Boot.

**Justifications.**

- Pool par défaut Spring Boot depuis 2.0.
- Performances reconnues, monitoring intégré.
- Aucune raison de chercher une alternative.

---

## 4. API et exposition

### 4.1 Style d'API : REST

**Contexte.** Quel style d'API exposer au front Next.js ?

**Options considérées.**

- REST (HTTP verbs + ressources)
- GraphQL (un endpoint, requêtes typées côté client)
- gRPC (binaire, performant, plus complexe)

**Choix retenu.** REST.

**Justifications.**

- Standard universel, écosystème énorme.
- Simplicité, lisibilité des endpoints dans les logs.
- Pas de besoin de flexibilité côté client justifiant GraphQL pour Oyko V1.
- Cohérent avec ce qui est attendu en banque.

**Conséquences.**

- Sur-fetching possible (le front récupère des champs non utilisés). Mitigé par des DTO de réponse adaptés.
- Versioning d'API à anticiper (préfixe `/api/v1/`).

---

### 4.2 Documentation d'API : OpenAPI via springdoc

**Choix retenu.** springdoc-openapi.

**Justifications.**

- Génération automatique de la documentation à partir des annotations Spring.
- Swagger UI intégré pour explorer l'API en dev.
- Format OpenAPI 3 standard, exportable pour génération de clients.

**Conséquences.**

- Annotations supplémentaires sur les controllers pour les descriptions précises.

---

### 4.3 Validation des entrées : Jakarta Bean Validation

**Choix retenu.** Bean Validation via annotations (@Valid, @NotNull, @Size, @Email, etc.).

**Justifications.**

- Standard Java, intégré Spring Boot.
- Validation déclarative au niveau du DTO, pas du controller.
- Erreurs structurées au format Problem Details automatiquement.

---

### 4.4 Gestion des erreurs : RFC 7807 Problem Details

**Contexte.** Quel format pour les réponses d'erreur ?

**Options considérées.**

- Format maison (exception + statut HTTP + message)
- Problem Details RFC 7807

**Choix retenu.** Problem Details.

**Justifications.**

- Standard moderne, supporté nativement par Spring Boot 3+.
- Structure prévisible côté client : `type`, `title`, `status`, `detail`, `instance`.
- Extensible (champs custom autorisés).

**Conséquences.**

- Mise en place via `@ControllerAdvice` et `@ExceptionHandler`.
- Lisibilité des erreurs côté front améliorée.

---

## 5. Sécurité

### 5.1 Authentification : JWT (access + refresh)

**Contexte.** Comment authentifier les utilisateurs entre le front Next.js et le backend Spring ?

**Options considérées.**

- Sessions HTTP classiques (stateful)
- JWT stateless (access token + refresh token)
- OAuth2 délégué à un provider externe (Auth0, Keycloak)

**Choix retenu.** JWT, avec access token court et refresh token persisté.

**Architecture.**

- Access token JWT signé HS256 ou RS256, durée 15 minutes, contient le user id et les rôles.
- Refresh token UUID stocké en base (table `refresh_tokens`), durée 7 jours, révocable.
- Endpoint `/auth/refresh` pour échanger un refresh token contre un nouveau couple.

**Justifications.**

- Stateless côté serveur, scalable horizontalement.
- Simplicité pour V1 (pas de dépendance externe).
- Cohérent avec les architectures web modernes.

**Conséquences.**

- Révocation d'un access token impossible (mitigée par sa courte durée de vie).
- Stockage du refresh token en base permet une révocation contrôlée.
- Migration vers Keycloak ou Auth0 possible plus tard si besoin de fédération.

---

### 5.2 Hashing des mots de passe : bcrypt

**Choix retenu.** bcrypt via `BCryptPasswordEncoder` de Spring Security.

**Justifications.**

- Intégré nativement à Spring Security.
- Coût ajustable (workload factor), valeur par défaut adéquate.
- Standard éprouvé depuis 1999.

**Alternatives.** Argon2 est plus moderne (gagnant Password Hashing Competition 2015), mais bcrypt reste largement suffisant et plus simple à intégrer dans Spring.

---

### 5.3 Framework de sécurité : Spring Security

**Choix retenu.** Spring Security avec filter chain configurée pour JWT.

**Justifications.**

- Standard absolu en Spring Boot.
- Couvre l'authentification, l'autorisation, CSRF, CORS, headers de sécurité.
- Annotations `@PreAuthorize` pour les autorisations méthode.

**Conséquences.**

- Courbe d'apprentissage significative.
- Configuration explicite requise (pas de magie cachée).

---

### 5.4 Gestion des secrets

**V1.** Variables d'environnement, fichier `.env` en dev (jamais commité), variables Railway en prod.

**Secrets concernés.** Clé de signature JWT, credentials PostgreSQL, secret_id et secret_key Bridge, secret de chiffrement AES pour les tokens Bridge.

**V2 envisagée.** HashiCorp Vault ou AWS Secrets Manager si déploiement multi-environnements.

---

## 6. Open Banking et intégration Bridge

### 6.1 Agrégateur bancaire : Bridge

**Contexte.** Quel agrégateur Open Banking pour synchroniser les transactions bancaires des utilisateurs ?

**Options considérées.**

- Bridge (français, AISP français, doc en français)
- GoCardless Bank Account Data ex-Nordigen (anglais, AISP Lettonie, plan gratuit 50 connexions/mois)
- Powens ex-Budget Insight (français, plus ancien sur le marché)
- Tink (européen, racheté par Visa)

**Choix retenu.** Bridge en premier choix, derrière une interface `BankAggregatorClient` permettant un swap.

**Justifications.**

- Ancrage français, signal positif pour candidature banque française.
- AISP régulé ACPR.
- Documentation native en français.
- Couverture banques françaises excellente.

**Alternative principale : GoCardless Bank Account Data.**

- Avantage technique : plan gratuit 50 connexions/mois (Bridge sandbox uniquement gratuit en mode dev).
- Avantage perso : permet de connecter ma vraie banque pour tester en conditions réelles.
- Possibilité concrète d'implémenter les deux derrière mon interface `BankAggregatorClient` pour démontrer la valeur du découplage.

---

### 6.2 Isolation du client : interface `BankAggregatorClient`

**Pattern.** Interface dans le module `bridge`, implémentations concrètes injectables.

```java
// Port défini par le domaine
public interface BankAggregatorClient {
    List<BankTransaction> fetchTransactions(String accountId, LocalDate since);
    void registerWebhook(String userId, String callbackUrl);
    BankAccount fetchAccount(String accountId);
}

// Adapter Bridge
@Component
public class BridgeHttpClient implements BankAggregatorClient { ... }

// Adapter GoCardless possible
@Component
public class GoCardlessHttpClient implements BankAggregatorClient { ... }
```

**Justifications.**

- Découplage du fournisseur. Si Bridge change ses conditions, augmente ses prix, ou ne supporte plus une banque, swap mécanique.
- Démontre la valeur concrète de l'isolation hexagonale là où elle compte vraiment.
- Mock trivial en test (`FakeBankAggregatorClient`).

---

### 6.3 Client HTTP : WebClient

**Contexte.** Comment appeler l'API Bridge depuis Spring Boot ?

**Options considérées.**

- RestTemplate (déprécié depuis Spring 5)
- WebClient (Spring WebFlux, async-compatible)
- Apache HttpClient direct
- OkHttp

**Choix retenu.** WebClient.

**Justifications.**

- Moderne, supporté Spring.
- API fluent lisible.
- Compatible appels synchrones et asynchrones.
- Configurable (timeouts, retry, circuit breaker via Resilience4j).

---

### 6.4 Webhooks Bridge : signature HMAC vérifiée

**Pattern.** Vérification HMAC-SHA256 de chaque webhook reçu, en comparaison timing-safe (évite les attaques par timing).

```java
boolean isValid = MessageDigest.isEqual(
    expectedSignature.getBytes(),
    receivedSignature.getBytes()
);
```

**Justifications.**

- Bridge signe chaque webhook avec un secret partagé. Sans vérification, n'importe qui peut envoyer de fausses notifications.
- Timing-safe comparison empêche un attaquant de deviner la signature byte par byte en mesurant le temps de réponse.

---

### 6.5 Idempotence des transactions importées

**Pattern.** Chaque transaction Bridge a un `external_id` unique. À l'import, vérification par `external_id` avant insertion : si existe déjà, on update au lieu d'insérer un doublon.

**Justifications.**

- Bridge peut renvoyer la même transaction plusieurs fois (retry, replay).
- Sans idempotence, doublons en base et bugs de calcul de solde.

---

### 6.6 Stockage chiffré des tokens Bridge

**Pattern.** Les access tokens et refresh tokens Bridge sont chiffrés en base avec AES-256-GCM. Clé en variable d'environnement.

**Justifications.**

- Exigence DSP2 sur la protection des données d'authentification.
- En cas de fuite de la base, les tokens restent inutilisables sans la clé.
- AES-GCM offre confidentialité et authenticité (anti-tampering).

---

## 7. Observabilité

### 7.1 Logs : SLF4J + Logback

**Choix retenu.** SLF4J comme façade, Logback comme implémentation (défaut Spring Boot).

**Format.** JSON structuré en prod via `logstash-logback-encoder`, lisible humain en dev.

**Justifications.**

- Standard Spring Boot.
- JSON structuré facilite l'ingestion par les outils centralisés (ELK, Datadog).
- MDC (Mapped Diagnostic Context) pour injecter le user id et request id dans chaque log.

---

### 7.2 Métriques : Micrometer + Prometheus

**Choix retenu.** Micrometer (intégré Spring Boot Actuator), endpoint `/actuator/prometheus`.

**Métriques exposées.**

- JVM (heap, GC, threads).
- HTTP (request count, latence p50/p95/p99 par endpoint).
- Database (pool HikariCP, query duration).
- Custom (transactions importées par minute, échecs Bridge).

**Justifications.**

- Standard de fait pour les métriques applicatives.
- Compatible avec Grafana pour visualisation.

---

### 7.3 Tracing distribué : reporté V2

**V1.** Pas de tracing distribué (Oyko est monolithe, peu d'intérêt).

**V2 si extraction microservices.** OpenTelemetry avec backend Tempo ou Jaeger.

---

## 8. Tests

### 8.1 Tests unitaires : JUnit 5 + AssertJ + Mockito

**Choix retenu.** Stack standard moderne Java.

**Périmètre.** Tests unitaires sur la logique métier des services, sans Spring. Mockito pour mocker les dépendances.

**Justifications.**

- JUnit 5 est la version courante (Jupiter API).
- AssertJ pour les assertions fluent lisibles.
- Mockito pour les mocks et stubs.

---

### 8.2 Tests d'intégration : Testcontainers + PostgreSQL réel

**Contexte.** Comment tester les requêtes JPA dans des conditions proches de la prod ?

**Options considérées.**

- H2 en mémoire (rapide, mais comportement différent de PostgreSQL)
- PostgreSQL local (impose une installation préalable)
- Testcontainers (PostgreSQL réel dans un container Docker éphémère)

**Choix retenu.** Testcontainers.

**Justifications.**

- PostgreSQL réel, même version qu'en prod.
- Container démarré et arrêté automatiquement.
- Pas de divergence H2 vs PG sur les types spécifiques (JSONB, arrays).

**Conséquences.**

- Tests plus lents que H2 (démarrage du container).
- Nécessite Docker installé localement et en CI.

---

### 8.3 Mocks externes : WireMock

**Choix retenu.** WireMock pour mocker l'API Bridge dans les tests.

**Justifications.**

- Permet de simuler les réponses Bridge sans appel réseau.
- Reproductibilité des tests (pas de dépendance à la disponibilité Bridge).
- Possibilité de tester les cas d'erreur (timeouts, 500, payloads invalides).

---

### 8.4 Tests d'architecture : ArchUnit

Voir section 2.2.

---

### 8.5 Politique de couverture

Pas de seuil de couverture imposé. Focus sur la qualité des tests aux endroits sensibles (services métier, gestion d'erreur, sécurité) plutôt que sur un pourcentage à atteindre.

---

## 9. Documentation

### 9.1 README projet

Setup local, prérequis, commandes Maven, lancement en dev, structure des dossiers, variables d'environnement requises.

### 9.2 ADR (Architecture Decision Records)

Ce document consolidé sert d'ADR initial. Les décisions futures importantes feront l'objet d'ADR séparés dans `docs/adr/`.

### 9.3 Documentation API : OpenAPI

Voir section 4.2. Endpoint Swagger UI disponible en dev sur `/swagger-ui.html`.

### 9.4 Javadoc

Javadoc minimal sur les classes et méthodes publiques de l'API. Pas de Javadoc verbeux sur le code interne.

---

## 10. Déploiement

### 10.1 Containerisation : Docker multi-stage

**Pattern.**

```dockerfile
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre
COPY --from=build /app/target/oyko-*.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Justifications.**

- Image finale légère (sans Maven, sans sources).
- Sécurité : moins de surface d'attaque que jdk en runtime.

---

### 10.2 CI : GitHub Actions

**Pipeline.**

- Build Maven, exécution tests unitaires.
- Tests d'intégration avec Testcontainers.
- Build image Docker.
- Publication sur ghcr.io sur tag.

---

### 10.3 Hébergement V1 : Railway

**Choix retenu.** Railway pour la simplicité (build à partir d'un repo GitHub, PostgreSQL managé inclus, variables d'env via UI).

**V2 envisagée.** Fly.io (régions Europe, plus configurable) ou Cloud Run si scaling significatif.

---

## 11. Conventions transverses

### 11.1 Style de code : Google Java Style

**Choix retenu.** Google Java Style Guide, appliqué via Spotless.

### 11.2 Format automatique : Spotless

**Choix retenu.** Plugin Maven Spotless avec configuration `google-java-format`. Format automatique à chaque commit via hook Git, vérifié en CI.

### 11.3 Lint : Checkstyle + Error Prone

**Choix retenu.** Checkstyle pour les conventions, Error Prone pour les bugs subtils détectables à la compilation.

---

## 12. Décisions reportées (hors scope V1)

Décisions explicitement repoussées, à reconsidérer si Oyko évolue.

- **CQRS / Event Sourcing** : non pertinent à l'échelle actuelle.
- **Messaging (Kafka, RabbitMQ)** : pas de besoin de découplage asynchrone en monolithe.
- **Multi-tenant** : Oyko est mono-utilisateur par instance pour l'instant.
- **GraphQL** : REST suffit largement.
- **Cache distribué (Redis)** : cache local Spring suffit pour V1.
- **Recherche full-text avancée (Elasticsearch)** : non requis sur le scope V1.
- **Internationalisation (i18n)** : français uniquement pour V1.
- **Architecture hexagonale complète** : adoptée seulement sur l'intégration Bridge (voir 2.5).
- **Migration vers microservices** : envisageable si scaling impose un découplage opérationnel.

---

## 13. Synthèse défendable en entretien

Si on me demande de résumer les choix techniques d'Oyko en 90 secondes, voici la trame.

> "Oyko est un backend Java 25 / Spring Boot 4, structuré en monolithe modulaire avec six modules métier découpés par feature. Persistance PostgreSQL via Spring Data JPA et Hibernate, migrations Flyway. Sécurité par Spring Security avec JWT access et refresh, mots de passe en bcrypt. L'intégration Open Banking se fait via Bridge, isolé derrière une interface `BankAggregatorClient` qui permet un swap éventuel vers GoCardless ou Powens sans toucher au métier. Les tests s'appuient sur JUnit, Testcontainers pour PostgreSQL réel, WireMock pour mocker Bridge, et ArchUnit pour automatiser la vérification des règles d'architecture. Déploiement containerisé via GitHub Actions sur Railway pour V1. Chaque choix a été pris en comparant explicitement les alternatives, et les décisions hors scope V1 comme Kafka, CQRS, ou microservices sont documentées comme reportées."

Cette synthèse couvre tout, démontre la cohérence du système et signale la maturité d'avoir documenté ce qu'on n'a pas pris.

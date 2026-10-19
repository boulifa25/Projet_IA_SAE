# Scénarios de test — Modules IA (StageIO)

Scénarios couvrant les 7 modules IA de la plateforme : analyse de rapport, matching CV/offres, assistant conversationnel, synthèse de parcours, pré-sélection de candidatures, pertinence des conventions, détection d'écart d'évaluation.

- Moteur : Groq (`openai/gpt-oss-120b`), quota gratuit ~1000 req/jour (migré depuis Gemini le 13/10/2026, quota bien plus confortable).
- Backend : `localhost:8081` · Frontend : `localhost:5173`.
- Comptes de test (mot de passe `TestIA2026!` sauf admin) : `azizboulifa25@gmail.com` (étudiant), `sarra.zouari@gmail.com` (enseignant, spécialité Data & IA), `omar.zemni@gmail.com` (sopra steria), `aymen.benabdallah@gmail.com` (Google), `emma.dubois@test.fr` (PixelCraft), `admin@stageia.local` / `ChangeMe123!`.
- Données réelles de la base au 16/10/2026 (adaptez les comptes/IDs si la base a changé depuis).

---

## Module 1 — Analyse de rapport (résumé, risque de décrochage, conseil)

Déclenchée en arrière-plan (asynchrone, ~5–15 secondes) à chaque dépôt de rapport par un étudiant en stage. Produit un résumé + ton perçu, un niveau de risque justifié, et un conseil personnalisé. Visible côté étudiant dans **Mon stage**, côté enseignant dans **Suivi IA**.

- Compte étudiant à utiliser : `azizboulifa25@gmail.com` (stage EN_COURS chez sopra steria)
- Enseignant référent pour vérifier les alertes : `sara.zouari@gmail.com`

### 1.1 — Rapport positif → risque attendu : faible

1. Connectez-vous avec `azizboulifa25@gmail.com`.
2. **Mon stage** → Déposer un rapport.
3. Type : Intermédiaire, titre libre. Collez le commentaire ci-dessous, joignez n'importe quel PDF, déposez.
4. Patientez ~15s (pas d'indicateur de chargement, c'est normal) puis rechargez la page **Mon stage**.

> « Ce mois-ci j'ai terminé l'intégration de l'API de paiement et commencé les tests unitaires. L'équipe est très accueillante, je progresse bien sur Spring Boot et je suis confiant pour la suite. »

**Résultat attendu** : un nouveau conseil personnalisé apparaît dans « Mon stage ». Reconnectez-vous avec `sara.zouari@gmail.com` → **Suivi IA** : ce stage doit porter un badge **Risque faible** (vert).

### 1.2 — Rapport de décrochage → risque attendu : élevé

Même compte, nouveau dépôt de rapport (Intermédiaire).

> « Je suis bloqué depuis deux semaines sur la configuration du serveur, personne ne répond à mes messages, je ne sais plus comment avancer et j'envisage sérieusement d'arrêter ce stage. »

**Résultat attendu** : côté `sara.zouari@gmail.com` → **Suivi IA**, le stage remonte en tête de liste (trié par risque décroissant) avec un badge **Risque élevé** (rouge) et une justification qui porte sur l'isolement/le blocage persistant — pas sur une simple difficulté technique ponctuelle.

### 1.3 — Rapport sans commentaire (PDF seul)

Déposez un rapport en laissant le champ commentaire vide.

**Résultat attendu** : l'IA produit quand même une analyse, basée uniquement sur les métadonnées (jours depuis le début du stage, délai depuis le rapport précédent, messages échangés). Pas d'erreur, conseil plus générique.

### 1.4 — Résilience : un échec IA ne doit jamais bloquer le dépôt

Non déclenchable à la demande, mais garanti par le code (le bloc d'analyse est dans un `try/catch` silencieux) : si aucun conseil n'apparaît après plusieurs minutes, le rapport reste déposé et visible normalement. À surveiller plutôt qu'à provoquer.

---

## Module 2 — Matching CV / offres

Calculé en temps réel (synchrone) à chaque ouverture de **Offres de stage** par un étudiant. Un seul appel IA compare son profil (filière, promotion) à toutes les offres publiées et renvoie un score 0–100 par offre.

Offres publiées actuelles : *Test* (filière Info) · *UX Designer* (Design) · *full stack developper* (informatique) · *Développeur front-end* (informatique).

### 2.1 — Filière technique proche → scores élevés attendus

Connectez-vous avec `lucas.martin@etu.fr` (filière Informatique) ou `azizboulifa25@gmail.com` (Génie logiciel) → **Offres de stage**.

**Résultat attendu** : les badges de score (chargés avec un léger délai après la liste) classent *full stack developper* et *Développeur front-end* en tête (vert, ≥70), *UX Designer* nettement plus bas.

### 2.2 — Filière éloignée → scores faibles attendus

Aucun compte « Design » n'existe actuellement → créez-en un via **Inscription** (rôle Étudiant, filière « Design »).

**Résultat attendu** : seul *UX Designer* ressort avec un bon score ; les 3 offres techniques restent basses.

### 2.3 — Étudiant sans filière renseignée

Inscrivez un étudiant en laissant le champ filière vide (optionnel).

**Résultat attendu** : l'IA reçoit « filière : non renseignée ». Scores globalement bas/moyens sur toutes les offres, pas d'erreur ni de page bloquée.

### 2.4 — Aucune offre publiée

Non déclenchable sans clôturer les offres existantes (déconseillé). Garanti par le code : liste d'offres vide → retour immédiat d'une liste vide, aucun appel IA déclenché.

---

## Module 3 — Assistant conversationnel (chatbot)

Bulle flottante disponible sur tout l'espace connecté. Contexte personnalisé injecté selon le rôle, conversation multi-tours (mémoire conservée côté navigateur, perdue au rechargement).

### 3.1 — Question procédurale générale (tout rôle)

> « Comment se déroule le processus entre le dépôt d'une candidature et le démarrage du stage ? »

**Résultat attendu** : réponse claire — candidature → acceptation → convention → double validation (enseignant + admin) → création du stage.

### 3.2 — Données personnelles + mémoire conversationnelle (étudiant)

Connectez-vous avec `azizboulifa25@gmail.com`, posez les deux questions à la suite dans la même conversation :

1. « Quel est le statut de ma convention ? »
2. « Et mon entreprise d'accueil, c'est qui déjà ? »

**Résultat attendu** : réponses exactes (référence de convention, « sopra steria »). La 2ᵉ question doit être comprise sans recontexte — preuve que l'historique est bien renvoyé à chaque appel.

### 3.3 — Données personnelles (entreprise)

Compte entreprise dont vous connaissez le mot de passe (ex. sopra steria).

> « Combien de candidatures ai-je reçues sur mon offre full stack developer, et combien sont encore en attente ? »

**Résultat attendu** : chiffres exacts (actuellement 2 reçues, 1 acceptée, 1 en attente).

### 3.4 — Données personnelles (enseignant)

Compte enseignant (ex. `julie.bernard@ecole.fr`, `sara.zouari@gmail.com`).

> « Est-ce que j'ai des étudiants à risque en ce moment ? »

**Résultat attendu** : réponse cohérente avec les alertes réellement présentes dans Suivi IA pour les stages encadrés par ce compte.

### 3.5 — Vue globale (admin)

`admin@stageia.local` / `ChangeMe123!`

> « Combien d'entreprises partenaires et d'étudiants placés avons-nous actuellement ? »

**Résultat attendu** : chiffres cohérents avec le tableau de bord admin (actuellement 3 entreprises partenaires, 2 étudiants placés).

### 3.6 — Résilience : réponse IA invalide ou indisponible

Validé à plusieurs reprises (quota Gemini épuisé le 03/10, JSON tronqué par Groq le 16/10) : toute panne IA (quota, réseau, JSON malformé) renvoie désormais un message clair « service IA temporairement indisponible » (503), jamais un faux 401. À retester seulement en cas de régression suspectée.

---

## Module 4 — Synthèse automatique du parcours étudiant

Génère, à la demande, un résumé en 4 paragraphes (déroulement, points forts, points de vigilance, recommandation pour le jury) à partir de l'historique complet d'un stage (rapports + analyses IA déjà générées). Visible côté admin, sur une soutenance planifiée ou réalisée.

### 4.1 — Génération sur un stage avec historique riche

1. Connectez-vous avec `admin@stageia.local` / `ChangeMe123!`.
2. **Soutenances** → section « Soutenances planifiées » → trouvez la ligne d'**aziz boulifa** (Google, sujet « test ») → bouton **Synthèse IA**.
3. Patientez (~5s, indicateur de chargement visible cette fois).

**Résultat attendu** : un texte structuré qui mentionne le blocage technique initial (serveur, absence de réponse des tuteurs), le risque de décrochage détecté puis la récupération, les points forts (autonomie, documentation), et une suggestion pour le jury.

---

## Module 5 — Pré-sélection IA des candidatures (entreprise)

L'inverse du matching CV/offres : pour une offre donnée, l'IA note chaque candidature reçue en croisant filière de l'étudiant et contenu réel de la lettre de motivation.

### 5.1 — Candidatures de qualité très différente sur la même offre

1. Connectez-vous avec `emma.dubois@test.fr` (PixelCraft).
2. **Candidatures** → observez les badges de score à côté des deux candidatures d'aziz boulifa (offres « Test » et « UX Designer »).

**Résultat attendu** : un badge de score (%) apparaît à côté de chaque candidat, avec une raison au survol. Essayez aussi avec `omar.zemni@gmail.com` (sopra steria) ou `aymen.benabdallah@gmail.com` (Google) sur leurs propres offres pour comparer des lettres de motivation très soignées (vraies lettres rédigées) à des lettres test illisibles — l'écart de score doit être net.

---

## Module 6 — Pertinence des conventions pour l'enseignant

Quand un enseignant consulte les conventions en attente d'un référent, l'IA score chacune selon sa spécialité.

### 6.1 — Convention très alignée avec la spécialité

1. Connectez-vous avec `sarra.zouari@gmail.com` (spécialité **Data & IA**).
2. **Conventions** → section « en attente de validation » → la convention de **seif ayed** (Google, sujet autour des LLM/RAG/IA juridique) doit apparaître avec un badge de score élevé et une raison citant l'adéquation avec Data & IA.

**Résultat attendu** : la liste est triée par score décroissant, cette convention remonte en premier.

---

## Module 7 — Détection d'écart anormal entre évaluations

Quand l'administration finalise une soutenance, si la moyenne de l'enseignant et celle de l'entreprise diffèrent de plus de 4 points sur 20, l'IA explique l'écart à partir des commentaires de chaque évaluateur et notifie tous les administrateurs.

### 7.1 — Évaluations volontairement divergentes

Une soutenance est déjà planifiée pour le stage d'aziz boulifa chez Google (scénario 4.1).

1. Connectez-vous avec `sarra.zouari@gmail.com` → **Évaluation** → notez chaque critère haut (ex. 17-19/20) avec des commentaires élogieux.
2. Connectez-vous avec `aymen.benabdallah@gmail.com` (Google) → **Évaluation** → notez chaque critère bas (ex. 5-8/20) avec des commentaires critiques (ex. « manque d'autonomie », « livrables en retard »).
3. Connectez-vous avec `admin@stageia.local` → **Soutenances** → **Finaliser** sur cette soutenance.

**Résultat attendu** : la soutenance se finalise normalement (note moyenne calculée). Quelques secondes après, une **notification** apparaît pour l'administrateur (cloche en haut à droite) signalant l'écart, avec une explication générée par l'IA à partir des commentaires des deux évaluateurs.

### 7.2 — Pas d'écart anormal

Si les deux évaluateurs notent de façon cohérente (écart < 4 points), aucune notification n'est générée — comportement attendu, pas un bug.

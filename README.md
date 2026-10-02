# StageIA — Plateforme de gestion des stages avec suivi pédagogique IA

Plateforme complète de gestion de stages (offres, candidatures, conventions, suivi, soutenances, évaluation) avec un module d'intelligence artificielle qui analyse les rapports des étudiants, détecte les risques de décrochage et suggère les offres les plus pertinentes.

## Stack technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **Backend** : Spring Boot 4 (Java 17) + Spring Security (JWT) + Spring Data JPA
- **Base de données** : PostgreSQL (hébergé sur [Neon](https://neon.tech))
- **IA** : Google Gemini (API gratuite, sans carte bancaire)
- **Stockage fichiers** : disque local (CV, rapports, attestations générées)

## Architecture

Le backend suit un modèle MVC étendu : **Contrôleurs** → **Services** (dont les services IA, isolés et remplaçables) → **Repositories/Entités**. Le frontend a un espace dédié par rôle (`/app/etudiant`, `/app/entreprise`, `/app/enseignant`, `/app/admin`), chacun avec sa propre navigation.

## Prérequis

- [Node.js](https://nodejs.org) (18+)
- [Java 17](https://adoptium.net)
- Un compte [Neon](https://console.neon.tech) (gratuit) pour la base de données
- Une clé API [Google Gemini](https://aistudio.google.com/apikey) (gratuite, sans carte bancaire)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/boulifa25/Projet_IA_SAE.git
cd Projet_IA_SAE
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Remplissez `.env` avec :
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` : récupérés depuis votre dashboard Neon ("Connection string")
- `GEMINI_API_KEY` : récupérée sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

Puis lancez le serveur (il crée les tables automatiquement au démarrage) :

```bash
# Windows (PowerShell)
./run.ps1

# ou directement avec Maven wrapper
./mvnw spring-boot:run
```

Le backend démarre sur **http://localhost:8081**. Un compte administrateur est créé automatiquement au premier démarrage :
- Email : `admin@stageia.local`
- Mot de passe : `ChangeMe123!`

### 3. Frontend

Dans un autre terminal, à la racine du projet :

```bash
cp .env.example .env
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:5173**.

## Comptes

Aucun autre compte n'est pré-rempli : créez vos comptes de test via "Créer un compte" sur la page d'accueil, en choisissant un rôle (Étudiant, Enseignant ou Entreprise). Le compte Administrateur ne peut pas être créé via l'inscription publique — seul celui créé automatiquement existe (voir ci-dessus).

## Fonctionnalités principales

- **Authentification** par rôle (Étudiant / Enseignant / Entreprise / Administrateur), JWT
- **Offres & candidatures** : publication, recherche, candidature avec upload de CV
- **Conventions de stage** : génération automatique à l'acceptation d'une candidature, double validation (enseignant + administration)
- **Suivi de stage** : dépôt de rapports, messagerie entre étudiant/enseignant/entreprise
- **Soutenances & évaluation** : planification, grille de notation, génération automatique de l'attestation (PDF)
- **Module IA** : analyse automatique des rapports (résumé, ton, points bloquants), détection du risque de décrochage avec alerte à l'enseignant, conseils personnalisés à l'étudiant, et matching CV/offres par score de compatibilité

## Structure du projet

```
├── backend/          Spring Boot (API REST)
│   └── src/main/java/com/stageia/backend/
│       ├── controller/   Points d'entrée REST
│       ├── service/      Logique métier + services IA
│       ├── model/        Entités JPA
│       ├── repository/   Accès base de données
│       ├── dto/           Objets de transfert (dont dto/gemini, dto/ia)
│       └── security/     JWT, Spring Security
└── src/              Frontend React
    ├── pages/roles/      Pages par espace (étudiant/entreprise/enseignant/admin)
    ├── components/       Composants réutilisables
    ├── layouts/          Mise en page par rôle
    └── lib/              Client API, styles de statut
```

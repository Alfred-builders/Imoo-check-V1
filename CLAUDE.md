# ImmoChecker — Contexte Permanent Claude Code

> Ce fichier centralise toutes les informations necessaires au developpement de la webapp ImmoChecker.
> Derniere mise a jour : 26 mars 2026.

---

## 1. Vision Produit

**ImmoChecker** est un outil de creation d'etats des lieux (EDL) et d'inventaires pour l'immobilier. Le produit se compose d'une webapp back-office (admin/gestionnaire) et d'une app mobile/tablette (technicien terrain). **Ce fichier concerne uniquement la webapp.**

L'objectif est de remplacer Immopad, fiabiliser les donnees, fluidifier l'operationnel et preparer une commercialisation SaaS.

**ImmoChecker n'est PAS un logiciel de gestion locative.** L'occupation des logements n'est pas geree.

> Document de reference complet : `knowledge/notion/pages/vision-fonctionnelle-cible-immochecker-v1.md`

### 3 types de workspace

- **societe_edl** — Societe d'EDL (ex: FlatChecker). Cas le plus complexe : missions, techniciens, mandataires.
- **bailleur** — Bailleur direct. Simplifie : EDL sans mission possible, pas de mandataire.
- **agence** — Agence immobiliere. Gestion interne, onglet Mandataire masque.

### Perimetre webapp (Lot 1)

La webapp ne descend jamais en dessous du niveau EDL_Inventaire. Les donnees de saisie terrain (pieces, items, photos) sont consultables uniquement via le PDF/Web genere. Le back-office pilote et consulte, la tablette saisit.

---

## 2. Architecture de Donnees

> Document de reference complet : `knowledge/notion/pages/architecture-de-donnees-immochecker-v1.md`
> Attributs detailles par table : `knowledge/notion/pages/attributs-par-table-immochecker-v1.md`

### Couches du modele (28 tables)

- **Couche Auth** : Workspace, Utilisateur, WorkspaceUser (pivot)
- **Couche Tiers** : Tiers, TiersOrganisation (pivot), LotProprietaire (pivot), EDLLocataire (pivot)
- **Couche Patrimoine** : Batiment, AdresseBatiment, Lot, AccesLot, CompteurLot, ReleveCompteur, ValeurReleveCompteur
- **Couche Operationnelle** : Mission, MissionTechnicien (pivot), CleMission, IndisponibiliteTechnicien, EDL_Inventaire, PieceEDL, EvaluationItem, Photo
- **Couche Catalogue** : TypePiece, CatalogueItem, ValeurReferentiel, ConfigCritereCategorie, ConfigCritereItem, TemplatePieceItem (pivot)
- **Couche Preferences** : UserPreference

---

## 3. Decisions d'Architecture Cles

Ces decisions sont dispersees dans les EPICs et les docs de reference. Elles sont centralisees ici pour Claude Code.

### Separation Auth / Metier

- **Utilisateur** = personne authentifiee (identite humaine, auth JWT)
- **Tiers** = entite juridique/documentaire (proprietaire, locataire, mandataire)
- Pas de pont User <> Tiers : WorkspaceUser n'a PAS de `tiers_id`. La table Tiers est reservee aux stakeholders autour des lots.
- La societe realisatrice d'un EDL est derivee du **Workspace** (nom, SIRET, adresse), pas d'un Tiers.

### Roles portes par les relations

- Un Tiers n'est ni "proprietaire" ni "locataire" intrinsequement — c'est la FK qui qualifie le role.
- Un meme Tiers peut jouer plusieurs roles (proprio ET locataire).

### Tables pivots pour le N:N

- **WorkspaceUser** : user <> workspace (role)
- **TiersOrganisation** : personne physique <> personne morale (fonction)
- **LotProprietaire** : lot <> tiers proprietaire(s) (supporte indivision)
- **EDLLocataire** : EDL <> tiers locataire(s) (supporte colocation)
- **MissionTechnicien** : mission <> user technicien (1 en V1, pivot pour anticiper multi)
- **TemplatePieceItem** : type de piece <> catalogue item

### Multi-tenant

- Isolation par `workspace_id` sur toutes les tables metier.
- JWT avec gestion workspaces et permissions.
- 3 roles : Admin / Gestionnaire / Technicien.

### Patrimoine

- Structure : Batiment -> Lot (etage = simple champ du lot)
- Maison individuelle = 1 Batiment + 1 Lot
- `Lot.mandataire_id` -> Tiers : FK directe (1 seul mandataire par lot)
- `code_acces` migre vers EDL_Inventaire (change a chaque intervention)
- `num_cave`, `num_parking` restent sur le Lot (donnees stables)
- Compteurs : section retiree de la fiche lot — geres uniquement cote EDL tablette

### Templates & Catalogue

- Pas de table Section — la categorie est un attribut enum de CatalogueItem
- Templates par type de piece (pas par type de bien)
- 3 niveaux : plateforme -> workspace -> terrain
- Un item est soit EDL soit Inventaire (champ `contexte`), pas les deux
- Sous-items via self-ref `parent_item_id` (profondeur max 2)
- Criteres d'evaluation par categorie (pas par item) avec overrides ponctuels
- 8 criteres fixes : etat_general, proprete, photos, caracteristiques, couleur, degradations, fonctionnement, quantite
- 4 niveaux d'exigence : masque / optionnel / recommande / obligatoire

### Missions

- 1 mission = 1 lot (non modifiable apres creation)
- Statut simplifie : `planifiee` | `assignee` | `terminee` | `annulee`
- Auto-terminaison : quand tous les EDL lies sont signes
- Verrouillage post-terminaison : date/heure/technicien en lecture seule. Seuls commentaire + cles modifiables.
- Annulation bloquee si mission terminee (EDL signes = documents legaux)
- Colocation : bail collectif (1 EDL, N locataires) ou bails individuels (N EDL)
- `CleMission` FK vers `edl_id` (pas `mission_id`) — colocation geree
- Indisponibilites technicien : creneaux + recurrence style Google Calendar

### Interface

- Edition inline retiree — toute modification passe par fiche detail ou drawer
- Filtres rapides en dropdown compact (pattern transversal toutes les vues)
- Suppression onglet Lots — lots accessibles uniquement via drill-down batiment ou recherche globale
- Colonne agregee "Nom / Raison sociale" sur tous les onglets Tiers

---

## 4. Navigation Back-office

```
OPERATIONNEL
  ├── Tableau de bord (EPIC 14)
  └── Missions (EPIC 13)

REFERENTIEL
  ├── Parc immobilier — Batiments & Lots (EPIC 1)
  └── Tiers (EPIC 2)

ADMINISTRATION
  ├── Parametres (EPIC 11)
  │   ├── Informations workspace
  │   ├── Utilisateurs & Roles
  │   ├── Templates / Pieces (EPIC 4)
  │   ├── Catalogue d'items (EPIC 4)
  │   ├── Parametrage Criteres (EPIC 4)
  │   └── Referentiels / Tags (EPIC 4)
  └── API & Integrations (EPIC 10)
```

Le technicien n'a acces qu'a l'app mobile. Pas d'interface desktop.

---

## 5. Cycles de Vie

### Mission

`Planifiee` -> `Assignee` -> `Terminee` (auto) | `Annulee`

### EDL / Inventaire

`Brouillon` -> `Signe` | `Infructueux`

### Statuts separes sur la Mission

- **statut** : `planifiee` | `assignee` | `terminee` | `annulee`
- **statut_rdv** : `a_confirmer` | `confirme` | `reporte`
- **MissionTechnicien.statut_invitation** : `en_attente` | `accepte` | `refuse`

---

## 6. Stack Technique

### Frontend (Webapp Back-office)

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Router 6** (routing SPA)
- **TanStack Query** (React Query) pour le server state
- **Recharts** (graphiques dashboard)
- **Lucide React** (icones)
- **Fontshare** (typographie : Display + Body + Mono)
- **date-fns** + locale fr (formatage dates)
- **Zod** (validation schemas partages avec le backend)
- **React Hook Form** (formulaires)

### Backend

- **Node.js** + **Express** (ESM modules)
- **PostgreSQL** sur Railway (`pg` driver, Pool, max 20 connexions)
- **JWT** (jsonwebtoken) + **bcryptjs** pour l'authentification
- **Zod** (validation des schemas cote backend)
- **Resend** (emails transactionnels — invitations, notifications)

### Infrastructure

- **Railway** (hosting webapp + PostgreSQL)
- **GitHub** (repo + CI/CD via Railway auto-deploy)
- **Notion** (specs, suivi, knowledge sync)

---

## 7. Conventions de Code

### Structure du projet

```
/src
  /components           ← Composants UI reutilisables
  /components/ui        ← shadcn/ui (ne pas modifier)
  /features             ← Feature modules
    /{feature}
      /components       ← Composants specifiques a la feature
      /hooks            ← Hooks custom
      /api.ts           ← Appels API (React Query)
      /types.ts         ← Types TypeScript
  /layouts              ← Layout sidebar + topbar
  /lib                  ← Utilitaires (api client, cn, formatters)
  /hooks                ← Hooks globaux
/server
  /routes               ← Express routes
  /services             ← Business logic
  /db                   ← Schema, migrations, pool
  /middleware            ← Auth JWT, validation
```

### Conventions de nommage

- **Composants React** : PascalCase (`BuildingList.tsx`)
- **Fonctions / hooks** : camelCase (`useBuildings`, `formatDate`)
- **Colonnes DB / API JSON** : snake_case (`workspace_id`, `created_at`)
- **Fichiers features** : kebab-case (`building-list.tsx`, `use-buildings.ts`)
- **Types TS** : PascalCase avec suffixe (`Building`, `CreateBuildingInput`, `BuildingResponse`)

### API REST

- Endpoints : `/api/{resource}` (pluriel) — `/api/batiments`, `/api/tiers`, `/api/missions`
- Reponses JSON : `{ data, meta? }` pour les listes, objet direct pour les details
- Erreurs : `{ error: string, code: string, details?: any }`
- Pagination : cursor-based (`?cursor=xxx&limit=50`)
- Validation : Zod cote backend (middleware), Zod + React Hook Form cote frontend

### Dates & i18n

- Stockage : ISO 8601, TIMESTAMPTZ en base
- Affichage : format fr-FR (`date-fns/locale/fr`)
- UI en francais, code et API en anglais
- IDs : UUID v4 partout (`uuid_generate_v4()` cote DB)

### Git

- Commits : `type(scope): description` — types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Branches : `feat/xxx`, `fix/xxx`, `refactor/xxx`
- PR obligatoire pour merge sur `main`

---

## 7b. Interdictions V1 — Ce que ImmoChecker ne fait PAS

Ces regles sont non-negociables en V1. Elles evitent le scope creep et clarifient les limites du produit.

- **PAS de gestion locative** — l'occupation des logements n'est pas geree
- **PAS d'edition inline sur les tableaux** — toute modification passe par fiche detail ou drawer
- **PAS de suppression hard delete** — archivage uniquement (soft delete)
- **PAS de section compteurs sur la fiche lot** — geres uniquement cote EDL tablette
- **PAS de table Section pour les items** — la categorie est un enum sur CatalogueItem
- **PAS de tiers_id sur WorkspaceUser** — table Tiers = stakeholders lot uniquement
- **PAS de modification du lot** sur une mission apres creation
- **PAS d'annulation de mission si terminee** — EDL signes = documents legaux immuables
- **PAS d'onglet Lots separe** — lots accessibles uniquement via drill-down batiment ou recherche
- **PAS de drag & drop sur le Kanban missions** en V1
- **PAS de donnees de saisie terrain dans la webapp** — le back-office consulte via PDF/Web uniquement

---

## 7c. Auth & Securite — Details d'implementation

### Strategie JWT

- **Access token** : duree 15-30 min, contient `{ userId, email, workspaceId, role }`
- **Refresh token** : duree 7 jours, stocke en httpOnly cookie (web) / secure storage (mobile)
- **Silent refresh** : si access token expire, refresh automatique en background
- **Expiration refresh** : redirect vers `/login`
- **Stockage** : JAMAIS en localStorage — httpOnly cookie uniquement

### Inscription & Invitations

- **Pas de sign-up public en V1** — inscription uniquement par invitation
- Flux : Admin cree invitation → Email via Resend → User clique lien → Formulaire (email pre-rempli non-editable, nom/prenom/password a saisir)
- Invitation expire apres **7 jours** — page "Demander une nouvelle invitation" si expiree
- Invitations gerees dans `Parametres > Utilisateurs & Roles`

### Password & Securite

- **Password policy** : 8 chars min + 1 majuscule + 1 chiffre
- **Lockout** : 10 tentatives echouees → blocage 15 min
- **Reset password** : lien valide 1 heure, envoye via Resend
- **Hashage** : bcryptjs (salt rounds 12)

### Multi-workspace

- Un utilisateur peut appartenir a **plusieurs workspaces** (via WorkspaceUser)
- **1 seul workspace actif** a la fois — stocke dans le JWT
- Si 2+ workspaces : page de selection apres login (logo + nom de chaque workspace)
- **Workspace switcher** dans le header : dropdown → switch = refresh JWT complet + reload toutes les donnees
- Chaque switch declenche un nouveau JWT avec le `workspaceId` cible

### Visibilite conditionnelle par type de workspace

| Element UI | societe_edl | bailleur | agence |
|---|---|---|---|
| Onglet Mandataire (Tiers) | Visible | Masque | Masque |
| Missions obligatoires | Oui | Non (EDL direct possible) | Oui |
| Techniciens externes | Oui | Non | Optionnel |

---

## 7d. Transitions d'etat — Mission & EDL

### Mission : diagramme d'etat

```
                    [creation]
                        |
                        v
                   PLANIFIEE
                   (pas de technicien)
                        |
            technicien assigne + accepte invitation
                        |
                        v
                    ASSIGNEE
                   /         \
    tous EDL signes           admin annule (+ motif obligatoire)
    (auto-terminaison)        (BLOQUEE si mission terminee)
           |                        |
           v                        v
       TERMINEE                  ANNULEE
    (verrouillage actif)
```

### Conditions de transition

| Transition | Trigger | Condition | Effet |
|---|---|---|---|
| planifiee → assignee | MissionTechnicien.statut_invitation = `accepte` | Au moins 1 technicien accepte | Notification admin |
| assignee → terminee | EDL_Inventaire.statut = `signe` sur TOUS les EDL lies | Auto-terminaison quand dernier EDL signe | Notification admin + technicien. Webhook `mission.terminee` |
| planifiee/assignee → annulee | Action admin manuelle | Mission PAS terminee + motif obligatoire | Notification technicien si assigne |
| terminee → annulee | **IMPOSSIBLE** | EDL signes = documents legaux immuables | Erreur `MISSION_LOCKED` |

### Verrouillage post-terminaison (mission terminee)

| Champ | Etat |
|---|---|
| date, heure_debut, heure_fin | **Lecture seule** |
| technicien (MissionTechnicien) | **Lecture seule** |
| statut_rdv | **Lecture seule** |
| lot_id | **Lecture seule** (immutable des la creation) |
| commentaire | **Modifiable** (instructions, notes) |
| CleMission (statut, lieu_depot) | **Modifiable** (workflow cles continue apres terminaison) |

### EDL_Inventaire : cycle de vie

```
BROUILLON → SIGNE → (immuable, document legal)
         ↘ INFRUCTUEUX (acces refuse, intervention impossible)
```

- `brouillon` : cree automatiquement lors de la creation de mission, editable sur tablette
- `signe` : signature digitale appliquee sur tablette → declenche verification auto-terminaison mission
- `infructueux` : technicien marque comme impossible (pas d'acces, locataire absent, etc.)

---

## 7e. Workflow Colocation

### Principe

Colocation = plusieurs locataires sur un meme lot. Deux modeles de bail determinent la creation des EDL.

### Selection du type de bail

- Le choix apparait dans le formulaire de creation mission **uniquement quand 2+ locataires** sont ajoutes
- Radio button : **Individuel** (defaut) | **Collectif**

### Bail Individuel (defaut)

- **N locataires → N EDL separes** (1 par locataire), meme mission
- Chaque locataire signe son propre EDL
- Sur tablette : technicien peut **dupliquer** un EDL (structure + contenu + photos copiees), puis modifier locataire + pieces
- Auto-terminaison : attend que **tous les N EDL** soient signes

### Bail Collectif (solidaire)

- **N locataires → 1 seul EDL** signe par tous
- Locataires lies via pivot `EDLLocataire` (N:1 vers le meme EDL)
- Signature : tous les locataires signent le meme document
- Auto-terminaison : 1 seul EDL a signer

### Entree + Sortie sur meme mission

- Une mission peut contenir un **EDL de sortie** (ancien locataire) + un **EDL d'entree** (nouveau locataire) sur le meme lot
- Le `sens` (entree/sortie) est porte par `EDL_Inventaire.sens`, pas par la mission
- Dashboard : colonne type affiche "Entree + Sortie"

### Gestion des cles en colocation

- `CleMission` FK vers `edl_id` (pas `mission_id`) — chaque locataire a ses propres cles
- En bail individuel : chaque EDL a son propre jeu de cles
- En bail collectif : 1 EDL = 1 jeu de cles partage

---

## 7f. Patterns UI partages

### Record Picker enrichi

Composant reutilise partout (creation mission, creation lot, associations tiers).

| Picker | Affiche | Recherche sur | Creation inline |
|---|---|---|---|
| **Lot** | nom + adresse + proprietaire + etage + emplacement_palier | nom, adresse, proprietaire | Oui (sous-modal) |
| **Batiment** | designation + adresse | designation, adresse | Oui (sous-modal) |
| **Tiers** | nom/raison sociale + type + email | nom, email, telephone | Oui (sous-modal) |
| **Technicien** | nom + prenom | nom | Non |

- Bouton "Creer" en bas du dropdown si aucun resultat
- Creation en **sous-modal** (modal dans modal) — entite auto-selectionnee apres creation
- Pas de bouton "Nouveau batiment" standalone sur la page Parc — creation uniquement via picker

### Filtres rapides (pattern transversal)

- **Dropdowns compacts** en haut de chaque vue (tableau, kanban, carte, calendrier)
- Filtres standard : **Periode** | **Technicien** | **Statut** (contextualises par vue)
- Persistance : preferences sauvegardees par user + vue dans `UserPreference`
- Les filtres s'appliquent a toutes les vues simultanement (switch vue = memes filtres)

### Drawer lateral

- Panneau glissant depuis la **droite** (desktop) — contenu contextuel
- Utilise pour : detail mission (dashboard), resolution actions en attente
- Contenu : infos mission + actions possibles + date/heure modifiables
- Fermeture : clic exterieur, bouton X, touche Escape
- Si mission terminee : drawer en **lecture seule** (sauf commentaire + cles)

### Colonnes configurables

- Bouton "Colonnes" sur tous les tableaux → panneau toggle show/hide
- Bouton "Reinitialiser" pour revenir aux colonnes par defaut du workspace
- Persistance : `UserPreference` avec `{ page, config: { visible_columns, order } }`
- Colonnes par defaut definies par le workspace (Flat Checker), personnalisables par user

### Calendrier admin (dashboard)

- **Calendrier semaine** (zone principale) : colonnes jour, cartes missions en pastel par statut, blocs gris pour indisponibilites
- **Mini-calendrier mensuel** (sidebar droite) : vue mois, clic jour → modal liste missions du jour
- Clic mission → drawer lateral detail
- Clic indisponibilite → popup (nom, dates, motif, edit/delete)
- Pas de creation par clic sur créneau — bouton "+" ouvre choix mission/indisponibilite

### Vue carte/map

- Markers clusters au dezoom, individuels au zoom
- **Batiments** : couleur par activite (bleu = mission a venir 7j, vert = mission recente <6 mois, gris = aucune)
- **Missions** : couleur par statut
- Popup au clic : designation, adresse, nb lots, derniere/prochaine mission
- Filtres identiques a la vue tableau
- Seuls les batiments geocodes (Google Places) apparaissent sur la carte

---

## 7g. Enums & Constantes metier

### Workspace

| Enum | Valeurs |
|---|---|
| `type_workspace` | `societe_edl` \| `bailleur` \| `agence` |

### Utilisateur & Roles

| Enum | Valeurs |
|---|---|
| `WorkspaceUser.role` | `admin` \| `gestionnaire` \| `technicien` |
| `MissionTechnicien.statut_invitation` | `en_attente` \| `accepte` \| `refuse` |

### Patrimoine

| Enum | Valeurs |
|---|---|
| `Batiment.type` | `immeuble` \| `maison` \| `local_commercial` \| `mixte` |
| `Lot.type_bien` | `appartement` \| `maison` \| `studio` \| `local_commercial` \| `parking` \| `cave` \| `autre` |
| `AdresseBatiment.type` | `principale` \| `secondaire` |

### Tiers

| Enum | Valeurs |
|---|---|
| `Tiers.type` | `physique` \| `morale` |
| `TiersOrganisation.fonction` | `gerant` \| `directeur` \| `comptable` \| `contact_principal` \| `autre` |

### Mission

| Enum | Valeurs |
|---|---|
| `Mission.statut` | `planifiee` \| `assignee` \| `terminee` \| `annulee` |
| `Mission.statut_rdv` | `a_confirmer` \| `confirme` \| `reporte` |
| `Mission.reference` | Auto-genere : `M-{YYYY}-{XXXX}` (ex: M-2026-0001) |

### EDL / Inventaire

| Enum | Valeurs |
|---|---|
| `EDL_Inventaire.statut` | `brouillon` \| `signe` \| `infructueux` |
| `EDL_Inventaire.sens` | `entree` \| `sortie` |
| `EDL_Inventaire.type_bail` | `individuel` \| `collectif` |

### Cles (CleMission)

| Enum | Valeurs |
|---|---|
| `CleMission.type_cle` | `cle_principale` \| `badge` \| `boite_aux_lettres` \| `parking` \| `cave` \| `digicode` \| `autre` |
| `CleMission.statut` | `remise` \| `a_deposer` \| `deposee` |

### Catalogue & Templates

| Enum | Valeurs |
|---|---|
| `CatalogueItem.categorie` | `revetement_sol` \| `revetement_mur` \| `revetement_plafond` \| `menuiserie` \| `plomberie` \| `electricite` \| `chauffage` \| `ventilation` \| `electromenager` \| `mobilier` \| `equipement` \| `serrurerie` \| `vitrage` \| `exterieur` \| `divers` \| `structure` \| `securite` |
| `CatalogueItem.contexte` | `edl` \| `inventaire` |
| `ConfigCritereCategorie.critere` | `etat_general` \| `proprete` \| `photos` \| `caracteristiques` \| `couleur` \| `degradations` \| `fonctionnement` \| `quantite` |
| `ConfigCritereCategorie.niveau_exigence` | `masque` \| `optionnel` \| `recommande` \| `obligatoire` |

### Photo

| Enum | Valeurs |
|---|---|
| `Photo.entity_type` | `item` \| `cle` \| `piece` \| `compteur` |

### Indisponibilite Technicien

| Enum | Valeurs |
|---|---|
| `recurrence_config.freq` | `daily` \| `weekly` \| `biweekly` \| `monthly` |
| `recurrence_config` (schema JSONB) | `{ freq, byday?: ["MO","TU"...], bymonthday?: [1,15...], count?: int, until?: date }` |

### Pagination API

| Constante | Valeur |
|---|---|
| Limit par defaut | 50 |
| Limit max | 100 |
| Format cursor | UUID du dernier element |
| Reponse liste | `{ data: [...], meta: { cursor, has_more, total } }` |

---

## 7h. Systeme d'elevation

ImmoChecker utilise un systeme d'elevation a 5 niveaux inspire d'Atlassian. Chaque element visuel appartient a exactement un niveau. Surface et shadow sont toujours apparies.

### Niveaux

| Niveau | Surface | Shadow | Z-index | Utilisation |
|---|---|---|---|---|
| **Sunken** | `bg-surface-sunken` | aucune | 0 | En-tetes de tableau, lignes expandees, fond de barre de filtre/tabs, inputs disabled |
| **Default** | `bg-background` | aucune | 0 | Fond de page uniquement |
| **Raised** | `bg-card` ou `elevation-raised` | `shadow-elevation-raised` | 0 | Cards, sidebar, header, sections detail, formulaire auth |
| **Overlay** | `bg-popover` ou `bg-surface-overlay` | `shadow-elevation-overlay` | z-40 | Dropdowns, popovers, selects, autocomplete, tooltips |
| **Floating** | `bg-surface-floating` ou `elevation-floating` | `shadow-elevation-floating` | z-50 | Dialogs, sheets, alert-dialogs, floating save bar |

### Classes composites

- `.elevation-raised` = surface + shadow + border (pour les cartes et sections)
- `.elevation-raised-interactive` = idem + hover shadow transition
- `.elevation-overlay` = surface overlay + shadow overlay + border
- `.elevation-floating` = surface floating + shadow floating + border

### Regles

1. **Ne jamais utiliser les shadow bruts** (`shadow-sm`, `shadow-md`, `shadow-lg`) pour l'elevation. Utiliser `shadow-elevation-raised`, `shadow-elevation-overlay`, ou `shadow-elevation-floating`.
2. **`shadow-xs` sur les inputs/boutons est OK** — ce n'est pas de l'elevation, c'est du form control styling.
3. **Ne jamais utiliser `bg-white`** — utiliser `bg-card`, `bg-surface-raised`, ou `bg-surface-sunken`.
4. **Ne jamais mettre `z-50` sur des elements non-modaux.** Sidebar = z-30, header = z-20, dropdowns/popovers = z-40, modals/floating = z-50.
5. **Shadows decoratives colorees** (`shadow-primary/20`) sur les CTA auth sont une exception.
6. **`bg-muted/50` est deprecie** pour les zones en retrait — utiliser `bg-surface-sunken`.

### Echelle Z-index

| Token | Valeur | Usage |
|---|---|---|
| z-0 | 0 | Contenu par defaut |
| z-10 | 10 | Elements sticky, resize handles |
| z-20 | 20 | Header sticky |
| z-30 | 30 | Sidebar |
| z-40 | 40 | Overlays (dropdowns, popovers, selects, tooltips, autocomplete) |
| z-50 | 50 | Modaux (dialog, sheet, alert-dialog, floating save bar) |

---

## 8. Specifications Detaillees

Documents de specification a consulter pour les details fonctionnels :

| Document | Chemin local |
|---|---|
| Specification Items, Criteres & Templates | `knowledge/notion/pages/specification-items-criteres-d-evaluation-templates-edl-inventaire.md` |
| Notifications | `knowledge/notion/pages/notifications-specification.md` |
| Business Model — Reflexions | `knowledge/notion/pages/business-model-discussion-reflexions.md` |
| Arbitrage — Modele de saisie des items | `knowledge/notion/pages/arbitrage-modele-de-saisie-des-items-edl.md` |
| Synthese retours prototype | `knowledge/notion/pages/synthese-retours-prototype-back-office-mars-2026.md` |
| Vision Fonctionnelle Cible | `knowledge/notion/pages/vision-fonctionnelle-cible-immochecker-v1.md` |
| Architecture de Donnees | `knowledge/notion/pages/architecture-de-donnees-immochecker-v1.md` |
| Hub de Ressources | `knowledge/notion/pages/hub-de-ressources-immochecker.md` |
| Cadrage Fonctionnel | `knowledge/notion/pages/cadrage-fonctionnel-check-my-flat.md` |
| Kick-off & Atelier n1 | `knowledge/notion/pages/kick-off-atelier-n-1.md` |

---

## 9. EPICs Webapp (Lot 1) — Vue d'ensemble

| # | EPIC | Priorite | Lien local |
|---|---|---|---|
| 11 | Multi-workspace, Auth, Comptes & Parametres | P0 | `knowledge/notion/pages/epic-11-multi-workspace-auth-comptes-parametres.md` |
| 1 | Gestion des Batiments & Lots | P0 | `knowledge/notion/pages/epic-1-gestion-des-batiments-lots.md` |
| 2 | Gestion des Tiers | P0 | `knowledge/notion/pages/epic-2-gestion-des-tiers.md` |
| 4 | Gestion des Templates (EDL & Inventaires) | P0 | `knowledge/notion/pages/epic-4-gestion-des-templates-edl-inventaires.md` |
| 13 | Missions & Planification | P0 | `knowledge/notion/pages/epic-13-missions-planification.md` |
| 14 | Dashboard Admin (Back-office) | P0 | `knowledge/notion/pages/epic-14-dashboard-admin-back-office.md` |
| 16 | Composants Transverses | P0 | `knowledge/notion/pages/epic-16-composants-transverses.md` |
| 10 | API de Gestion des EDL (Back-office) | P0 | `knowledge/notion/pages/epic-10-api-de-gestion-des-edl-back-office.md` |

---

## 10. User Stories Webapp — Liste Complete (62 US)

Chaque US dans le Notion contient : description "En tant que...", criteres d'acceptation Gherkin, modele de donnees impacte, regles metier. Les US detaillees sont dans `knowledge/notion/related/`.

### EPIC 11 — Auth & Workspace (8 US)

| US | Titre | Fichier |
|---|---|---|
| 577 | Creer un workspace avec type de profil | `knowledge/notion/related/fcr-us577-creer-un-workspace-avec-type-de-profil.md` |
| 578 | Creer un compte et s'authentifier par JWT | `knowledge/notion/related/fcr-us578-creer-un-compte-et-s-authentifier-par-jwt.md` |
| 579 | Definir et gerer les roles via WorkspaceUser | `knowledge/notion/related/fcr-us579-definir-et-gerer-les-roles-via-workspaceuser.md` |
| 580 | Inviter un utilisateur dans un workspace | `knowledge/notion/related/fcr-us580-inviter-un-utilisateur-dans-un-workspace.md` |
| 581 | Garantir l'isolation complete des donnees entre workspaces | `knowledge/notion/related/fcr-us581-garantir-l-isolation-complete-des-donnees-entre-workspaces.md` |
| 810 | Page parametres du workspace | `knowledge/notion/related/fcr-us810-page-parametres-du-workspace.md` |
| 836 | Onboarding d'un nouveau workspace | `knowledge/notion/related/fcr-us836-onboarding-d-un-nouveau-workspace.md` |
| 582 | Archivage froid des donnees (retention 10 ans) | `knowledge/notion/related/fcr-us582-archivage-froid-des-donnees-retention-10-ans.md` |

### EPIC 1 — Batiments & Lots (8 US)

| US | Titre | Fichier |
|---|---|---|
| 583 | Creer un batiment avec ses informations de base | `knowledge/notion/related/fcr-us583-creer-un-batiment-avec-ses-informations-de-base.md` |
| 584 | Creer un lot rattache a un batiment | `knowledge/notion/related/fcr-us584-creer-un-lot-rattache-a-un-batiment.md` |
| 585 | Creer une maison (1 batiment + 1 lot) en un clic | `knowledge/notion/related/fcr-us585-creer-une-maison-1-batiment-1-lot-en-un-clic.md` |
| 586 | Lister, filtrer et rechercher dans le parc immobilier | `knowledge/notion/related/fcr-us586-lister-filtrer-et-rechercher-dans-le-parc-immobilier.md` |
| 609 | Consulter la fiche detail d'un lot | `knowledge/notion/related/fcr-us609-consulter-la-fiche-detail-d-un-lot.md` |
| 610 | Consulter la fiche detail d'un batiment | `knowledge/notion/related/fcr-us610-consulter-la-fiche-detail-d-un-batiment.md` |
| 824 | Archiver un batiment ou un lot | `knowledge/notion/related/fcr-us824-archiver-un-batiment-ou-un-lot.md` |
| 829 | Autocomplete adresse Google Places | `knowledge/notion/related/fcr-us829-autocomplete-adresse-google-places.md` |

### EPIC 2 — Tiers (10 US)

| US | Titre | Fichier |
|---|---|---|
| 588 | Creer un tiers (personne physique ou morale) | `knowledge/notion/related/fcr-us588-creer-un-tiers-personne-physique-ou-morale.md` |
| 589 | Associer une personne physique a une personne morale | `knowledge/notion/related/fcr-us589-associer-une-personne-physique-a-une-personne-morale-via-tiersorganisa.md` |
| 590 | Lier un ou plusieurs proprietaires a un lot (indivision) | `knowledge/notion/related/fcr-us590-lier-un-ou-plusieurs-proprietaires-a-un-lot-indivision.md` |
| 591 | Lier un mandataire de gestion a un lot | `knowledge/notion/related/fcr-us591-lier-un-mandataire-de-gestion-a-un-lot.md` |
| 592 | Retrouver un tiers par nom, type ou role | `knowledge/notion/related/fcr-us592-retrouver-un-tiers-par-nom-type-ou-role.md` |
| 593 | Mettre a jour ou archiver un tiers | `knowledge/notion/related/fcr-us593-mettre-a-jour-ou-archiver-un-tiers.md` |
| 806 | Consulter la fiche detail d'un proprietaire | `knowledge/notion/related/fcr-us806-consulter-la-fiche-detail-d-un-proprietaire.md` |
| 807 | Consulter la fiche detail d'un locataire | `knowledge/notion/related/fcr-us807-consulter-la-fiche-detail-d-un-locataire.md` |
| 808 | Naviguer par onglets type de tiers avec colonnes dynamiques | `knowledge/notion/related/fcr-us808-naviguer-par-onglets-type-de-tiers-avec-colonnes-dynamiques.md` |
| 809 | Consulter la fiche detail d'un mandataire | `knowledge/notion/related/fcr-us809-consulter-la-fiche-detail-d-un-mandataire.md` |

### EPIC 4 — Templates & Catalogue (4 US)

| US | Titre | Fichier |
|---|---|---|
| 832 | Gerer les types de pieces (CRUD TypePiece) | `knowledge/notion/related/fcr-us832-gerer-les-types-de-pieces-crud-typepiece.md` |
| 833 | Configurer les items par type de piece | `knowledge/notion/pages/fcr-us833-configurer-les-items-par-type-de-piece.md` |
| 834 | Parametrer les criteres d'exigence par categorie d'items | `knowledge/notion/related/fcr-us834-parametrer-les-criteres-d-exigence-par-categorie-d-items.md` |
| 835 | Gerer le catalogue d'items (CatalogueItem) | `knowledge/notion/related/fcr-us835-gerer-le-catalogue-d-items-catalogueitem.md` |

### EPIC 13 — Missions & Planification (11 US webapp)

| US | Titre | Fichier |
|---|---|---|
| 594 | Creer une mission d'intervention sur un lot | `knowledge/notion/related/fcr-us594-creer-une-mission-d-intervention-sur-un-lot.md` |
| 595 | Assigner un ou plusieurs techniciens a une mission | `knowledge/notion/related/fcr-us595-assigner-un-ou-plusieurs-techniciens-a-une-mission.md` |
| 597 | Consulter le planning des missions avec filtres | `knowledge/notion/related/fcr-us597-consulter-le-planning-des-missions-avec-filtres.md` |
| 811 | Consulter la page detail d'une mission | `knowledge/notion/related/fcr-us811-consulter-la-page-detail-d-une-mission.md` |
| 812 | Vue kanban des missions | `knowledge/notion/related/fcr-us812-vue-kanban-des-missions.md` |
| 813 | Vue carte/map des missions | `knowledge/notion/related/fcr-us813-vue-carte-map-des-missions.md` |
| 814 | Stat cards revisees de la page missions | `knowledge/notion/related/fcr-us814-stat-cards-revisees-de-la-page-missions.md` |
| 822 | Gestion des cles par EDL/CleMission | `knowledge/notion/pages/fcr-us822-gestion-des-cles-par-edl-clemission.md` |
| 823 | Gerer les indisponibilites technicien | `knowledge/notion/pages/fcr-us823-gerer-les-indisponibilites-technicien.md` |
| 825 | Annuler une mission | `knowledge/notion/related/fcr-us825-annuler-une-mission.md` |
| 827 | Warning conflit de planning technicien | `knowledge/notion/related/fcr-us827-warning-conflit-de-planning-technicien.md` |

### EPIC 14 — Dashboard Admin (6 US)

| US | Titre | Fichier |
|---|---|---|
| 837 | Stat cards dashboard admin | `knowledge/notion/related/fcr-us837-stat-cards-dashboard-admin.md` |
| 838 | Calendrier semaine dashboard admin | `knowledge/notion/related/fcr-us838-calendrier-semaine-dashboard-admin.md` |
| 839 | Mini calendrier mensuel dashboard admin | `knowledge/notion/related/fcr-us839-mini-calendrier-mensuel-dashboard-admin.md` |
| 840 | Bouton mission/indisponibilite dashboard admin | `knowledge/notion/related/fcr-us840-bouton-mission-indisponibilite-dashboard-admin.md` |
| 841 | Bloc actions en attente dashboard admin | `knowledge/notion/related/fcr-us841-bloc-actions-en-attente-dashboard-admin.md` |
| 842 | Drawer lateral mission dashboard admin | `knowledge/notion/related/fcr-us842-drawer-lateral-mission-dashboard-admin.md` |

### EPIC 10 — API Back-office (5 US)

| US | Titre | Fichier |
|---|---|---|
| 599 | Generer et gerer des cles API par workspace | `knowledge/notion/related/fcr-us599-generer-et-gerer-des-cles-api-par-workspace.md` |
| 600 | Creer un EDL/mission via API REST | `knowledge/notion/related/fcr-us600-creer-un-edl-mission-via-api-rest.md` |
| 601 | Recuperer les URLs PDF et web d'un EDL signe via API | `knowledge/notion/related/fcr-us601-recuperer-les-urls-pdf-et-web-d-un-edl-signe-via-api.md` |
| 602 | Recevoir des webhooks lors d'evenements EDL | `knowledge/notion/related/fcr-us602-recevoir-des-webhooks-lors-d-evenements-edl.md` |
| 603 | Documentation API interactive OpenAPI/Swagger | `knowledge/notion/related/fcr-us603-documentation-api-interactive-openapi-swagger.md` |

### EPIC 16 — Composants Transverses (6 US)

| US | Titre | Fichier |
|---|---|---|
| 817 | Colonnes configurables sur tous les tableaux | `knowledge/notion/related/fcr-us817-colonnes-configurables-sur-tous-les-tableaux.md` |
| 818 | Filtres dynamiques type Notion | `knowledge/notion/related/fcr-us818-filtres-dynamiques-type-notion.md` |
| 820 | QR code de verification et page d'authenticite | `knowledge/notion/related/fcr-us820-qr-code-de-verification-et-page-d-authenticite-du-document.md` |
| 821 | Notifications plateforme (email + in-app) | `knowledge/notion/related/fcr-us821-notifications-plateforme-email-in-app.md` |
| 828 | Recherche globale cross-entite (Ctrl+K) | `knowledge/notion/related/fcr-us828-recherche-globale-cross-entite-ctrl-k.md` |
| 830 | Exporter les tableaux en CSV | `knowledge/notion/related/fcr-us830-exporter-les-tableaux-en-csv.md` |
| 831 | Page web publique de consultation EDL | `knowledge/notion/related/fcr-us831-page-web-publique-de-consultation-edl.md` |
| 843 | Import en masse de batiments et lots via CSV | `knowledge/notion/related/fcr-us843-import-en-masse-de-batiments-et-lots-via-csv.md` |

---

## 11. Sprints Webapp (5 sprints)

### Sprint 1 — Fondations + Parc immobilier

**EPIC 11 (partiel) + EPIC 1 + EPIC 16 (socle)**

US : 577, 578, 579, 580, 581, 583, 584, 585, 586, 609, 610, 824, 829, 817

> **Livrable** : app fonctionnelle avec login (invitation-only), selection workspace, sidebar, page Parc immobilier (tableau avec colonnes configurables + vue carte), fiches detail batiment et lot, creation/archivage, autocomplete adresse Google Places.
> **Setup** : scaffold Vite+React+TS, schema PostgreSQL complet (28 tables), seed donnees plateforme (~30 pieces, ~155 items, referentiels), layout principal avec sidebar/topbar, routing React Router 6, API client + React Query, middleware auth JWT.

### Sprint 2 — Tiers + Templates/Parametres

**EPIC 2 + EPIC 4 + EPIC 11 (fin)**

US : 588, 589, 590, 591, 592, 593, 808, 806, 807, 809, 810, 832, 833, 834, 835, 836

> **Livrable** : page Tiers avec onglets par type (Proprio/Locataire/Mandataire/Tous), colonnes dynamiques par onglet, fiches detail par role, associations TiersOrganisation. Page Parametres workspace (infos, utilisateurs, invitations). Module Templates complet : CRUD TypePiece, catalogue d'items (~155), configuration criteres d'exigence (17 categories x 8 criteres), associations piece-items. Onboarding nouveau workspace.
> **Complexite** : 16 US — sprint le plus lourd. Les templates (EPIC 4) impliquent 3 niveaux (plateforme/workspace/terrain) et le seed de ~155 items avec sous-items et referentiels.

### Sprint 3 — Missions & Planification

**EPIC 13**

US : 594, 595, 597, 811, 812, 813, 814, 822, 823, 825, 827

> **Livrable** : creation mission (modal + record picker enrichi lot), assignation technicien, gestion colocation (bail collectif/individuel), vues tableau/kanban/carte/calendrier avec filtres rapides, fiche detail mission avec verrouillage post-terminaison, gestion des cles (CleMission), indisponibilites technicien (creneaux + recurrence), annulation avec motif, warning conflits planning, stat cards "Actions en attente".
> **Complexite** : coeur metier — auto-terminaison, colocation, cles, recurrence. Plus complexe que Sprint 1+2 combines.

### Sprint 4 — Dashboard Admin + API

**EPIC 14 + EPIC 10**

US : 837, 838, 839, 840, 841, 842, 599, 600, 601, 602, 603

> **Livrable** : dashboard admin avec stat cards (Total/Jour/Actions en attente/A venir), calendrier semaine (cartes pastels par statut), mini-calendrier mensuel (sidebar), drawer lateral mission, bouton "+" (mission/indisponibilite), bloc actions en attente. API REST externe : CRUD missions/EDL, cles API par workspace, webhooks (edl.signed, mission.terminee), documentation OpenAPI/Swagger.
> **Prerequis** : Sprint 3 termine (missions fonctionnelles).

### Sprint 5 — Composants transverses, Import, QA

**EPIC 16 (fin) + US restantes**

US : 818, 828, 821, 830, 843, 582

> **Livrable** : filtres dynamiques type Notion (builder field/operator/value), recherche globale cross-entite (Ctrl+K), notifications plateforme (email Resend + in-app bell), export CSV, import masse batiments/lots via CSV, archivage froid (retention 10 ans). Polish responsive, QA globale.
> **Risque** : US-818 (filtres Notion-like) est un composant complexe. A scoper strictement.

---

## 12. Donnees de Seed Plateforme

Au Sprint 1, la BDD doit etre seedee avec les donnees de reference Flat Checker :

- **~30 types de pieces** : `knowledge/notion/databases/pieces.md`
- **~155 items catalogue** (avec sous-items, categories, contexte EDL/Inventaire) : `knowledge/notion/databases/items-edl-inventaire.md`
- **~500+ valeurs referentiel** (caracteristiques, degradations, couleurs par item) : definies dans la Specification Items
- **ConfigCritereCategorie par defaut** : 17 categories x 8 criteres avec niveaux d'exigence predefinis

---

## 13. Chaine de Dependances

```
EPIC 11 (Auth/Workspace) — bloque TOUT
  |
EPIC 1 (Batiments & Lots)
  |
EPIC 2 (Tiers — lies aux lots)
  |
EPIC 4 (Templates — bloque la tablette)
  |
EPIC 13 (Missions — depend lots + tiers)
  |
EPIC 14 (Dashboard — depend missions)
  |
EPIC 10 (API — depend de tout le metier)

EPIC 16 (Composants Transverses) — deployes progressivement
```

---

## 14. Ressources Complementaires

| Ressource | Chemin local |
|---|---|
| Hub de Ressources complet | `knowledge/notion/pages/hub-de-ressources-immochecker.md` |
| Document de cadrage amont | `knowledge/notion/pages/document-de-cadrage-amont.md` |
| Cadrage Fonctionnel | `knowledge/notion/pages/cadrage-fonctionnel-check-my-flat.md` |
| Kick-off & Atelier n1 | `knowledge/notion/pages/kick-off-atelier-n-1.md` |

---

<!-- ARCHONSE:STACK_CONFIG:START -->
<!-- Auto-generated from project stacks — DO NOT EDIT this section manually -->
<!-- Use the Archonse Admin or project settings to modify stacks -->

## Tech Stack

Ce projet utilise : **Railway, Railway PostgreSQL, Fontshare, GitHub, Notion, Resend (Email), shadcn/ui**

## Deployment — Railway

- **Hosting** : Railway (auto-deploy via GitHub push)
- **Builder** : Railpack (defaut 2026, Nixpacks deprecie)
- **Workflow** : `git push origin main` → deploy automatique
- **Variables** : Definies via MCP Railway (`variable_set` / `variable_bulk_set`)
- **Networking** : `service.railway.internal` pour les comms inter-services
- **Logs** : `deployment_logs` via MCP pour debugger

### Commandes utiles
- Deployer : `git push origin main` (auto-deploy)
- Verifier : utiliser MCP Railway `deployment_list` + `deployment_logs`
- Variables : `variable_set` / `variable_bulk_set` via MCP

## Database — Railway PostgreSQL

- **Type** : PostgreSQL sur Railway
- **Driver** : `pg` (node-postgres) avec connection pooling
- **Requetes** : Toujours utiliser des requetes parametrees ($1, $2...) — JAMAIS d'interpolation
- **IDs** : UUID pour toutes les cles primaires
- **Timestamps** : TIMESTAMPTZ (avec timezone)
- **JSON** : JSONB pour les donnees flexibles

## Typographie — Fontshare

- **Source** : [fontshare.com](https://www.fontshare.com) (gratuit, usage commercial)
- **Integration** : Via CDN `https://api.fontshare.com/v2/css?f[]=...`
- **Hierarchy** : Display (titres) + Body (texte) + Mono (code)

## Source Control — GitHub

- **Workflow** : Feature branches → PR → Review → Merge
- **Commits** : Convention `type(scope): description`
- Types : `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

## Knowledge — Notion

- **Workspace** : Alfred Builders
- **Convention** : `{CODE} - US{numero} {description}`
- **Sync** : Les databases Notion sont synchronisees dans `knowledge/notion/`
- **Index** : `knowledge/notion/_index.md` = vue d'ensemble de toute la knowledge Notion
- **Routes** : `knowledge/notion/_routes.json` = carte des fichiers pour navigation rapide

## Email — Resend

- **Service** : Resend API (`resend.com`)
- **SDK** : `resend` npm package
- **Templates** : React Email pour les templates HTML

## shadcn/ui — Composants UI

- **Registre** : Composants React a copier-coller directement dans le code source.
- **CLI** : `npx shadcn@latest add {component}`
- **Usage** : Developpement rapide d'interfaces accessibles et hautement personnalisables.

<!-- ARCHONSE:STACK_CONFIG:END -->

<!-- ARCHONSE:GLOBAL_RULES:START -->
<!-- Auto-propagated from root CLAUDE.md — DO NOT EDIT this section manually -->

## Global Rules (Archonse Platform)

## Database Rules

### PostgreSQL on Railway — ALWAYS
- **NEVER use SQLite**. All data goes to Railway PostgreSQL.
- Connection: use `DATABASE_PUBLIC_URL` from `.env`
- Use `pg` Pool with connection pooling (max 20 connections)
- All queries use **parameterized statements** ($1, $2...) — NEVER string interpolation
- UUIDs for all primary keys (uuid_generate_v4())
- Timestamps always TIMESTAMPTZ (with timezone)
- JSONB for flexible/nested data (labels, metadata, settings, etc.)

## Security Rules

- **NEVER** store passwords in plain text — always bcryptjs hash
- **NEVER** interpolate user input into SQL — always parameterized queries
- **NEVER** expose DATABASE_URL to frontend
- All file paths resolved with `path.resolve()` — prevent directory traversal
- Credentials encrypted before storing in DB
- JWT verified on every request (middleware)

<!-- ARCHONSE:GLOBAL_RULES:END -->

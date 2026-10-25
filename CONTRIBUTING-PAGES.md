# Ajouter ou modifier une page de Tarif Contrôle Technique (fr-controle-technique)

À lire avec `~/Documents/GitHub/RECETTE-SITE.md` §6 (unicité), §7 (FAQ), §9 (écriture), §9.3
(mini-simulateurs), §11 (titres), §21 (bloc citable). Éditeur : Radif Partners. Aucun lien vers un centre,
un réseau, une plateforme de rendez-vous ni un autre site du portefeuille.

## Une page = un fichier

- Guide : `src/content/guides/<id>.ts` ; page outil (avec l'outil des centres ou des départements) :
  `src/content/outils/<id>.ts`, champ `tool: 'centres' | 'departements'`. Page ville : `tool: 'centres'`,
  `ville: '<clé de src/data/ct/villes.json>'` (modèle : `controle-technique-paris.ts`).
- Le fichier porte les deux langues (`fr`, `en`) : slug, nav, card, title (50–60 car., terme-clé en tête),
  description (150–160 car.), h1, intro, `resume(h)` (un paragraphe ≥ 120 mots), `faqs(h)` (questions
  uniques sur tout le site, réponses de 40 à 90 mots), `body(h)`.
- Le cœur (routes, menus, sitemap, hreflang, schémas) lit ces fichiers seul : ne pas le modifier pour
  ajouter une page.

## Aucun chiffre en dur

Les prix changent chaque jour. Dans `resume`, `faqs` et `body`, tout chiffre vient de :
`h.S` (stats.json : `national`, `depts`), `h.V` (villes.json), `h.P` (règles), `h.M` (moteur), et
`ville(h, slug)` (`src/lib/ville-texte.ts` : médianes, comparaisons calculées, tableaux). Une comparaison
(« plus cher que », « le moins cher est… ») est calculée, jamais affirmée. Formats : `h.prix`, `h.eur`,
`h.pct`, `h.num`, `h.date`.

## Mini-simulateurs

`<!--mini:KIND-->` dans le corps ; `KIND_DD` ouvre le mini sur le département DD (ex. `devis_63`).
Disponibles (`src/lib/minis/`) : echeance, moto, contreVisite, cvDept, elecDept, depPrix, vente,
collection, camionnette, detention, devis, deuxRouesPrix.

## Contrôles

`npm run check` (build, tests, typographie, légal, SEO, unicité, trame, liens, layout, sources,
simulateurs, hreflang, anglais, portefeuille, cookies, URL, premier écran), plus
`python3 scripts/check-regles.py .`, `node scripts/check-contraste.mjs .`,
`node scripts/check-saisie.mjs . --max=60`, `node scripts/check-nombres.mjs .`.

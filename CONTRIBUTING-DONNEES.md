# Données de Tarif CT (fr-controle-technique)

Tout le site repose sur un fichier public, relu chaque jour. Aucun prix n'est écrit à la main dans une page.

## Source et licence

- **Prix des centres** : jeu « Prix des contrôles techniques », data.gouv.fr
  (https://www.data.gouv.fr/datasets/prix-des-controles-techniques), export CSV
  `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-controle-technique/exports/csv?use_labels=true`.
  Chaque centre agréé y déclare ses prix (visite, contre-visite mini et maxi) par catégorie de véhicule et
  énergie, avec la date d'application du tarif et la date de mise à jour de sa fiche.
  **Licence Ouverte 2.0 (Etalab)** : réutilisation libre, y compris commerciale, à condition de citer la
  source et la date de dernière mise à jour (affichée sur chaque page : `LAST_UPDATED` = `src/data/ct/fichier.json`).
- **Communes** : API Découpage administratif, `geo.api.gouv.fr/communes` (même licence), mise en cache
  dans `scripts/data/communes-geo.json` (rafraîchir avec `--communes`).
- **Règles de date** : fiches Service Public et code de la route, reportées dans `src/data/params-2026.json`
  (chaque valeur avec sa source dans `sources`). Exemples des fiches rejoués par `src/lib/engine/ct.test.ts`.

## Le script

```
node scripts/update-data.mjs                 # télécharge le CSV et les métadonnées du jour
node scripts/update-data.mjs --csv fichier   # rejoue un CSV local
node scripts/update-data.mjs --communes      # rafraîchit aussi le cache des communes
node scripts/update-data.mjs --date 2026-10-21
```

1. Refuse un fichier de moins de 50 000 lignes (téléchargement coupé) : rien n'est écrit, la veille reste.
2. Regroupe les lignes par centre (SIRET), clés véhicule `catégorie|énergie` → `e d h el g` (voitures),
   `m cy q tr vt` (catégorie L), `cc u x4 co`. Écarte les prix de visite hors de 30–250 € (comptés dans
   `meta.aberrants`, listés dans la sortie), garde les contre-visites à 0 €.
3. Écrit :
   - `public/data/centres.json` : tous les centres, format compact, chargé par le navigateur à la première recherche ;
   - `public/data/communes.json` : index des communes `[nom, codes postaux, dép., lat, lon]` ;
   - `src/data/ct/stats.json` : statistiques France et départements (lues au build) ;
   - `src/data/ct/villes.json` : les 20 villes à page (centres de la commune, rayon 15 km, voisines, arrondissements) ;
   - `src/data/ct/dep-mini.json` : médianes compactes pour les mini-simulateurs ;
   - `src/data/ct/fichier.json` : date du fichier lu ;
   - `src/data/ct/historique.json` : un point par jour (médianes nationales).

## Mise à jour automatique

`.github/workflows/deploy.yml` : chaque jour à 05:20 UTC, relevé, `vitest`, build, recommit de
`src/data/ct`, `public/data` et du cache, publication GitHub Pages, ping IndexNow. Un relevé raté garde les
données de la veille ; un test raté bloque la publication.

## Ce que le fichier ne contient pas

Prix du contrôle pollution complémentaire des camionnettes, poids lourds, horaires et disponibilités des
centres : rien de cela n'est publié sur le site.

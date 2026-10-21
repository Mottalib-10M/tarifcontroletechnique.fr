/** Véhicule de collection (carte grise « collection ») : dispense avant 1960, sinon tous les 5 ans (fiche F328). */
import { T, type L } from './_kit';
import { TODAY, anneeOptions, prixL, NAT } from './_ct';
import { collection } from '../engine/ct';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => {
  const y0 = Number(TODAY.slice(0, 4));
  return {
    title: T(l, 'Véhicule de collection : prochain contrôle', 'Classic vehicle: next test'),
    cta: T(l, 'Trouver un centre près de chez moi', 'Find a centre near me'),
    inputs: [
      { id: 'y', label: T(l, 'Année de 1re mise en circulation', 'Year first registered'), def: 1972, options: anneeOptions(1920, y0 - P.collection.age_min_ans) },
      { id: 'c', label: T(l, 'Année du dernier contrôle', 'Year of last test'), def: y0 - 3, options: anneeOptions(y0 - 10, y0, T(l, 'Aucun', 'None')) },
    ],
    run: (v) => {
      const r = collection(v.y, v.c ? `${v.c}-06-15` : undefined);
      if (r.dispense) return { head: [T(l, 'Contrôle technique', 'Roadworthiness test'), T(l, 'Dispensé', 'Exempt')], rows: [[T(l, 'Raison', 'Reason'), T(l, `Mis en circulation avant le 1er janvier ${P.collection.dispense_avant_annee}`, `First registered before 1 January ${P.collection.dispense_avant_annee}`)], [T(l, 'Hors carte grise collection', 'Without a classic logbook'), T(l, 'Règles d’une voiture ordinaire', 'Ordinary car rules')]] };
      const prochain = r.prochain ? r.prochain.slice(0, 4) : null;
      return {
        head: [T(l, 'Prochain contrôle en', 'Next test in'), prochain ?? T(l, 'À faire', 'Due now')],
        rows: [
          [T(l, 'Périodicité', 'Interval'), T(l, `Tous les ${P.collection.periodicite_ans} ans`, `Every ${P.collection.periodicite_ans} years`)],
          [T(l, 'Prix médian « collection » en France', 'Median “classic” price in France'), prixL(NAT.co.med, l)],
          ...(prochain && Number(prochain) < y0 ? [[T(l, 'Situation', 'Status'), T(l, 'En retard', 'Overdue')] as [string, string]] : []),
        ],
        note: T(l, 'Calcul à l’année ; la date exacte est celle du dernier contrôle plus 5 ans.', 'Worked to the year; the exact date is the last test plus 5 years.'),
      };
    },
  };
};

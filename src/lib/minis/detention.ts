/** Combien coûteront les contrôles d'une voiture sur la durée de détention. */
import { T, type L } from './_kit';
import { DEP, NAT, depOptions, depAt, depIndex, nomDep, prixL } from './_ct';
import { coutDetention } from '../engine/ct';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Combien de contrôles vais-je payer pour cette voiture ?', 'How many tests will I pay for this car?'),
  cta: T(l, 'Trouver le centre le moins cher', 'Find the cheapest centre'),
  inputs: [
    { id: 'a', label: T(l, 'Âge de la voiture à l’achat', 'Car age when bought'), def: 3, max: 30, unit: T(l, 'ans', 'years') },
    { id: 'n', label: T(l, 'Je la garde', 'I keep it for'), def: 6, max: 30, unit: T(l, 'ans', 'years') },
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('44'), options: depOptions() },
  ],
  run: (v) => {
    const d = depAt(v.d), med = DEP[d][1].e ?? NAT.e.med, min = DEP[d][5] ?? med;
    const r = coutDetention(Math.round(v.a), Math.round(v.n), med);
    return {
      head: [T(l, `${r.controles} contrôle${r.controles > 1 ? 's' : ''}, au prix médian de ${nomDep(d)}`, `${r.controles} test${r.controles > 1 ? 's' : ''}, at the median price in ${nomDep(d)}`), prixL(r.total, l)],
      rows: [
        [T(l, 'Au centre le moins cher du département', 'At the cheapest centre in the département'), prixL(r.controles * min, l)],
        [T(l, 'Économie possible', 'Possible saving'), prixL(r.total - r.controles * min, l)],
        [T(l, 'Prix médian utilisé', 'Median price used'), prixL(med, l)],
      ],
      note: T(l, 'Premier contrôle à 4 ans, puis tous les 2 ans ; hors contre-visite. Prix déclarés du jour, sans hausse future supposée.', 'First test at 4 years, then every 2 years; re-checks excluded. Today’s declared prices, with no assumed future rise.'),
    };
  },
});

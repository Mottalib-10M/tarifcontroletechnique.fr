/** Un prix annoncé est-il cher ? Comparaison avec la médiane du département et la France. */
import { T, type L } from './_kit';
import { DEP, NAT, depOptions, depAt, depIndex, nomDep, prixL } from './_ct';
import { ecart } from '../engine/ct';
import { formatPercent } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Le prix qu’on m’annonce est-il cher ?', 'Is the price I was quoted expensive?'),
  cta: T(l, 'Voir les centres moins chers autour', 'See cheaper centres nearby'),
  inputs: [
    { id: 'p', label: T(l, 'Prix annoncé (voiture essence)', 'Price quoted (petrol car)'), def: 89, max: 250, unit: '€' },
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('13'), options: depOptions() },
  ],
  run: (v) => {
    const d = depAt(v.d), med = DEP[d][1].e ?? NAT.e.med, e = ecart(v.p, med);
    const verdict = v.p > NAT.e.p90 ? T(l, 'Parmi les 10 % les plus chers de France', 'Among the dearest 10% in France') : v.p < NAT.e.p10 ? T(l, 'Parmi les 10 % les moins chers de France', 'Among the cheapest 10% in France') : T(l, 'Dans la fourchette courante en France', 'Within the usual French range');
    return {
      head: [T(l, `Écart avec la médiane de ${nomDep(d)}`, `Gap with the ${nomDep(d)} median`), `${e >= 0 ? '+' : ''}${formatPercent(e, 0, l)}`],
      rows: [
        [T(l, 'Médiane du département', 'Département median'), prixL(med, l)],
        [T(l, 'Le moins cher du département', 'Cheapest in the département'), DEP[d][5] != null ? prixL(DEP[d][5]!, l) : '—'],
        [T(l, 'France : 1 centre sur 10 sous / au-dessus de', 'France: 1 centre in 10 below / above'), `${prixL(NAT.e.p10, l)} / ${prixL(NAT.e.p90, l)}`],
        [T(l, 'Verdict', 'Verdict'), verdict],
      ],
    };
  },
});

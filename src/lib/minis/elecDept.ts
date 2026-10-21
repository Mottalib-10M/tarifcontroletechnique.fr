/** Électrique ou hybride contre essence : écart de prix dans un département. */
import { T, type L } from './_kit';
import { DEP, NAT, ELEC_PLUS_CHER, depOptions, depAt, depIndex, nomDep, prixL } from './_ct';
import { formatPercent } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Électrique ou hybride : combien de plus que l’essence ?', 'Electric or hybrid: how much more than petrol?'),
  cta: T(l, 'Trouver le centre le moins cher pour mon électrique', 'Find the cheapest centre for my EV'),
  inputs: [{ id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('33'), options: depOptions() }],
  run: (v) => {
    const d = depAt(v.d), x = DEP[d], e = x[1].e, el = x[1].el, h = x[1].h;
    return {
      head: [T(l, `Électrique, médiane ${nomDep(d)}`, `Electric, median in ${nomDep(d)}`), el != null ? prixL(el, l) : '—'],
      rows: [
        [T(l, 'Essence, même département', 'Petrol, same département'), e != null ? prixL(e, l) : '—'],
        [T(l, 'Hybride', 'Hybrid'), h != null ? prixL(h, l) : '—'],
        [T(l, 'Centres qui facturent l’électrique plus cher', 'Centres charging more for EVs'), x[7] != null ? formatPercent(x[7], 0, l) : '—'],
        [T(l, 'France : électrique / essence', 'France: electric / petrol'), `${prixL(NAT.el.med, l)} / ${prixL(NAT.e.med, l)} · ${formatPercent(ELEC_PLUS_CHER, 0, l)}`],
      ],
    };
  },
});

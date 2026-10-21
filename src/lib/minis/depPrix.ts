/** Prix médian d'un département pour un véhicule, centre le moins cher, écart avec la France. */
import { T, type L } from './_kit';
import { DEP, NAT, depOptions, depAt, depIndex, nomDep, prixL, vehOptions } from './_ct';
import { ecart, type Key } from '../engine/ct';
import { formatPercent } from '../format';
import type { MiniSpec } from '../mini-types';

const K: Key[] = ['e', 'd', 'h', 'el', 'g', 'm', 'cy', 'cc', 'u'];
export default (l: L): MiniSpec => ({
  title: T(l, 'Le contrôle le moins cher de mon département', 'The cheapest test in my département'),
  cta: T(l, 'Voir les centres autour de ma commune', 'See the centres around my town'),
  inputs: [
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('59'), options: depOptions() },
    { id: 'k', label: T(l, 'Véhicule', 'Vehicle'), def: 0, options: vehOptions(l, K) },
  ],
  run: (v) => {
    const d = depAt(v.d), x = DEP[d], k = K[v.k] ?? 'e', med = x[1][k], nat = NAT[k]?.med;
    return {
      head: [T(l, `Prix médian, ${nomDep(d)}`, `Median price, ${nomDep(d)}`), med != null ? prixL(med, l) : '—'],
      rows: [
        ...(k === 'e' && x[5] != null ? [[T(l, `Le moins cher (${x[6]})`, `Cheapest (${x[6]})`), prixL(x[5], l)] as [string, string]] : []),
        ...(med != null && nat ? [[T(l, 'Écart avec la médiane nationale', 'Gap with the national median'), `${med >= nat ? '+' : ''}${formatPercent(ecart(med, nat), 0, l)}`] as [string, string]] : []),
        [T(l, 'Médiane France', 'France median'), nat ? prixL(nat, l) : '—'],
        [T(l, 'Centres agréés dans le département', 'Approved centres in the département'), String(x[0])],
      ],
    };
  },
});

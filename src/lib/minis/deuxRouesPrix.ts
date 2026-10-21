/** Prix du contrôle d'un deux-roues, tricycle, quad ou voiturette dans un département. */
import { T, type L } from './_kit';
import { DEP, NAT, CVM, depOptions, depAt, depIndex, nomDep, prixL, vehOptions } from './_ct';
import type { Key } from '../engine/ct';
import type { MiniSpec } from '../mini-types';

const K: Key[] = ['m', 'cy', 'q', 'tr', 'vt'];
export default (l: L): MiniSpec => ({
  title: T(l, 'Prix du contrôle deux-roues dans mon département', 'Two-wheeler test price in my département'),
  cta: T(l, 'Voir les centres moto autour de moi', 'See motorcycle centres near me'),
  inputs: [
    { id: 'k', label: T(l, 'Véhicule', 'Vehicle'), def: 1, options: vehOptions(l, K) },
    { id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('06'), options: depOptions() },
  ],
  run: (v) => {
    const d = depAt(v.d), k = K[v.k] ?? 'm', med = DEP[d][1][k];
    return {
      head: [T(l, `Prix médian, ${nomDep(d)}`, `Median price, ${nomDep(d)}`), med != null ? prixL(med, l) : T(l, 'aucun centre', 'no centre')],
      rows: [
        [T(l, 'Médiane France', 'France median'), prixL(NAT[k].med, l)],
        [T(l, 'Centres en France pour ce véhicule', 'Centres in France for this vehicle'), String(NAT[k].n)],
        [T(l, 'Contre-visite deux-roues (médianes France)', 'Two-wheeler re-check (French medians)'), `${prixL(CVM.min.med, l)} – ${prixL(CVM.max.med, l)}`],
      ],
    };
  },
});

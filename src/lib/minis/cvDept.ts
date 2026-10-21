/** Contre-visite dans un département : fourchette médiane et part des centres qui la font gratuite. */
import { T, type L } from './_kit';
import { DEP, CV, depOptions, depAt, depIndex, nomDep, prixL } from './_ct';
import { formatPercent } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Contre-visite dans mon département : combien ?', 'Re-inspection in my département: how much?'),
  cta: T(l, 'Voir chaque centre et sa contre-visite', 'See each centre and its re-inspection'),
  inputs: [{ id: 'd', label: T(l, 'Département', 'Département'), def: depIndex('69'), options: depOptions() }],
  run: (v) => {
    const d = depAt(v.d), x = DEP[d];
    return {
      head: [T(l, `Contre-visite voiture, ${nomDep(d)}`, `Car re-inspection, ${nomDep(d)}`), x[3] != null ? `${prixL(x[2] ?? 0, l)} – ${prixL(x[3], l)}` : '—'],
      rows: [
        [T(l, 'Centres qui la font parfois gratuite', 'Centres where it can be free'), formatPercent(x[4], 0, l)],
        [T(l, 'France : fourchette médiane', 'France: median range'), `${prixL(CV.min.med, l)} – ${prixL(CV.max.med, l)}`],
        [T(l, 'France : part gratuite possible', 'France: free share'), formatPercent(CV.gratuite, 0, l)],
      ],
      note: T(l, 'Le bas de la fourchette vaut pour une simple vérification, le haut pour un passage sur les bancs ; le centre doit l’afficher.', 'The low end is for a visual check, the high end for a pass on the test equipment; the centre must display both.'),
    };
  },
});

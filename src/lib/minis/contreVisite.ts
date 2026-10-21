/** Après un contrôle défavorable : contre-visite avant quand, rouler ou non, combien (fiche F33354). */
import { T, type L } from './_kit';
import { TODAY, prixL, CV, dateL, NAT } from './_ct';
import { apresDefavorable, addDays } from '../engine/index';
import { formatPercent } from '../format';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Contre-visite : avant quand, et gratuite ou payante ?', 'Re-inspection: by when, and free or paid?'),
  cta: T(l, 'Comparer les contre-visites près de chez moi', 'Compare re-inspections near me'),
  inputs: [
    { id: 'r', label: T(l, 'Résultat du contrôle', 'Test result'), def: 0, options: [{ value: '0', label: T(l, 'S : défaillance majeure', 'S: major defect') }, { value: '1', label: T(l, 'R : défaillance critique', 'R: critical defect') }] },
    { id: 'j', label: T(l, 'Contrôle passé il y a (jours)', 'Test taken (days ago)'), def: 0, max: 120, unit: T(l, 'jours', 'days') },
  ],
  run: (v) => {
    const ct = addDays(TODAY, -Math.round(v.j));
    const a = apresDefavorable(ct, v.r ? 'R' : 'S');
    const depasse = a.contreVisiteAvant < TODAY;
    return {
      head: depasse ? [T(l, 'Délai dépassé depuis le', 'Window closed on'), dateL(a.contreVisiteAvant, l)] : [T(l, 'Contre-visite au plus tard le', 'Re-inspection by'), dateL(a.contreVisiteAvant, l)],
      rows: [
        [T(l, 'Rouler en attendant', 'Driving meanwhile'), v.r ? T(l, 'Le jour du contrôle seulement', 'On the day of the test only') : T(l, 'Oui, jusqu’à cette date', 'Yes, until that date')],
        [T(l, 'Prix de la contre-visite (médianes France)', 'Re-inspection price (French medians)'), `${prixL(CV.min.med, l)} – ${prixL(CV.max.med, l)}`],
        [T(l, 'Centres qui la font parfois gratuite', 'Centres where it can be free'), formatPercent(CV.gratuite, 0, l)],
        [depasse ? T(l, 'À repasser : contrôle complet', 'Now needed: full test') : T(l, 'Hors délai : contrôle complet', 'After the window: full test'), prixL(NAT.e.med, l)],
      ],
      note: T(l, 'Délai de 2 mois à compter du contrôle, dans le même centre ou un autre. Le centre affiche quand la contre-visite est gratuite (souvent : simple vérification visuelle).', 'Two months from the test, at the same centre or another. Centres display when the re-check is free (often a visual check only).'),
    };
  },
});

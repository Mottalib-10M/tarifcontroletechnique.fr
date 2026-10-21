/** Camionnette (N1) : contrôle complémentaire pollution chaque année entre deux contrôles (fiche F33353). */
import { T, moisAnnee, moisOptions, type L } from './_kit';
import { TODAY, anneeOptions, prixL, NAT } from './_ct';
import { pollutionCamionnette, finValidite, iso } from '../engine/index';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => {
  const y0 = Number(TODAY.slice(0, 4));
  return {
    title: T(l, 'Camionnette : quand passer le contrôle pollution ?', 'Van: when is the emissions check due?'),
    cta: T(l, 'Comparer les prix camionnette', 'Compare van prices'),
    inputs: [
      { id: 'm', label: T(l, 'Dernier contrôle complet : mois', 'Last full test: month'), def: 5, options: moisOptions(l) },
      { id: 'y', label: T(l, 'Année', 'Year'), def: y0 - 1, options: anneeOptions(y0 - 3, y0) },
    ],
    run: (v) => {
      const ct = iso(v.y, v.m, 1);
      const p = pollutionCamionnette(ct);
      return {
        head: [T(l, 'Contrôle pollution entre', 'Emissions check between'), `${moisAnnee(p.debut, l)} – ${moisAnnee(p.fin, l)}`],
        rows: [
          [T(l, 'Prochain contrôle complet avant', 'Next full test before'), moisAnnee(finValidite(ct, P.voiture.validite_favorable_ans), l)],
          [T(l, 'Prix médian du contrôle camionnette', 'Median van test price'), prixL(NAT.u.med, l)],
          [T(l, 'Contrôle pollution seul', 'Emissions check alone'), T(l, 'Prix non publié dans le fichier', 'Price not in the public file')],
        ],
        note: T(l, 'Le fichier public de la DGCCRF ne contient pas le prix du contrôle pollution : demandez-le au centre.', 'The DGCCRF public file has no price for the emissions check: ask the centre.'),
      };
    },
  };
};

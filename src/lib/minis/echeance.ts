/** Voiture : quand faire le prochain contrôle ? Premier à 4 ans, puis tous les 2 ans (fiche Service Public F33354). */
import { T, moisAnnee, moisOptions, type L } from './_kit';
import { TODAY, anneeOptions, prixL, NAT } from './_ct';
import { echeanceVoiture, iso } from '../engine/index';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => {
  const y0 = Number(TODAY.slice(0, 4));
  return {
    title: T(l, 'Mon contrôle est-il obligatoire, et avant quand ?', 'Is my test due, and by when?'),
    cta: T(l, 'Trouver le centre le moins cher', 'Find the cheapest centre'),
    inputs: [
      { id: 'mm', label: T(l, 'Mise en circulation : mois', 'First registered: month'), def: 3, options: moisOptions(l) },
      { id: 'my', label: T(l, 'Année (case B de la carte grise)', 'Year (box B of the logbook)'), def: y0 - 4, options: anneeOptions(1960, y0) },
      { id: 'cm', label: T(l, 'Dernier contrôle favorable : mois', 'Last pass: month'), def: 3, options: moisOptions(l) },
      { id: 'cy', label: T(l, 'Année du dernier contrôle', 'Year of last pass'), def: 0, options: anneeOptions(y0 - 6, y0, T(l, 'Aucun encore', 'None yet')) },
    ],
    run: (v) => {
      const mec = iso(v.my, v.mm, 1);
      const ct = v.cy ? iso(v.cy, v.cm, 1) : null;
      const e = echeanceVoiture(mec, ct, TODAY);
      const finMois = e.fin.slice(0, 7) + '-01';
      const retard = e.jours < 0;
      const rows: Array<[string, string]> = [
        [T(l, 'Nature du contrôle', 'Type of test'), e.type === 'premier' ? T(l, 'Premier contrôle (4 ans)', 'First test (4 years)') : T(l, 'Contrôle périodique (2 ans)', 'Periodic test (2 years)')],
      ];
      if (e.type === 'premier' && 'debut' in e && e.debut) rows.push([T(l, 'Possible dès', 'Possible from'), moisAnnee(e.debut, l)]);
      rows.push(retard ? [T(l, 'En retard depuis', 'Overdue for'), T(l, `≈ ${Math.round(-e.jours / 30)} mois`, `≈ ${Math.round(-e.jours / 30)} months`)] : [T(l, 'Il reste', 'Time left'), T(l, `≈ ${Math.max(0, Math.round(e.jours / 30))} mois`, `≈ ${Math.max(0, Math.round(e.jours / 30))} months`)]);
      rows.push([T(l, 'Prix médian en France (essence)', 'Median price in France (petrol)'), prixL(NAT.e.med, l)]);
      if (retard) rows.push([T(l, 'Amende forfaitaire si contrôlé', 'Fixed fine if stopped'), prixL(P.sanctions.amende_forfaitaire, l)]);
      return {
        head: [retard ? T(l, 'Contrôle à faire sans attendre : la limite était', 'Test needed now: the deadline was') : T(l, 'À faire au plus tard en', 'Due at the latest in'), moisAnnee(finMois, l)],
        rows,
        note: T(l, `Calcul au mois près, jour du ${TODAY.split('-').reverse().join('/')} : la limite exacte est la veille de l'anniversaire de la date de la case B (premier contrôle) ou du dernier contrôle.`, `Worked to the month, as of ${TODAY}: the exact deadline is the day before the anniversary of the box B date (first test) or of the last test.`),
      };
    },
  };
};

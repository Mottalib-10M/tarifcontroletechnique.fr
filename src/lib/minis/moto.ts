/** Deux-roues, tricycle, quad, voiturette : premier contrôle selon l'année de mise en circulation (fiche F37538). */
import { T, moisAnnee, moisOptions, type L } from './_kit';
import { TODAY, anneeOptions, prixL, NAT } from './_ct';
import { premierControleDeuxRoues, iso, addYears } from '../engine/index';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => {
  const y0 = Number(TODAY.slice(0, 4));
  return {
    title: T(l, 'Ma moto ou mon scooter : premier contrôle quand ?', 'My motorbike or scooter: when is the first test?'),
    cta: T(l, 'Voir les prix moto près de chez moi', 'See motorcycle prices near me'),
    inputs: [
      { id: 'mm', label: T(l, 'Mise en circulation : mois', 'First registered: month'), def: 6, options: moisOptions(l) },
      { id: 'my', label: T(l, 'Année', 'Year'), def: 2021, options: anneeOptions(1990, y0) },
    ],
    run: (v) => {
      const r = premierControleDeuxRoues(iso(v.my, v.mm, 1));
      const rows: Array<[string, string]> = [];
      let head: [string, string];
      if (r.cas === 'echu') {
        head = [T(l, 'Premier contrôle : déjà dû depuis', 'First test: already due since'), r.fin.slice(0, 4) === '2024' ? T(l, 'fin 2024', 'end of 2024') : T(l, 'fin 2025', 'end of 2025')];
        rows.push([T(l, 'Situation', 'Status'), T(l, 'À faire sans attendre', 'Book it now')]);
      } else if (r.cas === 'calendrier2026') {
        head = [T(l, 'Premier contrôle avant fin', 'First test before the end of'), moisAnnee(r.fin, l)];
        rows.push([T(l, 'Règle', 'Rule'), T(l, '4 mois après l’anniversaire 2026, au plus tard le 31 décembre 2026', '4 months after the 2026 anniversary, 31 December 2026 at the latest')]);
      } else {
        head = [T(l, 'Premier contrôle avant', 'First test before'), moisAnnee(addYears(iso(v.my, v.mm, 1), P.deux_roues.premier_controle_ans_depuis_2022), l)];
        rows.push([T(l, 'Possible dès', 'Possible from'), moisAnnee(r.debut!, l)]);
      }
      rows.push([T(l, 'Puis tous les', 'Then every'), T(l, `${P.deux_roues.validite_favorable_ans} ans`, `${P.deux_roues.validite_favorable_ans} years`)]);
      rows.push([T(l, 'Prix médian : moto / 50 cm³', 'Median price: motorbike / 50 cc'), `${prixL(NAT.m.med, l)} / ${prixL(NAT.cy.med, l)}`]);
      return { head, rows, note: T(l, 'Calendrier de la fiche Service Public des deux-roues ; la date exacte dépend du jour inscrit en case B.', 'Timetable from the Service Public page on two-wheelers; the exact date depends on the day in box B.') };
    },
  };
};

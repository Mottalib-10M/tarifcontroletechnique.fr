/** Vendre un véhicule d'occasion : faut-il un contrôle de moins de 6 mois ? (fiches F16540 et F1707). */
import { T, yesNoOpts, type L } from './_kit';
import { prixL, NAT } from './_ct';
import { venteObligatoire } from '../engine/ct';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';

export default (l: L): MiniSpec => ({
  title: T(l, 'Je vends : faut-il un contrôle technique ?', 'Selling: do I need a test?'),
  cta: T(l, 'Trouver un centre pas cher avant la vente', 'Find a cheap centre before selling'),
  inputs: [
    { id: 't', label: T(l, 'Véhicule', 'Vehicle'), def: 0, options: [{ value: '0', label: T(l, 'Voiture, camionnette', 'Car, van') }, { value: '1', label: T(l, 'Moto, scooter, quad', 'Motorbike, scooter, quad') }] },
    { id: 'a', label: T(l, 'Âge du véhicule', 'Vehicle age'), def: 8, max: 60, unit: T(l, 'ans', 'years') },
    { id: 'm', label: T(l, 'Dernier contrôle il y a', 'Last test taken'), def: 10, max: 120, unit: T(l, 'mois', 'months') },
    { id: 'p', label: T(l, 'Acheteur professionnel', 'Buyer is a trader'), def: 0, options: yesNoOpts(l) },
  ],
  run: (v) => {
    const r = venteObligatoire({ deuxRoues: v.t === 1, ageAns: v.a, moisDepuisDernierCt: v.m, acheteurPro: v.p === 1 });
    const raison = { jeune: T(l, `Moins de ${v.t ? P.deux_roues.vente_age_min_ans : P.voiture.vente_age_min_ans} ans : pas de contrôle exigé`, `Under ${v.t ? P.deux_roues.vente_age_min_ans : P.voiture.vente_age_min_ans} years old: no test needed`), pro: T(l, 'Vente à un professionnel de l’automobile : non exigé', 'Sale to a motor trader: not required'), recent: T(l, 'Le dernier contrôle a moins de 6 mois : il suffit', 'Last test is under 6 months old: it is enough'), 'a-faire': T(l, 'Contrôle de moins de 6 mois à remettre à l’acheteur', 'A test under 6 months old must be handed to the buyer') }[r.raison];
    return {
      head: [T(l, 'Contrôle technique pour vendre', 'Test needed to sell'), r.obligatoire ? T(l, 'Oui', 'Yes') : T(l, 'Non', 'No')],
      rows: [
        [T(l, 'Pourquoi', 'Why'), raison],
        [T(l, 'Si une contre-visite est prescrite', 'If a re-check is prescribed'), T(l, 'Dans les 2 mois du contrôle', 'Within 2 months of the test')],
        [T(l, 'Prix médian en France', 'Median price in France'), prixL(v.t ? NAT.m.med : NAT.e.med, l)],
      ],
    };
  },
});

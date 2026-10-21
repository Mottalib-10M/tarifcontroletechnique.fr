/**
 * Moteur du site : centres, prix et échéances du contrôle technique. Fonctions pures, testées
 * (ct.test.ts). Les prix viennent du fichier de la DGCCRF relu chaque jour (scripts/update-data.mjs) ;
 * les règles de date viennent de params-2026.json, avec les exemples des fiches Service Public en tests.
 */
import { P } from './params';
import { addDays, addMonths, addYears, parse, daysBetween } from './dates';

export type Lang = 'fr' | 'en';
export type Key = 'e' | 'd' | 'g' | 'h' | 'el' | 'm' | 'cy' | 'q' | 'vt' | 'tr' | 'cc' | 'u' | 'x4' | 'co';
/** [prix de la visite, contre-visite mini, contre-visite maxi], en euros TTC, tels que le centre les déclare. */
export type Tarif = [number, number | null, number | null];
export interface Centre {
  n: string; a: string; cp: string; v: string; d: string; la: number | null; lo: number | null;
  /** Dernière mise à jour de la fiche par le centre ; date d'application du tarif voiture. */
  u: string; dt: string;
  t: Partial<Record<Key, Tarif>>;
  km?: number;
}
export type CentreRaw = [string, string, string, string, string, number | null, number | null, string, string, Partial<Record<Key, Tarif>>, number?];
export const decode = (r: CentreRaw): Centre => ({ n: r[0], a: r[1], cp: r[2], v: r[3], d: r[4], la: r[5], lo: r[6], u: r[7], dt: r[8], t: r[9], ...(r[10] != null ? { km: r[10] } : {}) });

export interface Vehicule { key: Key; fr: string; en: string; court: { fr: string; en: string }; groupe: 'voiture' | 'deuxRoues' | 'autre' }
export const VEHICULES: Vehicule[] = [
  { key: 'e', fr: 'Voiture essence', en: 'Petrol car', court: { fr: 'essence', en: 'petrol' }, groupe: 'voiture' },
  { key: 'd', fr: 'Voiture diesel', en: 'Diesel car', court: { fr: 'diesel', en: 'diesel' }, groupe: 'voiture' },
  { key: 'h', fr: 'Voiture hybride', en: 'Hybrid car', court: { fr: 'hybride', en: 'hybrid' }, groupe: 'voiture' },
  { key: 'el', fr: 'Voiture électrique', en: 'Electric car', court: { fr: 'électrique', en: 'electric' }, groupe: 'voiture' },
  { key: 'g', fr: 'Voiture au gaz (GPL, GNV)', en: 'Gas car (LPG, CNG)', court: { fr: 'gaz', en: 'gas' }, groupe: 'voiture' },
  { key: 'm', fr: 'Moto', en: 'Motorcycle', court: { fr: 'moto', en: 'motorcycle' }, groupe: 'deuxRoues' },
  { key: 'cy', fr: 'Scooter ou cyclomoteur 50 cm³', en: '50 cc scooter or moped', court: { fr: 'cyclomoteur', en: 'moped' }, groupe: 'deuxRoues' },
  { key: 'q', fr: 'Quad', en: 'Quad bike', court: { fr: 'quad', en: 'quad' }, groupe: 'deuxRoues' },
  { key: 'tr', fr: 'Tricycle ou side-car', en: 'Trike or sidecar', court: { fr: 'tricycle', en: 'trike' }, groupe: 'deuxRoues' },
  { key: 'vt', fr: 'Voiturette sans permis', en: 'Microcar (no licence)', court: { fr: 'voiturette', en: 'microcar' }, groupe: 'deuxRoues' },
  { key: 'cc', fr: 'Camping-car diesel (3,5 t max.)', en: 'Diesel motorhome (up to 3.5 t)', court: { fr: 'camping-car', en: 'motorhome' }, groupe: 'autre' },
  { key: 'u', fr: 'Camionnette diesel', en: 'Diesel van', court: { fr: 'camionnette', en: 'van' }, groupe: 'autre' },
  { key: 'x4', fr: '4 x 4 diesel', en: 'Diesel 4x4', court: { fr: '4 x 4', en: '4x4' }, groupe: 'autre' },
  { key: 'co', fr: 'Voiture de collection (essence)', en: 'Classic car (petrol)', court: { fr: 'collection', en: 'classic' }, groupe: 'autre' },
];
export const vehicule = (k: Key) => VEHICULES.find((v) => v.key === k)!;

export interface Resume { n: number; moy: number; med: number; p10: number; p90: number; min: number; max: number }
const r2 = (x: number) => Math.round(x * 100) / 100;
export function quantile(sorted: number[], p: number): number {
  const i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return r2(sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo));
}
/** Moyenne, médiane, déciles. Les zéros ne comptent que si `zero` (contre-visite gratuite). */
export function summary(values: Array<number | null | undefined>, zero = false): Resume | null {
  const v = values.filter((x): x is number => x != null && (zero ? x >= 0 : x > 0)).sort((a, b) => a - b);
  if (!v.length) return null;
  return { n: v.length, moy: r2(v.reduce((a, b) => a + b, 0) / v.length), med: quantile(v, 0.5), p10: quantile(v, 0.1), p90: quantile(v, 0.9), min: v[0], max: v[v.length - 1] };
}

/** Distance à vol d'oiseau en km (haversine). */
export function km(la1: number, lo1: number, la2: number, lo2: number): number {
  const t = Math.PI / 180, R = 6371;
  const x = Math.sin(((la2 - la1) * t) / 2) ** 2 + Math.cos(la1 * t) * Math.cos(la2 * t) * Math.sin(((lo2 - lo1) * t) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * Centres qui contrôlent ce véhicule autour d'un point : tous ceux du rayon, et au moins `min`
 * (le rayon s'élargit pour une commune isolée). Triés par distance.
 */
export function autour(centres: Centre[], la: number, lo: number, key: Key, rayon = 10, min = 5): Centre[] {
  const l = centres.filter((c) => c.t[key] && c.la != null && c.lo != null).map((c) => ({ ...c, km: Math.round(km(la, lo, c.la!, c.lo!) * 10) / 10 })).sort((a, b) => a.km - b.km);
  const dans = l.filter((c) => c.km <= rayon);
  return dans.length >= min ? dans : l.slice(0, min);
}

export interface Synthese { n: number; resume: Resume | null; moinsCher: Centre | null; plusCher: Centre | null; economie: number; cvGratuite: number; cvMax: Resume | null }
/** Ce que l'outil affiche pour une liste de centres et un véhicule. */
export function synthese(list: Centre[], key: Key): Synthese {
  const l = list.filter((c) => c.t[key]);
  const resume = summary(l.map((c) => c.t[key]![0]));
  const tri = [...l].sort((a, b) => a.t[key]![0] - b.t[key]![0] || (a.km ?? 0) - (b.km ?? 0));
  const moinsCher = tri[0] ?? null, plusCher = tri[tri.length - 1] ?? null;
  return {
    n: l.length, resume, moinsCher, plusCher,
    economie: resume && moinsCher ? r2(resume.med - moinsCher.t[key]![0]) : 0,
    cvGratuite: l.length ? l.filter((c) => c.t[key]![1] === 0).length / l.length : 0,
    cvMax: summary(l.map((c) => c.t[key]![2]), true),
  };
}
/** Écart relatif d'un prix à une référence (0,1 = 10 % plus cher). */
export const ecart = (prix: number, ref: number) => (ref > 0 ? prix / ref - 1 : 0);
/** Tarif déclaré il y a plus de trois ans : à confirmer au centre. */
export const tarifAncien = (dt: string, today: string) => !!dt && daysBetween(dt, today) > 3 * 365;

/* ---------------------------------------------------------------- échéances */

/** Premier contrôle d'une voiture ou d'une camionnette : dans les 6 mois avant le 4e anniversaire. */
export function premierControleVoiture(mec: string) {
  const anniv = addYears(mec, P.voiture.premier_controle_ans);
  return { debut: addMonths(anniv, -P.voiture.fenetre_avant_mois), fin: addDays(anniv, -1) };
}
/** Fin de validité d'un contrôle favorable (voiture : 2 ans, deux-roues : 3 ans), la veille de l'anniversaire. */
export const finValidite = (dateCt: string, ans: number) => addDays(addYears(dateCt, ans), -1);

export type Resultat = 'A' | 'S' | 'R';
/** Après un contrôle défavorable : validité du contrôle et date limite de la contre-visite. */
export function apresDefavorable(dateCt: string, r: Exclude<Resultat, 'A'>) {
  const limite = addDays(addMonths(dateCt, P.voiture.delai_contre_visite_mois), -1);
  return { valideJusquau: r === 'R' ? dateCt : limite, contreVisiteAvant: limite, rouleApres: r === 'S' };
}
/** Contre-visite favorable : la validité court depuis le contrôle défavorable d'origine. */
export const apresContreVisite = (dateCtDefavorable: string, deuxRoues = false) => finValidite(dateCtDefavorable, deuxRoues ? P.deux_roues.validite_favorable_ans : P.voiture.validite_favorable_ans);

/** Contrôle complémentaire pollution d'une camionnette : dans les 2 mois avant la fin d'un an. */
export function pollutionCamionnette(dateCt: string) {
  const fin = addDays(addYears(dateCt, 1), -1);
  return { debut: addMonths(addYears(dateCt, 1), -P.voiture.pollution_camionnette_mois_avant), fin };
}

/** Premier contrôle d'un deux-roues, tricycle ou quadricycle selon sa date de 1re mise en circulation. */
export function premierControleDeuxRoues(mec: string): { cas: 'echu' | 'calendrier2026' | 'fenetre'; debut?: string; fin: string } {
  const { y } = parse(mec);
  if (y < 2020) return { cas: 'echu', fin: y >= 2017 ? `${P.deux_roues.immat_2017_2019_annee}-12-31` : '2024-12-31' };
  if (y <= 2021) {
    const anniv2026 = addYears(mec, 2026 - y);
    const fin = addMonths(anniv2026, P.deux_roues.immat_2020_2021_mois_apres_anniversaire);
    return { cas: 'calendrier2026', fin: fin > P.deux_roues.immat_2020_2021_limite ? P.deux_roues.immat_2020_2021_limite : fin };
  }
  const anniv = addYears(mec, P.deux_roues.premier_controle_ans_depuis_2022);
  return { cas: 'fenetre', debut: addMonths(anniv, -P.deux_roues.fenetre_avant_mois), fin: addDays(anniv, -1) };
}

/** Véhicule de collection : dispensé avant 1960, sinon un contrôle tous les 5 ans (exemple de la fiche : 15 janvier 2024 → 15 janvier 2029). */
export function collection(anneeMec: number, dernierCt?: string) {
  if (anneeMec < P.collection.dispense_avant_annee) return { dispense: true as const };
  return { dispense: false as const, prochain: dernierCt ? addYears(dernierCt, P.collection.periodicite_ans) : undefined };
}

/** Vente d'occasion : faut-il un contrôle de moins de 6 mois ? */
export function venteObligatoire(o: { deuxRoues: boolean; ageAns: number; moisDepuisDernierCt: number | null; acheteurPro: boolean }) {
  const ageMin = o.deuxRoues ? P.deux_roues.vente_age_min_ans : P.voiture.vente_age_min_ans;
  if (o.ageAns < ageMin) return { obligatoire: false, raison: 'jeune' as const };
  if (o.acheteurPro) return { obligatoire: false, raison: 'pro' as const };
  if (o.moisDepuisDernierCt != null && o.moisDepuisDernierCt < P.voiture.vente_ct_moins_de_mois) return { obligatoire: false, raison: 'recent' as const };
  return { obligatoire: true, raison: 'a-faire' as const };
}

/** Prochaine échéance d'une voiture, à partir de sa mise en circulation et du dernier contrôle favorable. */
export function echeanceVoiture(mec: string, dernierCt: string | null, today: string) {
  const premier = premierControleVoiture(mec);
  if (!dernierCt || dernierCt < premier.debut) {
    return { type: 'premier' as const, debut: premier.debut, fin: premier.fin, jours: daysBetween(today, premier.fin) };
  }
  const fin = finValidite(dernierCt, P.voiture.validite_favorable_ans);
  return { type: 'periodique' as const, fin, jours: daysBetween(today, fin) };
}

/** Coût des contrôles sur une durée de détention (voiture : premier à 4 ans, puis tous les 2 ans). */
export function coutDetention(ageAchat: number, annees: number, prix: number) {
  let n = 0;
  for (let a = ageAchat + 1; a <= ageAchat + annees; a++) if (a >= 4 && (a - 4) % 2 === 0) n++;
  return { controles: n, total: n * prix };
}

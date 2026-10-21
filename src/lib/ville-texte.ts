/**
 * Chiffres d'une ville à page, tirés de data/ct/villes.json (relu chaque jour) : les textes des
 * pages villes ne contiennent aucun prix écrit à la main. Les comparaisons (« plus cher que… »)
 * sont calculées ici, pour qu'une phrase ne devienne jamais fausse quand le fichier change.
 */
import type { Helpers } from './guide-types';

type R = { n: number; moy: number; med: number; p10: number; p90: number; min: number; max: number };
type Ville = {
  code: string; nom: string; d: string; pop: number; cps: string[]; n: number; n15: number;
  s: Record<string, R | undefined>; s15: Record<string, R | undefined>;
  cv: { min: R; max: R; gratuite: number; n: number } | null; ancien: number | null;
  moinsCher: { n: string; v: string; cp: string; p: number; ex: number } | null; plusCher: { n: string; v: string; cp: string; p: number } | null;
  moinsCherMoto: { n: string; v: string; cp: string; p: number; ex: number } | null; moinsCher15: { n: string; v: string; cp: string; p: number; ex: number } | null;
  arr: Record<string, R> | null; voisines: Array<{ nom: string; km: number; s: R }>;
};

export function ville(h: Helpers, slug: string) {
  const v = (h.V as unknown as Record<string, Ville>)[slug];
  if (!v) throw new Error(`Ville inconnue : ${slug}`);
  const fr = h.lang === 'fr';
  const dep = (h.S.depts as unknown as Record<string, { centres: number; s: Record<string, R>; cv: { min: R; max: R; gratuite: number } }>)[v.d];
  const nat = h.S.national.s as unknown as Record<string, R>;
  const e = v.s.e, e15 = v.s15.e;
  /** « 12 % plus cher que », « 3 % moins cher que », « au même niveau que » : signe et seuil calculés. */
  const cmp = (a: number, b: number) => {
    const x = a / b - 1;
    if (Math.abs(x) < 0.015) return fr ? 'au même niveau que' : 'level with';
    return fr ? `${h.pct(Math.abs(x), 0)} ${x > 0 ? 'plus cher que' : 'moins cher que'}` : `${h.pct(Math.abs(x), 0)} ${x > 0 ? 'dearer than' : 'cheaper than'}`;
  };
  /** Même chose, sans pourcentage : « plus cher », « moins cher », « au même prix ». */
  const sens = (a: number, b: number, m = fr ? ['plus cher', 'moins cher', 'au même prix'] : ['dearer', 'cheaper', 'the same price']) => (a > b ? m[0] : a < b ? m[1] : m[2]);
  const nb = (n: number, un: string, plusieurs: string) => `${h.num(n)} ${n > 1 ? plusieurs : un}`;
  const arrTable = (caption: string) => {
    if (!v.arr) return '';
    const rows = Object.entries(v.arr).sort(([a], [b]) => a.localeCompare(b)).map(([cp, s]) => [cp, h.num(s.n), h.prix(s.med), h.prix(s.min), h.prix(s.max)]);
    return h.table(fr ? ['Code postal', 'Centres', 'Médiane', 'Mini', 'Maxi'] : ['Postcode', 'Centres', 'Median', 'Low', 'High'], rows, caption, ['l', 'r', 'r', 'r', 'r']);
  };
  const voisinesTable = (caption: string, max = 12) => {
    const rows = v.voisines.slice(0, max).map((x) => [x.nom, `${h.num(x.km, 1)} km`, h.num(x.s.n), h.prix(x.s.med), h.prix(x.s.min)]);
    return h.table(fr ? ['Commune', 'Distance', 'Centres', 'Médiane', 'Le moins cher'] : ['Town', 'Distance', 'Centres', 'Median', 'Cheapest'], rows, caption, ['l', 'r', 'r', 'r', 'r']);
  };
  /** Prix par véhicule dans la ville et dans les 15 km. */
  const vehTable = (caption: string) => {
    const K: Array<[string, string, string]> = [['e', 'Essence', 'Petrol'], ['d', 'Diesel', 'Diesel'], ['h', 'Hybride', 'Hybrid'], ['el', 'Électrique', 'Electric'], ['g', 'Gaz (GPL, GNV)', 'Gas (LPG, CNG)'], ['m', 'Moto', 'Motorcycle'], ['cy', 'Cyclomoteur 50 cm³', '50 cc moped'], ['cc', 'Camping-car', 'Motorhome']];
    const rows = K.filter(([k]) => v.s15[k]).map(([k, f, en]) => [fr ? f : en, v.s[k] ? h.prix(v.s[k]!.med) : '—', h.prix(v.s15[k]!.med), h.prix(v.s15[k]!.min), h.prix(nat[k].med)]);
    return h.table(fr ? ['Véhicule', v.nom, '15 km autour', 'Le moins cher à 15 km', 'France'] : ['Vehicle', v.nom, 'Within 15 km', 'Cheapest within 15 km', 'France'], rows, caption, ['l', 'r', 'r', 'r', 'r']);
  };
  const fichier = h.date(h.S.meta.fichier);
  return { v, dep, nat, e, e15, cmp, sens, nb, arrTable, voisinesTable, vehTable, fichier, depNom: h.dep(v.d), depMed: dep.s.e.med, natMed: nat.e.med };
}

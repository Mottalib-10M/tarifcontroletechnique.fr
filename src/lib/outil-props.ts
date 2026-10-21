/** Propriétés de l'outil des centres pour une ville à page : commune, centres proches, médianes de référence (calculées au build). */
import S from '../data/ct/stats.json';
import V from '../data/ct/villes.json';
import type { CentreRaw, Key } from './engine/ct';
import type { Lieu, Refs } from '../components/ct/CentresTool';

type Stats = Record<string, { med: number } | undefined>;
const meds = (s: Stats) => Object.fromEntries(Object.entries(s).filter(([, v]) => v).map(([k, v]) => [k, v!.med])) as Partial<Record<Key, number>>;
export const NAT = meds(S.national.s as Stats);

export function outilVille(ville = 'paris'): { lieu: Lieu; initial: CentreRaw[]; refs: Refs } {
  const v = (V as Record<string, (typeof V)['paris']>)[ville];
  if (!v) throw new Error(`Ville inconnue : ${ville}`);
  const dep = (S.depts as Record<string, { s: Stats }>)[v.d];
  return {
    lieu: { nom: v.nom, d: v.d, la: v.la, lo: v.lo, cps: v.cps },
    initial: v.liste as unknown as CentreRaw[],
    refs: { nat: NAT, d: v.d, dep: meds(dep.s) },
  };
}

/** Données communes aux mini-simulateurs du contrôle technique (fichier ignoré par le registre : préfixe « _ »). */
import DM from '../../data/ct/dep-mini.json';
import F from '../../data/ct/fichier.json';
import { DEPARTEMENTS } from '../../data/ct/departements';
import { displayDate, formatMoney } from '../format';
import { VEHICULES, type Key } from '../engine/ct';
import type { L } from './_kit';

/** Jour de référence : la date du fichier lu au build, identique au serveur et au navigateur (RECETTE §17.5). */
export const TODAY = F.releve;
export const FICHIER = F.fichier;
type Ligne = [number, Record<string, number>, number | null, number | null, number, number | null, string, number | null];
export const DEP = DM.d as unknown as Record<string, Ligne>;
export const NAT = DM.n as unknown as Record<string, { med: number; p10: number; p90: number; n: number }>;
export const CV = DM.cv;
export const CVM = DM.cvm;
export const ELEC_PLUS_CHER = DM.elecPlusCher;
export const DEPS = Object.keys(DEP);
/** Liste des départements pour un champ de choix : « 63 · Puy-de-Dôme ». La valeur est l'index (les champs sont numériques). */
export const depOptions = () => DEPS.map((d, i) => ({ value: String(i), label: `${d} · ${DEPARTEMENTS[d]}` }));
export const depAt = (i: number) => DEPS[Math.max(0, Math.min(DEPS.length - 1, Math.round(i)))];
export const depIndex = (d: string) => Math.max(0, DEPS.indexOf(d));
export const nomDep = (d: string) => DEPARTEMENTS[d] ?? d;
export const vehOptions = (l: L, keys: Key[]) => keys.map((k, i) => ({ value: String(i), label: VEHICULES.find((v) => v.key === k)![l] }));
export const dateL = (iso: string, l: L) => displayDate(iso, l === 'en' ? 'en-GB' : 'fr-FR');
export const anneeOptions = (from: number, to: number, aucun?: string) => [
  ...(aucun ? [{ value: '0', label: aucun }] : []),
  ...Array.from({ length: to - from + 1 }, (_, i) => String(to - i)).map((y) => ({ value: y, label: y })),
];
export const prixL = (x: number, l: L) => formatMoney(x, Number.isInteger(x) ? 0 : 2, l);

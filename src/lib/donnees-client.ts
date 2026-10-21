/**
 * Chargement, dans le navigateur, des deux fichiers publics régénérés chaque jour par
 * scripts/update-data.mjs : tous les centres et l'index des communes. Ils ne sont demandés qu'à la
 * première recherche d'une autre commune (jamais au premier rendu, RECETTE §17.5), une seule fois.
 * Ce sont des fichiers du site lui-même : rien de ce que vous tapez ne part ailleurs.
 */
import { decode, type Centre, type CentreRaw } from './engine/ct';

export type CommuneRaw = [string, string, string, number, number];
export interface Commune { nom: string; cps: string[]; d: string; la: number; lo: number; cle: string }
export const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\bst\b/g, 'saint').replace(/\bste\b/g, 'sainte').trim();

let pc: Promise<Centre[]> | null = null;
let pm: Promise<Commune[]> | null = null;
export function chargerCentres(): Promise<Centre[]> {
  pc ??= fetch('/data/centres.json').then((r) => r.json()).then((j: { c: CentreRaw[] }) => j.c.map(decode));
  return pc;
}
export function chargerCommunes(): Promise<Commune[]> {
  pm ??= fetch('/data/communes.json').then((r) => r.json()).then((l: CommuneRaw[]) => l.map(([nom, cps, d, la, lo]) => ({ nom, cps: cps.split(' '), d, la, lo, cle: normaliser(nom) })));
  return pm;
}
/** Suggestions : code postal (début), sinon nom (début, puis contenu), les plus peuplées d'abord. */
export function chercher(communes: Commune[], q: string, max = 8): Commune[] {
  const s = q.trim();
  if (!s) return [];
  if (/^\d/.test(s)) return communes.filter((c) => c.cps.some((cp) => cp.startsWith(s.replace(/\s/g, '')))).slice(0, max);
  const n = normaliser(s);
  if (n.length < 2) return [];
  const debut = communes.filter((c) => c.cle.startsWith(n));
  const dedans = debut.length >= max ? [] : communes.filter((c) => !c.cle.startsWith(n) && c.cle.includes(n));
  return [...debut, ...dedans].slice(0, max);
}
/** Le centre est-il dans la commune ? Même code postal, et nom qui commence par celui de la commune (« Paris 11e »). */
export function dansCommune(c: Centre, com: { nom: string; cps: string[] }): boolean {
  if (!com.cps.includes(c.cp)) return false;
  const a = normaliser(c.v), b = normaliser(com.nom);
  return a === b || a.startsWith(b + ' ');
}

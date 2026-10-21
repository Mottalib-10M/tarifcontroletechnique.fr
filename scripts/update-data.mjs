#!/usr/bin/env node
/**
 * Relit chaque jour le jeu « Prix des contrôles techniques » (Ministères économiques et financiers,
 * DGCCRF, Licence Ouverte 2.0) et régénère les données du site. Aucune dépendance : Node 22.
 *
 * Source : https://www.data.gouv.fr/datasets/prix-des-controles-techniques
 *   export CSV  https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-controle-technique/exports/csv?use_labels=true
 *   (séparateur « ; », une ligne par centre × catégorie de véhicule × énergie)
 * Communes : API Découpage administratif (geo.api.gouv.fr, Etalab), relue avec --communes
 *   https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,centre,codeDepartement,population&format=json&geometry=centre
 *
 * Écrit :
 *   public/data/centres.json   tous les centres (chargé par l'outil à la première recherche)
 *   public/data/communes.json  index de recherche commune / code postal (idem)
 *   src/data/ct/stats.json     France, départements, métadonnées (pages statiques)
 *   src/data/ct/villes.json    les villes qui ont une page : centres de la commune et alentour
 *   src/data/ct/historique.json  une ligne par jour de relevé (médianes nationales) : notre série
 *
 * Usage : node scripts/update-data.mjs [--csv fichier.csv] [--communes] [--date AAAA-MM-JJ]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSV_URL = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-controle-technique/exports/csv?use_labels=true';
const META_URL = 'https://www.data.gouv.fr/api/1/datasets/prix-des-controles-techniques/';
const GEO_URL = 'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,centre,codeDepartement,population&format=json&geometry=centre';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const OUT_PUBLIC = path.join(ROOT, 'public/data');
const OUT_SRC = path.join(ROOT, 'src/data/ct');
fs.mkdirSync(OUT_PUBLIC, { recursive: true });
fs.mkdirSync(OUT_SRC, { recursive: true });

/** Catégorie × énergie du fichier → clé courte du site. */
export const KEYS = {
  '1|1': 'e', '1|2': 'd', '1|3': 'g', '1|4': 'h', '1|5': 'el',
  '7|6': 'm', '6|6': 'cy', '9|6': 'q', '10|6': 'vt', '8|6': 'tr',
  '5|2': 'cc', '4|2': 'u', '2|2': 'x4', '3|1': 'co',
};
/** Les villes qui ont leur page (les 12 mesurées au Keyword Planner, puis les plus peuplées). */
const VILLES = [
  ['paris', '75056'], ['marseille', '13055'], ['lyon', '69123'], ['toulouse', '31555'], ['nice', '06088'], ['nantes', '44109'],
  ['montpellier', '34172'], ['strasbourg', '67482'], ['bordeaux', '33063'], ['lille', '59350'], ['rennes', '35238'], ['toulon', '83137'],
  ['reims', '51454'], ['saint-etienne', '42218'], ['le-havre', '76351'], ['dijon', '21231'], ['angers', '49007'], ['grenoble', '38185'],
  ['nimes', '30189'], ['clermont-ferrand', '63113'],
];

async function get(url, as = 'text') {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'tarif-ct-update/1.0 (+site statique, relevé quotidien)' } });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return as === 'json' ? await r.json() : await r.text();
    } catch (e) { if (i === 2) throw e; await new Promise((s) => setTimeout(s, 3000 * (i + 1))); }
  }
}

/** CSV « ; » avec guillemets éventuels. */
export function parseCsv(txt) {
  txt = txt.replace(/^﻿+/, '');
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
    if (c === '"') q = true; else if (c === ';') { row.push(f); f = ''; } else if (c === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; } else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = rows.shift();
  return rows.filter((r) => r.length >= head.length - 1).map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

/** « BLAGNAC » → « Blagnac », « SAINT-JEAN-DE-VEDAS » → « Saint-Jean-De-Vedas » : seulement les noms tout en capitales. */
export const joli = (s) => (s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s\-’'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/-(Sur|Sous|Lès|Lez|Les|En|De|Du|Des|La|Le|Et|Aux|Au)-/g, (m) => m.toLowerCase()) : s);
export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\bst\b/g, 'saint').replace(/\bste\b/g, 'sainte').trim();
const num = (s) => (s === '' || s == null ? null : Math.round(Number(s) * 100) / 100);
/** Bornes de vraisemblance d'un prix de visite (€) : hors de ces bornes, la saisie du centre est écartée. */
export const PLAUSIBLE = [30, 250];
const r2 = (x) => Math.round(x * 100) / 100;
export function quant(sorted, p) { if (!sorted.length) return null; const i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return r2(sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo)); }
export function summary(values, zero = false) {
  const v = values.filter((x) => x != null && (zero ? x >= 0 : x > 0)).sort((a, b) => a - b);
  if (!v.length) return null;
  return { n: v.length, moy: r2(v.reduce((a, b) => a + b, 0) / v.length), med: quant(v, 0.5), p10: quant(v, 0.1), p90: quant(v, 0.9), min: v[0], max: v[v.length - 1] };
}
const km = (a, b, c, d) => { const R = 6371, t = Math.PI / 180, x = Math.sin(((c - a) * t) / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin(((d - b) * t) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const okGeo = (la, lo) => la != null && lo != null && Math.abs(la) > 0.1 && Math.abs(lo) > 0.01 && la > -25 && la < 52 && lo > -65 && lo < 60;

async function main() {
  const date = opt('--date') ?? new Date().toISOString().slice(0, 10);
  const csvFile = opt('--csv');
  const txt = csvFile ? fs.readFileSync(csvFile, 'utf8') : await get(CSV_URL);
  let fichier = date;
  try { const m = await get(META_URL, 'json'); fichier = (m.last_modified || m.last_update || date).slice(0, 10); } catch { /* métadonnées facultatives */ }
  const rows = parseCsv(txt);
  if (rows.length < 50000) throw new Error(`Fichier anormalement court : ${rows.length} lignes. Rien n'est écrit.`);

  // 1. Centres.
  const byId = new Map();
  const aberrants = [];
  for (const x of rows) {
    const key = KEYS[`${x.cat_vehicule_id}|${x.cat_energie_id}`];
    if (!key) continue;
    const id = x.cct_siret || `${x.cct_denomination}|${x.cct_adresse}`;
    let c = byId.get(id);
    if (!c) {
      const la = num(x.latitude), lo = num(x.longitude);
      c = { id, n: x.cct_denomination, a: x.cct_adresse, cp: x.cct_code_postal.padStart(5, '0'), v: joli(x.cct_commune.replace(/\s+/g, ' ')), d: x.code_departement, dn: x.nom_departement, la: okGeo(la, lo) ? Math.round(la * 1e4) / 1e4 : null, lo: okGeo(la, lo) ? Math.round(lo * 1e4) / 1e4 : null, u: (x.cct_update_date_time || '').slice(0, 10), t: {}, dt: {} };
      byId.set(id, c);
    }
    const pv = num(x.prix_visite);
    if (pv == null || pv <= 0) continue;
    // Saisie invraisemblable (1 €, 999 €) : écartée des moyennes et de la liste, comptée dans les métadonnées.
    if (pv < PLAUSIBLE[0] || pv > PLAUSIBLE[1]) { aberrants.push(`${x.cct_denomination} (${x.cct_commune}) ${key} ${pv} €`); continue; }
    c.t[key] = [pv, num(x.prix_contre_visite_mini), num(x.prix_contre_visite_maxi)];
    c.dt[key] = (x.date_application_visite || '').slice(0, 10);
  }
  const centres = [...byId.values()].filter((c) => Object.keys(c.t).length);
  centres.sort((a, b) => a.d.localeCompare(b.d) || a.v.localeCompare(b.v, 'fr') || a.n.localeCompare(b.n, 'fr'));

  // 2. Statistiques.
  const allKeys = Object.values(KEYS);
  const statsOf = (list) => Object.fromEntries(allKeys.map((k) => [k, summary(list.map((c) => c.t[k]?.[0]))]).filter(([, s]) => s));
  const cvOf = (list, k = 'e') => {
    const l = list.filter((c) => c.t[k]); if (!l.length) return null;
    return { min: summary(l.map((c) => c.t[k][1]), true), max: summary(l.map((c) => c.t[k][2])), gratuite: r2(l.filter((c) => c.t[k][1] === 0).length / l.length), n: l.length };
  };
  const cvFix = (o) => o;
  const ancien = (list) => { const l = list.filter((c) => c.t.e); return l.length ? r2(l.filter((c) => (c.dt.e || '') < '2023-01-01').length / l.length) : null; };
  const cheapest = (list, k = 'e') => { const l = list.filter((c) => c.t[k]).sort((a, b) => a.t[k][0] - b.t[k][0]); return l.length ? { n: l[0].n, v: l[0].v, cp: l[0].cp, p: l[0].t[k][0], ex: l.filter((c) => c.t[k][0] === l[0].t[k][0]).length } : null; };
  const priciest = (list, k = 'e') => { const l = list.filter((c) => c.t[k]).sort((a, b) => b.t[k][0] - a.t[k][0]); return l.length ? { n: l[0].n, v: l[0].v, cp: l[0].cp, p: l[0].t[k][0] } : null; };

  const depts = {};
  for (const c of centres) (depts[c.d] ??= { nom: c.dn, list: [] }).list.push(c);
  const DEPTS = Object.fromEntries(Object.entries(depts).sort(([a], [b]) => a.localeCompare(b)).map(([d, o]) => [d, {
    nom: o.nom, centres: o.list.length, s: statsOf(o.list), cv: cvFix(cvOf(o.list)), cvm: cvFix(cvOf(o.list, 'm')), moinsCher: cheapest(o.list), moinsCherMoto: cheapest(o.list, 'm'), plusCher: priciest(o.list), ancien: ancien(o.list),
    communes: new Set(o.list.map((c) => norm(c.v).replace(/ \d+e?( arrondissement)?$/, ''))).size,
  }]));
  const vpCentres = centres.filter((c) => c.t.e);
  const national = { centres: centres.length, sansGeo: centres.filter((c) => c.la == null).length, centresVp: vpCentres.length, centresMoto: centres.filter((c) => c.t.m).length, s: statsOf(centres), cv: cvFix(cvOf(centres)), cvm: cvFix(cvOf(centres, 'm')), ancien: ancien(centres),
    misAJour2026: r2(vpCentres.filter((c) => c.u >= '2026-01-01').length / vpCentres.length), jamaisDepuis2020: r2(vpCentres.filter((c) => c.u < '2021-01-01').length / vpCentres.length),
    elecPlusCher: r2(centres.filter((c) => c.t.e && c.t.el && c.t.el[0] > c.t.e[0]).length / centres.filter((c) => c.t.e && c.t.el).length),
    gazPlusCher: r2(centres.filter((c) => c.t.e && c.t.g && c.t.g[0] > c.t.e[0]).length / centres.filter((c) => c.t.e && c.t.g).length),
    dieselEgal: r2(centres.filter((c) => c.t.e && c.t.d && c.t.d[0] === c.t.e[0]).length / centres.filter((c) => c.t.e && c.t.d).length),
    histE: Object.fromEntries(Object.entries(vpCentres.reduce((h, c) => { const b = Math.floor(c.t.e[0] / 10) * 10; h[b] = (h[b] || 0) + 1; return h; }, {})).sort(([a], [b]) => a - b)),
  };

  // 3. Communes (index de recherche).
  let communes;
  const cacheGeo = path.join(ROOT, 'scripts/data/communes-geo.json');
  if (args.includes('--communes') || !fs.existsSync(cacheGeo)) {
    fs.mkdirSync(path.dirname(cacheGeo), { recursive: true });
    const g = await get(GEO_URL, 'json');
    communes = g.map((x) => ({ nom: x.nom, code: x.code, cps: x.codesPostaux || [], d: x.codeDepartement, lo: Math.round(x.centre.coordinates[0] * 1e3) / 1e3, la: Math.round(x.centre.coordinates[1] * 1e3) / 1e3, pop: x.population || 0 }));
    fs.writeFileSync(cacheGeo, JSON.stringify(communes));
  } else communes = JSON.parse(fs.readFileSync(cacheGeo, 'utf8'));
  // Index : [nom, codes postaux, département, latitude, longitude], du plus peuplé au moins peuplé
  const idx = communes.filter((c) => c.cps.length).sort((a, b) => b.pop - a.pop).map((c) => [c.nom, c.cps.join(' '), c.d, Math.round(c.la * 100) / 100, Math.round(c.lo * 100) / 100]);
  fs.writeFileSync(path.join(OUT_PUBLIC, 'communes.json'), JSON.stringify(idx));

  // Centre ↔ commune : même code postal et nom qui commence par celui de la commune (« Paris 11e » ⊂ Paris).
  const inCommune = (c, com) => com.cps.includes(c.cp) && (norm(c.v) === norm(com.nom) || norm(c.v).startsWith(norm(com.nom) + ' '));

  // 4. Villes à page.
  const villes = {};
  for (const [slug, code] of VILLES) {
    const com = communes.find((c) => c.code === code);
    if (!com) throw new Error(`Commune ${code} introuvable`);
    const dans = centres.filter((c) => inCommune(c, com));
    const proches = centres.filter((c) => c.la != null).map((c) => ({ c, km: km(com.la, com.lo, c.la, c.lo) })).filter((x) => x.km <= 15).sort((a, b) => a.km - b.km);
    const autour = proches.filter((x) => !dans.includes(x.c));
    // Communes voisines qui ont au moins deux centres : médiane essence, distance.
    const vois = {};
    for (const { c, km: k } of autour) { const n = c.v.replace(/ \d+e?( Arrondissement)?$/i, ''); (vois[n] ??= { nom: n, km: k, p: [] }).p.push(c.t.e?.[0]); vois[n].km = Math.min(vois[n].km, k); }
    villes[slug] = {
      code, nom: com.nom, d: com.d, dn: DEPTS[com.d]?.nom, la: com.la, lo: com.lo, pop: com.pop, cps: com.cps,
      n: dans.length, s: statsOf(dans), cv: cvFix(cvOf(dans)), ancien: ancien(dans), moinsCher: cheapest(dans), plusCher: priciest(dans), moinsCherMoto: cheapest(dans, 'm'),
      n15: proches.length, s15: statsOf(proches.map((x) => x.c)), moinsCher15: cheapest(proches.map((x) => x.c)),
      arr: com.cps.length > 1 ? Object.fromEntries(Object.entries(dans.reduce((h, c) => { (h[c.cp] ??= []).push(c.t.e?.[0]); return h; }, {})).map(([cp, l]) => [cp, summary(l)])) : null,
      voisines: Object.values(vois).map((o) => ({ nom: o.nom, km: Math.round(o.km * 10) / 10, s: summary(o.p) })).filter((o) => o.s && o.s.n >= 1).sort((a, b) => a.km - b.km).slice(0, 12),
      // Centres livrés dans la page : ceux de la commune, puis les plus proches, 40 au plus.
      liste: [...dans.map((c) => ({ c, km: km(com.la, com.lo, c.la ?? com.la, c.lo ?? com.lo) })), ...autour].slice(0, Math.max(40, dans.length)).map(({ c, km: k }) => compact(c, Math.round(k * 10) / 10)),
    };
  }

  // 5. Écriture.
  const meta = { releve: date, fichier, lignes: rows.length, aberrants: aberrants.length, source: 'https://www.data.gouv.fr/datasets/prix-des-controles-techniques', licence: 'Licence Ouverte 2.0 (Etalab)' };
  fs.writeFileSync(path.join(OUT_PUBLIC, 'centres.json'), JSON.stringify({ meta, c: centres.map((c) => compact(c)) }));
  fs.writeFileSync(path.join(OUT_SRC, 'stats.json'), JSON.stringify({ meta, national, depts: DEPTS }, null, 1));
  fs.writeFileSync(path.join(OUT_SRC, 'villes.json'), JSON.stringify(villes));
  // Date du fichier lu : seule date affichée « mis à jour le » sur les pages (site-config.ts).
  fs.writeFileSync(path.join(OUT_SRC, 'fichier.json'), JSON.stringify({ fichier, releve: date }) + '\n');
  // Médianes compactes par département pour les mini-simulateurs (quelques Ko dans la page) :
  // { dép.: [centres, {clé: médiane}, cv mini médian, cv maxi médian, part cv gratuite, moins cher essence, sa commune, part électrique plus cher] }
  const depMini = Object.fromEntries(Object.entries(DEPTS).map(([d, o]) => {
    const l = depts[d].list, pair = l.filter((c) => c.t.e && c.t.el);
    return [d, [o.centres, Object.fromEntries(Object.entries(o.s).map(([k, v]) => [k, v.med])), o.cv?.min.med ?? null, o.cv?.max?.med ?? null, o.cv?.gratuite ?? 0, o.moinsCher?.p ?? null, o.moinsCher?.v ?? '', pair.length ? r2(pair.filter((c) => c.t.el[0] > c.t.e[0]).length / pair.length) : null]];
  }));
  fs.writeFileSync(path.join(OUT_SRC, 'dep-mini.json'), JSON.stringify({ fichier, n: national.s, cv: national.cv, cvm: national.cvm, elecPlusCher: national.elecPlusCher, d: depMini }));
  const hFile = path.join(OUT_SRC, 'historique.json');
  const hist = fs.existsSync(hFile) ? JSON.parse(fs.readFileSync(hFile, 'utf8')) : [];
  const point = { date, fichier, centres: centres.length, e: national.s.e.med, eMoy: national.s.e.moy, d: national.s.d.med, el: national.s.el.med, m: national.s.m?.med ?? null, cvMax: national.cv.max.med };
  const i = hist.findIndex((h) => h.date === date);
  if (i >= 0) hist[i] = point; else hist.push(point);
  hist.sort((a, b) => a.date.localeCompare(b.date));
  fs.writeFileSync(hFile, JSON.stringify(hist, null, 1));
  if (aberrants.length) console.log('Écartés :', aberrants.join(' | '));
  console.log(`${rows.length} lignes · ${centres.length} centres · ${Object.keys(DEPTS).length} départements · ${idx.length} communes · médiane essence ${national.s.e.med} € · fichier du ${fichier}`);
}

/** Centre compact : [nom, adresse, cp, commune, dép., lat, lon, maj fiche, date tarif VP, {clé: [visite, cv min, cv max]}, km?] */
function compact(c, k) {
  const o = [c.n, c.a, c.cp, c.v, c.d, c.la, c.lo, c.u, c.dt.e || c.dt.m || Object.values(c.dt)[0] || '', c.t];
  if (k != null) o.push(k);
  return o;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main().catch((e) => { console.error(e); process.exit(1); });

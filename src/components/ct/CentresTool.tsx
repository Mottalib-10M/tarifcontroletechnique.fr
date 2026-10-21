/**
 * L'outil du site : commune ou code postal + véhicule + rayon → centres agréés autour, avec le prix
 * de la visite et de la contre-visite déclarés à la DGCCRF, médiane locale, centre le moins cher,
 * écart avec le département et la France. Premier rendu = la commune de la page et les centres
 * calculés au build (props) ; les fichiers complets ne sont chargés qu'à la première interaction.
 * Aucune réservation, aucun lien vers un centre, aucune donnée transmise.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink, type L } from '../calc/kit';
import { VEHICULES, autour, synthese, summary, decode, ecart, tarifAncien, type Centre, type CentreRaw, type Key } from '../../lib/engine/ct';
import { nomDep } from '../../data/ct/departements';
import { chargerCentres, chargerCommunes, chercher, dansCommune, type Commune } from '../../lib/donnees-client';
import { formatMoney, formatPercent, formatNumber, displayDate } from '../../lib/format';
import { updateURL, readParams } from '../../lib/url-state';

export interface Lieu { nom: string; d: string; la: number; lo: number; cps: string[] }
/** Médianes de référence calculées au build : France entière, et département de la commune de la page. */
export interface Refs { nat: Partial<Record<Key, number>>; d: string; dep: Partial<Record<Key, number>> }
interface Props {
  lang: L; id: string; lieu: Lieu; initial: CentreRaw[]; refs: Refs; today: string;
  defaultKey?: Key; keys?: Key[]; rayon?: number; methodHref?: string; titre?: string;
}
const T = <A,>(l: L, fr: A, en: A) => (l === 'en' ? en : fr);
const prix = (x: number, l: L) => formatMoney(x, Number.isInteger(x) ? 0 : 2, l);
const RAYONS = [5, 10, 20, 30];

export default function CentresTool({ lang: l, id, lieu: lieu0, initial, refs, today, defaultKey = 'e', keys, rayon: rayon0 = 10, methodHref }: Props) {
  const init = useMemo(() => initial.map(decode), [initial]);
  const [lieu, setLieu] = useState<Lieu>(lieu0);
  const [key, setKey] = useState<Key>(defaultKey);
  const [rayon, setRayon] = useState(rayon0);
  const [tous, setTous] = useState<Centre[] | null>(null);
  const [communes, setCommunes] = useState<Commune[] | null>(null);
  const [q, setQ] = useState(lieu0.nom);
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const [tout, setTout] = useState(false);
  const [tri, setTri] = useState<'prix' | 'km'>('prix');
  const [charge, setCharge] = useState(false);
  const boite = useRef<HTMLDivElement>(null);

  const charger = () => {
    if (charge) return;
    setCharge(true);
    chargerCentres().then(setTous).catch(() => setCharge(false));
    chargerCommunes().then(setCommunes).catch(() => undefined);
  };
  // Lien partagé : lu après le premier rendu seulement (RECETTE §17.5).
  useEffect(() => {
    const sp = readParams(window.location.search);
    const v = sp.get('v') as Key | null, r = Number(sp.get('r')), c = sp.get('c');
    if (v && VEHICULES.some((x) => x.key === v)) setKey(v);
    if (RAYONS.includes(r)) setRayon(r);
    if (c) {
      setCharge(true);
      chargerCentres().then(setTous);
      chargerCommunes().then((cs) => { setCommunes(cs); const [nom, d] = c.split('|'); const m = cs.find((x) => x.nom === nom && x.d === d); if (m) { setLieu(m); setQ(m.nom); } });
    }
  }, []);
  useEffect(() => { updateURL({ c: `${lieu.nom}|${lieu.d}`, v: key, r: rayon }); }, [lieu, key, rayon]);

  const pret = !!tous;
  const base = tous ?? init;
  // Avant le chargement complet, la page ne porte que les centres les plus proches de sa commune :
  // le rayon affiché ne dépasse pas celui qu'ils couvrent vraiment.
  const couvre = !tous && init.length >= 40 ? Math.floor(Math.max(...init.map((c) => c.km ?? 0))) : Infinity;
  const r = Math.min(rayon, couvre);
  const liste = useMemo(() => autour(base, lieu.la, lieu.lo, key, r), [base, lieu, key, r]);
  const s = useMemo(() => synthese(liste, key), [liste, key]);
  const dansCom = useMemo(() => synthese(liste.filter((c) => dansCommune(c, lieu)), key), [liste, lieu, key]);
  const sugg = useMemo(() => (communes && ouvert ? chercher(communes, q) : []), [communes, q, ouvert]);
  const nat = refs.nat[key];
  const depMed = useMemo(() => (lieu.d === refs.d ? refs.dep[key] : tous ? summary(tous.filter((c) => c.d === lieu.d).map((c) => c.t[key]?.[0]))?.med : undefined), [lieu, key, tous, refs]);
  const veh = VEHICULES.find((v) => v.key === key)!;
  const options = (keys ? VEHICULES.filter((v) => keys.includes(v.key)) : VEHICULES).map((v) => ({ value: v.key, label: v[l] }));
  const choisir = (c: Commune) => { setLieu(c); setQ(c.nom); setOuvert(false); setTout(false); };
  const triee = [...liste].sort((a, b) => (tri === 'prix' ? a.t[key]![0] - b.t[key]![0] || (a.km ?? 0) - (b.km ?? 0) : (a.km ?? 0) - (b.km ?? 0)));
  const visibles = tout ? triee : triee.slice(0, 10);
  const med = s.resume?.med ?? 0;
  const rayonEffectif = liste.length ? Math.max(r, Math.ceil(liste[liste.length - 1].km ?? 0)) : r;

  const form = (
    <>
      <div className="relative" ref={boite}>
        <label htmlFor={`${id}-lieu`} className="mb-1 block text-sm font-medium text-navy-700">{T(l, 'Commune ou code postal', 'Town or postcode')}</label>
        <input id={`${id}-lieu`} type="text" inputMode="text" autoComplete="off" spellCheck={false} role="combobox" aria-expanded={sugg.length > 0} aria-controls={`${id}-sugg`} aria-autocomplete="list"
          value={q} onFocus={(e) => { charger(); e.currentTarget.select(); }}
          onChange={(e) => { setQ(e.target.value); setOuvert(true); setActif(0); charger(); }}
          onKeyDown={(e) => { if (!sugg.length) return; if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => Math.min(a + 1, sugg.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(a - 1, 0)); } else if (e.key === 'Enter') { e.preventDefault(); choisir(sugg[actif]); } else if (e.key === 'Escape') setOuvert(false); }}
          onBlur={() => setTimeout(() => setOuvert(false), 150)}
          className="h-12 w-full rounded-lg border border-navy-300 bg-white px-4 text-lg text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
        <p className="mt-1 text-xs text-navy-500">{charge && !communes ? T(l, 'Chargement des 35 000 communes…', 'Loading 35,000 towns…') : T(l, 'Toutes les communes de France, outre-mer compris', 'Every town in France, overseas included')}</p>
        {sugg.length > 0 && (
          <ul id={`${id}-sugg`} role="listbox" className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-navy-200 bg-white py-1 shadow-lg">
            {sugg.map((c, i) => (
              <li key={`${c.nom}${c.d}${c.cps[0]}`} role="option" aria-selected={i === actif} onMouseDown={(e) => { e.preventDefault(); choisir(c); }}
                className={`cursor-pointer px-3 py-2 text-sm ${i === actif ? 'bg-accent-50 text-navy-900' : 'text-navy-700'}`}>{c.nom} <span className="text-navy-500">({c.cps[0]}{c.cps.length > 1 ? '…' : ''})</span></li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <SelectField id={`${id}-veh`} label={T(l, 'Véhicule', 'Vehicle')} value={key} onChange={(v) => { setKey(v as Key); charger(); }} options={options} />
        <SelectField id={`${id}-rayon`} label={T(l, 'Autour, à vol d’oiseau', 'Distance, as the crow flies')} value={String(rayon)} onChange={(v) => { setRayon(Number(v)); charger(); }} options={RAYONS.map((r) => ({ value: String(r), label: `${r} km` }))} />
      </div>
      <Note>{T(l,
        `Prix déclarés par chaque centre à la DGCCRF, fichier du ${displayDate(today, 'fr-FR')}. Le prix affiché au centre fait foi.`,
        `Prices each centre declares to the DGCCRF, file of ${displayDate(today, 'en-GB')}. The price displayed at the centre is what counts.`)}</Note>
    </>
  );

  const result = s.resume ? (
    <>
      <Head label={T(l, `Prix médian · ${veh.court.fr} · ${lieu.nom} et ${rayonEffectif} km autour`, `Median price · ${veh.court.en} · ${lieu.nom} and ${rayonEffectif} km around`)} value={formatMoney(med, 0, l)}
        sub={T(l, `${s.n} centre${s.n > 1 ? 's' : ''} · de ${prix(s.resume.min, l)} à ${prix(s.resume.max, l)}`, `${s.n} centre${s.n > 1 ? 's' : ''} · from ${prix(s.resume.min, l)} to ${prix(s.resume.max, l)}`)} />
      <Rows rows={[
        [T(l, `Le moins cher : ${s.moinsCher!.n}, ${s.moinsCher!.v} (${formatNumber(s.moinsCher!.km ?? 0, 1, l)} km)`, `Cheapest: ${s.moinsCher!.n}, ${s.moinsCher!.v} (${formatNumber(s.moinsCher!.km ?? 0, 1, l)} km)`), prix(s.moinsCher!.t[key]![0], l), true],
        [T(l, 'Économie face à la médiane locale', 'Saving on the local median'), formatMoney(s.economie, 0, l)],
        ...(dansCom.resume ? [[T(l, `Médiane de la commune (${dansCom.n} centre${dansCom.n > 1 ? 's' : ''})`, `Median in the town itself (${dansCom.n} centre${dansCom.n > 1 ? 's' : ''})`), formatMoney(dansCom.resume.med, 0, l)] as [string, string]] : []),
        ...(depMed ? [[T(l, `Médiane du département (${nomDep(lieu.d)})`, `Median in the département (${nomDep(lieu.d)})`), formatMoney(depMed, 0, l)] as [string, string]] : []),
        ...(nat ? [[T(l, `Écart avec la médiane nationale (${formatMoney(nat, 0, l)})`, `Gap with the national median (${formatMoney(nat, 0, l)})`), (med >= nat ? '+' : '') + formatPercent(ecart(med, nat), 0, l)] as [string, string]] : []),
        ...(s.cvMax ? [[T(l, 'Contre-visite, tarif maxi médian', 'Re-inspection, median top price'), formatMoney(s.cvMax.med, 0, l)] as [string, string]] : []),
        [T(l, 'Centres à contre-visite gratuite possible', 'Centres with a possible free re-inspection'), formatPercent(s.cvGratuite, 0, l)],
      ]} />
      {!pret && charge && <Note>{T(l, 'Chargement des 6 000 centres…', 'Loading the 6,000 centres…')}</Note>}
      <MethodLink href={methodHref} lang={l} />
    </>
  ) : (
    <Head label={T(l, 'Aucun centre ne déclare ce véhicule ici', 'No centre declares this vehicle here')} value="—" sub={T(l, 'Élargissez le rayon ou changez de véhicule.', 'Widen the distance or pick another vehicle.')} />
  );

  return (
    <div>
      <Shell id={id} form={form} result={result} />
      {liste.length > 0 && (
        <div data-chrome className="not-prose mt-4 overflow-x-auto rounded-xl border border-navy-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-200 bg-navy-50 px-4 py-2 text-sm">
            <p className="font-semibold text-navy-900">{T(l, `${liste.length} centres agréés, ${veh.court.fr}`, `${liste.length} approved centres, ${veh.court.en}`)}</p>
            <p className="flex gap-2">
              {(['prix', 'km'] as const).map((t) => <button key={t} type="button" onClick={() => setTri(t)} className={`rounded border px-2 py-1 ${tri === t ? 'border-accent-500 bg-white font-semibold text-accent-700' : 'border-navy-200 text-navy-600'}`}>{t === 'prix' ? T(l, 'Par prix', 'By price') : T(l, 'Par distance', 'By distance')}</button>)}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy-700">
              <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Centre', 'Centre')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">km</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Contrôle', 'Test')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Contre-visite', 'Re-check')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold max-sm:hidden">{T(l, 'Tarif depuis', 'Price since')}</th>
            </tr></thead>
            <tbody className="divide-y divide-navy-100">
              {visibles.map((c) => {
                const t = c.t[key]!;
                const cv = t[1] == null && t[2] == null ? '—' : t[1] === t[2] || t[2] == null ? prix(t[1] ?? 0, l) : `${prix(t[1] ?? 0, l)} – ${prix(t[2], l)}`;
                return (
                  <tr key={`${c.n}${c.a}${c.cp}`}>
                    <td className="px-3 py-2"><span className="font-medium text-navy-900">{c.n}</span><br /><span className="text-navy-600">{c.a}, {c.cp} {c.v}</span></td>
                    <td className="tabular-nums px-3 py-2 text-right text-navy-700">{formatNumber(c.km ?? 0, 1, l)}</td>
                    <td className="tabular-nums px-3 py-2 text-right font-semibold text-navy-900">{prix(t[0], l)}</td>
                    <td className="tabular-nums px-3 py-2 text-right text-navy-700">{cv}</td>
                    <td className="tabular-nums px-3 py-2 text-right text-navy-600 max-sm:hidden">{c.dt ? displayDate(c.dt, l === 'en' ? 'en-GB' : 'fr-FR') : '—'}{tarifAncien(c.dt, today) && <span className="ml-1 text-amber-800" title={T(l, 'Tarif déclaré il y a plus de 3 ans', 'Price declared over 3 years ago')}>*</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-200 px-4 py-2 text-xs text-navy-600">
            <span>{T(l, '* tarif déclaré il y a plus de 3 ans : à confirmer à l’accueil du centre.', '* price declared over 3 years ago: check it at the centre’s desk.')}</span>
            {triee.length > 10 && <button type="button" onClick={() => { setTout(!tout); charger(); }} className="rounded border border-navy-300 px-3 py-1 font-medium text-navy-800">{tout ? T(l, 'Réduire', 'Show fewer') : T(l, `Voir les ${triee.length} centres`, `Show all ${triee.length} centres`)}</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Les 101 départements classés par prix médian du contrôle, pour le véhicule choisi : nombre de
 * centres, médiane, centre le moins cher et sa commune, écart avec la France, contre-visite
 * gratuite. Données : data/ct/dep-mini.json, écrit chaque jour par scripts/update-data.mjs.
 */
import { useMemo, useState } from 'react';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink, type L } from '../calc/kit';
import { VEHICULES, ecart, type Key } from '../../lib/engine/ct';
import { formatMoney, formatPercent, displayDate } from '../../lib/format';
import { updateURL, readParams } from '../../lib/url-state';
import { DEPARTEMENTS } from '../../data/ct/departements';
import DM from '../../data/ct/dep-mini.json';
import { useEffect } from 'react';

type Ligne = [number, Record<string, number>, number | null, number | null, number, number | null, string, number | null];
const D = DM.d as unknown as Record<string, Ligne>;
const T = <A,>(l: L, fr: A, en: A) => (l === 'en' ? en : fr);
const KEYS: Key[] = ['e', 'd', 'h', 'el', 'g', 'm', 'cy', 'q', 'vt', 'cc', 'u'];

export default function DeptTool({ lang: l, id = 'dep', defaultKey = 'e', defaultDep = '75', methodHref }: { lang: L; id?: string; defaultKey?: Key; defaultDep?: string; methodHref?: string }) {
  const [key, setKey] = useState<Key>(defaultKey);
  const [dep, setDep] = useState(defaultDep);
  const [ordre, setOrdre] = useState<'asc' | 'desc' | 'num'>('asc');
  useEffect(() => {
    const sp = readParams(window.location.search);
    const v = sp.get('v') as Key | null, d = sp.get('d');
    if (v && KEYS.includes(v)) setKey(v);
    if (d && D[d]) setDep(d);
  }, []);
  useEffect(() => { updateURL({ v: key, d: dep }); }, [key, dep]);
  const nat = (DM.n as Record<string, { med: number }>)[key]?.med ?? 0;
  const rows = useMemo(() => Object.entries(D).filter(([, x]) => x[1][key] != null).map(([d, x]) => ({ d, n: x[0], med: x[1][key], cvMin: x[2], cvMax: x[3], gratuit: x[4], min: x[5], ville: x[6] })), [key]);
  const tri = [...rows].sort((a, b) => (ordre === 'num' ? a.d.localeCompare(b.d) : ordre === 'asc' ? a.med - b.med || a.d.localeCompare(b.d) : b.med - a.med || a.d.localeCompare(b.d)));
  const rang = [...rows].sort((a, b) => a.med - b.med);
  const x = rows.find((r) => r.d === dep);
  const pos = x ? rang.filter((r) => r.med < x.med).length + 1 : 0;
  const veh = VEHICULES.find((v) => v.key === key)!;
  const options = VEHICULES.filter((v) => KEYS.includes(v.key)).map((v) => ({ value: v.key, label: v[l] }));
  const deps = Object.keys(D).map((d) => ({ value: d, label: `${d} · ${DEPARTEMENTS[d] ?? d}` }));

  const form = (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        <SelectField id={`${id}-dep`} label={T(l, 'Département', 'Département')} value={dep} onChange={setDep} options={deps} />
        <SelectField id={`${id}-veh`} label={T(l, 'Véhicule', 'Vehicle')} value={key} onChange={(v) => setKey(v as Key)} options={options} />
      </div>
      <Note>{T(l, `Médiane des prix que chaque centre du département déclare à la DGCCRF, fichier du ${displayDate(DM.fichier, 'fr-FR')}.`, `Median of the prices each centre in the département declares to the DGCCRF, file of ${displayDate(DM.fichier, 'en-GB')}.`)}</Note>
    </>
  );
  const result = x ? (
    <>
      <Head label={T(l, `Prix médian · ${veh.court.fr} · ${DEPARTEMENTS[dep]}`, `Median price · ${veh.court.en} · ${DEPARTEMENTS[dep]}`)} value={formatMoney(x.med, 0, l)}
        sub={T(l, `${pos}e département le moins cher sur ${rows.length}`, `${pos}${pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} cheapest of ${rows.length} départements`)} />
      <Rows rows={[
        [T(l, 'Écart avec la médiane nationale', 'Gap with the national median'), `${x.med >= nat ? '+' : ''}${formatPercent(ecart(x.med, nat), 0, l)} (${formatMoney(nat, 0, l)})`],
        [T(l, 'Centres agréés (voitures et deux-roues)', 'Approved centres (cars and two-wheelers)'), String(x.n)],
        ...(x.min != null && key === 'e' ? [[T(l, `Le moins cher, essence (${x.ville})`, `Cheapest, petrol (${x.ville})`), formatMoney(x.min, Number.isInteger(x.min) ? 0 : 2, l), true] as [string, string, boolean]] : []),
        ...(x.cvMax != null ? [[T(l, 'Contre-visite voiture, mini et maxi médians', 'Car re-inspection, median low and high'), `${formatMoney(x.cvMin ?? 0, 0, l)} – ${formatMoney(x.cvMax, 0, l)}`] as [string, string]] : []),
        [T(l, 'Centres à contre-visite gratuite possible', 'Centres with a possible free re-inspection'), formatPercent(x.gratuit, 0, l)],
      ]} />
      <MethodLink href={methodHref} lang={l} />
    </>
  ) : <Head label={T(l, 'Aucun centre ne déclare ce véhicule ici', 'No centre declares this vehicle here')} value="—" />;

  return (
    <div>
      <Shell id={id} form={form} result={result} />
      <div data-chrome className="not-prose mt-4 overflow-x-auto rounded-xl border border-navy-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-200 bg-navy-50 px-4 py-2 text-sm">
          <p className="font-semibold text-navy-900">{T(l, `Les ${rows.length} départements, ${veh.court.fr}`, `All ${rows.length} départements, ${veh.court.en}`)}</p>
          <p className="flex gap-2">
            {(['asc', 'desc', 'num'] as const).map((o) => <button key={o} type="button" onClick={() => setOrdre(o)} className={`rounded border px-2 py-1 ${ordre === o ? 'border-accent-500 bg-white font-semibold text-accent-700' : 'border-navy-200 text-navy-600'}`}>{o === 'asc' ? T(l, 'Moins chers', 'Cheapest') : o === 'desc' ? T(l, 'Plus chers', 'Dearest') : T(l, 'Par numéro', 'By number')}</button>)}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-navy-700">
            <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Département', 'Département')}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Centres', 'Centres')}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Médiane', 'Median')}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Écart France', 'vs France')}</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold max-sm:hidden">{T(l, 'Contre-visite gratuite', 'Free re-check')}</th>
          </tr></thead>
          <tbody className="divide-y divide-navy-100">
            {tri.map((r) => (
              <tr key={r.d} className={r.d === dep ? 'bg-accent-50' : ''}>
                <td className="px-3 py-1.5"><button type="button" onClick={() => setDep(r.d)} className="text-left text-navy-900 hover:underline">{r.d} · {DEPARTEMENTS[r.d]}</button></td>
                <td className="tabular-nums px-3 py-1.5 text-right text-navy-700">{r.n}</td>
                <td className="tabular-nums px-3 py-1.5 text-right font-semibold text-navy-900">{formatMoney(r.med, Number.isInteger(r.med) ? 0 : 1, l)}</td>
                <td className="tabular-nums px-3 py-1.5 text-right text-navy-700">{r.med >= nat ? '+' : ''}{formatPercent(ecart(r.med, nat), 0, l)}</td>
                <td className="tabular-nums px-3 py-1.5 text-right text-navy-700 max-sm:hidden">{formatPercent(r.gratuit, 0, l)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

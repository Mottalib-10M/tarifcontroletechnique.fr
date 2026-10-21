/** Les exemples datés des fiches Service Public (vérifiées le 1er janvier 2026) deviennent des tests (RECETTE §17.4). */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import * as M from './index';
import stats from '../../data/ct/stats.json';
import villes from '../../data/ct/villes.json';

describe('voiture (F33354)', () => {
  it('1er contrôle : mise en circulation le 1er octobre 2022 → entre le 1er avril et le 30 septembre 2026', () => {
    expect(M.premierControleVoiture('2022-10-01')).toEqual({ debut: '2026-04-01', fin: '2026-09-30' });
  });
  it('favorable le 14 mai 2025 → valable jusqu’au 13 mai 2027', () => { expect(M.finValidite('2025-05-14', 2)).toBe('2027-05-13'); });
  it('défavorable majeur (S) le 14 mai 2026 → valable jusqu’au 13 juillet 2026, contre-visite avant le 13 juillet', () => {
    expect(M.apresDefavorable('2026-05-14', 'S')).toEqual({ valideJusquau: '2026-07-13', contreVisiteAvant: '2026-07-13', rouleApres: true });
  });
  it('défavorable critique (R) le 14 mai 2026 → validité limitée au jour même', () => {
    expect(M.apresDefavorable('2026-05-14', 'R')).toMatchObject({ valideJusquau: '2026-05-14', contreVisiteAvant: '2026-07-13', rouleApres: false });
  });
  it('contre-visite favorable après un contrôle du 5 juin 2026 → valable jusqu’au 4 juin 2028', () => { expect(M.apresContreVisite('2026-06-05')).toBe('2028-06-04'); });
  it('échéance : premier contrôle, puis périodique', () => {
    expect(M.echeanceVoiture('2022-10-01', null, '2026-10-21')).toMatchObject({ type: 'premier', fin: '2026-09-30' });
    expect(M.echeanceVoiture('2018-03-10', '2025-05-14', '2026-10-21')).toMatchObject({ type: 'periodique', fin: '2027-05-13' });
  });
});
describe('camionnette (F33353)', () => {
  it('contrôle du 1er octobre 2025 → pollution entre le 1er août et le 30 septembre 2026', () => {
    expect(M.pollutionCamionnette('2025-10-01')).toEqual({ debut: '2026-08-01', fin: '2026-09-30' });
  });
});
describe('deux-roues (F37538)', () => {
  it('mise en circulation le 20 juin 2021 → au plus tard le 20 octobre 2026', () => { expect(M.premierControleDeuxRoues('2021-06-20')).toEqual({ cas: 'calendrier2026', fin: '2026-10-20' }); });
  it('mise en circulation en novembre 2020 → plafonné au 31 décembre 2026', () => { expect(M.premierControleDeuxRoues('2020-11-15').fin).toBe('2026-12-31'); });
  it('mise en circulation le 1er octobre 2022 → entre le 1er avril et le 30 septembre 2027', () => {
    expect(M.premierControleDeuxRoues('2022-10-01')).toEqual({ cas: 'fenetre', debut: '2027-04-01', fin: '2027-09-30' });
  });
  it('immatriculée en 2018 → échéance passée (2025)', () => { expect(M.premierControleDeuxRoues('2018-05-02')).toEqual({ cas: 'echu', fin: '2025-12-31' }); });
  it('favorable le 14 mai 2025 → valable jusqu’au 13 mai 2028', () => { expect(M.finValidite('2025-05-14', 3)).toBe('2028-05-13'); });
  it('contre-visite favorable (5 juin 2026) → 4 juin 2029', () => { expect(M.apresContreVisite('2026-06-05', true)).toBe('2029-06-04'); });
});
describe('collection et vente (F328, F16540)', () => {
  it('contrôle du 15 janvier 2024 passé en collection → 15 janvier 2029', () => { expect(M.collection(1985, '2024-01-15')).toEqual({ dispense: false, prochain: '2029-01-15' }); });
  it('avant 1960 : dispensé', () => { expect(M.collection(1958).dispense).toBe(true); });
  it('vente', () => {
    expect(M.venteObligatoire({ deuxRoues: false, ageAns: 3, moisDepuisDernierCt: null, acheteurPro: false }).obligatoire).toBe(false);
    expect(M.venteObligatoire({ deuxRoues: false, ageAns: 7, moisDepuisDernierCt: 4, acheteurPro: false }).raison).toBe('recent');
    expect(M.venteObligatoire({ deuxRoues: false, ageAns: 7, moisDepuisDernierCt: 9, acheteurPro: false }).obligatoire).toBe(true);
    expect(M.venteObligatoire({ deuxRoues: true, ageAns: 4, moisDepuisDernierCt: null, acheteurPro: false }).obligatoire).toBe(false);
    expect(M.venteObligatoire({ deuxRoues: true, ageAns: 6, moisDepuisDernierCt: null, acheteurPro: true }).raison).toBe('pro');
  });
});
describe('dates', () => {
  it('fin de mois', () => { expect(M.addMonths('2026-12-31', 2)).toBe('2027-02-28'); expect(M.addDays('2026-03-01', -1)).toBe('2026-02-28'); expect(M.monthsBetween('2026-01-15', '2026-07-14')).toBe(5); });
  it('coût de détention : voiture achetée neuve, gardée 10 ans → contrôles à 4, 6, 8 et 10 ans', () => { expect(M.coutDetention(0, 10, 80)).toEqual({ controles: 4, total: 320 }); });
});
describe('prix : le moteur retrouve les chiffres publiés', () => {
  const raw = JSON.parse(fs.readFileSync(new URL('../../../public/data/centres.json', import.meta.url), 'utf8'));
  const centres: M.Centre[] = raw.c.map(M.decode);
  it('médiane nationale essence identique à stats.json', () => {
    expect(M.summary(centres.map((c) => c.t.e?.[0]))!.med).toBe(stats.national.s.e.med);
    expect(centres.length).toBe(stats.national.centres);
  });
  it('aucun prix hors des bornes de vraisemblance', () => {
    for (const c of centres) for (const t of Object.values(c.t)) { expect(t![0]).toBeGreaterThanOrEqual(30); expect(t![0]).toBeLessThanOrEqual(250); }
  });
  it('autour de Paris : au moins 5 centres, triés par distance, synthèse cohérente', () => {
    const l = M.autour(centres, 48.86, 2.35, 'e', 5);
    expect(l.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < l.length; i++) expect(l[i].km!).toBeGreaterThanOrEqual(l[i - 1].km!);
    const s = M.synthese(l, 'e');
    expect(s.moinsCher!.t.e![0]).toBe(s.resume!.min);
    expect(s.economie).toBeGreaterThanOrEqual(0);
  });
  it('commune isolée : le rayon s’élargit jusqu’à 5 centres', () => { expect(M.autour(centres, 44.35, 3.2, 'm', 1).length).toBe(5); });
  it('chaque ville à page a ses centres', () => { for (const v of Object.values(villes) as any[]) expect(v.liste.length).toBeGreaterThanOrEqual(10); });
});

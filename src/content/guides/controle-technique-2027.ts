import { defineGuide, type Helpers } from '../../lib/guide-types';

/* 2027 : aucun texte nouveau sur les règles (fiches Service Public F33354 et F37538 vérifiées le 1er janvier 2026,
   relues le 2026-11-22). Les échéances 2027 sont calculées par le moteur à partir de ces règles ; les prix 2027
   n'existent pas encore (prix libres, déclarés par chaque centre) : la page donne les médianes du fichier du jour. */
const N = (h: Helpers) => h.S.national;
const ex = (h: Helpers) => ({
  v: h.M.premierControleVoiture('2023-05-15'),
  v25: h.M.finValidite('2025-06-10', h.P.voiture.validite_favorable_ans),
  m22: h.M.premierControleDeuxRoues('2022-10-01'),
  m21: h.M.premierControleDeuxRoues('2021-11-20'),
  m24: h.M.finValidite('2024-09-05', h.P.deux_roues.validite_favorable_ans),
});

export default defineGuide({
  id: 'controle-technique-2027',
  group: 'regles',
  order: 2,
  mini: 'echeance',
  related: ['quand-faire-controle-technique', 'controle-technique-moto', 'contre-visite', 'controle-technique-collection', 'departements'],
  sources: ['spVoiture', 'spDeuxRoues', 'spCollection', 'dataset', 'prixConso'],
  fr: {
    slug: 'controle-technique-2027',
    nav: 'Contrôle technique 2027',
    card: 'Qui doit passer le contrôle en 2027, voiture, moto ou collection, et à quel prix.',
    title: 'Contrôle technique 2027 : qui doit le passer, dates et prix',
    description: 'Contrôle technique 2027 : voitures de 2023, contrôles de 2025, motos de 2022 et de 2024, fin du calendrier 2026 des deux-roues, prix médian des centres.',
    h1: 'Contrôle technique 2027 : les véhicules concernés',
    intro: 'Votre contrôle technique tombe-t-il en 2027 ? Le mini-simulateur donne la date à partir de la carte grise ; le tableau dit quels véhicules passent l’an prochain.',
    resume: (h) => {
      const e = ex(h), n = N(h);
      return `Aucune règle nouvelle du contrôle technique n’est publiée pour 2027 : les fiches Service Public des voitures et des deux-roues, vérifiées le 1er janvier 2026, restent celles qui s’appliquent. Ce qui change, c’est la liste des véhicules qui arrivent à échéance. Les voitures mises en circulation en 2023 passent leur premier contrôle, dans les six mois qui précèdent leurs quatre ans : pour une voiture du 15 mai 2023, entre le ${h.date(e.v.debut)} et le ${h.date(e.v.fin)}. Les voitures contrôlées favorablement en 2025 repassent en 2027. Côté deux-roues, le calendrier de rattrapage se termine le 31 décembre 2026 : à partir de 2027, une moto de 2020 ou 2021 jamais contrôlée est en retard. Les motos de 2022 passent leur premier contrôle avant leurs cinq ans, et celles contrôlées en 2024, la première vague, repassent trois ans après. Les prix restent libres : la médiane nationale est de ${h.prix(n.s.e.med)} pour une voiture à essence et de ${h.prix(n.s.m.med)} pour une moto, d’après le fichier DGCCRF du ${h.date(h.S.meta.fichier)}. Aucun prix 2027 n’est publié ; chaque centre déclare ses nouveaux tarifs quand il les change.`;
    },
    faqs: (h) => {
      const e = ex(h), n = N(h);
      return [
        { q: 'Ma voiture de 2023 doit-elle passer le contrôle technique en 2027 ?', a: `Oui : ses quatre ans tombent en 2027, donc la date limite aussi, même si la fenêtre s’ouvre dès 2026 pour une voiture du premier semestre. Le premier contrôle est dû dans les six mois qui précèdent les quatre ans de la date en case B de la carte grise : une voiture du 15 mai 2023 doit passer entre le ${h.date(e.v.debut)} et le ${h.date(e.v.fin)}.` },
        { q: 'Le prix du contrôle technique augmente-t-il en 2027 ?', a: `Personne ne le fixe : le prix est libre et chaque centre le déclare à la DGCCRF quand il le change. Aucune hausse générale n’est annoncée. Le fichier public du ${h.date(h.S.meta.fichier)} donne une médiane de ${h.prix(n.s.e.med)} pour une voiture à essence, avec un centre sur dix à ${h.prix(n.s.e.p10)} ou moins ; seuls ${h.pct(n.misAJour2026, 0)} des centres ont mis à jour leur fiche en 2026.` },
        { q: 'Ma moto de 2021 n’est pas encore contrôlée : que se passe-t-il en 2027 ?', a: `Le calendrier des deux-roues mis en circulation en 2020 et 2021 impose le premier contrôle en 2026, au plus tard quatre mois après la date anniversaire et jamais après le 31 décembre 2026. Une moto du 20 novembre 2021 devait passer avant le ${h.date(e.m21.fin)}. En 2027 elle est en retard : contrôle à faire sans attendre, amende forfaitaire de ${h.eur(h.P.sanctions.amende_forfaitaire)} si elle est contrôlée sur la route.` },
        { q: 'Les motos contrôlées en 2024 repassent-elles en 2027 ?', a: `Oui. Un contrôle favorable d’un deux-roues vaut ${h.num(h.P.deux_roues.validite_favorable_ans)} ans : une moto contrôlée le 5 septembre 2024 doit repasser au plus tard le ${h.date(e.m24)}. Les véhicules mis en circulation avant 2017, qui devaient être contrôlés en 2024, forment donc la première vague des renouvellements en 2027.` },
      ];
    },
    body: (h) => {
      const e = ex(h), n = N(h);
      return `<h2>Qui passe le contrôle technique en 2027</h2>
<p>Les règles ne changent pas au 1er janvier 2027 : premier contrôle à quatre ans pour une voiture, puis tous les deux ans ; premier contrôle à cinq ans pour un deux-roues mis en circulation depuis 2022, puis tous les trois ans ; tous les cinq ans pour un véhicule de collection. Le tableau applique ces règles aux années de mise en circulation et de dernier contrôle.</p>
${h.table(['Véhicule', 'Contrôle dû en 2026', 'Contrôle dû en 2027'], [
  ['Voiture, premier contrôle', 'mise en circulation en 2022', 'mise en circulation en 2023'],
  ['Voiture, contrôle périodique', 'dernier contrôle en 2024', 'dernier contrôle en 2025'],
  ['Deux-roues, premier contrôle', 'mise en circulation en 2020 ou 2021 (avant le 31/12/2026)', 'mise en circulation en 2022'],
  ['Deux-roues, renouvellement', 'aucun (premiers contrôles en 2024)', 'dernier contrôle en 2024'],
  ['Véhicule de collection', 'dernier contrôle en 2021', 'dernier contrôle en 2022'],
], 'Échéances calculées à partir des fiches Service Public F33354 (voiture) et F37538 (deux-roues) ; la date limite tombe dans l’année indiquée, la fenêtre du premier contrôle peut s’ouvrir six mois plus tôt.', ['l', 'l', 'l'])}
<p>Sources : ${h.src('spVoiture')}, ${h.src('spDeuxRoues')}, ${h.src('spCollection')}.</p>
<h2>Voitures : la génération 2023 et les contrôles de 2025</h2>
<p>Une voiture neuve immatriculée en 2023 atteint ses quatre ans en 2027. La fenêtre de son premier contrôle s’ouvre six mois avant : pour une mise en circulation au 15 mai 2023, entre le ${h.date(e.v.debut)} et le ${h.date(e.v.fin)}. Une voiture immatriculée en décembre 2023 peut être contrôlée dès juin 2027 et a jusqu’en décembre 2027 ; une voiture de janvier 2023 peut l’être dès juillet 2026, mais sa date limite tombe aussi en 2027.</p>
<p>Pour les contrôles périodiques, la date limite est la veille de l’anniversaire du dernier contrôle favorable : un contrôle passé le 10 juin 2025 est valable jusqu’au ${h.date(e.v25)}. Le mini-simulateur en haut de page fait ce calcul pour votre voiture.</p>
<h2>Deux-roues : fin du rattrapage, première vague de renouvellements</h2>
<p>Le contrôle des véhicules de catégorie L, obligatoire depuis le 15 avril 2024, a été échelonné. Les véhicules mis en circulation avant 2017 devaient passer en 2024, ceux de 2017 à 2019 en 2025, ceux de 2020 et 2021 en 2026, au plus tard le 31 décembre 2026. En 2027, ce rattrapage est terminé : chaque deux-roues suit le régime permanent.</p>
<p>Une moto mise en circulation le 1er octobre 2022 passe son premier contrôle entre le ${h.date(e.m22.debut!)} et le ${h.date(e.m22.fin)}, l’exemple même de la fiche Service Public. Les deux-roues contrôlés en 2024 arrivent au terme de leurs ${h.num(h.P.deux_roues.validite_favorable_ans)} ans : un contrôle du 5 septembre 2024 est à renouveler avant le ${h.date(e.m24)}. ${h.num(n.centresMoto)} centres déclarent un prix moto dans le fichier public ; la page ${h.a('controle-technique-moto', 'contrôle technique moto')} les classe.</p>
<!--mini:moto-->
<h2>Le prix du contrôle technique en 2027</h2>
<p>Il n’existe pas de tarif réglementé : chaque centre fixe ses prix et les déclare, avec leur date d’application, dans le fichier ${h.src('dataset', 'publié chaque jour par la DGCCRF')}. Aucun tarif 2027 n’y figure encore, et rien n’oblige les centres à changer de prix au 1er janvier. Les médianes du fichier du ${h.date(h.S.meta.fichier)} sont le meilleur repère :</p>
${h.table(['Contrôle', 'Médiane', '1 centre sur 10 à', 'Centres'], [
  ['Voiture essence', h.prix(n.s.e.med), h.prix(n.s.e.p10), h.num(n.s.e.n)],
  ['Voiture diesel', h.prix(n.s.d.med), h.prix(n.s.d.p10), h.num(n.s.d.n)],
  ['Voiture électrique', h.prix(n.s.el.med), h.prix(n.s.el.p10), h.num(n.s.el.n)],
  ['Moto', h.prix(n.s.m.med), h.prix(n.s.m.p10), h.num(n.s.m.n)],
  ['Contre-visite (prix le plus haut)', h.prix(n.cv.max.med), h.prix(n.cv.max.p10), h.num(n.cv.max.n)],
], `Fichier DGCCRF du ${h.date(h.S.meta.fichier)} ; « 1 centre sur 10 à » : prix au-dessous duquel se trouvent les 10 % de centres les moins chers.`, ['l', 'r', 'r', 'r'])}
<p>L’écart entre centres voisins pèse plus que le calendrier : ${h.pct(n.jamaisDepuis2020, 0)} des centres n’ont pas touché à leur fiche depuis 2020, et le prix affiché au comptoir peut avoir bougé. Vérifiez-le sur ${h.src('prixConso', 'prix.conso.gouv.fr')} ou par téléphone avant le rendez-vous. Le ${h.a('departements', 'classement des départements')} montre où le contrôle coûte le moins cher.</p>
<h2>Bien placer son contrôle de 2027</h2>
<p>Passer le contrôle en avance ne fait rien gagner : la nouvelle validité court de la date du nouveau contrôle. Le bon moment est trois à quatre semaines avant l’échéance, ce qui laisse les deux mois de la ${h.a('contre-visite', 'contre-visite')} si une défaillance majeure est relevée. Les centres sont plus chargés avant l’été et en décembre, et le seront particulièrement fin 2026 avec les derniers deux-roues de 2020 et 2021.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-2027',
    nav: 'Contrôle technique 2027',
    card: 'Which cars, motorcycles and classics are due for the test in 2027, and the price.',
    title: 'Contrôle technique 2027 in France: who is due, dates, prices',
    description: 'Contrôle technique 2027: cars from 2023, tests passed in 2025, motorcycles from 2022 and 2024, the end of the 2026 two-wheeler timetable, and the median price.',
    h1: 'Contrôle technique 2027: which vehicles are due',
    intro: 'Is your contrôle technique due in 2027? The mini calculator gives the date from the registration certificate; the table lists the vehicles due next year.',
    resume: (h) => {
      const e = ex(h), n = N(h);
      return `No new contrôle technique rules have been published for 2027: the Service Public pages for cars and two-wheelers, checked on 1 January 2026, still apply. What changes is which vehicles fall due. Cars first registered in 2023 take their first test in the six months before they turn four: for a car registered on 15 May 2023, between ${h.date(e.v.debut)} and ${h.date(e.v.fin)}. Cars that passed in 2025 are due again in 2027. For two-wheelers, the catch-up timetable ends on 31 December 2026: from 2027, a 2020 or 2021 motorcycle never tested is overdue. Motorcycles from 2022 take their first test before they turn five, and those tested in 2024, the first wave, are due again three years later. Prices remain free: the national median is ${h.prix(n.s.e.med)} for a petrol car and ${h.prix(n.s.m.med)} for a motorcycle, according to the DGCCRF file of ${h.date(h.S.meta.fichier)}. No 2027 prices are published; each centre declares new prices when it changes them.`;
    },
    faqs: (h) => {
      const e = ex(h), n = N(h);
      return [
        { q: 'Does my 2023 car need a contrôle technique in 2027?', a: `Yes: it turns four in 2027, so the deadline falls in 2027 too, even though the window opens in 2026 for a car registered in the first half of the year. The first test is due in the six months before the fourth anniversary of the date in box B of the registration certificate: a car from 15 May 2023 must be tested between ${h.date(e.v.debut)} and ${h.date(e.v.fin)}.` },
        { q: 'Will the contrôle technique cost more in 2027?', a: `Nobody sets the price: it is free, and each centre declares it to the DGCCRF when it changes. No general rise has been announced. The public file of ${h.date(h.S.meta.fichier)} gives a median of ${h.prix(n.s.e.med)} for a petrol car, with one centre in ten at ${h.prix(n.s.e.p10)} or less; only ${h.pct(n.misAJour2026, 0)} of centres updated their record in 2026.` },
        { q: 'My 2021 motorcycle has not been tested yet: what happens in 2027?', a: `Two-wheelers first registered in 2020 and 2021 had to take their first test in 2026, at the latest four months after the anniversary and never after 31 December 2026. A motorcycle from 20 November 2021 was due by ${h.date(e.m21.fin)}. In 2027 it is overdue: get it tested now, as a roadside check means a fixed fine of ${h.eur(h.P.sanctions.amende_forfaitaire)}.` },
        { q: 'Are motorcycles tested in 2024 due again in 2027?', a: `Yes. A pass for a two-wheeler lasts ${h.num(h.P.deux_roues.validite_favorable_ans)} years: a motorcycle tested on 5 September 2024 must be tested again by ${h.date(e.m24)}. Vehicles first registered before 2017, which had to be tested in 2024, are therefore the first wave of renewals in 2027.` },
      ];
    },
    body: (h) => {
      const e = ex(h), n = N(h);
      return `<h2>Who takes the contrôle technique in 2027</h2>
<p>The rules do not change on 1 January 2027: a first test at four years for a car, then every two years; a first test at five years for a two-wheeler registered since 2022, then every three years; every five years for a classic vehicle. The table applies these rules to the year of first registration and of the last test.</p>
${h.table(['Vehicle', 'Due in 2026', 'Due in 2027'], [
  ['Car, first test', 'first registered in 2022', 'first registered in 2023'],
  ['Car, periodic test', 'last test in 2024', 'last test in 2025'],
  ['Two-wheeler, first test', 'first registered in 2020 or 2021 (by 31/12/2026)', 'first registered in 2022'],
  ['Two-wheeler, renewal', 'none (first tests in 2024)', 'last test in 2024'],
  ['Classic vehicle', 'last test in 2021', 'last test in 2022'],
], 'Due dates worked out from Service Public pages F33354 (car) and F37538 (two-wheeler); the deadline falls in the year shown, and the first-test window can open six months earlier.', ['l', 'l', 'l'])}
<p>Sources: ${h.src('spVoiture')}, ${h.src('spDeuxRoues')}, ${h.src('spCollection')}.</p>
<h2>Cars: the 2023 generation and the 2025 tests</h2>
<p>A new car registered in 2023 turns four in 2027. The window for its first test opens six months earlier: for a car first registered on 15 May 2023, between ${h.date(e.v.debut)} and ${h.date(e.v.fin)}. A car registered in December 2023 can be tested from June 2027 and has until December 2027; one from January 2023 can be tested from July 2026, but its deadline also falls in 2027.</p>
<p>For periodic tests, the deadline is the day before the anniversary of the last pass: a test passed on 10 June 2025 is valid until ${h.date(e.v25)}. The mini calculator at the top does this sum for your car.</p>
<h2>Two-wheelers: catch-up over, first renewals</h2>
<p>The test for category L vehicles, compulsory since 15 April 2024, was phased in. Vehicles registered before 2017 had to be tested in 2024, those from 2017 to 2019 in 2025, those from 2020 and 2021 in 2026, by 31 December 2026 at the latest. In 2027 the catch-up is over and every two-wheeler is on the permanent regime.</p>
<p>A motorcycle first registered on 1 October 2022 takes its first test between ${h.date(e.m22.debut!)} and ${h.date(e.m22.fin)}, the very example of the Service Public page. Two-wheelers tested in 2024 reach the end of their ${h.num(h.P.deux_roues.validite_favorable_ans)} years: a test of 5 September 2024 must be renewed by ${h.date(e.m24)}. ${h.num(n.centresMoto)} centres declare a motorcycle price in the public file; the ${h.a('controle-technique-moto', 'motorcycle test')} page ranks them.</p>
<!--mini:moto-->
<h2>What the contrôle technique costs in 2027</h2>
<p>There is no regulated price: each centre sets its prices and declares them, with the date they apply from, in the file ${h.src('dataset', 'published daily by the DGCCRF')}. No 2027 prices appear yet, and nothing requires centres to change them on 1 January. The medians of the file of ${h.date(h.S.meta.fichier)} are the best guide:</p>
${h.table(['Test', 'Median', '1 centre in 10 at', 'Centres'], [
  ['Petrol car', h.prix(n.s.e.med), h.prix(n.s.e.p10), h.num(n.s.e.n)],
  ['Diesel car', h.prix(n.s.d.med), h.prix(n.s.d.p10), h.num(n.s.d.n)],
  ['Electric car', h.prix(n.s.el.med), h.prix(n.s.el.p10), h.num(n.s.el.n)],
  ['Motorcycle', h.prix(n.s.m.med), h.prix(n.s.m.p10), h.num(n.s.m.n)],
  ['Re-inspection (highest price)', h.prix(n.cv.max.med), h.prix(n.cv.max.p10), h.num(n.cv.max.n)],
], `DGCCRF file of ${h.date(h.S.meta.fichier)}; “1 centre in 10 at”: price below which the cheapest 10% of centres sit.`, ['l', 'r', 'r', 'r'])}
<p>The gap between neighbouring centres matters more than the calendar: ${h.pct(n.jamaisDepuis2020, 0)} of centres have not updated their record since 2020, and the price at the counter may have moved. Check it on ${h.src('prixConso', 'prix.conso.gouv.fr')} or by phone before booking. The ${h.a('departements', 'département ranking')} shows where the test costs least.</p>
<h2>Timing your 2027 test</h2>
<p>Testing early gains nothing: the new validity runs from the date of the new test. The right moment is three to four weeks before the deadline, which leaves the two months of the ${h.a('contre-visite', 're-inspection')} if a major defect is found. Centres are busier before the summer and in December, and will be especially so at the end of 2026 with the last 2020 and 2021 two-wheelers.</p>`;
    },
  },
});

import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number };
const N = (h: Helpers) => h.S.national;
const S = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
/** Départements sans aucun centre qui déclare un tarif moto. */
const sansMoto = (h: Helpers) => Object.entries(h.S.depts as unknown as Record<string, { s: Record<string, R | undefined> }>).filter(([, d]) => !d.s.m).map(([d]) => h.dep(d));
const motoPlusChere = (h: Helpers) => { const s = S(h); return s.m.med > s.e.med; };

export default defineGuide({
  id: 'controle-technique-moto',
  group: 'regles',
  order: 2,
  tool: 'centres',
  vehicule: 'm',
  vehicules: ['m', 'cy', 'q', 'tr', 'vt'],
  related: ['controle-technique-scooter-quad', 'quand-faire-controle-technique', 'contre-visite', 'controle-technique-vente', 'departements'],
  sources: ['spDeuxRoues', 'dataset', 'prixConso', 'codeR323'],
  fr: {
    slug: 'controle-technique-moto',
    nav: 'Moto',
    card: 'Prix moto centre par centre, calendrier selon l’année, contre-visite.',
    title: 'Contrôle technique moto 2026 : prix par centre et calendrier',
    description: 'Contrôle technique moto en 2026 : prix déclaré par chaque centre équipé, médiane, contre-visite, calendrier selon l’année d’immatriculation, puis 3 ans.',
    h1: 'Contrôle technique moto : prix et calendrier',
    intro: 'Les centres équipés pour les motos autour de votre commune, leur prix déclaré et la date de votre premier contrôle.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `Le contrôle technique des motos coûte ${h.prix(s.m.med)} en médiane en France, d’après les prix que déclarent les ${h.num(n.centresMoto)} centres équipés pour les deux-roues dans le fichier public de la DGCCRF du ${h.date(h.S.meta.fichier)}. Un centre sur dix est sous ${h.prix(s.m.p10)}, un sur dix au-dessus de ${h.prix(s.m.p90)}. La contre-visite se déclare entre ${h.prix(n.cvm.min.med)} et ${h.prix(n.cvm.max.med)} en médiane. Obligatoire depuis le 15 avril 2024 pour les motos, scooters, tricycles, quads et voiturettes, le contrôle suit un calendrier qui dépend de l’année de première mise en circulation : les plus anciennes motos auraient déjà dû passer, celles de 2020 et 2021 passent en 2026, les plus récentes dans les six mois avant leur cinquième anniversaire. Il se renouvelle ensuite tous les trois ans. Comme seuls ${h.pct(n.centresMoto / n.centres, 0)} des centres contrôlent les deux-roues, l’outil ci-dessus cherche plus loin si besoin : tapez votre commune pour voir les centres équipés autour de vous.`;
    },
    faqs: (h) => {
      const s = S(h);
      return [
        { q: 'Pourquoi si peu de centres font-ils le contrôle technique des motos ?', a: `Le contrôle d’un deux-roues demande un équipement spécifique (banc de freinage adapté, fixations, sonomètre) et un contrôleur qualifié pour cette catégorie. Beaucoup de centres n’ont pas investi : seuls ${h.num(N(h).centresMoto)} déclarent un tarif moto, contre ${h.num(N(h).centresVp)} pour les voitures. Dans certains départements, il faut parcourir plusieurs dizaines de kilomètres.` },
        { q: 'Le contrôle technique moto est-il plus cher que celui d’une voiture ?', a: `En général non : la médiane moto est de ${h.prix(s.m.med)}, contre ${h.prix(s.e.med)} pour une voiture essence. ${motoPlusChere(h) ? 'Elle est pourtant plus élevée aujourd’hui, signe que l’offre reste rare.' : 'L’examen compte moins de points et prend moins de temps.'} Les écarts entre centres restent importants, surtout là où un seul centre est équipé dans un large secteur.` },
        { q: 'Combien de temps dure le contrôle technique d’une moto ?', a: `Comptez environ une demi-heure. Le contrôleur vérifie ${h.num(h.P.points_controle.deux_roues)} points : identification, freinage, direction, éclairage, pneus, suspensions, échappement, niveau sonore et émissions. Venez avec la carte grise et, pour une contre-visite, le procès-verbal du premier contrôle. L’attente sur place s’y ajoute : réserver un créneau évite de patienter derrière les voitures.` },
        { q: 'Faut-il passer le contrôle technique pour une moto de piste ou d’enduro ?', a: 'Une moto qui n’est pas immatriculée n’est pas concernée. Les motos d’enduro et de trial à usage sportif sont dispensées tant que leur propriétaire justifie d’une licence annuelle de la Fédération française de motocyclisme. Hors de ce cas, une moto immatriculée suit le calendrier général.' },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), sm = sansMoto(h);
      return `<h2>Le prix d’un contrôle moto, centre par centre</h2>
<p>L’outil affiche, autour de la commune choisie, les centres qui déclarent un prix pour la catégorie sélectionnée : moto, cyclomoteur, quad, tricycle ou voiturette. Le prix de la visite, la fourchette de la contre-visite et la date du tarif viennent du fichier public où chaque centre déclare ses prix. Pour la moto, la médiane nationale est de ${h.prix(s.m.med)}, avec des extrêmes de ${h.prix(s.m.min)} à ${h.prix(s.m.max)}.</p>
<p>Les centres équipés pour les deux-roues sont rares : ${h.num(n.centresMoto)} sur ${h.num(n.centres)}. Quand moins de cinq centres sont dans le rayon choisi, l’outil élargit la recherche aux cinq plus proches, et le rayon effectif s’affiche dans le titre du résultat. ${sm.length ? `Aujourd’hui, aucun centre ne déclare de tarif moto dans ${sm.length > 1 ? `${h.num(sm.length)} départements (${sm.join(', ')})` : `un département (${sm[0]})`}.` : 'Aujourd’hui, chaque département compte au moins un centre qui déclare un tarif moto.'}</p>
<h2>Le calendrier du premier contrôle</h2>
<p>Le contrôle des véhicules de catégorie L est obligatoire depuis le 15 avril 2024. Plutôt que d’imposer un contrôle à tout le parc la même année, l’État l’a échelonné selon la date de première mise en circulation, inscrite en case B de la carte grise. Les motos les plus anciennes devaient être contrôlées en 2024 ou en 2025 ; celles qui ne l’ont pas été sont en retard. Les motos de 2020 et 2021 passent en 2026, dans les quatre mois qui suivent leur date anniversaire. À partir des motos de 2022, la règle est fixe : premier contrôle dans les six mois qui précèdent le cinquième anniversaire, puis tous les trois ans.</p>
<!--mini:moto-->
<p>La date limite figure ensuite sur le procès-verbal. Un retard expose à la même amende forfaitaire que pour une voiture, ${h.eur(h.P.sanctions.amende_forfaitaire)}. Les détails pour tous les véhicules sont dans le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')}.</p>
<h2>Ce que le contrôleur vérifie sur une moto</h2>
<p>L’examen compte ${h.num(h.P.points_controle.deux_roues)} points. Les plus surveillés : le freinage, mesuré sur un banc adapté aux deux-roues ; les pneus et les jantes ; la direction et les suspensions ; l’éclairage, y compris le feu stop et les clignotants ; l’échappement, contrôlé pour le bruit et les émissions. L’homologation du pot d’échappement et la conformité de la plaque d’immatriculation sont aussi vérifiées. Comme pour la voiture, le contrôle se fait sans démontage.</p>
<p>Les défaillances sont classées en mineures, majeures et critiques. Une défaillance majeure impose une contre-visite dans les deux mois ; une défaillance critique interdit de rouler après le jour du contrôle. La page ${h.a('defaillances-controle-technique', 'défaillances')} explique les trois niveaux.</p>
<h2>La contre-visite moto</h2>
<p>Pour les deux-roues, les centres déclarent une contre-visite entre ${h.prix(n.cvm.min.med)} et ${h.prix(n.cvm.max.med)} en médiane ; ${h.pct(n.cvm.gratuite, 0)} l’annoncent gratuite dans certains cas, contre ${h.pct(n.cv.gratuite, 0)} pour les voitures. Comme l’offre est rare, revenir dans le même centre est souvent le plus simple, mais rien n’y oblige. Le délai, deux mois, et les règles sont détaillés sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Scooters, 50 cm³, quads et voiturettes</h2>
<p>Le même calendrier s’applique aux cyclomoteurs de 50 cm³, aux tricycles, aux quads homologués pour la route et aux voiturettes sans permis. Leurs prix diffèrent : ${h.prix(s.cy.med)} en médiane pour un cyclomoteur, ${h.prix(s.q.med)} pour un quad, ${h.prix(s.vt.med)} pour une voiturette. La page ${h.a('controle-technique-scooter-quad', 'scooter, quad et voiturette')} les compare, et le mini-simulateur ci-dessous donne la médiane de votre département pour chaque catégorie.</p>
<!--mini:deuxRouesPrix-->
<h2>Vendre sa moto</h2>
<p>Depuis 2024, une moto de plus de cinq ans se vend à un particulier avec un contrôle de moins de six mois. Pour beaucoup de motos, ce sera le premier contrôle de leur vie. Le guide ${h.a('controle-technique-vente', 'de la vente')} détaille les cas, dont la vente en l’état après une contre-visite prescrite.</p>`;
    },
  },
  en: {
    slug: 'motorcycle-controle-technique',
    nav: 'Motorcycle',
    card: 'Motorcycle prices centre by centre, timetable by year, re-inspection.',
    title: 'Motorcycle contrôle technique in France: prices and dates',
    description: 'Motorcycle contrôle technique in France, 2026: price declared by each equipped centre, median, re-inspection, timetable by registration year, then 3-yearly.',
    h1: 'Motorcycle contrôle technique: prices and timetable',
    intro: 'Centres equipped for motorcycles around your town, their declared price and the date of your first test.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `The French contrôle technique for motorcycles costs ${h.prix(s.m.med)} at the median, according to the prices declared by the ${h.num(n.centresMoto)} centres equipped for two-wheelers in the DGCCRF’s public file of ${h.date(h.S.meta.fichier)}. One centre in ten is below ${h.prix(s.m.p10)}, one in ten above ${h.prix(s.m.p90)}. The re-inspection (contre-visite) is declared at between ${h.prix(n.cvm.min.med)} and ${h.prix(n.cvm.max.med)} at the median. Compulsory since 15 April 2024 for motorbikes, scooters, trikes, quads and microcars, the test follows a timetable based on the year of first registration: the oldest motorbikes should already have been tested, those from 2020 and 2021 are tested in 2026, the newest in the six months before their fifth anniversary. It is then renewed every three years. Because only ${h.pct(n.centresMoto / n.centres, 0)} of centres test two-wheelers, the tool above searches further if needed: type your town to see the equipped centres around you.`;
    },
    faqs: (h) => {
      const s = S(h);
      return [
        { q: 'Why do so few centres test motorcycles?', a: `Testing a two-wheeler needs specific equipment (a suitable brake tester, mountings, a sound meter) and an inspector qualified for the category. Many centres have not invested: only ${h.num(N(h).centresMoto)} declare a motorcycle price, against ${h.num(N(h).centresVp)} for cars. In some départements you have to travel several dozen kilometres.` },
        { q: 'Is a motorcycle test dearer than a car test?', a: `Usually not: the motorcycle median is ${h.prix(s.m.med)}, against ${h.prix(s.e.med)} for a petrol car. ${motoPlusChere(h) ? 'It is nonetheless higher today, a sign that supply is still scarce.' : 'The test has fewer items and takes less time.'} Gaps between centres are still wide, especially where a single centre is equipped over a large area. The tool, set to “Motorcycle”, shows the price each nearby centre declares.` },
        { q: 'How long does a motorcycle contrôle technique take?', a: `About half an hour. The inspector checks ${h.num(h.P.points_controle.deux_roues)} items: identification, brakes, steering, lights, tyres, suspension, exhaust, noise level and emissions. Bring the registration certificate and, for a re-inspection, the report of the first test. Waiting time at the centre comes on top, so booking a slot avoids queuing behind cars.` },
        { q: 'Does a track or enduro bike need a contrôle technique?', a: 'A motorbike that is not registered is not concerned. Enduro and trial bikes used for sport are exempt as long as the owner holds an annual French motorcycling federation licence. Otherwise, a registered motorbike follows the general timetable. The mini calculator on this page gives the first deadline from the date of first registration shown on the certificate.' },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), sm = sansMoto(h);
      return `<h2>The price of a motorcycle test, centre by centre</h2>
<p>Around the town you choose, the tool shows the centres that declare a price for the selected category: motorbike, moped, quad, trike or microcar. The test price, the re-inspection range and the date of the price come from the public file in which every centre declares its prices. For motorbikes the national median is ${h.prix(s.m.med)}, with extremes from ${h.prix(s.m.min)} to ${h.prix(s.m.max)}.</p>
<p>Centres equipped for two-wheelers are scarce: ${h.num(n.centresMoto)} out of ${h.num(n.centres)}. When fewer than five are within the chosen distance, the tool widens to the five nearest, and the actual radius appears in the result heading. ${sm.length ? `Today, no centre declares a motorcycle price in ${sm.length > 1 ? `${h.num(sm.length)} départements (${sm.join(', ')})` : `one département (${sm[0]})`}.` : 'Today every département has at least one centre declaring a motorcycle price.'}</p>
<h2>The first-test timetable</h2>
<p>Testing category L vehicles has been compulsory since 15 April 2024. Rather than test the whole fleet in one year, the state staggered it by first registration date, shown in box B of the registration certificate. The oldest motorbikes were due in 2024 or 2025; those not yet tested are late. Motorbikes from 2020 and 2021 are tested in 2026, within four months after their anniversary date. From 2022 onwards the rule is fixed: first test in the six months before the fifth anniversary, then every three years.</p>
<!--mini:moto-->
<p>The deadline then appears on the report. Being late risks the same fixed fine as for a car, ${h.eur(h.P.sanctions.amende_forfaitaire)}. Details for every vehicle are in the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')}.</p>
<h2>What the inspector checks on a motorbike</h2>
<p>The test has ${h.num(h.P.points_controle.deux_roues)} items. The most closely watched: brakes, measured on a tester suited to two-wheelers; tyres and rims; steering and suspension; lights, including the brake light and indicators; and the exhaust, checked for noise and emissions. Whether the exhaust is type-approved and the number plate compliant is checked too. As for cars, nothing is dismantled.</p>
<p>Defects are graded minor, major or critical. A major defect requires a re-inspection within two months; a critical one bans riding after the day of the test. The ${h.a('defaillances-controle-technique', 'defects page')} explains the three levels.</p>
<h2>The motorcycle re-inspection</h2>
<p>For two-wheelers, centres declare a re-inspection between ${h.prix(n.cvm.min.med)} and ${h.prix(n.cvm.max.med)} at the median; ${h.pct(n.cvm.gratuite, 0)} say it can be free in some cases, against ${h.pct(n.cv.gratuite, 0)} for cars. With so few centres, going back to the same one is often simplest, but nothing requires it. The two-month deadline and the rules are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Scooters, 50 cc, quads and microcars</h2>
<p>The same timetable applies to 50 cc mopeds, trikes, road-legal quads and microcars that need no licence. Their prices differ: ${h.prix(s.cy.med)} at the median for a moped, ${h.prix(s.q.med)} for a quad, ${h.prix(s.vt.med)} for a microcar. The ${h.a('controle-technique-scooter-quad', 'scooter, quad and microcar page')} compares them, and the mini calculator below gives your département’s median for each category.</p>
<!--mini:deuxRouesPrix-->
<h2>Selling your motorbike</h2>
<p>Since 2024, a motorbike over five years old is sold to a private buyer with a test under six months old. For many bikes, that will be their first test ever. The ${h.a('controle-technique-vente', 'selling guide')} covers the cases, including selling as it is after a re-inspection has been prescribed.</p>`;
    },
  },
});

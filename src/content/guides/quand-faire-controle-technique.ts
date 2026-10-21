import { defineGuide, type Helpers } from '../../lib/guide-types';

const N = (h: Helpers) => h.S.national;
/** Exemples calculés par le moteur (mêmes fonctions que les mini-simulateurs). */
const ex = (h: Helpers) => ({
  v1: h.M.premierControleVoiture('2022-06-20'),
  v2: h.M.finValidite('2025-09-10', h.P.voiture.validite_favorable_ans),
  m1: h.M.premierControleDeuxRoues('2021-05-12'),
  m2: h.M.premierControleDeuxRoues('2023-02-08'),
  p: h.M.pollutionCamionnette('2025-04-03'),
});

export default defineGuide({
  id: 'quand-faire-controle-technique',
  group: 'regles',
  order: 1,
  mini: 'echeance',
  related: ['contre-visite', 'controle-technique-moto', 'controle-technique-vente', 'controle-technique-camping-car', 'controle-technique-collection'],
  sources: ['spVoiture', 'spDeuxRoues', 'spCamionnette', 'spCollection', 'spDispense', 'codeR323'],
  fr: {
    slug: 'quand-faire-controle-technique',
    nav: 'Quand faire son contrôle',
    card: 'Premier contrôle à 4 ans, puis tous les 2 ans ; deux-roues, camionnette, collection.',
    title: 'Quand faire son contrôle technique : dates et amende 2026',
    description: 'Quand faire son contrôle technique en 2026 : 4 ans puis tous les 2 ans pour une voiture, calendrier moto, camionnette, collection, retard et amende de 135 €.',
    h1: 'Quand faire son contrôle technique',
    intro: 'La date limite de votre prochain contrôle à partir de la carte grise, et ce que vous risquez si elle est dépassée.',
    resume: (h) => {
      const e = ex(h);
      return `Une voiture particulière passe son premier contrôle technique dans les six mois qui précèdent le quatrième anniversaire de sa première mise en circulation, date inscrite en case B de la carte grise ; ensuite, le contrôle se renouvelle tous les deux ans. Par exemple, une voiture mise en circulation le 20 juin 2022 doit être contrôlée entre le ${h.date(e.v1.debut)} et le ${h.date(e.v1.fin)}. Après un contrôle favorable passé le 10 septembre 2025, le suivant est à faire au plus tard le ${h.date(e.v2)}. Les deux-roues motorisés suivent depuis 2024 un calendrier qui dépend de leur année de mise en circulation, puis un contrôle tous les trois ans. Les camionnettes ajoutent un contrôle pollution chaque année, les véhicules de collection passent tous les cinq ans. Rouler avec un contrôle périmé expose à une amende forfaitaire de ${h.eur(h.P.sanctions.amende_forfaitaire)}. Le mini-simulateur calcule votre date à partir de la carte grise et du dernier procès-verbal ; le contrôle coûte ${h.prix(N(h).s.e.med)} en médiane, d’après le fichier des prix du ${h.date(h.S.meta.fichier)}.`;
    },
    faqs: (h) => [
      { q: 'Peut-on faire son contrôle technique en avance ?', a: 'Oui, à tout moment, mais sans rien y gagner : la nouvelle validité de deux ans court à partir de la date du nouveau contrôle, pas de l’échéance de l’ancien. Seul le premier contrôle d’une voiture neuve a une fenêtre officielle, les six mois avant le quatrième anniversaire. Pour un contrôle périodique, le mieux est de le passer quelques semaines avant l’échéance.' },
      { q: 'Où trouver la date limite de son contrôle technique ?', a: 'Sur la vignette apposée sur le pare-brise et sur le procès-verbal du dernier contrôle, qui indiquent la date avant laquelle le prochain doit être fait. Pour le premier contrôle, la référence est la date de première mise en circulation, en case B du certificat d’immatriculation. Le rapport HistoVec reprend aussi l’historique des contrôles.' },
      { q: 'Quelle amende pour un contrôle technique périmé ?', a: `L’amende forfaitaire est de ${h.eur(h.P.sanctions.amende_forfaitaire)} (contravention de 4e classe, jusqu’à ${h.eur(h.P.sanctions.amende_max)} si elle est contestée devant le juge). Les forces de l’ordre peuvent aussi retenir la carte grise et remettre une fiche de circulation valable ${h.num(h.P.sanctions.fiche_circulation_jours)} jours, le temps de faire le contrôle.` },
      { q: 'Le délai du contrôle technique est-il prolongé en cas de vacances ou d’indisponibilité ?', a: 'Non. Aucune prolongation n’est prévue pour une absence, un déménagement ou un centre complet : la date limite reste celle du procès-verbal. Les seules périodes de prolongation générale ont été décidées par l’État dans des circonstances exceptionnelles. Prévoyez le rendez-vous un mois à l’avance, surtout avant l’été.' },
    ],
    body: (h) => {
      const e = ex(h), n = N(h);
      return `<h2>Voiture particulière : 4 ans, puis tous les 2 ans</h2>
<p>Le calendrier de la voiture tient en deux règles. Le premier contrôle est dû dans les six mois qui précèdent le quatrième anniversaire de la première mise en circulation. Les suivants sont dus tous les deux ans, la veille de la date anniversaire du dernier contrôle favorable.</p>
<p>La date de référence est celle de la case B du certificat d’immatriculation, et non la date d’achat. Pour une voiture importée, c’est la date de première immatriculation dans le pays d’origine qui compte. Le mini-simulateur en haut de page fait le calcul au mois près ; la date exacte est la veille de l’anniversaire.</p>
<h2>Après un contrôle défavorable</h2>
<p>Si le contrôle relève une défaillance majeure ou critique, une contre-visite est obligatoire dans les deux mois. Quand elle est favorable, la validité de deux ans court depuis la date du contrôle d’origine. La page ${h.a('contre-visite', 'contre-visite')} donne la date limite selon votre cas et les prix déclarés, ${h.prix(n.cv.min.med)} à ${h.prix(n.cv.max.med)} en médiane.</p>
<h2>Motos, scooters, quads : le calendrier depuis 2024</h2>
<p>Le contrôle technique des véhicules de catégorie L (deux-roues, tricycles, quadricycles et voiturettes à moteur) est obligatoire depuis le 15 avril 2024. Il a été échelonné selon l’année de mise en circulation : les véhicules les plus anciens devaient être contrôlés en 2024 ou 2025 et sont donc en retard s’ils ne l’ont pas été. Pour ceux de 2020 et 2021, le contrôle se fait en 2026, dans les quatre mois qui suivent la date anniversaire ; une moto mise en circulation le 12 mai 2021 doit ainsi passer avant le ${h.date(e.m1.fin)}. Depuis 2022, la règle est celle de la voiture avec cinq ans au lieu de quatre : une moto du 8 février 2023 doit passer entre le ${h.date(e.m2.debut!)} et le ${h.date(e.m2.fin)}. Ensuite, le contrôle se renouvelle tous les ${h.num(h.P.deux_roues.validite_favorable_ans)} ans.</p>
<!--mini:moto-->
<p>Le détail des prix et des centres équipés pour les deux-roues, ${h.num(n.centresMoto)} en France, est sur la page ${h.a('controle-technique-moto', 'contrôle technique moto')}.</p>
<h2>Camionnettes : un contrôle pollution chaque année</h2>
<p>Une camionnette (catégorie N1, utilitaire léger de 3,5 tonnes au plus) suit le calendrier de la voiture, avec en plus un contrôle complémentaire des émissions polluantes entre deux contrôles complets, dans les deux mois qui précèdent la fin d’un délai d’un an après chaque contrôle. Pour une camionnette contrôlée le 3 avril 2025, le contrôle pollution se fait entre ${h.date(e.p.debut)} et le ${h.date(e.p.fin)}. Son prix ne figure pas dans le fichier public : demandez-le au centre.</p>
<!--mini:camionnette-->
<h2>Camping-cars et véhicules de collection</h2>
<p>Un camping-car de 3,5 tonnes au plus suit le calendrier de la voiture : premier contrôle à quatre ans, puis tous les deux ans. Au-delà de 3,5 tonnes, il relève du contrôle des poids lourds, hors du champ de ce site. Un véhicule de collection, immatriculé avec une carte grise « collection », est contrôlé tous les ${h.num(h.P.collection.periodicite_ans)} ans, et dispensé s’il a été mis en circulation avant le 1er janvier ${h.P.collection.dispense_avant_annee}. Les deux cas ont leur page : ${h.a('controle-technique-camping-car', 'camping-car et utilitaire')}, ${h.a('controle-technique-collection', 'véhicule de collection')}.</p>
<h2>Les véhicules dispensés</h2>
<p>Le contrôle concerne la quasi-totalité des véhicules, thermiques comme électriques. La fiche de Service Public consacrée aux dispenses en liste quelques-uns qui y échappent : les caravanes et les remorques de 3,5 tonnes au plus (hors marchandises dangereuses), les tracteurs agricoles, les véhicules de collection mis en circulation avant 1960, les motos d’enduro et de trial à usage sportif dont le propriétaire a une licence annuelle de la Fédération française de motocyclisme, et les voitures des services diplomatiques. Une voiturette sans permis, elle, est soumise au contrôle des véhicules de catégorie L depuis 2024.</p>
<h2>Ce que vous risquez avec un contrôle périmé</h2>
<p>Circuler sans contrôle valide est une contravention de quatrième classe : amende forfaitaire de ${h.eur(h.P.sanctions.amende_forfaitaire)}, jusqu’à ${h.eur(h.P.sanctions.amende_max)} en cas de poursuite devant le tribunal. Les forces de l’ordre peuvent retenir le certificat d’immatriculation et remettre une fiche de circulation de ${h.num(h.P.sanctions.fiche_circulation_jours)} jours, le temps de faire contrôler le véhicule. Un retard n’entraîne aucun rattrapage ni pénalité au centre : le contrôle se fait normalement, au prix habituel.</p>
<h2>Choisir son moment, et son centre</h2>
<p>Les centres sont plus chargés avant les vacances d’été et en fin d’année ; prendre rendez-vous trois à quatre semaines avant l’échéance laisse de la marge pour une éventuelle contre-visite. Côté prix, l’écart entre centres voisins compte plus que le moment : la médiane nationale est de ${h.prix(n.s.e.med)}, mais un centre sur dix est sous ${h.prix(n.s.e.p10)}. L’outil de la ${h.a('home', 'page d’accueil')} les classe par prix autour de votre commune.</p>`;
    },
  },
  en: {
    slug: 'when-is-controle-technique-due',
    nav: 'When the test is due',
    card: 'First test at 4 years, then every 2; two-wheelers, vans, classics.',
    title: 'Contrôle technique due date in France: rules and fines 2026',
    description: 'When the French contrôle technique is due in 2026: at 4 years then every 2 for a car, the motorcycle timetable, vans, classic cars, lateness and the €135 fine.',
    h1: 'When is the contrôle technique due?',
    intro: 'The deadline for your next test from the registration certificate, and what you risk if you miss it.',
    resume: (h) => {
      const e = ex(h);
      return `A private car in France takes its first contrôle technique in the six months before the fourth anniversary of its first registration, the date in box B of the registration certificate (carte grise); after that, the test is renewed every two years. For example, a car first registered on 20 June 2022 must be tested between ${h.date(e.v1.debut)} and ${h.date(e.v1.fin)}. After a pass on 10 September 2025, the next test is due by ${h.date(e.v2)}. Since 2024, motorised two-wheelers follow a timetable based on their year of first registration, then a test every three years. Vans add an emissions check every year, and classic vehicles are tested every five years. Driving with an expired test risks a fixed fine of ${h.eur(h.P.sanctions.amende_forfaitaire)}. The mini calculator works out your date from the registration certificate and the last report; the test costs ${h.prix(N(h).s.e.med)} at the median, according to the price file of ${h.date(h.S.meta.fichier)}.`;
    },
    faqs: (h) => [
      { q: 'Can I take the contrôle technique early?', a: 'Yes, at any time, but you gain nothing: the new two-year validity runs from the date of the new test, not from the old deadline. Only a new car’s first test has an official window, the six months before its fourth anniversary. For a periodic test, the best time is a few weeks before the deadline.' },
      { q: 'Where do I find my contrôle technique deadline?', a: 'On the sticker on the windscreen and on the report of the last test, which show the date by which the next one must be done. For the first test, the reference is the first registration date in box B of the registration certificate. The HistoVec report also lists the test history.' },
      { q: 'What is the fine for an expired contrôle technique?', a: `The fixed fine is ${h.eur(h.P.sanctions.amende_forfaitaire)} (a 4th-class offence, up to ${h.eur(h.P.sanctions.amende_max)} if it goes before a judge). The police may also keep the registration certificate and issue a ${h.num(h.P.sanctions.fiche_circulation_jours)}-day permit to drive while you get the test done. An expired test can also complicate a sale, since the buyer needs a recent valid report to register the car.` },
      { q: 'Is the deadline extended if I am away or cannot get a slot?', a: 'No. There is no extension for being away, moving house or a fully booked centre: the deadline on the report stands. The only general extensions have been decided by the state in exceptional circumstances. Book a month ahead, especially before the summer.' },
    ],
    body: (h) => {
      const e = ex(h), n = N(h);
      return `<h2>Private car: 4 years, then every 2 years</h2>
<p>A car’s timetable comes down to two rules. The first test is due in the six months before the fourth anniversary of first registration. The following ones are due every two years, by the day before the anniversary of the last pass.</p>
<p>The reference date is box B of the registration certificate, not the purchase date. For an imported car, the first registration date in the country of origin counts. The mini calculator at the top of the page works to the month; the exact date is the day before the anniversary.</p>
<h2>After a failed test</h2>
<p>If the test finds a major or critical defect, a re-inspection is compulsory within two months. When it is a pass, the two-year validity runs from the date of the original test. The ${h.a('contre-visite', 're-inspection page')} gives the deadline for your case and the declared prices, ${h.prix(n.cv.min.med)} to ${h.prix(n.cv.max.med)} at the median.</p>
<h2>Motorbikes, scooters, quads: the timetable since 2024</h2>
<p>The contrôle technique for category L vehicles (two-wheelers, trikes, quads and microcars) has been compulsory since 15 April 2024. It was staggered by year of first registration: the oldest vehicles had to be tested in 2024 or 2025 and are therefore late if they have not been. Those from 2020 and 2021 are tested in 2026, within four months after the anniversary date; a motorbike first registered on 12 May 2021 must be tested by ${h.date(e.m1.fin)}. From 2022, the car rule applies with five years instead of four: a motorbike from 8 February 2023 must be tested between ${h.date(e.m2.debut!)} and ${h.date(e.m2.fin)}. After that, the test is renewed every ${h.num(h.P.deux_roues.validite_favorable_ans)} years.</p>
<!--mini:moto-->
<p>Prices and the centres equipped for two-wheelers, ${h.num(n.centresMoto)} across France, are on the ${h.a('controle-technique-moto', 'motorcycle page')}.</p>
<h2>Vans: an emissions check every year</h2>
<p>A van (category N1, a light commercial vehicle of up to 3.5 tonnes) follows the car timetable, plus an extra emissions check between two full tests, in the two months before the end of a one-year period after each test. For a van tested on 3 April 2025, the emissions check falls between ${h.date(e.p.debut)} and ${h.date(e.p.fin)}. Its price is not in the public file: ask the centre.</p>
<!--mini:camionnette-->
<h2>Motorhomes and classic vehicles</h2>
<p>A motorhome of up to 3.5 tonnes follows the car timetable: first test at four years, then every two. Above 3.5 tonnes it falls under heavy-vehicle testing, outside this site’s scope. A classic vehicle, registered with a “collection” registration certificate, is tested every ${h.num(h.P.collection.periodicite_ans)} years, and exempt if first registered before 1 January ${h.P.collection.dispense_avant_annee}. Both have their own page: ${h.a('controle-technique-camping-car', 'motorhome and van')}, ${h.a('controle-technique-collection', 'classic vehicle')}.</p>
<h2>Exempt vehicles</h2>
<p>The test covers almost every vehicle, combustion and electric alike. The Service Public page on exemptions lists the few that escape it: caravans and trailers of up to 3.5 tonnes (other than for dangerous goods), farm tractors, classic vehicles first registered before 1960, enduro and trial bikes used for sport whose owner holds an annual French motorcycling federation licence, and diplomatic cars. A microcar that needs no licence, on the other hand, has been subject to category L testing since 2024.</p>
<h2>What you risk with an expired test</h2>
<p>Driving without a valid test is a 4th-class offence: a fixed fine of ${h.eur(h.P.sanctions.amende_forfaitaire)}, up to ${h.eur(h.P.sanctions.amende_max)} if prosecuted in court. The police may keep the registration certificate and issue a ${h.num(h.P.sanctions.fiche_circulation_jours)}-day permit to drive while you have the vehicle tested. Being late brings no catch-up charge or penalty at the centre: the test is done as usual, at the usual price.</p>
<h2>Choosing your moment, and your centre</h2>
<p>Centres are busier before the summer holidays and at the end of the year; booking three or four weeks before the deadline leaves room for a possible re-inspection. On price, the gap between nearby centres matters more than timing: the national median is ${h.prix(n.s.e.med)}, but one centre in ten is below ${h.prix(n.s.e.p10)}. The tool on the ${h.a('home', 'home page')} ranks them by price around your town.</p>`;
    },
  },
});

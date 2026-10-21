import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number };
const N = (h: Helpers) => h.S.national;
const S = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
const CAT: Array<[string, string, string]> = [['cy', 'Cyclomoteur 50 cm³ (scooter, mobylette)', '50 cc moped (scooter, moped)'], ['m', 'Moto et scooter de plus de 50 cm³', 'Motorbike and scooter over 50 cc'], ['tr', 'Tricycle, side-car', 'Trike, sidecar'], ['q', 'Quad homologué route', 'Road-legal quad'], ['vt', 'Voiturette sans permis', 'Microcar (no licence)']];
const table = (h: Helpers) => {
  const fr = h.lang === 'fr', s = S(h);
  return h.table(fr ? ['Catégorie', 'Centres', 'Médiane', '1 sur 10 sous', '1 sur 10 au-dessus'] : ['Category', 'Centres', 'Median', '1 in 10 below', '1 in 10 above'], CAT.filter(([k]) => s[k]).map(([k, f, e]) => [fr ? f : e, h.num(s[k].n), h.prix(s[k].med), h.prix(s[k].p10), h.prix(s[k].p90)]), fr ? `Prix du contrôle des véhicules de catégorie L en France, fichier du ${h.date(h.S.meta.fichier)}` : `Category L vehicle test prices in France, file of ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r', 'r', 'r']);
};
/** Nombre de départements sans centre pour une catégorie. */
const sans = (h: Helpers, k: string) => Object.values(h.S.depts as unknown as Record<string, { s: Record<string, R | undefined> }>).filter((d) => !d.s[k]).length;

export default defineGuide({
  id: 'controle-technique-scooter-quad',
  group: 'regles',
  order: 3,
  tool: 'centres',
  vehicule: 'cy',
  vehicules: ['cy', 'q', 'tr', 'vt', 'm'],
  related: ['controle-technique-moto', 'quand-faire-controle-technique', 'contre-visite', 'controle-technique-vente', 'departements'],
  sources: ['spDeuxRoues', 'spDispense', 'dataset', 'prixConso'],
  fr: {
    slug: 'controle-technique-scooter-quad',
    nav: 'Scooter, quad, voiturette',
    card: 'Scooter 50 cm³, quad, tricycle et voiturette : prix et centres équipés.',
    title: 'Contrôle technique scooter, quad et voiturette : prix 2026',
    description: 'Contrôle technique d’un scooter 50 cm³, d’un quad, d’un tricycle ou d’une voiturette sans permis en 2026 : prix par centre, médiane, calendrier, contre-visite.',
    h1: 'Contrôle technique scooter, quad et voiturette',
    intro: 'Les centres qui contrôlent les scooters, quads, tricycles et voiturettes autour de vous, et ce qu’ils déclarent faire payer.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `Depuis le 15 avril 2024, les scooters et cyclomoteurs de 50 cm³, les tricycles, les quads homologués pour la route et les voiturettes sans permis passent le contrôle technique, comme les motos. Les prix déclarés par les centres dans le fichier public de la DGCCRF du ${h.date(h.S.meta.fichier)} donnent une médiane de ${h.prix(s.cy.med)} pour un cyclomoteur, ${h.prix(s.q.med)} pour un quad, ${h.prix(s.tr.med)} pour un tricycle et ${h.prix(s.vt.med)} pour une voiturette, contre ${h.prix(s.m.med)} pour une moto. Seuls quelque ${h.num(s.cy.n)} centres en France déclarent un tarif pour les cyclomoteurs : la recherche se fait donc dans un rayon plus large que pour une voiture, et l’outil ci-dessus s’élargit automatiquement aux cinq centres les plus proches s’il en trouve moins. Le calendrier est celui des deux-roues : selon l’année de mise en circulation, puis tous les trois ans. La contre-visite se déclare entre ${h.prix(n.cvm.min.med)} et ${h.prix(n.cvm.max.med)} en médiane, dans un délai de deux mois.`;
    },
    faqs: (h) => {
      const s = S(h);
      return [
        { q: 'Un scooter 50 cm³ doit-il vraiment passer le contrôle technique ?', a: 'Oui. Tous les véhicules à moteur de catégorie L immatriculés sont concernés depuis le 15 avril 2024, y compris les cyclomoteurs de 50 cm³ et les scooters électriques immatriculés. Seules quelques motos d’enduro et de trial à usage sportif sont dispensées, sous condition de licence. Les trottinettes et vélos électriques, non immatriculés, ne sont pas concernés.' },
        { q: 'Combien coûte le contrôle technique d’une voiturette sans permis ?', a: `La médiane déclarée est de ${h.prix(s.vt.med)}, avec un centre sur dix sous ${h.prix(s.vt.p10)}. La voiturette est contrôlée comme un quadricycle léger, dans les centres équipés pour les véhicules de catégorie L. Le calendrier est celui des deux-roues : premier contrôle selon l’année de mise en circulation, puis tous les trois ans.` },
        { q: 'Un quad agricole ou de loisir non immatriculé passe-t-il le contrôle ?', a: 'Non. Seuls les quads immatriculés et homologués pour la route sont concernés par le contrôle technique des véhicules de catégorie L. Un quad utilisé uniquement sur terrain privé, sans immatriculation, n’y est pas soumis. Un tracteur agricole est dispensé, selon la fiche de Service Public consacrée aux dispenses.' },
        { q: 'Où faire contrôler un tricycle ou un side-car ?', a: `Dans un centre équipé pour la catégorie L qui déclare un tarif « tricycle » : ${h.num(s.tr.n)} en France, avec une médiane de ${h.prix(s.tr.med)}. Un side-car et un trois-roues motorisé y sont rattachés. Choisissez « Tricycle ou side-car » dans l’outil pour voir ceux de votre secteur, le rayon s’élargit s’il en trouve peu.` },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h);
      return `<h2>Les prix par catégorie</h2>
<p>Le fichier public distingue cinq catégories de véhicules légers à moteur en plus des voitures : cyclomoteurs, motos, tricycles, quads et voiturettes. Chaque centre agréé pour ces véhicules déclare un prix pour chacune. Les écarts entre catégories restent modestes ; les écarts entre centres, eux, sont importants.</p>
${table(h)}
<p>Le cyclomoteur est en général la catégorie la moins chère : moins de points à vérifier, un passage plus court sur les bancs. Le quad et le tricycle, plus encombrants et parfois plus longs à installer, se paient un peu plus. La voiturette sans permis, contrôlée comme un quadricycle léger, se situe autour du prix d’une moto.</p>
<h2>Trouver un centre équipé</h2>
<p>Seule une minorité de centres contrôle les véhicules de catégorie L, et toutes les catégories ne sont pas proposées partout. Aujourd’hui, ${h.num(sans(h, 'cy'))} départements n’ont aucun centre déclarant un tarif cyclomoteur, et ${h.num(sans(h, 'vt'))} aucun centre déclarant un tarif voiturette. Dans l’outil, choisissez la catégorie exacte de votre véhicule : un centre qui contrôle les motos ne déclare pas forcément de tarif pour les quads.</p>
<p>Quand moins de cinq centres sont dans le rayon choisi, l’outil s’élargit aux cinq plus proches et affiche le rayon réel. Dans un secteur rural, comptez plusieurs dizaines de kilomètres : appelez le centre avant de vous déplacer pour vérifier qu’il accepte bien votre véhicule.</p>
<h2>Le calendrier : le même pour tous les véhicules de catégorie L</h2>
<p>Scooter, quad, tricycle ou voiturette suivent le calendrier des deux-roues, fixé selon l’année de première mise en circulation (case B de la carte grise). Les véhicules les plus anciens devaient être contrôlés en 2024 ou 2025 ; ceux de 2020 et 2021 le sont en 2026 ; à partir de 2022, le premier contrôle a lieu dans les six mois avant le cinquième anniversaire. Le contrôle se renouvelle ensuite tous les ${h.num(h.P.deux_roues.validite_favorable_ans)} ans.</p>
<!--mini:moto-->
<h2>Ce qui est vérifié</h2>
<p>Le contrôleur passe en revue ${h.num(h.P.points_controle.deux_roues)} points : identification du véhicule, freinage, direction, éclairage et signalisation, pneus et roues, suspensions, structure, échappement et niveau sonore. Sur un scooter, l’éclairage et l’usure des pneus sont des points à vérifier avant d’y aller ; sur une voiturette, les ceintures et les rétroviseurs ; sur un quad, la direction et les fixations. Un pot d’échappement non homologué est vérifié pour le bruit et les émissions.</p>
<p>Les résultats suivent les trois niveaux de défaillance de tous les contrôles : mineure (favorable), majeure (contre-visite dans les deux mois), critique (interdiction de rouler après le jour du contrôle). Voir la page ${h.a('defaillances-controle-technique', 'défaillances')}.</p>
<h2>Contre-visite et prix par département</h2>
<p>Pour les véhicules de catégorie L, les centres déclarent une contre-visite entre ${h.prix(n.cvm.min.med)} et ${h.prix(n.cvm.max.med)} en médiane, et ${h.pct(n.cvm.gratuite, 0)} l’annoncent gratuite dans certains cas. Le mini-simulateur donne la médiane de votre département pour chaque catégorie.</p>
<!--mini:deuxRouesPrix-->
<h2>Vendre un scooter, un quad ou une voiturette</h2>
<p>Au-delà de cinq ans, un véhicule de catégorie L se vend à un particulier avec un contrôle de moins de six mois. Pour beaucoup de scooters et de voiturettes, ce sera le premier contrôle. Le guide ${h.a('controle-technique-vente', 'de la vente')} détaille les cas. Pour les motos de plus de 50 cm³, la page ${h.a('controle-technique-moto', 'contrôle technique moto')} donne les prix et le calendrier détaillé.</p>`;
    },
  },
  en: {
    slug: 'scooter-quad-controle-technique',
    nav: 'Scooter, quad, microcar',
    card: '50 cc scooter, quad, trike and microcar: prices and equipped centres.',
    title: 'Scooter, quad and microcar contrôle technique: 2026 prices',
    description: 'The French contrôle technique for a 50 cc scooter, a quad, a trike or a microcar in 2026: price by centre, national median, timetable and the re-inspection.',
    h1: 'Scooter, quad and microcar contrôle technique',
    intro: 'Centres that test scooters, quads, trikes and microcars around you, and what they declare they charge.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `Since 15 April 2024, 50 cc scooters and mopeds, trikes, road-legal quads and microcars that need no licence have to pass the contrôle technique in France, like motorbikes. The prices centres declare in the DGCCRF’s public file of ${h.date(h.S.meta.fichier)} give a median of ${h.prix(s.cy.med)} for a moped, ${h.prix(s.q.med)} for a quad, ${h.prix(s.tr.med)} for a trike and ${h.prix(s.vt.med)} for a microcar, against ${h.prix(s.m.med)} for a motorbike. Only about ${h.num(s.cy.n)} centres in France declare a moped price: the search therefore covers a wider area than for a car, and the tool above automatically widens to the five nearest centres if it finds fewer. The timetable is the two-wheeler one: based on the year of first registration, then every three years. The re-inspection (contre-visite) is declared at between ${h.prix(n.cvm.min.med)} and ${h.prix(n.cvm.max.med)} at the median, within two months.`;
    },
    faqs: (h) => {
      const s = S(h);
      return [
        { q: 'Does a 50 cc scooter really need a contrôle technique?', a: 'Yes. Every registered category L motor vehicle has been covered since 15 April 2024, including 50 cc mopeds and registered electric scooters. Only some enduro and trial bikes used for sport are exempt, subject to a licence. E-scooters and e-bikes, which are not registered, are not concerned.' },
        { q: 'How much is the contrôle technique for a microcar?', a: `The declared median is ${h.prix(s.vt.med)}, with one centre in ten below ${h.prix(s.vt.p10)}. A microcar is tested as a light quadricycle, in centres equipped for category L. The timetable is the two-wheeler one: first test by year of first registration, then every three years.` },
        { q: 'Does an unregistered farm or leisure quad need testing?', a: 'No. Only quads that are registered and approved for the road fall under category L testing. A quad used only on private land, without registration, is not subject to it. A farm tractor is exempt, according to the Service Public page on exemptions.' },
        { q: 'Where can I get a trike or sidecar tested?', a: `At a category L centre that declares a “trike” price: ${h.num(s.tr.n)} in France, with a median of ${h.prix(s.tr.med)}. Sidecars and motorised three-wheelers come under it. Choose “Trike or sidecar” in the tool to see those in your area; the radius widens if it finds few.` },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h);
      return `<h2>Prices by category</h2>
<p>Besides cars, the public file separates five categories of light motor vehicles: mopeds, motorbikes, trikes, quads and microcars. Each centre approved for them declares a price for each. The gaps between categories are modest; the gaps between centres are wide.</p>
${table(h)}
<p>The moped is usually the cheapest category: fewer items to check and a shorter pass on the equipment. Quads and trikes, bulkier and sometimes slower to set up, cost a little more. The microcar, tested as a light quadricycle, sits around the price of a motorbike.</p>
<h2>Finding an equipped centre</h2>
<p>Only a minority of centres test category L vehicles, and not every category is offered everywhere. Today ${h.num(sans(h, 'cy'))} départements have no centre declaring a moped price, and ${h.num(sans(h, 'vt'))} none declaring a microcar price. In the tool, choose your vehicle’s exact category: a centre that tests motorbikes does not necessarily declare a quad price.</p>
<p>When fewer than five centres are within the chosen distance, the tool widens to the five nearest and shows the real radius. In rural areas allow several dozen kilometres: call the centre before setting off to check it takes your vehicle.</p>
<h2>The timetable: the same for every category L vehicle</h2>
<p>Scooter, quad, trike or microcar follow the two-wheeler timetable, set by year of first registration (box B of the registration certificate). The oldest vehicles were due in 2024 or 2025; those from 2020 and 2021 are tested in 2026; from 2022 the first test falls in the six months before the fifth anniversary. The test is then renewed every ${h.num(h.P.deux_roues.validite_favorable_ans)} years.</p>
<!--mini:moto-->
<h2>What is checked</h2>
<p>The inspector goes through ${h.num(h.P.points_controle.deux_roues)} items: vehicle identification, brakes, steering, lights and signals, tyres and wheels, suspension, structure, exhaust and noise level. On a scooter, lights and tyre wear are worth checking before you go; on a microcar, seat belts and mirrors; on a quad, steering and mountings. A non-approved exhaust is checked for noise and emissions.</p>
<p>Results follow the three defect levels of every test: minor (pass), major (re-inspection within two months), critical (no riding after the day of the test). See the ${h.a('defaillances-controle-technique', 'defects page')}.</p>
<h2>Re-inspection and prices by département</h2>
<p>For category L vehicles, centres declare a re-inspection between ${h.prix(n.cvm.min.med)} and ${h.prix(n.cvm.max.med)} at the median, and ${h.pct(n.cvm.gratuite, 0)} say it can be free in some cases. The mini calculator gives your département’s median for each category.</p>
<!--mini:deuxRouesPrix-->
<h2>Selling a scooter, quad or microcar</h2>
<p>Beyond five years, a category L vehicle is sold to a private buyer with a test under six months old. For many scooters and microcars, that will be their first test. The ${h.a('controle-technique-vente', 'selling guide')} covers the cases. For motorbikes over 50 cc, the ${h.a('controle-technique-moto', 'motorcycle page')} gives prices and the detailed timetable.</p>`;
    },
  },
});

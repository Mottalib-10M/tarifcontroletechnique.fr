import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'nice';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
/** Rang des Alpes-Maritimes parmi les départements d'au moins 10 centres, du moins cher (1) au plus cher. */
const rang = (h: Helpers) => {
  const l = Object.values(DS(h)).filter((x) => x.centres >= 10 && x.s.e).map((x) => x.s.e!.med);
  const m = DS(h)['06'].s.e!.med;
  return { plusChers: l.filter((v) => v > m).length, n: l.length };
};
const voisins = (h: Helpers) => ['06', '83', '04'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');

export default defineGuide({
  id: 'controle-technique-nice',
  group: 'villes',
  order: 5,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-pas-cher', 'controle-technique-moto', 'controle-technique-marseille', 'contre-visite'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spDeuxRoues'],
  fr: {
    slug: 'controle-technique-nice',
    nav: 'Nice',
    card: 'Nice et la Côte d’Azur, d’Antibes à Menton : les prix déclarés du jour.',
    title: 'Contrôle technique à Nice : prix des centres, Côte d’Azur',
    description: 'Contrôle technique à Nice : prix de chaque centre, médianes Nice et Côte d’Azur, moins cher entre Antibes et Menton, scooter, contre-visite. Données du jour.',
    h1: 'Contrôle technique à Nice : prix et centres',
    intro: 'Ce que déclarent les centres niçois et azuréens à la DGCCRF pour une voiture, un scooter ou une moto, et où payer moins.',
    resume: (h) => {
      const x = ville(h, SLUG), r = rang(h), mc15 = x.v.moinsCher15!;
      return `Le contrôle technique d’une voiture essence ou diesel coûte ${h.prix(x.e!.med)} en médiane à Nice, ${x.cmp(x.e!.med, x.natMed)} la médiane française de ${h.prix(x.natMed)}. Dans le classement des départements, ${r.plusChers === 0 ? 'les Alpes-Maritimes sont le plus cher' : `${x.nb(r.plusChers, 'département seulement est plus cher', 'départements seulement sont plus chers')} que les Alpes-Maritimes`} parmi les ${h.num(r.n)} qui comptent au moins dix centres. La ville a ${x.nb(x.v.n, 'centre', 'centres')} déclarant un prix voiture, de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} ; dans un rayon de 15 km, de Cagnes-sur-Mer à la vallée du Paillon, ${h.num(x.v.n15)} centres ont une médiane de ${h.prix(x.e15!.med)}, et le moins cher de ce rayon déclare ${h.prix(mc15.p)} à ${mc15.v}. La contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Prix tirés du fichier public où chaque centre déclare ses tarifs à l’administration, relu ce jour (${x.fichier}).`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), r = rang(h);
      return [
        { q: 'Pourquoi le contrôle technique est-il si cher à Nice ?', a: `Les Alpes-Maritimes se classent ${r.plusChers === 0 ? 'au dernier rang' : `parmi les ${h.num(r.plusChers + 1)} départements les plus chers`} sur ${h.num(r.n)}. Le littoral est étroit, coincé entre la mer et les collines, et les terrains d’activité y sont rares et chers ; un centre a besoin de plusieurs centaines de mètres carrés couverts. Les prix étant libres, ce coût se retrouve dans le tarif.` },
        { q: 'Quel est le centre de contrôle technique le moins cher à Nice ?', a: `Dans le fichier du jour, le centre niçois le moins cher déclare ${h.prix(x.v.moinsCher!.p)} pour une voiture essence, ${h.prix(x.e!.med - x.v.moinsCher!.p)} sous la médiane de la ville. Son nom et son adresse figurent en tête de la liste de l’outil, triée par prix. À 15 km, le plus bas est à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}).` },
        { q: 'Peut-on faire contrôler à Monaco une voiture immatriculée à Nice ?', a: 'Non : une voiture immatriculée en France passe son contrôle technique dans un centre agréé en France. Les centres monégasques ne figurent pas dans le fichier de la DGCCRF, et un contrôle fait hors de France ne remplace pas le contrôle français. Les centres de Menton et de Beausoleil sont les plus proches de la frontière.' },
        { q: 'Combien coûte le contrôle d’un scooter à Nice ?', a: `${x.v.s.cy ? `La médiane niçoise est de ${h.prix(x.v.s.cy.med)} pour un cyclomoteur de 50 cm³` : 'Peu de centres niçois déclarent un prix pour les 50 cm³'}${x.v.s.m ? ` et de ${h.prix(x.v.s.m.med)} pour une moto` : ''}. Seule une partie des centres contrôle les deux-roues : le mini-simulateur de la page donne la médiane du département pour chaque type, et l’outil liste les centres équipés.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), r = rang(h);
      return `<h2>${r.plusChers < 10 ? 'Un des départements les plus chers de France' : 'Le niveau des prix dans les Alpes-Maritimes'}</h2>
<p>À Nice, la médiane d’un contrôle de voiture essence est de ${h.prix(x.e!.med)}. Celle des Alpes-Maritimes, ${h.prix(x.depMed)}, place le département ${r.plusChers === 0 ? 'en dernière position' : `au ${h.num(r.n - r.plusChers)}e rang`} sur ${h.num(r.n)} départements d’au moins dix centres, classés du moins cher au plus cher. L’écart avec la médiane nationale, ${h.prix(x.depMed - x.natMed)}, se retrouve sur presque tous les véhicules : le tableau ci-dessous compare la ville, ses alentours et la France.</p>
${x.vehTable(`Nice, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>Le foncier explique une bonne part de ce niveau. Entre la mer et les premiers reliefs, la bande urbanisée est étroite, et les surfaces artisanales assez grandes pour une ligne de contrôle se trouvent surtout dans la plaine du Var et dans les vallées. Les centres y sont moins nombreux qu’ailleurs pour une population comparable, ce qui limite la concurrence.</p>
<h2>De la plaine du Var à la vallée du Paillon</h2>
<p>Dans un rayon de 15 km autour de Nice, l’outil trouve ${h.num(x.v.n15)} centres, pour une médiane de ${h.prix(x.e15!.med)}. Les communes voisines classées par distance montrent que les écarts se jouent centre par centre plutôt que commune par commune :</p>
${x.voisinesTable(`Communes voisines de Nice : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Le moins cher du rayon, à ${x.v.moinsCher15!.v}, déclare ${h.prix(x.v.moinsCher15!.p)} ; dans Nice, le plus bas est à ${h.prix(x.v.moinsCher!.p)} et le plus haut à ${h.prix(x.v.plusCher!.p)}. Sur la Côte d’Azur, les distances sont courtes mais les trajets lents : la promenade, la voie Mathis et l’A8 sont chargées aux heures de pointe. Un centre un peu plus cher mais accessible sans bouchon peut rester le bon choix.</p>
<h2>Le prix qu’on vous annonce est-il élevé ?</h2>
<p>Avec des médianes au-dessus de la moyenne nationale, un tarif niçois paraît souvent cher dans l’absolu sans l’être localement. Le mini-simulateur compare un prix donné à la médiane des Alpes-Maritimes et aux déciles nationaux.</p>
<!--mini:devis_06-->
<p>Si le prix dépasse nettement la médiane du département, l’outil en haut de page trouve en général un centre moins cher à quelques kilomètres. Les autres leviers (contre-visite gratuite, petits défauts à corriger avant le contrôle) sont dans le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')}.</p>
<h2>Scooters et motos</h2>
<p>Le climat azuréen fait rouler les deux-roues toute l’année, et ils sont soumis au contrôle technique depuis avril 2024. ${x.v.s.m ? `À Nice, ${x.nb(x.v.s.m.n, 'centre déclare', 'centres déclarent')} un prix moto (médiane ${h.prix(x.v.s.m.med)})` : 'À Nice, peu de centres déclarent un prix moto'}${x.v.s15.m ? ` ; dans les 15 km, ${h.num(x.v.s15.m.n)} centres sont équipés` : ''}. Le mini-simulateur donne la médiane des Alpes-Maritimes pour chaque type de deux-roues.</p>
<!--mini:deuxRouesPrix_06-->
<p>Les échéances par année de mise en circulation sont dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>
<h2>Frontières : Monaco et l’Italie</h2>
<p>Les centres de Monaco et d’Italie ne figurent pas dans le fichier français, et ils ne peuvent pas contrôler une voiture immatriculée en France. Pour un véhicule à carte grise française, seul un centre agréé en France fait foi. Les départements voisins se classent ainsi aujourd’hui, du moins cher au plus cher : ${voisins(h)}. Pour l’autre grande ville de la région, voir ${h.a('controle-technique-marseille', 'Marseille')}.</p>
<h2>Contre-visite à Nice</h2>
<p>Les centres niçois déclarent la contre-visite entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane, ${x.v.cv!.gratuite > 0 ? `et ${h.pct(x.v.cv!.gratuite, 0)} l’annoncent gratuite dans certains cas` : 'et aucun ne l’annonce gratuite dans le fichier du jour'}. Elle doit avoir lieu dans les deux mois, dans le centre de votre choix ; les règles sont sur la page ${h.a('contre-visite', 'contre-visite')}. ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres de la ville déclarent un tarif voiture antérieur à 2023 : vérifiez l’affichage sur place, c’est lui qui fait foi.` : ''} Pour comparer avec le reste du pays, voir la page des ${h.a('departements', 'départements')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-nice',
    nav: 'Nice',
    card: 'Nice and the Riviera, from Antibes to Menton: today’s declared prices.',
    title: 'Contrôle technique in Nice: Riviera centres and prices',
    description: 'Contrôle technique in Nice: every centre’s price, city and Riviera medians, cheapest between Antibes and Menton, scooters, re-inspection. Today’s DGCCRF data.',
    h1: 'Contrôle technique in Nice: prices and centres',
    intro: 'What centres in Nice and along the Riviera declare to the DGCCRF for a car, a scooter or a motorbike, and where to pay less.',
    resume: (h) => {
      const x = ville(h, SLUG), r = rang(h), mc15 = x.v.moinsCher15!;
      return `A contrôle technique (France’s compulsory roadworthiness test) for a petrol or diesel car costs ${h.prix(x.e!.med)} at the median in Nice, ${x.cmp(x.e!.med, x.natMed)} the French median of ${h.prix(x.natMed)}. In the département ranking, ${r.plusChers === 0 ? 'Alpes-Maritimes is the dearest' : `only ${x.nb(r.plusChers, 'département is', 'départements are')} dearer than Alpes-Maritimes`} of the ${h.num(r.n)} with at least ten centres. The city has ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price, from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}; within 15 km, from Cagnes-sur-Mer to the Paillon valley, ${h.num(x.v.n15)} centres have a median of ${h.prix(x.e15!.med)}, and the cheapest in that radius declares ${h.prix(mc15.p)} in ${mc15.v}. A re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. Prices come from the public file in which every centre declares its rates to the authorities, read today (${x.fichier}).`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), r = rang(h);
      return [
        { q: 'Why is the contrôle technique so expensive in Nice?', a: `Alpes-Maritimes ranks ${r.plusChers === 0 ? 'last' : `among the ${h.num(r.plusChers + 1)} dearest`} of ${h.num(r.n)} départements. The coast is narrow, squeezed between the sea and the hills, and business land is scarce and expensive; a centre needs several hundred square metres under cover. As prices are free, that cost ends up in the price.` },
        { q: 'Which is the cheapest inspection centre in Nice?', a: `In today’s file the cheapest centre in Nice declares ${h.prix(x.v.moinsCher!.p)} for a petrol car, ${h.prix(x.e!.med - x.v.moinsCher!.p)} below the city median. Its name and address top the tool’s list, sorted by price. Within 15 km the lowest is in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}). Compare the re-inspection price too: a cheap test followed by a costly re-inspection can end up dearer.` },
        { q: 'Can a car registered in Nice be tested in Monaco?', a: 'No: a car registered in France takes its contrôle technique at a centre approved in France. Monaco’s centres are not in the DGCCRF file, and a test done outside France does not replace the French one. The centres in Menton and Beausoleil are the closest to the border.' },
        { q: 'How much does a scooter test cost in Nice?', a: `${x.v.s.cy ? `The Nice median is ${h.prix(x.v.s.cy.med)} for a 50 cc moped` : 'Few Nice centres declare a price for 50 cc mopeds'}${x.v.s.m ? ` and ${h.prix(x.v.s.m.med)} for a motorbike` : ''}. Only some centres test two-wheelers: the mini calculator on this page gives the département median for each type, and the tool lists the equipped centres.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), r = rang(h);
      return `<h2>${r.plusChers < 10 ? 'One of France’s dearest départements' : 'Price levels in Alpes-Maritimes'}</h2>
<p>In Nice, the median petrol car test costs ${h.prix(x.e!.med)}. The Alpes-Maritimes median, ${h.prix(x.depMed)}, puts the département ${r.plusChers === 0 ? 'in last place' : `at rank ${h.num(r.n - r.plusChers)}`} of ${h.num(r.n)} départements with at least ten centres, ranked from cheapest to dearest. The gap with the national median, ${h.prix(x.depMed - x.natMed)}, shows up on nearly every vehicle: the table below compares the city, its surroundings and France.</p>
${x.vehTable(`Nice, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<p>Land explains much of it. Between the sea and the first hills the built-up strip is narrow, and workshop space big enough for a test lane is mostly found in the Var plain and the valleys. There are fewer centres than elsewhere for a similar population, which limits competition.</p>
<h2>From the Var plain to the Paillon valley</h2>
<p>Within 15 km of Nice the tool finds ${h.num(x.v.n15)} centres, with a median of ${h.prix(x.e15!.med)}. The neighbouring towns, sorted by distance, show that gaps come down to individual centres more than to towns:</p>
${x.voisinesTable(`Towns near Nice: petrol car test, file of ${x.fichier}`)}
<p>The cheapest in the radius, in ${x.v.moinsCher15!.v}, declares ${h.prix(x.v.moinsCher15!.p)}; inside Nice the lowest is ${h.prix(x.v.moinsCher!.p)} and the highest ${h.prix(x.v.plusCher!.p)}. On the Riviera distances are short but journeys slow: the Promenade, the Voie Mathis and the A8 motorway are busy at peak times. A slightly dearer centre you can reach without a jam may still be the right choice.</p>
<h2>Is the price you were quoted high?</h2>
<p>With medians above the national level, a Nice price often looks expensive in absolute terms without being so locally. The mini calculator compares a given price with the Alpes-Maritimes median and the national deciles.</p>
<!--mini:devis_06-->
<p>If the price is well above the département median, the tool at the top of the page usually finds a cheaper centre a few kilometres away. Other levers (a free re-inspection, fixing small defects before the test) are in the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')}.</p>
<h2>Scooters and motorbikes</h2>
<p>The Riviera climate keeps two-wheelers on the road all year, and they have needed a contrôle technique since April 2024. ${x.v.s.m ? `In Nice, ${x.nb(x.v.s.m.n, 'centre declares', 'centres declare')} a motorbike price (median ${h.prix(x.v.s.m.med)})` : 'In Nice, few centres declare a motorbike price'}${x.v.s15.m ? `; within 15 km, ${h.num(x.v.s15.m.n)} centres are equipped` : ''}. The mini calculator gives the Alpes-Maritimes median for each kind of two-wheeler.</p>
<!--mini:deuxRouesPrix_06-->
<p>Deadlines by year of first registration are in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>Borders: Monaco and Italy</h2>
<p>Centres in Monaco and Italy are not in the French file, and they cannot test a car registered in France. For a vehicle with a French registration certificate (carte grise), only a centre approved in France counts. Neighbouring départements rank as follows today, cheapest first: ${voisins(h)}. For the region’s other big city, see ${h.a('controle-technique-marseille', 'Marseille')}.</p>
<h2>Re-inspection in Nice</h2>
<p>Nice centres declare the re-inspection (contre-visite) at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median, ${x.v.cv!.gratuite > 0 ? `and ${h.pct(x.v.cv!.gratuite, 0)} say it is free in some cases` : 'and none declares it free in today’s file'}. It must take place within two months, at the centre of your choice; the rules are on the ${h.a('contre-visite', 're-inspection page')}. ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of the city’s centres declare a car price from before 2023: check the display on site, which is what counts.` : ''} To compare with the rest of the country, see the ${h.a('departements', 'départements page')}.</p>`;
    },
  },
});

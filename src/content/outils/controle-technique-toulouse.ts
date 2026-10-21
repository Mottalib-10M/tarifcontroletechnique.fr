import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'toulouse';
type DepS = Record<string, { centres: number; s: { e?: { med: number }; m?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
/** Haute-Garonne et départements voisins, du moins cher au plus cher (médiane essence du jour). */
const voisins = (h: Helpers) => ['31', '32', '81', '82', '11', '09'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
/** Communes de l'ouest (Blagnac, Colomiers, Tournefeuille) présentes dans le fichier, avec leur médiane. */
const ouest = (h: Helpers) => ville(h, SLUG).v.voisines.filter((x) => ['Blagnac', 'Colomiers', 'Tournefeuille', 'Cugnaux', 'Plaisance-du-Touch'].includes(x.nom));

export default defineGuide({
  id: 'controle-technique-toulouse',
  group: 'villes',
  order: 4,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-moto', 'quand-faire-controle-technique', 'controle-technique-bordeaux', 'controle-technique-montpellier'],
  sources: ['dataset', 'prixConso', 'spVoiture', 'spDeuxRoues'],
  fr: {
    slug: 'controle-technique-toulouse',
    nav: 'Toulouse',
    card: 'Toulouse, sa rocade et l’ouest toulousain : les tarifs déclarés du jour.',
    title: 'Contrôle technique à Toulouse : prix et centre le moins cher',
    description: 'Contrôle technique à Toulouse : prix de chaque centre, médiane en ville et hors rocade, Blagnac, Colomiers, moto, contre-visite. Fichier DGCCRF du jour.',
    h1: 'Contrôle technique à Toulouse : comparer les prix',
    intro: 'Les tarifs déclarés à la DGCCRF par les centres de Toulouse et de son agglomération, pour une voiture, une moto ou un utilitaire.',
    resume: (h) => {
      const x = ville(h, SLUG), mc = x.v.moinsCher!, mc15 = x.v.moinsCher15!;
      return `Combien coûte un contrôle technique à Toulouse ? ${h.prix(x.e!.med)} en médiane pour une voiture essence ou diesel, d’après les ${x.nb(x.v.n, 'centre de la commune qui déclare', 'centres de la commune qui déclarent')} un prix voiture, soit ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}). L’écart entre centres est net : le moins cher de la ville affiche ${h.prix(mc.p)}, le plus cher ${h.prix(x.e!.max)}. En élargissant à 15 km, on compte ${h.num(x.v.n15)} centres et une médiane de ${h.prix(x.e15!.med)} ; le prix le plus bas de ce rayon, ${h.prix(mc15.p)}, est déclaré à ${mc15.v}. Une contre-visite se paie entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane dans la ville. Ce sont les prix que chaque centre a déclarés à l’administration dans le fichier public relu ce jour (${x.fichier}), pas des estimations : tapez votre quartier ou votre commune dans l’outil pour obtenir la liste triée, sans inscription.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), o = ouest(h);
      return [
        { q: 'Où trouver le contrôle technique le moins cher autour de Toulouse ?', a: `Dans le fichier du jour, le prix le plus bas à moins de 15 km de Toulouse est déclaré à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}), et le moins cher de la commune elle-même à ${h.prix(x.v.moinsCher!.p)}. L’écart avec la médiane toulousaine atteint ${h.prix(x.e!.med - x.v.moinsCher15!.p)}. L’outil trie tous les centres du rayon choisi par prix, avec leur distance.` },
        { q: 'Les centres de Blagnac et Colomiers sont-ils moins chers que ceux de Toulouse ?', a: o.length ? `Voici leurs médianes du jour : ${o.map((v) => `${v.nom} ${h.prix(v.s.med)}`).join(', ')}, contre ${h.prix(x.e!.med)} dans Toulouse. Les écarts tiennent souvent à un ou deux centres par commune ; mieux vaut regarder la liste détaillée que la seule médiane.` : 'Ces communes n’apparaissent pas parmi les voisines du fichier du jour ; l’outil, réglé sur 10 ou 20 km, montre leurs centres s’il y en a.' },
        { q: 'Combien coûte le contrôle technique d’une moto à Toulouse ?', a: `${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre toulousain déclare', 'centres toulousains déclarent')} un prix moto, avec une médiane de ${h.prix(x.v.s.m.med)}.` : 'Peu de centres toulousains déclarent un prix moto.'} ${x.v.s15.m ? `À 15 km, ${h.num(x.v.s15.m.n)} centres équipés, médiane ${h.prix(x.v.s15.m.med)}.` : ''} Le premier contrôle d’une moto dépend de son année de mise en circulation : le mini-simulateur de la page donne l’échéance.` },
        { q: 'La Haute-Garonne est-elle chère pour le contrôle technique ?', a: `Sa médiane, ${h.prix(x.depMed)} pour une voiture essence, est ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Parmi ses voisins, le classement du jour, du moins cher au plus cher, est : ${voisins(h).map((v) => `${v.nom} ${h.prix(v.med)}`).join(', ')}.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), o = ouest(h), v = voisins(h);
      return `<h2>Ce que paie un automobiliste toulousain</h2>
<p>Le contrôle d’une voiture particulière revient à ${h.prix(x.e!.med)} en médiane dans Toulouse, pour les ${x.nb(x.v.n, 'centre', 'centres')} qui déclarent un tarif voiture. Le diesel coûte presque toujours le même prix que l’essence. Le département de la Haute-Garonne se situe à ${h.prix(x.depMed)}, et la ville est ${x.cmp(x.e!.med, x.depMed)} son département. Ces chiffres sont ceux de la déclaration de chaque centre, avec sa date : l’outil marque d’un astérisque ceux qui datent de plus de trois ans.</p>
${x.vehTable(`Toulouse et 15 km autour : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>Le tableau montre où se placent les autres véhicules. L’hybride et l’électrique sont souvent facturés au-dessus de l’essence, le gaz plus encore ; les deux-roues, les cyclomoteurs et les camping-cars n’ont qu’une partie des centres pour eux, ce qui rend la comparaison d’autant plus utile.</p>
<h2>Dans la rocade ou au-delà</h2>
<p>Une ligne de contrôle demande un terrain d’activité assez vaste, plus facile à trouver près des sorties de la rocade qu’au centre-ville. Au-delà, l’agglomération compte ${h.num(x.v.n15)} centres dans un rayon de 15 km, pour une médiane de ${h.prix(x.e15!.med)}, ${x.cmp(x.e15!.med, x.e!.med)} la commune. Le centre le moins cher de ce rayon, à ${x.v.moinsCher15!.v}, déclare ${h.prix(x.v.moinsCher15!.p)}.</p>
${x.voisinesTable(`Communes voisines de Toulouse : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>${o.length ? `À l’ouest, le long de l’axe de l’aéroport, les médianes du jour sont les suivantes : ${o.map((c) => `${c.nom} ${h.prix(c.s.med)} (${x.nb(c.s.n, 'centre', 'centres')})`).join(', ')}.` : 'Les communes de l’ouest toulousain n’apparaissent pas dans le tableau du jour.'} Pour qui travaille à Blagnac ou dans les zones aéroportuaires, faire contrôler sa voiture près du bureau peut éviter un trajet aux heures de pointe sur la rocade, souvent plus coûteux en temps que l’écart de prix.</p>
<h2>Motos et scooters à Toulouse</h2>
<p>${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre de la ville est équipé', 'centres de la ville sont équipés')} pour les motos, avec une médiane de ${h.prix(x.v.s.m.med)}` : 'Peu de centres de la ville sont équipés pour les motos'}${x.v.moinsCherMoto ? ` ; le moins cher, à ${x.v.moinsCherMoto.v}, déclare ${h.prix(x.v.moinsCherMoto.p)}` : ''}. ${x.v.s15.m ? `Dans les 15 km, ils sont ${h.num(x.v.s15.m.n)}.` : ''} Le calendrier dépend de la date de première mise en circulation : les deux-roues de 2020 et 2021 doivent passer avant la fin de 2026, les plus récents dans les six mois qui précèdent leur cinquième anniversaire.</p>
<!--mini:moto-->
<p>Tous les cas, y compris les quads et les voiturettes, sont dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>
<h2>Le coût sur toute la vie de la voiture</h2>
<p>Un contrôle tous les deux ans paraît peu de chose ; sur dix ans de détention, l’écart entre un centre à la médiane et le moins cher du département se compte en dizaines d’euros, sans parler des contre-visites. Le mini-simulateur fait le calcul à partir de l’âge de la voiture et des prix de la Haute-Garonne.</p>
<!--mini:detention_31-->
<p>Les règles de date (premier contrôle à quatre ans, puis tous les deux ans, et ce que coûte un retard) sont détaillées dans le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')}.</p>
<h2>La Haute-Garonne et l’Occitanie</h2>
<p>Classés par médiane du contrôle essence, du moins cher au plus cher, la Haute-Garonne et ses voisins donnent aujourd’hui : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. Pour les deux autres grandes villes du Sud-Ouest et de l’Occitanie, voir ${h.a('controle-technique-bordeaux', 'Bordeaux')} et ${h.a('controle-technique-montpellier', 'Montpellier')}, ou le classement complet des ${h.a('departements', 'départements')}.</p>
<h2>Contre-visite</h2>
<p>Les centres toulousains déclarent la contre-visite entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} annoncent qu’elle peut être gratuite.` : 'Aucun n’annonce de contre-visite gratuite dans le fichier du jour : la question se pose au centre avant le contrôle.'} Le délai est de deux mois ; au-delà, un contrôle complet est à refaire. Voir la page ${h.a('contre-visite', 'contre-visite')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-toulouse',
    nav: 'Toulouse',
    card: 'Toulouse, its ring road and the western suburbs: today’s declared prices.',
    title: 'Contrôle technique in Toulouse: prices and cheapest centre',
    description: 'Contrôle technique in Toulouse: every centre’s price, median in town and past the ring road, Blagnac, Colomiers, motorbikes, re-inspection. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Toulouse: comparing prices',
    intro: 'The prices that centres in Toulouse and its suburbs declare to the DGCCRF, for a car, a motorbike or a van.',
    resume: (h) => {
      const x = ville(h, SLUG), mc = x.v.moinsCher!, mc15 = x.v.moinsCher15!;
      return `What does a contrôle technique, France’s compulsory roadworthiness test, cost in Toulouse? ${h.prix(x.e!.med)} at the median for a petrol or diesel car, based on the ${x.nb(x.v.n, 'centre in the commune that declares', 'centres in the commune that declare')} a car price, which is ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}). The gap between centres is clear: the cheapest in the city charges ${h.prix(mc.p)}, the dearest ${h.prix(x.e!.max)}. Widening to 15 km gives ${h.num(x.v.n15)} centres and a median of ${h.prix(x.e15!.med)}; the lowest price in that radius, ${h.prix(mc15.p)}, is declared in ${mc15.v}. A re-inspection (contre-visite) costs between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median in the city. These are the prices each centre has declared to the authorities in the public file read today (${x.fichier}), not estimates: type your district or town into the tool for the sorted list, with no sign-up.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), o = ouest(h);
      return [
        { q: 'Where is the cheapest contrôle technique around Toulouse?', a: `In today’s file the lowest price within 15 km of Toulouse is declared in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}), and the cheapest inside the commune at ${h.prix(x.v.moinsCher!.p)}. The gap with the Toulouse median reaches ${h.prix(x.e!.med - x.v.moinsCher15!.p)}. The tool sorts every centre within your chosen distance by price, with its distance.` },
        { q: 'Are centres in Blagnac and Colomiers cheaper than in Toulouse?', a: o.length ? `Their medians today: ${o.map((v) => `${v.nom} ${h.prix(v.s.med)}`).join(', ')}, against ${h.prix(x.e!.med)} in Toulouse. The gaps often come down to one or two centres per town, so the detailed list tells you more than the median alone. Check the distance shown for each centre before crossing the ring road to save a few euros.` : 'These towns do not appear among the neighbours in today’s file; set the tool to 10 or 20 km to see their centres if there are any.' },
        { q: 'How much is a motorbike test in Toulouse?', a: `${x.v.s.m ? `${x.nb(x.v.s.m.n, 'Toulouse centre declares', 'Toulouse centres declare')} a motorbike price, with a median of ${h.prix(x.v.s.m.med)}.` : 'Few Toulouse centres declare a motorbike price.'} ${x.v.s15.m ? `Within 15 km there are ${h.num(x.v.s15.m.n)} equipped centres, median ${h.prix(x.v.s15.m.med)}.` : ''} A motorbike’s first test depends on its year of first registration: the mini calculator on this page gives the deadline.` },
        { q: 'Is Haute-Garonne an expensive département for the contrôle technique?', a: `Its median, ${h.prix(x.depMed)} for a petrol car, is ${x.cmp(x.depMed, x.natMed)} the French median. Among its neighbours, today’s ranking from cheapest to dearest is: ${voisins(h).map((v) => `${v.nom} ${h.prix(v.med)}`).join(', ')}. A département median hides wide gaps between centres, so the tool’s list around your address is the figure to act on.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), o = ouest(h), v = voisins(h);
      return `<h2>What a Toulouse driver pays</h2>
<p>Testing a private car costs ${h.prix(x.e!.med)} at the median in Toulouse, across the ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price. Diesel almost always costs the same as petrol. The Haute-Garonne département stands at ${h.prix(x.depMed)}, and the city is ${x.cmp(x.e!.med, x.depMed)} its département. These figures are each centre’s own declaration, with its date: the tool marks with an asterisk those more than three years old.</p>
${x.vehTable(`Toulouse and 15 km around: median price by vehicle, file of ${x.fichier}`)}
<p>The table shows where other vehicles stand. Hybrids and electric cars are often charged above petrol, gas cars more so; two-wheelers, mopeds and motorhomes only have some of the centres to choose from, which makes comparing all the more useful.</p>
<h2>Inside the ring road or beyond</h2>
<p>A test lane needs a sizeable business plot, easier to find near the exits of the rocade (the ring road) than in the city centre. Beyond it, the urban area has ${h.num(x.v.n15)} centres within 15 km, with a median of ${h.prix(x.e15!.med)}, ${x.cmp(x.e15!.med, x.e!.med)} the commune. The cheapest centre in that radius, in ${x.v.moinsCher15!.v}, declares ${h.prix(x.v.moinsCher15!.p)}.</p>
${x.voisinesTable(`Towns near Toulouse: petrol car test, file of ${x.fichier}`)}
<p>${o.length ? `To the west, along the airport side of town, today’s medians are: ${o.map((c) => `${c.nom} ${h.prix(c.s.med)} (${x.nb(c.s.n, 'centre', 'centres')})`).join(', ')}.` : 'The western suburbs do not appear in today’s table.'} If you work in Blagnac or near the airport, having the car tested close to the office can save a rush-hour drive on the ring road, which often costs more in time than the price gap.</p>
<h2>Motorbikes and scooters in Toulouse</h2>
<p>${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre in the city is', 'centres in the city are')} equipped for motorbikes, with a median of ${h.prix(x.v.s.m.med)}` : 'Few centres in the city are equipped for motorbikes'}${x.v.moinsCherMoto ? `; the cheapest, in ${x.v.moinsCherMoto.v}, declares ${h.prix(x.v.moinsCherMoto.p)}` : ''}. ${x.v.s15.m ? `Within 15 km there are ${h.num(x.v.s15.m.n)}.` : ''} The timetable depends on the first registration date: two-wheelers from 2020 and 2021 must be tested before the end of 2026, newer ones in the six months before their fifth anniversary.</p>
<!--mini:moto-->
<p>Every case, quads and microcars included, is in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>The cost over the car’s whole life</h2>
<p>One test every two years looks like little; over ten years of ownership, the gap between a median-priced centre and the cheapest in the département adds up to tens of euros, before any re-inspection. The mini calculator works it out from the car’s age and Haute-Garonne prices.</p>
<!--mini:detention_31-->
<p>The date rules (first test at four years, then every two years, and what being late costs) are set out in the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')}.</p>
<h2>Haute-Garonne and Occitanie</h2>
<p>Ranked by petrol test median, cheapest first, Haute-Garonne and its neighbours stand today at: ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. For the other two big cities of the south-west and Occitanie, see ${h.a('controle-technique-bordeaux', 'Bordeaux')} and ${h.a('controle-technique-montpellier', 'Montpellier')}, or the full ${h.a('departements', 'département ranking')}.</p>
<h2>Re-inspection</h2>
<p>Toulouse centres declare the re-inspection (contre-visite) at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} say it can be free.` : 'None declares a free re-check in today’s file: ask the centre before the test.'} The deadline is two months; after that a full test is needed again. See the ${h.a('contre-visite', 're-inspection page')}.</p>`;
    },
  },
});

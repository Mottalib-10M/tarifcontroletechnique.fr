import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'dijon';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Voisines moins chères que la médiane de Dijon, pour la phrase sur la périphérie. */
const moinsCheres = (h: Helpers) => { const x = ville(h, SLUG); return x.v.voisines.filter((c) => c.s.med < x.e!.med); };

export default defineGuide({
  id: 'controle-technique-dijon',
  group: 'villes',
  order: 16,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-electrique', 'contre-visite', 'quand-faire-controle-technique', 'controle-technique-strasbourg'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-dijon',
    nav: 'Dijon',
    card: 'Les centres de Dijon et de sa métropole, avec la médiane de la Côte-d’Or.',
    title: 'Contrôle technique à Dijon : prix des centres et moins cher',
    description: 'Prix du contrôle technique à Dijon et dans sa métropole : chaque centre agréé, médianes de la ville et de la Côte-d’Or, le moins cher à 15 km, électrique.',
    h1: 'Contrôle technique à Dijon : prix de chaque centre',
    intro: 'Les prix que les centres dijonnais et ceux des communes de la métropole déclarent à la DGCCRF, triés pour trouver le moins cher.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      return `Le contrôle technique d’une voiture essence coûte ${h.prix(x.e!.med)} en médiane à Dijon, où ${x.nb(x.e!.n, 'centre déclare', 'centres déclarent')} un prix pour les voitures dans le fichier public de la DGCCRF. Les tarifs y vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. La ville se situe ${x.cmp(x.e!.med, x.natMed)} la médiane de la France (${h.prix(x.natMed)}) et ${x.cmp(x.e!.med, x.depMed)} celle de la Côte-d’Or (${h.prix(x.depMed)}). Dans les communes de la métropole et un peu au-delà, à moins de 15 km, ${h.num(x.e15!.n)} centres affichent une médiane de ${h.prix(x.e15!.med)}${m15 ? ` ; le plus bas, ${h.prix(m15.p)}, est à ${m15.v}` : ''}. ${v.s.el ? `Pour une électrique, la médiane dijonnaise monte à ${h.prix(v.s.el.med)}.` : ''} Chaque chiffre est recalculé chaque jour à partir des déclarations des centres (fichier du ${x.fichier}) : ce ne sont ni des estimations ni des devis. Tapez votre commune dans l’outil pour voir les centres autour de chez vous.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v, mc = moinsCheres(h);
      return [
        { q: 'Quel est le centre de contrôle technique le moins cher de Dijon ?', a: `${v.moinsCher ? `Dans le fichier du jour, le tarif le plus bas déclaré dans Dijon pour une voiture essence est de ${h.prix(v.moinsCher.p)}, soit ${h.prix(x.e!.med - v.moinsCher.p)} sous la médiane de la ville.` : ''} La liste de l’outil le montre en tête, avec son adresse et la date de son tarif ; vérifiez le prix affiché au centre, qui fait foi.` },
        { q: 'Les communes de la métropole de Dijon sont-elles moins chères ?', a: (`${mc.length ? `Aujourd’hui, ${x.nb(mc.length, 'commune voisine a', 'communes voisines ont')} une médiane inférieure à celle de Dijon, dont ${mc.slice(0, 3).map((c) => c.nom).join(', ')}.` : 'Aujourd’hui, aucune commune voisine n’a une médiane inférieure à celle de Dijon.'} Le tableau des communes donne la distance et le prix le plus bas de chacune.`) + ` Chenôve, Longvic et les autres communes de la métropole sont proches : une médiane plus basse peut justifier le trajet si l’écart vaut pour votre type de véhicule.` },
        { q: 'Combien coûte le contrôle d’une voiture électrique à Dijon ?', a: v.s.el ? `La médiane dijonnaise est de ${h.prix(v.s.el.med)} pour une électrique, ${x.cmp(v.s.el.med, x.e!.med)} pour l’essence. Le supplément n’est imposé par aucun texte : certains centres appliquent le même prix à toutes les motorisations. Choisissez « Voiture électrique » dans l’outil pour les repérer.` : 'Peu de centres dijonnais déclarent un tarif électrique. Choisissez « Voiture électrique » dans l’outil et élargissez la distance.' },
        { q: 'Où faire contrôler une moto à Dijon ?', a: (v.s.m ? `${x.nb(v.s.m.n, 'centre de Dijon déclare', 'centres de Dijon déclarent')} un tarif moto (médiane ${h.prix(v.s.m.med)}) ; ${v.s15.m ? `${h.num(v.s15.m.n)} dans un rayon de 15 km` : 'peu dans les environs'}. Les deux-roues passent dans des centres équipés de bancs adaptés : choisissez « Moto » dans l’outil.` : `Aucun centre de Dijon ne déclare de tarif moto aujourd’hui${v.s15.m ? ` ; ${h.num(v.s15.m.n)} le font dans les 15 km` : ''}. Choisissez « Moto » dans l’outil.`) + ` Le contrôle porte notamment sur le freinage, l’éclairage et le niveau sonore.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), mc = moinsCheres(h);
      return `<h2>Dijon et sa métropole</h2>
<p>Capitale de la Bourgogne-Franche-Comté et préfecture de la Côte-d’Or, Dijon est entourée d’une couronne de communes reliées par une rocade. Les centres de contrôle technique se partagent entre la ville et ces communes : Chenôve et Longvic au sud, Quetigny et Saint-Apollinaire à l’est, Talant et Fontaine-lès-Dijon à l’ouest et au nord. Le fichier compte ${x.nb(x.e!.n, 'centre', 'centres')} pour les voitures dans Dijon et ${h.num(x.e15!.n)} dans un rayon de 15 km.</p>
<p>Dans la ville, l’écart entre le tarif le plus bas et le plus haut est de ${h.prix(x.e!.max - x.e!.min)} pour une voiture essence. ${mc.length ? `${x.nb(mc.length, 'commune voisine affiche', 'communes voisines affichent')} une médiane plus basse que Dijon.` : 'Aucune commune voisine n’affiche une médiane plus basse que Dijon aujourd’hui.'} La rocade rend ces centres accessibles en quelques minutes : comparer dans tout le rayon a du sens.</p>
${x.vehTable(`Prix médian par véhicule à Dijon, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>La Côte-d’Or dans le classement national</h2>
<p>La Côte-d’Or réunit ${h.num(x.dep.centres)} centres, de Beaune à Montbard. Sa médiane pour une voiture essence, ${h.prix(x.depMed)}, la situe au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher, et ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Le ${h.a('departements', 'classement des départements')} refait ce calcul pour chaque véhicule.</p>
<!--mini:elecDept_21-->
<h2>Les communes autour de Dijon</h2>
<p>Le tableau ci-dessous reprend, commune par commune, le nombre de centres, la médiane et le tarif le plus bas, de la plus proche à la plus éloignée. Les écarts de quelques euros ne valent pas un long trajet ; un centre sur votre chemin du matin, en revanche, permet souvent de déposer la voiture et de la récupérer le soir.</p>
${x.voisinesTable(`Communes autour de Dijon : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>L’électrique et l’hybride paient souvent plus</h2>
<p>${v.s.el ? `À Dijon, la médiane d’un contrôle de voiture électrique est de ${h.prix(v.s.el.med)}, contre ${h.prix(x.e!.med)} pour l’essence.` : ''} ${v.s.h ? `L’hybride se paie ${h.prix(v.s.h.med)}.` : ''} Une électrique n’a pourtant pas de mesure d’émissions à subir. Le mini-simulateur ci-dessus compare l’électrique et l’essence dans n’importe quel département, et la page ${h.a('controle-technique-electrique', 'voiture électrique')} explique ce qui est vérifié.</p>
<h2>Deux-roues</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'centre de Dijon contrôle', 'centres de Dijon contrôlent')} les motos (médiane ${h.prix(v.s.m.med)})` : 'Aucun centre de Dijon ne déclare de tarif moto'}${v.s15.m ? ` ; dans les 15 km, ${x.nb(v.s15.m.n, 'centre', 'centres')}, médiane ${h.prix(v.s15.m.med)}` : ''}. Le ${h.a('controle-technique-moto', 'guide moto')} donne le calendrier du premier contrôle selon l’année de mise en circulation.</p>
<h2>Échéance et contre-visite</h2>
<p>Une voiture neuve passe son premier contrôle dans les six mois avant ses quatre ans, puis tous les deux ans : le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} calcule votre date. ${v.cv ? `En cas d’échec, les centres dijonnais facturent la contre-visite entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane${v.cv.gratuite > 0 ? `, et ${h.pct(v.cv.gratuite, 0)} d’entre eux annoncent une gratuité possible` : ''}.` : ''} Elle doit avoir lieu dans les deux mois : voir la page ${h.a('contre-visite', 'contre-visite')}.</p>
<p>${v.ancien != null ? `${h.pct(v.ancien, 0)} des centres de Dijon déclarent un tarif voiture daté d’avant 2023 ; l’astérisque de la liste les signale, et le prix affiché à l’accueil l’emporte.` : ''} Pour une autre grande ville de l’Est, voir la page ${h.a('controle-technique-strasbourg', 'Strasbourg')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-dijon',
    nav: 'Dijon',
    card: 'Centres in Dijon and its metropolitan area, with the Côte-d’Or median.',
    title: 'Contrôle technique in Dijon: centre prices and cheapest',
    description: 'Contrôle technique prices in Dijon and its metro area: each approved centre, city and Côte-d’Or medians, the cheapest within 15 km, electric cars, re-checks.',
    h1: 'Contrôle technique in Dijon: every centre’s price',
    intro: 'The prices centres in Dijon and the surrounding towns declare to the DGCCRF, sorted to find the cheapest.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      return `A petrol car contrôle technique (France’s compulsory roadworthiness test) costs ${h.prix(x.e!.med)} at the median in Dijon, where ${x.nb(x.e!.n, 'centre declares', 'centres declare')} a car price in the DGCCRF’s public file. Prices there run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. The city sits ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}) and ${x.cmp(x.e!.med, x.depMed)} the Côte-d’Or median (${h.prix(x.depMed)}). In the towns of the metropolitan area and a little beyond, within 15 km, ${h.num(x.e15!.n)} centres show a median of ${h.prix(x.e15!.med)}${m15 ? `; the lowest, ${h.prix(m15.p)}, is in ${m15.v}` : ''}. ${v.s.el ? `For an electric car, the Dijon median rises to ${h.prix(v.s.el.med)}.` : ''} Every figure is recalculated each day from the centres’ declarations (file of ${x.fichier}): they are neither estimates nor quotes. Type your town into the tool to see the centres around you.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v, mc = moinsCheres(h);
      return [
        { q: 'Which is the cheapest contrôle technique centre in Dijon?', a: `${v.moinsCher ? `In today’s file the lowest price declared in Dijon for a petrol car is ${h.prix(v.moinsCher.p)}, ${h.prix(x.e!.med - v.moinsCher.p)} below the city median.` : ''} The tool’s list shows it first, with its address and the date of its price; check the price displayed at the centre, which is what counts.` },
        { q: 'Are the towns around Dijon cheaper?', a: (`${mc.length ? `Today ${x.nb(mc.length, 'neighbouring town has', 'neighbouring towns have')} a median below Dijon’s, including ${mc.slice(0, 3).map((c) => c.nom).join(', ')}.` : 'Today no neighbouring town has a median below Dijon’s.'} The table of towns gives each one’s distance and lowest price.`) + ` Chenôve, Longvic and the other towns of the metropolitan area are a short drive away, so a lower median there can be worth the trip if the saving holds for your vehicle type.` },
        { q: 'How much is the test for an electric car in Dijon?', a: (v.s.el ? `The Dijon median is ${h.prix(v.s.el.med)} for an electric car, ${x.cmp(v.s.el.med, x.e!.med)} petrol. No rule imposes the surcharge: some centres charge the same for every engine type. Pick “Electric car” in the tool to find them.` : 'Few Dijon centres declare an electric-car price. Pick “Electric car” in the tool and widen the distance.') + ` An electric car has no exhaust emissions test, but the brakes, steering, lights and structure are checked as for any car.` },
        { q: 'Where can I get a motorbike tested in Dijon?', a: (v.s.m ? `${x.nb(v.s.m.n, 'Dijon centre declares', 'Dijon centres declare')} a motorcycle price (median ${h.prix(v.s.m.med)}); ${v.s15.m ? `${h.num(v.s15.m.n)} within 15 km` : 'few nearby'}. Two-wheelers are tested at centres with suitable equipment: pick “Motorcycle” in the tool.` : `No Dijon centre declares a motorcycle price today${v.s15.m ? `; ${h.num(v.s15.m.n)} do within 15 km` : ''}. Pick “Motorcycle” in the tool.`) + ` The motorcycle test checks braking, lighting, tyres and noise level, among other points; bring the registration certificate and compare the Dijon centres by price first.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), mc = moinsCheres(h);
      return `<h2>Dijon and its metropolitan area</h2>
<p>Capital of the Bourgogne-Franche-Comté region and prefecture of the Côte-d’Or, Dijon is ringed by towns linked by a bypass. Inspection centres are split between the city and those towns: Chenôve and Longvic to the south, Quetigny and Saint-Apollinaire to the east, Talant and Fontaine-lès-Dijon to the west and north. The file counts ${x.nb(x.e!.n, 'centre', 'centres')} for cars in Dijon and ${h.num(x.e15!.n)} within 15 km.</p>
<p>In the city the gap between the lowest and highest price is ${h.prix(x.e!.max - x.e!.min)} for a petrol car. ${mc.length ? `${x.nb(mc.length, 'neighbouring town shows', 'neighbouring towns show')} a lower median than Dijon.` : 'No neighbouring town shows a lower median than Dijon today.'} The bypass puts these centres a few minutes away: comparing across the whole radius makes sense.</p>
${x.vehTable(`Median price by vehicle in Dijon, within 15 km and in France, file of ${x.fichier}`)}
<h2>The Côte-d’Or in the national ranking</h2>
<p>The Côte-d’Or has ${h.num(x.dep.centres)} centres, from Beaune to Montbard. Its median for a petrol car, ${h.prix(x.depMed)}, ranks it ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, and ${x.cmp(x.depMed, x.natMed)} the national median. The ${h.a('departements', 'département ranking')} redoes the sum for every vehicle.</p>
<!--mini:elecDept_21-->
<h2>The towns around Dijon</h2>
<p>The table below gives, town by town, the number of centres, the median and the lowest price, from nearest to furthest. A few euros are not worth a long drive; a centre on your morning route, on the other hand, often lets you drop the car off and collect it in the evening.</p>
${x.voisinesTable(`Towns around Dijon: price of a petrol car test, file of ${x.fichier}`)}
<h2>Electric and hybrid cars often pay more</h2>
<p>${v.s.el ? `In Dijon the median test price for an electric car is ${h.prix(v.s.el.med)}, against ${h.prix(x.e!.med)} for petrol.` : ''} ${v.s.h ? `A hybrid costs ${h.prix(v.s.h.med)}.` : ''} Yet an electric car has no emissions test to undergo. The mini calculator above compares electric and petrol in any département, and the ${h.a('controle-technique-electrique', 'electric car page')} explains what is checked.</p>
<h2>Two-wheelers</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'Dijon centre tests', 'Dijon centres test')} motorcycles (median ${h.prix(v.s.m.med)})` : 'No Dijon centre declares a motorcycle price'}${v.s15.m ? `; within 15 km, ${x.nb(v.s15.m.n, 'centre', 'centres')}, median ${h.prix(v.s15.m.med)}` : ''}. The ${h.a('controle-technique-moto', 'motorcycle guide')} gives the first-test timetable by year of first registration.</p>
<h2>Due date and re-inspection</h2>
<p>A new car takes its first test in the six months before it turns four, then every two years: the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')} works out your date. ${v.cv ? `If it fails, Dijon centres charge between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median for the re-inspection (contre-visite)${v.cv.gratuite > 0 ? `, and ${h.pct(v.cv.gratuite, 0)} of them say it can be free` : ''}.` : ''} It must take place within two months: see the ${h.a('contre-visite', 're-inspection page')}.</p>
<p>${v.ancien != null ? `${h.pct(v.ancien, 0)} of Dijon centres declare a car price dated before 2023; the asterisk in the list flags them, and the price displayed at the desk prevails.` : ''} For another large city in the east, see the ${h.a('controle-technique-strasbourg', 'Strasbourg page')}.</p>`;
    },
  },
});

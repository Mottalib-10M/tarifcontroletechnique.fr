import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'grenoble';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Supplément électrique médian à Grenoble par rapport à l'essence, et son équivalent national. */
const supp = (h: Helpers) => { const x = ville(h, SLUG); const n = h.S.national.s; return { g: x.v.s.el && x.e ? x.v.s.el.med - x.e.med : null, n: n.el.med - n.e.med }; };

export default defineGuide({
  id: 'controle-technique-grenoble',
  group: 'villes',
  order: 18,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-electrique', 'controle-technique-moto', 'contre-visite', 'controle-technique-lyon'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-grenoble',
    nav: 'Grenoble',
    card: 'Grenoble et sa cuvette : les centres de la ville et des vallées, prix du jour.',
    title: 'Contrôle technique à Grenoble : prix de chaque centre',
    description: 'Prix du contrôle technique à Grenoble : chaque centre de la ville et des vallées voisines, médiane de l’Isère, supplément électrique, moto et contre-visite.',
    h1: 'Contrôle technique à Grenoble : le prix de chaque centre',
    intro: 'Les prix que déclarent les centres de Grenoble, d’Échirolles, de Saint-Martin-d’Hères et du reste de la cuvette, du moins cher au plus cher.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, s = supp(h);
      return `Grenoble même ne compte que ${x.nb(v.n, 'centre de contrôle technique', 'centres de contrôle technique')} dans le fichier public des prix, mais la cuvette grenobloise en réunit ${h.num(v.n15)} dans un rayon de 15 km, d’Échirolles à Meylan et de Fontaine à Saint-Égrève. Dans la ville, le contrôle d’une voiture essence coûte ${h.prix(x.e!.med)} en médiane (de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}) ; dans le rayon de 15 km, ${h.prix(x.e15!.med)}. L’Isère se situe ${x.cmp(x.depMed, x.natMed)} la médiane nationale de ${h.prix(x.natMed)}. ${s.g != null ? `Pour une voiture électrique, la médiane grenobloise atteint ${h.prix(v.s.el!.med)}, soit ${h.prix(s.g)} de plus que l’essence, quand l’écart national médian est de ${h.prix(s.n)}.` : ''} Ces chiffres viennent des déclarations de chaque centre à la DGCCRF, relues chaque jour (fichier du ${x.fichier}). Choisissez votre véhicule dans l’outil : la liste se réordonne et montre le centre le moins cher autour de votre commune.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v, s = supp(h);
      return [
        { q: 'Pourquoi si peu de centres de contrôle technique dans Grenoble même ?', a: `La ville, dense et enserrée entre trois massifs, laisse peu de place aux grands locaux d’activité. Les centres se sont installés dans les communes de la cuvette, le long des axes. Résultat : ${h.num(v.n)} centres dans Grenoble pour ${h.num(v.n15)} dans un rayon de 15 km, que l’outil liste par prix ou par distance.` },
        { q: 'Le contrôle d’une électrique est-il plus cher à Grenoble ?', a: s.g != null ? `Aujourd’hui, la médiane grenobloise pour une électrique est de ${h.prix(v.s.el!.med)}, ${h.prix(s.g)} au-dessus de l’essence, quand l’écart médian en France est de ${h.prix(s.n)}. Certains centres de la cuvette ne facturent pas de supplément : choisissez « Voiture électrique » dans l’outil pour les trouver.` : 'Le fichier du jour ne permet pas de calculer l’écart à Grenoble. Choisissez « Voiture électrique » dans l’outil pour voir les centres qui déclarent un tarif.' },
        { q: 'Combien de centres contrôlent les motos autour de Grenoble ?', a: (`${v.s.m ? `${x.nb(v.s.m.n, 'centre de Grenoble déclare', 'centres de Grenoble déclarent')} un tarif moto ;` : 'Aucun centre de la commune ne déclare de tarif moto ;'} ${v.s15.m ? `dans un rayon de 15 km, ${h.num(v.s15.m.n)} centres le font, avec une médiane de ${h.prix(v.s15.m.med)}` : 'il faut chercher au-delà de 15 km'}. Avec les nombreux deux-roues de l’agglomération, mieux vaut s’y prendre tôt.`) + ` Les centres équipés contrôlent notamment le freinage, l’éclairage, les pneus et le bruit : triez la liste grenobloise par prix.` },
        { q: 'Quelle contre-visite prévoir à Grenoble après un échec ?', a: (v.cv ? `Les centres grenoblois déclarent une contre-visite entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane, selon les vérifications à refaire. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} annoncent une gratuité possible.` : 'Aucun n’annonce de gratuité dans le fichier du jour.'} Elle doit avoir lieu dans les deux mois.` : 'Le fichier ne donne pas de prix de contre-visite pour Grenoble ; elle doit avoir lieu dans les deux mois, dans le centre de votre choix.') + ` Seuls les points défaillants sont revérifiés ; après deux mois, un centre grenoblois doit refaire un contrôle complet.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), s = supp(h), m15 = v.moinsCher15;
      return `<h2>Une ville au fond de la cuvette</h2>
<p>Grenoble occupe le fond d’une cuvette où se rejoignent le Drac et l’Isère, entre la Chartreuse, le Vercors et Belledonne. Les vallées partent en étoile : le Grésivaudan vers Chambéry, la cluse de Voreppe vers Lyon, le Drac vers le sud. Les centres de contrôle technique ont suivi les zones d’activité de ces vallées plutôt que le centre-ville : le fichier en compte ${h.num(v.n)} dans Grenoble et ${h.num(v.n15)} dans un rayon de 15 km.</p>
<p>La médiane de la ville est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon de 15 km. ${m15 ? (m15.v === v.nom ? `Le tarif le plus bas de tout le rayon est dans Grenoble même, à ${h.prix(m15.p)}.` : `Le tarif le plus bas du rayon est à ${m15.v}, à ${h.prix(m15.p)}.`) : ''} À vol d’oiseau, tout est proche ; aux heures de pointe, les rocades de l’agglomération rallongent les trajets : choisissez un centre sur votre chemin.</p>
${x.vehTable(`Prix médian par véhicule à Grenoble, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>L’Isère, un grand département de centres</h2>
<p>Avec ${h.num(x.dep.centres)} centres, l’Isère est l’un des départements les mieux pourvus de France. Sa médiane pour une voiture essence, ${h.prix(x.depMed)}, la classe au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher, ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Le ${h.a('departements', 'classement des départements')} donne la même comparaison pour chaque véhicule.</p>
<h2>Le supplément électrique</h2>
<p>${s.g != null ? `${s.g > s.n ? 'C’est la particularité grenobloise du fichier du jour : la' : 'Dans le fichier du jour, la'} médiane pour une électrique est de ${h.prix(v.s.el!.med)}, ${h.prix(s.g)} de plus que pour l’essence, quand l’écart médian national est de ${h.prix(s.n)}.` : 'Les centres de Grenoble déclarent peu de tarifs pour l’électrique.'} ${v.s15.el ? `Dans les 15 km, la médiane électrique est de ${h.prix(v.s15.el.med)}.` : ''} Rien n’impose un tel écart : le contrôle d’une électrique ne comporte pas de mesure des gaz d’échappement. Changer de véhicule dans l’outil réordonne la liste et fait remonter les centres qui appliquent le même prix à toutes les motorisations. Le détail est sur la page ${h.a('controle-technique-electrique', 'voiture électrique')}.</p>
<!--mini:elecDept_38-->
<h2>De Fontaine à Meylan</h2>
<p>Le tableau suivant reprend les communes de la cuvette qui ont au moins un centre, de la plus proche à la plus lointaine, avec leur médiane et leur tarif le plus bas.</p>
${x.voisinesTable(`Communes autour de Grenoble : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>Motos et scooters</h2>
<p>${v.s.m ? `Dans Grenoble, ${x.nb(v.s.m.n, 'centre déclare', 'centres déclarent')} un tarif moto (médiane ${h.prix(v.s.m.med)}).` : 'Aucun centre de Grenoble ne déclare de tarif moto.'} ${v.s15.m ? `Dans la cuvette, ${x.nb(v.s15.m.n, 'centre est équipé', 'centres sont équipés')}, pour une médiane de ${h.prix(v.s15.m.med)}.` : ''} Le calendrier du premier contrôle dépend de l’année de mise en circulation : les deux-roues de 2020 et 2021 doivent passer en 2026. Le ${h.a('controle-technique-moto', 'guide moto')} détaille chaque cas.</p>
<h2>Contre-visite et tarifs anciens</h2>
<p>${v.cv ? `La contre-visite se paie à Grenoble entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane.` : ''} Elle doit être faite dans les deux mois, pas forcément dans le même centre : voir la page ${h.a('contre-visite', 'contre-visite')}. ${v.ancien != null ? `${h.pct(v.ancien, 0)} des centres de la commune déclarent un tarif voiture daté d’avant 2023 ; l’astérisque de la liste les repère, et c’est le prix affiché sur place qui compte.` : ''} Pour la métropole voisine, voir la page ${h.a('controle-technique-lyon', 'Lyon')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-grenoble',
    nav: 'Grenoble',
    card: 'Grenoble and its basin: centres in the city and the valleys, today’s prices.',
    title: 'Contrôle technique in Grenoble: every centre’s price',
    description: 'Contrôle technique prices in Grenoble: every centre in the city and nearby valleys, the Isère median, the electric-car surcharge, motorbikes and re-checks.',
    h1: 'Contrôle technique in Grenoble: every centre’s price',
    intro: 'The prices declared by centres in Grenoble, Échirolles, Saint-Martin-d’Hères and the rest of the basin, from cheapest to dearest.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, s = supp(h);
      return `Grenoble itself has only ${x.nb(v.n, 'contrôle technique centre', 'contrôle technique centres')} in the public price file, but the Grenoble basin holds ${h.num(v.n15)} within a 15 km radius, from Échirolles to Meylan and from Fontaine to Saint-Égrève. In the city a petrol car test (the contrôle technique is France’s compulsory roadworthiness test) costs ${h.prix(x.e!.med)} at the median (from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}); within 15 km, ${h.prix(x.e15!.med)}. The Isère sits ${x.cmp(x.depMed, x.natMed)} the national median of ${h.prix(x.natMed)}. ${s.g != null ? `For an electric car the Grenoble median reaches ${h.prix(v.s.el!.med)}, ${h.prix(s.g)} more than petrol, while the national median gap is ${h.prix(s.n)}.` : ''} These figures come from each centre’s declaration to the DGCCRF, reread every day (file of ${x.fichier}). Pick your vehicle in the tool: the list reorders itself and shows the cheapest centre around your town.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v, s = supp(h);
      return [
        { q: 'Why are there so few contrôle technique centres in Grenoble itself?', a: `The city is dense and hemmed in by three mountain ranges, leaving little room for large commercial premises. Centres have settled in the towns of the basin, along the main roads. The result: ${h.num(v.n)} centres in Grenoble against ${h.num(v.n15)} within 15 km, which the tool lists by price or distance.` },
        { q: 'Is testing an electric car dearer in Grenoble?', a: (s.g != null ? `Today the Grenoble median for an electric car is ${h.prix(v.s.el!.med)}, ${h.prix(s.g)} above petrol, while the median gap across France is ${h.prix(s.n)}. Some centres in the basin charge no surcharge: pick “Electric car” in the tool to find them.` : 'Today’s file does not allow the gap to be worked out for Grenoble. Pick “Electric car” in the tool to see the centres that declare a price.') + ` The car still gets the full set of checks on brakes, steering and lighting; only the exhaust emissions test does not apply.` },
        { q: 'How many centres test motorbikes around Grenoble?', a: (`${v.s.m ? `${x.nb(v.s.m.n, 'Grenoble centre declares', 'Grenoble centres declare')} a motorcycle price;` : 'No centre in the city declares a motorcycle price;'} ${v.s15.m ? `within 15 km, ${h.num(v.s15.m.n)} centres do, with a median of ${h.prix(v.s15.m.med)}` : 'you need to look beyond 15 km'}. With so many two-wheelers in the area, it is best to book early.`) + ` Equipped centres check braking, lighting, tyres and noise level; sort the Grenoble list by price, since the gap between two equipped centres can be wide.` },
        { q: 'What re-inspection should I expect in Grenoble after a fail?', a: (v.cv ? `Grenoble centres declare a re-inspection (contre-visite) between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median, depending on what has to be rechecked. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} say it can be free.` : 'None says it can be free in today’s file.'} It must take place within two months.` : 'The file gives no re-inspection price for Grenoble; it must take place within two months, at any centre you choose.') + ` Only the points failed at the first visit are rechecked; miss the two-month window and Grenoble centres must start again with a full test.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), s = supp(h), m15 = v.moinsCher15;
      return `<h2>A city at the bottom of a basin</h2>
<p>Grenoble lies at the bottom of a basin where the Drac meets the Isère, between the Chartreuse, Vercors and Belledonne ranges. Valleys fan out from it: the Grésivaudan towards Chambéry, the Voreppe gap towards Lyon, the Drac to the south. Inspection centres have followed the business areas of those valleys rather than the city centre: the file counts ${h.num(v.n)} in Grenoble and ${h.num(v.n15)} within 15 km.</p>
<p>The city median is ${x.cmp(x.e!.med, x.e15!.med)} the 15 km median. ${m15 ? (m15.v === v.nom ? `The lowest price in the whole radius is in Grenoble itself, at ${h.prix(m15.p)}.` : `The lowest price in the radius is in ${m15.v}, at ${h.prix(m15.p)}.`) : ''} As the crow flies everything is close; at rush hour the ring roads stretch journeys, so pick a centre on your way.</p>
${x.vehTable(`Median price by vehicle in Grenoble, within 15 km and in France, file of ${x.fichier}`)}
<h2>The Isère, a département with many centres</h2>
<p>With ${h.num(x.dep.centres)} centres, the Isère is one of France’s best-served départements. Its median for a petrol car, ${h.prix(x.depMed)}, ranks it ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, ${x.cmp(x.depMed, x.natMed)} the national median. The ${h.a('departements', 'département ranking')} gives the same comparison for every vehicle.</p>
<h2>The electric surcharge</h2>
<p>${s.g != null ? `${s.g > s.n ? 'This is Grenoble’s distinctive feature in today’s file: the' : 'In today’s file the'} median for an electric car is ${h.prix(v.s.el!.med)}, ${h.prix(s.g)} more than for petrol, while the national median gap is ${h.prix(s.n)}.` : 'Grenoble centres declare few electric-car prices.'} ${v.s15.el ? `Within 15 km the electric median is ${h.prix(v.s15.el.med)}.` : ''} Nothing requires such a gap: testing an electric car involves no exhaust gas measurement. Changing the vehicle in the tool reorders the list and brings up the centres that charge the same for every engine type. Details are on the ${h.a('controle-technique-electrique', 'electric car page')}.</p>
<!--mini:elecDept_38-->
<h2>From Fontaine to Meylan</h2>
<p>The next table lists the towns of the basin with at least one centre, from nearest to furthest, with their median and lowest price.</p>
${x.voisinesTable(`Towns around Grenoble: price of a petrol car test, file of ${x.fichier}`)}
<h2>Motorbikes and scooters</h2>
<p>${v.s.m ? `In Grenoble, ${x.nb(v.s.m.n, 'centre declares', 'centres declare')} a motorcycle price (median ${h.prix(v.s.m.med)}).` : 'No Grenoble centre declares a motorcycle price.'} ${v.s15.m ? `Across the basin, ${x.nb(v.s15.m.n, 'centre is equipped', 'centres are equipped')}, for a median of ${h.prix(v.s15.m.med)}.` : ''} The first-test timetable depends on the year of first registration: two-wheelers from 2020 and 2021 are due in 2026. The ${h.a('controle-technique-moto', 'motorcycle guide')} covers every case.</p>
<h2>Re-inspection and old prices</h2>
<p>${v.cv ? `A re-inspection (contre-visite) costs between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median in Grenoble.` : ''} It must be done within two months, not necessarily at the same centre: see the ${h.a('contre-visite', 're-inspection page')}. ${v.ancien != null ? `${h.pct(v.ancien, 0)} of the city’s centres declare a car price dated before 2023; the asterisk in the list marks them, and the price displayed on site is what counts.` : ''} For the neighbouring metropolis, see the ${h.a('controle-technique-lyon', 'Lyon page')}.</p>`;
    },
  },
});

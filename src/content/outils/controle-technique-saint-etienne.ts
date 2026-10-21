import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'saint-etienne';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Médiane essence du Rhône voisin, pour situer la Loire. */
const rhone = (h: Helpers) => (h.S.depts as unknown as Record<string, { s: { e: { med: number } } }>)['69'].s.e.med;

export default defineGuide({
  id: 'controle-technique-saint-etienne',
  group: 'villes',
  order: 14,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-pas-cher', 'contre-visite', 'controle-technique-moto', 'controle-technique-lyon'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-saint-etienne',
    nav: 'Saint-Étienne',
    card: 'Saint-Étienne et les vallées de l’Ondaine et du Gier : prix de chaque centre.',
    title: 'Contrôle technique à Saint-Étienne : prix et moins cher',
    description: 'Prix du contrôle technique à Saint-Étienne : chaque centre de la ville et des vallées, médiane de la Loire comparée au Rhône, le moins cher et la contre-visite.',
    h1: 'Contrôle technique à Saint-Étienne : prix de chaque centre',
    intro: 'Les tarifs déclarés par les centres stéphanois et par ceux des vallées de l’Ondaine et du Gier, comparés à la Loire, au Rhône et à la France entière.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      return `À Saint-Étienne, un contrôle technique de voiture essence coûte ${h.prix(x.e!.med)} en médiane, d’après les tarifs que les ${h.num(v.n)} centres de la commune déclarent à la DGCCRF ; ils vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. C’est ${x.cmp(x.e!.med, x.natMed)} la médiane de la France (${h.prix(x.natMed)}). Dans un rayon de 15 km, qui englobe les vallées de l’Ondaine et du Gier, ${h.num(v.n15)} centres affichent une médiane de ${h.prix(x.e15!.med)}${m15 ? ` et le moins cher, à ${m15.v}, descend à ${h.prix(m15.p)}` : ''}. La Loire, avec une médiane de ${h.prix(x.depMed)}, se classe ${r.i}${r.i === 1 ? 'er' : 'e'} sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher, quand le Rhône voisin est à ${h.prix(rhone(h))}. Ces chiffres sont recalculés chaque jour à partir du fichier public des prix (dernier fichier : ${x.fichier}). L’outil liste les centres autour de votre commune, avec la contre-visite et la date de chaque tarif.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Le contrôle technique est-il moins cher à Saint-Étienne qu’à Lyon ?', a: `Aujourd’hui, la Loire a une médiane de ${h.prix(x.depMed)} pour une voiture essence et le Rhône de ${h.prix(rhone(h))} : la Loire est ${x.cmp(x.depMed, rhone(h))} son voisin. Pour un Stéphanois, faire la route jusqu’à Lyon pour un contrôle n’a donc ${x.depMed <= rhone(h) ? 'aucun intérêt' : 'd’intérêt que si un centre précis se trouve sur un trajet déjà prévu'}.` },
        { q: 'Où trouver le contrôle technique le moins cher autour de Saint-Étienne ?', a: `${v.moinsCher15 ? `Dans le fichier du jour, le tarif le plus bas à moins de 15 km est de ${h.prix(v.moinsCher15.p)}, à ${v.moinsCher15.v}.` : ''} Les communes de l’Ondaine et du Gier ont souvent des médianes plus basses que le centre-ville : le tableau des communes voisines les compare, avec la distance depuis le centre de Saint-Étienne.` },
        { q: 'Combien de centres contrôlent les motos à Saint-Étienne ?', a: v.s.m ? `${x.nb(v.s.m.n, 'centre de la commune déclare', 'centres de la commune déclarent')} un tarif moto (médiane ${h.prix(v.s.m.med)}), et ${v.s15.m ? h.num(v.s15.m.n) : 'peu'} dans un rayon de 15 km. L’offre pour les deux-roues reste bien plus mince que pour les voitures : élargissez la distance dans l’outil si besoin.` : `Aucun centre de la commune ne déclare de tarif moto aujourd’hui ; ${v.s15.m ? `${h.num(v.s15.m.n)} le font dans les 15 km` : 'il faut chercher plus loin'}. Choisissez « Moto » dans l’outil.` },
        { q: 'Quel délai pour la contre-visite à Saint-Étienne, et à quel prix ?', a: `Le délai est national : deux mois après le contrôle défavorable, dans le centre de votre choix. ${v.cv ? `Les centres stéphanois la déclarent entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane ; ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} annoncent une gratuité possible` : 'aucun n’annonce de gratuité dans le fichier du jour'}.` : 'Le fichier ne donne pas de prix de contre-visite pour la commune.'}` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      const bas = [...v.voisines].sort((a, b) => a.s.med - b.s.med).slice(0, 3).map((c) => `${c.nom} (${h.prix(c.s.med)})`).join(', ');
      return `<h2>Une agglomération étirée le long de ses vallées</h2>
<p>Saint-Étienne s’est développée dans une cuvette, prolongée à l’ouest par la vallée de l’Ondaine (Roche-la-Molière, Le Chambon-Feugerolles, Firminy) et au nord-est par celle du Gier vers Saint-Chamond. Les centres de contrôle technique suivent cette géographie : quelques-uns en ville, les autres le long des vallées et dans la plaine du Forez, au nord. Le fichier en compte ${h.num(v.n)} dans la commune et ${h.num(v.n15)} dans un rayon de 15 km.</p>
<p>Pour une voiture essence, les prix de la commune vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}, soit ${h.prix(x.e!.max - x.e!.min)} d’écart pour le même examen. Le centre-ville est ${x.cmp(x.e!.med, x.e15!.med)} le rayon de 15 km. Les trois communes voisines dont la médiane est la plus basse aujourd’hui : ${bas}.</p>
${x.vehTable(`Prix médian par véhicule à Saint-Étienne, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>La Loire face au Rhône et au reste du pays</h2>
<p>La Loire compte ${h.num(x.dep.centres)} centres. Sa médiane de ${h.prix(x.depMed)} pour une voiture essence est ${x.cmp(x.depMed, x.natMed)} la médiane nationale et ${x.cmp(x.depMed, rhone(h))} celle du Rhône. Le coût des locaux et la densité de centres le long des vallées pèsent sur ces prix. Le ${h.a('departements', 'classement des départements')} permet de refaire la comparaison pour chaque véhicule.</p>
<!--mini:detention_42-->
<h2>Les communes voisines, de l’Ondaine au Gier</h2>
<p>Le tableau ci-dessous classe par distance les communes proches qui ont au moins un centre, avec leur médiane et leur prix le plus bas. ${m15 ? (m15.v === v.nom ? `Le centre le moins cher de tout le rayon est dans Saint-Étienne même (${h.prix(m15.p)}).` : `Le moins cher de tout le rayon est à ${m15.v} (${h.prix(m15.p)}), à comparer avec la médiane stéphanoise de ${h.prix(x.e!.med)}.`) : ''} Un contrôle dure moins d’une heure : un centre proche de votre travail, dans une autre commune de la vallée, peut être le plus pratique.</p>
${x.voisinesTable(`Communes autour de Saint-Étienne : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>Électrique et hybride</h2>
<p>${v.s.el ? `L’électrique se paie ${h.prix(v.s.el.med)} en médiane dans la commune, ${x.cmp(v.s.el.med, x.e!.med)} l’essence.` : 'Peu de centres de la commune déclarent un tarif électrique.'} Le contrôle d’une électrique ne comporte pourtant pas de mesure des gaz d’échappement ; le supplément, quand il existe, relève de la politique tarifaire du centre. En choisissant « Voiture électrique » dans l’outil, vous voyez directement les centres qui n’en appliquent pas. Plus de détails sur la page ${h.a('controle-technique-electrique', 'contrôle technique électrique')}.</p>
<h2>Motos et scooters</h2>
<p>${v.s.m ? `Dans la commune, ${x.nb(v.s.m.n, 'centre est équipé', 'centres sont équipés')} pour les motos (médiane ${h.prix(v.s.m.med)})` : 'Aucun centre de la commune ne déclare de tarif moto'}${v.s15.m ? ` ; ${h.num(v.s15.m.n)} dans le rayon de 15 km, médiane ${h.prix(v.s15.m.med)}` : ''}. Le calendrier des deux-roues dépend de l’année de mise en circulation : voir le ${h.a('controle-technique-moto', 'guide moto')}.</p>
<h2>Contre-visite, dates des tarifs</h2>
<p>${v.cv ? `La contre-visite se déclare entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane chez les centres stéphanois.` : ''} Elle se fait dans les deux mois, pas forcément au même centre : la page ${h.a('contre-visite', 'contre-visite')} détaille les cas. ${v.ancien != null ? `${h.pct(v.ancien, 0)} des centres de la commune affichent dans le fichier un tarif voiture daté d’avant 2023 ; l’astérisque de la liste les signale.` : ''} Pour payer moins sans changer de ville, voir aussi ${h.a('controle-technique-pas-cher', 'nos conseils pour un contrôle moins cher')}, et pour la grande voisine, la page ${h.a('controle-technique-lyon', 'Lyon')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-saint-etienne',
    nav: 'Saint-Étienne',
    card: 'Saint-Étienne and the Ondaine and Gier valleys: every centre’s price.',
    title: 'Contrôle technique in Saint-Étienne: prices, cheapest',
    description: 'Contrôle technique prices in Saint-Étienne: every centre in the city and valleys, the Loire median against the Rhône, the cheapest centre and re-check costs.',
    h1: 'Contrôle technique in Saint-Étienne: every centre’s price',
    intro: 'Prices declared by centres in Saint-Étienne and in the Ondaine and Gier valleys, compared with the Loire, the Rhône and France as a whole.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      return `In Saint-Étienne a petrol car contrôle technique (France’s compulsory roadworthiness test) costs ${h.prix(x.e!.med)} at the median, according to the prices the ${h.num(v.n)} centres in the city declare to the DGCCRF; they range from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. That is ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}). Within 15 km, an area that takes in the Ondaine and Gier valleys, ${h.num(v.n15)} centres show a median of ${h.prix(x.e15!.med)}${m15 ? ` and the cheapest, in ${m15.v}, goes down to ${h.prix(m15.p)}` : ''}. The Loire, with a median of ${h.prix(x.depMed)}, ranks ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, while the neighbouring Rhône is at ${h.prix(rhone(h))}. These figures are recalculated every day from the public price file (latest file: ${x.fichier}). The tool lists centres around your town, with the re-inspection price and the date of each price.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Is the contrôle technique cheaper in Saint-Étienne than in Lyon?', a: (`Today the Loire median is ${h.prix(x.depMed)} for a petrol car and the Rhône’s ${h.prix(rhone(h))}: the Loire is ${x.cmp(x.depMed, rhone(h))} its neighbour. For someone in Saint-Étienne, driving to Lyon for a test makes ${x.depMed <= rhone(h) ? 'no sense' : 'sense only if a particular centre is on a trip already planned'}.`) + ` Each centre sets its own price, so the cheapest Saint-Étienne centre can beat many Lyon ones even when the medians are close.` },
        { q: 'Where is the cheapest contrôle technique around Saint-Étienne?', a: `${v.moinsCher15 ? `In today’s file the lowest price within 15 km is ${h.prix(v.moinsCher15.p)}, in ${v.moinsCher15.v}.` : ''} Towns in the Ondaine and Gier valleys often have lower medians than the city centre: the table of neighbouring towns compares them, with the distance from central Saint-Étienne.` },
        { q: 'How many centres test motorcycles in Saint-Étienne?', a: (v.s.m ? `${x.nb(v.s.m.n, 'centre in the city declares', 'centres in the city declare')} a motorcycle price (median ${h.prix(v.s.m.med)}), and ${v.s15.m ? h.num(v.s15.m.n) : 'few'} within 15 km. The choice for two-wheelers is far thinner than for cars: widen the distance in the tool if needed.` : `No centre in the city declares a motorcycle price today; ${v.s15.m ? `${h.num(v.s15.m.n)} do within 15 km` : 'you need to look further'}. Pick “Motorcycle” in the tool.`) + ` Two-wheeler tests cover braking, lighting, tyres and noise level, among other points.` },
        { q: 'What is the re-inspection deadline in Saint-Étienne, and the price?', a: (`The deadline is national: two months after the failed test, at any centre you choose. ${v.cv ? `Saint-Étienne centres declare it between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median; ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} say it can be free` : 'none says it can be free in today’s file'}.` : 'The file gives no re-inspection price for the city.'}`) + ` Only the defects noted at the first visit are rechecked; once the two months have passed, a full test is needed.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      const bas = [...v.voisines].sort((a, b) => a.s.med - b.s.med).slice(0, 3).map((c) => `${c.nom} (${h.prix(c.s.med)})`).join(', ');
      return `<h2>A conurbation stretched along its valleys</h2>
<p>Saint-Étienne grew up in a basin, extended westwards by the Ondaine valley (Roche-la-Molière, Le Chambon-Feugerolles, Firminy) and north-eastwards by the Gier valley towards Saint-Chamond. Inspection centres follow that geography: a few in town, the rest along the valleys and in the Forez plain to the north. The file counts ${h.num(v.n)} in the city and ${h.num(v.n15)} within 15 km.</p>
<p>For a petrol car, prices in the city run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}, a ${h.prix(x.e!.max - x.e!.min)} gap for the same test. The city is ${x.cmp(x.e!.med, x.e15!.med)} the 15 km radius. The three nearby towns with the lowest median today: ${bas}.</p>
${x.vehTable(`Median price by vehicle in Saint-Étienne, within 15 km and in France, file of ${x.fichier}`)}
<h2>The Loire against the Rhône and the rest of France</h2>
<p>The Loire has ${h.num(x.dep.centres)} centres. Its median of ${h.prix(x.depMed)} for a petrol car is ${x.cmp(x.depMed, x.natMed)} the national median and ${x.cmp(x.depMed, rhone(h))} the Rhône’s. The cost of premises and the density of centres along the valleys both weigh on these prices. The ${h.a('departements', 'département ranking')} lets you redo the comparison for each vehicle.</p>
<!--mini:detention_42-->
<h2>Neighbouring towns, from the Ondaine to the Gier</h2>
<p>The table below lists nearby towns with at least one centre by distance, with their median and lowest price. ${m15 ? (m15.v === v.nom ? `The cheapest centre in the whole radius is in Saint-Étienne itself (${h.prix(m15.p)}).` : `The cheapest in the whole radius is in ${m15.v} (${h.prix(m15.p)}), against a city median of ${h.prix(x.e!.med)}.`) : ''} A test takes under an hour: a centre near your workplace, in another valley town, may be the most convenient.</p>
${x.voisinesTable(`Towns around Saint-Étienne: price of a petrol car test, file of ${x.fichier}`)}
<h2>Electric and hybrid</h2>
<p>${v.s.el ? `An electric car costs ${h.prix(v.s.el.med)} at the median in the city, ${x.cmp(v.s.el.med, x.e!.med)} petrol.` : 'Few centres in the city declare an electric-car price.'} Yet testing an electric car involves no exhaust gas measurement; the surcharge, where there is one, is the centre’s pricing policy. Picking “Electric car” in the tool shows straight away which centres do not apply one. More on the ${h.a('controle-technique-electrique', 'electric car page')}.</p>
<h2>Motorbikes and scooters</h2>
<p>${v.s.m ? `In the city, ${x.nb(v.s.m.n, 'centre is equipped', 'centres are equipped')} for motorcycles (median ${h.prix(v.s.m.med)})` : 'No centre in the city declares a motorcycle price'}${v.s15.m ? `; ${h.num(v.s15.m.n)} within 15 km, median ${h.prix(v.s15.m.med)}` : ''}. When a two-wheeler is due depends on its year of first registration: see the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>Re-inspection and price dates</h2>
<p>${v.cv ? `The re-inspection (contre-visite) is declared between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median by Saint-Étienne centres.` : ''} It must be done within two months, not necessarily at the same centre: the ${h.a('contre-visite', 're-inspection page')} sets out the cases. ${v.ancien != null ? `${h.pct(v.ancien, 0)} of the city’s centres show a car price in the file dated before 2023; the asterisk in the list flags them.` : ''} To pay less without changing town, see our ${h.a('controle-technique-pas-cher', 'tips for a cheaper test')}, and for the big neighbour, the ${h.a('controle-technique-lyon', 'Lyon page')}.</p>`;
    },
  },
});

import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'clermont-ferrand';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Part des centres du Puy-de-Dôme situés dans le rayon de 15 km autour de Clermont. */
const part15 = (h: Helpers) => { const x = ville(h, SLUG); return x.dep.centres ? Math.min(1, x.v.n15 / x.dep.centres) : 0; };
/** Centre le moins cher du département (essence) : prix et commune. */
const minDep = (h: Helpers) => (h.S.depts as unknown as Record<string, { moinsCher: { p: number; v: string } | null }>)['63'].moinsCher;

export default defineGuide({
  id: 'controle-technique-clermont-ferrand',
  group: 'villes',
  order: 20,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'quand-faire-controle-technique', 'contre-visite', 'controle-technique-pas-cher', 'controle-technique-lyon'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-clermont-ferrand',
    nav: 'Clermont-Ferrand',
    card: 'Clermont-Ferrand, la Limagne et le reste du Puy-de-Dôme : prix de chaque centre.',
    title: 'Contrôle technique à Clermont-Ferrand : prix des centres',
    description: 'Prix du contrôle technique à Clermont-Ferrand : chaque centre de la ville et de la métropole, médiane du Puy-de-Dôme, le moins cher, contre-visite et échéance.',
    h1: 'Contrôle technique à Clermont-Ferrand : prix par centre',
    intro: 'Les prix que les centres clermontois et ceux de la métropole déclarent à la DGCCRF, et ce que cela donne dans un Puy-de-Dôme largement rural.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `Clermont-Ferrand compte ${x.nb(x.e!.n, 'centre de contrôle technique', 'centres de contrôle technique')} qui déclarent un prix pour les voitures, et la métropole un peu plus : ${h.num(x.e15!.n)} dans un rayon de 15 km. La médiane d’un contrôle essence y est de ${h.prix(x.e!.med)} dans la ville, de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} selon le centre, et de ${h.prix(x.e15!.med)} dans le rayon de 15 km. C’est ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}) et ${x.cmp(x.e!.med, x.depMed)} celle du Puy-de-Dôme (${h.prix(x.depMed)}). Le rayon clermontois concentre à lui seul ${h.pct(part15(h), 0)} des ${h.num(x.dep.centres)} centres du département : ailleurs, de Thiers à Issoire ou dans les monts, l’offre est clairsemée. ${v.moinsCher ? `Le centre le moins cher de la ville déclare ${h.prix(v.moinsCher.p)}.` : ''} Tous ces chiffres sont recalculés chaque jour à partir des déclarations des centres à la DGCCRF (fichier du ${x.fichier}).`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v, md = minDep(h);
      return [
        { q: 'Combien coûte le contrôle technique à Clermont-Ferrand ?', a: `Pour une voiture essence ou diesel, la médiane des centres clermontois est de ${h.prix(x.e!.med)}${v.s.el ? `, et de ${h.prix(v.s.el.med)} pour une électrique` : ''}. Les tarifs vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. Le diesel est facturé au même prix que l’essence dans la plupart des centres.` },
        { q: 'Où est le contrôle technique le moins cher du Puy-de-Dôme ?', a: md ? `Dans le fichier du jour, le tarif le plus bas du département pour une voiture essence est de ${h.prix(md.p)}, à ${md.v}. Le classement change dès qu’un centre modifie son tarif : l’outil, réglé sur votre commune et votre véhicule, donne toujours l’état du jour.` : 'Le fichier du jour ne permet pas de désigner un centre ; l’outil, réglé sur votre commune, donne l’état du jour.' },
        { q: 'Faut-il venir à Clermont-Ferrand pour un contrôle quand on habite les monts d’Auvergne ?', a: `Pas forcément. Le département compte ${h.num(x.dep.centres)} centres, dont ${h.pct(part15(h), 0)} dans un rayon de 15 km autour de Clermont. Les autres sont répartis dans les villes moyennes. Tapez votre commune dans l’outil : il élargit la recherche jusqu’à trouver au moins cinq centres.` },
        { q: 'Quel est le prix de la contre-visite à Clermont-Ferrand ?', a: (v.cv ? `Les centres clermontois la déclarent entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} annoncent une gratuité possible.` : 'Aucun n’annonce de gratuité dans le fichier du jour.'} Le délai est de deux mois après le contrôle défavorable, dans le centre de votre choix.` : 'Le fichier ne donne pas de prix de contre-visite pour la ville ; le délai est de deux mois, dans le centre de votre choix.') + ` Passé ce délai, la contre-visite n’est plus possible et il faut repasser un contrôle complet.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      return `<h2>La métropole au pied des volcans</h2>
<p>Clermont-Ferrand s’étend au pied de la chaîne des Puys, à la limite de la plaine de la Limagne. Sa métropole réunit une vingtaine de communes, de Gerzat et Cébazat au nord à Aubière, Romagnat et Cournon-d’Auvergne au sud et à l’est. C’est là que se trouvent la plupart des centres de contrôle technique : ${x.nb(x.e!.n, 'centre', 'centres')} pour les voitures dans Clermont même, ${h.num(x.e15!.n)} dans un rayon de 15 km.</p>
<p>Entre la ville et ses environs, la médiane clermontoise est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon. ${m15 ? (m15.v === v.nom ? `Le tarif le plus bas de tout le rayon se trouve dans Clermont même (${h.prix(m15.p)}).` : `Le tarif le plus bas du rayon est à ${m15.v} (${h.prix(m15.p)}).`) : ''} L’écart entre le centre le moins cher et le plus cher de la ville est de ${h.prix(x.e!.max - x.e!.min)}.</p>
${x.vehTable(`Prix médian par véhicule à Clermont-Ferrand, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>Un Puy-de-Dôme à deux vitesses</h2>
<p>Le Puy-de-Dôme compte ${h.num(x.dep.centres)} centres, et ${h.pct(part15(h), 0)} d’entre eux sont à moins de 15 km de Clermont. Dans le reste du département, les centres sont installés dans les villes moyennes (Riom, Thiers, Issoire, Ambert) et quelques bourgs ; dans les monts du Sancy ou du Livradois, il faut souvent faire plusieurs dizaines de kilomètres. L’outil élargit automatiquement sa recherche pour montrer au moins cinq centres, quelle que soit la commune tapée.</p>
<p>La médiane départementale, ${h.prix(x.depMed)} pour une voiture essence, place le Puy-de-Dôme au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher, ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Le ${h.a('departements', 'classement des départements')} donne le même calcul pour chaque véhicule.</p>
<!--mini:depPrix_63-->
<h2>Les communes de la métropole</h2>
<p>Le tableau suivant classe par distance les communes voisines qui ont un centre, avec leur médiane et leur tarif le plus bas. Avec des écarts souvent faibles, la proximité de votre domicile ou de votre travail compte autant que le prix.</p>
${x.voisinesTable(`Communes autour de Clermont-Ferrand : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>Quand passer, et après</h2>
<p>Une voiture passe son premier contrôle dans les six mois qui précèdent son quatrième anniversaire, compté depuis la date de la case B de la carte grise, puis tous les deux ans. Le mini-simulateur ci-dessous calcule votre date limite ; le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} couvre les cas particuliers.</p>
<!--mini:echeance-->
<p>${v.cv ? `Après un contrôle défavorable, la contre-visite se déclare à Clermont entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane.` : ''} Elle est à faire dans les deux mois, chez n’importe quel centre agréé : voir la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Motos, électriques, tarifs anciens</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'centre clermontois déclare', 'centres clermontois déclarent')} un tarif moto (médiane ${h.prix(v.s.m.med)})` : 'Aucun centre clermontois ne déclare de tarif moto'}${v.s15.m ? ` ; ${h.num(v.s15.m.n)} dans un rayon de 15 km` : ''}. ${v.s.el ? `Pour une électrique, la médiane de la ville est de ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} l’essence.` : ''} ${v.ancien != null ? `${h.pct(v.ancien, 0)} des centres de la ville déclarent un tarif voiture antérieur à 2023 : l’astérisque de la liste les signale, et le prix affiché au centre l’emporte.` : ''} Pour d’autres pistes d’économie, voir ${h.a('controle-technique-pas-cher', 'payer son contrôle moins cher')} ; pour la grande ville la plus proche, la page ${h.a('controle-technique-lyon', 'Lyon')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-clermont-ferrand',
    nav: 'Clermont-Ferrand',
    card: 'Clermont-Ferrand, the Limagne and the rest of the Puy-de-Dôme: every centre’s price.',
    title: 'Contrôle technique in Clermont-Ferrand: centre prices',
    description: 'Contrôle technique prices in Clermont-Ferrand: every centre in the city and metro area, the Puy-de-Dôme median, the cheapest, re-checks and when tests are due.',
    h1: 'Contrôle technique in Clermont-Ferrand: price by centre',
    intro: 'The prices centres in Clermont-Ferrand and its metropolitan area declare to the DGCCRF, and what that means in a largely rural Puy-de-Dôme.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `Clermont-Ferrand has ${x.nb(x.e!.n, 'contrôle technique centre', 'contrôle technique centres')} declaring a car price, and its metropolitan area a few more: ${h.num(x.e15!.n)} within a 15 km radius. The median for a petrol car test (the contrôle technique is France’s compulsory roadworthiness test) is ${h.prix(x.e!.med)} in the city, from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)} depending on the centre, and ${h.prix(x.e15!.med)} within 15 km. That is ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}) and ${x.cmp(x.e!.med, x.depMed)} the Puy-de-Dôme median (${h.prix(x.depMed)}). The Clermont radius alone holds ${h.pct(part15(h), 0)} of the département’s ${h.num(x.dep.centres)} centres: elsewhere, from Thiers to Issoire or up in the hills, they are thinly spread. ${v.moinsCher ? `The cheapest centre in the city declares ${h.prix(v.moinsCher.p)}.` : ''} All these figures are recalculated every day from the centres’ declarations to the DGCCRF (file of ${x.fichier}).`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v, md = minDep(h);
      return [
        { q: 'How much is a contrôle technique in Clermont-Ferrand?', a: (`For a petrol or diesel car the median across Clermont centres is ${h.prix(x.e!.med)}${v.s.el ? `, and ${h.prix(v.s.el.med)} for an electric car` : ''}. Prices run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. Diesel is charged the same as petrol at most centres.`) + ` Each centre sets its own price and declares it on the public price site, so check the date shown next to each Clermont tariff.` },
        { q: 'Where is the cheapest contrôle technique in the Puy-de-Dôme?', a: md ? `In today’s file the lowest price in the département for a petrol car is ${h.prix(md.p)}, in ${md.v}. The ranking changes as soon as a centre alters its price: the tool, set to your town and vehicle, always shows the current state.` : 'Today’s file does not single out a centre; the tool, set to your town, shows the current state.' },
        { q: 'Do I need to come to Clermont-Ferrand for a test if I live in the Auvergne hills?', a: `Not necessarily. The département has ${h.num(x.dep.centres)} centres, ${h.pct(part15(h), 0)} of them within 15 km of Clermont. The rest are spread across the mid-sized towns. Type your town into the tool: it widens the search until it finds at least five centres.` },
        { q: 'What does a re-inspection cost in Clermont-Ferrand?', a: (v.cv ? `Clermont centres declare it between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} say it can be free.` : 'None says it can be free in today’s file.'} The deadline is two months after the failed test, at the centre of your choice.` : 'The file gives no re-inspection price for the city; the deadline is two months, at the centre of your choice.') + ` Past that deadline, the re-inspection is no longer possible and the car needs a full new test at the standard price.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      return `<h2>The metropolitan area at the foot of the volcanoes</h2>
<p>Clermont-Ferrand lies at the foot of the Chaîne des Puys volcanoes, at the edge of the Limagne plain. Its metropolitan area takes in some twenty towns, from Gerzat and Cébazat in the north to Aubière, Romagnat and Cournon-d’Auvergne in the south and east. That is where most inspection centres are: ${x.nb(x.e!.n, 'centre', 'centres')} for cars in Clermont itself, ${h.num(x.e15!.n)} within 15 km.</p>
<p>Between the city and its surroundings, the Clermont median is ${x.cmp(x.e!.med, x.e15!.med)} the radius median. ${m15 ? (m15.v === v.nom ? `The lowest price in the whole radius is in Clermont itself (${h.prix(m15.p)}).` : `The lowest price in the radius is in ${m15.v} (${h.prix(m15.p)}).`) : ''} The gap between the cheapest and dearest centre in the city is ${h.prix(x.e!.max - x.e!.min)}.</p>
${x.vehTable(`Median price by vehicle in Clermont-Ferrand, within 15 km and in France, file of ${x.fichier}`)}
<h2>A two-speed Puy-de-Dôme</h2>
<p>The Puy-de-Dôme has ${h.num(x.dep.centres)} centres, and ${h.pct(part15(h), 0)} of them are less than 15 km from Clermont. In the rest of the département, centres are in the mid-sized towns (Riom, Thiers, Issoire, Ambert) and a few large villages; in the Sancy or Livradois hills you often have to drive several dozen kilometres. The tool automatically widens its search to show at least five centres, whatever town you type.</p>
<p>The département median, ${h.prix(x.depMed)} for a petrol car, ranks the Puy-de-Dôme ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, ${x.cmp(x.depMed, x.natMed)} the national median. The ${h.a('departements', 'département ranking')} does the same sum for every vehicle.</p>
<!--mini:depPrix_63-->
<h2>The towns of the metropolitan area</h2>
<p>The next table lists neighbouring towns with a centre by distance, with their median and lowest price. With gaps that are often small, being close to home or work matters as much as the price.</p>
${x.voisinesTable(`Towns around Clermont-Ferrand: price of a petrol car test, file of ${x.fichier}`)}
<h2>When to go, and what comes next</h2>
<p>A car takes its first test in the six months before its fourth anniversary, counted from the date in box B of the registration certificate (carte grise), then every two years. The mini calculator below works out your deadline; the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')} covers special cases.</p>
<!--mini:echeance-->
<p>${v.cv ? `After a failed test, the re-inspection (contre-visite) is declared in Clermont between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median.` : ''} It must be done within two months, at any approved centre: see the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Motorbikes, electric cars, old prices</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'Clermont centre declares', 'Clermont centres declare')} a motorcycle price (median ${h.prix(v.s.m.med)})` : 'No Clermont centre declares a motorcycle price'}${v.s15.m ? `; ${h.num(v.s15.m.n)} within 15 km` : ''}. ${v.s.el ? `For an electric car the city median is ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} petrol.` : ''} ${v.ancien != null ? `${h.pct(v.ancien, 0)} of the city’s centres declare a car price from before 2023: the asterisk in the list flags them, and the price displayed at the centre prevails.` : ''} For more ways to save, see ${h.a('controle-technique-pas-cher', 'paying less for your test')}; for the nearest big city, the ${h.a('controle-technique-lyon', 'Lyon page')}.</p>`;
    },
  },
});

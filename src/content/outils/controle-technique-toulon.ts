import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'toulon';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

export default defineGuide({
  id: 'controle-technique-toulon',
  group: 'villes',
  order: 12,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-pas-cher', 'contre-visite', 'controle-technique-electrique', 'controle-technique-nice'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-toulon',
    nav: 'Toulon',
    card: 'Les rares centres de Toulon et la quarantaine de centres autour de la rade.',
    title: 'Contrôle technique à Toulon : prix des centres de la rade',
    description: 'Prix du contrôle technique à Toulon et autour de la rade : chaque centre agréé, médiane de la ville et du Var, le moins cher à 15 km, contre-visite, électrique.',
    h1: 'Contrôle technique à Toulon : les prix autour de la rade',
    intro: 'Le tarif que chaque centre de Toulon et des communes de la rade déclare à la DGCCRF, du moins cher au plus cher, sans rendez-vous à prendre ici.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      return `Toulon ne compte que ${x.nb(v.n, 'centre de contrôle technique agréé', 'centres de contrôle technique agréés')} pour les voitures dans les limites de la commune, alors que ${h.num(v.n15)} centres déclarent un prix dans un rayon de 15 km autour de la rade. Dans la ville, le contrôle d’une voiture essence se paie ${h.prix(x.e!.med)} en médiane, de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} ; dans le rayon de 15 km, la médiane est de ${h.prix(x.e15!.med)}, soit une commune ${x.cmp(x.e!.med, x.e15!.med)} ses alentours. Le Var dans son ensemble se situe ${x.cmp(x.depMed, x.natMed)} la médiane nationale de ${h.prix(x.natMed)}. ${m15 ? `Le centre le moins cher du rayon, à ${m15.v}, annonce ${h.prix(m15.p)}.` : ''} Ces montants sont ceux que chaque centre a lui-même déclarés dans le fichier public de la DGCCRF, relu ce jour (${x.fichier}) : ni sondage, ni devis. Choisissez votre véhicule et votre distance dans l’outil pour lister les centres de La Seyne, de La Garde ou de La Valette comme ceux de Toulon.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Combien de centres de contrôle technique y a-t-il dans Toulon même ?', a: `Le fichier du jour en recense ${h.num(v.n)} dans la commune, ce qui est très peu pour une ville de cette taille : la plupart des centres de l’agglomération sont installés dans les communes voisines, où l’on trouve plus facilement des locaux assez grands. Dans un rayon de 15 km, ils sont ${h.num(v.n15)}.` },
        { q: 'Le contrôle technique est-il moins cher à Toulon que dans le reste du Var ?', a: `Aujourd’hui, la médiane de Toulon (${h.prix(x.e!.med)}) est ${x.cmp(x.e!.med, x.depMed)} celle du Var (${h.prix(x.depMed)}). Avec si peu de centres dans la commune, un seul changement de tarif suffit à déplacer cette médiane : le chiffre est recalculé à chaque mise à jour du fichier.` },
        { q: 'Où faire contrôler une moto à Toulon ?', a: v.s.m ? `${x.nb(v.s.m.n, 'centre de Toulon déclare', 'centres de Toulon déclarent')} un tarif moto, avec une médiane de ${h.prix(v.s.m.med)}. Dans les 15 km, choisissez « Moto » dans l’outil pour voir les centres équipés et leurs prix.` : `Aucun centre de la commune ne déclare de tarif moto dans le fichier du jour. Dans un rayon de 15 km, ${v.s15.m ? `${h.num(v.s15.m.n)} centres le font, avec une médiane de ${h.prix(v.s15.m.med)}` : 'l’offre reste très réduite'}. Choisissez « Moto » dans l’outil et élargissez la distance pour les trouver.` },
        { q: 'La contre-visite est-elle gratuite dans les centres de Toulon ?', a: (v.cv ? `Les centres de Toulon déclarent une contre-visite entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} d’entre eux annoncent une gratuité possible.` : 'Aucun n’annonce de gratuité dans le fichier du jour.'} Vous pouvez la faire dans un autre centre que celui du premier contrôle.` : 'Le fichier du jour ne donne pas de prix de contre-visite pour les centres de la commune. Demandez-le avant le contrôle : c’est souvent là que se joue l’écart de prix entre deux centres.') + ` Seules les défaillances relevées au premier passage sont revérifiées, dans les deux mois suivant le contrôle défavorable.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      const vois = v.voisines.slice(0, 3).map((c) => c.nom).join(', ');
      return `<h2>Peu de centres dans la ville, beaucoup autour de la rade</h2>
<p>Toulon est serrée entre le mont Faron et la mer, avec un centre ancien dense et un port militaire qui occupe une large part du littoral. Les centres de contrôle technique, qui demandent une ligne couverte et de la place pour manœuvrer, se sont installés ailleurs : dans les communes qui bordent la rade et le long des axes vers l’est et l’ouest. Résultat, le fichier ne compte que ${x.nb(v.n, 'centre', 'centres')} à Toulon même, et les plus proches se trouvent à ${vois}.</p>
<p>Pour un automobiliste toulonnais, la vraie question n’est donc pas le prix dans la commune, mais le prix dans un rayon raisonnable. Avec ${h.num(v.n15)} centres à moins de 15 km, la concurrence existe bien, et l’écart entre le moins cher et le plus cher du rayon atteint ${h.prix(x.e15!.max - x.e15!.min)} pour une voiture essence. ${m15 ? `Le plus bas, ${h.prix(m15.p)}, est affiché à ${m15.v}.` : ''}</p>
${x.vehTable(`Prix médian par véhicule à Toulon, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>Le Var se compare mal ou bien selon le véhicule</h2>
<p>Avec ${h.num(x.dep.centres)} centres, le Var est l’un des départements les mieux équipés du Sud-Est. Sa médiane pour une voiture essence, ${h.prix(x.depMed)}, le place au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, classés du moins cher au plus cher. Elle est ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Le tableau ci-dessus montre que l’écart n’est pas le même pour tous les véhicules : l’électrique, le gaz ou le camping-car, contrôlés par moins de centres, ont leur propre hiérarchie.</p>
<!--mini:devis_83-->
<h2>Les communes de la rade, une à une</h2>
<p>Le tableau suivant classe les communes voisines par distance du centre de Toulon, avec le nombre de centres qui y déclarent un prix voiture, leur médiane et le tarif le plus bas. La Seyne-sur-Mer et l’ouest de la rade, La Garde et La Valette à l’est : chacun a ses habitudes de trajet, et un centre sur le chemin du travail vaut souvent mieux qu’un centre moins cher à l’autre bout de l’agglomération.</p>
${x.voisinesTable(`Communes autour de Toulon : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<p>Comptez une demi-heure à trois quarts d’heure sur place pour une voiture. Beaucoup de centres de la rade travaillent sur rendez-vous ; ce site n’en prend aucun, il vous laisse appeler le centre retenu.</p>
<h2>Hybride et électrique : un supplément fréquent</h2>
<p>${v.s.el ? `Dans Toulon, la médiane pour une voiture électrique est de ${h.prix(v.s.el.med)}, contre ${h.prix(x.e!.med)} pour l’essence.` : 'Les centres de Toulon déclarent peu de tarifs pour l’électrique.'} ${v.s15.el ? `Dans les 15 km, elle est de ${h.prix(v.s15.el.med)}.` : ''} Aucun texte n’oblige un centre à facturer davantage une voiture électrique, mais beaucoup le font. Si votre voiture est hybride ou électrique, changez le véhicule dans l’outil : l’ordre des centres change, et certains appliquent le même prix à toutes les motorisations. La page ${h.a('controle-technique-electrique', 'contrôle technique d’une voiture électrique')} détaille ce qui est vérifié.</p>
<h2>Motos et scooters : regarder hors de la commune</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'centre toulonnais déclare', 'centres toulonnais déclarent')} un tarif moto (médiane ${h.prix(v.s.m.med)}).` : 'Aucun centre de la commune ne déclare de tarif pour les motos dans le fichier du jour.'} ${v.s15.m ? `Dans un rayon de 15 km, ${x.nb(v.s15.m.n, 'centre est équipé', 'centres sont équipés')}, pour une médiane de ${h.prix(v.s15.m.med)}.` : 'Il faut élargir la recherche au-delà de 15 km.'} Depuis 2024, les deux-roues passent eux aussi le contrôle, selon un calendrier qui dépend de leur année de mise en circulation : voir le ${h.a('controle-technique-moto', 'guide moto')}.</p>
<h2>Contre-visite et prix anciens</h2>
<p>${v.cv ? `Après un contrôle défavorable, les centres de Toulon facturent la contre-visite entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane.` : 'Le fichier ne donne pas de prix de contre-visite pour les centres de Toulon.'} Elle doit être faite dans les deux mois, dans le centre de votre choix ; la page ${h.a('contre-visite', 'contre-visite')} explique les délais et les cas de gratuité. ${v.ancien != null ? `Enfin, ${h.pct(v.ancien, 0)} des centres de la commune déclarent un tarif voiture daté d’avant 2023 : un astérisque les signale dans la liste, et c’est le prix affiché sur place qui s’applique.` : ''}</p>
<p>Pour aller plus loin : le ${h.a('departements', 'classement des départements')}, les conseils pour un ${h.a('controle-technique-pas-cher', 'contrôle technique moins cher')} et, sur la côte, la page de ${h.a('controle-technique-nice', 'Nice')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-toulon',
    nav: 'Toulon',
    card: 'The few centres inside Toulon and the forty or so around the harbour.',
    title: 'Contrôle technique in Toulon: prices around the harbour',
    description: 'Contrôle technique prices in Toulon and around its harbour: every approved centre, city and Var medians, the cheapest within 15 km, re-inspection and EV prices.',
    h1: 'Contrôle technique in Toulon: prices around the harbour',
    intro: 'The price each centre in Toulon and the harbour towns declares to the DGCCRF, from cheapest to dearest, with nothing to book here.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      return `Toulon has only ${x.nb(v.n, 'approved contrôle technique centre', 'approved contrôle technique centres')} for cars within the town limits, while ${h.num(v.n15)} centres declare a price within 15 km of the harbour. In town, a petrol car test (the contrôle technique is France’s compulsory roadworthiness test) costs ${h.prix(x.e!.med)} at the median, from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}; within 15 km the median is ${h.prix(x.e15!.med)}, so the town is ${x.cmp(x.e!.med, x.e15!.med)} its surroundings. The Var département as a whole sits ${x.cmp(x.depMed, x.natMed)} the national median of ${h.prix(x.natMed)}. ${m15 ? `The cheapest centre in the radius, in ${m15.v}, charges ${h.prix(m15.p)}.` : ''} These amounts are what each centre has declared itself in the DGCCRF’s public file, read today (${x.fichier}): no survey, no quotes. Pick your vehicle and distance in the tool to list centres in La Seyne, La Garde or La Valette as well as Toulon.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'How many contrôle technique centres are there in Toulon itself?', a: (`Today’s file lists ${h.num(v.n)} in the town, very few for a city this size: most centres in the area are in the neighbouring towns, where premises big enough are easier to find. Within 15 km there are ${h.num(v.n15)}.`) + ` Use the tool with a 15 km radius to include La Valette-du-Var and the other neighbouring towns, sorted by price.` },
        { q: 'Is the contrôle technique cheaper in Toulon than elsewhere in the Var?', a: (`Today the Toulon median (${h.prix(x.e!.med)}) is ${x.cmp(x.e!.med, x.depMed)} the Var median (${h.prix(x.depMed)}). With so few centres in town, one price change is enough to move it: the figure is recalculated at every update of the file.`) + ` Check the date shown next to each Toulon price: a tariff that has not been updated for a long time may no longer match the counter.` },
        { q: 'Where can I get a motorcycle tested in Toulon?', a: (v.s.m ? `${x.nb(v.s.m.n, 'Toulon centre declares', 'Toulon centres declare')} a motorcycle price, with a median of ${h.prix(v.s.m.med)}. Within 15 km, pick “Motorcycle” in the tool to see the equipped centres and their prices.` : `No centre in the town declares a motorcycle price in today’s file. Within 15 km, ${v.s15.m ? `${h.num(v.s15.m.n)} centres do, with a median of ${h.prix(v.s15.m.med)}` : 'the choice is very limited'}. Pick “Motorcycle” in the tool and widen the distance to find them.`) + ` The motorcycle test covers braking, lighting, tyres and noise level, among other points.` },
        { q: 'Is the re-inspection free at Toulon centres?', a: (v.cv ? `Toulon centres declare a re-inspection (contre-visite) between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} of them say it can be free.` : 'None says it can be free in today’s file.'} You may take it at a different centre from the original test.` : 'Today’s file gives no re-inspection price for centres in the town. Ask before the test: that is often where two centres differ most.') + ` Only the defects noted at the first visit are rechecked there, within two months of the failed test.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      const vois = v.voisines.slice(0, 3).map((c) => c.nom).join(', ');
      return `<h2>Few centres in town, many around the harbour</h2>
<p>Toulon is squeezed between Mont Faron and the sea, with a dense old centre and a naval base taking up much of the waterfront. Inspection centres, which need a covered test lane and room to manoeuvre, have settled elsewhere: in the towns around the harbour and along the roads east and west. As a result the file lists only ${x.nb(v.n, 'centre', 'centres')} in Toulon itself, and the nearest others are in ${vois}.</p>
<p>For a Toulon driver, then, the real question is not the price in town but the price within a sensible distance. With ${h.num(v.n15)} centres less than 15 km away there is real competition, and the gap between the cheapest and the dearest in that radius reaches ${h.prix(x.e15!.max - x.e15!.min)} for a petrol car. ${m15 ? `The lowest, ${h.prix(m15.p)}, is in ${m15.v}.` : ''}</p>
${x.vehTable(`Median price by vehicle in Toulon, within 15 km and in France, file of ${x.fichier}`)}
<h2>How the Var compares depends on the vehicle</h2>
<p>With ${h.num(x.dep.centres)} centres, the Var is one of the best-served départements in the south-east. Its median for a petrol car, ${h.prix(x.depMed)}, ranks it ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest. It is ${x.cmp(x.depMed, x.natMed)} the national median. The table above shows the gap is not the same for every vehicle: electric cars, gas cars and motorhomes, tested by fewer centres, have their own pecking order.</p>
<!--mini:devis_83-->
<h2>The harbour towns, one by one</h2>
<p>The next table lists neighbouring towns by distance from central Toulon, with the number of centres declaring a car price there, their median and the lowest price. La Seyne-sur-Mer and the west of the harbour, La Garde and La Valette to the east: everyone has their usual routes, and a centre on the way to work is often better value than a cheaper one on the far side of the conurbation.</p>
${x.voisinesTable(`Towns around Toulon: price of a petrol car test, file of ${x.fichier}`)}
<p>Allow thirty to forty-five minutes on site for a car. Many centres around the harbour work by appointment; this site books nothing and leaves you to call the centre you choose.</p>
<h2>Hybrid and electric: a frequent surcharge</h2>
<p>${v.s.el ? `In Toulon the median for an electric car is ${h.prix(v.s.el.med)}, against ${h.prix(x.e!.med)} for petrol.` : 'Toulon centres declare few electric-car prices.'} ${v.s15.el ? `Within 15 km it is ${h.prix(v.s15.el.med)}.` : ''} No rule makes a centre charge more for an electric car, but many do. If yours is hybrid or electric, change the vehicle in the tool: the order of centres changes, and some charge the same for every engine type. The page on ${h.a('controle-technique-electrique', 'testing an electric car')} explains what is checked.</p>
<h2>Motorbikes and scooters: look beyond the town</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'Toulon centre declares', 'Toulon centres declare')} a motorcycle price (median ${h.prix(v.s.m.med)}).` : 'No centre in the town declares a motorcycle price in today’s file.'} ${v.s15.m ? `Within 15 km, ${x.nb(v.s15.m.n, 'centre is equipped', 'centres are equipped')}, for a median of ${h.prix(v.s15.m.med)}.` : 'You need to search beyond 15 km.'} Since 2024 two-wheelers must pass the test too, on a timetable set by their year of first registration: see the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>Re-inspection and old prices</h2>
<p>${v.cv ? `After a failed test, Toulon centres charge between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} for the re-inspection at the median.` : 'The file gives no re-inspection price for Toulon centres.'} It must be done within two months, at the centre of your choice; the ${h.a('contre-visite', 're-inspection page')} explains deadlines and when it can be free. ${v.ancien != null ? `Finally, ${h.pct(v.ancien, 0)} of the town’s centres declare a car price dated before 2023: an asterisk flags them in the list, and the price displayed on site is the one that applies.` : ''}</p>
<p>Further reading: the ${h.a('departements', 'département ranking')}, tips for a ${h.a('controle-technique-pas-cher', 'cheaper contrôle technique')} and, along the coast, the ${h.a('controle-technique-nice', 'Nice page')}.</p>`;
    },
  },
});

import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'reims';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

export default defineGuide({
  id: 'controle-technique-reims',
  group: 'villes',
  order: 13,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'quand-faire-controle-technique', 'contre-visite', 'controle-technique-moto', 'controle-technique-lille'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-reims',
    nav: 'Reims',
    card: 'Les centres de Reims et de sa couronne, prix déclarés du jour, Marne comprise.',
    title: 'Contrôle technique à Reims : prix des centres, le moins cher',
    description: 'Prix du contrôle technique à Reims : tarif de chaque centre de la ville et de sa couronne, médiane de la Marne, le moins cher, contre-visite et moto du jour.',
    h1: 'Contrôle technique à Reims : le prix de chaque centre',
    intro: 'Ce que chaque centre rémois et des communes de la couronne déclare comme tarif à la DGCCRF, classé par prix puis par distance.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `À Reims, le fichier des prix compte ${x.nb(v.n, 'centre de contrôle technique', 'centres de contrôle technique')} qui déclarent un tarif pour les voitures, et ${h.num(v.n15)} dans un rayon de 15 km. Un contrôle de voiture essence ou diesel y coûte ${h.prix(x.e!.med)} en médiane, entre ${h.prix(x.e!.min)} et ${h.prix(x.e!.max)} selon le centre : la ville est ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}) et ${x.cmp(x.e!.med, x.depMed)} la médiane de la Marne (${h.prix(x.depMed)}). ${v.moinsCher ? `Le centre le moins cher de la commune affiche ${h.prix(v.moinsCher.p)}, soit ${h.prix(x.e!.med - v.moinsCher.p)} de moins que la médiane rémoise.` : ''} Les prix viennent de la déclaration que chaque centre adresse à la DGCCRF et que l’État publie en données ouvertes ; ce site relit ce fichier chaque jour (dernier fichier : ${x.fichier}). Pour une électrique, une moto ou un camping-car, changez le véhicule dans l’outil : les centres équipés ne sont pas les mêmes et l’ordre de la liste change.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Quel est le prix moyen d’un contrôle technique à Reims ?', a: `Sur les ${h.num(v.n)} centres de la commune, la moyenne est de ${h.prix(x.e!.moy)} et la médiane de ${h.prix(x.e!.med)} pour une voiture essence. La médiane, qui laisse la moitié des centres de chaque côté, est plus fiable quand il y a peu de centres. Dans le rayon de 15 km, elle est de ${h.prix(x.e15!.med)}.` },
        { q: 'Les communes autour de Reims sont-elles moins chères pour le contrôle ?', a: `Aujourd’hui, la médiane de Reims est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon de 15 km. Le tableau des communes voisines donne le détail, de ${v.voisines.slice(0, 3).map((c) => c.nom).join(', ')} aux plus éloignées, avec la médiane et le tarif le plus bas de chacune : c’est là qu’on voit si le détour en vaut la peine.` },
        { q: 'Peut-on passer le contrôle technique d’une moto à Reims ?', a: (v.s.m ? `Oui : ${x.nb(v.s.m.n, 'centre rémois déclare', 'centres rémois déclarent')} un tarif moto, avec une médiane de ${h.prix(v.s.m.med)}.` : `Le fichier du jour ne contient aucun tarif moto pour un centre de la commune. ${v.s15.m ? `Dans les 15 km, ${x.nb(v.s15.m.n, 'centre en déclare un', 'centres en déclarent un')}, médiane ${h.prix(v.s15.m.med)}.` : 'Il faut chercher plus loin.'} Choisissez « Moto » dans l’outil et augmentez la distance.`) + ` Les centres rémois équipés contrôlent notamment le freinage, l’éclairage, les pneus et le niveau sonore.` },
        { q: 'Combien coûte la contre-visite dans les centres de Reims ?', a: (v.cv ? `Les centres de Reims déclarent une contre-visite entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane, selon qu’il suffit d’un contrôle visuel ou qu’il faut repasser sur les bancs. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} annoncent une gratuité possible.` : 'Aucun n’annonce de gratuité dans le fichier du jour.'}` : 'Le fichier du jour ne donne pas de prix de contre-visite pour Reims : demandez-le au centre avant le contrôle.') + ` Au-delà de deux mois, il faut repasser un contrôle complet au tarif normal.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      return `<h2>Reims, une offre resserrée autour de la ville</h2>
<p>La cité des sacres est le principal pôle de la Marne, plus peuplé que Châlons-en-Champagne, la préfecture. Ses centres de contrôle technique se répartissent entre les quartiers et les zones commerciales qui bordent la rocade, et une couronne de communes proches en accueille d’autres. Le fichier en dénombre ${h.num(v.n)} dans Reims même et ${h.num(v.n15)} à moins de 15 km : une offre suffisante pour comparer, mais sans l’abondance des grandes métropoles.</p>
<p>La dispersion des prix reste mesurée : l’écart entre le centre le moins cher et le plus cher de la commune est de ${h.prix(x.e!.max - x.e!.min)} pour une voiture essence. ${m15 ? (m15.v === v.nom ? `Le moins cher de tout le rayon de 15 km se trouve dans Reims même, à ${h.prix(m15.p)}.` : `Le moins cher du rayon de 15 km est à ${m15.v}, à ${h.prix(m15.p)}.`) : ''} Comparer vaut donc surtout pour éviter les tarifs du haut de la fourchette.</p>
${x.vehTable(`Prix médian par véhicule à Reims, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>La Marne dans le classement national</h2>
<p>Avec ${h.num(x.dep.centres)} centres, la Marne a une médiane de ${h.prix(x.depMed)} pour une voiture essence. Elle se classe ${r.i}${r.i === 1 ? 'er' : 'e'} sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher, et se situe ${x.cmp(x.depMed, x.natMed)} la médiane de la France. Épernay, Châlons et Vitry-le-François ont leurs propres centres : si vous travaillez dans l’une de ces villes, tapez-la dans l’outil pour comparer.</p>
<!--mini:depPrix_51-->
<h2>Les communes de la couronne rémoise</h2>
<p>Les communes qui touchent Reims accueillent souvent un centre dans leur zone d’activités. Le tableau les classe par distance, avec leur médiane et leur tarif le plus bas. Une différence de deux ou trois euros ne justifie pas un détour, mais un centre sur votre trajet habituel peut faire gagner du temps autant que de l’argent.</p>
${x.voisinesTable(`Communes autour de Reims : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>Électrique, hybride et gaz</h2>
<p>${v.s.el ? `Pour une voiture électrique, la médiane rémoise est de ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} l’essence.` : 'Les centres de Reims déclarent peu de tarifs pour l’électrique.'} Le supplément n’a pas de base réglementaire : c’est un choix commercial du centre. Pour les voitures au GPL ou au GNV, le contrôle ajoute l’examen de l’installation de gaz, ce qui explique un prix plus élevé là où il est déclaré. Le tableau par véhicule ci-dessus donne les médianes de chaque motorisation, et la page ${h.a('controle-technique-electrique', 'voiture électrique')} explique ce qui est contrôlé.</p>
<h2>Les deux-roues</h2>
<p>${v.s.m ? `Dans la commune, ${x.nb(v.s.m.n, 'centre déclare', 'centres déclarent')} un tarif moto, avec une médiane de ${h.prix(v.s.m.med)}.` : 'Aucun centre de la commune ne déclare encore de tarif moto dans le fichier du jour.'} ${v.s15.m ? `Dans les 15 km, ${x.nb(v.s15.m.n, 'centre le fait', 'centres le font')}.` : ''} Les motos, scooters et quads doivent pourtant passer le contrôle depuis 2024 : les plus anciens sont déjà en retard, ceux de 2020 et 2021 doivent passer en 2026. Le ${h.a('controle-technique-moto', 'guide du contrôle moto')} donne le calendrier exact.</p>
<h2>Échéance, contre-visite et tarifs anciens</h2>
<p>Une voiture passe son premier contrôle dans les six mois qui précèdent son quatrième anniversaire, puis tous les deux ans ; le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} calcule la date. ${v.cv ? `En cas d’échec, la contre-visite se paie à Reims entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane, dans les deux mois, chez le centre de votre choix (${h.a('contre-visite', 'détails')}).` : `En cas d’échec, la contre-visite doit être faite dans les deux mois (${h.a('contre-visite', 'détails')}).`}</p>
<p>${v.ancien != null ? `${h.pct(v.ancien, 0)} des centres rémois déclarent un tarif voiture antérieur à 2023. Ces prix ne sont pas forcément faux, mais ils datent : la liste les marque d’un astérisque, et le prix affiché au centre l’emporte.` : ''} Pour une autre grande ville du Nord-Est, voir ${h.a('controle-technique-lille', 'Lille')} ; pour comparer les départements, le ${h.a('departements', 'classement complet')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-reims',
    nav: 'Reims',
    card: 'Centres in Reims and the surrounding towns, today’s declared prices, Marne included.',
    title: 'Contrôle technique in Reims: centre prices, the cheapest',
    description: 'Contrôle technique prices in Reims: each centre in the city and nearby towns, the Marne median, the cheapest, re-inspection and motorbikes. Daily price file.',
    h1: 'Contrôle technique in Reims: every centre’s price',
    intro: 'What each centre in Reims and the surrounding towns declares as its price to the DGCCRF, sorted by price and then distance.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `In Reims the price file lists ${x.nb(v.n, 'contrôle technique centre', 'contrôle technique centres')} declaring a car price, and ${h.num(v.n15)} within a 15 km radius. A petrol or diesel car test (the contrôle technique is France’s compulsory roadworthiness test) costs ${h.prix(x.e!.med)} at the median there, between ${h.prix(x.e!.min)} and ${h.prix(x.e!.max)} depending on the centre: the city is ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}) and ${x.cmp(x.e!.med, x.depMed)} the Marne median (${h.prix(x.depMed)}). ${v.moinsCher ? `The cheapest centre in the city charges ${h.prix(v.moinsCher.p)}, ${h.prix(x.e!.med - v.moinsCher.p)} below the Reims median.` : ''} Prices come from the declaration each centre sends to the DGCCRF, the consumer authority, which the state publishes as open data; this site rereads the file every day (latest file: ${x.fichier}). For an electric car, a motorbike or a motorhome, change the vehicle in the tool: the equipped centres differ and the order of the list changes.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'What does a contrôle technique cost on average in Reims?', a: `Across the ${h.num(v.n)} centres in the city, the average is ${h.prix(x.e!.moy)} and the median ${h.prix(x.e!.med)} for a petrol car. The median, with half the centres on each side, is more reliable when there are few centres. Within 15 km it is ${h.prix(x.e15!.med)}.` },
        { q: 'Are the towns around Reims cheaper for the test?', a: `Today the Reims median is ${x.cmp(x.e!.med, x.e15!.med)} the 15 km median. The table of neighbouring towns gives the detail, from ${v.voisines.slice(0, 3).map((c) => c.nom).join(', ')} to the furthest, with each one’s median and lowest price: that is where you see whether the detour is worth it.` },
        { q: 'Can I get a motorbike tested in Reims?', a: (v.s.m ? `Yes: ${x.nb(v.s.m.n, 'Reims centre declares', 'Reims centres declare')} a motorcycle price, with a median of ${h.prix(v.s.m.med)}.` : `Today’s file has no motorcycle price for a centre in the city. ${v.s15.m ? `Within 15 km, ${x.nb(v.s15.m.n, 'centre declares one', 'centres declare one')}, median ${h.prix(v.s15.m.med)}.` : 'You need to look further afield.'} Pick “Motorcycle” in the tool and increase the distance.`) + ` Reims centres equipped for two-wheelers check braking, lighting, tyres and noise level, among other points; pick “Motorcycle” in the tool to sort them by price.` },
        { q: 'How much is a re-inspection at Reims centres?', a: (v.cv ? `Reims centres declare a re-inspection (contre-visite) between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median, depending on whether a visual check is enough or the car must go back on the equipment. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} say it can be free.` : 'None says it can be free in today’s file.'}` : 'Today’s file gives no re-inspection price for Reims: ask the centre before the test.') + ` Past the two-month deadline, a full test at the standard price is required again.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d), m15 = v.moinsCher15;
      return `<h2>Reims: a compact choice around the city</h2>
<p>The city where French kings were crowned is the Marne’s main hub, larger than Châlons-en-Champagne, the prefecture. Its inspection centres are spread between the districts and the retail parks along the ring road, and a ring of nearby towns has more. The file counts ${h.num(v.n)} in Reims itself and ${h.num(v.n15)} within 15 km: enough to compare, without the abundance of the big metropolitan areas.</p>
<p>Prices are fairly tight: the gap between the cheapest and dearest centre in the city is ${h.prix(x.e!.max - x.e!.min)} for a petrol car. ${m15 ? (m15.v === v.nom ? `The cheapest in the whole 15 km radius is in Reims itself, at ${h.prix(m15.p)}.` : `The cheapest in the 15 km radius is in ${m15.v}, at ${h.prix(m15.p)}.`) : ''} Comparing mostly helps you avoid the top of the range.</p>
${x.vehTable(`Median price by vehicle in Reims, within 15 km and in France, file of ${x.fichier}`)}
<h2>The Marne in the national ranking</h2>
<p>With ${h.num(x.dep.centres)} centres, the Marne has a median of ${h.prix(x.depMed)} for a petrol car. It ranks ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, and sits ${x.cmp(x.depMed, x.natMed)} the French median. Épernay, Châlons and Vitry-le-François have their own centres: if you work in one of them, type it into the tool to compare.</p>
<!--mini:depPrix_51-->
<h2>The towns around Reims</h2>
<p>Towns bordering Reims often have a centre in their business area. The table lists them by distance, with their median and lowest price. Two or three euros do not justify a detour, but a centre on your usual route can save time as well as money.</p>
${x.voisinesTable(`Towns around Reims: price of a petrol car test, file of ${x.fichier}`)}
<h2>Electric, hybrid and gas</h2>
<p>${v.s.el ? `For an electric car the Reims median is ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} petrol.` : 'Reims centres declare few electric-car prices.'} The surcharge has no regulatory basis: it is the centre’s commercial choice. For LPG or CNG cars the test adds a check of the gas system, which explains a higher price where one is declared. The table by vehicle above gives the median for each engine type, and the page on ${h.a('controle-technique-electrique', 'electric cars')} explains what is checked.</p>
<h2>Two-wheelers</h2>
<p>${v.s.m ? `In the city, ${x.nb(v.s.m.n, 'centre declares', 'centres declare')} a motorcycle price, with a median of ${h.prix(v.s.m.med)}.` : 'No centre in the city declares a motorcycle price yet in today’s file.'} ${v.s15.m ? `Within 15 km, ${x.nb(v.s15.m.n, 'centre does', 'centres do')}.` : ''} Motorbikes, scooters and quads have had to be tested since 2024 all the same: the oldest are already overdue, those from 2020 and 2021 are due in 2026. The ${h.a('controle-technique-moto', 'motorcycle guide')} gives the exact timetable.</p>
<h2>Due date, re-inspection and old prices</h2>
<p>A car takes its first test in the six months before its fourth anniversary, then every two years; the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')} works out the date. ${v.cv ? `If it fails, a re-inspection in Reims costs between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median, within two months, at any centre you like (${h.a('contre-visite', 'details')}).` : `If it fails, the re-inspection must be done within two months (${h.a('contre-visite', 'details')}).`}</p>
<p>${v.ancien != null ? `${h.pct(v.ancien, 0)} of Reims centres declare a car price from before 2023. Those prices are not necessarily wrong, but they are old: the list marks them with an asterisk, and the price displayed at the centre prevails.` : ''} For another large city in the north-east, see ${h.a('controle-technique-lille', 'Lille')}; to compare départements, the ${h.a('departements', 'full ranking')}.</p>`;
    },
  },
});

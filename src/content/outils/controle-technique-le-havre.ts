import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'le-havre';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Voisines situées dans le Calvados (codes postaux 14), de l'autre côté de l'estuaire. */
const calvados = (h: Helpers) => {
  const v = (h.V as unknown as Record<string, { liste: Array<[string, string, string, string, string]> }>)[SLUG];
  return [...new Set(v.liste.filter((c) => c[4] === '14').map((c) => c[3]))];
};

export default defineGuide({
  id: 'controle-technique-le-havre',
  group: 'villes',
  order: 15,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'contre-visite', 'controle-technique-moto', 'controle-technique-pas-cher', 'controle-technique-rennes'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-le-havre',
    nav: 'Le Havre',
    card: 'Les centres du Havre et de l’estuaire de la Seine, du moins cher au plus cher.',
    title: 'Contrôle technique au Havre : prix de chaque centre agréé',
    description: 'Prix du contrôle technique au Havre : chaque centre de la ville et de l’estuaire, médiane par code postal et en Seine-Maritime, le moins cher, contre-visite.',
    h1: 'Contrôle technique au Havre : prix de chaque centre',
    intro: 'Les tarifs déclarés par les centres havrais et ceux de la pointe de Caux, classés du moins cher au plus cher, avec la contre-visite.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `Au Havre, ${x.nb(v.n, 'centre de contrôle technique déclare', 'centres de contrôle technique déclarent')} un prix pour les voitures dans le fichier public de la DGCCRF, et la médiane d’un contrôle essence s’y établit à ${h.prix(x.e!.med)}, dans une fourchette de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. La ville est ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}) et ${x.cmp(x.e!.med, x.depMed)} celle de la Seine-Maritime (${h.prix(x.depMed)}). Contrairement à la plupart des grandes villes, l’essentiel de l’offre se trouve dans la commune elle-même : on ne compte que ${h.num(v.n15)} centres dans un rayon de 15 km, parce que la mer et l’estuaire de la Seine en occupent une bonne partie. ${v.moinsCher ? `Le moins cher de la ville affiche ${h.prix(v.moinsCher.p)}.` : ''} ${v.s.m ? `Pour une moto, la médiane havraise est de ${h.prix(v.s.m.med)}.` : ''} Tous ces chiffres sont recalculés chaque jour à partir des déclarations des centres (fichier du ${x.fichier}). L’outil permet de chercher depuis n’importe quelle commune de la pointe de Caux.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Combien coûte un contrôle technique au Havre ?', a: `La médiane des ${h.num(v.n)} centres havrais est de ${h.prix(x.e!.med)} pour une voiture essence, le diesel étant presque toujours au même prix. ${v.s.el ? `Comptez ${h.prix(v.s.el.med)} en médiane pour une électrique.` : ''} Les prix vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} selon le centre : comparer avant de réserver reste utile.` },
        { q: 'Le contrôle est-il moins cher sur les hauteurs du Havre ou en ville basse ?', a: (v.arr && Object.keys(v.arr).length > 1 ? `Le fichier distingue les centres par code postal : ${Object.entries(v.arr).map(([cp, s]) => `${cp}, médiane ${h.prix(s.med)}`).join(' ; ')}. Les écarts entre secteurs sont faibles au regard des écarts entre centres d’un même secteur.` : 'Le fichier ne permet pas de séparer nettement les secteurs de la ville. Les écarts entre centres d’un même quartier sont plus importants que ceux entre quartiers : la liste triée par prix est le meilleur guide.') + ` Chaque centre fixe librement son prix : comparer plusieurs centres havrais dans la liste compte davantage que le choix du quartier.` },
        { q: 'Vaut-il la peine de passer le pont de Normandie pour un contrôle moins cher ?', a: `${calvados(h).length ? `Dans le rayon de 15 km, des centres de ${calvados(h).join(', ')} figurent dans la liste.` : 'Peu de centres du Calvados sont à moins de 15 km.'} Le pont est à péage pour les voitures : l’économie sur le contrôle doit couvrir le passage aller et retour, ce qui n’arrive que si l’écart de prix est important.` },
        { q: 'Les centres du Havre font-ils la contre-visite gratuitement ?', a: (v.cv ? `${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} des centres havrais annoncent une contre-visite gratuite dans certains cas.` : 'Aucun centre havrais n’annonce de contre-visite gratuite dans le fichier du jour.'} En médiane, elle coûte entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)}, à faire dans les deux mois, dans n’importe quel centre agréé.` : 'Le fichier ne donne pas de prix de contre-visite pour Le Havre ; demandez-le au centre avant le contrôle.') + ` Demandez les conditions au centre avant le premier contrôle : le fichier indique une gratuité possible, pas les cas où elle s’applique.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d);
      const multi = v.arr && Object.keys(v.arr).length > 1;
      return `<h2>Une ville qui concentre son offre</h2>
<p>Le Havre occupe la pointe de l’estuaire de la Seine, face à la Manche. Au sud, l’estuaire et la zone industrialo-portuaire ; à l’ouest, la mer. Pour trouver beaucoup de centres, il faudrait donc aller loin vers l’est ou le nord, dans le pays de Caux. Conséquence : avec ${h.num(v.n)} centres dans la commune pour ${h.num(v.n15)} dans un rayon de 15 km, Le Havre est l’une des rares grandes villes où l’on fait son contrôle sans quitter la commune.</p>
<p>La fourchette des prix havrais pour une voiture essence s’étend de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. La médiane de la ville est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon de 15 km : les deux se confondent presque, puisque la ville fournit l’essentiel des centres du rayon.</p>
${x.vehTable(`Prix médian par véhicule au Havre, dans les 15 km et en France, fichier du ${x.fichier}`)}
${multi ? `<h2>Par code postal</h2>
<p>La ville a plusieurs codes postaux. Le tableau suivant donne, pour chacun de ceux où un centre est installé, le nombre de centres et leur médiane. Il montre surtout que l’adresse ne fait pas le prix : l’écart se joue d’un centre à l’autre.</p>
${x.arrTable(`Prix d’un contrôle voiture essence par code postal havrais, fichier du ${x.fichier}`)}` : ''}
<h2>La Seine-Maritime dans le classement</h2>
<p>La Seine-Maritime, avec ${h.num(x.dep.centres)} centres entre Le Havre, Rouen et Dieppe, a une médiane de ${h.prix(x.depMed)}. Elle se place au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, classés du moins cher au plus cher, ${x.cmp(x.depMed, x.natMed)} la médiane nationale. La page ${h.a('departements', 'des départements')} donne ce classement pour chaque véhicule, de la moto au camping-car.</p>
<!--mini:cvDept_76-->
<h2>Harfleur, Montivilliers et l’autre rive</h2>
<p>Les communes de la communauté urbaine qui ont un centre sont listées ci-dessous, par distance. Plus loin, de l’autre côté du pont de Normandie, des centres du Calvados entrent dans le rayon de 15 km${calvados(h).length ? ` (${calvados(h).join(', ')})` : ''}. Le pont étant payant pour les voitures, il ne se justifie que pour un trajet déjà prévu.</p>
${x.voisinesTable(`Communes autour du Havre : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>Motos, scooters, électriques</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'centre havrais contrôle', 'centres havrais contrôlent')} les motos, avec une médiane de ${h.prix(v.s.m.med)}${v.moinsCherMoto ? ` ; le moins cher annonce ${h.prix(v.moinsCherMoto.p)}` : ''}.` : 'Aucun centre havrais ne déclare de tarif moto dans le fichier du jour.'} Le premier contrôle d’un deux-roues dépend de son année de mise en circulation : le ${h.a('controle-technique-moto', 'guide moto')} en donne le calendrier. ${v.s.el ? `Pour une voiture électrique, la médiane locale est de ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} l’essence ; la page ${h.a('controle-technique-electrique', 'électrique')} explique pourquoi l’écart n’a rien d’obligatoire.` : ''}</p>
<h2>Après un contrôle défavorable</h2>
<p>Le climat maritime use les trains roulants et les dessous de caisse : la corrosion figure parmi les points examinés, et une défaillance majeure impose une contre-visite dans les deux mois. ${v.cv ? `Au Havre, elle est déclarée entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane.` : ''} Le détail des délais et des cas de gratuité est sur la page ${h.a('contre-visite', 'contre-visite')}. ${v.ancien != null ? `Dernier point : ${h.pct(v.ancien, 0)} des centres de la ville déclarent un tarif voiture daté d’avant 2023, signalé par un astérisque dans la liste.` : ''}</p>
<p>Pour d’autres pistes d’économie, lisez ${h.a('controle-technique-pas-cher', 'comment payer son contrôle moins cher')} ; pour une autre ville de l’Ouest, la page ${h.a('controle-technique-rennes', 'Rennes')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-le-havre',
    nav: 'Le Havre',
    card: 'Centres in Le Havre and the Seine estuary, from cheapest to dearest.',
    title: 'Contrôle technique in Le Havre: every centre’s price',
    description: 'Contrôle technique prices in Le Havre: every centre in the city and estuary, medians by postcode and for Seine-Maritime, the cheapest, motorbikes, re-checks.',
    h1: 'Contrôle technique in Le Havre: every centre’s price',
    intro: 'Prices declared by centres in Le Havre and the tip of the Pays de Caux, ranked from cheapest to dearest, with the re-inspection.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `In Le Havre, ${x.nb(v.n, 'contrôle technique centre declares', 'contrôle technique centres declare')} a car price in the DGCCRF’s public file, and the median for a petrol car test (the contrôle technique is France’s compulsory roadworthiness test) is ${h.prix(x.e!.med)}, within a range of ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. The city is ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}) and ${x.cmp(x.e!.med, x.depMed)} the Seine-Maritime median (${h.prix(x.depMed)}). Unlike most big cities, most of the choice is inside the city itself: there are only ${h.num(v.n15)} centres within 15 km, because the sea and the Seine estuary take up much of that circle. ${v.moinsCher ? `The cheapest in the city charges ${h.prix(v.moinsCher.p)}.` : ''} ${v.s.m ? `For a motorbike, the Le Havre median is ${h.prix(v.s.m.med)}.` : ''} All these figures are recalculated every day from the centres’ declarations (file of ${x.fichier}). The tool searches from any town on the tip of the Pays de Caux.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'How much is a contrôle technique in Le Havre?', a: `The median across the ${h.num(v.n)} Le Havre centres is ${h.prix(x.e!.med)} for a petrol car, with diesel nearly always the same price. ${v.s.el ? `Allow ${h.prix(v.s.el.med)} at the median for an electric car.` : ''} Prices run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)} depending on the centre, so comparing before you book still pays.` },
        { q: 'Is the test cheaper in the upper town or the lower town of Le Havre?', a: (v.arr && Object.keys(v.arr).length > 1 ? `The file separates centres by postcode: ${Object.entries(v.arr).map(([cp, s]) => `${cp}, median ${h.prix(s.med)}`).join('; ')}. The gaps between areas are small compared with the gaps between centres in the same area.` : 'The file does not clearly separate the city’s areas. Gaps between centres in the same district are bigger than gaps between districts: the list sorted by price is the best guide.') + ` Each centre sets its price freely, so comparing a few Le Havre centres in the list matters more than choosing between the upper and lower town.` },
        { q: 'Is it worth crossing the Pont de Normandie for a cheaper test?', a: (`${calvados(h).length ? `Within 15 km, centres in ${calvados(h).join(', ')} appear in the list.` : 'Few Calvados centres are within 15 km.'} The bridge has a toll for cars: the saving on the test has to cover the crossing both ways, which only happens if the price gap is large.`) + ` Check the toll rate in force before deciding, and remember that a re-inspection may mean a second crossing.` },
        { q: 'Do Le Havre centres offer a free re-inspection?', a: (v.cv ? `${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} of Le Havre centres say the re-inspection can be free in some cases.` : 'No Le Havre centre says the re-inspection can be free in today’s file.'} At the median it costs between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)}, to be done within two months at any approved centre.` : 'The file gives no re-inspection price for Le Havre; ask the centre before the test.') + ` Ask the centre about its conditions before the first test: the file says a free re-inspection is possible, not when it applies.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d);
      const multi = v.arr && Object.keys(v.arr).length > 1;
      return `<h2>A city that keeps its centres close</h2>
<p>Le Havre sits at the tip of the Seine estuary, facing the Channel. To the south lie the estuary and the industrial port zone; to the west, the sea. Finding many centres would mean going a long way east or north into the Pays de Caux. As a result, with ${h.num(v.n)} centres in the city and ${h.num(v.n15)} within 15 km, Le Havre is one of the few large cities where you take your test without leaving town.</p>
<p>Le Havre prices for a petrol car run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. The city median is ${x.cmp(x.e!.med, x.e15!.med)} the 15 km median: the two almost merge, since the city supplies most of the centres in the radius.</p>
${x.vehTable(`Median price by vehicle in Le Havre, within 15 km and in France, file of ${x.fichier}`)}
${multi ? `<h2>By postcode</h2>
<p>The city has several postcodes. The next table gives, for each one with a centre, the number of centres and their median. Above all it shows that the address does not set the price: the gap is between one centre and the next.</p>
${x.arrTable(`Price of a petrol car test by Le Havre postcode, file of ${x.fichier}`)}` : ''}
<h2>Seine-Maritime in the ranking</h2>
<p>Seine-Maritime, with ${h.num(x.dep.centres)} centres between Le Havre, Rouen and Dieppe, has a median of ${h.prix(x.depMed)}. It ranks ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, ${x.cmp(x.depMed, x.natMed)} the national median. The ${h.a('departements', 'départements page')} gives this ranking for each vehicle, from motorbike to motorhome.</p>
<!--mini:cvDept_76-->
<h2>Harfleur, Montivilliers and the other bank</h2>
<p>Towns in the urban community that have a centre are listed below by distance. Further on, across the Pont de Normandie, Calvados centres come into the 15 km radius${calvados(h).length ? ` (${calvados(h).join(', ')})` : ''}. As the bridge charges a toll for cars, it only makes sense for a trip you were making anyway.</p>
${x.voisinesTable(`Towns around Le Havre: price of a petrol car test, file of ${x.fichier}`)}
<h2>Motorbikes, scooters, electric cars</h2>
<p>${v.s.m ? `${x.nb(v.s.m.n, 'Le Havre centre tests', 'Le Havre centres test')} motorcycles, with a median of ${h.prix(v.s.m.med)}${v.moinsCherMoto ? `; the cheapest charges ${h.prix(v.moinsCherMoto.p)}` : ''}.` : 'No Le Havre centre declares a motorcycle price in today’s file.'} A two-wheeler’s first test depends on its year of first registration: the ${h.a('controle-technique-moto', 'motorcycle guide')} gives the timetable. ${v.s.el ? `For an electric car the local median is ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} petrol; the ${h.a('controle-technique-electrique', 'electric car page')} explains why that gap is not compulsory.` : ''}</p>
<h2>After a failed test</h2>
<p>The sea air wears suspensions and underbodies: corrosion is among the items examined, and a major defect means a re-inspection (contre-visite) within two months. ${v.cv ? `In Le Havre it is declared between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median.` : ''} Deadlines and the cases where it is free are on the ${h.a('contre-visite', 're-inspection page')}. ${v.ancien != null ? `One last point: ${h.pct(v.ancien, 0)} of the city’s centres declare a car price dated before 2023, flagged with an asterisk in the list.` : ''}</p>
<p>For more ways to save, read ${h.a('controle-technique-pas-cher', 'how to pay less for your test')}; for another western city, the ${h.a('controle-technique-rennes', 'Rennes page')}.</p>`;
    },
  },
});

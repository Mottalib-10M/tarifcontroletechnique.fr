import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'nimes';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Médiane essence de l'Hérault voisin (Montpellier), pour situer le Gard. */
const herault = (h: Helpers) => (h.S.depts as unknown as Record<string, { s: { e: { med: number } } }>)['34'].s.e.med;

export default defineGuide({
  id: 'controle-technique-nimes',
  group: 'villes',
  order: 19,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'contre-visite', 'controle-technique-pas-cher', 'controle-technique-moto', 'controle-technique-montpellier'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-nimes',
    nav: 'Nîmes',
    card: 'Les centres de Nîmes et des villages voisins, avec la médiane du Gard.',
    title: 'Contrôle technique à Nîmes : prix des centres, moins cher',
    description: 'Prix du contrôle technique à Nîmes : tarif de chaque centre de la ville et des villages voisins, médiane du Gard face à l’Hérault, contre-visite gratuite.',
    h1: 'Contrôle technique à Nîmes : le prix de chaque centre',
    intro: 'Les tarifs que déclarent les centres nîmois et ceux de la Vaunage, des Costières et de la plaine, du moins cher au plus cher.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      return `À Nîmes, ${x.nb(x.e!.n, 'centre de contrôle technique déclare', 'centres de contrôle technique déclarent')} un prix pour les voitures dans le fichier public de la DGCCRF. La médiane d’un contrôle essence y est de ${h.prix(x.e!.med)}, entre ${h.prix(x.e!.min)} et ${h.prix(x.e!.max)}, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}). Dans un rayon de 15 km, qui couvre les villages de la Vaunage, des Costières et de la plaine du Vistre, ${h.num(x.e15!.n)} centres ont une médiane de ${h.prix(x.e15!.med)}${m15 ? ` ; le moins cher, à ${m15.v}, affiche ${h.prix(m15.p)}` : ''}. Le Gard dans son ensemble est ${x.cmp(x.depMed, herault(h))} l’Hérault voisin. ${v.cv ? `La contre-visite se déclare entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane, et ${h.pct(v.cv.gratuite, 0)} des centres nîmois annoncent une gratuité possible.` : ''} Les prix sont relus chaque jour dans les déclarations des centres (fichier du ${x.fichier}) ; vérifiez la date de chacun dans la liste, et le prix affiché au centre le jour du contrôle.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Quel est le prix du contrôle technique à Nîmes ?', a: `La médiane des centres nîmois est de ${h.prix(x.e!.med)} pour une voiture essence, ${v.s.d ? `${h.prix(v.s.d.med)} pour un diesel` : 'le diesel étant le plus souvent au même prix'}${v.s.el ? ` et ${h.prix(v.s.el.med)} pour une électrique` : ''}. Les tarifs de la ville vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} : l’écart justifie de comparer avant de choisir.` },
        { q: 'Les tarifs affichés pour les centres de Nîmes sont-ils récents ?', a: v.ancien != null ? `${h.pct(v.ancien, 0)} des centres de la ville déclarent un tarif voiture daté d’avant 2023, contre ${h.pct(h.S.national.ancien, 0)} en France. Un tarif ancien n’est pas forcément faux, mais il a pu changer : la liste le signale par un astérisque, et c’est l’affichage du centre qui fait foi.` : 'Le fichier ne donne pas de date de tarif exploitable pour Nîmes ; vérifiez le prix affiché au centre, qui fait foi.' },
        { q: 'Où faire le contrôle technique d’une moto près de Nîmes ?', a: (v.s.m ? `${x.nb(v.s.m.n, 'centre nîmois déclare', 'centres nîmois déclarent')} un tarif moto, médiane ${h.prix(v.s.m.med)}.` : `Aucun centre de Nîmes ne déclare de tarif moto dans le fichier du jour${v.s15.m ? ` ; ${h.num(v.s15.m.n)} le font dans les 15 km` : ', ni dans un rayon de 15 km'}. Choisissez « Moto » dans l’outil et élargissez la distance à 30 km.`) + ` Le contrôle d’un deux-roues porte notamment sur le freinage, l’éclairage, les pneumatiques et le niveau sonore ; venez avec le certificat d’immatriculation.` },
        { q: 'La contre-visite est-elle souvent gratuite à Nîmes ?', a: (v.cv ? `${h.pct(v.cv.gratuite, 0)} des centres de la ville annoncent une contre-visite gratuite dans certains cas, contre ${h.pct(h.S.national.cv.gratuite, 0)} en France. Sinon, elle se paie entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane. Demandez les conditions avant le premier contrôle.` : 'Le fichier ne donne pas de prix de contre-visite pour Nîmes ; demandez les conditions avant le premier contrôle.') + ` Le fichier ne précise pas ces conditions : posez la question au centre.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d);
      const bas = [...v.voisines].sort((a, b) => a.s.med - b.s.med).slice(0, 3).map((c) => `${c.nom} (${h.prix(c.s.med)})`).join(', ');
      return `<h2>Nîmes et ses villages</h2>
<p>Nîmes est la préfecture du Gard, entre les garrigues au nord et la plaine qui descend vers la Camargue au sud. Autour de la ville, une couronne de villages, de Caveirac et Langlade en Vaunage à Caissargues et Garons au sud, accueille une partie des centres de contrôle. Le fichier en compte ${x.nb(x.e!.n, 'centre', 'centres')} pour les voitures dans Nîmes même et ${h.num(x.e15!.n)} dans un rayon de 15 km.</p>
<p>La médiane de la ville est ${x.cmp(x.e!.med, x.e15!.med)} celle des 15 km autour. Les villages voisins dont la médiane est la plus basse aujourd’hui : ${bas}. Pour un Nîmois, le trajet vers ces villages est court, et l’écart de prix peut valoir le détour.</p>
${x.vehTable(`Prix médian par véhicule à Nîmes, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>Le Gard face à l’Hérault et au pays</h2>
<p>Le Gard compte ${h.num(x.dep.centres)} centres, d’Alès à Beaucaire et du Vigan à Bagnols-sur-Cèze. Sa médiane pour une voiture essence, ${h.prix(x.depMed)}, le place au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher. Il est ${x.cmp(x.depMed, x.natMed)} la médiane nationale et ${x.cmp(x.depMed, herault(h))} l’Hérault, dont la médiane est de ${h.prix(herault(h))}. Le ${h.a('departements', 'classement des départements')} donne le détail par véhicule.</p>
<!--mini:cvDept_30-->
<h2>Les villages autour de Nîmes</h2>
<p>Le tableau ci-dessous classe les communes voisines qui ont un centre par distance du centre de Nîmes, avec leur médiane et leur tarif le plus bas. Les distances sont à vol d’oiseau : par la route, comptez un peu plus.</p>
${x.voisinesTable(`Communes autour de Nîmes : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>L’âge des tarifs déclarés</h2>
<p>${v.ancien != null ? `Dans le fichier du jour, ${h.pct(v.ancien, 0)} des centres de Nîmes déclarent un tarif voiture daté d’avant 2023, contre ${h.pct(h.S.national.ancien, 0)} en France.` : ''} Cela ne veut pas dire que les prix sont faux : beaucoup de centres n’ont simplement pas modifié leur déclaration. Mais un écart entre la liste et l’affichage est possible, et c’est l’affichage du centre qui s’applique. Un astérisque marque dans la liste les tarifs de plus de trois ans ; un coup de téléphone avant de s’y rendre lève le doute.</p>
<h2>Contre-visite gratuite ou payante</h2>
<p>${v.cv ? `${h.pct(v.cv.gratuite, 0)} des centres nîmois annoncent une contre-visite gratuite dans certains cas, pour ${h.pct(h.S.national.cv.gratuite, 0)} en France. Sinon, elle se paie entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane.` : 'Le fichier ne donne pas de prix de contre-visite pour Nîmes.'} Une contre-visite gratuite chez le centre du premier contrôle pèse souvent plus lourd qu’un ou deux euros d’écart sur la visite. Les règles et le délai de deux mois sont expliqués sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Électrique et deux-roues</h2>
<p>${v.s.el ? `Pour une électrique, la médiane nîmoise est de ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} l’essence ; en France, l’écart médian entre les deux est de ${h.prix(h.S.national.s.el.med - h.S.national.s.e.med)} (${h.a('controle-technique-electrique', 'voir la page électrique')}).` : ''} ${v.s.m ? `Pour une moto, ${x.nb(v.s.m.n, 'centre déclare', 'centres déclarent')} un tarif.` : `Aucun centre de la commune ne déclare de tarif moto${v.s15.m ? '' : ', ni dans un rayon de 15 km'} : choisissez « Moto » dans l’outil et passez la distance à 30 km.`} Le calendrier des deux-roues est dans le ${h.a('controle-technique-moto', 'guide moto')}, et la grande voisine ${h.a('controle-technique-montpellier', 'Montpellier')} a sa propre page.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-nimes',
    nav: 'Nîmes',
    card: 'Centres in Nîmes and the nearby villages, with the Gard median.',
    title: 'Contrôle technique in Nîmes: centre prices, cheapest',
    description: 'Contrôle technique prices in Nîmes: each centre in the city and nearby villages, the Gard median against the Hérault, and whether the re-check is free or paid.',
    h1: 'Contrôle technique in Nîmes: every centre’s price',
    intro: 'Prices declared by centres in Nîmes and in the Vaunage, the Costières and the plain, from cheapest to dearest.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v, m15 = v.moinsCher15;
      return `In Nîmes, ${x.nb(x.e!.n, 'contrôle technique centre declares', 'contrôle technique centres declare')} a car price in the DGCCRF’s public file. The median for a petrol car test (the contrôle technique is France’s compulsory roadworthiness test) is ${h.prix(x.e!.med)}, between ${h.prix(x.e!.min)} and ${h.prix(x.e!.max)}, ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}). Within 15 km, an area covering the villages of the Vaunage, the Costières and the Vistre plain, ${h.num(x.e15!.n)} centres have a median of ${h.prix(x.e15!.med)}${m15 ? `; the cheapest, in ${m15.v}, charges ${h.prix(m15.p)}` : ''}. The Gard as a whole is ${x.cmp(x.depMed, herault(h))} the neighbouring Hérault. ${v.cv ? `The re-inspection (contre-visite) is declared between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median, and ${h.pct(v.cv.gratuite, 0)} of Nîmes centres say it can be free.` : ''} Prices are reread every day from the centres’ declarations (file of ${x.fichier}); check each one’s date in the list, and the price displayed at the centre on the day.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'What does a contrôle technique cost in Nîmes?', a: (`The median across Nîmes centres is ${h.prix(x.e!.med)} for a petrol car, ${v.s.d ? `${h.prix(v.s.d.med)} for a diesel` : 'with diesel usually the same price'}${v.s.el ? ` and ${h.prix(v.s.el.med)} for an electric car` : ''}. City prices run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}: the gap makes comparing worthwhile.`) + ` Prices are not regulated: every Nîmes centre fixes its own and declares it publicly, which explains the spread.` },
        { q: 'Are the prices listed for Nîmes centres recent?', a: v.ancien != null ? `${h.pct(v.ancien, 0)} of the city’s centres declare a car price dated before 2023, against ${h.pct(h.S.national.ancien, 0)} across France. An old price is not necessarily wrong, but it may have changed: the list flags it with an asterisk, and the centre’s display is what counts.` : 'The file has no usable price date for Nîmes; check the price displayed at the centre, which is what counts.' },
        { q: 'Where can I get a motorbike tested near Nîmes?', a: (v.s.m ? `${x.nb(v.s.m.n, 'Nîmes centre declares', 'Nîmes centres declare')} a motorcycle price, median ${h.prix(v.s.m.med)}.` : `No Nîmes centre declares a motorcycle price in today’s file${v.s15.m ? `; ${h.num(v.s15.m.n)} do within 15 km` : ', nor does any within 15 km'}. Pick “Motorcycle” in the tool and widen the distance to 30 km.`) + ` The motorcycle test covers braking, lighting, tyres and noise level among other points, so bring the bike in roadworthy condition along with its registration certificate.` },
        { q: 'Is the re-inspection often free in Nîmes?', a: (v.cv ? `${h.pct(v.cv.gratuite, 0)} of the city’s centres say the re-inspection can be free in some cases, against ${h.pct(h.S.national.cv.gratuite, 0)} across France. Otherwise it costs between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median. Ask about the conditions before the first test.` : 'The file gives no re-inspection price for Nîmes; ask about the conditions before the first test.') + ` The conditions are not in the file, so ask the centre directly.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d);
      const bas = [...v.voisines].sort((a, b) => a.s.med - b.s.med).slice(0, 3).map((c) => `${c.nom} (${h.prix(c.s.med)})`).join(', ');
      return `<h2>Nîmes and its villages</h2>
<p>Nîmes is the prefecture of the Gard, between the garrigue scrubland to the north and the plain that runs down towards the Camargue to the south. Around the city a ring of villages, from Caveirac and Langlade in the Vaunage to Caissargues and Garons in the south, hosts some of the inspection centres. The file counts ${x.nb(x.e!.n, 'centre', 'centres')} for cars in Nîmes itself and ${h.num(x.e15!.n)} within 15 km.</p>
<p>The city median is ${x.cmp(x.e!.med, x.e15!.med)} the median within 15 km. The nearby villages with the lowest median today: ${bas}. For someone in Nîmes the drive to these villages is short, and the price gap can be worth it.</p>
${x.vehTable(`Median price by vehicle in Nîmes, within 15 km and in France, file of ${x.fichier}`)}
<h2>The Gard against the Hérault and the country</h2>
<p>The Gard has ${h.num(x.dep.centres)} centres, from Alès to Beaucaire and from Le Vigan to Bagnols-sur-Cèze. Its median for a petrol car, ${h.prix(x.depMed)}, ranks it ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest. It is ${x.cmp(x.depMed, x.natMed)} the national median and ${x.cmp(x.depMed, herault(h))} the Hérault, whose median is ${h.prix(herault(h))}. The ${h.a('departements', 'département ranking')} gives the detail by vehicle.</p>
<!--mini:cvDept_30-->
<h2>The villages around Nîmes</h2>
<p>The table below lists neighbouring towns with a centre by distance from central Nîmes, with their median and lowest price. Distances are as the crow flies: by road, allow a little more.</p>
${x.voisinesTable(`Towns around Nîmes: price of a petrol car test, file of ${x.fichier}`)}
<h2>How old the declared prices are</h2>
<p>${v.ancien != null ? `In today’s file, ${h.pct(v.ancien, 0)} of Nîmes centres declare a car price dated before 2023, against ${h.pct(h.S.national.ancien, 0)} across France.` : ''} That does not mean the prices are wrong: many centres have simply not changed their declaration. But the list and the display may differ, and the centre’s display is what applies. An asterisk marks prices more than three years old in the list; a phone call before you go settles any doubt.</p>
<h2>Free or paid re-inspection</h2>
<p>${v.cv ? `${h.pct(v.cv.gratuite, 0)} of Nîmes centres say the re-inspection can be free in some cases, against ${h.pct(h.S.national.cv.gratuite, 0)} across France. Otherwise it costs between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median.` : 'The file gives no re-inspection price for Nîmes.'} A free re-check at the centre that did the first test often matters more than a euro or two on the test itself. The rules and the two-month deadline are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Electric cars and two-wheelers</h2>
<p>${v.s.el ? `For an electric car the Nîmes median is ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} petrol; across France the median gap between the two is ${h.prix(h.S.national.s.el.med - h.S.national.s.e.med)} (${h.a('controle-technique-electrique', 'see the electric car page')}).` : ''} ${v.s.m ? `For a motorbike, ${x.nb(v.s.m.n, 'centre declares', 'centres declare')} a price.` : `No centre in the city declares a motorcycle price${v.s15.m ? '' : ', nor any within 15 km'}: pick “Motorcycle” in the tool and set the distance to 30 km.`} The two-wheeler timetable is in the ${h.a('controle-technique-moto', 'motorcycle guide')}, and the big neighbour ${h.a('controle-technique-montpellier', 'Montpellier')} has its own page.</p>`;
    },
  },
});

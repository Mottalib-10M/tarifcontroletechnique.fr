import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'strasbourg';
type DepS = Record<string, { centres: number; s: { e?: { med: number }; el?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
const voisins = (h: Helpers) => ['67', '68', '57', '88'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
/** Écart entre électrique et essence dans la ville, en euros (0 si absent). */
const ecartElec = (h: Helpers) => { const x = ville(h, SLUG); return x.v.s.el && x.e ? x.v.s.el.med - x.e.med : 0; };

export default defineGuide({
  id: 'controle-technique-strasbourg',
  group: 'villes',
  order: 8,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-electrique', 'contre-visite', 'controle-technique-reims', 'controle-technique-pas-cher'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-strasbourg',
    nav: 'Strasbourg',
    card: 'Strasbourg et l’Eurométropole : les prix déclarés, centre par centre.',
    title: 'Contrôle technique à Strasbourg : prix centre par centre',
    description: 'Contrôle technique à Strasbourg : prix déclarés par chaque centre, écarts dans la ville, Eurométropole, électrique, contre-visite, Bas-Rhin. Données du jour.',
    h1: 'Contrôle technique à Strasbourg : comparer les centres',
    intro: 'Les tarifs déclarés à la DGCCRF par les centres de Strasbourg et de l’Eurométropole, pour une voiture thermique, électrique ou une moto.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `Le prix médian d’un contrôle technique de voiture essence ou diesel est de ${h.prix(x.e!.med)} à Strasbourg, ${x.cmp(x.e!.med, x.natMed)} la médiane française (${h.prix(x.natMed)}). ${x.e!.max - x.e!.min >= 30 ? 'Mais la médiane cache un écart rare' : 'La médiane ne dit pas tout'} : parmi les ${x.nb(x.v.n, 'centre de la ville', 'centres de la ville')}, le moins cher déclare ${h.prix(x.e!.min)} et le plus cher ${h.prix(x.e!.max)}, soit ${h.prix(x.e!.max - x.e!.min)} de différence pour le même examen. Dans les 15 km de l’Eurométropole, ${h.num(x.v.n15)} centres affichent une médiane de ${h.prix(x.e15!.med)} ; le prix le plus bas de ce rayon, ${h.prix(mc15.p)}, est déclaré à ${mc15.v}. La contre-visite coûte entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Ces montants sont ceux que chaque centre déclare dans le fichier public de l’administration, relu ce jour (${x.fichier}). Comparer avant de réserver reste la meilleure façon de payer moins : l’outil classe les centres autour de votre commune par prix.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = voisins(h);
      return [
        { q: 'Pourquoi les prix du contrôle technique varient-ils autant à Strasbourg ?', a: `Les prix sont libres, et chaque centre fixe le sien selon ses coûts et sa clientèle. À Strasbourg, le fichier du jour va de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} pour une voiture essence. Un tarif élevé peut aussi être un prix ancien jamais mis à jour, ou au contraire un prix récent : la date de chaque tarif figure dans la liste de l’outil.` },
        { q: 'Peut-on passer le contrôle technique en Allemagne en habitant Strasbourg ?', a: 'Non, pour une voiture immatriculée en France. Le contrôle technique français se passe dans un centre agréé en France, et les centres allemands, même à Kehl, ne figurent pas dans le fichier de la DGCCRF. Un contrôle allemand ne remplace pas le procès-verbal exigé sur une carte grise française.' },
        { q: 'Le contrôle d’une voiture électrique coûte-t-il plus cher à Strasbourg ?', a: ecartElec(h) > 0 ? `Oui, de ${h.prix(ecartElec(h))} en médiane dans la ville (${h.prix(x.v.s.el!.med)} contre ${h.prix(x.e!.med)}).` + ' Ce supplément n’est imposé par aucun texte ; certains centres l’appliquent, d’autres non. Le mini-simulateur de la page compare électrique et essence dans le Bas-Rhin, et l’outil réglé sur « Électrique » classe les centres de la ville selon ce prix.' : `Pas en médiane : dans la ville, l’électrique est déclarée ${x.v.s.el ? `à ${h.prix(x.v.s.el.med)}, comme ou presque comme l’essence (${h.prix(x.e!.med)})` : 'par trop peu de centres pour comparer'}. Ailleurs en France, beaucoup de centres facturent pourtant un supplément ; le mini-simulateur compare les deux pour le Bas-Rhin, et l’outil réglé sur « Électrique » classe les centres de la ville selon ce prix.` },
        { q: 'Le Bas-Rhin est-il moins cher que le Haut-Rhin pour le contrôle technique ?', a: `Les médianes du jour pour une voiture essence, du moins cher au plus cher, sont : ${v.map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Les écarts entre départements alsaciens et lorrains restent faibles au regard de ceux qui séparent deux centres d’une même ville.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), ee = ecartElec(h);
      return `<h2>${x.e!.max - x.e!.min >= 30 ? 'Une médiane qui cache de grands écarts' : 'Ce que dit la médiane, et ce qu’elle ne dit pas'}</h2>
<p>Strasbourg compte ${x.nb(x.v.n, 'centre', 'centres')} qui déclarent un prix voiture, pour une médiane de ${h.prix(x.e!.med)}. Le Bas-Rhin se situe à ${h.prix(x.depMed)}, ${x.cmp(x.depMed, x.natMed)} la France. Ce qui frappe, c’est la distance entre les extrêmes : ${h.prix(x.e!.min)} pour le moins cher, ${h.prix(x.e!.max)} pour le plus cher. Pour une voiture particulière, l’examen est pourtant identique d’un centre à l’autre : même liste de points, mêmes appareils homologués, mêmes critères.</p>
${x.vehTable(`Strasbourg, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>Un prix très au-dessus des autres peut avoir plusieurs explications : un centre qui inclut un service supplémentaire, un tarif déclaré pour une situation particulière, ou simplement une politique commerciale. Rien n’oblige à s’y soumettre : l’outil en haut de page trie les centres par prix et indique la date de chaque tarif.</p>
<h2>L’Eurométropole</h2>
<p>Dans un rayon de 15 km, ${h.num(x.v.n15)} centres se partagent l’agglomération, de Schiltigheim au nord à Illkirch-Graffenstaden au sud. Leur médiane est de ${h.prix(x.e15!.med)}. ${x.v.moinsCher15!.v.startsWith('Strasbourg') ? `Le moins cher du rayon est à Strasbourg même, à ${h.prix(x.v.moinsCher15!.p)}${x.v.moinsCher15!.ex > 1 ? `, prix partagé par ${x.nb(x.v.moinsCher15!.ex, 'centre', 'centres')}` : ''}.` : `Le moins cher du rayon, à ${x.v.moinsCher15!.v}, déclare ${h.prix(x.v.moinsCher15!.p)}.`}</p>
${x.voisinesTable(`Communes voisines de Strasbourg : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Le tableau montre que plusieurs communes de la première couronne ont une médiane différente de celle de la ville centre, souvent sur un ou deux centres seulement : une seule fiche suffit à déplacer la médiane d’une petite commune. Mieux vaut donc lire la liste complète.</p>
<h2>Électrique : ${ee > 0 ? 'un supplément à surveiller' : 'peu ou pas de supplément en ville'}</h2>
<p>${ee > 0 ? `À Strasbourg, l’électrique se paie ${h.prix(ee)} de plus que l’essence en médiane.` : x.v.s.el ? `À Strasbourg, la médiane d’un contrôle électrique, ${h.prix(x.v.s.el.med)}, ne dépasse pas celle de l’essence.` : 'Peu de centres strasbourgeois déclarent un prix électrique.'} À l’échelle de la France, ${h.pct(h.S.national.elecPlusCher, 0)} des centres facturent l’électrique plus cher que l’essence, sans que la réglementation l’impose. Le mini-simulateur donne l’écart dans le Bas-Rhin, ou dans un autre département.</p>
<!--mini:elecDept_67-->
<p>Pour comprendre ce que contrôle un centre sur une électrique et pourquoi le prix peut différer, voir le guide ${h.a('controle-technique-electrique', 'du contrôle technique d’une voiture électrique')}.</p>
<h2>De l’autre côté du Rhin</h2>
<p>Kehl est à quelques minutes du centre de Strasbourg, mais les centres allemands ne peuvent pas contrôler une voiture immatriculée en France : seul un centre agréé en France délivre le procès-verbal attaché à une carte grise française. Le fichier de la DGCCRF ne contient d’ailleurs que des centres français. Les frontaliers qui roulent avec une plaque allemande suivent, eux, les règles allemandes.</p>
<h2>Contre-visite dans le Bas-Rhin</h2>
<p>Après un contrôle défavorable, la contre-visite doit être faite dans les deux mois. Les centres de Strasbourg la déclarent entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane${x.v.cv!.gratuite > 0 ? `, et ${h.pct(x.v.cv!.gratuite, 0)} l’annoncent parfois gratuite` : ' ; aucun ne l’annonce gratuite dans le fichier du jour'}. Le mini-simulateur donne la situation pour tout le département.</p>
<!--mini:cvDept_67-->
<p>Les délais et ce qui se passe en cas de défaillance critique sont sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Alsace et Lorraine</h2>
<p>Médianes d’un contrôle essence aujourd’hui, du moins cher au plus cher : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. ${x.v.s.m ? `Pour une moto, ${x.nb(x.v.s.m.n, 'centre de Strasbourg déclare', 'centres de Strasbourg déclarent')} un prix (médiane ${h.prix(x.v.s.m.med)})` : 'Pour une moto, peu de centres de Strasbourg déclarent un prix'}${x.v.s15.m ? ` et ${h.num(x.v.s15.m.n)} dans les 15 km` : ''} : élargissez le rayon dans l’outil. Le classement complet est sur la page des ${h.a('departements', 'départements')}, et les moyens de payer moins dans le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')}. Pour une autre grande ville du Grand Est, voir ${h.a('controle-technique-reims', 'Reims')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-strasbourg',
    nav: 'Strasbourg',
    card: 'Strasbourg and its Eurométropole: declared prices, centre by centre.',
    title: 'Contrôle technique in Strasbourg: prices and centre gaps',
    description: 'Contrôle technique in Strasbourg: prices declared by centres, gaps within the city, Eurométropole, electric cars, re-inspection, Bas-Rhin. Today’s DGCCRF data.',
    h1: 'Contrôle technique in Strasbourg: comparing centres',
    intro: 'The prices that centres in Strasbourg and its Eurométropole declare to the DGCCRF, for a petrol, diesel or electric car, or a motorbike.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `The median price of a contrôle technique (France’s compulsory roadworthiness test) for a petrol or diesel car is ${h.prix(x.e!.med)} in Strasbourg, ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}). ${x.e!.max - x.e!.min >= 30 ? 'But the median hides an unusual spread' : 'The median is not the whole story'}: among the city’s ${x.nb(x.v.n, 'centre', 'centres')}, the cheapest declares ${h.prix(x.e!.min)} and the dearest ${h.prix(x.e!.max)}, a ${h.prix(x.e!.max - x.e!.min)} difference for the same test. Within 15 km, across the Eurométropole, ${h.num(x.v.n15)} centres show a median of ${h.prix(x.e15!.med)}; the lowest price in that radius, ${h.prix(mc15.p)}, is declared in ${mc15.v}. A re-inspection (contre-visite) costs between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. These are the amounts each centre declares in the authorities’ public file, read today (${x.fichier}). Comparing before booking remains the best way to pay less: the tool ranks the centres around your town by price.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = voisins(h);
      return [
        { q: 'Why do contrôle technique prices vary so much in Strasbourg?', a: `Prices are free, and each centre sets its own according to its costs and customers. In Strasbourg, today’s file runs from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)} for a petrol car. A high price may also be an old one never updated, or a recent one: the date of each price is shown in the tool’s list.` },
        { q: 'Can I get my French car tested in Germany if I live in Strasbourg?', a: 'No, not for a car registered in France. The French contrôle technique is done at a centre approved in France, and German centres, even in Kehl, are not in the DGCCRF file. A German inspection does not replace the report required for a French registration certificate (carte grise).' },
        { q: 'Does an electric car test cost more in Strasbourg?', a: ecartElec(h) > 0 ? `Yes, by ${h.prix(ecartElec(h))} at the median in the city (${h.prix(x.v.s.el!.med)} against ${h.prix(x.e!.med)}). No rule imposes this surcharge; some centres apply it, others do not. The mini calculator on this page compares electric and petrol in Bas-Rhin, and the tool set to “Electric” ranks the city’s centres by that price.` : `Not at the median: in the city, electric is declared ${x.v.s.el ? `at ${h.prix(x.v.s.el.med)}, at or near the petrol price (${h.prix(x.e!.med)})` : 'by too few centres to compare'}. Elsewhere in France many centres do charge a surcharge; the mini calculator compares both for Bas-Rhin, and the tool set to “Electric” ranks the city’s centres by that price.` },
        { q: 'Is Bas-Rhin cheaper than Haut-Rhin for the contrôle technique?', a: `Today’s medians for a petrol car, cheapest first, are: ${v.map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Gaps between Alsace and Lorraine départements are small compared with those between two centres in the same city. Any approved centre can test your car, so the tool’s list within your chosen radius is the better guide.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), ee = ecartElec(h);
      return `<h2>${x.e!.max - x.e!.min >= 30 ? 'A median that hides wide gaps' : 'What the median says, and what it does not'}</h2>
<p>Strasbourg has ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price, with a median of ${h.prix(x.e!.med)}. Bas-Rhin stands at ${h.prix(x.depMed)}, ${x.cmp(x.depMed, x.natMed)} France. What stands out is the distance between the extremes: ${h.prix(x.e!.min)} at the cheapest, ${h.prix(x.e!.max)} at the dearest. For a private car the test is nonetheless identical from one centre to the next: the same checklist, the same approved equipment, the same criteria.</p>
${x.vehTable(`Strasbourg, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<p>A price far above the rest can have several explanations: a centre including an extra service, a price declared for a particular case, or simply a commercial choice. Nothing forces you to accept it: the tool at the top of the page sorts centres by price and shows the date of each price.</p>
<h2>The Eurométropole</h2>
<p>Within 15 km, ${h.num(x.v.n15)} centres share the urban area, from Schiltigheim in the north to Illkirch-Graffenstaden in the south. Their median is ${h.prix(x.e15!.med)}. ${x.v.moinsCher15!.v.startsWith('Strasbourg') ? `The cheapest in the radius is in Strasbourg itself, at ${h.prix(x.v.moinsCher15!.p)}${x.v.moinsCher15!.ex > 1 ? `, a price shared by ${x.nb(x.v.moinsCher15!.ex, 'centre', 'centres')}` : ''}.` : `The cheapest in the radius, in ${x.v.moinsCher15!.v}, declares ${h.prix(x.v.moinsCher15!.p)}.`}</p>
${x.voisinesTable(`Towns near Strasbourg: petrol car test, file of ${x.fichier}`)}
<p>The table shows that several inner-ring towns have a median different from the central city’s, often on just one or two centres: a single record is enough to move a small town’s median. Reading the full list is the safer way.</p>
<h2>Electric cars: ${ee > 0 ? 'a surcharge to watch' : 'little or no surcharge in town'}</h2>
<p>${ee > 0 ? `In Strasbourg, electric costs ${h.prix(ee)} more than petrol at the median.` : x.v.s.el ? `In Strasbourg the median electric test, ${h.prix(x.v.s.el.med)}, is no higher than petrol.` : 'Few Strasbourg centres declare an electric price.'} Across France, ${h.pct(h.S.national.elecPlusCher, 0)} of centres charge more for an electric car than for a petrol one, with no regulation requiring it. The mini calculator gives the gap in Bas-Rhin, or in another département.</p>
<!--mini:elecDept_67-->
<p>To see what a centre checks on an electric car and why the price may differ, read the ${h.a('controle-technique-electrique', 'electric car guide')}.</p>
<h2>Across the Rhine</h2>
<p>Kehl is minutes from central Strasbourg, but German centres cannot test a car registered in France: only a centre approved in France issues the report tied to a French registration certificate. The DGCCRF file only lists French centres anyway. Cross-border commuters driving on German plates follow German rules instead.</p>
<h2>Re-inspection in Bas-Rhin</h2>
<p>After a fail, the re-inspection (contre-visite) must be done within two months. Strasbourg centres declare it at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median${x.v.cv!.gratuite > 0 ? `, and ${h.pct(x.v.cv!.gratuite, 0)} say it is sometimes free` : '; none declares it free in today’s file'}. The mini calculator gives the picture for the whole département.</p>
<!--mini:cvDept_67-->
<p>Deadlines and what happens with a critical defect are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Alsace and Lorraine</h2>
<p>Petrol test medians today, cheapest first: ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. ${x.v.s.m ? `For a motorbike, ${x.nb(x.v.s.m.n, 'Strasbourg centre declares', 'Strasbourg centres declare')} a price (median ${h.prix(x.v.s.m.med)})` : 'For a motorbike, few Strasbourg centres declare a price'}${x.v.s15.m ? ` and ${h.num(x.v.s15.m.n)} within 15 km` : ''}: widen the radius in the tool. The full ranking is on the ${h.a('departements', 'départements page')}, and ways to pay less in the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')}. For another big city in the Grand Est region, see ${h.a('controle-technique-reims', 'Reims')}.</p>`;
    },
  },
});

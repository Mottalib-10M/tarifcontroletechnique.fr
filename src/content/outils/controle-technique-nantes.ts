import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'nantes';
type DepS = Record<string, { centres: number; ancien: number | null; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
const voisins = (h: Helpers) => ['44', '85', '49', '35', '56'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
/** Le moins cher des 15 km est-il dans Nantes même ? */
const dansNantes = (h: Helpers) => { const x = ville(h, SLUG); return x.v.moinsCher15!.v.startsWith('Nantes'); };
/** Communes au sud de la Loire présentes parmi les voisines (Rezé, Bouguenais, Saint-Sébastien, Vertou). */
const sud = (h: Helpers) => ville(h, SLUG).v.voisines.filter((c) => ['Rezé', 'Bouguenais', 'Saint-Sébastien-sur-Loire', 'Vertou', 'Les Sorinières'].includes(c.nom));

export default defineGuide({
  id: 'controle-technique-nantes',
  group: 'villes',
  order: 6,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'contre-visite', 'quand-faire-controle-technique', 'controle-technique-rennes', 'controle-technique-angers'],
  sources: ['dataset', 'prixConso', 'spVoiture', 'arretePrix'],
  fr: {
    slug: 'controle-technique-nantes',
    nav: 'Nantes',
    card: 'Nantes, sa métropole et les deux rives de la Loire : prix déclarés du jour.',
    title: 'Contrôle technique à Nantes : prix et contre-visite',
    description: 'Contrôle technique à Nantes : prix déclarés par chaque centre, médianes ville et métropole, nord et sud Loire, contre-visite, échéance. Fichier DGCCRF du jour.',
    h1: 'Contrôle technique à Nantes : prix des centres',
    intro: 'Les prix que les centres de Nantes et de sa métropole déclarent à la DGCCRF, et la date à laquelle votre voiture doit passer.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `À Nantes, le contrôle technique d’une voiture essence ou diesel est déclaré à ${h.prix(x.e!.med)} en médiane par les ${x.nb(x.v.n, 'centre agréé', 'centres agréés')} de la commune, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}). Les prix de la ville vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. Dans un rayon de 15 km, qui couvre l’essentiel de la métropole des deux côtés de la Loire, ${h.num(x.v.n15)} centres ont une médiane de ${h.prix(x.e15!.med)}. ${dansNantes(h) ? `Le centre le moins cher de tout ce rayon est dans Nantes même, à ${h.prix(mc15.p)}.` : `Le moins cher de ce rayon déclare ${h.prix(mc15.p)} à ${mc15.v}.`} En cas de contrôle défavorable, la contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Tous ces prix sont ceux que chaque centre transmet à l’administration, relus ce jour dans le fichier public (${x.fichier}) ; l’outil les trie pour la commune que vous indiquez.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = voisins(h);
      return [
        { q: 'Faut-il sortir de Nantes pour payer moins cher son contrôle technique ?', a: dansNantes(h) ? `Pas forcément : dans le fichier du jour, le centre le moins cher dans un rayon de 15 km se trouve dans Nantes même (${h.prix(x.v.moinsCher15!.p)}). La médiane de la métropole, ${h.prix(x.e15!.med)}, est ${x.cmp(x.e15!.med, x.e!.med)} celle de la ville. C’est le choix du centre, plus que de la commune, qui fait l’économie.` : `Le moins cher du rayon de 15 km est à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}), contre ${h.prix(x.v.moinsCher!.p)} au mieux dans Nantes. La médiane de la métropole est ${x.cmp(x.e15!.med, x.e!.med)} celle de la ville.` },
        { q: 'Les prix des centres nantais sont-ils à jour ?', a: `${x.v.ancien != null ? `Seuls ${h.pct(x.v.ancien, 0)} des centres de Nantes déclarent un tarif voiture daté d’avant 2023, contre ${h.pct(h.S.national.ancien, 0)} en France.` : 'Le fichier ne permet pas de dater les tarifs nantais.'} Une date récente rend la liste plus fiable, mais c’est toujours le prix affiché à l’accueil du centre qui s’applique le jour du contrôle.` },
        { q: 'La Loire-Atlantique est-elle plus chère que la Vendée pour le contrôle technique ?', a: `Les médianes du jour pour une voiture essence, du moins cher au plus cher, sont : ${v.map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Pour un habitant du sud du département, un centre vendéen peut donc valoir la comparaison ; tout centre agréé peut contrôler une voiture, quel que soit son département d’immatriculation.` },
        { q: 'Combien de temps ai-je pour la contre-visite après un contrôle raté à Nantes ?', a: `Deux mois à compter du contrôle, dans n’importe quel centre agréé. À Nantes, elle coûte entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} des centres de la ville l’annoncent parfois gratuite.` : 'Aucun centre de la ville ne l’annonce gratuite dans le fichier du jour.'} Au-delà de deux mois, il faut repasser un contrôle complet.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), s = sud(h);
      return `<h2>Les centres de la ville</h2>
<p>La commune de Nantes compte ${x.nb(x.v.n, 'centre', 'centres')} qui déclarent un prix pour les voitures. Leur médiane, ${h.prix(x.e!.med)}, est ${x.cmp(x.e!.med, x.depMed)} celle de la Loire-Atlantique (${h.prix(x.depMed)}). L’éventail est plutôt resserré : ${h.prix(x.v.plusCher!.p - x.v.moinsCher!.p)} séparent le centre le moins cher de la ville du plus cher. Le premier déclare ${h.prix(x.v.moinsCher!.p)} ; il apparaît en tête de la liste de l’outil quand on la trie par prix.</p>
<p>${x.v.ancien != null && x.v.ancien < h.S.national.ancien ? 'Un trait distingue les centres nantais : leurs fiches sont souvent récentes.' : 'Les fiches des centres nantais ne sont pas toutes récentes.'} ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} déclarent un tarif voiture antérieur à 2023, quand la proportion nationale est de ${h.pct(h.S.national.ancien, 0)}.` : ''} Un tarif récent ne garantit pas l’exactitude, mais il réduit le risque d’une mauvaise surprise à l’accueil.</p>
${x.vehTable(`Nantes, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<h2>Nord Loire, sud Loire</h2>
<p>La Loire coupe l’agglomération en deux, et les ponts sont des points de passage chargés aux heures de pointe. Pour qui habite Rezé ou le sud de la métropole, traverser pour quelques euros d’écart a rarement du sens. ${s.length ? `Au sud du fleuve, le fichier du jour donne ces médianes : ${s.map((c) => `${c.nom} ${h.prix(c.s.med)}`).join(', ')}.` : ''} Au nord, les centres se regroupent le long du périphérique, à Saint-Herblain, Orvault ou Carquefou.</p>
${x.voisinesTable(`Communes voisines de Nantes : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Au total, ${h.num(x.v.n15)} centres se trouvent à moins de 15 km du centre de Nantes, pour une médiane de ${h.prix(x.e15!.med)}. ${dansNantes(h) ? 'Le moins cher de ce rayon est dans la commune elle-même : inutile de chercher loin.' : `Le moins cher de ce rayon est à ${x.v.moinsCher15!.v}, à ${h.prix(x.v.moinsCher15!.p)}.`}</p>
<h2>Quand faire passer sa voiture</h2>
<p>Beaucoup d’automobilistes cherchent un prix au moment où l’échéance arrive. Le premier contrôle d’une voiture se fait dans les six mois avant son quatrième anniversaire, puis tous les deux ans ; anticiper ne fait rien gagner, puisque la validité repart de la date du nouveau contrôle. Le mini-simulateur donne la date limite à partir de la carte grise.</p>
<!--mini:echeance-->
<p>Les cas particuliers (vente, camionnette, véhicule de collection) sont dans le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')}.</p>
<h2>Contre-visite en Loire-Atlantique</h2>
<p>Dans Nantes, la contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. À l’échelle du département, le mini-simulateur donne la fourchette et la part des centres qui la proposent gratuitement ; changez de département pour comparer avec la Vendée ou le Maine-et-Loire.</p>
<!--mini:cvDept_44-->
<p>Les règles (délai de deux mois, défaillance majeure ou critique, ce qui se passe après) sont sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Les départements de l’Ouest</h2>
<p>Classés par médiane du contrôle essence, du moins cher au plus cher, la Loire-Atlantique et ses voisins donnent aujourd’hui : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. Les pages ${h.a('controle-technique-rennes', 'Rennes')} et ${h.a('controle-technique-angers', 'Angers')} détaillent les deux grandes villes voisines ; le classement complet est sur la page des ${h.a('departements', 'départements')}.</p>
<p>Pour une moto, les centres équipés sont moins nombreux : ${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre nantais', 'centres nantais')} (médiane ${h.prix(x.v.s.m.med)})` : 'peu de centres nantais'}${x.v.s15.m ? `, ${h.num(x.v.s15.m.n)} dans les 15 km` : ''}. Le calendrier des deux-roues est expliqué dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-nantes',
    nav: 'Nantes',
    card: 'Nantes, its metro area and both banks of the Loire: today’s declared prices.',
    title: 'Contrôle technique in Nantes: centre prices, re-inspection',
    description: 'Contrôle technique in Nantes: prices declared by centres, city and metro medians, north and south of the Loire, re-inspection, due date. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Nantes: centre prices',
    intro: 'The prices that centres in Nantes and its metro area declare to the DGCCRF, and the date your car must be tested by.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `In Nantes, a contrôle technique (the French compulsory roadworthiness test) for a petrol or diesel car is declared at ${h.prix(x.e!.med)} at the median by the commune’s ${x.nb(x.v.n, 'approved centre', 'approved centres')}, ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}). City prices run from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. Within 15 km, which covers most of the metro area on both banks of the Loire, ${h.num(x.v.n15)} centres have a median of ${h.prix(x.e15!.med)}. ${dansNantes(h) ? `The cheapest centre in that whole radius is in Nantes itself, at ${h.prix(mc15.p)}.` : `The cheapest in that radius declares ${h.prix(mc15.p)} in ${mc15.v}.`} After a fail, the re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. All these are the prices each centre reports to the authorities, reread today in the public file (${x.fichier}); the tool sorts them for the town you enter.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = voisins(h);
      return [
        { q: 'Do you need to leave Nantes to pay less for the contrôle technique?', a: dansNantes(h) ? `Not necessarily: in today’s file the cheapest centre within 15 km is in Nantes itself (${h.prix(x.v.moinsCher15!.p)}). The metro median, ${h.prix(x.e15!.med)}, is ${x.cmp(x.e15!.med, x.e!.med)} the city’s. The choice of centre, more than of town, is what saves money. Sort the tool’s list by price within 15 km to see how far the next cheapest centres are.` : `The cheapest within 15 km is in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}), against ${h.prix(x.v.moinsCher!.p)} at best in Nantes. The metro median is ${x.cmp(x.e15!.med, x.e!.med)} the city’s. Before driving out of town, check the distance in the tool’s list: a few euros saved can vanish in fuel and time.` },
        { q: 'Are Nantes centres’ prices up to date?', a: `${x.v.ancien != null ? `Only ${h.pct(x.v.ancien, 0)} of Nantes centres declare a car price dated before 2023, against ${h.pct(h.S.national.ancien, 0)} across France.` : 'The file does not date Nantes prices.'} A recent date makes the list more reliable, but the price displayed at the centre’s desk always applies on the day. The tool shows each centre’s price date next to its price, so an outdated entry is easy to spot.` },
        { q: 'Is Loire-Atlantique dearer than Vendée for the contrôle technique?', a: `Today’s medians for a petrol car, cheapest first, are: ${v.map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. For someone in the south of the département, a centre in Vendée may be worth comparing; any approved centre can test a car, whatever the département it is registered in.` },
        { q: 'How long do I have for a re-inspection after failing in Nantes?', a: `Two months from the test, at any approved centre. In Nantes it costs between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} of the city’s centres say it is sometimes free.` : 'No centre in the city declares it free in today’s file.'} After two months a full test is needed again.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), s = sud(h);
      return `<h2>The city’s centres</h2>
<p>The commune of Nantes has ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price. Their median, ${h.prix(x.e!.med)}, is ${x.cmp(x.e!.med, x.depMed)} the Loire-Atlantique median (${h.prix(x.depMed)}). The range is fairly narrow: ${h.prix(x.v.plusCher!.p - x.v.moinsCher!.p)} separate the city’s cheapest centre from its dearest. The cheapest declares ${h.prix(x.v.moinsCher!.p)}; it tops the tool’s list when sorted by price.</p>
<p>${x.v.ancien != null && x.v.ancien < h.S.national.ancien ? 'One thing sets Nantes centres apart: their records are often recent.' : 'Not all Nantes centres keep their records fresh.'} ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} declare a car price from before 2023, while the national share is ${h.pct(h.S.national.ancien, 0)}.` : ''} A recent price does not guarantee accuracy, but it lowers the risk of a surprise at the desk.</p>
${x.vehTable(`Nantes, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<h2>North and south of the Loire</h2>
<p>The Loire splits the urban area in two, and the bridges are busy at peak times. If you live in Rezé or the south of the metro area, crossing the river for a few euros rarely makes sense. ${s.length ? `South of the river, today’s file gives these medians: ${s.map((c) => `${c.nom} ${h.prix(c.s.med)}`).join(', ')}.` : ''} To the north, centres cluster along the périphérique (ring road), in Saint-Herblain, Orvault or Carquefou.</p>
${x.voisinesTable(`Towns near Nantes: petrol car test, file of ${x.fichier}`)}
<p>In all, ${h.num(x.v.n15)} centres lie within 15 km of central Nantes, with a median of ${h.prix(x.e15!.med)}. ${dansNantes(h) ? 'The cheapest in that radius is in the commune itself: no need to look far.' : `The cheapest in that radius is in ${x.v.moinsCher15!.v}, at ${h.prix(x.v.moinsCher15!.p)}.`}</p>
<h2>When your car is due</h2>
<p>Many drivers look up prices just as the deadline arrives. A car’s first test falls in the six months before its fourth anniversary, then every two years; testing early gains nothing, since validity restarts from the new test date. The mini calculator gives the deadline from the registration certificate (carte grise).</p>
<!--mini:echeance-->
<p>Special cases (selling, vans, classic vehicles) are in the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')}.</p>
<h2>Re-inspection in Loire-Atlantique</h2>
<p>In Nantes the re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. For the whole département, the mini calculator gives the range and the share of centres offering it free; switch département to compare with Vendée or Maine-et-Loire.</p>
<!--mini:cvDept_44-->
<p>The rules (two-month window, major or critical defect, what happens next) are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Western départements</h2>
<p>Ranked by petrol test median, cheapest first, Loire-Atlantique and its neighbours stand today at: ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. The ${h.a('controle-technique-rennes', 'Rennes')} and ${h.a('controle-technique-angers', 'Angers')} pages cover the two big neighbouring cities; the full ranking is on the ${h.a('departements', 'départements page')}.</p>
<p>For a motorbike there are fewer equipped centres: ${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre in Nantes', 'centres in Nantes')} (median ${h.prix(x.v.s.m.med)})` : 'few centres in Nantes'}${x.v.s15.m ? `, ${h.num(x.v.s15.m.n)} within 15 km` : ''}. The two-wheeler timetable is explained in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>`;
    },
  },
});

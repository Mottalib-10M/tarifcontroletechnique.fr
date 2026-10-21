import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'marseille';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
/** Départements voisins, du moins cher au plus cher (médiane essence du jour). */
const voisins = (h: Helpers, ds: string[]) => ds.filter((d) => DS(h)[d]?.s.e).map((d) => ({ d, nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
const listeVoisins = (h: Helpers) => voisins(h, ['13', '83', '84']).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
/** Codes postaux marseillais où la médiane est la plus basse et la plus haute. */
const extremesArr = (h: Helpers) => {
  const a = Object.entries(ville(h, SLUG).v.arr ?? {}).sort(([, x], [, y]) => x.med - y.med);
  return a.length ? { bas: a[0], haut: a[a.length - 1], n: a.length } : null;
};
const arrNom = (cp: string, fr: boolean) => { const n = Number(cp.slice(3)); return fr ? (n === 1 ? '1er' : `${n}e`) : `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`; };

export default defineGuide({
  id: 'controle-technique-marseille',
  group: 'villes',
  order: 2,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'contre-visite', 'controle-technique-moto', 'controle-technique-nice', 'controle-technique-pas-cher'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spDeuxRoues'],
  fr: {
    slug: 'controle-technique-marseille',
    nav: 'Marseille',
    card: 'Les centres des seize arrondissements de Marseille et leurs tarifs déclarés.',
    title: 'Contrôle technique à Marseille : prix par arrondissement',
    description: 'Prix du contrôle technique à Marseille : médiane par arrondissement, centre le moins cher, moto et scooter, contre-visite gratuite. Fichier DGCCRF du jour.',
    h1: 'Contrôle technique à Marseille : les prix, quartier par quartier',
    intro: 'Les tarifs déclarés par chaque centre marseillais à la DGCCRF, du 1er au 16e arrondissement, pour une voiture, une moto ou un scooter.',
    resume: (h) => {
      const x = ville(h, SLUG), mc = x.v.moinsCher!, mc15 = x.v.moinsCher15!;
      const meme = mc15.v === mc.v && mc15.p === mc.p;
      return `À Marseille, un contrôle technique de voiture essence ou diesel coûte ${h.prix(x.e!.med)} en médiane, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale de ${h.prix(x.natMed)}. La ville compte ${x.nb(x.v.n, 'centre agréé', 'centres agréés')} qui déclarent un prix voiture, avec des tarifs compris entre ${h.prix(x.e!.min)} et ${h.prix(x.e!.max)}. La commune est si étendue qu’un rayon de 15 km autour de son centre reste presque entièrement marseillais : on y trouve ${h.num(x.v.n15)} centres, pour une médiane de ${h.prix(x.e15!.med)}. ${meme ? `Le moins cher de ce rayon est dans la ville même, dans le ${mc.v.replace('Marseille ', '')} arrondissement, à ${h.prix(mc.p)}.` : `Le moins cher de ce rayon, à ${mc15.v}, affiche ${h.prix(mc15.p)} ; dans Marseille, le plus bas est à ${h.prix(mc.p)}.`} La contre-visite s’y déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Ces prix sont ceux que chaque centre transmet à l’administration, dans le fichier public relu ce jour (${x.fichier}) : choisissez votre arrondissement ou votre commune dans l’outil pour voir la liste triée.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), ex = extremesArr(h);
      return [
        { q: 'Dans quel arrondissement de Marseille le contrôle technique est-il le moins cher ?', a: ex ? `Sur les ${h.num(ex.n)} codes postaux marseillais qui ont un centre, la médiane la plus basse est celle du ${ex.bas[0]} (${h.prix(ex.bas[1].med)}) et la plus haute celle du ${ex.haut[0]} (${h.prix(ex.haut[1].med)}). L’écart reste modeste à l’échelle de la ville ; ce qui compte davantage, c’est le centre précis, que l’outil classe par prix.` : `Le fichier du jour ne permet pas de comparer les arrondissements. L’outil classe les centres de la ville par prix et par distance.` },
        { q: 'Combien coûte le contrôle d’un scooter à Marseille ?', a: `${x.v.s.cy ? `Les centres marseillais qui contrôlent les cyclomoteurs déclarent ${h.prix(x.v.s.cy.med)} en médiane pour un 50 cm³` : 'Peu de centres marseillais déclarent un prix pour les 50 cm³'}, ${x.v.s.m ? `et ${h.prix(x.v.s.m.med)} pour une moto` : 'et l’offre moto reste réduite'}. Tous les centres ne sont pas équipés pour les deux-roues : choisissez « Scooter ou cyclomoteur » dans l’outil pour n’afficher que ceux qui le sont.` },
        { q: 'La contre-visite est-elle gratuite dans les centres de Marseille ?', a: `${x.v.cv!.gratuite > 0 ? `Elle peut l’être : ${h.pct(x.v.cv!.gratuite, 0)} des centres de la ville annoncent une contre-visite à 0 € dans certains cas, en général après un contrôle fait chez eux.` : 'Aucun centre de la ville n’annonce de contre-visite gratuite dans le fichier du jour.'} Sinon, comptez entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane, selon qu’il suffit d’un contrôle visuel ou qu’il faut repasser sur les bancs.` },
        { q: 'Les Bouches-du-Rhône sont-elles plus chères que les départements voisins pour le contrôle technique ?', a: `Voici les médianes d’un contrôle voiture essence, du moins cher au plus cher, dans les Bouches-du-Rhône et deux voisins : ${listeVoisins(h)}. Les écarts entre départements restent plus faibles que ceux entre deux centres d’une même ville : comparer autour de chez soi rapporte davantage que changer de département.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), ex = extremesArr(h), mc = x.v.moinsCher!;
      return `<h2>Une commune immense, des centres dans presque tous les quartiers</h2>
<p>Marseille s’étend sur plus de 240 kilomètres carrés, des quartiers nord jusqu’aux calanques. Contrairement à Paris, les centres de contrôle n’y sont pas repoussés hors de la commune : on en trouve dans la plupart des seize arrondissements, souvent le long des grands axes et près des zones artisanales. Le fichier de la DGCCRF en recense ${h.num(x.v.n)} qui déclarent un prix pour les voitures, répartis sur ${ex ? h.num(ex.n) : 'plusieurs'} codes postaux.</p>
<p>Le prix médian y est de ${h.prix(x.e!.med)} pour une voiture essence ou diesel. Le département des Bouches-du-Rhône se situe à ${h.prix(x.depMed)}, soit ${x.cmp(x.depMed, x.natMed)} la France entière. Les motorisations hybrides et électriques se paient ${x.v.s.el ? `${h.prix(x.v.s.el.med)} en médiane dans la ville` : 'un peu plus cher'}, ${x.v.s.el ? x.cmp(x.v.s.el.med, x.e!.med) : 'que'} l’essence, alors que l’examen d’une électrique ne comporte pas de mesure des gaz d’échappement.</p>
${x.arrTable(`Contrôle d’une voiture essence par code postal à Marseille, fichier du ${x.fichier}`)}
<p>${ex ? `Le tableau montre des médianes serrées : de ${h.prix(ex.bas[1].med)} dans le ${ex.bas[0]} à ${h.prix(ex.haut[1].med)} dans le ${ex.haut[0]}.` : ''} Le centre le moins cher de la ville, dans le ${arrNom(mc.cp, true)} arrondissement, déclare ${h.prix(mc.p)} ; le plus cher ${h.prix(x.v.plusCher!.p)}. Sur un même trajet domicile-travail, il est donc souvent possible de gagner une dizaine d’euros en choisissant le bon centre plutôt que le plus proche.</p>
<h2>Deux-roues : une ville de scooters</h2>
<p>Les deux-roues motorisés sont nombreux à Marseille, et ils doivent passer le contrôle technique depuis avril 2024 selon un calendrier qui dépend de leur année de mise en circulation. L’offre reste pourtant plus mince que pour les voitures : ${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre de la ville déclare', 'centres de la ville déclarent')} un prix moto, médiane ${h.prix(x.v.s.m.med)}` : 'peu de centres de la ville déclarent un prix moto'}${x.v.moinsCherMoto ? `, le moins cher étant à ${x.v.moinsCherMoto.v} (${h.prix(x.v.moinsCherMoto.p)})` : ''}. Un scooter de 50 cm³ passe dans les mêmes centres, à un tarif en général un peu inférieur.</p>
<!--mini:deuxRouesPrix_13-->
<p>Le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')} détaille les échéances par année. Un deux-roues mis en circulation avant 2020 est déjà en retard ; ceux de 2020 et 2021 doivent passer en 2026.</p>
<h2>Autour de Marseille</h2>
<p>Dans un rayon de 15 km, la liste compte ${h.num(x.v.n15)} centres pour une médiane de ${h.prix(x.e15!.med)}. Les communes voisines qui apparaissent dans ce rayon sont peu nombreuses, parce que le relief des massifs de l’Étoile, du Garlaban et des calanques ferme la ville sur trois côtés. Pour aller plus loin, choisissez un rayon de 20 ou 30 km dans l’outil : Aubagne, la vallée de l’Huveaune et l’étang de Berre entrent alors dans la recherche.</p>
${x.voisinesTable(`Communes voisines de Marseille : contrôle voiture essence, fichier du ${x.fichier}`)}
<p>À l’échelle régionale, les départements voisins se classent ainsi, du moins cher au plus cher : ${listeVoisins(h)}. Pour la Côte d’Azur, voir la page ${h.a('controle-technique-nice', 'Nice')} ; pour un classement complet, la page ${h.a('departements', 'des départements')}.</p>
<h2>Échouer au contrôle à Marseille : la contre-visite</h2>
<p>Un contrôle défavorable impose une contre-visite dans les deux mois. Les centres marseillais la déclarent entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} d’entre eux annoncent une contre-visite gratuite dans certains cas : posez la question avant de réserver.` : 'Aucun n’annonce de contre-visite gratuite dans le fichier du jour.'} Rien n’oblige à revenir dans le même centre.</p>
<!--mini:contreVisite-->
<p>Les délais, la différence entre défaillance majeure et critique, et ce qui se passe après deux mois sont expliqués sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Des tarifs à vérifier sur place</h2>
<p>${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres de la ville déclarent un prix voiture appliqué avant 2023.` : ''} Beaucoup n’ont simplement pas changé leurs tarifs, mais d’autres ont pu les relever sans mettre à jour leur fiche. Le prix affiché à l’accueil, obligatoire, est celui qui s’applique. L’astérisque de la liste signale les tarifs de plus de trois ans. Pour payer moins sans changer de quartier, le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')} rassemble les bons réflexes.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-marseille',
    nav: 'Marseille',
    card: 'The centres in Marseille’s sixteen districts and their declared prices.',
    title: 'Contrôle technique in Marseille: prices by district',
    description: 'Contrôle technique prices in Marseille: median by arrondissement, cheapest centre, motorbikes and scooters, free or paid re-inspection. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Marseille: prices district by district',
    intro: 'The prices every Marseille centre declares to the DGCCRF, from the 1st to the 16th arrondissement, for a car, a motorbike or a scooter.',
    resume: (h) => {
      const x = ville(h, SLUG), mc = x.v.moinsCher!, mc15 = x.v.moinsCher15!;
      const meme = mc15.v === mc.v && mc15.p === mc.p;
      return `In Marseille, a contrôle technique (France’s compulsory roadworthiness test) for a petrol or diesel car costs ${h.prix(x.e!.med)} at the median, ${x.cmp(x.e!.med, x.natMed)} the French median of ${h.prix(x.natMed)}. The city has ${x.nb(x.v.n, 'approved centre', 'approved centres')} declaring a car price, ranging from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. The commune is so large that a 15 km radius around its centre stays almost entirely inside Marseille: it holds ${h.num(x.v.n15)} centres, with a median of ${h.prix(x.e15!.med)}. ${meme ? `The cheapest in that radius is in the city itself, in ${mc.v}, at ${h.prix(mc.p)}.` : `The cheapest in that radius, in ${mc15.v}, charges ${h.prix(mc15.p)}; inside Marseille the lowest is ${h.prix(mc.p)}.`} A re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. These are the prices each centre reports to the authorities, in the public file read today (${x.fichier}): pick your district or town in the tool to see the sorted list.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), ex = extremesArr(h);
      return [
        { q: 'Which Marseille arrondissement has the cheapest contrôle technique?', a: ex ? `Of the ${h.num(ex.n)} Marseille postcodes with a centre, the lowest median is in ${ex.bas[0]} (${h.prix(ex.bas[1].med)}) and the highest in ${ex.haut[0]} (${h.prix(ex.haut[1].med)}). The gap is modest across the city; what matters more is the individual centre, which the tool ranks by price.` : 'Today’s file does not allow a district comparison. The tool ranks the city’s centres by price and distance.' },
        { q: 'How much is a scooter test in Marseille?', a: `${x.v.s.cy ? `Marseille centres that test mopeds declare ${h.prix(x.v.s.cy.med)} at the median for a 50 cc` : 'Few Marseille centres declare a price for 50 cc mopeds'}, ${x.v.s.m ? `and ${h.prix(x.v.s.m.med)} for a motorbike` : 'and the motorbike choice is limited'}. Not every centre is equipped for two-wheelers: pick “50 cc scooter or moped” in the tool to show only those that are.` },
        { q: 'Is the re-inspection free at Marseille centres?', a: `${x.v.cv!.gratuite > 0 ? `It can be: ${h.pct(x.v.cv!.gratuite, 0)} of the city’s centres say the re-check costs €0 in some cases, usually after a test taken with them.` : 'No centre in the city declares a free re-check in today’s file.'} Otherwise allow between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median, depending on whether a visual check is enough or the car must go back on the equipment.` },
        { q: 'Is Bouches-du-Rhône dearer than its neighbours for the contrôle technique?', a: `Here are the medians for a petrol car test, from cheapest to dearest, in Bouches-du-Rhône and two neighbours: ${listeVoisins(h)}. Gaps between départements are smaller than those between two centres in the same city: comparing near home pays more than changing département.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), ex = extremesArr(h), mc = x.v.moinsCher!;
      return `<h2>A huge commune with centres in most districts</h2>
<p>Marseille covers more than 240 square kilometres, from the northern districts to the calanques. Unlike Paris, inspection centres have not been pushed out of the city: most of the sixteen arrondissements have one, often along the main roads and near small industrial estates. The DGCCRF file lists ${h.num(x.v.n)} that declare a car price, spread over ${ex ? h.num(ex.n) : 'several'} postcodes.</p>
<p>The median price is ${h.prix(x.e!.med)} for a petrol or diesel car. The Bouches-du-Rhône département as a whole stands at ${h.prix(x.depMed)}, ${x.cmp(x.depMed, x.natMed)} France overall. Hybrids and electric cars cost ${x.v.s.el ? `${h.prix(x.v.s.el.med)} at the median in the city` : 'a little more'}, ${x.v.s.el ? x.cmp(x.v.s.el.med, x.e!.med) : 'than'} petrol, even though an electric car has no exhaust to measure.</p>
${x.arrTable(`Petrol car test by Marseille postcode, file of ${x.fichier}`)}
<p>${ex ? `The table shows tightly grouped medians: from ${h.prix(ex.bas[1].med)} in ${ex.bas[0]} to ${h.prix(ex.haut[1].med)} in ${ex.haut[0]}.` : ''} The cheapest centre in the city, in the ${arrNom(mc.cp, false)} arrondissement, declares ${h.prix(mc.p)}; the dearest ${h.prix(x.v.plusCher!.p)}. On the same commute you can often save around ten euros by choosing the right centre rather than the nearest.</p>
<h2>Two-wheelers: a city of scooters</h2>
<p>Motorised two-wheelers are everywhere in Marseille, and since April 2024 they must pass the contrôle technique on a timetable set by their year of first registration. The choice of centres is still thinner than for cars: ${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre in the city declares', 'centres in the city declare')} a motorbike price, median ${h.prix(x.v.s.m.med)}` : 'few centres in the city declare a motorbike price'}${x.v.moinsCherMoto ? `, the cheapest being in ${x.v.moinsCherMoto.v} (${h.prix(x.v.moinsCherMoto.p)})` : ''}. A 50 cc scooter goes through the same centres, usually for a little less.</p>
<!--mini:deuxRouesPrix_13-->
<p>The ${h.a('controle-technique-moto', 'motorcycle guide')} sets out the deadlines year by year. A two-wheeler first registered before 2020 is already overdue; those from 2020 and 2021 must be tested in 2026.</p>
<h2>Around Marseille</h2>
<p>Within 15 km the list holds ${h.num(x.v.n15)} centres, with a median of ${h.prix(x.e15!.med)}. Few neighbouring towns fall inside that radius, because the Étoile and Garlaban hills and the calanques close the city in on three sides. To look further, pick 20 or 30 km in the tool: Aubagne, the Huveaune valley and the Étang de Berre then enter the search.</p>
${x.voisinesTable(`Towns near Marseille: petrol car test, file of ${x.fichier}`)}
<p>Across the region, the neighbouring départements rank as follows, cheapest first: ${listeVoisins(h)}. For the Riviera, see the ${h.a('controle-technique-nice', 'Nice page')}; for the full ranking, the ${h.a('departements', 'départements page')}.</p>
<h2>Failing the test in Marseille: the re-inspection</h2>
<p>A fail means a re-inspection (contre-visite) within two months. Marseille centres declare it at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} of them say it is free in some cases: ask before you book.` : 'None declares a free re-check in today’s file.'} You do not have to go back to the same centre.</p>
<!--mini:contreVisite-->
<p>Deadlines, the difference between major and critical defects, and what happens after two months are explained on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Prices to check on the spot</h2>
<p>${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of the city’s centres declare a car price applied before 2023.` : ''} Many have simply kept their prices, but others may have raised them without updating their record. The price displayed at the desk, which is compulsory, is the one that applies. The asterisk in the list flags prices more than three years old. To pay less without leaving your district, the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')} gathers the useful habits.</p>`;
    },
  },
});

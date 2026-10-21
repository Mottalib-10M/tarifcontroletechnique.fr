import { defineGuide } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';
import type { Helpers } from '../../lib/guide-types';

/** Les trois départements de la petite couronne, du moins cher au plus cher (médiane essence du jour). */
const couronne = (h: Helpers) => ['92', '93', '94'].map((d) => ({ d, nom: h.dep(d), med: (h.S.depts as Record<string, { s: { e: { med: number } } }>)[d].s.e.med })).sort((a, b) => a.med - b.med);
const liste = (h: Helpers) => couronne(h).map((c) => `${c.nom} ${h.prix(c.med)}`).join(', ');

const SLUG = 'paris';

export default defineGuide({
  id: 'controle-technique-paris',
  group: 'villes',
  order: 1,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'contre-visite', 'controle-technique-pas-cher', 'controle-technique-moto', 'quand-faire-controle-technique'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-paris',
    nav: 'Paris',
    card: 'Les centres de Paris intra-muros et de la petite couronne, prix déclarés du jour.',
    title: 'Contrôle technique à Paris : prix par centre, le moins cher',
    description: 'Prix du contrôle technique à Paris, centre par centre : médiane en ville, arrondissements, petite couronne moins chère, contre-visite. Fichier DGCCRF du jour.',
    h1: 'Contrôle technique à Paris : prix de chaque centre',
    intro: 'Les tarifs que chaque centre parisien et de la proche banlieue déclare à la DGCCRF, triés du moins cher au plus cher.',
    resume: (h) => {
      const x = ville(h, SLUG);
      return `Paris intra-muros ne compte que ${x.nb(x.v.n, 'centre de contrôle technique agréé', 'centres de contrôle technique agréés')} pour les voitures, pour plus de deux millions d’habitants : c’est peu, et cela se voit sur les prix. La médiane d’un contrôle essence ou diesel y est de ${h.prix(x.e!.med)}, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}), avec des tarifs qui vont de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. Dans un rayon de 15 km, on trouve en revanche ${h.num(x.v.n15)} centres, dont la médiane tombe à ${h.prix(x.e15!.med)} ; le moins cher de ce rayon, à ${x.v.moinsCher15!.v}, affiche ${h.prix(x.v.moinsCher15!.p)}. Ces chiffres viennent du fichier public où chaque centre déclare ses prix à la DGCCRF, relu ce jour (${x.fichier}) : ce ne sont ni des moyennes d’enquête ni des devis. La contre-visite se paie le plus souvent entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} à Paris. Tapez un arrondissement ou une commune voisine dans l’outil pour voir les centres autour, sans compte ni rendez-vous.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG);
      return [
        { q: 'Pourquoi le contrôle technique coûte-t-il plus cher dans Paris qu’en banlieue ?', a: `Les centres parisiens sont peu nombreux (${h.num(x.v.n)} pour toute la ville) et paient des loyers de locaux d’activité parmi les plus élevés de France, sur des surfaces qui doivent accueillir une fosse ou un pont. Les prix sont libres : chacun les fixe et les affiche. Résultat, la médiane intra-muros est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon de 15 km autour de la ville.` },
        { q: 'Quel arrondissement de Paris a le contrôle technique le moins cher ?', a: `Selon le fichier du jour, le centre le moins cher de Paris est dans le ${x.v.moinsCher!.cp.slice(3) === '01' ? '1er' : `${Number(x.v.moinsCher!.cp.slice(3))}e`} arrondissement, à ${h.prix(x.v.moinsCher!.p)} pour une voiture essence. Les écarts entre arrondissements restent faibles : le tableau de la page donne la médiane de chaque code postal où un centre est installé. Plusieurs arrondissements du centre n’ont aucun centre.` },
        { q: 'Vaut-il la peine de sortir de Paris pour son contrôle technique ?', a: `Pour une voiture, l’écart entre la médiane parisienne et le centre le moins cher à 15 km est de ${h.prix(x.e!.med - x.v.moinsCher15!.p)}. C’est réel, mais un aller-retour en voiture et le temps passé le réduisent. Pour un contrôle à heure fixe, un centre de la petite couronne proche d’un métro ou d’une ligne de bus reste souvent le meilleur compromis.` },
        { q: 'Peut-on passer le contrôle technique d’une moto dans Paris ?', a: `Oui, mais l’offre est mince : ${h.num(x.v.s.m?.n ?? 0)} centres de Paris déclarent un tarif pour les motos, avec une médiane de ${x.v.s.m ? h.prix(x.v.s.m.med) : 'non calculable'}. Les deux-roues passent dans des centres équipés de bancs spécifiques ; choisissez « Moto » dans l’outil pour voir ceux du rayon choisi et leurs prix.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG);
      return `<h2>Le contrôle technique dans Paris intra-muros</h2>
<p>Un centre de contrôle technique a besoin de place : une ligne de contrôle avec fosse ou pont élévateur, des bancs de freinage, un analyseur de gaz, et assez de recul pour faire entrer et sortir les voitures. Dans Paris, ces surfaces se louent cher, et beaucoup d’anciens garages ont été transformés en logements ou en commerces. Il reste ${x.nb(x.v.n, 'centre', 'centres')} qui déclarent un prix pour les voitures dans le fichier de la DGCCRF, répartis surtout dans les arrondissements périphériques, du 11e au 20e. Le centre de Paris, du 1er au 10e, en est presque dépourvu.</p>
<p>Leur médiane est de ${h.prix(x.e!.med)} pour une voiture essence, et le diesel est au même prix dans presque tous les centres. L’hybride et l’électrique se paient ${x.v.s.el ? h.prix(x.v.s.el.med) : 'un peu plus'} en médiane : beaucoup de centres parisiens facturent un supplément pour ces motorisations, alors que l’examen ne dure pas plus longtemps. Le département de Paris se compare ainsi à la France entière : ${x.cmp(x.depMed, x.natMed)} la médiane nationale.</p>
${x.arrTable(`Prix d’un contrôle voiture essence par code postal parisien, fichier du ${x.fichier}`)}
<h2>La petite couronne, souvent moins chère</h2>
<p>Dès qu’on passe le périphérique, l’offre change d’échelle : ${h.num(x.v.n15)} centres dans un rayon de 15 km autour du centre de Paris, avec une médiane de ${h.prix(x.e15!.med)}. Les trois départements de la petite couronne, du moins cher au plus cher en médiane : ${liste(h)}. Même dans le plus cher des trois, quelques centres restent sous la médiane parisienne. Le tableau ci-dessous classe les communes voisines par distance, avec leur médiane et leur centre le moins cher.</p>
${x.voisinesTable(`Communes voisines de Paris : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<p>Le calcul de l’économie ne se limite pas au prix affiché. Un centre de ${x.v.moinsCher15!.v} moins cher de ${h.prix(x.e!.med - x.v.moinsCher15!.p)} ne vaut le détour que si l’on y va sans perdre une demi-journée ; plusieurs se trouvent près d’une station de métro ou du RER, ce qui permet de déposer la voiture et de revenir la chercher. Un contrôle dure en général 30 à 45 minutes ; demandez au centre s’il travaille avec ou sans rendez-vous.</p>
<h2>Motos, scooters et Vélib’ exceptés</h2>
<p>Depuis le 15 avril 2024, les deux-roues motorisés passent eux aussi le contrôle technique, et Paris en compte beaucoup. ${x.v.s.m ? `Dans la ville, ${x.nb(x.v.s.m.n, 'centre déclare', 'centres déclarent')} un tarif moto, avec une médiane de ${h.prix(x.v.s.m.med)}` : 'Peu de centres parisiens déclarent un tarif moto'} ; dans les 15 km, ${x.v.s15.m ? `${h.num(x.v.s15.m.n)} centres, médiane ${h.prix(x.v.s15.m.med)}` : 'l’offre reste réduite'}. Le calendrier dépend de l’année de mise en circulation, détaillé dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>
<!--mini:moto-->
<h2>Contre-visite à Paris</h2>
<p>Un contrôle défavorable laisse deux mois pour réparer et repasser. À Paris, la contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} (vérification visuelle d’une réparation) et ${h.prix(x.v.cv!.max.med)} (nouveau passage sur les bancs), en médiane. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} des centres parisiens annoncent une contre-visite gratuite dans certains cas.` : 'Aucun centre parisien n’annonce de contre-visite gratuite.'} Il n’y a aucune obligation de la faire dans le même centre que le premier contrôle : comparer vaut aussi pour elle. Les règles et les délais sont sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>Lire les prix avec prudence</h2>
<p>${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres parisiens déclarent un tarif voiture daté d’avant 2023.` : ''} Un centre est tenu d’afficher ses prix à l’accueil et sur son site, et de les déclarer pour le site public de comparaison ; certains oublient de mettre à jour la déclaration quand ils changent leur tarif. L’astérisque de la liste signale ces prix anciens. Le prix affiché au centre le jour du contrôle est celui qui s’applique : en cas d’écart, la DGCCRF reçoit les signalements sur SignalConso.</p>
<p>Aucun centre n’est mis en avant ici contre rémunération : l’ordre de la liste est celui du prix, puis de la distance. Pour comparer avec d’autres villes, la page ${h.a('departements', 'des départements')} classe les 101 départements par prix médian.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-paris',
    nav: 'Paris',
    card: 'Every centre in central Paris and the inner suburbs, with today’s declared prices.',
    title: 'Contrôle technique in Paris: price by centre, the cheapest',
    description: 'Contrôle technique prices in Paris, centre by centre: median inside the city, by arrondissement, cheaper inner suburbs, re-inspection cost. Today’s DGCCRF data.',
    h1: 'Contrôle technique in Paris: every centre’s price',
    intro: 'The prices each centre in Paris and the nearby suburbs declares to the DGCCRF, sorted from cheapest to dearest.',
    resume: (h) => {
      const x = ville(h, SLUG);
      return `Central Paris has only ${x.nb(x.v.n, 'approved contrôle technique centre', 'approved contrôle technique centres')} for cars, for more than two million residents, and it shows in the prices. The median for a petrol or diesel car is ${h.prix(x.e!.med)}, ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}), with prices from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. Within 15 km, though, there are ${h.num(x.v.n15)} centres and the median drops to ${h.prix(x.e15!.med)}; the cheapest one in that radius, in ${x.v.moinsCher15!.v}, charges ${h.prix(x.v.moinsCher15!.p)}. These figures come from the public file in which every centre declares its prices to the DGCCRF, France’s consumer protection authority, read today (${x.fichier}): they are neither survey averages nor quotes. A re-inspection (contre-visite) usually costs between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} in Paris. Type an arrondissement or a nearby town into the tool to see the centres around it, with no account and no booking.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG);
      return [
        { q: 'Why is the contrôle technique dearer inside Paris than in the suburbs?', a: `There are few centres in Paris (${h.num(x.v.n)} for the whole city) and they pay some of the highest commercial rents in France, for premises big enough to hold an inspection pit or lift. Prices are free: each centre sets and displays its own. As a result, the median inside the city is ${x.cmp(x.e!.med, x.e15!.med)} the median within 15 km of it.` },
        { q: 'Which Paris arrondissement has the cheapest contrôle technique?', a: `In today’s file, the cheapest centre in Paris is in the ${x.v.moinsCher!.cp.slice(3) === '01' ? '1st' : `${Number(x.v.moinsCher!.cp.slice(3))}th`} arrondissement, at ${h.prix(x.v.moinsCher!.p)} for a petrol car. The gaps between arrondissements are small: the table on this page gives the median for every postcode with a centre. Several central arrondissements have no centre at all.` },
        { q: 'Is it worth leaving Paris for a cheaper contrôle technique?', a: `For a car, the gap between the Paris median and the cheapest centre within 15 km is ${h.prix(x.e!.med - x.v.moinsCher15!.p)}. That is real money, but a round trip and the time spent eat into it. For a test at a fixed time, an inner-suburb centre close to a metro or bus line is often the best compromise.` },
        { q: 'Can I get a motorcycle tested inside Paris?', a: `Yes, but the choice is thin: ${h.num(x.v.s.m?.n ?? 0)} Paris centres declare a motorcycle price, with a median of ${x.v.s.m ? h.prix(x.v.s.m.med) : 'too few to compute'}. Two-wheelers are tested in centres with dedicated equipment; pick “Motorcycle” in the tool to see those within your chosen distance and their prices.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG);
      return `<h2>The contrôle technique inside Paris</h2>
<p>An inspection centre needs space: a test lane with a pit or lift, brake rollers, an exhaust gas analyser, and room to drive cars in and out. In Paris that space is expensive, and many old garages have become flats or shops. ${x.nb(x.v.n, 'centre still declares', 'centres still declare')} a car price in the DGCCRF file, mostly in the outer arrondissements, from the 11th to the 20th. The centre of the city, from the 1st to the 10th, has almost none.</p>
<p>Their median is ${h.prix(x.e!.med)} for a petrol car, and diesel costs the same at nearly every centre. Hybrids and electric cars pay ${x.v.s.el ? h.prix(x.v.s.el.med) : 'a little more'} at the median: many Paris centres add a surcharge for them, even though the test takes no longer. The Paris département as a whole sits ${x.cmp(x.depMed, x.natMed)} the French median.</p>
${x.arrTable(`Price of a petrol car test by Paris postcode, file of ${x.fichier}`)}
<h2>The inner suburbs are often cheaper</h2>
<p>Once past the ring road (the périphérique), the choice changes scale: ${h.num(x.v.n15)} centres within 15 km of central Paris, with a median of ${h.prix(x.e15!.med)}. The three inner-suburb départements, from cheapest to dearest at the median: ${liste(h)}. Even the dearest of the three has a few centres below the Paris median. The table below lists neighbouring towns by distance, with their median and their cheapest centre.</p>
${x.voisinesTable(`Towns near Paris: price of a petrol car test, file of ${x.fichier}`)}
<p>The saving is not just the price on the board. A centre in ${x.v.moinsCher15!.v} that is ${h.prix(x.e!.med - x.v.moinsCher15!.p)} cheaper is only worth it if getting there does not cost half a day; several are near a metro or RER station, so you can drop the car off and come back for it. A test usually takes 30 to 45 minutes; ask the centre whether it works by appointment or takes walk-ins.</p>
<h2>Motorbikes and scooters</h2>
<p>Since 15 April 2024 motorised two-wheelers must pass the contrôle technique too, and Paris has a great many of them. ${x.v.s.m ? `Inside the city, ${x.nb(x.v.s.m.n, 'centre declares', 'centres declare')} a motorcycle price, with a median of ${h.prix(x.v.s.m.med)}` : 'Few Paris centres declare a motorcycle price'}; within 15 km, ${x.v.s15.m ? `${h.num(x.v.s15.m.n)} centres, median ${h.prix(x.v.s15.m.med)}` : 'the choice is still limited'}. When yours is due depends on the year it was first registered, as set out in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<!--mini:moto-->
<h2>Re-inspection in Paris</h2>
<p>A failed test leaves two months to repair and come back. In Paris the re-inspection is declared at between ${h.prix(x.v.cv!.min.med)} (visual check of a repair) and ${h.prix(x.v.cv!.max.med)} (a new pass on the equipment), at the median. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} of Paris centres say the re-check is free in some cases.` : 'No Paris centre declares a free re-check.'} You do not have to go back to the same centre: comparing pays here too. The rules and deadlines are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Reading the prices with care</h2>
<p>${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of Paris centres declare a car price dated before 2023.` : ''} A centre must display its prices at the desk and on its website, and declare them for the public comparison site; some forget to update the declaration when they change their price. The asterisk in the list flags these old prices. The price displayed at the centre on the day is the one that applies; if it differs, the DGCCRF takes reports through SignalConso.</p>
<p>No centre is promoted here for money: the list is ordered by price, then distance. To compare with other areas, the ${h.a('departements', 'départements page')} ranks all 101 départements by median price.</p>`;
    },
  },
});

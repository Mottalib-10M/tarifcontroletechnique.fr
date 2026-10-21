import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'lyon';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
const voisins = (h: Helpers) => ['69', '01', '38', '42'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
/** Médiane de Villeurbanne, si elle figure parmi les communes voisines du fichier. */
const villeurbanne = (h: Helpers) => ville(h, SLUG).v.voisines.find((x) => x.nom === 'Villeurbanne');
/** Rive gauche (3e, 6e, 7e, 8e) contre rive droite et presqu'île (1er, 2e, 4e, 5e, 9e) : nombre de centres déclarés. */
const rives = (h: Helpers) => {
  const a = ville(h, SLUG).v.arr ?? {};
  const n = (cps: string[]) => cps.reduce((t, cp) => t + (a[cp]?.n ?? 0), 0);
  return { gauche: n(['69003', '69006', '69007', '69008']), droite: n(['69001', '69002', '69004', '69005', '69009']) };
};

export default defineGuide({
  id: 'controle-technique-lyon',
  group: 'villes',
  order: 3,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-electrique', 'contre-visite', 'controle-technique-grenoble', 'controle-technique-saint-etienne'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-lyon',
    nav: 'Lyon',
    card: 'Lyon, Villeurbanne et la métropole : les prix déclarés centre par centre.',
    title: 'Contrôle technique à Lyon : prix des centres de la métropole',
    description: 'Contrôle technique à Lyon : prix de chaque centre, médiane par arrondissement, Villeurbanne et l’est lyonnais, électrique, contre-visite. Fichier du jour.',
    h1: 'Contrôle technique à Lyon et dans la métropole',
    intro: 'Les prix déclarés à la DGCCRF par les centres de Lyon et des communes voisines, pour votre véhicule, du moins cher au plus cher.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `Dans Lyon même, un contrôle technique de voiture essence ou diesel se paie ${h.prix(x.e!.med)} en médiane, ${x.cmp(x.e!.med, x.natMed)} la médiane française (${h.prix(x.natMed)}). Les ${x.nb(x.v.n, 'centre agréé de la ville déclare', 'centres agréés de la ville déclarent')} des tarifs allant de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. La métropole change l’échelle : dans un rayon de 15 km, ${h.num(x.v.n15)} centres affichent une médiane de ${h.prix(x.e15!.med)}, et le moins cher, à ${mc15.v}, déclare ${h.prix(mc15.p)}, soit ${h.prix(x.e!.med - mc15.p)} de moins que la médiane lyonnaise. Pour une hybride ou une électrique, la médiane de la ville monte à ${x.v.s.el ? h.prix(x.v.s.el.med) : 'un niveau plus élevé'}. La contre-visite coûte entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Tous ces chiffres sont tirés du fichier public où chaque centre déclare ses prix à l’administration, relu ce jour (${x.fichier}) ; l’outil liste les centres autour de l’arrondissement ou de la commune que vous tapez.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), vb = villeurbanne(h);
      return [
        { q: 'Le contrôle technique est-il moins cher à Villeurbanne qu’à Lyon ?', a: vb ? `Dans le fichier du jour, la médiane de Villeurbanne est de ${h.prix(vb.s.med)} pour ${x.nb(vb.s.n, 'centre', 'centres')}, contre ${h.prix(x.e!.med)} dans Lyon. Elle est donc ${x.sens(vb.s.med, x.e!.med)}. Villeurbanne touche les 3e et 6e arrondissements : pour un Lyonnais de la rive gauche, ses centres sont souvent aussi proches que ceux de la ville.` : `Villeurbanne n’apparaît pas parmi les communes voisines du fichier du jour. L’outil, réglé sur 10 km autour de Lyon, en montre les centres s’il y en a.` },
        { q: 'Quels arrondissements de Lyon ont un centre de contrôle technique ?', a: `Les centres lyonnais se trouvent surtout sur la rive gauche du Rhône et dans le 9e : le tableau de la page donne, pour chaque code postal qui en compte, le nombre de centres et la médiane. La Presqu’île et la Croix-Rousse n’en ont presque pas, faute de locaux assez grands pour une ligne de contrôle.` },
        { q: 'Combien coûte le contrôle technique d’une voiture électrique à Lyon ?', a: `${x.v.s.el ? `La médiane lyonnaise est de ${h.prix(x.v.s.el.med)} pour une électrique, ${x.cmp(x.v.s.el.med, x.e!.med)} l’essence dans la même ville.` : 'Peu de centres lyonnais déclarent un prix électrique.'} ${x.v.s15.el ? `Dans les 15 km, elle tombe à ${h.prix(x.v.s15.el.med)}.` : ''} Le supplément est une pratique commerciale : certains centres facturent toutes les motorisations au même prix.` },
        { q: 'Où faire contrôler sa moto à Lyon ?', a: `${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre de Lyon déclare', 'centres de Lyon déclarent')} un prix moto, médiane ${h.prix(x.v.s.m.med)}.` : 'Très peu de centres lyonnais déclarent un prix moto.'} ${x.v.s15.m ? `Dans un rayon de 15 km, le choix passe à ${h.num(x.v.s15.m.n)} centres, médiane ${h.prix(x.v.s15.m.med)}.` : ''} Choisissez « Moto » dans l’outil pour ne garder que les centres équipés. Tous les centres n’ont pas le banc ni la place qu’exige un deux-roues : mieux vaut vérifier avant de se déplacer.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), r = rives(h), vb = villeurbanne(h);
      return `<h2>Peu de centres dans Lyon, beaucoup autour</h2>
<p>Lyon intra-muros compte ${x.nb(x.v.n, 'centre', 'centres')} de contrôle technique qui déclarent un prix voiture. Ils sont concentrés là où l’on trouve encore des locaux d’activité : ${h.num(r.gauche)} sur la rive gauche du Rhône (3e, 6e, 7e et 8e arrondissements) et ${h.num(r.droite)} sur la rive droite et la Presqu’île, presque tous dans le 9e, vers Vaise. Le cœur historique, entre Rhône et Saône, n’en a pratiquement aucun.</p>
${x.arrTable(`Contrôle d’une voiture essence par code postal lyonnais, fichier du ${x.fichier}`)}
<p>Hors de la ville, la métropole aligne ${h.num(x.v.n15)} centres dans un rayon de 15 km, installés dans les zones d’activité de l’est et du sud. Leur médiane, ${h.prix(x.e15!.med)}, est ${x.cmp(x.e15!.med, x.e!.med)} celle de Lyon. Le département du Rhône, métropole comprise, se situe à ${h.prix(x.depMed)}.</p>
<h2>Villeurbanne, Vénissieux et l’est lyonnais</h2>
<p>${vb ? `Villeurbanne, collée aux 3e et 6e arrondissements, compte ${x.nb(vb.s.n, 'centre', 'centres')} pour une médiane de ${h.prix(vb.s.med)}.` : 'Villeurbanne prolonge directement la rive gauche.'} Plus au sud et à l’est, les communes industrielles ont gardé de grandes parcelles où les centres se sont installés côte à côte, ce qui entretient la concurrence. Le tableau des communes voisines, trié par distance, donne pour chacune le nombre de centres, la médiane et le prix le plus bas.</p>
${x.voisinesTable(`Communes voisines de Lyon : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Le centre le moins cher dans les 15 km est à ${x.v.moinsCher15!.v}, à ${h.prix(x.v.moinsCher15!.p)}${x.v.moinsCher15!.ex > 1 ? `, prix que ${x.nb(x.v.moinsCher15!.ex - 1, 'autre centre partage', 'autres centres partagent')}` : ''}. Dans Lyon, le plus bas est au ${x.v.moinsCher!.v.replace('Lyon ', '')}, à ${h.prix(x.v.moinsCher!.p)}. Avant de traverser la ville pour quelques euros, comptez le temps passé dans les bouchons du périphérique ou de la rocade est : l’outil donne la distance de chaque centre à vol d’oiseau.</p>
<!--mini:devis_69-->
<h2>Électrique et hybride : un supplément fréquent</h2>
<p>Les hybrides et les électriques passent de plus en plus souvent sur les lignes de contrôle lyonnaises, et beaucoup de centres les facturent à part : ${x.v.s.el ? `la médiane d’un contrôle électrique y est de ${h.prix(x.v.s.el.med)}, ${x.cmp(x.v.s.el.med, x.e!.med)} l’essence` : 'peu de centres y déclarent un prix électrique'}. Aucun texte n’impose ce supplément. Le contrôle d’une électrique suit la même liste de points, sans l’analyse des gaz d’échappement ; certains centres facturent donc le même prix pour toutes les motorisations. Le mini-simulateur compare les deux tarifs pour le département de votre choix.</p>
<!--mini:elecDept_69-->
<p>Les raisons de cet écart et la façon de trouver un centre sans supplément sont détaillées dans le guide ${h.a('controle-technique-electrique', 'du contrôle technique d’une voiture électrique')}.</p>
<h2>Le Rhône parmi ses voisins</h2>
<p>Comparé aux départements qui l’entourent, le Rhône se classe ainsi (médiane essence, du moins cher au plus cher) : ${voisins(h)}. Les habitants de l’ouest lyonnais ou du nord-Isère ont donc parfois intérêt à regarder de l’autre côté de la limite départementale ; aucune règle n’attache une voiture au département de sa carte grise. Voir aussi les pages ${h.a('controle-technique-saint-etienne', 'Saint-Étienne')} et ${h.a('controle-technique-grenoble', 'Grenoble')}, et le classement complet des ${h.a('departements', 'départements')}.</p>
<h2>Contre-visite et tarifs anciens</h2>
<p>Si le contrôle est défavorable, la contre-visite doit avoir lieu dans les deux mois. Les centres lyonnais la déclarent entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane${x.v.cv!.gratuite > 0 ? `, et ${h.pct(x.v.cv!.gratuite, 0)} d’entre eux la proposent parfois gratuitement` : ' ; aucun ne l’annonce gratuite dans le fichier du jour'}. Les délais et les cas où l’on peut encore rouler sont sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<p>${x.v.ancien != null ? `Enfin, ${h.pct(x.v.ancien, 0)} des centres de la ville déclarent un tarif voiture daté d’avant 2023.` : ''} Un tarif ancien n’est pas forcément faux, mais il mérite un coup de fil : l’affichage à l’accueil du centre fait foi. Les autres moyens de payer moins sont réunis dans le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-lyon',
    nav: 'Lyon',
    card: 'Lyon, Villeurbanne and the metropolitan area: declared prices centre by centre.',
    title: 'Contrôle technique in Lyon: prices across the metro area',
    description: 'Contrôle technique in Lyon: every centre’s price, median by arrondissement, Villeurbanne and the eastern suburbs, electric cars, re-inspection. Today’s data.',
    h1: 'Contrôle technique in Lyon and its metro area',
    intro: 'The prices that centres in Lyon and nearby towns declare to the DGCCRF, for your vehicle, from cheapest to dearest.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `Inside Lyon itself, a contrôle technique (the compulsory French roadworthiness test) for a petrol or diesel car costs ${h.prix(x.e!.med)} at the median, ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}). The city’s ${x.nb(x.v.n, 'approved centre declares', 'approved centres declare')} prices from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. The metro area changes the picture: within 15 km, ${h.num(x.v.n15)} centres show a median of ${h.prix(x.e15!.med)}, and the cheapest, in ${mc15.v}, declares ${h.prix(mc15.p)}, ${h.prix(x.e!.med - mc15.p)} below the Lyon median. For a hybrid or electric car the city median rises to ${x.v.s.el ? h.prix(x.v.s.el.med) : 'a higher level'}. A re-inspection (contre-visite) costs between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. All these figures come from the public file in which each centre declares its prices to the authorities, read today (${x.fichier}); the tool lists the centres around the district or town you type.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), vb = villeurbanne(h);
      return [
        { q: 'Is the contrôle technique cheaper in Villeurbanne than in Lyon?', a: vb ? `In today’s file the Villeurbanne median is ${h.prix(vb.s.med)} across ${x.nb(vb.s.n, 'centre', 'centres')}, against ${h.prix(x.e!.med)} in Lyon, so it is ${x.sens(vb.s.med, x.e!.med, ['dearer', 'cheaper', 'the same price'])}. Villeurbanne borders the 3rd and 6th arrondissements: for anyone on Lyon’s left bank its centres are often as close as the city’s own.` : 'Villeurbanne does not appear among the neighbouring towns in today’s file. The tool, set to 10 km around Lyon, shows its centres if there are any.' },
        { q: 'Which Lyon arrondissements have an inspection centre?', a: 'Lyon’s centres are mostly on the left bank of the Rhône and in the 9th: the table on this page gives, for each postcode that has one, the number of centres and the median. The Presqu’île and Croix-Rousse have almost none, for lack of premises big enough for a test lane.' },
        { q: 'What does an electric car test cost in Lyon?', a: `${x.v.s.el ? `The Lyon median is ${h.prix(x.v.s.el.med)} for an electric car, ${x.cmp(x.v.s.el.med, x.e!.med)} petrol in the same city.` : 'Few Lyon centres declare an electric price.'} ${x.v.s15.el ? `Within 15 km it drops to ${h.prix(x.v.s15.el.med)}.` : ''} The surcharge is a pricing habit: some centres charge every engine type the same. Choose “Electric” in the tool to sort Lyon centres by the price they declare for that engine type.` },
        { q: 'Where can I get my motorbike tested in Lyon?', a: `${x.v.s.m ? `${x.nb(x.v.s.m.n, 'Lyon centre declares', 'Lyon centres declare')} a motorbike price, median ${h.prix(x.v.s.m.med)}.` : 'Very few Lyon centres declare a motorbike price.'} ${x.v.s15.m ? `Within 15 km the choice grows to ${h.num(x.v.s15.m.n)} centres, median ${h.prix(x.v.s15.m.med)}.` : ''} Pick “Motorcycle” in the tool to keep only equipped centres. Not every centre has the bench and the space a two-wheeler needs, so checking before you ride over saves a wasted trip.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), r = rives(h), vb = villeurbanne(h);
      return `<h2>Few centres in Lyon, many around it</h2>
<p>Lyon proper has ${x.nb(x.v.n, 'inspection centre', 'inspection centres')} declaring a car price. They sit where commercial premises still exist: ${h.num(r.gauche)} on the left bank of the Rhône (3rd, 6th, 7th and 8th arrondissements) and ${h.num(r.droite)} on the right bank and the Presqu’île, nearly all in the 9th, towards Vaise. The historic core between the Rhône and the Saône has practically none.</p>
${x.arrTable(`Petrol car test by Lyon postcode, file of ${x.fichier}`)}
<p>Beyond the city, the metro area has ${h.num(x.v.n15)} centres within 15 km, set in the business parks to the east and south. Their median, ${h.prix(x.e15!.med)}, is ${x.cmp(x.e15!.med, x.e!.med)} Lyon’s. The Rhône département, metro area included, stands at ${h.prix(x.depMed)}.</p>
<h2>Villeurbanne, Vénissieux and the eastern suburbs</h2>
<p>${vb ? `Villeurbanne, right next to the 3rd and 6th arrondissements, has ${x.nb(vb.s.n, 'centre', 'centres')} with a median of ${h.prix(vb.s.med)}.` : 'Villeurbanne directly continues the left bank.'} Further south and east, the industrial towns kept large plots where centres set up side by side, which keeps competition alive. The table of neighbouring towns, sorted by distance, gives each one’s number of centres, median and lowest price.</p>
${x.voisinesTable(`Towns near Lyon: petrol car test, file of ${x.fichier}`)}
<p>The cheapest centre within 15 km is in ${x.v.moinsCher15!.v}, at ${h.prix(x.v.moinsCher15!.p)}${x.v.moinsCher15!.ex > 1 ? `, a price ${x.nb(x.v.moinsCher15!.ex - 1, 'other centre shares', 'other centres share')}` : ''}. Inside Lyon the lowest is in ${x.v.moinsCher!.v}, at ${h.prix(x.v.moinsCher!.p)}. Before crossing town for a few euros, allow for the traffic on the ring roads: the tool gives each centre’s straight-line distance.</p>
<!--mini:devis_69-->
<h2>Electric and hybrid: a frequent surcharge</h2>
<p>Hybrids and electric cars come through Lyon’s test lanes more and more often, and many centres price them separately: ${x.v.s.el ? `the median electric test is ${h.prix(x.v.s.el.med)}, ${x.cmp(x.v.s.el.med, x.e!.med)} petrol` : 'few centres declare an electric price'}. No rule requires this surcharge. An electric car follows the same checklist, minus the exhaust gas analysis, so some centres charge the same for every engine type. The mini calculator compares both prices for the département you choose.</p>
<!--mini:elecDept_69-->
<p>The reasons for the gap and how to find a centre without a surcharge are in the ${h.a('controle-technique-electrique', 'electric car guide')}.</p>
<h2>The Rhône and its neighbours</h2>
<p>Against the départements around it, the Rhône ranks as follows (petrol median, cheapest first): ${voisins(h)}. People in western Lyon or northern Isère may therefore gain by looking across the boundary; no rule ties a car to the département on its registration certificate (carte grise). See also the ${h.a('controle-technique-saint-etienne', 'Saint-Étienne')} and ${h.a('controle-technique-grenoble', 'Grenoble')} pages, and the full ${h.a('departements', 'département ranking')}.</p>
<h2>Re-inspection and old prices</h2>
<p>After a fail, the re-inspection (contre-visite) must take place within two months. Lyon centres declare it at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median${x.v.cv!.gratuite > 0 ? `, and ${h.pct(x.v.cv!.gratuite, 0)} of them sometimes offer it free` : '; none declares it free in today’s file'}. Deadlines and when you may still drive are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<p>${x.v.ancien != null ? `Finally, ${h.pct(x.v.ancien, 0)} of the city’s centres declare a car price dated before 2023.` : ''} An old price is not necessarily wrong, but it is worth a phone call: the price displayed at the centre’s desk is what counts. Other ways to pay less are gathered in the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')}.</p>`;
    },
  },
});

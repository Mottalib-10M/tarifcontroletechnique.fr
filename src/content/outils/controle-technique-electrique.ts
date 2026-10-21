import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number };
const N = (h: Helpers) => h.S.national;
const S = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
/** Écart de médiane électrique − essence par département (au moins 10 centres). */
const ecarts = (h: Helpers) => Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, R | undefined> }>)
  .filter(([, d]) => d.centres >= 10 && d.s.e && d.s.el).map(([d, x]) => ({ d, nom: h.dep(d), e: x.s.e!.med, el: x.s.el!.med, x: x.s.el!.med - x.s.e!.med })).sort((a, b) => a.x - b.x || a.d.localeCompare(b.d));
const egal = (h: Helpers) => ecarts(h).filter((x) => x.x <= 0).length;

export default defineGuide({
  id: 'controle-technique-electrique',
  group: 'prix',
  order: 3,
  tool: 'centres',
  vehicule: 'el',
  vehicules: ['el', 'h', 'e', 'd', 'g'],
  related: ['controle-technique-pas-cher', 'departements', 'defaillances-controle-technique', 'quand-faire-controle-technique', 'contre-visite'],
  sources: ['dataset', 'spVoiture', 'spDispense', 'prixConso'],
  fr: {
    slug: 'controle-technique-voiture-electrique',
    nav: 'Électrique et hybride',
    card: 'Le supplément électrique et hybride centre par centre, et où l’éviter.',
    title: 'Contrôle technique voiture électrique : prix et supplément',
    description: 'Contrôle technique d’une voiture électrique ou hybride en 2026 : prix par centre, supplément sur l’essence, centres au prix unique, GPL et GNV, département.',
    h1: 'Contrôle technique électrique et hybride : le vrai prix',
    intro: 'Beaucoup de centres facturent plus cher l’électrique et l’hybride. Voici lesquels, de combien, et ceux qui appliquent le même prix.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `Le contrôle technique d’une voiture électrique coûte ${h.prix(s.el.med)} en médiane en France, celui d’une hybride ${h.prix(s.h.med)}, contre ${h.prix(s.e.med)} pour une voiture essence, d’après les prix déclarés par les centres dans le fichier public de la DGCCRF du ${h.date(h.S.meta.fichier)}. ${h.pct(n.elecPlusCher, 0)} des centres facturent l’électrique plus cher que l’essence. Aucune règle ne l’impose : la liste des points vérifiés est la même, et une électrique n’a pas d’émissions à l’échappement à mesurer. C’est donc un choix commercial du centre, et il est évitable : ${h.pct(1 - n.elecPlusCher, 0)} des centres ne facturent aucun supplément pour l’électrique. L’outil ci-dessus s’ouvre sur la catégorie « Voiture électrique » et classe les centres par prix autour de votre commune ; changez de catégorie pour comparer avec l’essence ou l’hybride dans les mêmes centres. Le gaz (GPL, GNV) est plus cher dans ${h.pct(n.gazPlusCher, 0)} des centres, cette fois pour une raison technique : l’installation est contrôlée en plus.`;
    },
    faqs: (h) => {
      const s = S(h), n = N(h);
      return [
        { q: 'Pourquoi le contrôle technique d’une électrique est-il souvent plus cher ?', a: `Les prix sont libres et beaucoup de centres ont créé une ligne tarifaire à part pour les électriques et les hybrides, souvent alignée sur un tarif plus élevé. ${h.pct(n.elecPlusCher, 0)} des centres facturent l’électrique plus cher que l’essence. L’examen est pourtant le même, sans mesure de pollution à l’échappement. Rien ne vous empêche de choisir un centre au tarif unique.` },
        { q: 'Une voiture électrique doit-elle passer le contrôle technique ?', a: 'Oui, dans les mêmes conditions qu’une voiture thermique : premier contrôle dans les six mois avant le quatrième anniversaire de la mise en circulation, puis tous les deux ans. Seul le contrôle des émissions polluantes ne la concerne pas. Les hybrides, qui ont un moteur thermique, passent aussi le contrôle des émissions.' },
        { q: 'Combien coûte le contrôle technique d’une voiture hybride rechargeable ?', a: `Le fichier public ne distingue pas les hybrides rechargeables des autres : les centres déclarent un seul prix « hybride », dont la médiane nationale est de ${h.prix(s.h.med)}. Quelques centres facturent l’hybride au prix de l’essence, d’autres au prix de l’électrique ; l’outil permet de les comparer en choisissant « Voiture hybride ».` },
        { q: 'Le contrôle technique d’une voiture au GPL coûte-t-il plus cher ?', a: `Oui, dans ${h.pct(n.gazPlusCher, 0)} des centres. Pour une voiture au GPL ou au GNV, le contrôleur vérifie en plus le réservoir, les canalisations et l’étanchéité de l’installation, ce qui prend du temps. La médiane est de ${h.prix(s.g.med)}, contre ${h.prix(s.e.med)} pour l’essence. Moins de centres déclarent ce tarif, ${h.num(s.g.n)} en France.` },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), ec = ecarts(h);
      const top = ec.slice(-4).reverse().map((x) => `${x.nom} (+${h.prix(x.x)})`).join(', ');
      return `<h2>Le supplément, centre par centre</h2>
<p>Le fichier public des prix distingue cinq motorisations pour une voiture : essence, diesel, hybride, électrique et gaz. Chaque centre y déclare un prix pour chacune. En comparant les deux colonnes d’un même centre, on voit qui facture un supplément : ${h.pct(n.elecPlusCher, 0)} des centres demandent plus pour une électrique que pour une essence. La médiane nationale passe de ${h.prix(s.e.med)} à ${h.prix(s.el.med)}, et l’écart dépasse parfois vingt euros dans un même centre.</p>
<p>Dans l’outil, la catégorie « Voiture électrique » est présélectionnée. Pour repérer les centres au tarif unique, passez de « Voiture électrique » à « Voiture essence » : ceux dont le prix ne bouge pas ne facturent aucun supplément. Classés par prix, ils remontent souvent en tête.</p>
<h2>Un examen sans mesure de pollution</h2>
<p>Une voiture électrique passe le même contrôle qu’une thermique : identification, freinage, direction, visibilité, éclairage, liaisons au sol, structure, équipements. La mesure des émissions polluantes à l’échappement ne la concerne pas, faute d’échappement. Rien dans la liste des points ne justifie donc un prix plus élevé. Certains centres invoquent le poids des électriques ou le temps de manipulation ; c’est leur droit, puisque le prix est libre, mais ce n’est pas une obligation.</p>
<p>Le poids, en revanche, se ressent sur l’usure : pneus et freins travaillent davantage sur une électrique lourde, et les défaillances sur ces postes sont à surveiller avant le contrôle. Le freinage régénératif, qui sollicite moins les disques, peut à l’inverse laisser de la corrosion sur des disques peu utilisés. La page ${h.a('defaillances-controle-technique', 'défaillances')} détaille les niveaux de gravité.</p>
<h2>Le supplément selon les départements</h2>
<p>Parmi les départements d’au moins dix centres, ${h.num(egal(h))} ont une médiane électrique égale ou inférieure à la médiane essence. Les écarts les plus forts entre les deux médianes sont aujourd’hui ceux de ${top}. Le mini-simulateur compare les deux médianes dans votre département et la part des centres qui facturent un supplément.</p>
<!--mini:elecDept-->
<h2>Hybrides : entre les deux</h2>
<p>Une hybride a un moteur thermique : elle passe la mesure des émissions comme une essence. Les centres lui appliquent souvent le prix de l’électrique (médiane ${h.prix(s.h.med)}), parfois celui de l’essence. Le fichier ne distingue pas hybride simple et hybride rechargeable : un seul prix vaut pour les deux.</p>
<h2>GPL et GNV : un supplément justifié</h2>
<p>Pour une voiture au gaz, le contrôle ajoute l’examen de l’installation : réservoir, fixations, canalisations, étanchéité. ${h.pct(n.gazPlusCher, 0)} des centres facturent ce surcroît de travail, pour une médiane de ${h.prix(s.g.med)}. Moins de centres déclarent un prix pour le gaz (${h.num(s.g.n)} sur ${h.num(n.centresVp)}) : élargissez le rayon si l’outil en trouve peu.</p>
<h2>Calendrier et contre-visite</h2>
<p>Le calendrier ne change pas avec la motorisation : premier contrôle dans les six mois avant le quatrième anniversaire, puis tous les deux ans. Le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} donne la date pour votre voiture. La contre-visite se facture comme pour les autres motorisations, ${h.prix(n.cv.min.med)} à ${h.prix(n.cv.max.med)} en médiane, avec les mêmes règles : voir ${h.a('contre-visite', 'contre-visite')}.</p>
<p>Pour aller plus loin sur les prix, la page ${h.a('controle-technique-pas-cher', 'contrôle technique pas cher')} explique comment trouver le centre le moins cher autour de vous, toutes motorisations confondues, et ${h.a('departements', 'le classement des départements')} permet de choisir « Voiture électrique » pour comparer tout le pays.</p>`;
    },
  },
  en: {
    slug: 'electric-car-controle-technique',
    nav: 'Electric and hybrid',
    card: 'The electric and hybrid surcharge centre by centre, and how to avoid it.',
    title: 'Electric car contrôle technique in France: the surcharge',
    description: 'The contrôle technique for an electric or hybrid car in 2026: price by centre, the surcharge over petrol, centres with one price, LPG and CNG, by département.',
    h1: 'Electric and hybrid contrôle technique: the real price',
    intro: 'Many centres charge more for electric and hybrid cars. Here is which ones, by how much, and those that charge the same.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `A contrôle technique for an electric car costs ${h.prix(s.el.med)} at the median in France and ${h.prix(s.h.med)} for a hybrid, against ${h.prix(s.e.med)} for a petrol car, according to the prices centres declare in the DGCCRF’s public file of ${h.date(h.S.meta.fichier)}. ${h.pct(n.elecPlusCher, 0)} of centres charge more for an electric car than for a petrol one. No rule requires it: the list of items checked is the same, and an electric car has no exhaust emissions to measure. It is a commercial choice by the centre, and it can be avoided: ${h.pct(1 - n.elecPlusCher, 0)} of centres add no surcharge for electric cars. The tool above opens on “Electric car” and ranks centres by price around your town; switch category to compare with petrol or hybrid at the same centres. Gas (LPG, CNG) costs more at ${h.pct(n.gazPlusCher, 0)} of centres, this time for a technical reason: the installation is checked too.`;
    },
    faqs: (h) => {
      const s = S(h), n = N(h);
      return [
        { q: 'Why does an electric car often cost more to test?', a: `Prices are free, and many centres have created a separate price line for electric and hybrid cars, often set higher. ${h.pct(n.elecPlusCher, 0)} of centres charge more for an electric car than for a petrol one. Yet the test is the same, with no exhaust emissions check. Nothing stops you choosing a centre with a single price.` },
        { q: 'Does an electric car need a contrôle technique?', a: 'Yes, on the same terms as a combustion car: first test in the six months before the fourth anniversary of first registration, then every two years. Only the emissions check does not apply. Hybrids, which have a combustion engine, also go through the emissions check.' },
        { q: 'How much is the test for a plug-in hybrid?', a: `The public file does not separate plug-in hybrids from other hybrids: centres declare a single “hybrid” price, with a national median of ${h.prix(s.h.med)}. Some centres charge the petrol price for hybrids, others the electric price; the tool lets you compare them by choosing “Hybrid car”.` },
        { q: 'Does an LPG car cost more to test?', a: `Yes, at ${h.pct(n.gazPlusCher, 0)} of centres. For an LPG or CNG car, the inspector also checks the tank, the pipes and the installation’s tightness, which takes time. The median is ${h.prix(s.g.med)}, against ${h.prix(s.e.med)} for petrol. Fewer centres declare this price, ${h.num(s.g.n)} across France.` },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), ec = ecarts(h);
      const top = ec.slice(-4).reverse().map((x) => `${x.nom} (+${h.prix(x.x)})`).join(', ');
      return `<h2>The surcharge, centre by centre</h2>
<p>The public price file separates five engine types for a car: petrol, diesel, hybrid, electric and gas. Every centre declares a price for each. Comparing the two columns for the same centre shows who adds a surcharge: ${h.pct(n.elecPlusCher, 0)} of centres charge more for an electric car than for a petrol one. The national median goes from ${h.prix(s.e.med)} to ${h.prix(s.el.med)}, and the gap sometimes exceeds twenty euros within one centre.</p>
<p>In the tool, “Electric car” is preselected. To spot single-price centres, switch from “Electric car” to “Petrol car”: those whose price does not move add no surcharge. Sorted by price, they often come out on top.</p>
<h2>A test without an emissions check</h2>
<p>An electric car goes through the same test as a combustion one: identification, brakes, steering, visibility, lights, axles and tyres, structure, equipment. The exhaust emissions check does not apply, for want of an exhaust. Nothing in the list of items therefore justifies a higher price. Some centres cite the weight of electric cars or handling time; that is their right, since prices are free, but it is not a requirement.</p>
<p>Weight does show in wear, though: tyres and brakes work harder on a heavy electric car, and defects there are worth checking before the test. Regenerative braking, which spares the discs, can conversely leave rust on little-used discs. The ${h.a('defaillances-controle-technique', 'defects page')} explains the severity levels.</p>
<h2>The surcharge by département</h2>
<p>Among départements with at least ten centres, ${h.num(egal(h))} have an electric median equal to or below the petrol median. The widest gaps between the two medians are currently in ${top}. The mini calculator compares both medians in your département and the share of centres adding a surcharge.</p>
<!--mini:elecDept-->
<h2>Hybrids: in between</h2>
<p>A hybrid has a combustion engine: it goes through the emissions check like a petrol car. Centres often charge it the electric price (median ${h.prix(s.h.med)}), sometimes the petrol price. The file does not separate self-charging and plug-in hybrids: one price covers both.</p>
<h2>LPG and CNG: a justified surcharge</h2>
<p>For a gas car, the test adds a check of the installation: tank, mountings, pipes, tightness. ${h.pct(n.gazPlusCher, 0)} of centres charge for that extra work, for a median of ${h.prix(s.g.med)}. Fewer centres declare a gas price (${h.num(s.g.n)} out of ${h.num(n.centresVp)}): widen the distance if the tool finds few.</p>
<h2>Timetable and re-inspection</h2>
<p>The timetable does not change with the engine: first test in the six months before the fourth anniversary, then every two years. The guide on ${h.a('quand-faire-controle-technique', 'when the test is due')} gives the date for your car. The re-inspection is charged as for other engines, ${h.prix(n.cv.min.med)} to ${h.prix(n.cv.max.med)} at the median, under the same rules: see the ${h.a('contre-visite', 're-inspection page')}.</p>
<p>For more on prices, the ${h.a('controle-technique-pas-cher', 'cheap contrôle technique page')} explains how to find the cheapest centre near you, whatever the engine, and the ${h.a('departements', 'département ranking')} lets you choose “Electric car” to compare the whole country.</p>`;
    },
  },
});

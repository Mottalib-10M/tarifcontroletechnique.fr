import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number };
type Dep = { centres: number; s: Record<string, R | undefined>; moinsCher: { n: string; v: string; p: number; ex: number } | null };
const N = (h: Helpers) => h.S.national;
const S = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
const D = (h: Helpers) => Object.entries(h.S.depts as unknown as Record<string, Dep>);
/** Les départements où l'écart entre la médiane et le centre le moins cher est le plus fort. */
const ecartInterne = (h: Helpers) => D(h).filter(([, d]) => d.centres >= 10 && d.s.e && d.moinsCher).map(([d, x]) => ({ d, nom: h.dep(d), x: x.s.e!.med - x.moinsCher!.p, v: x.moinsCher!.v })).sort((a, b) => b.x - a.x || a.d.localeCompare(b.d));
/** Les prix les plus bas déclarés en France pour une voiture essence (par département, puis triés). */
const plusBas = (h: Helpers) => D(h).filter(([, d]) => d.moinsCher).map(([d, x]) => ({ d, nom: h.dep(d), p: x.moinsCher!.p, v: x.moinsCher!.v })).sort((a, b) => a.p - b.p || a.d.localeCompare(b.d));
const sousP10 = (h: Helpers) => { const hist = N(h).histE as Record<string, number>; const tot = Object.values(hist).reduce((a, b) => a + b, 0); return (hist['40'] ?? 0) / tot + (hist['50'] ?? 0) / tot + (hist['60'] ?? 0) / tot; };

export default defineGuide({
  id: 'controle-technique-pas-cher',
  group: 'prix',
  order: 2,
  tool: 'centres',
  vehicule: 'e',
  related: ['departements', 'contre-visite', 'controle-technique-electrique', 'defaillances-controle-technique', 'controle-technique-paris'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'dgccrf'],
  fr: {
    slug: 'controle-technique-pas-cher',
    nav: 'Le moins cher',
    card: 'Trouver le centre le moins cher autour de soi, sans piège.',
    title: 'Contrôle technique pas cher : le moins cher près de vous',
    description: 'Contrôle technique pas cher en 2026 : les centres les moins chers autour de votre commune, prix du jour, contre-visite comprise, pièges des fausses promos.',
    h1: 'Contrôle technique pas cher : trouver le moins cher',
    intro: 'Les centres classés du moins cher au plus cher autour de votre commune, avec ce qui fait vraiment la différence sur la facture.',
    resume: (h) => {
      const s = S(h), b = plusBas(h);
      return `Pour payer son contrôle technique moins cher, il faut comparer les centres proches de chez soi : les prix sont libres, et deux centres voisins sont souvent séparés de plus de vingt euros pour le même examen. En France, la médiane d’un contrôle de voiture essence est de ${h.prix(s.e.med)} ; un centre sur dix est sous ${h.prix(s.e.p10)}, et le prix le plus bas déclaré aujourd’hui est de ${h.prix(b[0].p)}, à ${b[0].v} (${b[0].nom}). Ces chiffres viennent du fichier public où chaque centre déclare ses prix à la DGCCRF, relu ce jour (${h.date(h.S.meta.fichier)}). L’outil ci-dessus classe les centres de votre secteur par prix, avec la distance, la fourchette de la contre-visite et la date du tarif. Le moins cher sur la visite n’est pas toujours le moins cher au total : une contre-visite gratuite ou bon marché compte autant que quelques euros d’écart, surtout pour un véhicule ancien. Le contrôle, lui, est le même partout : un centre moins cher n’est ni plus indulgent ni plus sévère.`;
    },
    faqs: (h) => {
      const s = S(h);
      return [
        { q: 'Un contrôle technique moins cher est-il moins sérieux ?', a: 'Non. La liste des points vérifiés, le matériel et les critères de défaillance sont fixés par arrêté et identiques dans tous les centres agréés, qui sont contrôlés par l’administration. Le prix reflète le loyer, les salaires et la concurrence locale, pas la qualité de l’examen. Un centre bon marché ne laisse pas passer un défaut qu’un centre cher relèverait.' },
        { q: 'Les codes promo de contrôle technique sur internet valent-ils le coup ?', a: `Parfois, à condition de comparer le prix final avec celui des centres voisins sans réduction. Un rabais affiché sur un prix de départ élevé peut aboutir au-dessus de la médiane locale. Vérifiez aussi le prix de la contre-visite, rarement mis en avant. La médiane nationale, ${h.prix(s.e.med)}, sert de repère.` },
        { q: 'Peut-on négocier le prix d’un contrôle technique ?', a: 'Le prix affiché est un prix public : le centre ne peut pas vous facturer plus. Il peut en revanche consentir une remise, par exemple pour plusieurs véhicules ou un client régulier, mais rien ne l’y oblige. La façon la plus sûre de payer moins reste de choisir un centre moins cher, dont le prix est déclaré et affiché.' },
        { q: 'Est-il moins cher de faire son contrôle en semaine ou hors saison ?', a: 'Le fichier public ne contient qu’un prix par centre et par véhicule, sans tarif selon le jour ou la saison. Certains centres proposent ponctuellement des offres, qui doivent être affichées. Pour le reste, le prix ne dépend pas du moment, mais une période creuse facilite le rendez-vous et une éventuelle contre-visite rapide.' },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), b = plusBas(h), ei = ecartInterne(h);
      return `<h2>Où se trouvent les centres les moins chers</h2>
<p>Les prix les plus bas ne se concentrent pas dans une région. Département par département, les centres les moins chers déclarent aujourd’hui ${b.slice(0, 5).map((x) => `${h.prix(x.p)} à ${x.v} (${x.nom})`).join(', ')}. ${h.pct(sousP10(h), 0)} des centres de France demandent moins de 70 € pour une voiture essence.</p>
${h.table(['Département', 'Centre le moins cher', 'Prix', 'Médiane du département'], ei.slice(0, 10).map((x) => [x.nom, x.v, h.prix((h.S.depts as unknown as Record<string, Dep>)[x.d].moinsCher!.p), h.prix((h.S.depts as unknown as Record<string, Dep>)[x.d].s.e!.med)]), `Les dix départements où le centre le moins cher est le plus éloigné de la médiane, fichier du ${h.date(h.S.meta.fichier)}`, ['l', 'l', 'r', 'r'])}
<p>Ce tableau montre l’essentiel : dans un même département, le moins cher peut être ${h.prix(ei[0].x)} sous la médiane. Il n’est pas forcément le plus proche, d’où l’intérêt de regarder la distance. L’outil de cette page fait le même calcul autour de votre commune.</p>
<h2>Trois règles pour payer moins</h2>
<p><strong>Comparer dans un rayon de dix à vingt minutes.</strong> Le centre le plus proche n’est presque jamais le moins cher. Dans une agglomération, un rayon de 10 km réunit en général plusieurs centres, dont les prix s’écartent souvent de vingt euros ou plus. Classez par prix, puis regardez la distance.</p>
<p><strong>Regarder la contre-visite.</strong> Pour un véhicule récent et bien entretenu, la visite seule compte. Pour un véhicule de plus de dix ans, la probabilité d’une contre-visite augmente, et son prix, de 0 à plus de ${h.prix(n.cv.max.p90)} selon les centres, peut effacer l’écart sur la visite. La colonne « Contre-visite » de l’outil donne la fourchette déclarée par chaque centre ; la page ${h.a('contre-visite', 'contre-visite')} explique les cas de gratuité.</p>
<p><strong>Éviter la contre-visite.</strong> La contre-visite la moins chère est celle qu’on ne fait pas. Ampoules, essuie-glaces, pneus, niveau du liquide de frein, voyants : ces vérifications prennent dix minutes et évitent les défaillances les plus banales. La page ${h.a('defaillances-controle-technique', 'défaillances')} les détaille.</p>
<h2>Ce que coûtent vraiment les contrôles sur la durée</h2>
<p>Une voiture gardée longtemps passe un contrôle tous les deux ans dès quatre ans. Sur dix ans de détention, l’écart entre un centre à la médiane et le moins cher du département représente plusieurs dizaines d’euros. Le mini-simulateur fait le calcul pour votre voiture et votre département.</p>
<!--mini:detention-->
<h2>Les pièges des prix d’appel</h2>
<p>Un prix très bas peut cacher un prix de contre-visite élevé ou un supplément pour l’électrique, l’hybride, le gaz ou le 4 x 4. Il peut aussi correspondre à une déclaration ancienne : ${h.pct(n.ancien, 0)} des centres déclarent un tarif voiture daté d’avant 2023, signalé par un astérisque dans la liste. Le prix affiché à l’accueil du centre fait foi ; s’il est plus élevé que le prix déclaré, vous pouvez le faire remarquer, et la DGCCRF reçoit les signalements sur SignalConso.</p>
<p>Méfiez-vous aussi des sites qui affichent « le moins cher » sans montrer tous les centres : beaucoup ne listent que leurs partenaires, qui leur versent une commission. Ici, la liste est celle du fichier public, sans exception ni partenaire, classée par prix puis par distance.</p>
<h2>Électrique, hybride, gaz : vérifier la bonne ligne</h2>
<p>Le moins cher pour une voiture essence ne l’est pas forcément pour une électrique : ${h.pct(n.elecPlusCher, 0)} des centres facturent l’électrique plus cher. Choisissez la bonne motorisation dans l’outil avant de comparer. La page ${h.a('controle-technique-electrique', 'électrique et hybride')} recense les écarts, et le classement des ${h.a('departements', 'départements')} permet de situer votre secteur pour chaque véhicule.</p>
<p>Repère utile pour juger un prix : la moitié des centres de France sont sous ${h.prix(s.e.med)} pour une voiture essence, et neuf sur dix sous ${h.prix(s.e.p90)}. Au-delà, vous payez plus que neuf centres sur dix ; il y a presque toujours moins cher à quelques kilomètres.</p>`;
    },
  },
  en: {
    slug: 'cheap-controle-technique',
    nav: 'Cheapest test',
    card: 'Finding the cheapest centre near you, without the traps.',
    title: 'Cheap contrôle technique in France: the cheapest near you',
    description: 'Cheap contrôle technique in France in 2026: the cheapest centres around your town, today’s declared prices, re-inspection included, and headline-offer traps.',
    h1: 'Cheap contrôle technique: finding the cheapest',
    intro: 'Centres ranked from cheapest to dearest around your town, with what really makes a difference to the bill.',
    resume: (h) => {
      const s = S(h), b = plusBas(h);
      return `To pay less for your contrôle technique, compare the centres near you: prices are free, and two neighbouring centres are often more than twenty euros apart for the same test. Across France the median for a petrol car test is ${h.prix(s.e.med)}; one centre in ten is below ${h.prix(s.e.p10)}, and the lowest price declared today is ${h.prix(b[0].p)}, in ${b[0].v} (${b[0].nom}). These figures come from the public file in which every centre declares its prices to the DGCCRF, the consumer protection authority, read today (${h.date(h.S.meta.fichier)}). The tool above ranks the centres in your area by price, with distance, re-inspection range and the date of the price. The cheapest test is not always the cheapest overall: a free or low-cost re-inspection counts as much as a few euros’ difference, especially for an older vehicle. The test itself is the same everywhere: a cheaper centre is neither more lenient nor stricter.`;
    },
    faqs: (h) => {
      const s = S(h);
      return [
        { q: 'Is a cheaper contrôle technique less thorough?', a: 'No. The list of items, the equipment and the defect criteria are set by ministerial order and identical in every approved centre, which the authorities supervise. The price reflects rent, wages and local competition, not the quality of the test. A cheap centre will not let through a defect that a dear one would catch.' },
        { q: 'Are online contrôle technique discount codes worth it?', a: `Sometimes, provided you compare the final price with nearby centres without a discount. A discount on a high starting price can still end up above the local median. Check the re-inspection price too, which is rarely highlighted. The national median, ${h.prix(s.e.med)}, is a useful benchmark.` },
        { q: 'Can I haggle over a contrôle technique price?', a: 'The displayed price is a public price: the centre cannot charge you more. It may grant a discount, for instance for several vehicles or a regular customer, but it has no obligation to. The surest way to pay less is still to choose a cheaper centre whose price is declared and displayed.' },
        { q: 'Is the test cheaper on weekdays or out of season?', a: 'The public file holds a single price per centre and vehicle, with no pricing by day or season. Some centres run occasional offers, which must be displayed. Otherwise the price does not depend on timing, but a quiet period makes booking, and a quick re-inspection if needed, easier.' },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), b = plusBas(h), ei = ecartInterne(h);
      return `<h2>Where the cheapest centres are</h2>
<p>The lowest prices are not concentrated in one region. Département by département, the cheapest centres currently declare ${b.slice(0, 5).map((x) => `${h.prix(x.p)} in ${x.v} (${x.nom})`).join(', ')}. ${h.pct(sousP10(h), 0)} of centres in France charge under €70 for a petrol car.</p>
${h.table(['Département', 'Cheapest centre’s town', 'Price', 'Département median'], ei.slice(0, 10).map((x) => [x.nom, x.v, h.prix((h.S.depts as unknown as Record<string, Dep>)[x.d].moinsCher!.p), h.prix((h.S.depts as unknown as Record<string, Dep>)[x.d].s.e!.med)]), `The ten départements where the cheapest centre is furthest below the median, file of ${h.date(h.S.meta.fichier)}`, ['l', 'l', 'r', 'r'])}
<p>The table shows the key point: within one département the cheapest centre can be ${h.prix(ei[0].x)} below the median. It is not necessarily the nearest, hence the distance column. The tool on this page does the same sum around your town.</p>
<h2>Three rules to pay less</h2>
<p><strong>Compare within ten to twenty minutes.</strong> The nearest centre is almost never the cheapest. In a built-up area, a 10 km radius usually holds several centres, whose prices are often twenty euros or more apart. Sort by price, then look at the distance.</p>
<p><strong>Look at the re-inspection.</strong> For a recent, well-kept vehicle, only the test price matters. For a vehicle over ten years old, a re-inspection becomes more likely, and its price, from €0 to over ${h.prix(n.cv.max.p90)} depending on the centre, can wipe out the gap on the test. The tool’s “Re-check” column shows each centre’s declared range; the ${h.a('contre-visite', 're-inspection page')} explains when it is free.</p>
<p><strong>Avoid the re-inspection.</strong> The cheapest re-inspection is the one you do not need. Bulbs, wipers, tyres, brake fluid level, warning lights: these checks take ten minutes and prevent the most common defects. The ${h.a('defaillances-controle-technique', 'defects page')} lists them.</p>
<h2>What tests really cost over time</h2>
<p>A car kept for a long time is tested every two years from the age of four. Over ten years of ownership, the gap between a centre at the median and the cheapest in the département adds up to several dozen euros. The mini calculator works it out for your car and département.</p>
<!--mini:detention-->
<h2>The traps of headline prices</h2>
<p>A very low price can hide a high re-inspection price or a surcharge for electric, hybrid, gas or 4x4 vehicles. It can also be an old declaration: ${h.pct(n.ancien, 0)} of centres declare a car price dated before 2023, flagged with an asterisk in the list. The price displayed at the centre’s desk is what counts; if it is higher than the declared price you can point it out, and the DGCCRF takes reports through SignalConso.</p>
<p>Be wary too of sites showing “the cheapest” without listing every centre: many only list their partners, which pay them a commission. Here the list is the public file, with no exceptions or partners, ordered by price and then distance.</p>
<h2>Electric, hybrid, gas: check the right line</h2>
<p>The cheapest centre for a petrol car is not necessarily the cheapest for an electric one: ${h.pct(n.elecPlusCher, 0)} of centres charge more for electric cars. Choose the right engine type in the tool before comparing. The ${h.a('controle-technique-electrique', 'electric and hybrid page')} sets out the gaps, and the ${h.a('departements', 'département ranking')} places your area for each vehicle.</p>
<p>A useful benchmark for judging a price: half of France’s centres charge under ${h.prix(s.e.med)} for a petrol car, and nine in ten under ${h.prix(s.e.p90)}. Above that you are paying more than nine centres in ten; there is almost always something cheaper a few kilometres away.</p>`;
    },
  },
});

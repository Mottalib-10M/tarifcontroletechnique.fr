import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; min: number };
type Dep = { centres: number; s: Record<string, R | undefined>; cv: { gratuite: number } | null; ancien: number | null };
const D = (h: Helpers) => h.S.depts as unknown as Record<string, Dep>;
const rang = (h: Helpers, k = 'e', min = 10) => Object.entries(D(h)).filter(([, x]) => x.centres >= min && x.s[k]).map(([d, x]) => ({ d, nom: h.dep(d), med: x.s[k]!.med, n: x.centres })).sort((a, b) => a.med - b.med || a.d.localeCompare(b.d));
const outre = ['971', '972', '973', '974', '976'];
const om = (h: Helpers) => outre.filter((d) => D(h)[d]).map((d) => `${h.dep(d)} (${h.prix(D(h)[d].s.e!.med)})`).join(', ');
/** Part des départements dont la médiane essence est dans la fourchette nationale p10–p90. */
const dansFourchette = (h: Helpers) => { const r = rang(h, 'e', 1), s = h.S.national.s.e; return r.filter((x) => x.med >= s.p10 && x.med <= s.p90).length / r.length; };
const plusCentres = (h: Helpers) => Object.entries(D(h)).sort(([, a], [, b]) => b.centres - a.centres).slice(0, 3).map(([d, x]) => `${h.dep(d)} (${h.num(x.centres)})`).join(', ');
const gratuitTop = (h: Helpers) => Object.entries(D(h)).filter(([, x]) => x.cv && x.centres >= 10).sort(([, a], [, b]) => b.cv!.gratuite - a.cv!.gratuite)[0];

export default defineGuide({
  id: 'departements',
  group: 'prix',
  order: 1,
  tool: 'departements',
  related: ['controle-technique-pas-cher', 'contre-visite', 'controle-technique-electrique', 'controle-technique-moto', 'controle-technique-paris'],
  sources: ['dataset', 'prixConso', 'arretePrix'],
  fr: {
    slug: 'prix-controle-technique-departement',
    nav: 'Prix par département',
    card: 'Les 101 départements classés par prix médian, véhicule par véhicule.',
    title: 'Prix du contrôle technique par département : classement 2026',
    description: 'Prix du contrôle technique dans les 101 départements : médiane par véhicule, centre le moins cher, contre-visite gratuite, écart France. Fichier DGCCRF du jour.',
    h1: 'Prix du contrôle technique par département',
    intro: 'Les 101 départements classés par prix médian déclaré, pour une voiture, une moto ou un camping-car, avec la contre-visite.',
    resume: (h) => {
      const r = rang(h), s = h.S.national.s.e;
      return `Le prix médian d’un contrôle technique de voiture essence va de ${h.prix(r[0].med)} dans le département le moins cher, ${r[0].nom}, à ${h.prix(r[r.length - 1].med)} dans le plus cher, ${r[r.length - 1].nom}, parmi les départements qui comptent au moins dix centres. La médiane nationale est de ${h.prix(s.med)}. L’écart entre les deux extrêmes, ${h.prix(r[r.length - 1].med - r[0].med)}, sépare des examens strictement identiques : même liste de points de contrôle, même matériel homologué, mêmes critères de défaillance. Le classement ci-dessus est calculé sur les prix que chacun des ${h.num(h.S.national.centres)} centres agréés déclare dans le fichier public de la DGCCRF, relu ce jour (${h.date(h.S.meta.fichier)}). Choisissez un véhicule pour refaire le classement : les écarts ne sont pas les mêmes pour une moto, une électrique ou un camping-car, parce que tous les centres ne les contrôlent pas. Cliquez un département pour voir sa médiane, son rang, sa contre-visite et son centre le moins cher.`;
    },
    faqs: (h) => {
      const r = rang(h), g = gratuitTop(h);
      return [
        { q: 'Pourquoi le contrôle technique coûte-t-il plus cher dans certains départements ?', a: `Les prix sont libres : chaque centre fixe les siens selon ses loyers, ses salaires et la concurrence autour de lui. Les départements très urbains, où le foncier est cher, et les départements ruraux où un centre est seul sur un large secteur ont souvent des médianes élevées. Là où plusieurs centres se partagent une même zone, les prix se tiennent davantage.` },
        { q: 'Peut-on faire son contrôle technique dans un autre département ?', a: `Oui. Aucune règle n’attache un véhicule au département de sa carte grise : tout centre agréé peut le contrôler, en France métropolitaine comme en outre-mer. Si vous habitez près d’une limite, comparez les deux côtés ; l’outil des centres, sur la page d’accueil, cherche autour de votre commune sans tenir compte des limites départementales.` },
        { q: 'Quel département propose le plus souvent la contre-visite gratuite ?', a: `Parmi les départements d’au moins dix centres, ${h.dep(g[0])} a la plus forte part de centres qui annoncent une contre-visite gratuite dans certains cas (${h.pct(g[1].cv!.gratuite, 0)}). En France, cette part est de ${h.pct(h.S.national.cv.gratuite, 0)}. La gratuité dépend en général de la nature de la défaillance et du fait d’avoir passé le premier contrôle dans le même centre.` },
        { q: 'Le classement des départements change-t-il souvent ?', a: `Il bouge peu d’un jour à l’autre, parce que les centres changent leurs prix une ou deux fois par an au plus. Il est pourtant recalculé à chaque mise à jour du fichier. Aujourd’hui, ${r[0].nom} est en tête des moins chers ; la date du fichier utilisé est indiquée sous l’outil.` },
      ];
    },
    body: (h) => {
      const r = rang(h), s = h.S.national.s;
      const rm = rang(h, 'm', 5), rel = rang(h, 'el');
      return `<h2>Le classement, véhicule par véhicule</h2>
<p>Le tableau de l’outil donne, pour chaque département, le nombre de centres agréés, la médiane du prix déclaré pour le véhicule choisi, l’écart avec la médiane nationale et la part des centres qui annoncent une contre-visite gratuite dans certains cas. Le tri par défaut place les moins chers en tête ; deux boutons inversent l’ordre ou reviennent à l’ordre des numéros.</p>
<p>Pour une voiture essence, ${h.pct(dansFourchette(h), 0)} des départements ont une médiane comprise entre ${h.prix(s.e.p10)} et ${h.prix(s.e.p90)}, la fourchette où se trouvent huit centres sur dix en France. Les écarts se creusent sur les véhicules que peu de centres contrôlent. Pour une moto, parmi les départements qui ont au moins cinq centres équipés, la médiane va de ${h.prix(rm[0].med)} (${rm[0].nom}) à ${h.prix(rm[rm.length - 1].med)} (${rm[rm.length - 1].nom}). Pour une électrique, de ${h.prix(rel[0].med)} (${rel[0].nom}) à ${h.prix(rel[rel.length - 1].med)} (${rel[rel.length - 1].nom}).</p>
<h2>Ce que mesure une médiane de département</h2>
<p>La médiane est le prix au-dessous duquel se trouve la moitié des centres du département. Elle ne dit pas ce que vous paierez : dans un même département, l’écart entre le centre le moins cher et le plus cher dépasse souvent vingt euros. Elle sert à situer un prix qu’on vous annonce et à savoir s’il vaut la peine de chercher plus loin. Le mini-simulateur ci-dessous fait la comparaison pour un prix donné.</p>
<!--mini:devis-->
<p>Les départements qui comptent le plus de centres sont ${plusCentres(h)}. Dans les départements de moins de dix centres, une médiane peut changer de plusieurs euros quand un seul centre modifie son tarif : le classement du résumé ne retient que les départements d’au moins dix centres pour cette raison, alors que le tableau les montre tous.</p>
<h2>L’outre-mer</h2>
<p>Le fichier couvre aussi les départements d’outre-mer où des centres déclarent leurs prix : ${om(h)}, en médiane pour une voiture essence. Les coûts d’importation du matériel et des pièces, et le faible nombre de centres, expliquent des tarifs souvent supérieurs à ceux de la métropole.</p>
<h2>Paris et les grandes métropoles</h2>
<p>Les départements des grandes villes ne sont pas toujours les plus chers. Le foncier y pèse, mais la concurrence aussi, et les centres de périphérie tirent souvent la médiane vers le bas. Les pages des villes détaillent l’écart entre le cœur de la commune et ses alentours : ${h.a('controle-technique-paris', 'Paris')}, ${h.a('controle-technique-lyon', 'Lyon')}, ${h.a('controle-technique-marseille', 'Marseille')}, ${h.a('controle-technique-toulouse', 'Toulouse')} et seize autres.</p>
<h2>Bien utiliser le classement</h2>
<p>Un département bon marché ne garantit pas un centre bon marché près de chez vous, et l’inverse est vrai aussi. Pour un prix précis, l’outil de la page d’accueil cherche les centres autour de votre commune, quel que soit leur département, et les classe par prix. Les règles de date et le prix de la contre-visite sont expliqués dans les guides ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} et ${h.a('contre-visite', 'contre-visite')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-price-by-departement',
    nav: 'Prices by département',
    card: 'All 101 départements ranked by median price, vehicle by vehicle.',
    title: 'Contrôle technique price by département: 2026 ranking',
    description: 'Contrôle technique prices in all 101 French départements: median by vehicle, cheapest centre, free re-inspection, gap with France. Today’s DGCCRF price file.',
    h1: 'Contrôle technique prices by département',
    intro: 'All 101 départements ranked by declared median price, for a car, a motorbike or a motorhome, with the re-inspection.',
    resume: (h) => {
      const r = rang(h), s = h.S.national.s.e;
      return `The median price of a petrol car contrôle technique runs from ${h.prix(r[0].med)} in the cheapest département, ${r[0].nom}, to ${h.prix(r[r.length - 1].med)} in the dearest, ${r[r.length - 1].nom}, among départements with at least ten centres. The French median is ${h.prix(s.med)}. The ${h.prix(r[r.length - 1].med - r[0].med)} gap between the two ends separates strictly identical tests: the same list of items, the same approved equipment, the same defect criteria. The ranking above is worked out from the prices each of the ${h.num(h.S.national.centres)} approved centres declares in the DGCCRF’s public file, read today (${h.date(h.S.meta.fichier)}). Pick a vehicle to redo the ranking: the gaps differ for a motorbike, an electric car or a motorhome, because not every centre tests them. Click a département to see its median, rank, re-inspection price and cheapest centre.`;
    },
    faqs: (h) => {
      const r = rang(h), g = gratuitTop(h);
      return [
        { q: 'Why is the contrôle technique dearer in some départements?', a: 'Prices are free: each centre sets its own according to its rent, wages and the competition around it. Highly urban départements, where property is expensive, and rural ones where a single centre covers a wide area often have high medians. Where several centres share the same area, prices stay more in line.' },
        { q: 'Can I take my test in another département?', a: 'Yes. No rule ties a vehicle to the département on its registration certificate: any approved centre can test it, in mainland France or overseas. If you live near a boundary, compare both sides; the centre finder on the home page searches around your town regardless of département lines.' },
        { q: 'Which département most often offers a free re-inspection?', a: `Among départements with at least ten centres, ${h.dep(g[0])} has the highest share of centres saying the re-check is free in some cases (${h.pct(g[1].cv!.gratuite, 0)}). Across France the share is ${h.pct(h.S.national.cv.gratuite, 0)}. Whether it is free usually depends on the kind of defect and on having taken the original test at the same centre.` },
        { q: 'Does the département ranking change often?', a: `It moves little from one day to the next, because centres change their prices once or twice a year at most. It is still recalculated at every update of the file. Today ${r[0].nom} tops the cheapest list; the date of the file used is shown under the tool.` },
      ];
    },
    body: (h) => {
      const r = rang(h), s = h.S.national.s;
      const rm = rang(h, 'm', 5), rel = rang(h, 'el');
      return `<h2>The ranking, vehicle by vehicle</h2>
<p>The tool’s table gives, for each département, the number of approved centres, the median declared price for the chosen vehicle, the gap with the French median and the share of centres saying the re-check is free in some cases. The default order puts the cheapest first; two buttons reverse it or switch to département numbers.</p>
<p>For a petrol car, ${h.pct(dansFourchette(h), 0)} of départements have a median between ${h.prix(s.e.p10)} and ${h.prix(s.e.p90)}, the band that holds eight centres in ten across France. The gaps widen for vehicles that few centres test. For a motorbike, among départements with at least five equipped centres, the median runs from ${h.prix(rm[0].med)} (${rm[0].nom}) to ${h.prix(rm[rm.length - 1].med)} (${rm[rm.length - 1].nom}). For an electric car, from ${h.prix(rel[0].med)} (${rel[0].nom}) to ${h.prix(rel[rel.length - 1].med)} (${rel[rel.length - 1].nom}).</p>
<h2>What a département median measures</h2>
<p>The median is the price below which half the département’s centres sit. It does not tell you what you will pay: within one département the gap between the cheapest and dearest centre is often more than twenty euros. It helps you place a price you have been quoted and decide whether it is worth looking further. The mini calculator below does the comparison for a given price.</p>
<!--mini:devis-->
<p>The départements with the most centres are ${plusCentres(h)}. In départements with fewer than ten centres, a median can move by several euros when a single centre changes its price: that is why the ranking in the summary only counts départements with at least ten centres, while the table shows them all.</p>
<h2>Overseas départements</h2>
<p>The file also covers the overseas départements where centres declare their prices: ${om(h)}, at the median for a petrol car. The cost of shipping equipment and parts, and the small number of centres, explain prices that are often above mainland levels.</p>
<h2>Paris and the big cities</h2>
<p>The départements of the big cities are not always the dearest. Property weighs on prices, but so does competition, and centres on the outskirts often pull the median down. The city pages detail the gap between the heart of each city and its surroundings: ${h.a('controle-technique-paris', 'Paris')}, ${h.a('controle-technique-lyon', 'Lyon')}, ${h.a('controle-technique-marseille', 'Marseille')}, ${h.a('controle-technique-toulouse', 'Toulouse')} and sixteen more.</p>
<h2>Using the ranking well</h2>
<p>A cheap département does not guarantee a cheap centre near you, and the reverse holds too. For an exact price, the tool on the home page looks for centres around your town, whatever their département, and ranks them by price. Date rules and re-inspection prices are explained in the guides on ${h.a('quand-faire-controle-technique', 'when to get the test')} and the ${h.a('contre-visite', 're-inspection')}.</p>`;
    },
  },
});

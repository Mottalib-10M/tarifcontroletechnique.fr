import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'montpellier';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
/** Rang de l'Hérault parmi les départements d'au moins 10 centres (1 = le moins cher). */
const rang = (h: Helpers) => {
  const l = Object.values(DS(h)).filter((x) => x.centres >= 10 && x.s.e).map((x) => x.s.e!.med);
  const m = DS(h)['34'].s.e!.med;
  return { r: l.filter((v) => v < m).length + 1, n: l.length };
};
const voisins = (h: Helpers) => ['34', '30', '11', '12'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);

export default defineGuide({
  id: 'controle-technique-montpellier',
  group: 'villes',
  order: 7,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-pas-cher', 'controle-technique-moto', 'controle-technique-nimes', 'controle-technique-toulouse'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-montpellier',
    nav: 'Montpellier',
    card: 'Montpellier et l’Hérault : le prix de chaque centre, avec la date du tarif.',
    title: 'Contrôle technique à Montpellier : prix de chaque centre',
    description: 'Contrôle technique à Montpellier : prix déclarés par chaque centre, médianes ville et Hérault, communes voisines, moto, contre-visite. Fichier DGCCRF du jour.',
    h1: 'Contrôle technique à Montpellier : prix des centres',
    intro: 'Les tarifs que les centres de Montpellier et de sa métropole déclarent à la DGCCRF, triés par prix, avec la date de chaque tarif.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!, r = rang(h);
      return `Un contrôle technique de voiture essence ou diesel coûte ${h.prix(x.e!.med)} en médiane à Montpellier, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale de ${h.prix(x.natMed)}. L’Hérault se classe ${r.r === 1 ? 'premier' : `${h.num(r.r)}e`} sur ${h.num(r.n)} départements d’au moins dix centres, du moins cher au plus cher, avec une médiane de ${h.prix(x.depMed)}. Dans la ville, ${x.nb(x.v.n, 'centre déclare', 'centres déclarent')} un prix voiture, entre ${h.prix(x.e!.min)} et ${h.prix(x.e!.max)}. À 15 km à la ronde, ${h.num(x.v.n15)} centres ont une médiane de ${h.prix(x.e15!.med)}, et le moins cher, à ${mc15.v}, affiche ${h.prix(mc15.p)}. La contre-visite est déclarée entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. ${x.v.ancien != null && x.v.ancien > h.S.national.ancien ? 'Prudence toutefois : beaucoup de tarifs montpelliérains sont anciens, et seul l’affichage du centre fait foi.' : 'Seul l’affichage du centre fait foi le jour du contrôle.'} Chiffres issus du fichier public où les centres déclarent leurs prix, relu ce jour (${x.fichier}).`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), r = rang(h);
      return [
        { q: 'Le contrôle technique est-il bon marché à Montpellier ?', a: `La médiane de la ville, ${h.prix(x.e!.med)}, est ${x.cmp(x.e!.med, x.natMed)} la médiane nationale, et l’Hérault se place au ${h.num(r.r)}e rang des ${h.num(r.n)} départements classés du moins cher au plus cher. Les prix restent libres : d’un centre à l’autre de la métropole, l’écart dépasse souvent dix euros pour le même examen.` },
        { q: 'Les tarifs déclarés par les centres de Montpellier sont-ils à jour ?', a: `${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres de la ville déclarent un prix voiture appliqué avant 2023.` : 'Une partie des centres de la ville déclare des prix anciens.'} Beaucoup n’ont pas mis à jour leur fiche depuis leur dernière hausse, ou n’ont pas changé de prix. Dans les deux cas, un appel au centre ou un coup d’œil à son affichage avant de venir évite les surprises.` },
        { q: 'Où faire contrôler une moto à Montpellier ?', a: `${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre de la ville déclare', 'centres de la ville déclarent')} un prix moto, médiane ${h.prix(x.v.s.m.med)}.` : 'Aucun centre de la commune ne déclare de prix moto dans le fichier du jour.'} ${x.v.s15.m ? `Dans un rayon de 15 km, on en compte ${h.num(x.v.s15.m.n)}.` : ''} Réglez l’outil sur « Moto » et sur 20 ou 30 km pour élargir la recherche aux centres équipés de l’Hérault.` },
        { q: 'Combien coûte une contre-visite à Montpellier ?', a: `Entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane, selon qu’un contrôle visuel suffit ou qu’il faut repasser sur les bancs. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} des centres de la ville l’annoncent gratuite dans certains cas.` : 'Aucun centre de la ville ne l’annonce gratuite.'} Elle doit avoir lieu dans les deux mois qui suivent le contrôle.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), r = rang(h), v = voisins(h);
      return `<h2>${r.r <= r.n / 3 ? 'L’Hérault, un département bon marché' : 'L’Hérault dans le classement des départements'}</h2>
<p>Pour une voiture essence, la médiane de l’Hérault est de ${h.prix(x.depMed)}, ce qui place le département au ${h.num(r.r)}e rang sur ${h.num(r.n)}, en partant du moins cher. Montpellier se situe à ${h.prix(x.e!.med)}, ${x.cmp(x.e!.med, x.depMed)} son département${x.e!.med > x.depMed ? ' : comme souvent, la ville-centre paie un peu plus que les communes qui l’entourent, où les terrains d’activité sont plus faciles à trouver' : ''}.</p>
${x.vehTable(`Montpellier, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>Le tableau compare les véhicules. L’électrique, ${x.v.s.el ? `déclarée à ${h.prix(x.v.s.el.med)} en médiane dans la ville` : 'peu déclarée dans la ville'}, reste ${x.v.s.el ? x.sens(x.v.s.el.med, x.e!.med) : 'difficile à comparer'} ${x.v.s.el && x.v.s.el.med !== x.e!.med ? 'que l’essence' : ''}. Les écarts sont plus marqués pour les véhicules que peu de centres acceptent.</p>
<h2>Les communes de la métropole</h2>
<p>Lattes, Castelnau-le-Lez, Saint-Jean-de-Védas ou Juvignac touchent la ville et accueillent une bonne partie des centres de l’agglomération. Le tableau ci-dessous, trié par distance, donne leur médiane et leur centre le moins cher. Au total, ${h.num(x.v.n15)} centres se trouvent dans un rayon de 15 km, avec une médiane de ${h.prix(x.e15!.med)}.</p>
${x.voisinesTable(`Communes voisines de Montpellier : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Le centre le moins cher de ce rayon déclare ${h.prix(x.v.moinsCher15!.p)} à ${x.v.moinsCher15!.v} ; dans la commune, le plus bas est à ${h.prix(x.v.moinsCher!.p)}. L’écart avec la médiane de la ville, ${h.prix(x.e!.med - x.v.moinsCher15!.p)}, justifie une comparaison, à condition que le trajet reste court.</p>
<!--mini:depPrix_34-->
<h2>L’âge des tarifs déclarés</h2>
<p>Un point mérite l’attention à Montpellier, l’âge des déclarations : ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres de la ville déclarent un tarif voiture appliqué avant 2023, contre ${h.pct(h.S.national.ancien, 0)} en France` : 'une part importante des centres déclare des tarifs anciens'}. Les prix réellement pratiqués peuvent donc être plus élevés que ceux du fichier. L’outil signale ces tarifs par un astérisque : appelez le centre avant de vous déplacer. Un centre est tenu d’afficher ses prix à l’accueil et, s’il en a un, sur son site ; en cas d’écart avec ce qui vous est facturé, c’est l’affichage qui s’applique.</p>
<h2>Motos et deux-roues</h2>
<p>${x.v.s.m ? `Dans la ville, ${x.nb(x.v.s.m.n, 'centre déclare', 'centres déclarent')} un prix moto (médiane ${h.prix(x.v.s.m.med)}).` : 'Aucun centre de la commune ne déclare de prix moto dans le fichier du jour.'} ${x.v.s15.m ? `Dans un rayon de 15 km, l’offre se limite à ${x.nb(x.v.s15.m.n, 'centre équipé', 'centres équipés')}.` : 'L’offre reste très réduite dans la métropole.'} Pour une moto ou un scooter, élargissez la recherche à 20 ou 30 km dans l’outil. Le calendrier des deux-roues, qui dépend de l’année de mise en circulation, est expliqué dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>
<h2>Ce que coûtent les contrôles sur la durée</h2>
<p>Une voiture achetée neuve passe son premier contrôle à quatre ans, puis tous les deux ans. Sur une longue détention, choisir le centre le moins cher du département plutôt qu’un centre à la médiane finit par compter, même avec des prix héraultais modérés.</p>
<!--mini:detention_34-->
<p>D’autres leviers (contre-visite gratuite, défauts simples à corriger avant de venir) sont réunis dans le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')}.</p>
<h2>Gard, Aude, Aveyron : les voisins</h2>
<p>Médianes du jour pour une voiture essence, du moins cher au plus cher : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. Pour la ville voisine du Gard, voir ${h.a('controle-technique-nimes', 'Nîmes')} ; pour l’autre métropole d’Occitanie, ${h.a('controle-technique-toulouse', 'Toulouse')} ; et pour le classement national, la page des ${h.a('departements', 'départements')}. La contre-visite, ses délais et son prix sont détaillés sur la page ${h.a('contre-visite', 'contre-visite')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-montpellier',
    nav: 'Montpellier',
    card: 'Montpellier and Hérault: every centre’s price, with the date it was set.',
    title: 'Contrôle technique in Montpellier: prices and cheap centres',
    description: 'Contrôle technique in Montpellier: prices declared by each centre, city and Hérault medians, neighbouring towns, motorbikes, re-inspection. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Montpellier: centre prices',
    intro: 'The prices that centres in Montpellier and its metro area declare to the DGCCRF, sorted by price, with the date of each price.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!, r = rang(h);
      return `A contrôle technique (France’s compulsory roadworthiness test) for a petrol or diesel car costs ${h.prix(x.e!.med)} at the median in Montpellier, ${x.cmp(x.e!.med, x.natMed)} the national median of ${h.prix(x.natMed)}. Hérault ranks ${h.num(r.r)} of ${h.num(r.n)} départements with at least ten centres, from cheapest to dearest, with a median of ${h.prix(x.depMed)}. In the city, ${x.nb(x.v.n, 'centre declares', 'centres declare')} a car price, between ${h.prix(x.e!.min)} and ${h.prix(x.e!.max)}. Within 15 km, ${h.num(x.v.n15)} centres have a median of ${h.prix(x.e15!.med)}, and the cheapest, in ${mc15.v}, charges ${h.prix(mc15.p)}. The re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. ${x.v.ancien != null && x.v.ancien > h.S.national.ancien ? 'A word of caution: many Montpellier prices are old, and only the centre’s own display counts.' : 'Only the centre’s own display counts on the day.'} Figures from the public file in which centres declare their prices, read today (${x.fichier}).`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), r = rang(h);
      return [
        { q: 'Is the contrôle technique cheap in Montpellier?', a: `The city median, ${h.prix(x.e!.med)}, is ${x.cmp(x.e!.med, x.natMed)} the national median, and Hérault ranks ${h.num(r.r)} of the ${h.num(r.n)} départements sorted from cheapest to dearest. Prices are still free: from one centre to another in the metro area the gap is often more than ten euros for the same test.` },
        { q: 'Are the prices Montpellier centres declare up to date?', a: `${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of the city’s centres declare a car price applied before 2023.` : 'Some of the city’s centres declare old prices.'} Many have not updated their record since their last increase, or have not changed price at all. Either way, a call to the centre or a look at its displayed prices before you go avoids surprises.` },
        { q: 'Where can I get a motorbike tested in Montpellier?', a: `${x.v.s.m ? `${x.nb(x.v.s.m.n, 'centre in the city declares', 'centres in the city declare')} a motorbike price, median ${h.prix(x.v.s.m.med)}.` : 'No centre in the commune declares a motorbike price in today’s file.'} ${x.v.s15.m ? `Within 15 km there ${x.v.s15.m.n > 1 ? 'are' : 'is'} ${h.num(x.v.s15.m.n)}.` : ''} Set the tool to “Motorcycle” and 20 or 30 km to widen the search to equipped centres across Hérault. The list then shows each centre’s motorbike price and its distance, so you can weigh a cheaper centre against a longer ride.` },
        { q: 'What does a re-inspection cost in Montpellier?', a: `Between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median, depending on whether a visual check is enough or the car must go back on the equipment. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} of the city’s centres say it is free in some cases.` : 'No centre in the city declares it free.'} It must take place within two months of the test.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), r = rang(h), v = voisins(h);
      return `<h2>${r.r <= r.n / 3 ? 'Hérault, a low-cost département' : 'Hérault in the département ranking'}</h2>
<p>For a petrol car, the Hérault median is ${h.prix(x.depMed)}, which puts the département at rank ${h.num(r.r)} of ${h.num(r.n)}, counting from the cheapest. Montpellier stands at ${h.prix(x.e!.med)}, ${x.cmp(x.e!.med, x.depMed)} its département${x.e!.med > x.depMed ? ': as so often, the central city pays a little more than the surrounding towns, where business land is easier to find' : ''}.</p>
${x.vehTable(`Montpellier, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<p>The table compares vehicles. Electric cars, ${x.v.s.el ? `declared at ${h.prix(x.v.s.el.med)} at the median in the city` : 'rarely declared in the city'}, ${x.v.s.el ? `are ${x.cmp(x.v.s.el.med, x.e!.med)} petrol` : 'are hard to compare'}. The gaps are wider for vehicles that few centres accept.</p>
<h2>Towns in the metro area</h2>
<p>Lattes, Castelnau-le-Lez, Saint-Jean-de-Védas and Juvignac border the city and host many of the urban area’s centres. The table below, sorted by distance, gives their median and cheapest centre. In all, ${h.num(x.v.n15)} centres lie within 15 km, with a median of ${h.prix(x.e15!.med)}.</p>
${x.voisinesTable(`Towns near Montpellier: petrol car test, file of ${x.fichier}`)}
<p>The cheapest centre in that radius declares ${h.prix(x.v.moinsCher15!.p)} in ${x.v.moinsCher15!.v}; within the commune the lowest is ${h.prix(x.v.moinsCher!.p)}. The gap with the city median, ${h.prix(x.e!.med - x.v.moinsCher15!.p)}, makes comparing worthwhile, as long as the trip stays short.</p>
<!--mini:depPrix_34-->
<h2>How old the declared prices are</h2>
<p>One point deserves attention in Montpellier, the age of the declarations: ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of the city’s centres declare a car price applied before 2023, against ${h.pct(h.S.national.ancien, 0)} across France` : 'a large share of centres declare old prices'}. Prices actually charged may therefore be higher than in the file. The tool flags these prices with an asterisk: call the centre before you go. A centre must display its prices at the desk and, if it has one, on its website; if what you are charged differs, the display applies.</p>
<h2>Motorbikes and two-wheelers</h2>
<p>${x.v.s.m ? `In the city, ${x.nb(x.v.s.m.n, 'centre declares', 'centres declare')} a motorbike price (median ${h.prix(x.v.s.m.med)}).` : 'No centre in the commune declares a motorbike price in today’s file.'} ${x.v.s15.m ? `Within 15 km the choice is limited to ${x.nb(x.v.s15.m.n, 'equipped centre', 'equipped centres')}.` : 'The choice across the metro area is very limited.'} For a motorbike or scooter, widen the search to 20 or 30 km in the tool. The two-wheeler timetable, which depends on the year of first registration, is explained in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>What tests cost over time</h2>
<p>A car bought new has its first test at four years, then every two years. Over a long ownership, choosing the cheapest centre in the département rather than a median-priced one ends up mattering, even with Hérault’s moderate prices.</p>
<!--mini:detention_34-->
<p>Other levers (a free re-inspection, simple defects fixed before you go) are gathered in the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')}.</p>
<h2>Gard, Aude, Aveyron: the neighbours</h2>
<p>Today’s medians for a petrol car, cheapest first: ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. For the neighbouring city in Gard, see ${h.a('controle-technique-nimes', 'Nîmes')}; for Occitanie’s other metro area, ${h.a('controle-technique-toulouse', 'Toulouse')}; and for the national ranking, the ${h.a('departements', 'départements page')}. The re-inspection, its deadlines and price are detailed on the ${h.a('contre-visite', 're-inspection page')}.</p>`;
    },
  },
});

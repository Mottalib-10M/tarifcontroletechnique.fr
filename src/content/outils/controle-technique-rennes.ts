import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'rennes';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
const voisins = (h: Helpers) => ['35', '22', '56', '53', '44', '50'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
/** Habitants par centre dans la commune (population de geo.api.gouv.fr). */
const habParCentre = (h: Helpers) => { const x = ville(h, SLUG); return x.v.n ? Math.round(x.v.pop / x.v.n / 1000) * 1000 : 0; };
/** Écart électrique − essence dans la ville, en euros. */
const ecartElec = (h: Helpers) => { const x = ville(h, SLUG); return x.v.s.el && x.e ? x.v.s.el.med - x.e.med : 0; };

export default defineGuide({
  id: 'controle-technique-rennes',
  group: 'villes',
  order: 11,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-electrique', 'quand-faire-controle-technique', 'controle-technique-nantes', 'controle-technique-angers'],
  sources: ['dataset', 'prixConso', 'spVoiture', 'arretePrix'],
  fr: {
    slug: 'controle-technique-rennes',
    nav: 'Rennes',
    card: 'Rennes et sa rocade : peu de centres en ville, davantage autour.',
    title: 'Contrôle technique à Rennes : prix en ville et sur la rocade',
    description: 'Contrôle technique à Rennes : prix déclarés par chaque centre, médianes Rennes et couronne, Saint-Grégoire, électrique, contre-visite. Fichier DGCCRF du jour.',
    h1: 'Contrôle technique à Rennes : prix des centres',
    intro: 'Les prix que les centres de Rennes et des communes de la rocade déclarent à la DGCCRF, pour une voiture thermique, électrique ou une moto.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `Un contrôle technique de voiture essence ou diesel coûte ${h.prix(x.e!.med)} en médiane à Rennes, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}). La ville ne compte que ${x.nb(x.v.n, 'centre déclarant', 'centres déclarant')} un prix voiture, de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} : ${x.v.n15 - x.v.n > x.v.n ? 'la plupart des centres de l’agglomération sont dans les communes de la rocade' : 'l’agglomération en compte d’autres dans les communes voisines'}. Dans un rayon de 15 km, on en trouve ${h.num(x.v.n15)}, pour une médiane de ${h.prix(x.e15!.med)}, et le moins cher, à ${mc15.v}, déclare ${h.prix(mc15.p)}. Pour une électrique, la médiane rennaise monte à ${x.v.s.el ? h.prix(x.v.s.el.med) : 'un niveau non calculable'}. La contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Ces montants viennent du fichier public où chaque centre déclare ses prix à l’administration, relu ce jour (${x.fichier}) ; l’outil liste les centres autour de votre commune, du moins cher au plus cher, sans compte ni rendez-vous à prendre ici.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return [
        { q: 'Pourquoi y a-t-il si peu de centres de contrôle technique dans Rennes ?', a: `La commune en compte ${h.num(x.v.n)}, soit environ un pour ${h.num(habParCentre(h))} habitants. Une ligne de contrôle demande un local d’activité vaste et accessible aux véhicules, plus facile à trouver dans les zones de la périphérie que dans la ville. Les ${h.num(x.v.n15)} centres du rayon de 15 km compensent largement.` },
        { q: 'Saint-Grégoire et Cesson-Sévigné sont-ils moins chers que Rennes ?', a: `Le tableau des communes voisines donne leurs médianes du jour face aux ${h.prix(x.e!.med)} de Rennes. Le centre le moins cher à moins de 15 km est à ${mc15.v}, à ${h.prix(mc15.p)}. Les petites communes n’ont souvent qu’un ou deux centres : la liste triée par prix vaut mieux que la seule médiane.` },
        { q: 'Combien coûte le contrôle d’une voiture électrique à Rennes ?', a: ecartElec(h) > 0 ? `${h.prix(x.v.s.el!.med)} en médiane, soit ${h.prix(ecartElec(h))} de plus que l’essence dans la même ville. Ce supplément n’est imposé par aucun texte ; le mini-simulateur de la page compare électrique et essence en Ille-et-Vilaine, et l’outil trouve les centres qui n’en appliquent pas.` : `${x.v.s.el ? `${h.prix(x.v.s.el.med)} en médiane, sans supplément par rapport à l’essence.` : 'Trop peu de centres rennais déclarent un prix électrique pour une médiane.'} Le mini-simulateur compare électrique et essence en Ille-et-Vilaine.` },
        { q: 'L’Ille-et-Vilaine est-elle chère pour le contrôle technique ?', a: `Sa médiane est de ${h.prix(x.depMed)} pour une voiture essence, ${x.cmp(x.depMed, x.natMed)} la médiane nationale. En Bretagne et dans l’Ouest, le classement du jour est : ${voisins(h).map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), ee = ecartElec(h);
      return `<h2>La commune et sa couronne</h2>
<p>La commune de Rennes ne compte que ${x.nb(x.v.n, 'centre', 'centres')} qui déclarent un prix voiture, pour une médiane de ${h.prix(x.e!.med)} et des tarifs serrés entre ${h.prix(x.e!.min)} et ${h.prix(x.e!.max)}. Le gros de l’offre est ailleurs : ${h.num(x.v.n15)} centres dans un rayon de 15 km, dans les communes de la première couronne et le long des axes qui partent de la rocade. Leur médiane, ${h.prix(x.e15!.med)}, est ${x.cmp(x.e15!.med, x.e!.med)} celle de la ville.</p>
${x.voisinesTable(`Communes voisines de Rennes : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Le centre le moins cher de ce rayon est à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}). ${x.v.moinsCher!.ex > 1 ? `Dans Rennes, ${x.nb(x.v.moinsCher!.ex, 'centre partage', 'centres partagent')} le prix le plus bas, ${h.prix(x.v.moinsCher!.p)}.` : `Dans Rennes, le plus bas est à ${h.prix(x.v.moinsCher!.p)}.`} Pour un Rennais, l’écart de ${h.prix(x.e!.med - x.v.moinsCher15!.p)} entre la médiane de la ville et le moins cher des alentours mérite le détour si le centre est sur le trajet du travail.</p>
<h2>Électrique : ${ee > 0 ? 'un supplément marqué' : 'pas de supplément en médiane'}</h2>
<p>${ee > 0 ? `L’écart entre électrique et essence est net à Rennes : ${h.prix(x.v.s.el!.med)} contre ${h.prix(x.e!.med)} en médiane, soit ${h.prix(ee)} de plus.` : x.v.s.el ? `À Rennes, la médiane électrique (${h.prix(x.v.s.el.med)}) ne dépasse pas celle de l’essence.` : 'Peu de centres rennais déclarent un prix électrique.'} ${x.v.s15.el ? `Dans les 15 km, la médiane électrique est de ${h.prix(x.v.s15.el.med)}.` : ''} Rien dans la réglementation n’impose ce surcoût, et l’examen d’une électrique ne comporte pas de mesure des gaz d’échappement. Le mini-simulateur compare les deux tarifs dans le département.</p>
<!--mini:elecDept_35-->
<p>Le guide ${h.a('controle-technique-electrique', 'du contrôle technique d’une voiture électrique')} explique ce que vérifie le contrôleur sur une électrique ou une hybride, et comment repérer les centres sans supplément.</p>
<h2>Tous les véhicules</h2>
${x.vehTable(`Rennes, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>${x.v.s.m ? `Pour une moto, ${x.nb(x.v.s.m.n, 'centre de la ville déclare', 'centres de la ville déclarent')} un prix` : 'Pour une moto, peu de centres de la ville déclarent un prix'}${x.v.s15.m ? `, et ${h.num(x.v.s15.m.n)} dans les 15 km` : ''} : élargissez le rayon dans l’outil. Le calendrier des deux-roues est expliqué dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>
<h2>Combien sur la durée</h2>
<p>Garder une voiture longtemps, c’est payer un contrôle tous les deux ans à partir de sa quatrième année. Le mini-simulateur chiffre le total au prix médian de l’Ille-et-Vilaine et au prix du centre le moins cher du département.</p>
<!--mini:detention_35-->
<p>Les échéances exactes, et ce que coûte un retard, sont dans le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')}.</p>
<h2>Bretagne et Pays de la Loire</h2>
<p>Médianes du jour pour une voiture essence, du moins cher au plus cher : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. Pour les grandes villes voisines, voir ${h.a('controle-technique-nantes', 'Nantes')} et ${h.a('controle-technique-angers', 'Angers')} ; pour le classement national, la page des ${h.a('departements', 'départements')}.</p>
<h2>Contre-visite à Rennes</h2>
<p>Après un contrôle défavorable, la contre-visite doit avoir lieu dans les deux mois, dans le centre de votre choix. Les centres rennais la déclarent entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane${x.v.cv!.gratuite > 0 ? `, et ${h.pct(x.v.cv!.gratuite, 0)} l’annoncent parfois gratuite` : ' ; aucun ne l’annonce gratuite dans le fichier du jour'}. ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres de la ville déclarent un tarif voiture antérieur à 2023 : vérifiez l’affichage du centre, qui fait foi.` : ''} Les règles sont sur la page ${h.a('contre-visite', 'contre-visite')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-rennes',
    nav: 'Rennes',
    card: 'Rennes and its ring road: few centres in town, more around it.',
    title: 'Contrôle technique in Rennes: prices in town and ring road',
    description: 'Contrôle technique in Rennes: prices declared by each centre, Rennes and suburban medians, Saint-Grégoire, electric cars, re-inspection. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Rennes: centre prices',
    intro: 'The prices that centres in Rennes and the towns along its ring road declare to the DGCCRF, for a petrol, diesel or electric car, or a motorbike.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return `A contrôle technique (France’s compulsory roadworthiness test) for a petrol or diesel car costs ${h.prix(x.e!.med)} at the median in Rennes, ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}). The city has only ${x.nb(x.v.n, 'centre declaring', 'centres declaring')} a car price, from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}: ${x.v.n15 - x.v.n > x.v.n ? 'most of the urban area’s centres are in the towns along the rocade (ring road)' : 'the urban area has others in neighbouring towns'}. Within 15 km there are ${h.num(x.v.n15)}, with a median of ${h.prix(x.e15!.med)}, and the cheapest, in ${mc15.v}, declares ${h.prix(mc15.p)}. For an electric car the Rennes median rises to ${x.v.s.el ? h.prix(x.v.s.el.med) : 'a level too thin to compute'}. A re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. These amounts come from the public file in which each centre declares its prices to the authorities, read today (${x.fichier}); the tool lists the centres around your town, cheapest first, with no account and no booking here.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      return [
        { q: 'Why are there so few inspection centres inside Rennes?', a: `The commune has ${h.num(x.v.n)}, roughly one for every ${h.num(habParCentre(h))} residents. A test lane needs large commercial premises that vehicles can reach easily, which are easier to find on the outskirts than in town. The ${h.num(x.v.n15)} centres within 15 km more than make up for it.` },
        { q: 'Are Saint-Grégoire and Cesson-Sévigné cheaper than Rennes?', a: `The neighbouring towns table gives today’s medians against ${h.prix(x.e!.med)} in Rennes. The cheapest centre within 15 km is in ${mc15.v}, at ${h.prix(mc15.p)}. Small towns often have only one or two centres: the price-sorted list is worth more than the median alone.` },
        { q: 'What does an electric car test cost in Rennes?', a: ecartElec(h) > 0 ? `${h.prix(x.v.s.el!.med)} at the median, ${h.prix(ecartElec(h))} more than petrol in the same city. No rule imposes this surcharge; the mini calculator on this page compares electric and petrol in Ille-et-Vilaine, and the tool, set to “Electric”, lists the centres that do not apply it, cheapest first.` : `${x.v.s.el ? `${h.prix(x.v.s.el.med)} at the median, with no surcharge over petrol.` : 'Too few Rennes centres declare an electric price for a median.'} The mini calculator compares electric and petrol in Ille-et-Vilaine, and the tool, set to “Electric”, sorts the city’s centres by the price they declare for this engine type.` },
        { q: 'Is Ille-et-Vilaine expensive for the contrôle technique?', a: `Its median is ${h.prix(x.depMed)} for a petrol car, ${x.cmp(x.depMed, x.natMed)} the national median. Across Brittany and the west, today’s ranking is: ${voisins(h).map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. These medians move with each daily update of the public file, and gaps between two Rennes centres are often wider than between départements.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), ee = ecartElec(h);
      return `<h2>The city and its inner ring</h2>
<p>The commune of Rennes has only ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price, with a median of ${h.prix(x.e!.med)} and prices tightly grouped between ${h.prix(x.e!.min)} and ${h.prix(x.e!.max)}. Most of the choice lies elsewhere: ${h.num(x.v.n15)} centres within 15 km, in the inner-ring towns and along the roads leading out from the rocade. Their median, ${h.prix(x.e15!.med)}, is ${x.cmp(x.e15!.med, x.e!.med)} the city’s.</p>
${x.voisinesTable(`Towns near Rennes: petrol car test, file of ${x.fichier}`)}
<p>The cheapest centre in that radius is in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}). ${x.v.moinsCher!.ex > 1 ? `Inside Rennes, ${x.nb(x.v.moinsCher!.ex, 'centre shares', 'centres share')} the lowest price, ${h.prix(x.v.moinsCher!.p)}.` : `Inside Rennes the lowest is ${h.prix(x.v.moinsCher!.p)}.`} For someone living in Rennes, the ${h.prix(x.e!.med - x.v.moinsCher15!.p)} gap between the city median and the cheapest nearby is worth the trip if the centre is on the way to work.</p>
<h2>Electric cars: ${ee > 0 ? 'a marked surcharge' : 'no surcharge at the median'}</h2>
<p>${ee > 0 ? `The gap between electric and petrol is clear in Rennes: ${h.prix(x.v.s.el!.med)} against ${h.prix(x.e!.med)} at the median, ${h.prix(ee)} more.` : x.v.s.el ? `In Rennes the electric median (${h.prix(x.v.s.el.med)}) is no higher than petrol.` : 'Few Rennes centres declare an electric price.'} ${x.v.s15.el ? `Within 15 km the electric median is ${h.prix(x.v.s15.el.med)}.` : ''} Nothing in the regulations requires this extra cost, and an electric car test includes no exhaust gas measurement. The mini calculator compares both prices in the département.</p>
<!--mini:elecDept_35-->
<p>The ${h.a('controle-technique-electrique', 'electric car guide')} explains what the inspector checks on an electric or hybrid car, and how to spot centres without a surcharge.</p>
<h2>Every vehicle</h2>
${x.vehTable(`Rennes, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<p>${x.v.s.m ? `For a motorbike, ${x.nb(x.v.s.m.n, 'centre in the city declares', 'centres in the city declare')} a price` : 'For a motorbike, few centres in the city declare a price'}${x.v.s15.m ? `, and ${h.num(x.v.s15.m.n)} within 15 km` : ''}: widen the radius in the tool. The two-wheeler timetable is in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>The cost over time</h2>
<p>Keeping a car for a long time means paying for a test every two years from its fourth year. The mini calculator works out the total at the Ille-et-Vilaine median and at the price of the département’s cheapest centre.</p>
<!--mini:detention_35-->
<p>Exact deadlines, and what being late costs, are in the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')}.</p>
<h2>Brittany and Pays de la Loire</h2>
<p>Today’s petrol car medians, cheapest first: ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. For the big neighbouring cities, see ${h.a('controle-technique-nantes', 'Nantes')} and ${h.a('controle-technique-angers', 'Angers')}; for the national ranking, the ${h.a('departements', 'départements page')}.</p>
<h2>Re-inspection in Rennes</h2>
<p>After a fail, the re-inspection (contre-visite) must take place within two months, at the centre of your choice. Rennes centres declare it at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median${x.v.cv!.gratuite > 0 ? `, and ${h.pct(x.v.cv!.gratuite, 0)} say it is sometimes free` : '; none declares it free in today’s file'}. ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of the city’s centres declare a car price from before 2023: check the centre’s display, which is what counts.` : ''} The rules are on the ${h.a('contre-visite', 're-inspection page')}.</p>`;
    },
  },
});

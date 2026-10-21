import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'bordeaux';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
const voisins = (h: Helpers) => ['33', '17', '24', '40', '47'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
/** Rang de la Gironde par nombre de centres (1 = le département qui en compte le plus). */
const rangCentres = (h: Helpers) => Object.values(DS(h)).filter((x) => x.centres > DS(h)['33'].centres).length + 1;
/** Rive droite de la Garonne : communes présentes parmi les voisines. */
const riveDroite = (h: Helpers) => ville(h, SLUG).v.voisines.filter((c) => ['Cenon', 'Lormont', 'Floirac', 'Bassens', 'Bouliac', 'Artigues-près-Bordeaux'].includes(c.nom));

export default defineGuide({
  id: 'controle-technique-bordeaux',
  group: 'villes',
  order: 9,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'contre-visite', 'controle-technique-pas-cher', 'controle-technique-toulouse', 'controle-technique-nantes'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-bordeaux',
    nav: 'Bordeaux',
    card: 'Bordeaux, la rocade et les deux rives de la Garonne : prix déclarés.',
    title: 'Contrôle technique à Bordeaux : prix des centres girondins',
    description: 'Contrôle technique à Bordeaux : prix de chaque centre, médianes ville et métropole, rive droite, contre-visite parfois gratuite, Gironde. Fichier du jour.',
    h1: 'Contrôle technique à Bordeaux et dans la métropole',
    intro: 'Ce que déclarent à la DGCCRF les centres de Bordeaux et des communes de la métropole, rive gauche comme rive droite.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      const meme = mc15.v.startsWith('Bordeaux');
      return `À Bordeaux, la médiane d’un contrôle technique de voiture essence ou diesel est de ${h.prix(x.e!.med)}, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale (${h.prix(x.natMed)}). La commune ne compte que ${x.nb(x.v.n, 'centre déclarant', 'centres déclarant')} un prix voiture, entre ${h.prix(x.e!.min)} et ${h.prix(x.e!.max)}, mais la métropole en aligne bien davantage : ${h.num(x.v.n15)} centres dans un rayon de 15 km, pour une médiane de ${h.prix(x.e15!.med)}. ${meme ? `Le moins cher de ce rayon est pourtant dans Bordeaux même, à ${h.prix(mc15.p)}.` : `Le moins cher de ce rayon déclare ${h.prix(mc15.p)} à ${mc15.v}.`} La contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane, ${x.v.cv!.gratuite > 0 ? `et ${h.pct(x.v.cv!.gratuite, 0)} des centres de la ville l’annoncent parfois gratuite` : 'sans centre de la ville qui l’annonce gratuite'}. Ces chiffres sont ceux que chaque centre déclare dans le fichier public de l’administration, relu ce jour (${x.fichier}) ; l’outil liste les centres autour du quartier ou de la commune que vous tapez.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), rd = riveDroite(h);
      return [
        { q: 'Combien de centres de contrôle technique y a-t-il autour de Bordeaux ?', a: `La commune en compte ${h.num(x.v.n)} qui déclarent un prix voiture, et le rayon de 15 km ${h.num(x.v.n15)}. La Gironde dans son ensemble est ${rangCentres(h) === 1 ? 'le département qui compte le plus de centres' : `au ${h.num(rangCentres(h))}e rang des départements par nombre de centres`}. Cette densité entretient la concurrence : la médiane de la métropole est ${x.cmp(x.e15!.med, x.e!.med)} celle de la ville.` },
        { q: 'La rive droite de Bordeaux est-elle moins chère pour le contrôle technique ?', a: rd.length ? `Dans le fichier du jour, les médianes de la rive droite sont : ${rd.map((c) => `${c.nom} ${h.prix(c.s.med)}`).join(', ')}, contre ${h.prix(x.e!.med)} dans Bordeaux. Chaque commune ne compte qu’un ou quelques centres : la liste de l’outil, triée par prix, est plus parlante que les médianes.` : 'Les communes de la rive droite n’apparaissent pas parmi les voisines du fichier du jour ; l’outil réglé sur 10 km les inclut si elles ont des centres.' },
        { q: 'Où la contre-visite est-elle gratuite à Bordeaux ?', a: `${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} des centres bordelais annoncent une contre-visite gratuite dans certains cas, en général quand le premier contrôle a été fait chez eux.` : 'Aucun centre bordelais ne l’annonce gratuite dans le fichier du jour.'} La colonne « Contre-visite » de l’outil affiche « 0 € » pour ces centres ; pour les autres, la médiane va de ${h.prix(x.v.cv!.min.med)} à ${h.prix(x.v.cv!.max.med)}.` },
        { q: 'La Gironde est-elle plus chère que les Landes pour le contrôle technique ?', a: `Médianes du jour pour une voiture essence, du moins cher au plus cher : ${voisins(h).map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Tout centre agréé peut contrôler votre voiture, quel que soit le département de sa carte grise.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), rd = riveDroite(h), v = voisins(h);
      return `<h2>Peu de centres dans la ville, beaucoup autour</h2>
<p>Bordeaux intra-muros ne compte que ${x.nb(x.v.n, 'centre', 'centres')} déclarant un prix voiture, pour une médiane de ${h.prix(x.e!.med)}. Le contraste avec la métropole est net : ${h.num(x.v.n15)} centres dans un rayon de 15 km, répartis dans les communes qui bordent la rocade, de Mérignac à Eysines et Bruges, et sur la rive droite. Leur médiane est de ${h.prix(x.e15!.med)}, ${x.cmp(x.e15!.med, x.e!.med)} la ville.</p>
${x.voisinesTable(`Communes voisines de Bordeaux : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>La Gironde se classe ${rangCentres(h) === 1 ? 'en tête des départements' : `au ${h.num(rangCentres(h))}e rang des départements`} pour le nombre de centres, avec ${h.num(DS(h)['33'].centres)} centres agréés. Sa médiane, ${h.prix(x.depMed)}, est ${x.cmp(x.depMed, x.natMed)} la France.</p>
<h2>Rive gauche, rive droite</h2>
<p>La Garonne sépare la ville de ses communes de la rive droite, reliées par une poignée de ponts souvent saturés. ${rd.length ? `De ce côté du fleuve, le fichier du jour donne : ${rd.map((c) => `${c.nom} ${h.prix(c.s.med)} (${x.nb(c.s.n, 'centre', 'centres')})`).join(', ')}.` : 'Les communes de la rive droite n’apparaissent pas dans le tableau du jour.'} Pour un habitant de la Bastide, de Cenon ou de Lormont, un centre de la même rive évite une traversée aux heures de pointe, qui coûte souvent plus que l’écart de prix.</p>
<p>${x.v.moinsCher15!.v.startsWith('Bordeaux') ? `Fait notable, le centre le moins cher de tout le rayon de 15 km est dans Bordeaux même : ${h.prix(x.v.moinsCher15!.p)}, quand le plus cher de la ville déclare ${h.prix(x.v.plusCher!.p)}.` : `Le moins cher du rayon de 15 km est à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}) ; dans la ville, le plus bas est à ${h.prix(x.v.moinsCher!.p)}.`} Le mini-simulateur situe un prix dans le classement de la Gironde.</p>
<!--mini:depPrix_33-->
<h2>Le prix selon le véhicule</h2>
${x.vehTable(`Bordeaux, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>Le tableau compare la ville, la métropole et la France. ${x.v.s.el ? `L’électrique est déclarée ${h.prix(x.v.s.el.med)} en médiane dans Bordeaux, ${x.cmp(x.v.s.el.med, x.e!.med)} l’essence.` : ''} ${x.v.s.m ? `Pour une moto, ${x.nb(x.v.s.m.n, 'centre de la ville est équipé', 'centres de la ville sont équipés')}` : 'Pour une moto, peu de centres de la ville sont équipés'}${x.v.s15.m ? `, ${h.num(x.v.s15.m.n)} dans les 15 km` : ''} ; le calendrier des deux-roues est expliqué dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}.</p>
<h2>Une contre-visite ${x.v.cv!.gratuite > h.S.national.cv.gratuite ? 'plus souvent gratuite qu’ailleurs' : 'à comparer aussi'}</h2>
<p>Après un contrôle défavorable, la contre-visite doit avoir lieu dans les deux mois. À Bordeaux, elle est déclarée entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} des centres de la ville l’annoncent gratuite dans certains cas, contre ${h.pct(h.S.national.cv.gratuite, 0)} en France.` : 'Aucun centre de la ville ne l’annonce gratuite.'} Pour une voiture qui risque d’échouer, ce critère pèse plus lourd que quelques euros d’écart sur la visite.</p>
<!--mini:cvDept_33-->
<p>Les règles, et ce qui change avec une défaillance critique, sont sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<h2>La Nouvelle-Aquitaine autour de Bordeaux</h2>
<p>Médianes d’un contrôle essence aujourd’hui, du moins cher au plus cher : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. ${x.v.ancien != null ? `À Bordeaux, ${h.pct(x.v.ancien, 0)} des centres déclarent un tarif voiture antérieur à 2023 : l’affichage du centre fait foi.` : ''} Pour comparer avec d’autres métropoles de l’Ouest, voir ${h.a('controle-technique-toulouse', 'Toulouse')} et ${h.a('controle-technique-nantes', 'Nantes')} ; pour le classement complet, la page des ${h.a('departements', 'départements')} ; pour payer moins, le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-bordeaux',
    nav: 'Bordeaux',
    card: 'Bordeaux, the ring road and both banks of the Garonne: declared prices.',
    title: 'Contrôle technique in Bordeaux: Gironde centre prices',
    description: 'Contrôle technique in Bordeaux: every centre’s price, city and metro medians, right bank, re-inspection sometimes free, Gironde ranking. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Bordeaux and its metro area',
    intro: 'What centres in Bordeaux and the towns of its metro area declare to the DGCCRF, on the left bank and the right.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!;
      const meme = mc15.v.startsWith('Bordeaux');
      return `In Bordeaux, the median contrôle technique (France’s compulsory roadworthiness test) for a petrol or diesel car is ${h.prix(x.e!.med)}, ${x.cmp(x.e!.med, x.natMed)} the national median (${h.prix(x.natMed)}). The commune has only ${x.nb(x.v.n, 'centre declaring', 'centres declaring')} a car price, between ${h.prix(x.e!.min)} and ${h.prix(x.e!.max)}, but the metro area has many more: ${h.num(x.v.n15)} centres within 15 km, with a median of ${h.prix(x.e15!.med)}. ${meme ? `Yet the cheapest in that radius is in Bordeaux itself, at ${h.prix(mc15.p)}.` : `The cheapest in that radius declares ${h.prix(mc15.p)} in ${mc15.v}.`} The re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median, ${x.v.cv!.gratuite > 0 ? `and ${h.pct(x.v.cv!.gratuite, 0)} of the city’s centres say it is sometimes free` : 'with no centre in the city declaring it free'}. These are the figures each centre declares in the authorities’ public file, read today (${x.fichier}); the tool lists the centres around the district or town you type.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), rd = riveDroite(h);
      return [
        { q: 'How many inspection centres are there around Bordeaux?', a: `The commune has ${h.num(x.v.n)} declaring a car price, and the 15 km radius ${h.num(x.v.n15)}. Gironde as a whole is ${rangCentres(h) === 1 ? 'the département with the most centres' : `ranked ${h.num(rangCentres(h))} among départements by number of centres`}. That density keeps competition going: the metro median is ${x.cmp(x.e15!.med, x.e!.med)} the city’s.` },
        { q: 'Is Bordeaux’s right bank cheaper for the contrôle technique?', a: rd.length ? `In today’s file the right-bank medians are: ${rd.map((c) => `${c.nom} ${h.prix(c.s.med)}`).join(', ')}, against ${h.prix(x.e!.med)} in Bordeaux. Each town has only one or a few centres: the tool’s list, sorted by price, tells you more than the medians.` : 'Right-bank towns do not appear among the neighbours in today’s file; the tool set to 10 km includes them if they have centres.' },
        { q: 'Where is the re-inspection free in Bordeaux?', a: `${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} of Bordeaux centres say the re-check is free in some cases, usually when the first test was done with them.` : 'No Bordeaux centre declares it free in today’s file.'} The tool’s “Re-check” column shows “€0” for those centres; for the others, the median runs from ${h.prix(x.v.cv!.min.med)} to ${h.prix(x.v.cv!.max.med)}.` },
        { q: 'Is Gironde dearer than Landes for the contrôle technique?', a: `Today’s petrol car medians, cheapest first: ${voisins(h).map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Any approved centre can test your car, whatever the département on its registration certificate (carte grise). For a driver in the south of the metro area, a centre just across the Landes line can be worth a look, but the tool’s list shows whether the saving covers the extra kilometres.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), rd = riveDroite(h), v = voisins(h);
      return `<h2>Few centres in the city, many around it</h2>
<p>Bordeaux proper has only ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price, with a median of ${h.prix(x.e!.med)}. The contrast with the metro area is sharp: ${h.num(x.v.n15)} centres within 15 km, spread across the towns along the rocade (ring road), from Mérignac to Eysines and Bruges, and on the right bank. Their median is ${h.prix(x.e15!.med)}, ${x.cmp(x.e15!.med, x.e!.med)} the city.</p>
${x.voisinesTable(`Towns near Bordeaux: petrol car test, file of ${x.fichier}`)}
<p>Gironde ranks ${rangCentres(h) === 1 ? 'first among départements' : `${h.num(rangCentres(h))} among départements`} for its number of centres, with ${h.num(DS(h)['33'].centres)} approved centres. Its median, ${h.prix(x.depMed)}, is ${x.cmp(x.depMed, x.natMed)} France.</p>
<h2>Left bank, right bank</h2>
<p>The Garonne separates the city from its right-bank towns, linked by a handful of often congested bridges. ${rd.length ? `On that side of the river, today’s file gives: ${rd.map((c) => `${c.nom} ${h.prix(c.s.med)} (${x.nb(c.s.n, 'centre', 'centres')})`).join(', ')}.` : 'Right-bank towns do not appear in today’s table.'} If you live in La Bastide, Cenon or Lormont, a centre on the same bank saves a rush-hour crossing, which often costs more than the price gap.</p>
<p>${x.v.moinsCher15!.v.startsWith('Bordeaux') ? `Notably, the cheapest centre in the whole 15 km radius is in Bordeaux itself: ${h.prix(x.v.moinsCher15!.p)}, while the dearest in the city declares ${h.prix(x.v.plusCher!.p)}.` : `The cheapest within 15 km is in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}); in the city the lowest is ${h.prix(x.v.moinsCher!.p)}.`} The mini calculator places a price within the Gironde ranking.</p>
<!--mini:depPrix_33-->
<h2>Price by vehicle</h2>
${x.vehTable(`Bordeaux, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<p>The table compares the city, the metro area and France. ${x.v.s.el ? `Electric cars are declared at ${h.prix(x.v.s.el.med)} at the median in Bordeaux, ${x.cmp(x.v.s.el.med, x.e!.med)} petrol.` : ''} ${x.v.s.m ? `For a motorbike, ${x.nb(x.v.s.m.n, 'centre in the city is', 'centres in the city are')} equipped` : 'For a motorbike, few centres in the city are equipped'}${x.v.s15.m ? `, ${h.num(x.v.s15.m.n)} within 15 km` : ''}; the two-wheeler timetable is in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<h2>A re-inspection ${x.v.cv!.gratuite > h.S.national.cv.gratuite ? 'free more often than elsewhere' : 'worth comparing too'}</h2>
<p>After a fail, the re-inspection (contre-visite) must take place within two months. In Bordeaux it is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. ${x.v.cv!.gratuite > 0 ? `${h.pct(x.v.cv!.gratuite, 0)} of the city’s centres say it is free in some cases, against ${h.pct(h.S.national.cv.gratuite, 0)} across France.` : 'No centre in the city declares it free.'} For a car likely to fail, this matters more than a few euros on the test price.</p>
<!--mini:cvDept_33-->
<p>The rules, and what changes with a critical defect, are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<h2>Nouvelle-Aquitaine around Bordeaux</h2>
<p>Petrol test medians today, cheapest first: ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. ${x.v.ancien != null ? `In Bordeaux, ${h.pct(x.v.ancien, 0)} of centres declare a car price from before 2023: the centre’s display is what counts.` : ''} To compare with other western cities, see ${h.a('controle-technique-toulouse', 'Toulouse')} and ${h.a('controle-technique-nantes', 'Nantes')}; for the full ranking, the ${h.a('departements', 'départements page')}; to pay less, the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')}.</p>`;
    },
  },
});

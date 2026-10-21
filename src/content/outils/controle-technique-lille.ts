import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'lille';
type DepS = Record<string, { centres: number; s: { e?: { med: number } } }>;
const DS = (h: Helpers) => h.S.depts as unknown as DepS;
const voisins = (h: Helpers) => ['59', '62', '02', '80'].filter((d) => DS(h)[d]?.s.e).map((d) => ({ nom: h.dep(d), med: DS(h)[d].s.e!.med })).sort((a, b) => a.med - b.med);
/** Le Nord est-il le département qui compte le plus de centres ? Rang (1 = le plus de centres). */
const rangCentres = (h: Helpers) => Object.values(DS(h)).filter((x) => x.centres > DS(h)['59'].centres).length + 1;
/** Rang du Nord par médiane essence parmi les départements d'au moins 10 centres (1 = le moins cher). */
const rangPrix = (h: Helpers) => { const l = Object.values(DS(h)).filter((x) => x.centres >= 10 && x.s.e).map((x) => x.s.e!.med); return { r: l.filter((v) => v < DS(h)['59'].s.e!.med).length + 1, n: l.length }; };

export default defineGuide({
  id: 'controle-technique-lille',
  group: 'villes',
  order: 10,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-pas-cher', 'contre-visite', 'controle-technique-paris', 'controle-technique-reims'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-lille',
    nav: 'Lille',
    card: 'Lille et la métropole, de Roubaix à Villeneuve-d’Ascq : prix déclarés.',
    title: 'Contrôle technique à Lille : prix dans toute la métropole',
    description: 'Contrôle technique à Lille : prix de chaque centre, médianes ville et métropole, Roubaix et Tourcoing, Nord et Pas-de-Calais, contre-visite. Fichier du jour.',
    h1: 'Contrôle technique à Lille : les prix de la métropole',
    intro: 'Les tarifs que les centres de Lille et de la métropole lilloise déclarent à la DGCCRF, triés pour votre véhicule.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!, rp = rangPrix(h);
      return `Faire contrôler sa voiture à Lille coûte ${h.prix(x.e!.med)} en médiane pour une essence ou une diesel, ${x.cmp(x.e!.med, x.natMed)} la médiane nationale de ${h.prix(x.natMed)}. Le Nord se place au ${h.num(rp.r)}e rang sur ${h.num(rp.n)} départements d’au moins dix centres, classés du moins cher au plus cher. Dans la ville, ${x.nb(x.v.n, 'centre déclare', 'centres déclarent')} un prix voiture, de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)}. La métropole offre un choix rare : ${h.num(x.v.n15)} centres dans un rayon de 15 km, pour une médiane de ${h.prix(x.e15!.med)}, et un prix le plus bas de ${h.prix(mc15.p)} à ${mc15.v}. La contre-visite se déclare entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane. Ces prix sont ceux que chaque centre transmet à l’administration, dans le fichier public relu ce jour (${x.fichier}) ; l’outil trie les centres autour de votre commune, sans compte ni réservation.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = voisins(h);
      return [
        { q: 'Roubaix et Tourcoing sont-ils moins chers que Lille pour le contrôle technique ?', a: `Dans le fichier du jour, le centre le moins cher à moins de 15 km de Lille est à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}), et la médiane de ce rayon est ${x.cmp(x.e15!.med, x.e!.med)} celle de Lille. L’outil, réglé sur 15 ou 20 km, affiche tous les centres de Roubaix, Tourcoing et Villeneuve-d’Ascq avec leur prix.` },
        { q: 'Un contrôle technique belge est-il valable pour une voiture lilloise ?', a: 'Non. Une voiture immatriculée en France passe son contrôle technique dans un centre agréé en France ; les stations de contrôle belges ne figurent pas dans le fichier de la DGCCRF et ne délivrent pas le procès-verbal français. Les frontaliers dont la voiture est immatriculée en Belgique suivent, eux, la réglementation belge.' },
        { q: 'Le Nord est-il un département bon marché pour le contrôle technique ?', a: `Sa médiane, ${h.prix(x.depMed)}, est ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Parmi les départements des Hauts-de-France proches de Lille, l’ordre du jour est : ${v.map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Le Nord est aussi ${rangCentres(h) === 1 ? 'le département qui compte le plus de centres' : `au ${h.num(rangCentres(h))}e rang pour le nombre de centres`}.` },
        { q: 'Les tarifs des centres lillois sont-ils récents ?', a: `${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} des centres de Lille déclarent un tarif voiture appliqué avant 2023, contre ${h.pct(h.S.national.ancien, 0)} en France.` : 'Le fichier ne permet pas de dater tous les tarifs lillois.'} Un tarif ancien peut avoir été relevé sans mise à jour de la fiche : l’affichage à l’accueil du centre fait foi.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), rp = rangPrix(h);
      return `<h2>Une métropole très équipée</h2>
<p>Lille, Roubaix, Tourcoing, Villeneuve-d’Ascq et une constellation de communes forment une agglomération continue, et les centres de contrôle y sont nombreux : ${h.num(x.v.n15)} dans un rayon de 15 km autour de Lille. Le département du Nord en compte ${h.num(DS(h)['59'].centres)}, ce qui le place ${rangCentres(h) === 1 ? 'en tête des départements français' : `au ${h.num(rangCentres(h))}e rang des départements`}. Cette densité se lit dans les prix : la médiane de la métropole, ${h.prix(x.e15!.med)}, est ${x.cmp(x.e15!.med, x.natMed)} la médiane nationale.</p>
${x.voisinesTable(`Communes voisines de Lille : contrôle d’une voiture essence, fichier du ${x.fichier}`)}
<p>Le tableau, trié par distance, montre les communes qui touchent Lille. Plus loin, au-delà de 10 km, l’outil fait apparaître les centres de Roubaix et de Tourcoing. Le moins cher du rayon de 15 km est aujourd’hui à ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}).</p>
<h2>Dans Lille</h2>
<p>La ville elle-même compte ${x.nb(x.v.n, 'centre', 'centres')} qui déclarent un prix voiture, pour une médiane de ${h.prix(x.e!.med)}. Le moins cher déclare ${h.prix(x.v.moinsCher!.p)}, le plus cher ${h.prix(x.v.plusCher!.p)}. ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} de ces centres déclarent un tarif d’avant 2023 : l’astérisque de la liste les signale, et un appel avant de venir évite une mauvaise surprise.` : ''}</p>
${x.vehTable(`Lille, 15 km autour et France : prix médian par véhicule, fichier du ${x.fichier}`)}
<p>${x.v.s.el ? `L’électrique est déclarée ${h.prix(x.v.s.el.med)} en médiane dans la ville, ${x.cmp(x.v.s.el.med, x.e!.med)} l’essence.` : ''} Le guide ${h.a('controle-technique-electrique', 'du contrôle technique d’une électrique')} explique pourquoi certains centres facturent un supplément et d’autres non.</p>
<h2>Le prix annoncé est-il le bon ?</h2>
<p>Avec un département classé au ${h.num(rp.r)}e rang sur ${h.num(rp.n)} du moins cher au plus cher, ${x.depMed < x.natMed ? 'un automobiliste lillois a de bonnes chances de trouver un prix sous la médiane nationale' : 'un automobiliste lillois a intérêt à comparer avant de réserver'}. Le mini-simulateur compare un tarif annoncé à la médiane du Nord et aux déciles français.</p>
<!--mini:devis_59-->
<p>Si l’écart est important, la liste de l’outil montre en général plusieurs centres moins chers à quelques kilomètres.</p>
<h2>Nord, Pas-de-Calais et la frontière belge</h2>
<p>Classement du jour des départements proches, du moins cher au plus cher (médiane essence) : ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. Le mini-simulateur donne, pour chacun, la médiane par véhicule et le centre le moins cher.</p>
<!--mini:depPrix_59-->
<p>La Belgique est à quelques kilomètres, mais ses stations de contrôle ne peuvent pas contrôler une voiture à carte grise française, et elles n’apparaissent pas dans le fichier de la DGCCRF. Pour comparer avec d’autres villes du Nord-Est, voir ${h.a('controle-technique-reims', 'Reims')}, ou ${h.a('controle-technique-paris', 'Paris')} pour la région parisienne ; le classement complet est sur la page des ${h.a('departements', 'départements')}.</p>
<h2>Motos et contre-visite</h2>
<p>${x.v.s.m ? `Pour une moto, ${x.nb(x.v.s.m.n, 'centre de Lille déclare', 'centres de Lille déclarent')} un prix (médiane ${h.prix(x.v.s.m.med)})` : 'Pour une moto, peu de centres de Lille déclarent un prix'}${x.v.s15.m ? ` ; ils sont ${h.num(x.v.s15.m.n)} dans les 15 km` : ''}. Le calendrier des deux-roues est détaillé dans le guide ${h.a('controle-technique-moto', 'du contrôle technique moto')}. En cas d’échec, la contre-visite se déclare à Lille entre ${h.prix(x.v.cv!.min.med)} et ${h.prix(x.v.cv!.max.med)} en médiane${x.v.cv!.gratuite > 0 ? `, gratuite dans certains cas chez ${h.pct(x.v.cv!.gratuite, 0)} des centres` : ''} ; elle doit avoir lieu dans les deux mois (page ${h.a('contre-visite', 'contre-visite')}). D’autres pistes pour payer moins sont réunies dans le guide ${h.a('controle-technique-pas-cher', 'du contrôle technique pas cher')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-lille',
    nav: 'Lille',
    card: 'Lille and its metro area, from Roubaix to Villeneuve-d’Ascq: declared prices.',
    title: 'Contrôle technique in Lille: metro area centre prices',
    description: 'Contrôle technique in Lille: every centre’s price, city and metro medians, Roubaix and Tourcoing, Nord and Pas-de-Calais, re-inspection. Today’s DGCCRF file.',
    h1: 'Contrôle technique in Lille: prices across the metro area',
    intro: 'The prices that centres in Lille and its metro area declare to the DGCCRF, sorted for your vehicle.',
    resume: (h) => {
      const x = ville(h, SLUG), mc15 = x.v.moinsCher15!, rp = rangPrix(h);
      return `Getting a car through its contrôle technique (France’s compulsory roadworthiness test) in Lille costs ${h.prix(x.e!.med)} at the median for petrol or diesel, ${x.cmp(x.e!.med, x.natMed)} the national median of ${h.prix(x.natMed)}. The Nord département ranks ${h.num(rp.r)} of ${h.num(rp.n)} départements with at least ten centres, from cheapest to dearest. In the city, ${x.nb(x.v.n, 'centre declares', 'centres declare')} a car price, from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}. The metro area offers unusual choice: ${h.num(x.v.n15)} centres within 15 km, with a median of ${h.prix(x.e15!.med)} and a lowest price of ${h.prix(mc15.p)} in ${mc15.v}. A re-inspection (contre-visite) is declared at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median. These are the prices each centre reports to the authorities, in the public file read today (${x.fichier}); the tool sorts the centres around your town, with no account and no booking.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = voisins(h);
      return [
        { q: 'Are Roubaix and Tourcoing cheaper than Lille for the contrôle technique?', a: `In today’s file the cheapest centre within 15 km of Lille is in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}), and the median in that radius is ${x.cmp(x.e15!.med, x.e!.med)} Lille’s. The tool, set to 15 or 20 km, shows every centre in Roubaix, Tourcoing and Villeneuve-d’Ascq with its price.` },
        { q: 'Is a Belgian inspection valid for a car registered in Lille?', a: 'No. A car registered in France takes its contrôle technique at a centre approved in France; Belgian inspection stations are not in the DGCCRF file and do not issue the French report. Cross-border commuters whose car is registered in Belgium follow Belgian rules instead.' },
        { q: 'Is the Nord département cheap for the contrôle technique?', a: `Its median, ${h.prix(x.depMed)}, is ${x.cmp(x.depMed, x.natMed)} the national median. Among the Hauts-de-France départements near Lille, today’s order is: ${v.map((d) => `${d.nom} ${h.prix(d.med)}`).join(', ')}. Nord is also ${rangCentres(h) === 1 ? 'the département with the most centres' : `ranked ${h.num(rangCentres(h))} for number of centres`}. A dense network usually means more choice within a short drive, which the tool’s radius setting makes easy to check.` },
        { q: 'Are Lille centres’ prices recent?', a: `${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of Lille centres declare a car price applied before 2023, against ${h.pct(h.S.national.ancien, 0)} across France.` : 'The file does not date every Lille price.'} An old price may have been raised without the record being updated: the price displayed at the centre’s desk is what counts. Each centre in the tool shows the date its price took effect, so you can tell a fresh figure from a stale one.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = voisins(h), rp = rangPrix(h);
      return `<h2>A well-equipped metro area</h2>
<p>Lille, Roubaix, Tourcoing, Villeneuve-d’Ascq and a cluster of smaller towns form one continuous urban area, and inspection centres are plentiful: ${h.num(x.v.n15)} within 15 km of Lille. The Nord département has ${h.num(DS(h)['59'].centres)}, which ranks it ${rangCentres(h) === 1 ? 'first among French départements' : `${h.num(rangCentres(h))} among départements`}. That density shows in the prices: the metro median, ${h.prix(x.e15!.med)}, is ${x.cmp(x.e15!.med, x.natMed)} the national median.</p>
${x.voisinesTable(`Towns near Lille: petrol car test, file of ${x.fichier}`)}
<p>The table, sorted by distance, shows the towns bordering Lille. Further out, beyond 10 km, the tool brings in the centres of Roubaix and Tourcoing. The cheapest in the 15 km radius is today in ${x.v.moinsCher15!.v} (${h.prix(x.v.moinsCher15!.p)}).</p>
<h2>Inside Lille</h2>
<p>The city itself has ${x.nb(x.v.n, 'centre', 'centres')} declaring a car price, with a median of ${h.prix(x.e!.med)}. The cheapest declares ${h.prix(x.v.moinsCher!.p)}, the dearest ${h.prix(x.v.plusCher!.p)}. ${x.v.ancien != null ? `${h.pct(x.v.ancien, 0)} of these centres declare a price from before 2023: the asterisk in the list flags them, and a call before you go avoids a nasty surprise.` : ''}</p>
${x.vehTable(`Lille, 15 km around and France: median price by vehicle, file of ${x.fichier}`)}
<p>${x.v.s.el ? `Electric cars are declared at ${h.prix(x.v.s.el.med)} at the median in the city, ${x.cmp(x.v.s.el.med, x.e!.med)} petrol.` : ''} The ${h.a('controle-technique-electrique', 'electric car guide')} explains why some centres add a surcharge and others do not.</p>
<h2>Is the price you were quoted right?</h2>
<p>With a département ranked ${h.num(rp.r)} of ${h.num(rp.n)} from cheapest to dearest, ${x.depMed < x.natMed ? 'a Lille driver has a good chance of finding a price below the national median' : 'a Lille driver gains by comparing before booking'}. The mini calculator compares a quoted price with the Nord median and the French deciles.</p>
<!--mini:devis_59-->
<p>If the gap is large, the tool’s list usually shows several cheaper centres a few kilometres away.</p>
<h2>Nord, Pas-de-Calais and the Belgian border</h2>
<p>Today’s ranking of nearby départements, cheapest first (petrol median): ${v.map((d) => `${d.nom} (${h.prix(d.med)})`).join(', ')}. The mini calculator gives, for each one, the median by vehicle and the cheapest centre.</p>
<!--mini:depPrix_59-->
<p>Belgium is a few kilometres away, but its inspection stations cannot test a car with a French registration certificate (carte grise), and they do not appear in the DGCCRF file. To compare with other north-eastern cities, see ${h.a('controle-technique-reims', 'Reims')}, or ${h.a('controle-technique-paris', 'Paris')} for the capital region; the full ranking is on the ${h.a('departements', 'départements page')}.</p>
<h2>Motorbikes and re-inspection</h2>
<p>${x.v.s.m ? `For a motorbike, ${x.nb(x.v.s.m.n, 'Lille centre declares', 'Lille centres declare')} a price (median ${h.prix(x.v.s.m.med)})` : 'For a motorbike, few Lille centres declare a price'}${x.v.s15.m ? `; there are ${h.num(x.v.s15.m.n)} within 15 km` : ''}. The two-wheeler timetable is in the ${h.a('controle-technique-moto', 'motorcycle guide')}. After a fail, the re-inspection (contre-visite) is declared in Lille at between ${h.prix(x.v.cv!.min.med)} and ${h.prix(x.v.cv!.max.med)} at the median${x.v.cv!.gratuite > 0 ? `, free in some cases at ${h.pct(x.v.cv!.gratuite, 0)} of centres` : ''}; it must take place within two months (see the ${h.a('contre-visite', 're-inspection page')}). More ways to pay less are in the guide to a ${h.a('controle-technique-pas-cher', 'cheap contrôle technique')}.</p>`;
    },
  },
});

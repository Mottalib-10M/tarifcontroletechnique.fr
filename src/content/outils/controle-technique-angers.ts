import { defineGuide, type Helpers } from '../../lib/guide-types';
import { ville } from '../../lib/ville-texte';

const SLUG = 'angers';

/** Rang du département (médiane essence, départements d'au moins dix centres) : 1 = le moins cher. */
const rang = (h: Helpers, d: string) => {
  const l = Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, { med: number } | undefined> }>).filter(([, x]) => x.centres >= 10 && x.s.e);
  const me = l.find(([k]) => k === d)?.[1].s.e?.med ?? 0;
  return { i: l.filter(([, x]) => x.s.e!.med < me).length + 1, n: l.length };
};
const ord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
/** Part nationale des centres au tarif voiture antérieur à 2023, pour situer Angers. */
const ancienNat = (h: Helpers) => h.S.national.ancien;

export default defineGuide({
  id: 'controle-technique-angers',
  group: 'villes',
  order: 17,
  tool: 'centres',
  ville: SLUG,
  related: ['departements', 'controle-technique-moto', 'contre-visite', 'controle-technique-pas-cher', 'controle-technique-nantes'],
  sources: ['dataset', 'prixConso', 'arretePrix', 'spVoiture'],
  fr: {
    slug: 'controle-technique-angers',
    nav: 'Angers',
    card: 'Les centres d’Angers et de sa couronne, au bord de la Maine et de la Loire.',
    title: 'Contrôle technique à Angers : prix des centres agréés',
    description: 'Prix du contrôle technique à Angers : tarif de chaque centre de la ville et des communes voisines, médiane du Maine-et-Loire, moto et contre-visite du jour.',
    h1: 'Contrôle technique à Angers : prix de chaque centre',
    intro: 'Les tarifs que les centres angevins et ceux de la couronne déclarent à la DGCCRF, à comparer avant d’appeler le centre choisi.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `Angers compte ${x.nb(v.n, 'centre de contrôle technique agréé', 'centres de contrôle technique agréés')} dans le fichier public des prix, et ${h.num(v.n15)} dans un rayon de 15 km. Pour une voiture essence ou diesel, la médiane de la ville est de ${h.prix(x.e!.med)}, avec des tarifs allant de ${h.prix(x.e!.min)} à ${h.prix(x.e!.max)} ; elle est ${x.cmp(x.e!.med, x.natMed)} la médiane de la France (${h.prix(x.natMed)}) et ${x.cmp(x.e!.med, x.depMed)} celle du Maine-et-Loire (${h.prix(x.depMed)}). ${v.moinsCher ? `Le centre angevin le moins cher déclare ${h.prix(v.moinsCher.p)}, ${h.prix(x.e!.med - v.moinsCher.p)} sous la médiane locale.` : ''} ${v.ancien != null ? `${h.pct(v.ancien, 0)} des centres de la ville affichent un tarif voiture antérieur à 2023, contre ${h.pct(ancienNat(h), 0)} en France${v.ancien < ancienNat(h) ? ' : les prix angevins sont donc plutôt récents' : ''}.` : ''} Ils viennent des déclarations des centres à la DGCCRF, relues chaque jour par ce site (fichier du ${x.fichier}). Utilisez l’outil pour comparer depuis votre commune.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Les tarifs de contrôle technique publiés pour Angers sont-ils à jour ?', a: `${v.ancien != null ? `Dans le fichier du jour, ${h.pct(v.ancien, 0)} des centres d’Angers déclarent un tarif voiture daté d’avant 2023, contre ${h.pct(ancienNat(h), 0)} au niveau national.` : ''} Un tarif récemment mis à jour reflète mieux le prix réellement affiché au centre, mais il intègre aussi les dernières hausses : c’est l’une des raisons pour lesquelles la médiane angevine se compare comme elle le fait à la France.` },
        { q: 'Combien coûte le contrôle technique d’une moto à Angers ?', a: (v.s.m ? `${x.nb(v.s.m.n, 'centre d’Angers déclare', 'centres d’Angers déclarent')} un tarif moto, avec une médiane de ${h.prix(v.s.m.med)}${v.moinsCherMoto ? ` et un minimum de ${h.prix(v.moinsCherMoto.p)}` : ''}. ${v.s15.m ? `Dans un rayon de 15 km, ${h.num(v.s15.m.n)} centres sont équipés.` : ''}` : `Aucun centre de la ville ne déclare de tarif moto aujourd’hui${v.s15.m ? ` ; ${h.num(v.s15.m.n)} le font dans les 15 km` : ''}.`) + ` Le contrôle d’une moto porte notamment sur le freinage, l’éclairage, les pneumatiques et le niveau sonore : présentez-vous avec le certificat d’immatriculation du deux-roues.` },
        { q: 'Faut-il sortir d’Angers pour payer son contrôle moins cher ?', a: `La médiane d’Angers est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon de 15 km. ${v.moinsCher15 ? `Le tarif le plus bas du rayon, ${h.prix(v.moinsCher15.p)}, est ${v.moinsCher15.v === v.nom ? 'dans Angers même' : `à ${v.moinsCher15.v}`}.` : ''} Comparez la liste par prix : le bon centre peut être dans votre quartier.` },
        { q: 'La contre-visite est-elle chère à Angers ?', a: (v.cv ? `Les centres angevins déclarent une contre-visite entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane, contre ${h.prix(h.S.national.cv.min.med)} et ${h.prix(h.S.national.cv.max.med)} en France. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} annoncent une gratuité possible.` : 'Aucun n’annonce de gratuité dans le fichier du jour.'}` : 'Le fichier ne donne pas de prix de contre-visite pour Angers ; demandez-le avant le contrôle.') + ` Elle ne porte que sur les défaillances relevées lors du premier passage ; au-delà de deux mois, il faut repasser un contrôle complet au tarif plein.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d);
      return `<h2>Angers, entre Maine et Loire</h2>
<p>Angers s’étend de part et d’autre de la Maine, à quelques kilomètres de sa confluence avec la Loire. Préfecture du Maine-et-Loire, elle est entourée de communes (Avrillé, Beaucouzé, Trélazé, Les Ponts-de-Cé, Saint-Barthélemy-d’Anjou) où se trouvent une partie des centres de contrôle. Le fichier en compte ${h.num(v.n)} dans la ville et ${h.num(v.n15)} à moins de 15 km.</p>
<p>Les prix angevins pour une voiture essence s’étalent sur ${h.prix(x.e!.max - x.e!.min)}, du centre le moins cher au plus cher. La médiane de la ville est ${x.cmp(x.e!.med, x.e15!.med)} celle du rayon de 15 km, ce qui veut dire qu’à Angers le détour par la périphérie n’apporte pas automatiquement une économie : tout dépend du centre.</p>
${x.vehTable(`Prix médian par véhicule à Angers, dans les 15 km et en France, fichier du ${x.fichier}`)}
<h2>À quel point les tarifs sont-ils récents ?</h2>
<p>${v.ancien != null ? `Le fichier date chaque tarif. À Angers, ${h.pct(v.ancien, 0)} des centres déclarent un prix voiture antérieur à 2023, quand la proportion nationale est de ${h.pct(ancienNat(h), 0)}.` : 'Le fichier date chaque tarif.'} Plus la part de tarifs récents est forte, plus le prix lu dans la liste a de chances d’être celui de l’accueil ; mais des tarifs récents intègrent aussi les dernières hausses, ce qui pèse sur la médiane. Les centres dont le tarif a plus de trois ans restent signalés par un astérisque.</p>
<h2>Le Maine-et-Loire dans le classement</h2>
<p>Le département compte ${h.num(x.dep.centres)} centres, d’Angers à Cholet et Saumur. Sa médiane, ${h.prix(x.depMed)} pour une voiture essence, le place au ${r.i}${r.i === 1 ? 'er' : 'e'} rang sur ${r.n} départements d’au moins dix centres, du moins cher au plus cher, ${x.cmp(x.depMed, x.natMed)} la médiane nationale. Voir le ${h.a('departements', 'classement complet')}, véhicule par véhicule.</p>
<!--mini:devis_49-->
<h2>La couronne angevine</h2>
<p>Le tableau suivant classe les communes voisines qui ont un centre, de la plus proche à la plus lointaine, avec leur médiane et leur tarif le plus bas. Les axes qui rayonnent depuis Angers rendent la plupart d’entre elles accessibles en un quart d’heure.</p>
${x.voisinesTable(`Communes autour d’Angers : prix d’un contrôle voiture essence, fichier du ${x.fichier}`)}
<h2>Motos et scooters</h2>
<p>${v.s.m ? `Dans la ville, ${x.nb(v.s.m.n, 'centre déclare', 'centres déclarent')} un tarif moto, médiane ${h.prix(v.s.m.med)}.` : 'Aucun centre angevin ne déclare de tarif moto dans le fichier du jour.'} ${v.s15.m ? `Dans un rayon de 15 km, le choix monte à ${x.nb(v.s15.m.n, 'centre', 'centres')}, avec une médiane de ${h.prix(v.s15.m.med)}.` : ''} Le calendrier, qui dépend de l’année de mise en circulation, est dans le ${h.a('controle-technique-moto', 'guide moto')}.</p>
<!--mini:deuxRouesPrix_49-->
<h2>Contre-visite et électrique</h2>
<p>${v.cv ? `Après un contrôle défavorable, la contre-visite se déclare à Angers entre ${h.prix(v.cv.min.med)} et ${h.prix(v.cv.max.med)} en médiane.` : ''} Elle se fait dans les deux mois, dans le centre de votre choix : voir la page ${h.a('contre-visite', 'contre-visite')}. ${v.s.el ? `Pour une voiture électrique, la médiane angevine est de ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} l’essence.` : ''} Pour payer moins, les ${h.a('controle-technique-pas-cher', 'conseils pour un contrôle moins cher')} s’appliquent aussi ici, et la grande voisine ${h.a('controle-technique-nantes', 'Nantes')} a sa propre page.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-angers',
    nav: 'Angers',
    card: 'Centres in Angers and nearby towns, on the Maine close to the Loire.',
    title: 'Contrôle technique in Angers: approved centre prices',
    description: 'Contrôle technique prices in Angers: the price at each centre in the city and nearby towns, the Maine-et-Loire median, motorbikes and re-checks. Today’s file.',
    h1: 'Contrôle technique in Angers: every centre’s price',
    intro: 'The prices centres in Angers and the surrounding towns declare to the DGCCRF, to compare before you call the centre you choose.',
    resume: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return `Angers has ${x.nb(v.n, 'approved contrôle technique centre', 'approved contrôle technique centres')} in the public price file, and ${h.num(v.n15)} within a 15 km radius. For a petrol or diesel car (the contrôle technique is France’s compulsory roadworthiness test), the city median is ${h.prix(x.e!.med)}, with prices from ${h.prix(x.e!.min)} to ${h.prix(x.e!.max)}; it is ${x.cmp(x.e!.med, x.natMed)} the French median (${h.prix(x.natMed)}) and ${x.cmp(x.e!.med, x.depMed)} the Maine-et-Loire median (${h.prix(x.depMed)}). ${v.moinsCher ? `The cheapest centre in Angers declares ${h.prix(v.moinsCher.p)}, ${h.prix(x.e!.med - v.moinsCher.p)} below the local median.` : ''} ${v.ancien != null ? `${h.pct(v.ancien, 0)} of the city’s centres show a car price from before 2023, against ${h.pct(ancienNat(h), 0)} across France${v.ancien < ancienNat(h) ? ', so Angers prices are fairly fresh' : ''}.` : ''} They come from the centres’ declarations to the DGCCRF, reread every day by this site (file of ${x.fichier}). Use the tool to compare from your own town.`;
    },
    faqs: (h) => {
      const x = ville(h, SLUG), v = x.v;
      return [
        { q: 'Are the contrôle technique prices listed for Angers up to date?', a: `${v.ancien != null ? `In today’s file, ${h.pct(v.ancien, 0)} of Angers centres declare a car price dated before 2023, against ${h.pct(ancienNat(h), 0)} nationally.` : ''} A recently updated price better reflects what is displayed at the centre, but it also includes the latest rises: that is one reason the Angers median compares with France the way it does.` },
        { q: 'How much is a motorcycle test in Angers?', a: (v.s.m ? `${x.nb(v.s.m.n, 'Angers centre declares', 'Angers centres declare')} a motorcycle price, with a median of ${h.prix(v.s.m.med)}${v.moinsCherMoto ? ` and a minimum of ${h.prix(v.moinsCherMoto.p)}` : ''}. ${v.s15.m ? `Within 15 km, ${h.num(v.s15.m.n)} centres are equipped.` : ''}` : `No centre in the city declares a motorcycle price today${v.s15.m ? `; ${h.num(v.s15.m.n)} do within 15 km` : ''}.`) + ` A motorcycle test covers braking, lighting, tyres and noise level among other points; bring the bike’s registration certificate, and filter the tool on “Motorcycle” to compare Angers centres side by side.` },
        { q: 'Do I need to leave Angers to pay less for my test?', a: (`The Angers median is ${x.cmp(x.e!.med, x.e15!.med)} the 15 km median. ${v.moinsCher15 ? `The lowest price in the radius, ${h.prix(v.moinsCher15.p)}, is ${v.moinsCher15.v === v.nom ? 'in Angers itself' : `in ${v.moinsCher15.v}`}.` : ''} Sort the list by price: the right centre may be in your own district.`) + ` Prices are set freely by each centre, so two Angers garages a few streets apart can differ more than the city and its suburbs.` },
        { q: 'Is the re-inspection expensive in Angers?', a: (v.cv ? `Angers centres declare a re-inspection (contre-visite) between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median, against ${h.prix(h.S.national.cv.min.med)} and ${h.prix(h.S.national.cv.max.med)} across France. ${v.cv.gratuite > 0 ? `${h.pct(v.cv.gratuite, 0)} say it can be free.` : 'None says it can be free in today’s file.'}` : 'The file gives no re-inspection price for Angers; ask before the test.') + ` It only covers the defects found at the first visit; after two months, a full test at the normal price is needed instead.` },
      ];
    },
    body: (h) => {
      const x = ville(h, SLUG), v = x.v, r = rang(h, v.d);
      return `<h2>Angers, between the Maine and the Loire</h2>
<p>Angers spreads across both banks of the Maine, a few kilometres from where it joins the Loire. Prefecture of Maine-et-Loire, it is surrounded by towns (Avrillé, Beaucouzé, Trélazé, Les Ponts-de-Cé, Saint-Barthélemy-d’Anjou) that host some of the inspection centres. The file counts ${h.num(v.n)} in the city and ${h.num(v.n15)} less than 15 km away.</p>
<p>Angers prices for a petrol car spread over ${h.prix(x.e!.max - x.e!.min)}, from the cheapest centre to the dearest. The city median is ${x.cmp(x.e!.med, x.e15!.med)} the 15 km median, which means that in Angers a detour to the outskirts does not automatically save money: it all depends on the centre.</p>
${x.vehTable(`Median price by vehicle in Angers, within 15 km and in France, file of ${x.fichier}`)}
<h2>How recent are the prices?</h2>
<p>${v.ancien != null ? `The file dates every price. In Angers ${h.pct(v.ancien, 0)} of centres declare a car price from before 2023, while the national share is ${h.pct(ancienNat(h), 0)}.` : 'The file dates every price.'} The higher the share of recent prices, the more likely the price in the list is the one at the desk; but recent prices also include the latest rises, which weighs on the median. Centres whose price is more than three years old are still flagged with an asterisk.</p>
<h2>Maine-et-Loire in the ranking</h2>
<p>The département has ${h.num(x.dep.centres)} centres, from Angers to Cholet and Saumur. Its median, ${h.prix(x.depMed)} for a petrol car, ranks it ${r.i}${ord(r.i)} of ${r.n} départements with at least ten centres, from cheapest to dearest, ${x.cmp(x.depMed, x.natMed)} the national median. See the ${h.a('departements', 'full ranking')}, vehicle by vehicle.</p>
<!--mini:devis_49-->
<h2>The towns around Angers</h2>
<p>The next table lists neighbouring towns with a centre, from nearest to furthest, with their median and lowest price. The main roads radiating from Angers put most of them within a quarter of an hour.</p>
${x.voisinesTable(`Towns around Angers: price of a petrol car test, file of ${x.fichier}`)}
<h2>Motorbikes and scooters</h2>
<p>${v.s.m ? `In the city, ${x.nb(v.s.m.n, 'centre declares', 'centres declare')} a motorcycle price, median ${h.prix(v.s.m.med)}.` : 'No Angers centre declares a motorcycle price in today’s file.'} ${v.s15.m ? `Within 15 km the choice rises to ${x.nb(v.s15.m.n, 'centre', 'centres')}, with a median of ${h.prix(v.s15.m.med)}.` : ''} The timetable, which depends on the year of first registration, is in the ${h.a('controle-technique-moto', 'motorcycle guide')}.</p>
<!--mini:deuxRouesPrix_49-->
<h2>Re-inspection and electric cars</h2>
<p>${v.cv ? `After a failed test, the re-inspection (contre-visite) is declared in Angers between ${h.prix(v.cv.min.med)} and ${h.prix(v.cv.max.med)} at the median.` : ''} It must be done within two months, at the centre of your choice: see the ${h.a('contre-visite', 're-inspection page')}. ${v.s.el ? `For an electric car the Angers median is ${h.prix(v.s.el.med)}, ${x.cmp(v.s.el.med, x.e!.med)} petrol.` : ''} To pay less, the ${h.a('controle-technique-pas-cher', 'tips for a cheaper test')} apply here too, and the big neighbour ${h.a('controle-technique-nantes', 'Nantes')} has its own page.</p>`;
    },
  },
});

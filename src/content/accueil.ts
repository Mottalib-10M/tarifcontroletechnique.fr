/** Accueil (page pilier) : texte des deux langues. Rendu par components/HomePage.astro. Aucun prix écrit à la main : tout vient de data/ct/. */
import type { Helpers, PageText } from '../lib/guide-types';

type Home = Omit<PageText, 'slug' | 'card' | 'nav'>;
type R = { n: number; moy: number; med: number; p10: number; p90: number; min: number; max: number };

const N = (h: Helpers) => h.S.national;
const S = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
/** Départements classés par médiane essence (au moins 10 centres, pour ne pas classer un département sur deux centres). */
const classement = (h: Helpers) => Object.entries(h.S.depts as unknown as Record<string, { centres: number; s: Record<string, R> }>)
  .filter(([, d]) => d.centres >= 10 && d.s.e).map(([d, x]) => ({ d, nom: h.dep(d), med: x.s.e.med, n: x.centres })).sort((a, b) => a.med - b.med || a.d.localeCompare(b.d));
const VILLES: Array<[string, string]> = [['paris', 'Paris'], ['marseille', 'Marseille'], ['lyon', 'Lyon'], ['toulouse', 'Toulouse'], ['nice', 'Nice'], ['nantes', 'Nantes'], ['montpellier', 'Montpellier'], ['strasbourg', 'Strasbourg'], ['bordeaux', 'Bordeaux'], ['lille', 'Lille'], ['rennes', 'Rennes'], ['toulon', 'Toulon'], ['reims', 'Reims'], ['saint-etienne', 'Saint-Étienne'], ['le-havre', 'Le Havre'], ['dijon', 'Dijon'], ['angers', 'Angers'], ['grenoble', 'Grenoble'], ['nimes', 'Nîmes'], ['clermont-ferrand', 'Clermont-Ferrand']];
type V = { n: number; n15: number; s: Record<string, R | undefined>; s15: Record<string, R | undefined>; moinsCher15: { p: number; v: string } | null };
const villesTable = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const rows = VILLES.map(([k, nom]) => {
    const v = (h.V as unknown as Record<string, V>)[k];
    return [h.a(`controle-technique-${k}`, nom), h.num(v.n), v.s.e ? h.prix(v.s.e.med) : '—', h.num(v.n15), h.prix(v.s15.e!.med), v.moinsCher15 ? `${h.prix(v.moinsCher15.p)} (${v.moinsCher15.v})` : '—'];
  });
  return h.table(fr ? ['Ville', 'Centres', 'Médiane', 'Centres à 15 km', 'Médiane à 15 km', 'Le moins cher à 15 km'] : ['City', 'Centres', 'Median', 'Centres within 15 km', 'Median within 15 km', 'Cheapest within 15 km'], rows, fr ? `Contrôle d’une voiture essence dans les 20 plus grandes villes, fichier du ${h.date(h.S.meta.fichier)}` : `Petrol car test in the 20 largest cities, file of ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r', 'r', 'r', 'l']);
};
const vehTable = (h: Helpers) => {
  const fr = h.lang === 'fr', s = S(h);
  const K: Array<[string, string, string]> = [['e', 'Voiture essence', 'Petrol car'], ['d', 'Voiture diesel', 'Diesel car'], ['h', 'Voiture hybride', 'Hybrid car'], ['el', 'Voiture électrique', 'Electric car'], ['g', 'Voiture au gaz (GPL, GNV)', 'Gas car (LPG, CNG)'], ['x4', '4 x 4 diesel', 'Diesel 4x4'], ['u', 'Camionnette diesel', 'Diesel van'], ['cc', 'Camping-car diesel', 'Diesel motorhome'], ['co', 'Voiture de collection', 'Classic car'], ['m', 'Moto', 'Motorcycle'], ['cy', 'Cyclomoteur 50 cm³', '50 cc moped'], ['q', 'Quad', 'Quad bike'], ['tr', 'Tricycle', 'Trike'], ['vt', 'Voiturette sans permis', 'Microcar']];
  return h.table(fr ? ['Véhicule', 'Centres', 'Médiane', '1 centre sur 10 sous', '1 centre sur 10 au-dessus de'] : ['Vehicle', 'Centres', 'Median', '1 centre in 10 below', '1 centre in 10 above'], K.filter(([k]) => s[k]).map(([k, f, e]) => [fr ? f : e, h.num(s[k].n), h.prix(s[k].med), h.prix(s[k].p10), h.prix(s[k].p90)]), fr ? `Prix du contrôle technique par véhicule en France, fichier du ${h.date(h.S.meta.fichier)}` : `Contrôle technique price by vehicle in France, file of ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r', 'r', 'r']);
};
const histTable = (h: Helpers) => {
  const fr = h.lang === 'fr', hist = N(h).histE as Record<string, number>, tot = Object.values(hist).reduce((a, b) => a + b, 0);
  return h.table(fr ? ['Prix d’un contrôle essence', 'Centres', 'Part'] : ['Petrol car test price', 'Centres', 'Share'], Object.entries(hist).map(([b, n]) => [fr ? `de ${b} à ${Number(b) + 9},99 €` : `€${b} to €${Number(b) + 9}.99`, h.num(n), h.pct(n / tot, 0)]), fr ? 'Répartition des 6 000 centres par tranche de prix' : 'How the 6,000 centres spread across price bands', ['l', 'r', 'r']);
};

export const HOME: Record<'fr' | 'en', Home> = {
  fr: {
    title: 'Prix du contrôle technique 2026 : tous les centres comparés',
    description: 'Prix du contrôle technique 2026 près de chez vous : chaque centre agréé, visite et contre-visite, essence, diesel, électrique, moto. Fichier DGCCRF du jour.',
    h1: 'Prix du contrôle technique près de chez vous',
    intro: 'Tapez votre commune : les centres agréés autour, leur prix déclaré pour votre véhicule, la contre-visite et le moins cher. Sans compte ni rendez-vous.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `Un contrôle technique de voiture coûte ${h.prix(s.e.med)} en médiane en France en 2026, pour une voiture essence comme pour une diesel : c’est le prix au-dessous duquel se trouve la moitié des ${h.num(n.centresVp)} centres agréés qui contrôlent les voitures. Un centre sur dix est sous ${h.prix(s.e.p10)}, un sur dix au-dessus de ${h.prix(s.e.p90)}, et les extrêmes vont de ${h.prix(s.e.min)} à ${h.prix(s.e.max)}. L’hybride et l’électrique se paient ${h.prix(s.el.med)} en médiane, la moto ${h.prix(s.m.med)}, et la contre-visite entre ${h.prix(n.cv.min.med)} et ${h.prix(n.cv.max.med)}. Ces chiffres ne viennent ni d’une enquête ni d’un échantillon : chaque centre déclare ses prix dans un fichier public de la DGCCRF, publié sur data.gouv.fr sous Licence Ouverte, que ce site relit chaque jour (fichier du ${h.date(h.S.meta.fichier)}). Les prix étant libres, l’écart entre deux centres voisins dépasse souvent vingt euros : comparer avant de prendre rendez-vous est la seule façon de payer moins.`;
    },
    faqs: (h) => {
      const s = S(h), n = N(h), c = classement(h);
      return [
        { q: 'Quel est le prix moyen d’un contrôle technique en 2026 ?', a: `Sur les ${h.num(n.centresVp)} centres qui déclarent un prix pour une voiture essence, la moyenne est de ${h.prix(s.e.moy)} et la médiane de ${h.prix(s.e.med)}. La médiane est plus parlante : elle n’est pas tirée vers le haut par quelques centres très chers. Le chiffre de 78 € encore cité par de nombreux sites vient d’études de 2018 et 2019, avant les hausses de ces dernières années.` },
        { q: 'Quel département a le contrôle technique le moins cher ?', a: `Parmi les départements d’au moins dix centres, ${c[0].nom} a la médiane la plus basse (${h.prix(c[0].med)} pour une voiture essence), suivi de ${c[1].nom} et ${c[2].nom}. Le plus cher est ${c[c.length - 1].nom}, à ${h.prix(c[c.length - 1].med)}. Le classement complet, véhicule par véhicule, est sur la page des départements, mis à jour avec le fichier du jour.` },
        { q: 'Le contrôle technique d’une voiture électrique coûte-t-il plus cher ?', a: `Souvent, oui, sans que la loi l’impose : ${h.pct(n.elecPlusCher, 0)} des centres facturent l’électrique plus cher que l’essence, pour une médiane de ${h.prix(s.el.med)} contre ${h.prix(s.e.med)}. L’examen d’une électrique ne porte pourtant pas sur les gaz d’échappement. Quelques centres appliquent le même prix à toutes les motorisations : l’outil les fait apparaître en choisissant « Voiture électrique ».` },
        { q: 'Les prix affichés ici sont-ils ceux que je paierai au centre ?', a: `Ce sont les prix que chaque centre a lui-même déclarés à l’administration, avec leur date. ${h.pct(n.ancien, 0)} des centres déclarent un tarif voiture daté d’avant 2023, et certains ont pu le changer sans mettre à jour leur fiche. Le prix affiché à l’accueil du centre le jour du contrôle est celui qui s’applique ; la liste signale par un astérisque les tarifs de plus de trois ans.` },
        { q: 'Faut-il prendre rendez-vous pour comparer les prix sur ce site ?', a: 'Non. Ce site ne prend aucun rendez-vous, ne demande ni compte, ni adresse électronique, ni numéro de téléphone, et ne touche aucune commission. Il affiche les prix déclarés et la distance, puis vous contactez vous-même le centre de votre choix, par téléphone ou sur son propre site, aux conditions qu’il affiche.' },
        { q: 'Combien de temps dure un contrôle technique de voiture ?', a: `Comptez de 30 à 45 minutes pour une voiture. Le contrôleur vérifie ${h.num(h.P.points_controle.voiture)} points, de l’identification du véhicule au freinage, à la direction, à l’éclairage, aux pneus et aux émissions polluantes. Le procès-verbal est remis tout de suite, avec la vignette sur le pare-brise si le résultat est favorable ou si les défaillances ne sont que mineures.` },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), c = classement(h);
      const bas = c.slice(0, 5).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      const haut = c.slice(-5).reverse().map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      return `<h2>Combien coûte un contrôle technique en 2026</h2>
<p>Le prix d’un contrôle technique n’est pas fixé par l’État. Depuis la libéralisation des tarifs, chaque centre agréé fixe les siens, les affiche à l’accueil et sur son site, et les déclare à l’administration, qui les publie dans un fichier ouvert. Ce fichier est la matière première de ce site : ${h.num(n.centres)} centres, ${h.num(h.S.meta.lignes)} lignes de prix, une par centre, par catégorie de véhicule et par énergie. Nous le relisons chaque jour et en tirons la médiane de chaque commune, de chaque département et de la France entière.</p>
<p>Pour une voiture essence ou diesel, la médiane nationale est de ${h.prix(s.e.med)}. Le diesel et l’essence sont facturés au même prix dans ${h.pct(n.dieselEgal, 0)} des centres : la différence de motorisation ne change presque rien. La dispersion, elle, est forte : la moitié des centres se tient dans une fourchette d’une vingtaine d’euros autour de la médiane, mais certains descendent sous ${h.prix(s.e.p10)} quand d’autres dépassent ${h.prix(s.e.p90)}.</p>
${histTable(h)}
<p>Le tableau montre une concentration autour de 70 à 90 €, avec une traîne de centres plus chers, surtout dans les grandes agglomérations et dans les zones où un seul centre dessert plusieurs cantons. C’est pourquoi une « moyenne nationale » renseigne peu : elle ne dit rien du centre à dix minutes de chez vous. L’outil en haut de page fait le calcul pour votre commune et votre véhicule.</p>
<h2>Le prix selon le véhicule</h2>
<p>Le fichier distingue les véhicules légers (voitures, camionnettes, camping-cars et 4 x 4 de 3,5 tonnes au plus) et, depuis 2024, les deux-roues, tricycles, quadricycles et voiturettes. Chaque centre ne contrôle que les véhicules pour lesquels il est équipé et agréé : ${h.num(n.centresMoto)} centres seulement déclarent un prix pour les motos, contre ${h.num(n.centresVp)} pour les voitures.</p>
${vehTable(h)}
<p>Trois écarts reviennent partout. Le gaz (GPL ou GNV) coûte plus cher que l’essence dans ${h.pct(n.gazPlusCher, 0)} des centres, parce que le contrôle ajoute l’examen du réservoir et de l’installation. L’hybride et l’électrique sont plus chers dans ${h.pct(n.elecPlusCher, 0)} des centres, une pratique commerciale plus qu’une contrainte technique. Les camping-cars et les camionnettes, plus longs à faire entrer sur la ligne, se paient quelques euros de plus.</p>
<h2>Des prix très différents d’un département à l’autre</h2>
<p>Parmi les départements qui comptent au moins dix centres, les médianes les plus basses pour une voiture essence sont celles de ${bas}. Les plus élevées : ${haut}. L’écart entre les deux bouts du classement dépasse ${h.prix(c[c.length - 1].med - c[0].med)} pour le même examen, réalisé avec le même matériel et selon le même arrêté.</p>
<p>Le coût du foncier explique une partie de cet écart : un centre de contrôle a besoin d’une surface couverte de plusieurs centaines de mètres carrés. La concurrence locale explique le reste. Là où plusieurs centres se trouvent dans la même zone d’activité, les prix se tiennent ; là où un centre est seul à vingt kilomètres à la ronde, il n’a pas de raison de baisser les siens. La page ${h.a('departements', 'des départements')} classe les 101 départements, pour chaque véhicule.</p>
<!--mini:depPrix-->
<h2>Les prix dans les grandes villes</h2>
<p>Dans les grandes villes, les centres sont rares au cœur de la commune et nombreux en périphérie. Le tableau compare le prix médian dans la commune elle-même et dans un rayon de 15 km, où se trouvent les zones d’activité. Chaque ville a sa page, avec la liste des centres, les communes voisines et les arrondissements quand il y en a.</p>
${villesTable(h)}
<h2>La contre-visite : quand et combien</h2>
<p>Si le contrôleur relève une défaillance majeure ou critique, le contrôle est défavorable et une contre-visite est obligatoire dans les deux mois. Elle ne porte que sur les points à corriger et se facture à part. Les centres déclarent deux prix : un prix bas, pour une simple vérification visuelle, et un prix haut, quand il faut repasser le véhicule sur les bancs. En France, les médianes sont de ${h.prix(n.cv.min.med)} et ${h.prix(n.cv.max.med)}. ${h.pct(n.cv.gratuite, 0)} des centres annoncent une contre-visite gratuite dans certains cas, le plus souvent quand le contrôle d’origine a été fait chez eux.</p>
<p>Passé les deux mois, la contre-visite n’est plus possible : il faut repasser un contrôle complet, au prix plein. Avec une défaillance critique, le véhicule ne peut plus circuler après le jour du contrôle, sauf pour aller au garage ou à la fourrière. Le détail est sur la page ${h.a('contre-visite', 'contre-visite')}.</p>
<!--mini:contreVisite-->
<h2>Quand faire son contrôle technique</h2>
<p>Une voiture particulière passe son premier contrôle dans les six mois qui précèdent son quatrième anniversaire, compté à partir de la date de première mise en circulation inscrite en case B de la carte grise. Ensuite, le contrôle se renouvelle tous les deux ans. Faire le contrôle en avance ne fait rien gagner : la validité de deux ans court à partir de la date du nouveau contrôle. Circuler avec un contrôle périmé expose à une amende forfaitaire de ${h.eur(h.P.sanctions.amende_forfaitaire)} et à l’immobilisation de la carte grise.</p>
<p>Pour les deux-roues, le calendrier dépend de l’année de mise en circulation : les plus anciens sont déjà en retard, ceux de 2020 et 2021 doivent passer en 2026, les plus récents dans les six mois avant leur cinquième anniversaire, puis tous les trois ans. Le guide ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} couvre tous les cas, y compris la vente et les véhicules de collection.</p>
<!--mini:echeance-->
<h2>Les prix déclarés sont-ils fiables ?</h2>
<p>Ils engagent le centre, mais ils vieillissent. Chaque ligne du fichier porte la date à laquelle le centre a mis à jour sa fiche et la date d’application de chaque tarif. ${h.pct(n.misAJour2026, 0)} des centres ont mis à jour leur fiche en 2026, et ${h.pct(n.jamaisDepuis2020, 0)} ne l’ont pas touchée depuis 2020. Un tarif ancien n’est pas forcément faux : beaucoup de centres n’ont pas changé leurs prix. Mais un écart entre la fiche et l’affichage est possible, et c’est l’affichage du centre qui fait foi.</p>
<p>Nous avons aussi écarté ${h.num(h.S.meta.aberrants)} saisies invraisemblables (un contrôle à 1 €, un autre à 999 €) qui fausseraient les moyennes. La règle et la liste sont décrites dans la ${h.a('method', 'méthode')}. Un prix qui vous paraît faux se signale au centre, ou à la DGCCRF sur SignalConso si l’affichage n’est pas conforme.</p>
<h2>Payer moins sans rogner sur la sécurité</h2>
<p>L’examen est le même partout : même liste de points, même matériel homologué, mêmes critères de défaillance. Choisir le centre le moins cher ne dégrade donc pas le contrôle. Trois réflexes font baisser la note : comparer les centres à moins de quinze minutes, plutôt que d’aller au plus proche ; demander si la contre-visite est gratuite chez lui en cas d’échec, ce qui pèse plus que deux ou trois euros d’écart sur le prix de la visite ; vérifier les petits défauts avant d’y aller (ampoules, essuie-glaces, niveau du liquide de frein, pneus), parce qu’une contre-visite évitée est la meilleure économie.</p>
<p>Méfiez-vous des promotions affichées sans prix de contre-visite, et des forfaits « contrôle + contre-visite » qui ne valent que si le véhicule a de bonnes chances d’échouer. Et gardez en tête que le prix déclaré est un prix public : un centre ne peut pas vous facturer davantage que ce qu’il affiche.</p>
<h2>Ce que fait ce site, et ce qu’il ne fait pas</h2>
<p>Ce site fait mieux que le premier résultat Google parce que celui-ci renvoie vers une carte de centres sans moyenne de commune ni de département, sans explication de la contre-visite et sans date des tarifs, quand les autres sites cités en tête affichent une « moyenne nationale » tirée d’études de 2018 ou 2019, ou servent à prendre rendez-vous dans des centres partenaires. Ici, chaque prix vient du fichier public du jour, chaque médiane est recalculée à chaque mise à jour, et l’ordre de la liste est celui du prix, jamais celui d’un partenariat.</p>
<p>Nous ne sommes ni l’administration ni un réseau de centres. Nous ne prenons pas de rendez-vous, ne demandons aucune coordonnée et ne touchons rien des centres. L’éditeur, Radif Partners, est présenté sur la page ${h.a('about', 'à propos')}.</p>`;
    },
  },
  en: {
    title: 'Contrôle technique price in France 2026: every centre',
    description: 'Contrôle technique prices in France for 2026 near you: every approved centre, test and re-inspection, petrol, diesel, electric, motorbike. Today’s DGCCRF file.',
    h1: 'Contrôle technique prices near you',
    intro: 'Type your town: the approved centres around it, their declared price for your vehicle, the re-inspection and the cheapest. No account, no booking.',
    resume: (h) => {
      const s = S(h), n = N(h);
      return `A contrôle technique, France’s compulsory roadworthiness test, costs ${h.prix(s.e.med)} at the median for a car in 2026, petrol and diesel alike: half of the ${h.num(n.centresVp)} approved centres that test cars charge less, half charge more. One centre in ten is below ${h.prix(s.e.p10)}, one in ten above ${h.prix(s.e.p90)}, and the extremes run from ${h.prix(s.e.min)} to ${h.prix(s.e.max)}. Hybrids and electric cars cost ${h.prix(s.el.med)} at the median, motorcycles ${h.prix(s.m.med)}, and a re-inspection (contre-visite) between ${h.prix(n.cv.min.med)} and ${h.prix(n.cv.max.med)}. These figures come from neither a survey nor a sample: every centre declares its prices in a public file kept by the DGCCRF, the consumer protection authority, published on data.gouv.fr under an open licence, and this site reads it every day (file of ${h.date(h.S.meta.fichier)}). Since prices are free, two neighbouring centres are often more than twenty euros apart: comparing before you book is the only way to pay less.`;
    },
    faqs: (h) => {
      const s = S(h), n = N(h), c = classement(h);
      return [
        { q: 'What does a contrôle technique cost on average in 2026?', a: `Across the ${h.num(n.centresVp)} centres that declare a price for a petrol car, the average is ${h.prix(s.e.moy)} and the median ${h.prix(s.e.med)}. The median tells you more, because a few very expensive centres do not pull it up. The €78 figure still quoted on many sites comes from 2018 and 2019 studies, before the rises of recent years.` },
        { q: 'Which French département has the cheapest contrôle technique?', a: `Among départements with at least ten centres, ${c[0].nom} has the lowest median (${h.prix(c[0].med)} for a petrol car), followed by ${c[1].nom} and ${c[2].nom}. The dearest is ${c[c.length - 1].nom}, at ${h.prix(c[c.length - 1].med)}. The full ranking, vehicle by vehicle, is on the départements page, updated with each day’s file.` },
        { q: 'Does an electric car cost more to test?', a: `Often, yes, though no rule requires it: ${h.pct(n.elecPlusCher, 0)} of centres charge more for an electric car than for a petrol one, for a median of ${h.prix(s.el.med)} against ${h.prix(s.e.med)}. Yet an electric car has no exhaust emissions to measure. Some centres charge the same for every engine type: pick “Electric car” in the tool to find them.` },
        { q: 'Are the prices shown here what I will pay at the centre?', a: `They are the prices each centre has itself declared to the authorities, with their date. ${h.pct(n.ancien, 0)} of centres declare a car price dated before 2023, and some may have changed it without updating their record. The price displayed at the centre’s desk on the day is the one that applies; the list flags prices more than three years old with an asterisk.` },
        { q: 'Do I need to book through this site to see the prices?', a: 'No. This site books nothing, asks for no account, email address or phone number, and takes no commission. It shows the declared prices and distances; you then contact the centre you choose yourself, by phone or on its own website, on the terms it displays.' },
        { q: 'How long does a car contrôle technique take?', a: `Allow 30 to 45 minutes for a car. The inspector checks ${h.num(h.P.points_controle.voiture)} items, from vehicle identification to brakes, steering, lights, tyres and exhaust emissions. The report is handed over straight away, with the windscreen sticker if the result is a pass or if the defects found are only minor.` },
      ];
    },
    body: (h) => {
      const s = S(h), n = N(h), c = classement(h);
      const bas = c.slice(0, 5).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      const haut = c.slice(-5).reverse().map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      return `<h2>What a contrôle technique costs in 2026</h2>
<p>The government does not set the price of a contrôle technique. Since prices were freed, every approved centre sets its own, displays them at the desk and on its website, and declares them to the authorities, who publish them as open data. That file is what this site is built on: ${h.num(n.centres)} centres, ${h.num(h.S.meta.lignes)} price lines, one per centre, vehicle category and fuel. We read it every day and work out the median for each town, each département and France as a whole.</p>
<p>For a petrol or diesel car the national median is ${h.prix(s.e.med)}. Diesel and petrol are charged the same at ${h.pct(n.dieselEgal, 0)} of centres: the engine type changes almost nothing. The spread, though, is wide: half the centres sit within about twenty euros of the median, but some go below ${h.prix(s.e.p10)} while others go above ${h.prix(s.e.p90)}.</p>
${histTable(h)}
<p>The table shows prices bunched between €70 and €90, with a tail of dearer centres, mostly in the big cities and in areas where one centre serves several rural districts. That is why a “national average” says little: it tells you nothing about the centre ten minutes from your home. The tool at the top of the page does the sum for your town and your vehicle.</p>
<h2>Price by vehicle</h2>
<p>The file separates light vehicles (cars, vans, motorhomes and 4x4s up to 3.5 tonnes) and, since 2024, motorbikes, scooters, trikes, quads and microcars. Each centre only tests the vehicles it is equipped and approved for: only ${h.num(n.centresMoto)} centres declare a motorcycle price, against ${h.num(n.centresVp)} for cars.</p>
${vehTable(h)}
<p>Three gaps show up everywhere. Gas (LPG or CNG) costs more than petrol at ${h.pct(n.gazPlusCher, 0)} of centres, because the test adds a check of the tank and fittings. Hybrids and electric cars cost more at ${h.pct(n.elecPlusCher, 0)} of centres, a pricing habit more than a technical need. Motorhomes and vans, which take longer to get onto the lane, cost a few euros more.</p>
<h2>Prices vary widely between départements</h2>
<p>Among départements with at least ten centres, the lowest medians for a petrol car are in ${bas}. The highest: ${haut}. The gap between the two ends of the ranking is more than ${h.prix(c[c.length - 1].med - c[0].med)} for the same test, done with the same equipment under the same regulation.</p>
<p>Property costs explain part of it: an inspection centre needs several hundred square metres under cover. Local competition explains the rest. Where several centres share a business park, prices stay in line; where one centre is alone for twenty kilometres around, it has no reason to cut its own. The ${h.a('departements', 'départements page')} ranks all 101 départements, for each vehicle.</p>
<!--mini:depPrix-->
<h2>Prices in the big cities</h2>
<p>In large cities, centres are scarce in the middle of town and plentiful on the outskirts. The table compares the median inside the city itself and within a 15 km radius, where the business parks are. Each city has its own page, with the list of centres, neighbouring towns and, where relevant, districts.</p>
${villesTable(h)}
<h2>Re-inspection: when and how much</h2>
<p>If the inspector finds a major or critical defect, the result is a fail and a re-inspection (contre-visite) is required within two months. It covers only the items to be fixed and is charged separately. Centres declare two prices: a low one for a simple visual check, and a high one when the vehicle has to go back on the test equipment. Across France the medians are ${h.prix(n.cv.min.med)} and ${h.prix(n.cv.max.med)}. ${h.pct(n.cv.gratuite, 0)} of centres say the re-check is free in some cases, usually when the original test was done with them.</p>
<p>After two months a re-inspection is no longer possible: you need a full test again, at full price. With a critical defect the vehicle may not be driven after the day of the test, except to a garage or a pound. The details are on the ${h.a('contre-visite', 're-inspection page')}.</p>
<!--mini:contreVisite-->
<h2>When the test is due</h2>
<p>A private car takes its first test in the six months before its fourth anniversary, counted from the first registration date in box B of the registration certificate (carte grise). After that, it is renewed every two years. Testing early gains nothing: the two-year validity runs from the date of the new test. Driving with an expired test risks a fixed fine of ${h.eur(h.P.sanctions.amende_forfaitaire)} and the retention of the registration certificate.</p>
<p>For two-wheelers the timetable depends on the year of first registration: the oldest are already overdue, those from 2020 and 2021 must be tested in 2026, the newest in the six months before their fifth anniversary, then every three years. The guide on ${h.a('quand-faire-controle-technique', 'when to get the test')} covers every case, including selling a vehicle and classic cars.</p>
<!--mini:echeance-->
<h2>Can the declared prices be trusted?</h2>
<p>They bind the centre, but they age. Each line of the file carries the date the centre last updated its record and the date each price took effect. ${h.pct(n.misAJour2026, 0)} of centres updated their record in 2026, and ${h.pct(n.jamaisDepuis2020, 0)} have not touched it since 2020. An old price is not necessarily wrong: many centres simply have not changed theirs. But the record and the price on display can differ, and the centre’s display is what counts.</p>
<p>We have also set aside ${h.num(h.S.meta.aberrants)} implausible entries (one test at €1, another at €999) that would skew the averages. The rule and the list are described in the ${h.a('method', 'method')}. A price that looks wrong can be raised with the centre, or reported to the DGCCRF on SignalConso if the display does not comply.</p>
<h2>Paying less without cutting corners</h2>
<p>The test is the same everywhere: the same list of items, the same approved equipment, the same defect criteria. Choosing the cheapest centre does not make the inspection any weaker. Three habits bring the bill down: compare the centres within fifteen minutes rather than going to the nearest; ask whether the re-check is free there if you fail, which matters more than a few euros on the test price; and check the small things before you go (bulbs, wipers, brake fluid level, tyres), because a re-inspection avoided is the best saving.</p>
<p>Be wary of offers advertised without a re-inspection price, and of “test plus re-check” bundles, which only pay off if your vehicle is likely to fail. And remember that the declared price is a public price: a centre may not charge you more than it displays.</p>
<h2>What this site does, and what it does not</h2>
<p>This site does better than the top Google result because that result is a map of centres with no town or département median, no explanation of the re-inspection and no date on the prices, while the other sites near the top quote a “national average” taken from 2018 or 2019 studies, or exist to book you into partner centres. Here, every price comes from today’s public file, every median is recalculated at each update, and the list is ordered by price, never by a partnership.</p>
<p>We are neither a government body nor a network of centres. We take no bookings, ask for no contact details and receive nothing from the centres. The publisher, Radif Partners, is introduced on the ${h.a('about', 'about page')}.</p>`;
    },
  },
};

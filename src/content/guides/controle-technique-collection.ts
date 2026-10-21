import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number; moy: number };
type Dep = { centres: number; s: Record<string, R | undefined> };
const NAT = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
const D = (h: Helpers) => h.S.depts as unknown as Record<string, Dep>;
/** Départements (au moins cinq centres déclarant un prix « collection ») classés par médiane. */
const rang = (h: Helpers) => Object.entries(D(h)).filter(([, x]) => x.s.co && x.s.co.n >= 5).map(([d, x]) => ({ d, nom: h.dep(d), med: x.s.co!.med })).sort((a, b) => a.med - b.med || a.d.localeCompare(b.d));
/** Part des départements où la médiane « collection » est inférieure à la médiane essence. */
const moinsQueEssence = (h: Helpers) => { const l = Object.values(D(h)).filter((x) => x.s.co && x.s.e); return l.filter((x) => x.s.co!.med < x.s.e!.med).length / l.length; };
const egalEssence = (h: Helpers) => { const l = Object.values(D(h)).filter((x) => x.s.co && x.s.e); return l.filter((x) => x.s.co!.med === x.s.e!.med).length / l.length; };
/** Deux contrôles « collection » sur dix ans contre cinq contrôles d'une voiture ordinaire, aux médianes du jour. */
const dixAns = (h: Helpers) => { const n = NAT(h); return { coll: 2 * n.co.med, ord: 5 * n.e.med }; };

export default defineGuide({
  id: 'controle-technique-collection',
  group: 'regles',
  order: 5,
  mini: 'collection',
  related: ['quand-faire-controle-technique', 'controle-technique-vente', 'departements', 'contre-visite', 'controle-technique-camping-car'],
  sources: ['spCollection', 'spDispense', 'codeR323', 'dataset'],
  fr: {
    slug: 'controle-technique-vehicule-collection',
    nav: 'Véhicule de collection',
    card: 'Tous les 5 ans, dispense avant 1960 : les règles et le prix déclaré par les centres.',
    title: 'Contrôle technique véhicule de collection : règles et prix',
    description: 'Contrôle technique d’un véhicule de collection : tous les cinq ans, dispense avant 1960, carte grise collection dès 30 ans, prix médian déclaré par les centres.',
    h1: 'Contrôle technique d’un véhicule de collection',
    intro: 'Quand le passer, quand on en est dispensé, et ce que les centres déclarent comme prix pour une voiture de collection.',
    resume: (h) => {
      const n = NAT(h), C = h.P.collection;
      return `Un véhicule immatriculé avec une carte grise « collection » passe le contrôle technique tous les ${h.num(C.periodicite_ans)} ans, au lieu de tous les deux ans pour une voiture ordinaire, et il en est dispensé s’il a été mis en circulation avant le 1er janvier ${C.dispense_avant_annee}. La carte grise de collection est réservée aux véhicules de plus de ${h.num(C.age_min_ans)} ans ; une voiture ancienne restée en carte grise normale suit, elle, le rythme ordinaire. Côté prix, ${h.num(n.co.n)} centres déclarent un tarif pour une voiture de collection à essence dans le fichier public de la DGCCRF, avec une médiane de ${h.prix(n.co.med)}, contre ${h.prix(n.e.med)} pour une voiture essence ordinaire. Un centre sur dix demande moins de ${h.prix(n.co.p10)}, un sur dix plus de ${h.prix(n.co.p90)}. Ces chiffres sont relus chaque jour (fichier du ${h.date(h.S.meta.fichier)}). Le mini-simulateur ci-dessous indique, à partir de l’année de mise en circulation et du dernier contrôle, si vous êtes dispensé et quand repasser.`;
    },
    faqs: (h) => {
      const n = NAT(h), C = h.P.collection, r = rang(h);
      return [
        { q: 'Une voiture de collection mise en circulation avant 1960 doit-elle passer le contrôle technique ?', a: `Non, si elle est immatriculée en carte grise « collection » : les véhicules de collection mis en circulation avant le 1er janvier ${C.dispense_avant_annee} sont dispensés de contrôle technique. La dispense tient à la date de première mise en circulation, pas à l’âge du propriétaire ni à l’usage. Une telle voiture reste soumise à l’obligation d’entretien et d’assurance.` },
        { q: 'Combien coûte le contrôle technique d’une voiture de collection ?', a: `La médiane des ${h.num(n.co.n)} centres qui déclarent ce tarif est de ${h.prix(n.co.med)} pour une voiture de collection à essence, d’après le fichier du jour. Les prix vont de ${h.prix(n.co.min)} à ${h.prix(n.co.max)}. ${r.length ? `Parmi les départements où au moins cinq centres le déclarent, ${r[0].nom} a la médiane la plus basse (${h.prix(r[0].med)}).` : ''}` },
        { q: 'Une voiture de plus de 30 ans en carte grise normale passe-t-elle tous les cinq ans ?', a: `Non. Le rythme de cinq ans vaut pour les véhicules immatriculés en carte grise « collection ». Une voiture de plus de ${h.num(C.age_min_ans)} ans restée en carte grise ordinaire passe le contrôle tous les deux ans, comme n’importe quelle voiture particulière, avec le même délai de deux mois pour une éventuelle contre-visite.` },
        { q: 'Le contrôle d’une voiture de collection est-il plus indulgent ?', a: 'La liste des fonctions examinées est la même, mais le contrôleur apprécie le véhicule selon les équipements dont il était doté à l’origine : on ne reproche pas à une voiture des années soixante l’absence d’un équipement qui n’existait pas à sa sortie. Une défaillance majeure ou critique entraîne, comme ailleurs, une contre-visite.' },
      ];
    },
    body: (h) => {
      const n = NAT(h), C = h.P.collection, r = rang(h), dx = dixAns(h);
      const bas = r.slice(0, 5).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      const haut = r.slice(-3).reverse().map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      return `<h2>Ce qu’est un véhicule de collection pour le contrôle technique</h2>
<p>Pour le contrôle technique, « véhicule de collection » ne désigne pas une voiture ancienne en général, mais un véhicule immatriculé avec une carte grise portant la mention « collection ». Cette carte grise est réservée aux véhicules de plus de ${h.num(C.age_min_ans)} ans qui ne sont plus produits et dont les caractéristiques d’origine n’ont pas été modifiées. Passer en carte grise de collection est un choix du propriétaire : beaucoup de voitures de trente ou quarante ans roulent en carte grise ordinaire et suivent alors les règles de toutes les voitures.</p>
<p>La différence pèse sur le calendrier. Une voiture ordinaire passe le contrôle tous les deux ans ; un véhicule en carte grise collection, tous les ${h.num(C.periodicite_ans)} ans. Et un véhicule de collection mis en circulation avant le 1er janvier ${C.dispense_avant_annee} n’a plus de contrôle périodique du tout.</p>
<h2>Les trois situations possibles</h2>
<ul>
<li><strong>Carte grise collection, mise en circulation avant le 1er janvier ${C.dispense_avant_annee}</strong> : dispense de contrôle technique périodique.</li>
<li><strong>Carte grise collection, mise en circulation à partir de ${C.dispense_avant_annee}</strong> : un contrôle tous les ${h.num(C.periodicite_ans)} ans. Le prochain se calcule à partir de la date du dernier contrôle favorable.</li>
<li><strong>Carte grise ordinaire, quel que soit l’âge</strong> : contrôle tous les deux ans, comme toute voiture particulière.</li>
</ul>
<p>Le mini-simulateur en haut de page reprend ces trois cas. Il calcule à l’année : la date exacte du prochain contrôle est celle du dernier contrôle, cinq ans plus tard. La fiche Service Public sur le contrôle technique des véhicules de collection fait foi en cas de doute, et la page ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')} couvre les voitures ordinaires.</p>
<h2>Ce que déclarent les centres pour une voiture de collection</h2>
<p>Le fichier de la DGCCRF comporte une ligne propre aux voitures de collection à essence. ${h.num(n.co.n)} centres y déclarent un prix, avec une médiane de ${h.prix(n.co.med)} et une moyenne de ${h.prix(n.co.moy)}. Huit centres sur dix se tiennent entre ${h.prix(n.co.p10)} et ${h.prix(n.co.p90)}. Pour comparaison, la médiane d’une voiture essence ordinaire est de ${h.prix(n.e.med)} : dans ${h.pct(egalEssence(h), 0)} des départements, la médiane « collection » est exactement celle de l’essence, et elle est plus basse dans ${h.pct(moinsQueEssence(h), 0)} d’entre eux. Autrement dit, la plupart des centres facturent une voiture de collection comme une voiture ordinaire.</p>
<p>Parmi les départements où au moins cinq centres déclarent ce tarif, les médianes les plus basses sont celles de ${bas}. Les plus élevées : ${haut}. L’outil de la ${h.a('home', 'page d’accueil')} ne propose pas de ligne « collection » par défaut, mais la page ${h.a('departements', 'des départements')} et le tableau ci-dessous suffisent à situer un prix.</p>
${h.table(['Département', 'Médiane collection', 'Médiane essence'], r.slice(0, 10).map((x) => [x.nom, h.prix(x.med), h.prix(D(h)[x.d].s.e!.med)]), `Les dix départements les moins chers pour une voiture de collection, fichier du ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r'])}
<h2>Préparer le contrôle d’une ancienne</h2>
<p>Le contrôleur examine les mêmes grandes fonctions que sur une voiture récente : identification, freinage, direction, visibilité, éclairage et signalisation, liaisons au sol, structure et carrosserie, équipements, nuisances. Il les apprécie au regard de ce que le véhicule possédait à sa sortie d’usine. Les défauts les plus courants sur une ancienne tiennent moins à la conception qu’à l’usure : corrosion des longerons et des planchers, jeux de direction, flexibles de frein durcis, fuites d’huile, feux ternis ou mal réglés.</p>
<p>Une voiture qui roule peu vieillit aussi : pneus craquelés malgré une bonne profondeur, liquide de frein chargé d’humidité, batterie faible qui fausse l’éclairage. Faire le tour de ces points avant le rendez-vous évite une contre-visite. Si le contrôle relève une défaillance majeure, la contre-visite doit avoir lieu dans les deux mois ; la page ${h.a('contre-visite', 'contre-visite')} détaille les délais et les prix.</p>
<h2>Cinq ans entre deux contrôles : le calcul</h2>
<p>Sur dix ans, une voiture en carte grise collection passe deux contrôles quand une voiture ordinaire en passe cinq. Aux médianes du jour, cela représente ${h.prix(dx.coll)} contre ${h.prix(dx.ord)}, hors contre-visite. L’économie n’est pas la raison principale d’un passage en collection, qui relève d’abord de l’état d’origine du véhicule et de son usage, mais elle n’est pas négligeable pour une voiture qui roule quelques centaines de kilomètres par an.</p>
<p>En contrepartie, un contrôle tous les cinq ans laisse plus de temps à l’usure pour s’installer entre deux visites. L’entretien régulier, que la loi impose à tout véhicule en circulation, reste la seule garantie de sécurité entre deux contrôles.</p>
<h2>Vendre une voiture de collection</h2>
<p>À la vente, la règle générale vaut aussi pour les véhicules de collection soumis au contrôle : l’acheteur particulier doit recevoir un procès-verbal de moins de ${h.num(h.P.voiture.vente_ct_moins_de_mois)} mois. Le guide ${h.a('controle-technique-vente', 'contrôle technique et vente')} explique les cas de dispense, notamment la vente à un professionnel. Pour les utilitaires et camping-cars anciens, voir aussi la page ${h.a('controle-technique-camping-car', 'camping-car et utilitaire')}.</p>`;
    },
  },
  en: {
    slug: 'classic-car-controle-technique',
    nav: 'Classic vehicles',
    card: 'Every 5 years, exempt before 1960: the rules and the price centres declare.',
    title: 'Classic car contrôle technique in France: rules and price',
    description: 'Contrôle technique for a French classic vehicle: every five years, exempt before 1960, classic registration from 30 years, and the median price centres declare.',
    h1: 'Contrôle technique for a classic vehicle',
    intro: 'When it is due, when you are exempt, and what centres declare as the price for a classic car.',
    resume: (h) => {
      const n = NAT(h), C = h.P.collection;
      return `A vehicle registered with a “collection” (classic) registration certificate takes the contrôle technique, France’s compulsory roadworthiness test, every ${h.num(C.periodicite_ans)} years instead of every two years for an ordinary car, and is exempt altogether if it was first registered before 1 January ${C.dispense_avant_annee}. The classic registration is reserved for vehicles more than ${h.num(C.age_min_ans)} years old; an old car kept on an ordinary registration follows the ordinary timetable. On price, ${h.num(n.co.n)} centres declare a price for a petrol classic car in the DGCCRF’s public file, with a median of ${h.prix(n.co.med)}, against ${h.prix(n.e.med)} for an ordinary petrol car. One centre in ten charges less than ${h.prix(n.co.p10)}, one in ten more than ${h.prix(n.co.p90)}. These figures are reread every day (file of ${h.date(h.S.meta.fichier)}). The mini calculator below tells you, from the year of first registration and the last test, whether you are exempt and when the next test is due.`;
    },
    faqs: (h) => {
      const n = NAT(h), C = h.P.collection, r = rang(h);
      return [
        { q: 'Does a classic car first registered before 1960 need a contrôle technique?', a: `No, if it is on a “collection” registration: classic vehicles first registered before 1 January ${C.dispense_avant_annee} are exempt from the periodic test. The exemption depends on the date of first registration, not on the owner’s age or how the car is used. Such a car must still be maintained and insured.` },
        { q: 'How much does a classic car contrôle technique cost?', a: `The median across the ${h.num(n.co.n)} centres declaring this price is ${h.prix(n.co.med)} for a petrol classic car, according to today’s file. Prices run from ${h.prix(n.co.min)} to ${h.prix(n.co.max)}. ${r.length ? `Among départements where at least five centres declare it, ${r[0].nom} has the lowest median (${h.prix(r[0].med)}).` : ''}` },
        { q: 'Does a car over 30 years old on an ordinary registration go every five years?', a: `No. The five-year interval applies to vehicles on a “collection” registration. A car more than ${h.num(C.age_min_ans)} years old kept on an ordinary registration is tested every two years, like any private car, with the same two-month deadline for any re-inspection.` },
        { q: 'Is the test more lenient for a classic car?', a: 'The list of functions examined is the same, but the inspector judges the vehicle against the equipment it had when new: a 1960s car is not faulted for lacking something that did not exist when it left the factory. A major or critical defect still means a re-inspection (contre-visite), as for any car.' },
      ];
    },
    body: (h) => {
      const n = NAT(h), C = h.P.collection, r = rang(h), dx = dixAns(h);
      const bas = r.slice(0, 5).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      const haut = r.slice(-3).reverse().map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ');
      return `<h2>What counts as a classic vehicle for the test</h2>
<p>For the contrôle technique, a “classic vehicle” (véhicule de collection) does not mean any old car, but a vehicle registered with a certificate (carte grise) marked “collection”. That registration is reserved for vehicles over ${h.num(C.age_min_ans)} years old that are no longer made and whose original specification has not been altered. Switching to a classic registration is the owner’s choice: many thirty- or forty-year-old cars run on an ordinary registration and then follow the rules for every car.</p>
<p>The difference matters for the timetable. An ordinary car is tested every two years; a vehicle on a classic registration, every ${h.num(C.periodicite_ans)} years. And a classic vehicle first registered before 1 January ${C.dispense_avant_annee} has no periodic test at all.</p>
<h2>The three possible situations</h2>
<ul>
<li><strong>Classic registration, first registered before 1 January ${C.dispense_avant_annee}</strong>: exempt from the periodic test.</li>
<li><strong>Classic registration, first registered from ${C.dispense_avant_annee} on</strong>: a test every ${h.num(C.periodicite_ans)} years, the next one counted from the date of the last pass.</li>
<li><strong>Ordinary registration, whatever the age</strong>: a test every two years, like any private car.</li>
</ul>
<p>The mini calculator at the top of the page covers these three cases. It works to the year: the exact date of the next test is the date of the last one, five years on. The Service Public page on testing classic vehicles is the reference in case of doubt, and the guide on ${h.a('quand-faire-controle-technique', 'when the test is due')} covers ordinary cars.</p>
<h2>What centres declare for a classic car</h2>
<p>The DGCCRF file has a separate line for petrol classic cars. ${h.num(n.co.n)} centres declare a price for it, with a median of ${h.prix(n.co.med)} and an average of ${h.prix(n.co.moy)}. Eight centres in ten sit between ${h.prix(n.co.p10)} and ${h.prix(n.co.p90)}. For comparison, the median for an ordinary petrol car is ${h.prix(n.e.med)}: in ${h.pct(egalEssence(h), 0)} of départements the classic median is exactly the petrol one, and it is lower in ${h.pct(moinsQueEssence(h), 0)} of them. In other words, most centres charge a classic car like an ordinary one.</p>
<p>Among départements where at least five centres declare this price, the lowest medians are in ${bas}. The highest: ${haut}. The tool on the ${h.a('home', 'home page')} has no classic-car line by default, but the ${h.a('departements', 'départements page')} and the table below are enough to place a price.</p>
${h.table(['Département', 'Classic median', 'Petrol median'], r.slice(0, 10).map((x) => [x.nom, h.prix(x.med), h.prix(D(h)[x.d].s.e!.med)]), `The ten cheapest départements for a classic car, file of ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r'])}
<h2>Getting an old car ready</h2>
<p>The inspector looks at the same broad functions as on a recent car: identification, braking, steering, visibility, lights and signalling, axles and suspension, structure and body, equipment, emissions. They are judged against what the vehicle had when it left the factory. The most common defects on an old car come less from its design than from wear: corroded chassis rails and floors, play in the steering, hardened brake hoses, oil leaks, dull or badly aimed lights.</p>
<p>A car that is rarely driven ages too: tyres cracking despite good tread, brake fluid full of moisture, a weak battery that dims the lights. Going over these points before the appointment avoids a re-inspection. If the test finds a major defect, the re-inspection must take place within two months; the ${h.a('contre-visite', 're-inspection page')} details deadlines and prices.</p>
<h2>Five years between tests: the sums</h2>
<p>Over ten years, a car on a classic registration takes two tests where an ordinary car takes five. At today’s medians that is ${h.prix(dx.coll)} against ${h.prix(dx.ord)}, re-inspections excluded. Saving money is not the main reason to switch to a classic registration, which depends first on the vehicle’s original condition and how it is used, but it is not negligible for a car that covers a few hundred kilometres a year.</p>
<p>On the other hand, a test every five years gives wear more time to set in between visits. Regular maintenance, which the law requires of any vehicle on the road, remains the only safety guarantee between two tests.</p>
<h2>Selling a classic car</h2>
<p>On a sale, the general rule also applies to classic vehicles subject to the test: a private buyer must receive a report less than ${h.num(h.P.voiture.vente_ct_moins_de_mois)} months old. The guide on ${h.a('controle-technique-vente', 'selling and the contrôle technique')} explains the exemptions, including a sale to a trader. For old vans and motorhomes, see also the ${h.a('controle-technique-camping-car', 'motorhome and van page')}.</p>`;
    },
  },
});

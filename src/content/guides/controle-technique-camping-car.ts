import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number; moy: number };
type Dep = { centres: number; s: Record<string, R | undefined> };
const NAT = (h: Helpers) => h.S.national.s as unknown as Record<string, R>;
const D = (h: Helpers) => h.S.depts as unknown as Record<string, Dep>;
const K = ['cc', 'u', 'x4', 'd'] as const;
/** Écart en euros entre la médiane d'une catégorie et celle de la voiture diesel. */
const ecart = (h: Helpers, k: string) => NAT(h)[k].med - NAT(h).d.med;
/** Départements (au moins cinq centres) classés par médiane camping-car. */
const rangCc = (h: Helpers) => Object.entries(D(h)).filter(([, x]) => x.s.cc && x.s.cc.n >= 5).map(([d, x]) => ({ d, nom: h.dep(d), med: x.s.cc!.med })).sort((a, b) => a.med - b.med || a.d.localeCompare(b.d));
/** Part des départements où un camping-car coûte plus cher qu'une voiture diesel (médianes). */
const ccPlusCher = (h: Helpers) => { const l = Object.values(D(h)).filter((x) => x.s.cc && x.s.d); return l.filter((x) => x.s.cc!.med > x.s.d!.med).length / l.length; };
const signe = (n: number, fr: boolean) => (n === 0 ? (fr ? 'au même niveau' : 'level') : `${n > 0 ? '+' : '−'}${Math.abs(n)} €`);

export default defineGuide({
  id: 'controle-technique-camping-car',
  group: 'regles',
  order: 4,
  tool: 'centres',
  vehicule: 'cc',
  vehicules: ['cc', 'u', 'x4', 'e', 'd'],
  related: ['quand-faire-controle-technique', 'contre-visite', 'controle-technique-pas-cher', 'departements', 'controle-technique-collection'],
  sources: ['spCamionnette', 'spVoiture', 'dataset', 'arrete1991'],
  fr: {
    slug: 'controle-technique-camping-car-utilitaire',
    nav: 'Camping-car et utilitaire',
    card: 'Camping-car, camionnette, 4 x 4 : prix déclarés, calendrier et contrôle pollution annuel.',
    title: 'Contrôle technique camping-car, utilitaire : prix et règles',
    description: 'Contrôle technique d’un camping-car, d’une camionnette ou d’un 4 x 4 : prix déclaré par chaque centre, calendrier, et contrôle pollution annuel des utilitaires.',
    h1: 'Contrôle technique d’un camping-car, d’un utilitaire ou d’un 4 x 4',
    intro: 'Les prix déclarés par les centres autour de votre commune pour un camping-car, une camionnette ou un 4 x 4, et les règles propres à chacun.',
    resume: (h) => {
      const n = NAT(h), V = h.P.voiture;
      return `Un camping-car de 3,5 tonnes au plus, une camionnette et un 4 x 4 passent leur premier contrôle technique dans les ${h.num(V.fenetre_avant_mois)} mois avant le ${h.num(V.premier_controle_ans)}e anniversaire de leur mise en circulation, puis tous les ${h.num(V.validite_favorable_ans)} ans, comme une voiture. La camionnette (catégorie N1, transport de marchandises) a une obligation de plus : un contrôle complémentaire de la pollution entre deux contrôles complets, dans les ${h.num(V.pollution_camionnette_mois_avant)} mois qui précèdent la fin d’un an après chaque contrôle. Côté prix, le fichier public de la DGCCRF du ${h.date(h.S.meta.fichier)} donne une médiane de ${h.prix(n.cc.med)} pour un camping-car diesel (${h.num(n.cc.n)} centres), ${h.prix(n.u.med)} pour une camionnette diesel (${h.num(n.u.n)} centres) et ${h.prix(n.x4.med)} pour un 4 x 4 diesel, contre ${h.prix(n.d.med)} pour une voiture diesel. Le prix du contrôle pollution seul n’y figure pas : il faut le demander au centre. L’outil ci-dessus classe les centres autour de votre commune pour le véhicule choisi.`;
    },
    faqs: (h) => {
      const n = NAT(h), V = h.P.voiture, r = rangCc(h);
      return [
        { q: 'Un camping-car passe-t-il le contrôle technique tous les ans ?', a: `Non, pas s’il pèse 3,5 tonnes au plus : il suit le calendrier d’une voiture, premier contrôle avant le ${h.num(V.premier_controle_ans)}e anniversaire de la mise en circulation, puis tous les ${h.num(V.validite_favorable_ans)} ans. Le contrôle pollution annuel concerne les camionnettes, pas les camping-cars. Au-delà de 3,5 tonnes, les règles diffèrent : vérifiez votre cas sur Service Public.` },
        { q: 'Combien coûte le contrôle technique d’un camping-car ?', a: `La médiane est de ${h.prix(n.cc.med)} pour un camping-car diesel, sur ${h.num(n.cc.n)} centres qui déclarent ce tarif. Huit sur dix se situent entre ${h.prix(n.cc.p10)} et ${h.prix(n.cc.p90)}. ${r.length ? `${r[0].nom} a la médiane départementale la plus basse (${h.prix(r[0].med)}).` : ''} Vérifiez aussi la hauteur de la ligne : tous les centres n’acceptent pas les véhicules hauts.` },
        { q: 'Quand faire le contrôle pollution d’une camionnette ?', a: `Dans les ${h.num(V.pollution_camionnette_mois_avant)} mois qui précèdent la fin d’un an après le dernier contrôle complet. Une camionnette contrôlée en juin ${h.today.slice(0, 4)} passe donc le contrôle pollution entre avril et juin de l’année suivante, puis le contrôle complet un an plus tard. Le mini-simulateur de cette page calcule la fenêtre.` },
        { q: 'Combien coûte le contrôle pollution complémentaire d’une camionnette ?', a: 'Le fichier public des prix de la DGCCRF ne contient pas ce tarif, et cette page ne publie aucun prix qu’elle ne peut sourcer. Le centre doit afficher ses prix à l’accueil et sur son site : demandez-le en prenant rendez-vous, et comparez avec le prix du contrôle complet de la camionnette.' },
      ];
    },
    body: (h) => {
      const n = NAT(h), V = h.P.voiture, r = rangCc(h);
      const lignes = K.map((k) => [({ cc: 'Camping-car diesel', u: 'Camionnette diesel', x4: '4 x 4 diesel', d: 'Voiture diesel' } as Record<string, string>)[k], h.num(n[k].n), h.prix(n[k].med), `${h.prix(n[k].p10)} – ${h.prix(n[k].p90)}`, k === 'd' ? '—' : signe(ecart(h, k), true)]);
      return `<h2>Quel calendrier pour quel véhicule</h2>
<p>Trois véhicules que l’on range souvent ensemble suivent en réalité des règles un peu différentes. Le camping-car de 3,5 tonnes au plus est une voiture particulière aménagée : il passe le contrôle comme une voiture, dans les ${h.num(V.fenetre_avant_mois)} mois avant le ${h.num(V.premier_controle_ans)}e anniversaire de sa mise en circulation, puis tous les ${h.num(V.validite_favorable_ans)} ans. Le 4 x 4 immatriculé en voiture particulière suit exactement le même rythme. La camionnette, utilitaire léger de la catégorie N1 conçu pour transporter des marchandises, a le même calendrier de contrôle complet, mais avec un contrôle complémentaire de la pollution chaque année intermédiaire.</p>
<!--mini:camionnette-->
<h2>Le contrôle pollution des camionnettes</h2>
<p>Entre deux contrôles complets, la camionnette passe un contrôle limité aux émissions polluantes : opacité des fumées pour un diesel, analyse des gaz pour un moteur à essence. Il a lieu dans les ${h.num(V.pollution_camionnette_mois_avant)} mois qui précèdent la fin d’un an après le contrôle complet. Si ce contrôle est défavorable, une contre-visite s’impose comme pour le contrôle complet ; la page ${h.a('contre-visite', 'contre-visite')} rappelle les délais.</p>
<p>Le fichier public des prix ne comporte pas de ligne pour ce contrôle complémentaire. Ce site ne l’estime pas : le centre doit afficher son tarif, demandez-le au moment de prendre rendez-vous. Le mini-simulateur ci-dessus donne la fenêtre de passage à partir du mois et de l’année de votre dernier contrôle complet.</p>
<h2>Les prix déclarés, catégorie par catégorie</h2>
<p>Le fichier de la DGCCRF du ${h.date(h.S.meta.fichier)} sépare le camping-car diesel, la camionnette diesel et le 4 x 4 diesel de la voiture. Le tableau compare leurs médianes nationales à celle d’une voiture diesel ; la dernière colonne donne l’écart en euros.</p>
${h.table(['Véhicule', 'Centres', 'Médiane', '8 centres sur 10', 'Écart / voiture diesel'], lignes, `Prix déclarés au ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r', 'r', 'r'])}
<p>Dans ${h.pct(ccPlusCher(h), 0)} des départements, la médiane camping-car dépasse celle de la voiture diesel. Là où il est plus cher, l’écart s’explique par le temps passé : un véhicule long et haut se place moins facilement sur la ligne, et l’inspection de la cellule, des fixations et des équipements ajoutés prend plus de temps. ${r.length >= 6 ? `Les médianes départementales les plus basses pour un camping-car sont celles de ${r.slice(0, 3).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ')} ; les plus hautes, celles de ${r.slice(-3).reverse().map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ')}.` : ''}</p>
<h2>Choisir un centre pour un véhicule haut ou long</h2>
<p>Tous les centres ne déclarent pas de prix pour un camping-car, et ceux qui le font n’ont pas tous une ligne assez haute ou assez longue pour un profilé ou un intégral. Avant de réserver, vérifiez la hauteur et la longueur acceptées, surtout pour un fourgon surélevé. L’outil en haut de page ne retient que les centres qui déclarent un prix pour le véhicule choisi ; changez la catégorie pour passer du camping-car à la camionnette ou au 4 x 4.</p>
<p>Si les centres proches sont chers, la page ${h.a('controle-technique-pas-cher', 'contrôle technique pas cher')} montre où les prix sont les plus bas, et la page ${h.a('departements', 'des départements')} donne la médiane de chaque département. Pour un véhicule qui sert peu, l’hiver est souvent la période la plus simple pour obtenir un créneau.</p>
<h2>Ce que le contrôleur regarde en plus</h2>
<p>La liste des fonctions contrôlées est celle de tout véhicule de 3,5 tonnes au plus, fixée par l’arrêté du 18 juin 1991 : freinage, direction, visibilité, éclairage, liaisons au sol, structure, équipements, nuisances. Sur un camping-car, l’attention se porte souvent sur la charge (pneus, suspensions arrière), la corrosion du châssis sous la cellule et la fixation des équipements ajoutés : porte-vélos, attelage, marchepied. Sur une camionnette, l’usure des freins et des pneus, plus rapide avec la charge, et l’état du plancher de chargement. Sur un 4 x 4, les transmissions et les soufflets.</p>
<p>Le gaz du camping-car (bouteilles, détendeur, flexibles) relève de l’aménagement et non du contrôle technique ; un contrôle d’étanchéité chez un professionnel reste utile avant un départ. Pour savoir quand passer selon la date de mise en circulation, voir ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')}, et pour un vieux fourgon en carte grise collection, la page ${h.a('controle-technique-collection', 'véhicule de collection')}.</p>`;
    },
  },
  en: {
    slug: 'motorhome-van-controle-technique',
    nav: 'Motorhome and van',
    card: 'Motorhome, van, 4x4: declared prices, timetable and the yearly van emissions check.',
    title: 'Motorhome and van contrôle technique: prices and timetable',
    description: 'Contrôle technique for a motorhome, light van or 4x4 in France: each centre’s declared price, the timetable, and the yearly emissions check that vans must take.',
    h1: 'Contrôle technique for a motorhome, van or 4x4',
    intro: 'Prices declared by the centres around your commune for a motorhome, a van or a 4x4, and the rules for each.',
    resume: (h) => {
      const n = NAT(h), V = h.P.voiture;
      return `A motorhome of 3.5 tonnes or less, a light van and a 4x4 take their first contrôle technique, France’s compulsory roadworthiness test, within the ${h.num(V.fenetre_avant_mois)} months before the ${h.num(V.premier_controle_ans)}th anniversary of first registration, then every ${h.num(V.validite_favorable_ans)} years, like a car. The van (category N1, built to carry goods) has one extra duty: a complementary emissions check between two full tests, within the ${h.num(V.pollution_camionnette_mois_avant)} months before the end of one year after each test. On price, the DGCCRF public file of ${h.date(h.S.meta.fichier)} gives a median of ${h.prix(n.cc.med)} for a diesel motorhome (${h.num(n.cc.n)} centres), ${h.prix(n.u.med)} for a diesel van (${h.num(n.u.n)} centres) and ${h.prix(n.x4.med)} for a diesel 4x4, against ${h.prix(n.d.med)} for a diesel car. The price of the emissions check alone is not in the file: ask the centre. The tool above ranks the centres around your commune for the vehicle you choose.`;
    },
    faqs: (h) => {
      const n = NAT(h), V = h.P.voiture, r = rangCc(h);
      return [
        { q: 'Does a motorhome need a contrôle technique every year?', a: `No, not if it weighs 3.5 tonnes or less: it follows the car timetable, first test before the ${h.num(V.premier_controle_ans)}th anniversary of first registration, then every ${h.num(V.validite_favorable_ans)} years. The yearly emissions check applies to vans, not motorhomes. Above 3.5 tonnes the rules differ: check your case on Service Public.` },
        { q: 'How much is a motorhome contrôle technique?', a: `The median is ${h.prix(n.cc.med)} for a diesel motorhome, across ${h.num(n.cc.n)} centres declaring this price. Eight in ten sit between ${h.prix(n.cc.p10)} and ${h.prix(n.cc.p90)}. ${r.length ? `${r[0].nom} has the lowest département median (${h.prix(r[0].med)}).` : ''} Check the height of the test lane too: not every centre takes tall vehicles.` },
        { q: 'When is a van’s emissions check due?', a: `Within the ${h.num(V.pollution_camionnette_mois_avant)} months before the end of one year after the last full test. A van tested in June ${h.today.slice(0, 4)} therefore takes the emissions check between April and June of the following year, then the full test a year later. The mini calculator on this page works out the window.` },
        { q: 'How much is the complementary emissions check for a van?', a: 'The DGCCRF public price file does not include it, and this page publishes no price it cannot source. Centres must display their prices at reception and on their website: ask when booking, and compare with the price of the van’s full test.' },
      ];
    },
    body: (h) => {
      const n = NAT(h), V = h.P.voiture, r = rangCc(h);
      const lignes = K.map((k) => [({ cc: 'Diesel motorhome', u: 'Diesel van', x4: 'Diesel 4x4', d: 'Diesel car' } as Record<string, string>)[k], h.num(n[k].n), h.prix(n[k].med), `${h.prix(n[k].p10)} – ${h.prix(n[k].p90)}`, k === 'd' ? '—' : signe(ecart(h, k), false)]);
      return `<h2>Which timetable for which vehicle</h2>
<p>Three vehicles often lumped together actually follow slightly different rules. A motorhome (camping-car) of 3.5 tonnes or less is a converted private car: it is tested like a car, within the ${h.num(V.fenetre_avant_mois)} months before the ${h.num(V.premier_controle_ans)}th anniversary of first registration, then every ${h.num(V.validite_favorable_ans)} years. A 4x4 registered as a private car follows exactly the same pattern. The van (camionnette), a light commercial vehicle in category N1 designed to carry goods, has the same full-test timetable, plus a complementary emissions check in each in-between year.</p>
<!--mini:camionnette-->
<h2>The van emissions check</h2>
<p>Between two full tests, a van takes a check limited to exhaust emissions: smoke opacity for a diesel, gas analysis for a petrol engine. It falls within the ${h.num(V.pollution_camionnette_mois_avant)} months before the end of one year after the full test. If it fails, a re-inspection (contre-visite) is required as for a full test; the ${h.a('contre-visite', 're-inspection page')} sets out the deadlines.</p>
<p>The public price file has no line for this complementary check. This site does not estimate it: the centre must display its price, so ask when you book. The mini calculator above gives the window from the month and year of your last full test.</p>
<h2>Declared prices, category by category</h2>
<p>The DGCCRF file of ${h.date(h.S.meta.fichier)} lists the diesel motorhome, diesel van and diesel 4x4 separately from cars. The table compares their national medians with a diesel car’s; the last column gives the gap in euros.</p>
${h.table(['Vehicle', 'Centres', 'Median', '8 centres in 10', 'Gap vs diesel car'], lignes, `Prices declared on ${h.date(h.S.meta.fichier)}`, ['l', 'r', 'r', 'r', 'r'])}
<p>In ${h.pct(ccPlusCher(h), 0)} of départements the motorhome median is above the diesel-car median. Where it costs more, the gap reflects time and handling: a long, tall vehicle is harder to position on the lane, and inspecting the living unit, its mountings and added equipment takes longer. ${r.length >= 6 ? `The lowest département medians for a motorhome are in ${r.slice(0, 3).map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ')}; the highest in ${r.slice(-3).reverse().map((x) => `${x.nom} (${h.prix(x.med)})`).join(', ')}.` : ''}</p>
<h2>Picking a centre for a tall or long vehicle</h2>
<p>Not every centre declares a motorhome price, and those that do do not all have a lane tall or long enough for a coachbuilt or A-class motorhome. Before booking, check the height and length accepted, especially for a high-roof van conversion. The tool at the top of the page only keeps centres that declare a price for the chosen vehicle; switch category to move from motorhome to van or 4x4.</p>
<p>If nearby centres are expensive, the ${h.a('controle-technique-pas-cher', 'cheap contrôle technique page')} shows where prices are lowest, and the ${h.a('departements', 'départements page')} gives every département’s median. For a vehicle that sees little use, winter is often the easiest time to get a slot.</p>
<h2>What the inspector looks at more closely</h2>
<p>The functions checked are those of any vehicle up to 3.5 tonnes, set by the order of 18 June 1991: braking, steering, visibility, lights, axles and suspension, structure, equipment, emissions and noise. On a motorhome, attention often goes to load (tyres, rear suspension), chassis corrosion under the living unit and the mounting of added equipment: bike rack, towbar, step. On a van, brake and tyre wear, faster under load, and the state of the load floor. On a 4x4, the drivetrain and its boots.</p>
<p>A motorhome’s gas system (bottles, regulator, hoses) belongs to the conversion, not to the contrôle technique; a leak test by a professional is still worth doing before a trip. To see when the test is due from the date of first registration, read ${h.a('quand-faire-controle-technique', 'when to take the contrôle technique')}, and for an old van on a classic registration, the ${h.a('controle-technique-collection', 'classic vehicle page')}.</p>`;
    },
  },
});

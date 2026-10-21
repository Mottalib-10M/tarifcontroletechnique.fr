import { defineGuide, type Helpers } from '../../lib/guide-types';

type R = { n: number; med: number; p10: number; p90: number; min: number; max: number };
type Dep = { centres: number; cv: { min: R; max: R; gratuite: number } | null };
const N = (h: Helpers) => h.S.national;
const deps = (h: Helpers) => Object.entries(h.S.depts as unknown as Record<string, Dep>).filter(([, d]) => d.cv && d.centres >= 10);
/** Les départements où la contre-visite (prix maxi médian) est la moins et la plus chère. */
const extremes = (h: Helpers) => { const l = deps(h).sort(([, a], [, b]) => a.cv!.max.med - b.cv!.max.med); return { bas: l.slice(0, 3), haut: l.slice(-3).reverse() }; };
const fmt = (h: Helpers, l: Array<[string, Dep]>) => l.map(([d, x]) => `${h.dep(d)} (${h.prix(x.cv!.max.med)})`).join(', ');
const sansGratuit = (h: Helpers) => deps(h).filter(([, d]) => d.cv!.gratuite === 0).length;

export default defineGuide({
  id: 'contre-visite',
  group: 'prix',
  order: 4,
  mini: 'contreVisite',
  related: ['defaillances-controle-technique', 'departements', 'controle-technique-pas-cher', 'quand-faire-controle-technique', 'controle-technique-moto'],
  sources: ['spVoiture', 'spDeuxRoues', 'spCession', 'codeR323', 'dataset', 'arretePrix'],
  fr: {
    slug: 'contre-visite',
    nav: 'Contre-visite',
    card: 'Délai de deux mois, prix déclaré par centre, cas de gratuité.',
    title: 'Contre-visite du contrôle technique : prix et délai en 2026',
    description: 'Contre-visite du contrôle technique en 2026 : délai de deux mois, prix déclarés par les centres, gratuite ou payante, conduite en attendant, département.',
    h1: 'Contre-visite : délai, prix et cas de gratuité',
    intro: 'Après un contrôle défavorable, vous avez deux mois. Voici la date limite pour votre cas, et ce que les centres déclarent faire payer.',
    resume: (h) => {
      const n = N(h);
      return `Une contre-visite est obligatoire quand le contrôle technique relève au moins une défaillance majeure ou critique. Elle doit être faite dans les deux mois qui suivent le contrôle, dans le centre de votre choix, et ne porte que sur les points à corriger. Son prix est libre, comme celui du contrôle : les centres en déclarent deux, un prix bas pour une simple vérification visuelle et un prix haut quand le véhicule doit repasser sur les bancs. En France, d’après le fichier public des prix du ${h.date(h.S.meta.fichier)}, la médiane du prix bas est de ${h.prix(n.cv.min.med)} et celle du prix haut de ${h.prix(n.cv.max.med)} pour une voiture ; ${h.pct(n.cv.gratuite, 0)} des centres annoncent une contre-visite gratuite dans certains cas. Passé le délai de deux mois, il faut repasser un contrôle complet, à ${h.prix(n.s.e.med)} en médiane. Avec une défaillance majeure, la voiture peut rouler jusqu’à la date limite ; avec une défaillance critique, seulement le jour du contrôle.`;
    },
    faqs: (h) => {
      const n = N(h);
      return [
        { q: 'La contre-visite doit-elle se faire dans le même centre que le contrôle ?', a: 'Non. Vous pouvez la faire dans n’importe quel centre agréé, en présentant le procès-verbal du contrôle défavorable. Revenir dans le même centre a souvent un intérêt pratique : c’est là que la gratuité est le plus souvent proposée, et le contrôleur connaît déjà le véhicule. Comparez tout de même : un autre centre peut être moins cher même en payant.' },
        { q: 'Que se passe-t-il si je dépasse le délai de deux mois ?', a: `La contre-visite n’est plus possible : il faut repasser un contrôle technique complet, payé au prix plein (${h.prix(n.s.e.med)} en médiane pour une voiture), qui peut lui-même relever de nouvelles défaillances. Entre-temps, si le contrôle d’origine portait une défaillance majeure, la voiture n’est plus en règle et l’amende forfaitaire de ${h.eur(h.P.sanctions.amende_forfaitaire)} s’applique.` },
        { q: 'Peut-on rouler avec une défaillance critique en attendant la réparation ?', a: 'Seulement le jour du contrôle. Une défaillance critique signale un danger direct pour la sécurité ou l’environnement : la validité du contrôle prend fin le soir même. Ensuite, le véhicule ne peut circuler que pour être conduit chez un réparateur ou à la fourrière. Le délai de deux mois pour la contre-visite reste le même.' },
        { q: 'Combien coûte une contre-visite de moto ?', a: `Pour les deux-roues, les centres déclarent une médiane de ${h.prix(n.cvm.min.med)} pour le prix bas et de ${h.prix(n.cvm.max.med)} pour le prix haut, et ${h.pct(n.cvm.gratuite, 0)} d’entre eux annoncent une gratuité possible. Le délai est le même que pour une voiture : deux mois après le contrôle défavorable.` },
        { q: 'Une contre-visite peut-elle elle-même être défavorable ?', a: 'Oui, si une défaillance relevée n’a pas été corrigée, ou mal. Le centre établit alors un nouveau procès-verbal défavorable, et une nouvelle contre-visite est à faire dans les deux mois qui suivent celle-ci. Chaque passage se paie au prix déclaré par le centre : mieux vaut faire vérifier la réparation par le garage avant d’y retourner.' },
      ];
    },
    body: (h) => {
      const n = N(h), x = extremes(h);
      return `<h2>Quand une contre-visite est-elle obligatoire ?</h2>
<p>Le contrôleur classe chaque défaut en trois niveaux. Une défaillance mineure n’a pas d’incidence sur la sécurité : elle figure sur le procès-verbal, sans contre-visite. Une défaillance majeure peut compromettre la sécurité, l’environnement ou la sécurité des autres usagers : le contrôle est défavorable et la contre-visite obligatoire. Une défaillance critique constitue un danger direct : même obligation, mais avec une interdiction de circuler au-delà du jour du contrôle. Le détail des catégories est expliqué sur la page ${h.a('defaillances-controle-technique', 'des défaillances')}.</p>
<p>La contre-visite ne reprend pas tout l’examen. Le contrôleur ne vérifie que les points signalés comme défaillants, d’où un prix plus bas que celui d’un contrôle et une durée plus courte, souvent un quart d’heure.</p>
<h2>Le délai : deux mois, comptés à partir du contrôle</h2>
<p>Le délai court à partir de la date du contrôle défavorable, pas de la réparation. Un contrôle passé le 15 janvier ouvre une fenêtre jusqu’au 14 mars inclus. Le mini-simulateur en haut de page fait le calcul pour votre résultat et la date de votre contrôle. Si la fenêtre se ferme avant que la voiture soit prête, il ne reste plus qu’à repasser un contrôle complet.</p>
<p>Un point souvent mal compris : quand la contre-visite est favorable, la nouvelle validité de deux ans court à partir de la date du contrôle d’origine, pas de celle de la contre-visite. Attendre la dernière semaine pour la contre-visite ne fait donc rien gagner, et fait courir le risque d’un rendez-vous introuvable.</p>
<h2>Combien coûte une contre-visite</h2>
<p>Chaque centre déclare dans le fichier public deux prix de contre-visite pour chaque catégorie de véhicule. Le prix bas correspond en général à une vérification visuelle (un rétroviseur remplacé, un pneu changé) ; le prix haut, à un nouveau passage sur les bancs (freinage, pollution, parallélisme). Pour une voiture, la médiane nationale du prix bas est de ${h.prix(n.cv.min.med)}, celle du prix haut de ${h.prix(n.cv.max.med)}. Un centre sur dix descend sous ${h.prix(n.cv.max.p10)} pour le prix haut, un sur dix dépasse ${h.prix(n.cv.max.p90)}.</p>
<p>La contre-visite est libre de prix au même titre que le contrôle. Elle n’est donc pas « forcément gratuite » ni « forcément à moitié prix », contrairement à une idée répandue. Pour une moto, les médianes sont de ${h.prix(n.cvm.min.med)} et ${h.prix(n.cvm.max.med)}.</p>
<h2>Gratuite ou payante ?</h2>
<p>${h.pct(n.cv.gratuite, 0)} des centres déclarent un prix bas de 0 € pour la contre-visite d’une voiture. La gratuité est presque toujours conditionnelle : contre-visite faite dans le même centre, dans un délai plus court que les deux mois légaux, ou limitée aux vérifications visuelles. Les conditions doivent être affichées par le centre. Avant un contrôle, demandez-les : sur un véhicule ancien, un centre un peu plus cher mais à contre-visite gratuite peut coûter moins au total.</p>
<p>Parmi les départements d’au moins dix centres, ${h.num(sansGratuit(h))} n’ont aucun centre qui annonce de gratuité. Le mini-simulateur ci-dessous donne la fourchette médiane et la part des centres à contre-visite gratuite dans votre département.</p>
<!--mini:cvDept-->
<h2>Les écarts entre départements</h2>
<p>Pour le prix haut d’une contre-visite de voiture, les médianes départementales les plus basses sont celles de ${fmt(h, x.bas)} ; les plus élevées, celles de ${fmt(h, x.haut)}. Ces écarts suivent à peu près ceux du prix du contrôle, avec des exceptions : certains départements où le contrôle est cher pratiquent des contre-visites modérées, pour fidéliser leurs clients.</p>
<p>Pour comparer précisément, l’outil de la ${h.a('home', 'page d’accueil')} affiche pour chaque centre autour de votre commune le prix de la visite et la fourchette de la contre-visite. Classez par prix, puis regardez la colonne de droite : un écart de dix euros sur la contre-visite pèse autant qu’un écart de dix euros sur la visite si votre véhicule a de bonnes chances de devoir y retourner.</p>
<h2>Rouler en attendant la contre-visite</h2>
<p>Avec une défaillance majeure, le véhicule reste autorisé à circuler jusqu’à la fin du délai de deux mois, le temps de le faire réparer. Avec une défaillance critique, la validité s’arrête le soir du contrôle : après, la voiture ne peut rouler que pour aller chez le réparateur ou à la fourrière. Un contrôle routier hors de ces cas expose à l’amende forfaitaire de ${h.eur(h.P.sanctions.amende_forfaitaire)}, et les forces de l’ordre peuvent retenir la carte grise en délivrant une fiche de circulation de ${h.num(h.P.sanctions.fiche_circulation_jours)} jours.</p>
<h2>Préparer la contre-visite</h2>
<p>Apportez le procès-verbal du contrôle défavorable : sans lui, le centre ne peut pas faire une contre-visite et facturera un contrôle complet. Faites réparer tous les points signalés comme majeurs ou critiques, et demandez au garage la facture détaillée, qui peut aider le contrôleur. Les défaillances mineures ne sont pas revérifiées, mais les corriger évite qu’elles s’aggravent d’ici au prochain contrôle.</p>
<p>Enfin, gardez en tête la règle de la vente : une voiture peut être cédée en l’état avant la contre-visite, à condition que la vente ait lieu moins de deux mois après le contrôle ; c’est alors l’acheteur qui fait la contre-visite. Avec une défaillance critique, en revanche, réparations et contre-visite doivent être faites avant de vendre à un particulier. Le guide ${h.a('controle-technique-vente', 'de la vente')} détaille ces cas.</p>`;
    },
  },
  en: {
    slug: 'contre-visite-re-inspection',
    nav: 'Re-inspection',
    card: 'The two-month window, each centre’s declared price, when it is free.',
    title: 'Contre-visite (re-inspection) in France: price and deadline',
    description: 'The contre-visite after a failed contrôle technique: two-month deadline, prices declared by centres, free or paid, driving in the meantime, by département.',
    h1: 'Contre-visite: deadline, price and when it is free',
    intro: 'After a failed test you have two months. Here is the deadline for your case, and what centres declare they charge.',
    resume: (h) => {
      const n = N(h);
      return `A contre-visite, or re-inspection, is compulsory when the contrôle technique finds at least one major or critical defect. It must be done within two months of the test, at any centre you choose, and only covers the items to be fixed. Its price is free, like the test’s: centres declare two, a low one for a visual check and a high one when the vehicle has to go back on the test equipment. Across France, according to the public price file of ${h.date(h.S.meta.fichier)}, the median low price is ${h.prix(n.cv.min.med)} and the median high price ${h.prix(n.cv.max.med)} for a car; ${h.pct(n.cv.gratuite, 0)} of centres say the re-check can be free in some cases. After the two months, you need a full test again, at ${h.prix(n.s.e.med)} at the median. With a major defect the car may be driven until the deadline; with a critical defect, only on the day of the test.`;
    },
    faqs: (h) => {
      const n = N(h);
      return [
        { q: 'Does the re-inspection have to be at the centre that did the test?', a: 'No. You can take it to any approved centre, showing the report of the failed test. Going back to the same centre is often practical: that is where a free re-check is most often offered, and the inspector already knows the vehicle. Still compare: another centre may be cheaper even if you pay.' },
        { q: 'What happens if I miss the two-month deadline?', a: `A re-inspection is no longer possible: you need a full contrôle technique again, at full price (${h.prix(n.s.e.med)} at the median for a car), which may itself find new defects. Meanwhile, if the original test showed a major defect, the car is no longer road-legal and the fixed fine of ${h.eur(h.P.sanctions.amende_forfaitaire)} applies.` },
        { q: 'Can I drive with a critical defect until it is repaired?', a: 'Only on the day of the test. A critical defect means a direct danger to safety or the environment: the test’s validity ends that evening. After that, the vehicle may only be driven to a repairer or to a pound. The two-month window for the re-inspection is unchanged.' },
        { q: 'How much is a motorcycle re-inspection?', a: `For two-wheelers, centres declare a median of ${h.prix(n.cvm.min.med)} for the low price and ${h.prix(n.cvm.max.med)} for the high price, and ${h.pct(n.cvm.gratuite, 0)} of them say it can be free. The deadline is the same as for a car: two months after the failed test.` },
        { q: 'Can a re-inspection fail too?', a: 'Yes, if a defect has not been fixed, or not properly. The centre then issues a new failed report, and another re-inspection is due within two months of that one. Each visit is charged at the centre’s declared price: it is worth having the garage check the repair before you go back.' },
      ];
    },
    body: (h) => {
      const n = N(h), x = extremes(h);
      return `<h2>When is a re-inspection compulsory?</h2>
<p>The inspector grades every defect at one of three levels. A minor defect has no safety impact: it appears on the report, with no re-check. A major defect may compromise safety, the environment or other road users: the test is a fail and a re-inspection is compulsory. A critical defect is a direct danger: same obligation, plus a ban on driving after the day of the test. The categories are explained on the ${h.a('defaillances-controle-technique', 'defects page')}.</p>
<p>The re-inspection does not repeat the whole test. The inspector only checks the items flagged as defective, hence a lower price than a test and a shorter visit, often a quarter of an hour.</p>
<h2>The deadline: two months from the test</h2>
<p>The window runs from the date of the failed test, not of the repair. A test on 15 January leaves until 14 March inclusive. The mini calculator at the top of the page works it out for your result and test date. If the window closes before the car is ready, the only option left is a full test.</p>
<p>A point often misunderstood: when the re-inspection is a pass, the new two-year validity runs from the date of the original test, not from the re-inspection. Waiting until the last week therefore gains nothing, and risks finding no slot.</p>
<h2>What a re-inspection costs</h2>
<p>Every centre declares two re-inspection prices in the public file for each vehicle category. The low price is usually for a visual check (a mirror replaced, a tyre changed); the high price for another pass on the equipment (brakes, emissions, alignment). For a car, the national median low price is ${h.prix(n.cv.min.med)} and the high price ${h.prix(n.cv.max.med)}. One centre in ten is below ${h.prix(n.cv.max.p10)} for the high price, one in ten above ${h.prix(n.cv.max.p90)}.</p>
<p>The re-inspection is priced freely, just like the test. So it is neither “always free” nor “always half price”, despite a widespread belief. For a motorcycle the medians are ${h.prix(n.cvm.min.med)} and ${h.prix(n.cvm.max.med)}.</p>
<h2>Free or paid?</h2>
<p>${h.pct(n.cv.gratuite, 0)} of centres declare a low re-inspection price of €0 for a car. Free re-checks almost always come with conditions: done at the same centre, within a shorter time than the legal two months, or limited to visual checks. Centres must display those conditions. Ask before the test: on an older vehicle, a slightly dearer centre with a free re-check may cost less overall.</p>
<p>Among départements with at least ten centres, ${h.num(sansGratuit(h))} have no centre offering it free. The mini calculator below gives the median range and the share of centres with a free re-check in your département.</p>
<!--mini:cvDept-->
<h2>Gaps between départements</h2>
<p>For the high re-inspection price for a car, the lowest département medians are in ${fmt(h, x.bas)}; the highest in ${fmt(h, x.haut)}. These gaps roughly follow those of the test price, with exceptions: some départements with dear tests keep re-checks moderate, to keep their customers.</p>
<p>To compare precisely, the tool on the ${h.a('home', 'home page')} shows, for every centre around your town, the test price and the re-inspection range. Sort by price, then look at the right-hand column: a ten-euro gap on the re-check weighs as much as ten euros on the test if your vehicle is likely to go back.</p>
<h2>Driving until the re-inspection</h2>
<p>With a major defect the vehicle may still be driven until the end of the two months, to get it repaired. With a critical defect validity ends on the evening of the test: after that, the car may only go to the repairer or a pound. A roadside check outside those cases risks the fixed fine of ${h.eur(h.P.sanctions.amende_forfaitaire)}, and the police may keep the registration certificate, issuing a ${h.num(h.P.sanctions.fiche_circulation_jours)}-day temporary permit to drive.</p>
<h2>Preparing for the re-inspection</h2>
<p>Bring the report of the failed test: without it, the centre cannot do a re-inspection and will charge a full test. Have every major or critical item repaired, and ask the garage for a detailed invoice, which can help the inspector. Minor defects are not rechecked, but fixing them stops them getting worse before the next test.</p>
<p>Finally, keep the sale rule in mind: a car may be sold as it is before the re-inspection, provided the sale takes place less than two months after the test; the buyer then does the re-inspection. With a critical defect, though, the repairs and the re-inspection must be done before selling to a private buyer. The ${h.a('controle-technique-vente', 'selling guide')} covers these cases.</p>`;
    },
  },
});

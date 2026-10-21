import { defineGuide, type Helpers } from '../../lib/guide-types';

const N = (h: Helpers) => h.S.national;

export default defineGuide({
  id: 'defaillances-controle-technique',
  group: 'regles',
  order: 7,
  mini: 'contreVisite',
  related: ['contre-visite', 'quand-faire-controle-technique', 'controle-technique-vente', 'controle-technique-pas-cher', 'controle-technique-electrique'],
  sources: ['spVoiture', 'arrete1991', 'codeR323', 'spDeuxRoues', 'histovec'],
  fr: {
    slug: 'defaillances-controle-technique',
    nav: 'Défaillances et résultat',
    card: 'Mineure, majeure, critique : ce que chaque niveau change pour vous.',
    title: 'Défaillances au contrôle technique : mineure ou critique',
    description: 'Défaillances du contrôle technique : mineure, majeure ou critique, résultat favorable ou défavorable, contre-visite, droit de rouler, points vérifiés en 2026.',
    h1: 'Défaillances du contrôle technique : lire son résultat',
    intro: 'Ce que signifient les trois niveaux de défaillance du procès-verbal, et ce que chacun vous oblige à faire.',
    resume: (h) => {
      const n = N(h);
      return `Le procès-verbal du contrôle technique classe chaque défaut relevé en trois niveaux. Une défaillance mineure n’a pas d’effet notable sur la sécurité ni sur l’environnement : le contrôle reste favorable, sans contre-visite, mais le défaut doit être corrigé. Une défaillance majeure peut compromettre la sécurité du véhicule, celle des autres usagers ou l’environnement : le contrôle est défavorable, et une contre-visite est obligatoire dans les deux mois, le véhicule pouvant rouler jusque-là. Une défaillance critique constitue un danger direct et immédiat : le contrôle est défavorable et le véhicule ne peut plus circuler après le jour du contrôle, sauf pour aller se faire réparer. Pour une voiture, le contrôleur vérifie ${h.num(h.P.points_controle.voiture)} points, du freinage à l’éclairage et aux émissions. La contre-visite se paie à part : ${h.prix(n.cv.min.med)} à ${h.prix(n.cv.max.med)} en médiane, d’après le fichier des prix du ${h.date(h.S.meta.fichier)}, et ${h.pct(n.cv.gratuite, 0)} des centres la proposent gratuite dans certains cas.`;
    },
    faqs: (h) => [
      { q: 'Un contrôle avec des défaillances mineures est-il favorable ?', a: 'Oui. Les défaillances mineures figurent sur le procès-verbal, mais le résultat reste favorable et la validité de deux ans s’applique sans contre-visite. Le propriétaire doit faire corriger ces défauts ; ils ne seront pas revérifiés avant le contrôle suivant, où ils pourraient être classés plus sévèrement s’ils se sont aggravés.' },
      { q: 'Le contrôleur peut-il me recommander un garage ou faire la réparation ?', a: 'Non. Un centre de contrôle technique agréé n’a pas le droit d’exercer une activité de réparation ou de commerce automobile, et le contrôleur ne peut pas orienter vers un réparateur. Il constate des défaillances, sans démontage. Choisir le garage, faire établir des devis et faire réparer restent à votre charge.' },
      { q: 'Peut-on contester le résultat d’un contrôle technique ?', a: 'Adressez-vous d’abord au centre, procès-verbal en main, pour obtenir une explication ou une vérification. Si le désaccord persiste, le réseau dont dépend le centre et la préfecture, qui délivre l’agrément, peuvent être saisis. Faire contrôler le véhicule ailleurs reste possible, mais le premier procès-verbal défavorable figure déjà dans l’historique du véhicule.' },
      { q: 'Un voyant allumé au tableau de bord fait-il échouer le contrôle ?', a: 'Certains voyants entraînent une défaillance, en particulier ceux qui signalent un défaut de freinage, d’airbag ou du système antipollution. Le niveau retenu dépend du système concerné et de son état. Faire lire le défaut par un garage avant le contrôle évite souvent une contre-visite.' },
    ],
    body: (h) => {
      const n = N(h);
      return `<h2>Trois niveaux, trois conséquences</h2>
<p>Depuis la réforme de 2018, qui a transposé une directive européenne, le contrôle technique classe chaque défaut en trois niveaux de gravité. Ce classement décide de tout : du résultat du contrôle, de l’obligation de contre-visite et du droit de rouler.</p>
${h.table(['Niveau', 'Résultat', 'Contre-visite', 'Rouler ensuite'], [['Mineure', 'Favorable', 'Non', 'Oui, jusqu’au prochain contrôle'], ['Majeure', 'Défavorable', 'Oui, dans les 2 mois', 'Oui, jusqu’à la fin du délai'], ['Critique', 'Défavorable', 'Oui, dans les 2 mois', 'Le jour du contrôle seulement']], 'Ce que change chaque niveau de défaillance')}
<p>Un contrôle sans aucune défaillance et un contrôle avec seulement des défaillances mineures donnent le même résultat : favorable, avec une validité de deux ans pour une voiture et de trois ans pour un deux-roues. La différence tient au procès-verbal, qui liste les défauts à corriger, et à la mémoire du véhicule : un défaut mineur négligé peut devenir majeur au contrôle suivant.</p>
<h2>Ce que le contrôleur vérifie</h2>
<p>Pour une voiture, l’examen porte sur ${h.num(h.P.points_controle.voiture)} points, répartis en grandes fonctions : l’identification du véhicule (plaques, numéro de série, concordance avec la carte grise), le freinage, la direction, la visibilité (pare-brise, rétroviseurs, essuie-glaces), l’éclairage et la signalisation, les liaisons au sol (pneus, roues, suspensions, essieux), la structure et la carrosserie, les équipements (ceintures, airbags, avertisseur), et les nuisances, c’est-à-dire les émissions polluantes et le bruit. Pour un deux-roues, la liste compte ${h.num(h.P.points_controle.deux_roues)} points.</p>
<p>Le contrôle se fait sans démontage : le contrôleur observe, mesure et teste sur ses bancs, mais n’ouvre rien. Un défaut caché n’est donc pas forcément détecté, et un contrôle favorable ne garantit pas l’absence de panne future. C’est une photographie de l’état du véhicule le jour J.</p>
<h2>Les défaillances majeures les plus courantes</h2>
<p>Sans chiffres officiels publics sur leur fréquence, l’expérience des garages et des centres converge sur quelques familles : un déséquilibre de freinage entre les deux roues d’un même essieu, des disques ou plaquettes usés, des pneus usés ou dépareillés sur un même essieu, un feu ou un clignotant qui ne fonctionne pas, une fuite d’huile importante, un jeu dans la direction, une émission polluante hors norme. La plupart se voient ou se mesurent chez un garagiste avant le contrôle.</p>
<p>Quelques vérifications à faire soi-même suffisent souvent à éviter une contre-visite : toutes les ampoules (feux de croisement, de route, stop, clignotants, plaque arrière), l’état des essuie-glaces et le lave-glace, la profondeur des sculptures des pneus, le niveau du liquide de frein, l’absence de voyant allumé au tableau de bord, la lisibilité des plaques.</p>
<h2>Défaillance critique : que faire le jour même</h2>
<p>Une défaillance critique, par exemple un système de freinage inopérant ou un élément de direction près de se rompre, signale un danger immédiat. La validité du contrôle s’arrête le soir du contrôle : après minuit, le véhicule ne peut plus circuler, sauf pour être conduit chez un réparateur ou à la fourrière. Si le défaut rend la conduite dangereuse, mieux vaut faire venir une dépanneuse. La contre-visite reste à faire dans les deux mois, après réparation.</p>
<h2>Le procès-verbal et la contre-visite</h2>
<p>Le procès-verbal est remis tout de suite. Il porte le résultat, la liste des défaillances avec leur niveau et la date limite du prochain contrôle ou de la contre-visite. Gardez-le : il est indispensable pour la contre-visite, que vous pouvez faire dans n’importe quel centre agréé. Elle ne porte que sur les défaillances majeures et critiques relevées et se facture à part, au prix déclaré par le centre. La page ${h.a('contre-visite', 'contre-visite')} détaille les délais et compare les prix, et le mini-simulateur ci-dessous rappelle votre prochaine échéance une fois le contrôle validé.</p>
<!--mini:echeance-->
<h2>Les résultats sont enregistrés</h2>
<p>Chaque contrôle est transmis à un organisme technique central, qui tient l’historique des contrôles de chaque véhicule. Le kilométrage relevé y figure, ce qui permet de détecter un compteur trafiqué lors d’une revente. Le service public HistoVec rend ces informations accessibles gratuitement au propriétaire, qui peut partager un rapport avec un acheteur. Le guide ${h.a('controle-technique-vente', 'de la vente')} explique comment s’en servir.</p>
<h2>Le prix ne change pas le niveau d’exigence</h2>
<p>Le niveau de sévérité ne dépend ni du centre ni de son prix : la liste des points et le classement des défaillances sont fixés par arrêté, et les centres sont surveillés par l’administration. Choisir un centre à ${h.prix(n.s.e.p10)} plutôt qu’à ${h.prix(n.s.e.p90)} ne rend pas le contrôle plus indulgent ni plus sévère. Seul le prix de la contre-visite, et sa gratuité éventuelle, varie d’un centre à l’autre : un critère à regarder si votre véhicule a des chances d’échouer. L’outil de la ${h.a('home', 'page d’accueil')} les affiche côte à côte.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-defects-results',
    nav: 'Defects and results',
    card: 'Minor, major, critical: what each level means for you.',
    title: 'Contrôle technique defects: minor, major and critical',
    description: 'French contrôle technique defects explained: minor, major or critical, pass or fail, re-inspection, whether you may still drive, and the items checked in 2026.',
    h1: 'Contrôle technique defects: reading your result',
    intro: 'What the three defect levels on the report mean, and what each one requires you to do.',
    resume: (h) => {
      const n = N(h);
      return `The contrôle technique report grades every defect found at one of three levels. A minor defect has no significant effect on safety or the environment: the test is still a pass, with no re-inspection, but the defect must be fixed. A major defect may compromise the vehicle’s safety, other road users’ safety or the environment: the test is a fail, and a re-inspection (contre-visite) is compulsory within two months, the vehicle being allowed on the road until then. A critical defect is a direct and immediate danger: the test is a fail and the vehicle may no longer be driven after the day of the test, except to be repaired. For a car, the inspector checks ${h.num(h.P.points_controle.voiture)} items, from brakes to lights and emissions. The re-inspection is charged separately: ${h.prix(n.cv.min.med)} to ${h.prix(n.cv.max.med)} at the median, according to the price file of ${h.date(h.S.meta.fichier)}, and ${h.pct(n.cv.gratuite, 0)} of centres offer it free in some cases.`;
    },
    faqs: (h) => [
      { q: 'Is a test with only minor defects a pass?', a: 'Yes. Minor defects appear on the report, but the result is a pass and the two-year validity applies with no re-inspection. The owner must have them fixed; they will not be rechecked before the next test, where they could be graded more severely if they have got worse.' },
      { q: 'Can the inspector recommend a garage or do the repair?', a: 'No. An approved inspection centre may not carry out repairs or sell vehicles, and the inspector may not steer you to a repairer. They record defects, without dismantling anything. Choosing a garage, getting quotes and having the work done are up to you.' },
      { q: 'Can I dispute a contrôle technique result?', a: 'Go to the centre first, with the report, for an explanation or a re-check. If you still disagree, the network the centre belongs to and the prefecture, which grants its approval, can be contacted. Having the vehicle tested elsewhere is possible, but the first failed report is already in the vehicle’s history.' },
      { q: 'Will a dashboard warning light make my car fail?', a: 'Some warning lights do lead to a defect, especially those for brakes, airbags or the emissions system. The level depends on the system involved and its condition. Having a garage read the fault code before the test often avoids a re-inspection.' },
    ],
    body: (h) => {
      const n = N(h);
      return `<h2>Three levels, three consequences</h2>
<p>Since the 2018 reform, which transposed a European directive, the contrôle technique grades every defect at one of three levels of severity. That grading decides everything: the result, whether a re-inspection is required and whether you may keep driving.</p>
${h.table(['Level', 'Result', 'Re-inspection', 'Driving afterwards'], [['Minor', 'Pass', 'No', 'Yes, until the next test'], ['Major', 'Fail', 'Yes, within 2 months', 'Yes, until the deadline'], ['Critical', 'Fail', 'Yes, within 2 months', 'On the day of the test only']], 'What each defect level changes')}
<p>A test with no defects and a test with only minor defects give the same result: a pass, valid for two years for a car and three years for a two-wheeler. The difference lies in the report, which lists the defects to fix, and in the vehicle’s record: a neglected minor defect can become major at the next test.</p>
<h2>What the inspector checks</h2>
<p>For a car, the inspection covers ${h.num(h.P.points_controle.voiture)} items, grouped into broad functions: vehicle identification (plates, serial number, match with the registration certificate), brakes, steering, visibility (windscreen, mirrors, wipers), lights and signals, axles, wheels, tyres and suspension, body and structure, equipment (seat belts, airbags, horn), and nuisances, meaning exhaust emissions and noise. For a two-wheeler the list has ${h.num(h.P.points_controle.deux_roues)} items.</p>
<p>The test involves no dismantling: the inspector looks, measures and tests on the equipment, but opens nothing. A hidden fault may therefore go undetected, and a pass does not guarantee there will be no breakdown later. It is a snapshot of the vehicle’s condition on the day.</p>
<h2>The most common major defects</h2>
<p>There are no public official figures on how often each occurs, but garages and centres agree on a few families: unbalanced braking between the two wheels of an axle, worn discs or pads, worn or mismatched tyres on one axle, a light or indicator not working, a significant oil leak, play in the steering, emissions above the limit. Most can be seen or measured at a garage before the test.</p>
<p>A few checks of your own are often enough to avoid a re-inspection: every bulb (dipped and main beam, brake lights, indicators, rear plate light), wipers and washer fluid, tyre tread depth, brake fluid level, no warning light on the dashboard, and readable plates.</p>
<h2>A critical defect: what to do on the day</h2>
<p>A critical defect, such as a braking system that does not work or a steering part about to fail, signals an immediate danger. The test’s validity ends on the evening of the test: after midnight, the vehicle may no longer be driven, except to a repairer or a pound. If the fault makes driving dangerous, it is better to call a tow truck. The re-inspection must still be done within two months, after the repair.</p>
<h2>The report and the re-inspection</h2>
<p>The report is handed over straight away. It shows the result, the list of defects with their level and the deadline for the next test or the re-inspection. Keep it: you need it for the re-inspection, which you can take at any approved centre. It only covers the major and critical defects found and is charged separately, at the centre’s declared price. The ${h.a('contre-visite', 're-inspection page')} sets out the deadlines and compares prices, and the mini calculator below tells you your next due date once the test is passed.</p>
<!--mini:echeance-->
<h2>Results are recorded</h2>
<p>Every test is sent to a central technical body, which keeps each vehicle’s test history. The mileage read at the test is recorded too, which helps spot a tampered odometer at resale. The free HistoVec public service gives the owner access to this information and lets them share a report with a buyer. The ${h.a('controle-technique-vente', 'selling guide')} explains how to use it.</p>
<h2>Price does not change how strict the test is</h2>
<p>How severe the test is depends neither on the centre nor on its price: the list of items and the grading of defects are set by ministerial order, and centres are supervised by the authorities. Choosing a centre at ${h.prix(n.s.e.p10)} rather than ${h.prix(n.s.e.p90)} makes the test neither more lenient nor stricter. Only the re-inspection price, and whether it can be free, varies from one centre to another: worth a look if your vehicle may fail. The tool on the ${h.a('home', 'home page')} shows them side by side.</p>`;
    },
  },
});

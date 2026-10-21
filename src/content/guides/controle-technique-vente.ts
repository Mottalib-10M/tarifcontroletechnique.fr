import { defineGuide, type Helpers } from '../../lib/guide-types';

const N = (h: Helpers) => h.S.national;

export default defineGuide({
  id: 'controle-technique-vente',
  group: 'regles',
  order: 6,
  mini: 'vente',
  related: ['contre-visite', 'quand-faire-controle-technique', 'controle-technique-pas-cher', 'defaillances-controle-technique', 'departements'],
  sources: ['spVente', 'spCession', 'spDeuxRoues', 'histovec', 'dataset'],
  fr: {
    slug: 'controle-technique-vente-voiture',
    nav: 'Vendre son véhicule',
    card: 'Contrôle de moins de 6 mois, contre-visite et vente en l’état.',
    title: 'Contrôle technique pour vendre sa voiture : règles 2026',
    description: 'Contrôle technique et vente d’occasion en 2026 : moins de 6 mois, voiture de plus de 4 ans, moto de plus de 5 ans, contre-visite, vente en l’état et prix moyen.',
    h1: 'Vendre sa voiture : le contrôle technique de moins de 6 mois',
    intro: 'Dans quels cas un contrôle est exigé pour vendre, combien de temps il reste valable, et que faire s’il est défavorable.',
    resume: (h) => {
      const n = N(h);
      return `Pour vendre à un particulier une voiture, une camionnette ou un camping-car de 3,5 tonnes au plus qui a plus de quatre ans, le vendeur doit remettre à l’acheteur la preuve d’un contrôle technique de moins de six mois. Le délai se compte jusqu’au jour où l’acheteur dépose sa demande de carte grise, pas jusqu’au jour de la vente : un contrôle fait cinq mois et demi avant la vente laisse très peu de marge. Pour une moto, un scooter ou un quad, la règle s’applique depuis le 15 avril 2024 aux véhicules de plus de cinq ans. Aucun contrôle n’est exigé pour une vente à un garagiste ou à un négociant. Si le contrôle est défavorable pour une défaillance majeure, la voiture peut être vendue en l’état dans les deux mois, l’acheteur faisant la contre-visite ; une défaillance critique impose de réparer et de passer la contre-visite avant de vendre. Le contrôle coûte ${h.prix(n.s.e.med)} en médiane pour une voiture et ${h.prix(n.s.m.med)} pour une moto, d’après le fichier des prix du ${h.date(h.S.meta.fichier)}.`;
    },
    faqs: (h) => [
      { q: 'Le contrôle de moins de six mois se compte-t-il jusqu’à la vente ou jusqu’à la carte grise ?', a: 'Jusqu’au dépôt de la demande de nouvelle carte grise par l’acheteur. Si l’acheteur tarde à faire sa démarche, un contrôle valable le jour de la vente peut ne plus l’être quand il demande son certificat d’immatriculation. Par prudence, vendez avec un contrôle récent et rappelez à l’acheteur de déclarer l’achat rapidement.' },
      { q: 'Peut-on vendre une voiture dont le contrôle technique est défavorable ?', a: 'Oui pour une défaillance majeure, à condition de vendre moins de deux mois après le contrôle : l’acheteur reçoit le procès-verbal et fait lui-même la contre-visite dans le délai. Avec une défaillance critique, les réparations et la contre-visite doivent être faites avant la vente à un particulier. Un véhicule qui ne roule plus ne se vend qu’à un professionnel.' },
      { q: 'Faut-il un contrôle technique pour vendre sa voiture à un garage ?', a: 'Non. La vente à un professionnel de l’automobile, garagiste, négociant ou concessionnaire disposant d’un numéro SIRET, est dispensée de la preuve du contrôle. C’est le professionnel qui fera contrôler le véhicule avant de le revendre à un particulier, ce qui pèse en général sur le prix de reprise.' },
      { q: 'Qui paie le contrôle technique lors d’une vente d’occasion ?', a: `Le vendeur, puisque c’est à lui de remettre la preuve du contrôle. Le prix médian déclaré par les centres est de ${h.prix(N(h).s.e.med)} pour une voiture. Rien n’interdit de négocier le partage d’une éventuelle contre-visite avec l’acheteur, mais l’obligation de fournir le procès-verbal reste celle du vendeur.` },
    ],
    body: (h) => {
      const n = N(h);
      return `<h2>Quels véhicules doivent avoir un contrôle récent pour être vendus</h2>
<p>L’obligation dépend de l’âge et de la catégorie du véhicule. Pour une voiture particulière, une camionnette ou un camping-car de 3,5 tonnes au plus, elle s’applique au-delà de quatre ans après la première mise en circulation, c’est-à-dire dès que le véhicule est entré dans le rythme des contrôles périodiques. Pour les deux-roues motorisés, tricycles et quadricycles, elle s’applique depuis le 15 avril 2024 au-delà de cinq ans. Un véhicule plus jeune se vend sans contrôle.</p>
<p>Le mini-simulateur ci-dessus tient compte de ces seuils, de l’ancienneté du dernier contrôle et de la qualité de l’acheteur. Il ne remplace pas la lecture du procès-verbal : un contrôle « favorable avec défaillances mineures » compte comme favorable, un contrôle avec défaillance majeure ouvre le régime de la contre-visite.</p>
<h2>Six mois, comptés jusqu’à la demande de carte grise</h2>
<p>La preuve du contrôle sert à l’acheteur pour immatriculer le véhicule à son nom. C’est pourquoi le délai de six mois se compte jusqu’à la date de dépôt de sa demande de certificat d’immatriculation. Un vendeur qui a fait contrôler sa voiture en prévision d’une vente qui traîne doit surveiller la date : au-delà, un nouveau contrôle est nécessaire, à ses frais.</p>
<p>Si le dernier contrôle périodique a moins de six mois, il suffit : inutile d’en refaire un. C’est le cas, par exemple, d’une voiture contrôlée au printemps et vendue à la fin de l’été. Dans le cas contraire, le contrôle « pour la vente » est un contrôle ordinaire, au même prix et selon la même liste de points.</p>
<h2>Contrôle défavorable : réparer ou vendre en l’état</h2>
<p>Un contrôle défavorable pour défaillance majeure laisse deux options. Faire réparer, passer la contre-visite, puis remettre à l’acheteur les deux procès-verbaux, celui du contrôle et celui de la contre-visite. Ou vendre en l’état, à condition que la vente ait lieu moins de deux mois après le contrôle : l’acheteur se charge alors de la contre-visite, et le prix de vente tient compte des réparations. Passé deux mois, un contrôle complet est à refaire.</p>
<p>Avec une défaillance critique, la vente à un particulier n’est possible qu’après réparation et contre-visite. Un véhicule non roulant ne peut être vendu qu’à un professionnel de l’automobile. La page ${h.a('contre-visite', 'contre-visite')} détaille le délai et les prix, ${h.prix(n.cv.min.med)} à ${h.prix(n.cv.max.med)} en médiane.</p>
<h2>Les autres papiers de la vente</h2>
<p>Le procès-verbal de contrôle n’est qu’une pièce du dossier. Le vendeur remet aussi la carte grise barrée, avec la mention « vendu le », la date et l’heure, et signée ; le certificat de cession rempli ; et un certificat de situation administrative de moins de quinze jours, qui atteste l’absence de gage et d’opposition. Il déclare ensuite la cession en ligne. Le coupon détachable de la carte grise permet à l’acheteur de circuler un mois en France, le temps de recevoir son titre.</p>
<p>Pour rassurer l’acheteur, le service public HistoVec du ministère de l’Intérieur produit gratuitement un rapport sur l’historique administratif du véhicule, contrôles techniques compris. Le partager avant la vente évite bien des discussions sur le kilométrage ou les sinistres.</p>
<h2>Moto, scooter, quad : les mêmes règles avec un seuil à cinq ans</h2>
<p>Depuis 2024, un deux-roues motorisé de plus de cinq ans se vend avec un contrôle de moins de six mois, selon le même mécanisme que la voiture. Le calendrier des premiers contrôles des deux-roues étant échelonné selon l’année de mise en circulation, beaucoup de motos n’ont encore jamais été contrôlées : pour elles, le contrôle avant la vente sera le premier. Les centres équipés pour les deux-roues sont moins nombreux, ${h.num(n.centresMoto)} en France ; la page ${h.a('controle-technique-moto', 'moto')} permet de trouver les plus proches et leurs prix, ${h.prix(n.s.m.med)} en médiane.</p>
<h2>Faire contrôler sa voiture avant de vendre : combien ça coûte</h2>
<p>Le contrôle avant vente est payé par le vendeur, au prix affiché par le centre. Le prix médian d’un contrôle de voiture essence ou diesel est de ${h.prix(n.s.e.med)}, mais un centre sur dix descend sous ${h.prix(n.s.e.p10)}. Comme la vente donne rarement l’occasion de choisir son moment, comparer les centres autour de chez soi reste la seule façon de payer moins. Une contre-visite gratuite chez le même centre a plus de valeur ici qu’ailleurs : un acheteur se méfie d’un véhicule vendu « en l’état ».</p>
<!--mini:devis-->
<p>Dernier conseil : un contrôle favorable récent est un argument de vente. Il rassure l’acheteur sur l’état des freins, des pneus et de la direction, et justifie un prix plus proche de la cote. Pour connaître la date de votre prochaine échéance si vous gardez finalement le véhicule, voyez ${h.a('quand-faire-controle-technique', 'quand faire son contrôle technique')}.</p>`;
    },
  },
  en: {
    slug: 'controle-technique-selling-a-car',
    nav: 'Selling a vehicle',
    card: 'A test under 6 months old, the re-inspection, selling as it is.',
    title: 'Contrôle technique to sell a car in France: 2026 rules',
    description: 'Contrôle technique when selling a used vehicle in France: under 6 months old, cars over 4 years, motorbikes over 5, re-inspection, selling as is, and the price.',
    h1: 'Selling a car in France: the test under six months old',
    intro: 'When a test is required to sell, how long it stays valid, and what to do if it is a fail.',
    resume: (h) => {
      const n = N(h);
      return `To sell a car, a van or a motorhome of up to 3.5 tonnes that is more than four years old to a private buyer in France, the seller must give the buyer proof of a contrôle technique less than six months old. The six months run until the day the buyer applies for the new registration certificate (carte grise), not until the day of sale: a test done five and a half months before the sale leaves very little margin. For a motorbike, scooter or quad, the rule has applied since 15 April 2024 to vehicles over five years old. No test is needed when selling to a garage or dealer. If the test is a fail for a major defect, the car may be sold as it is within two months, with the buyer doing the re-inspection; a critical defect means repairing and passing the re-inspection before selling. The test costs ${h.prix(n.s.e.med)} at the median for a car and ${h.prix(n.s.m.med)} for a motorbike, according to the price file of ${h.date(h.S.meta.fichier)}.`;
    },
    faqs: (h) => [
      { q: 'Do the six months run until the sale or until the new carte grise?', a: 'Until the buyer files the application for the new registration certificate. If the buyer is slow, a test that was valid on the day of sale may no longer be valid when they apply. To be safe, sell with a recent test and remind the buyer to register the purchase quickly.' },
      { q: 'Can I sell a car that failed its contrôle technique?', a: 'Yes for a major defect, provided the sale takes place less than two months after the test: the buyer receives the report and does the re-inspection within the deadline. With a critical defect, repairs and the re-inspection must be done before selling to a private buyer. A vehicle that no longer runs can only be sold to a trader.' },
      { q: 'Do I need a contrôle technique to sell my car to a garage?', a: 'No. A sale to a motor trade professional, garage, dealer or franchise with a SIRET number, is exempt from the proof of test. The professional will have the vehicle tested before reselling it to a private buyer, which usually weighs on the trade-in price.' },
      { q: 'Who pays for the contrôle technique when selling a used car?', a: `The seller, since it is the seller who must hand over proof of the test. The median price declared by centres is ${h.prix(N(h).s.e.med)} for a car. Nothing stops you sharing the cost of a possible re-inspection with the buyer, but the duty to provide the report stays with the seller.` },
    ],
    body: (h) => {
      const n = N(h);
      return `<h2>Which vehicles need a recent test to be sold</h2>
<p>The duty depends on the vehicle’s age and category. For a private car, a van or a motorhome of up to 3.5 tonnes, it applies once the vehicle is more than four years past its first registration, in other words once it has entered the cycle of periodic tests. For motorised two-wheelers, trikes and quads, it has applied since 15 April 2024 once they are over five years old. A younger vehicle can be sold without a test.</p>
<p>The mini calculator above takes these thresholds into account, along with the age of the last test and the type of buyer. It does not replace reading the report: a pass “with minor defects” counts as a pass, while a major defect brings in the re-inspection rules.</p>
<h2>Six months, counted to the carte grise application</h2>
<p>The buyer needs the proof of test to register the vehicle in their name. That is why the six months run to the date they file their registration application. A seller who had the car tested ahead of a sale that drags on must watch the date: beyond it, a new test is needed, at the seller’s expense.</p>
<p>If the last periodic test is under six months old, it is enough: no need for another. That is the case, for instance, for a car tested in spring and sold at the end of the summer. Otherwise the “test for the sale” is an ordinary test, at the same price and with the same list of items.</p>
<h2>A failed test: repair or sell as it is</h2>
<p>A failed test for a major defect leaves two options. Have it repaired, pass the re-inspection, then give the buyer both reports, the test and the re-inspection. Or sell as it is, provided the sale happens less than two months after the test: the buyer then handles the re-inspection, and the price reflects the repairs. After two months, a full test is needed again.</p>
<p>With a critical defect, selling to a private buyer is only possible after repair and re-inspection. A vehicle that no longer runs can only be sold to a motor trade professional. The ${h.a('contre-visite', 're-inspection page')} covers the deadline and the prices, ${h.prix(n.cv.min.med)} to ${h.prix(n.cv.max.med)} at the median.</p>
<h2>The other sale documents</h2>
<p>The test report is only one part of the file. The seller also hands over the registration certificate, crossed through with “vendu le”, the date and time, and signed; the completed transfer certificate (certificat de cession); and a certificate of administrative status (certificat de situation administrative) under fifteen days old, proving there is no lien or objection. The seller then declares the transfer online. The detachable slip on the carte grise lets the buyer drive in France for one month while the new certificate arrives.</p>
<p>To reassure the buyer, the Interior Ministry’s free HistoVec service produces a report on the vehicle’s administrative history, test results included. Sharing it before the sale heads off many arguments about mileage or past claims.</p>
<h2>Motorbike, scooter, quad: the same rules with a five-year threshold</h2>
<p>Since 2024, a motorised two-wheeler over five years old is sold with a test under six months old, under the same mechanism as a car. Because first tests for two-wheelers are staggered by year of registration, many motorbikes have never been tested yet: for them, the test before the sale will be the first. Fewer centres are equipped for two-wheelers, ${h.num(n.centresMoto)} across France; the ${h.a('controle-technique-moto', 'motorcycle page')} finds the nearest ones and their prices, ${h.prix(n.s.m.med)} at the median.</p>
<h2>Testing before a sale: what it costs</h2>
<p>The pre-sale test is paid by the seller, at the price the centre displays. The median for a petrol or diesel car test is ${h.prix(n.s.e.med)}, but one centre in ten is below ${h.prix(n.s.e.p10)}. Since a sale rarely lets you pick your moment, comparing centres near you is the only way to pay less. A free re-check at the same centre is worth more here than elsewhere: buyers are wary of a vehicle sold “as it is”.</p>
<!--mini:devis-->
<p>One last tip: a recent pass is a selling point. It reassures the buyer about the brakes, tyres and steering, and supports a price closer to the market value. To find your next due date if you end up keeping the vehicle, see ${h.a('quand-faire-controle-technique', 'when the test is due')}.</p>`;
    },
  },
});

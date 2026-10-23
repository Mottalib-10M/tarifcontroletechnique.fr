/** Configuration centrale du site (générée par new-site.py). */
import FICHIER from './ct/fichier.json';
export const SITE_URL = "https://tarifcontroletechnique.fr";
export const SITE_NAMES: Record<string, string> = {"fr": "Tarif CT", "en": "Tarif CT"};
export const LANG_TAGS: Record<string, string> = {"fr": "fr-FR", "en": "en-FR"};
export const OG_LOCALES: Record<string, string> = {"fr": "fr_FR", "en": "en_GB"};
/** Une locale par langue (RECETTE §4) : les nombres anglais s'écrivent « €1,234 », jamais « 1 234 € ». */
export const LOCALE_BY_LANG: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' };
export const LOCALE_TAG = 'fr-FR';
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
/** Date du fichier DGCCRF lu au dernier build (relu chaque jour par scripts/update-data.mjs) : c'est la date affichée sur chaque page. */
export const LAST_UPDATED: string = FICHIER.fichier;
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"fr": "Éditeur d'un comparateur neutre des prix du contrôle technique, centre par centre, sans réservation", "en": "Publisher of a neutral comparison of French contrôle technique prices, centre by centre, with no booking"};
export const AUTHOR_DESC: Record<string, string> = {"fr": "Radif Partners relit chaque jour le fichier des tarifs que les quelque 6 000 centres agréés déclarent à la DGCCRF, calcule la moyenne et la médiane de chaque commune et de chaque département, et montre le centre le moins cher autour de vous, sans prendre de rendez-vous ni de commission.", "en": "Radif Partners reads the price file that France's 6,000-odd approved inspection centres declare to the DGCCRF every day, works out the average and median of each commune and département, and shows the cheapest centre near you, with no booking and no commission."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"fr": ["Prix du contrôle technique par centre agréé", "Contre-visite et délai de deux mois", "Contrôle technique des deux-roues (catégorie L)", "Périodicité du contrôle technique des voitures", "Affichage des prix des centres de contrôle (arrêté du 29 juillet 2020)"], "en": ["Contrôle technique prices by approved centre", "Re-inspection (contre-visite) and the two-month window", "Motorcycle roadworthiness tests in France (category L)", "Inspection intervals for French cars", "Price display rules for French inspection centres"]};
export const CONTACT_EMAIL = "contact@tarifcontroletechnique.fr";
export const THEME_COLOR = '#1F4E9A';
export const LOGO_SYMBOL = 'CT';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'z25zxkbahd';
export const INDEXNOW_KEY = '369ff7257926c2f426f51d5c971159fd';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',            // raison sociale ou nom commercial exploité
  legalForm: '',  // vide : publication à titre personnel, pas de société
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "TVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;

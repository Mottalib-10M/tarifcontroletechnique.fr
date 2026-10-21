import type { Locale } from './routes';
const fr = {
  updatedOn: 'Mis à jour le', editorialPolicy: 'Charte éditoriale', contactLabel: 'Contact', reviewedBy: 'Vérifié par',
  skipToContent: 'Aller au contenu', mainNav: 'Navigation principale', breadcrumbLabel: 'Fil d’Ariane', breadcrumbHome: 'Accueil', menuOpen: 'Ouvrir le menu',
  faqTitle: 'Questions fréquentes', relatedCalculators: 'Pages et calculs associés', sourcesTitle: 'Sources', writtenBy: 'Rédigé par',
  asOf: 'Prix déclarés', lastUpdated: 'fichier du', footerValidated: 'Source : prix déclarés par les centres à la DGCCRF (data.gouv.fr, Licence Ouverte 2.0)', footerBrowser: 'Sans compte · sans rendez-vous · aucun numéro demandé · gratuit',
  footerDisclaimer: 'Site indépendant édité par Radif Partners. Ce n’est pas un site de l’administration ni d’un réseau de contrôle technique : aucun lien commercial avec un centre, aucune réservation, aucune commission. Les prix sont ceux que chaque centre déclare dans le fichier public de la DGCCRF, donnés à titre indicatif : le prix affiché au centre fait foi.', footerPopular: '', notFound: 'Cette page n’existe pas.',
  readMore: 'Lire la suite',
};
const en: typeof fr = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculations', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Declared prices', lastUpdated: 'file of', footerValidated: 'Source: prices declared by centres to the DGCCRF (data.gouv.fr, Licence Ouverte 2.0)', footerBrowser: 'No account · no booking · no phone number asked · free',
  footerDisclaimer: 'Independent site published by Radif Partners. It is not a government site nor part of any inspection network: no commercial link with any centre, no booking, no commission. Prices are those each centre declares in the DGCCRF’s public file, for guidance only: the price displayed at the centre is what counts.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : fr; }

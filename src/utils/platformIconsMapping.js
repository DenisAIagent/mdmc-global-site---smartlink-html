// src/utils/platformIconsMapping.js
// Mapping strict vers les pictos locaux UNIQUEMENT

/**
 * RÈGLE ABSOLUE: Utiliser UNIQUEMENT les pictos locaux disponibles
 * Aucun fallback, aucune génération d'icône, aucun CDN externe
 */

export const PLATFORM_ICONS = {
  'Spotify': '/pictos plateformes/picto_spotify.png',
  'Apple Music': '/pictos plateformes/picto_applemusic.png', 
  'YouTube Music': '/pictos plateformes/picto_youtubemusic.png',
  'YouTube': '/pictos plateformes/picto_youtube.png',
  'Deezer': '/pictos plateformes/picto_deezer.png',
  'Amazon Music': '/pictos plateformes/picto_amazonmusic.png',
  'Tidal': '/pictos plateformes/picto_tidal.png',
  'SoundCloud': '/pictos plateformes/picto_soundcloud.png'
};

/**
 * Plateformes supportées (celles avec pictos disponibles)
 */
export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_ICONS);

/**
 * Obtient l'icône pour une plateforme donnée
 * @param {string} platform - Nom de la plateforme
 * @returns {string|null} - Chemin vers l'icône locale ou null si non supportée
 */
export const getPlatformIcon = (platform) => {
  // Mapping exact ou null - AUCUN fallback
  return PLATFORM_ICONS[platform] || null;
};

/**
 * Vérifie si une plateforme est supportée (a un picto disponible)
 * @param {string} platform - Nom de la plateforme
 * @returns {boolean} - true si supportée
 */
export const isPlatformSupported = (platform) => {
  return PLATFORM_ICONS.hasOwnProperty(platform);
};

/**
 * Filtre une liste de liens pour ne garder que les plateformes supportées
 * @param {Array} platformLinks - Liste des liens de plateformes
 * @returns {Array} - Liens filtrés avec seulement les plateformes supportées
 */
export const filterSupportedPlatforms = (platformLinks = []) => {
  return platformLinks.filter(link => isPlatformSupported(link.platform));
};

/**
 * Normalise le nom d'une plateforme pour correspondre aux clés PLATFORM_ICONS
 * @param {string} platformName - Nom brut de la plateforme
 * @returns {string|null} - Nom normalisé ou null si non reconnu
 */
export const normalizePlatformName = (platformName) => {
  if (!platformName || typeof platformName !== 'string') return null;
  
  const lower = platformName.toLowerCase().trim();
  
  // Mapping de normalisation
  const normalizations = {
    'spotify': 'Spotify',
    'applemusic': 'Apple Music',
    'apple music': 'Apple Music',
    'apple': 'Apple Music',
    'youtubemusic': 'YouTube Music',
    'youtube music': 'YouTube Music',
    'youtube': 'YouTube',
    'deezer': 'Deezer',
    'amazonmusic': 'Amazon Music',
    'amazon music': 'Amazon Music',
    'amazon': 'Amazon Music',
    'tidal': 'Tidal',
    'soundcloud': 'SoundCloud'
  };
  
  return normalizations[lower] || null;
};

export default {
  PLATFORM_ICONS,
  SUPPORTED_PLATFORMS,
  getPlatformIcon,
  isPlatformSupported,
  filterSupportedPlatforms,
  normalizePlatformName
};
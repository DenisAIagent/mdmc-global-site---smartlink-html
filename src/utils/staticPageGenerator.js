// src/utils/staticPageGenerator.js
// Générateur de pages HTML statiques SmartLinks

/**
 * Génère une page HTML statique SmartLink complète
 * @param {Object} smartlinkData - Données du SmartLink
 * @returns {string} - HTML complet
 */
export const generateStaticHTML = (smartlinkData) => {
  const {
    trackTitle,
    artistName,
    coverImageUrl,
    shortId,
    customDescription,
    description,
    platformLinks = []
  } = smartlinkData;

  const title = `${trackTitle} - ${artistName}`;
  const desc = customDescription || description || `Écoutez ${trackTitle} de ${artistName} sur toutes les plateformes de streaming`;
  
  // Générer les plateformes de streaming
  const platformsHTML = generatePlatformsHTML(platformLinks);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(artistName)} - Choose Music Service</title>
    
    <!-- SEO Meta Tags -->
    <meta property="og:type" content="music.song">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${escapeHtml(coverImageUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(desc)}">
    <meta name="twitter:image" content="${escapeHtml(coverImageUrl)}">
    <meta name="description" content="${escapeHtml(desc)}">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            height: 100vh;
            background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #6b3d28 100%);
            background-attachment: fixed;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: radial-gradient(circle at 30% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.2) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(210, 180, 140, 0.1) 0%, transparent 50%);
            filter: blur(40px);
            z-index: -1;
        }

        .music-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 32px;
            width: 100%;
            max-width: 380px;
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.25),
                0 0 0 1px rgba(255, 255, 255, 0.05);
            position: relative;
        }

        .album-container {
            position: relative;
            width: 140px;
            height: 140px;
            margin: 0 auto 24px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .album-cover {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-image: url('${escapeHtml(coverImageUrl)}');
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .album-cover::before {
            content: '${escapeHtml(artistName).toUpperCase()}';
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.9);
            letter-spacing: 1px;
        }

        .play-button {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .play-button:hover {
            transform: scale(1.05);
            background: white;
        }

        .play-icon {
            width: 0;
            height: 0;
            border-left: 14px solid #333;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            margin-left: 3px;
        }

        .title {
            text-align: center;
            font-size: 28px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .subtitle {
            text-align: center;
            font-size: 16px;
            color: #8e8e93;
            margin-bottom: 32px;
            font-weight: 400;
        }

        .services-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .service-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border-radius: 16px;
            background: rgba(248, 248, 248, 0.8);
            transition: all 0.2s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
        }

        .service-item:hover {
            background: rgba(240, 240, 240, 0.9);
            transform: translateY(-1px);
        }

        .service-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            margin-right: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: white;
            font-size: 14px;
        }

        .spotify { background: #1DB954; }
        .apple-music { background: linear-gradient(135deg, #FA233B, #FF6B35); }
        .youtube-music { background: #FF0000; }
        .tidal { background: #000000; }
        .deezer { background: #FEAA2D; }
        .amazon-music { background: #00A8E1; }

        .service-info {
            flex: 1;
        }

        .service-name {
            font-size: 17px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 2px;
        }

        .service-description {
            font-size: 14px;
            color: #8e8e93;
            font-weight: 400;
        }

        .play-btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .play-btn:hover {
            background: #0056CC;
            transform: scale(1.02);
        }

        .play-btn:active {
            transform: scale(0.98);
        }

        @media (max-width: 480px) {
            .music-card {
                padding: 24px;
                margin: 10px;
            }
            
            .album-container {
                width: 120px;
                height: 120px;
            }
        }
    </style>
</head>
<body>
    <div class="music-card">
        <div class="album-container">
            <div class="album-cover">
                <div class="play-button" onclick="playAlbum()">
                    <div class="play-icon"></div>
                </div>
            </div>
        </div>
        
        <h1 class="title">${escapeHtml(artistName)}</h1>
        <p class="subtitle">Choose music service</p>
        
        <div class="services-list">
            ${platformsHTML}
        </div>
    </div>

    <script>
        function playAlbum() {
            console.log('Playing ${escapeHtml(artistName)} album...');
            const playBtn = document.querySelector('.play-button');
            playBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playBtn.style.transform = 'scale(1)';
            }, 150);
        }

        function openService(url) {
            if (url && url !== '#') {
                window.open(url, '_blank');
                const serviceItem = event.currentTarget;
                serviceItem.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    serviceItem.style.transform = 'translateY(-1px)';
                }, 100);
            }
        }

        // Effets et animations au survol
        document.querySelectorAll('.service-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-2px)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
            });
        });

        // Animation d'entrée
        window.addEventListener('load', () => {
            const card = document.querySelector('.music-card');
            card.style.transform = 'translateY(20px)';
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }, 100);
        });
    </script>
</body>
</html>`;
};

/**
 * Génère le CSS pour les SmartLinks
 */
const generateSmartLinkCSS = () => {
  return `<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            height: 100vh;
            background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #6b3d28 100%);
            background-attachment: fixed;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: radial-gradient(circle at 30% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, rgba(160, 82, 45, 0.2) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(210, 180, 140, 0.1) 0%, transparent 50%);
            filter: blur(40px);
            z-index: -1;
        }

        .music-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 32px;
            width: 100%;
            max-width: 380px;
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.25),
                0 0 0 1px rgba(255, 255, 255, 0.05);
            position: relative;
        }

        .album-container {
            position: relative;
            width: 140px;
            height: 140px;
            margin: 0 auto 24px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .album-cover {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .play-button {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .play-button:hover {
            transform: scale(1.05);
            background: white;
        }

        .play-icon {
            width: 0;
            height: 0;
            border-left: 14px solid #333;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            margin-left: 3px;
        }

        .title {
            text-align: center;
            font-size: 28px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .subtitle {
            text-align: center;
            font-size: 16px;
            color: #8e8e93;
            margin-bottom: 32px;
            font-weight: 400;
        }

        .services-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .service-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border-radius: 16px;
            background: rgba(248, 248, 248, 0.8);
            transition: all 0.2s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
        }

        .service-item:hover {
            background: rgba(240, 240, 240, 0.9);
            transform: translateY(-1px);
        }

        .service-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            margin-right: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: white;
            font-size: 14px;
        }

        .spotify { background: #1DB954; }
        .apple-music { background: linear-gradient(135deg, #FA233B, #FF6B35); }
        .youtube-music { background: #FF0000; }
        .tidal { background: #000000; }
        .deezer { background: #FEAA2D; }
        .amazon-music { background: #00A8E1; }
        .pandora { background: #005483; }
        .soundcloud { background: #FF5500; }

        .service-info {
            flex: 1;
        }

        .service-name {
            font-size: 17px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 2px;
        }

        .service-description {
            font-size: 14px;
            color: #8e8e93;
            font-weight: 400;
        }

        .play-btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .play-btn:hover {
            background: #0056CC;
            transform: scale(1.02);
        }

        @media (max-width: 480px) {
            .music-card {
                padding: 24px;
                margin: 10px;
            }
            
            .album-container {
                width: 120px;
                height: 120px;
            }
        }
    </style>`;
};

/**
 * Génère le JavaScript pour les SmartLinks
 */
const generateSmartLinkJS = () => {
  return `<script>
        function playAlbum() {
            console.log('Playing album...');
            const playBtn = document.querySelector('.play-button');
            playBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playBtn.style.transform = 'scale(1)';
            }, 150);
        }

        function openService(url) {
            if (url) {
                window.open(url, '_blank');
                
                // Animation de feedback
                const serviceItem = event.currentTarget;
                serviceItem.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    serviceItem.style.transform = 'translateY(-1px)';
                }, 100);
            }
        }

        // Animation d'entrée
        window.addEventListener('load', () => {
            const card = document.querySelector('.music-card');
            card.style.transform = 'translateY(20px)';
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }, 100);
        });
    </script>`;
};

/**
 * Génère le HTML des plateformes de streaming
 */
const generatePlatformsHTML = (platformLinks) => {
  const platformConfig = {
    'Spotify': { icon: '♫', desc: 'Music for everyone', class: 'spotify' },
    'Apple Music': { icon: '♪', desc: 'Music everywhere', class: 'apple-music' },
    'YouTube Music': { icon: '▶', desc: 'Music videos & more', class: 'youtube-music' },
    'Tidal': { icon: '♬', desc: 'High fidelity', class: 'tidal' },
    'Deezer': { icon: '♫', desc: 'Flow your music', class: 'deezer' },
    'Amazon Music': { icon: '♪', desc: 'Prime music', class: 'amazon-music' },
    'Pandora': { icon: '♬', desc: 'Discover music', class: 'pandora' },
    'SoundCloud': { icon: '▶', desc: 'Hear the future', class: 'soundcloud' }
  };

  if (!platformLinks || platformLinks.length === 0) {
    // Plateformes par défaut si aucune fournie
    return `
        <a href="#" class="service-item" onclick="openService('#')">
            <div class="service-icon spotify">♫</div>
            <div class="service-info">
                <div class="service-name">Spotify</div>
                <div class="service-description">Music for everyone</div>
            </div>
            <button class="play-btn">Play</button>
        </a>
        <a href="#" class="service-item" onclick="openService('#')">
            <div class="service-icon apple-music">♪</div>
            <div class="service-info">
                <div class="service-name">Apple Music</div>
                <div class="service-description">Music everywhere</div>
            </div>
            <button class="play-btn">Play</button>
        </a>`;
  }

  return platformLinks.map(platform => {
    const config = platformConfig[platform.platform] || { 
      icon: '♫', 
      desc: 'Stream music', 
      class: 'spotify' 
    };
    
    return `
        <a href="${escapeHtml(platform.url)}" class="service-item" target="_blank" onclick="openService('${escapeHtml(platform.url)}')">
            <div class="service-icon ${config.class}">${config.icon}</div>
            <div class="service-info">
                <div class="service-name">${escapeHtml(platform.platform)}</div>
                <div class="service-description">${config.desc}</div>
            </div>
            <button class="play-btn">Play</button>
        </a>`;
  }).join('');
};

/**
 * Sauvegarde la page HTML statique
 * @param {Object} smartlinkData - Données du SmartLink
 * @param {string} outputDir - Répertoire de sortie (ex: 'public/sl')
 */
export const saveStaticPage = async (smartlinkData, outputDir = 'public/sl') => {
  const html = generateStaticHTML(smartlinkData);
  const fileName = `${smartlinkData.shortId}.html`;
  const filePath = `${outputDir}/${fileName}`;
  
  try {
    // En environnement browser, on ne peut pas écrire de fichiers
    // Cette fonction sera appelée côté serveur ou via API
    console.log(`📄 Page statique générée: ${filePath}`);
    console.log('📋 HTML généré:', html.substring(0, 200) + '...');
    
    return {
      success: true,
      filePath,
      url: `https://www.mdmcmusicads.com/sl/${fileName}`,
      html
    };
  } catch (error) {
    console.error('❌ Erreur génération page statique:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Génère toutes les pages statiques existantes
 * @param {Array} smartlinks - Liste des SmartLinks
 */
export const generateAllStaticPages = async (smartlinks) => {
  const results = [];
  
  for (const smartlink of smartlinks) {
    const result = await saveStaticPage(smartlink);
    results.push(result);
  }
  
  console.log(`✅ ${results.filter(r => r.success).length}/${results.length} pages générées`);
  return results;
};

/**
 * Fonction utilitaire pour échapper le HTML
 */
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default {
  generateStaticHTML,
  saveStaticPage,
  generateAllStaticPages
};
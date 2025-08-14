// src/utils/staticPageGenerator.js
// Générateur de pages HTML statiques SmartLinks avec template utilisateur exact

/**
 * Génère une page HTML statique SmartLink complète
 * @param {Object} smartlinkData - Données du SmartLink
 * @returns {string} - HTML complet
 */
export const generateStaticHTML = (smartlinkData) => {
  const {
    trackTitle = 'Unknown Track',
    artistName = 'Unknown Artist',
    coverImageUrl = 'https://via.placeholder.com/300x300',
    shortId,
    customDescription,
    description,
    platformLinks = []
  } = smartlinkData;

  const title = `${trackTitle} - ${artistName}`;
  const desc = customDescription || description || `Écoutez '${trackTitle}' par ${artistName} sur votre plateforme préférée`;
  const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const trackSlug = trackTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const smartlinkUrl = `https://www.mdmcmusicads.com/smartlink/${artistSlug}/${trackSlug}.html`;
  
  // Générer les plateformes de streaming avec icônes
  const platformsHTML = generatePlatformsHTML(platformLinks, trackTitle, artistName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    
    <!-- OpenGraph Meta Tags -->
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${escapeHtml(coverImageUrl)}">
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${smartlinkUrl}">
    
    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="Écoutez sur votre plateforme préférée">
    <meta name="twitter:image" content="${escapeHtml(coverImageUrl)}">
    
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
            position: relative;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${escapeHtml(coverImageUrl)}');
            background-size: cover;
            background-position: center;
            filter: blur(40px) brightness(0.3);
            z-index: -2;
        }

        body::after {
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
            background-image: url('${escapeHtml(coverImageUrl)}');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .album-cover::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.2);
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
            z-index: 2;
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
            background-size: 24px 24px;
            background-repeat: no-repeat;
            background-position: center;
        }

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
    
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-P11JTJ21NZ"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-P11JTJ21NZ');
    </script>
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PFSK4LJZ');</script>
    
</head>
<body>
    
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PFSK4LJZ"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    

    <div class="music-card">
        <div class="album-container">
            <div class="album-cover">
                <div class="play-button" onclick="playPreview()">
                    <div class="play-icon"></div>
                </div>
            </div>
        </div>
        
        <h1 class="title">${escapeHtml(trackTitle)}</h1>
        <p class="subtitle">${escapeHtml(artistName)}</p>
        
        <div class="services-list">
            ${platformsHTML}
        </div>
    </div>

    <script>
        function playPreview() {
            console.log('Pas d\\'extrait audio disponible');
            const playBtn = document.querySelector('.play-button');
            playBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playBtn.style.transform = 'scale(1)';
            }, 150);
        }

        function trackClick(platform) {
            // Tracking des clics
            gtag('event', 'platform_click', {
                'platform': platform,
                'track_title': '${escapeHtml(trackTitle)}',
                'artist_name': '${escapeHtml(artistName)}'
            });
            
            console.log('Clic sur:', platform);
            
            // Animation de feedback
            const serviceItem = event.currentTarget;
            serviceItem.style.transform = 'scale(0.98)';
            setTimeout(() => {
                serviceItem.style.transform = 'translateY(-1px)';
            }, 100);
        }

        // Effets sonores et animations au survol
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
 * Génère le HTML des plateformes de streaming avec icônes officielles
 */
const generatePlatformsHTML = (platformLinks, trackTitle, artistName) => {
  const platformConfig = {
    'Spotify': { 
      desc: 'Music for everyone', 
      color: '#1DB954',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg'
    },
    'Apple Music': { 
      desc: 'Music everywhere', 
      color: 'linear-gradient(135deg, #FA233B, #FF6B35)',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applemusic.svg'
    },
    'YouTube Music': { 
      desc: 'Music videos & more', 
      color: '#FF0000',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtubemusic.svg'
    },
    'YouTube': { 
      desc: 'Music videos & more', 
      color: '#FF0000',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtubemusic.svg'
    },
    'Deezer': { 
      desc: 'Flow your music', 
      color: '#FEAA2D',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/deezer.svg'
    },
    'Tidal': { 
      desc: 'High fidelity', 
      color: '#000000',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tidal.svg'
    },
    'Amazon Music': { 
      desc: 'Prime music', 
      color: '#00A8E1',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonmusic.svg'
    },
    'SoundCloud': { 
      desc: 'Hear the future', 
      color: '#FF5500',
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/soundcloud.svg'
    }
  };

  if (!platformLinks || platformLinks.length === 0) {
    // Plateformes par défaut si aucune fournie
    return `
        <a href="#" class="service-item" onclick="trackClick('Spotify')">
            <div class="service-icon" style="background: #1DB954; background-image: url('https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg'); filter: brightness(0) invert(1);">
            </div>
            <div class="service-info">
                <div class="service-name">Spotify</div>
                <div class="service-description">Music for everyone</div>
            </div>
            <button class="play-btn">Play</button>
        </a>
        <a href="#" class="service-item" onclick="trackClick('Apple Music')">
            <div class="service-icon" style="background: linear-gradient(135deg, #FA233B, #FF6B35); background-image: url('https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applemusic.svg'); filter: brightness(0) invert(1);">
            </div>
            <div class="service-info">
                <div class="service-name">Apple Music</div>
                <div class="service-description">Music everywhere</div>
            </div>
            <button class="play-btn">Play</button>
        </a>`;
  }

  return platformLinks.map(platform => {
    const platformName = platform.platform || platform.name || 'Unknown';
    const config = platformConfig[platformName] || { 
      desc: 'Stream music', 
      color: '#666666',
      icon: ''
    };
    
    return `
                <a href="${escapeHtml(platform.url)}" target="_blank" class="service-item" onclick="trackClick('${escapeHtml(platformName)}')">
                    <div class="service-icon" style="background: ${config.color}; background-image: url('${config.icon}'); filter: brightness(0) invert(1);">
                    </div>
                    <div class="service-info">
                        <div class="service-name">${escapeHtml(platformName)}</div>
                        <div class="service-description">${config.desc}</div>
                    </div>
                    <button class="play-btn">Play</button>
                </a>`;
  }).join('');
};

/**
 * Fonction utilitaire pour échapper le HTML
 */
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default {
  generateStaticHTML
};
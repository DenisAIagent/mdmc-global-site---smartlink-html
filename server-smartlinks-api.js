// server-smartlinks-api.js - API pour SmartLinks HTML
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import du mapping strict des pictos plateformes
const PLATFORM_ICONS = {
  'Spotify': '/pictos plateformes/picto_spotify.png',
  'Apple Music': '/pictos plateformes/picto_applemusic.png',
  'YouTube Music': '/pictos plateformes/picto_youtubemusic.png',
  'YouTube': '/pictos plateformes/picto_youtube.png',
  'Deezer': '/pictos plateformes/picto_deezer.png',
  'Amazon Music': '/pictos plateformes/picto_amazonmusic.png',
  'Tidal': '/pictos plateformes/picto_tidal.png',
  'SoundCloud': '/pictos plateformes/picto_soundcloud.png'
};

const SMARTLINKS_DB_FILE = path.join(__dirname, 'smartlinks-html.json');

function readSmartLinksDB() {
    try {
        if (!fs.existsSync(SMARTLINKS_DB_FILE)) {
            fs.writeFileSync(SMARTLINKS_DB_FILE, '[]');
        }
        const data = fs.readFileSync(SMARTLINKS_DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture SmartLinks DB:', error);
        return [];
    }
}

function writeSmartLinksDB(data) {
    try {
        fs.writeFileSync(SMARTLINKS_DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erreur écriture SmartLinks DB:', error);
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateStaticSmartLinkHTML(smartlink) {
    // Générer les liens des plateformes avec validation stricte
    const platformLinks = smartlink.platformLinks && smartlink.platformLinks.length > 0 
        ? smartlink.platformLinks.filter(link => PLATFORM_ICONS[link.platform]) // Filtrer uniquement les plateformes supportées
        : [];

    // Générer le HTML des plateformes avec filtrage strict
    const platformsHTML = platformLinks.map(link => {
        const platformColors = {
            'Spotify': '#1DB954',
            'Apple Music': 'linear-gradient(135deg, #FA233B, #FF6B35)',
            'YouTube Music': '#FF0000',
            'Deezer': '#FEAA2D',
            'Amazon Music': '#FF9900',
            'Tidal': '#000000',
            'SoundCloud': '#ff5500'
        };

        const platformDescriptions = {
            'Spotify': 'Music for everyone',
            'Apple Music': 'Music everywhere',
            'YouTube Music': 'Music videos & more',
            'Deezer': 'Flow your music',
            'Amazon Music': 'Prime music',
            'Tidal': 'High fidelity',
            'SoundCloud': 'Discover music'
        };

        const color = platformColors[link.platform] || '#333';
        const description = platformDescriptions[link.platform] || 'Music platform';
        
        // Utiliser UNIQUEMENT les pictos locaux - aucun fallback
        const iconUrl = PLATFORM_ICONS[link.platform];
        if (!iconUrl) {
            console.warn(`⚠️ Plateforme non supportée: ${link.platform} - ignorée`);
            return ''; // Ne pas afficher la plateforme si pas de picto local
        }

        return `
                <a href="${link.url}" target="_blank" class="service-item" onclick="trackClick('${link.platform}')">
                    <div class="service-icon" style="background: ${color}; background-image: url('${iconUrl}'); filter: brightness(0) invert(1);">
                    </div>
                    <div class="service-info">
                        <div class="service-name">${link.platform}</div>
                        <div class="service-description">${description}</div>
                    </div>
                    <button class="play-btn">Play</button>
                </a>`;
    }).filter(html => html.length > 0).join(''); // Supprimer les éléments vides

    const artworkUrl = smartlink.artworkUrl || 'https://via.placeholder.com/300x300/8B0000/FFFFFF?text=No+Artwork';
    const previewUrl = smartlink.previewUrl || null;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${smartlink.trackTitle || 'Track'} - ${smartlink.artistName || 'Artist'}</title>
    
    <!-- OpenGraph Meta Tags -->
    <meta property="og:title" content="${smartlink.trackTitle || 'Track'} - ${smartlink.artistName || 'Artist'}">
    <meta property="og:description" content="Écoutez '${smartlink.trackTitle || 'Track'}' par ${smartlink.artistName || 'Artist'} sur votre plateforme préférée">
    <meta property="og:image" content="${artworkUrl}">
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${smartlink.publicUrl || ''}">
    
    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${smartlink.trackTitle || 'Track'} - ${smartlink.artistName || 'Artist'}">
    <meta name="twitter:description" content="Écoutez sur votre plateforme préférée">
    <meta name="twitter:image" content="${artworkUrl}">
    
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
            background-image: url('${artworkUrl}');
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
            background-image: url('${artworkUrl}');
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

        .audio-player {
            position: absolute;
            opacity: 0;
            pointer-events: none;
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
    <script async src="https://www.googletagmanager.com/gtag/js?id=g-1234578"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'g-1234578');
    </script>
    
    
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTP-12345TEST');</script>
</head>
<body>
    
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTP-12345TEST"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    

    <div class="music-card">
        <div class="album-container">
            <div class="album-cover">
                <div class="play-button" onclick="playPreview()">
                    <div class="play-icon"></div>
                </div>
            </div>
        </div>
        
        <h1 class="title">${smartlink.trackTitle || 'Track'}</h1>
        <p class="subtitle">${smartlink.artistName || 'Artist'}</p>
        
        <div class="services-list">
            ${platformsHTML}
        </div>
        
        ${previewUrl ? `<audio class="audio-player" id="audioPlayer" preload="metadata">
            <source src="${previewUrl}" type="audio/mpeg">
        </audio>` : ''}
    </div>

    <script>
        let audioPlayer = null;
        let isPlaying = false;

        function playPreview() {
            ${previewUrl ? `
            audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                if (isPlaying) {
                    audioPlayer.pause();
                    isPlaying = false;
                } else {
                    audioPlayer.play();
                    isPlaying = true;
                }
            }
            ` : `
            console.log('Pas d\\'extrait audio disponible');
            `}
            const playBtn = document.querySelector('.play-button');
            playBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playBtn.style.transform = 'scale(1)';
            }, 150);
        }

        function trackClick(platform) {
            // Tracking des clics
            ${smartlink.trackingId ? `
            gtag('event', 'platform_click', {
                'platform': platform,
                'track_title': '${smartlink.trackTitle || 'Track'}',
                'artist_name': '${smartlink.artistName || 'Artist'}'
            });
            ` : ''}
            
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
}

export { generateStaticSmartLinkHTML };

export function addSmartLinksApiRoutes(app) {
    // Parser JSON pour les routes API
    app.use('/api/smartlinks', (req, res, next) => {
        if (req.method === 'POST' || req.method === 'PUT') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    req.body = JSON.parse(body);
                } catch (error) {
                    req.body = {};
                }
                next();
            });
        } else {
            next();
        }
    });

    // GET /api/smartlinks - Lister SmartLinks
    app.get('/api/smartlinks', (req, res) => {
        const smartlinks = readSmartLinksDB();
        res.json({
            success: true,
            data: smartlinks
        });
    });

    // POST /api/smartlinks - Créer SmartLink
    app.post('/api/smartlinks', (req, res) => {
        try {
            const smartlinks = readSmartLinksDB();
            const newSmartLink = {
                _id: generateId(),
                ...req.body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: 0,
                platformClickCount: 0
            };

            smartlinks.push(newSmartLink);
            
            if (writeSmartLinksDB(smartlinks)) {
                // Générer la page HTML statique
                const filename = `${newSmartLink.artistSlug}-${newSmartLink.trackSlug}.html`;
                const staticHtml = generateStaticSmartLinkHTML(newSmartLink);
                const staticPath = path.join(__dirname, 'public', 'sl', filename);
                
                // Créer le dossier sl s'il n'existe pas
                const slDir = path.join(__dirname, 'public', 'sl');
                if (!fs.existsSync(slDir)) {
                    fs.mkdirSync(slDir, { recursive: true });
                }
                
                fs.writeFileSync(staticPath, staticHtml, 'utf8');
                
                console.log(`✅ SmartLink HTML créé: ${newSmartLink.trackTitle} - ${filename}`);
                res.json({
                    success: true,
                    data: newSmartLink
                });
            } else {
                throw new Error('Erreur sauvegarde');
            }
        } catch (error) {
            console.error('Erreur création SmartLink:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // DELETE /api/smartlinks/:id - Supprimer SmartLink
    app.delete('/api/smartlinks/:id', (req, res) => {
        try {
            const smartlinks = readSmartLinksDB();
            const smartlinkToDelete = smartlinks.find(sl => sl._id === req.params.id);
            const filteredSmartlinks = smartlinks.filter(sl => sl._id !== req.params.id);
            
            if (filteredSmartlinks.length < smartlinks.length) {
                writeSmartLinksDB(filteredSmartlinks);
                
                // Supprimer le fichier HTML statique
                if (smartlinkToDelete && smartlinkToDelete.artistSlug && smartlinkToDelete.trackSlug) {
                    const filename = `${smartlinkToDelete.artistSlug}-${smartlinkToDelete.trackSlug}.html`;
                    const staticPath = path.join(__dirname, 'public', 'sl', filename);
                    if (fs.existsSync(staticPath)) {
                        fs.unlinkSync(staticPath);
                    }
                }
                
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, error: 'SmartLink non trouvé' });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    console.log('✅ Routes API SmartLinks ajoutées');
}
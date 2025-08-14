// server-smartlinks-api.js - API et générateur HTML pour SmartLinks
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping strict des plateformes et de leurs icônes locales
const PLATFORM_CONFIG = {
  'spotify':      { name: 'Spotify',       icon: '/pictos plateformes/picto_spotify.png',       color: '#1DB954', description: 'Music for everyone' },
  'appleMusic':   { name: 'Apple Music',   icon: '/pictos plateformes/picto_applemusic.png',    color: 'linear-gradient(135deg, #FA233B, #FF6B35)', description: 'Music everywhere' },
  'youtubeMusic': { name: 'YouTube Music', icon: '/pictos plateformes/picto_youtubemusic.png',  color: '#FF0000', description: 'Music videos & more' },
  'youtube':      { name: 'YouTube',       icon: '/pictos plateformes/picto_youtube.png',       color: '#FF0000', description: 'Videos and more' },
  'deezer':       { name: 'Deezer',        icon: '/pictos plateformes/picto_deezer.png',        color: '#FEAA2D', description: 'Flow your music' },
  'amazonMusic':  { name: 'Amazon Music',  icon: '/pictos plateformes/picto_amazonmusic.png',   color: '#FF9900', description: 'Prime music' },
  'tidal':        { name: 'Tidal',         icon: '/pictos plateformes/picto_tidal.png',         color: '#000000', description: 'High fidelity' },
  'soundcloud':   { name: 'SoundCloud',    icon: '/pictos plateformes/picto_soundcloud.png',    color: '#ff5500', description: 'Discover music' }
};

const SMARTLINKS_DB_FILE = path.join(__dirname, 'smartlinks-db.json');

export function readSmartLinksDB() {
    try {
        if (!fs.existsSync(SMARTLINKS_DB_FILE)) {
            fs.writeFileSync(SMARTLINKS_DB_FILE, '[]', 'utf8');
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
        fs.writeFileSync(SMARTLINKS_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erreur écriture SmartLinks DB:', error);
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function generateStaticSmartLinkHTML(smartlink) {
    const platformLinks = smartlink.platformLinks?.filter(link => PLATFORM_CONFIG[link.platform]) || [];

    const platformsHTML = platformLinks.map(link => {
        const config = PLATFORM_CONFIG[link.platform];
        return `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="service-item" onclick="trackClick('${config.name}')">
                <div class="service-icon" style="background: ${config.color}; background-image: url('${config.icon}'); filter: brightness(0) invert(1);"></div>
                <div class="service-info">
                    <div class="service-name">${config.name}</div>
                    <div class="service-description">${config.description}</div>
                </div>
                <div class="play-arrow">→</div>
            </a>`;
    }).join('');

    const artworkUrl = smartlink.artworkUrl || 'https://via.placeholder.com/300/8B0000/FFFFFF?text=No+Artwork';
    const previewUrl = smartlink.previewUrl || null;
    const trackTitle = smartlink.trackTitle || 'Titre inconnu';
    const artistName = smartlink.artistName || 'Artiste inconnu';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${trackTitle} - ${artistName}</title>
    <meta property="og:title" content="${trackTitle} - ${artistName}">
    <meta property="og:description" content="Écoutez '${trackTitle}' par ${artistName} sur votre plateforme préférée.">
    <meta property="og:image" content="${artworkUrl}">
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${smartlink.publicUrl || ''}">
    <meta name="twitter:card" content="summary_large_image">
    <style>
        /* ... (votre CSS existant est bon, pas besoin de le changer ) ... */
        /* J'ajoute juste les styles pour l'icône play/pause et la flèche */
        .play-icon.playing { border: 0; width: 12px; height: 14px; border-left: 4px solid #333; border-right: 4px solid #333; margin-left: 0; }
        .play-arrow { font-size: 24px; color: #c7c7cc; transition: transform 0.2s ease; }
        .service-item:hover .play-arrow { transform: translateX(5px); }
    </style>
</head>
<body>
    <!-- ... (structure HTML principale, je la garde car elle est bien faite) ... -->
    <div class="music-card">
        <div class="album-container">
            <div class="album-cover" style="background-image: url('${artworkUrl}');" role="img" aria-label="Pochette de l'album ${trackTitle}">
                ${previewUrl ? `<div class="play-button" onclick="togglePreview()" role="button" aria-label="Lancer l'aperçu audio"><div class="play-icon"></div></div>` : ''}
            </div>
        </div>
        <h1 class="title">${trackTitle}</h1>
        <p class="subtitle">${artistName}</p>
        <div class="services-list">${platformsHTML}</div>
        ${previewUrl ? `<audio id="audio-preview" src="${previewUrl}" preload="metadata"></audio>` : ''}
    </div>
    <script>
        const audioPlayer = document.getElementById('audio-preview');
        const playButton = document.querySelector('.play-button');
        const playIcon = playButton ? playButton.querySelector('.play-icon') : null;

        function togglePreview() {
            if (!audioPlayer || !playIcon) return;
            if (audioPlayer.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.pause();
            }
        }
        if (audioPlayer) {
            audioPlayer.onplay = () => playIcon.classList.add('playing');
            audioPlayer.onpause = () => playIcon.classList.remove('playing');
            audioPlayer.onended = () => {
                playIcon.classList.remove('playing');
                audioPlayer.currentTime = 0;
            };
        }
        function trackClick(platform) {
            if (typeof gtag === 'function') {
                gtag('event', 'platform_click', { 'platform': platform, 'track_title': '${trackTitle}', 'artist_name': '${artistName}' });
            }
        }
    </script>
</body>
</html>`;
}

export function addSmartLinksApiRoutes(app) {
    app.post('/api/smartlinks', (req, res) => {
        const smartlinks = readSmartLinksDB();
        const newSmartLink = {
            id: generateId(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        smartlinks.push(newSmartLink);
        if (writeSmartLinksDB(smartlinks)) {
            res.status(201).json(newSmartLink);
        } else {
            res.status(500).json({ error: 'Erreur lors de la sauvegarde du SmartLink.' });
        }
    });

    app.get('/api/smartlinks', (req, res) => {
        const smartlinks = readSmartLinksDB();
        res.json(smartlinks);
    });
}

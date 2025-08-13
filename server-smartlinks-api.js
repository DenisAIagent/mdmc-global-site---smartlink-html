// server-smartlinks-api.js - API pour SmartLinks HTML
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${smartlink.trackTitle} - ${smartlink.artistName}</title>
    
    <!-- Meta tags pour partage social -->
    <meta property="og:title" content="${smartlink.trackTitle} - ${smartlink.artistName}">
    <meta property="og:description" content="Écoutez ${smartlink.trackTitle} de ${smartlink.artistName} sur toutes les plateformes">
    <meta property="og:image" content="${smartlink.artworkUrl || '/assets/images/default-artwork.jpg'}">
    <meta property="og:type" content="music.song">
    <meta property="og:url" content="${smartlink.publicUrl || ''}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${smartlink.trackTitle} - ${smartlink.artistName}">
    <meta name="twitter:description" content="Écoutez ${smartlink.trackTitle} de ${smartlink.artistName} sur toutes les plateformes">
    <meta name="twitter:image" content="${smartlink.artworkUrl || '/assets/images/default-artwork.jpg'}">
    
    <link rel="icon" href="/assets/images/favicon.png" type="image/png">
    
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .smartlink-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            max-width: 500px;
            width: 100%;
            text-align: center;
            position: relative;
        }
        
        .artwork {
            width: 220px;
            height: 220px;
            border-radius: 15px;
            margin: 0 auto 25px;
            object-fit: cover;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        
        .artwork:hover {
            transform: scale(1.05);
        }
        
        h1 { 
            color: #333; 
            margin-bottom: 10px; 
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
        }
        
        .artist { 
            color: #666; 
            margin-bottom: 35px; 
            font-size: 20px;
            font-weight: 500;
        }
        
        .platforms {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .platform-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px 25px;
            border-radius: 12px;
            text-decoration: none;
            color: white;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            gap: 15px;
            position: relative;
            overflow: hidden;
        }
        
        .platform-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .platform-button:active {
            transform: translateY(-1px);
        }
        
        .spotify { background: linear-gradient(135deg, #1DB954, #1ed760); }
        .apple { background: linear-gradient(135deg, #000, #333); }
        .youtube { background: linear-gradient(135deg, #FF0000, #cc0000); }
        .deezer { background: linear-gradient(135deg, #FEAA2D, #ff8800); }
        .amazon { background: linear-gradient(135deg, #FF9900, #ff7700); }
        .tidal { background: linear-gradient(135deg, #000, #1a1a1a); }
        .soundcloud { background: linear-gradient(135deg, #ff5500, #ff3300); }
        
        .powered-by {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 14px;
        }
        
        .powered-by a {
            color: #E50914;
            text-decoration: none;
            font-weight: 600;
        }
        
        @media (max-width: 480px) {
            .smartlink-container {
                padding: 30px 20px;
                margin: 10px;
            }
            
            .artwork {
                width: 180px;
                height: 180px;
            }
            
            h1 {
                font-size: 24px;
            }
            
            .artist {
                font-size: 18px;
            }
            
            .platform-button {
                padding: 15px 20px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="smartlink-container">
        <img src="${smartlink.artworkUrl || '/assets/images/default-artwork.jpg'}" 
             alt="${smartlink.trackTitle}" 
             class="artwork"
             onerror="this.src='/assets/images/default-artwork.jpg'">
             
        <h1>${smartlink.trackTitle || 'Titre non disponible'}</h1>
        <div class="artist">${smartlink.artistName || 'Artiste non disponible'}</div>
        
        <div class="platforms">
            ${smartlink.platformLinks ? Object.entries(smartlink.platformLinks)
                .filter(([platform, url]) => url && url.trim())
                .map(([platform, url]) => {
                    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                    return `
                        <a href="${url}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="platform-button ${platform.toLowerCase()}"
                           onclick="trackClick('${platform}')">
                            <span>Écouter sur ${platformName}</span>
                        </a>
                    `;
                }).join('') : 
                '<p style="color: #666; font-style: italic;">Aucune plateforme disponible</p>'
            }
        </div>
        
        <div class="powered-by">
            Créé avec <a href="https://mdmcmusicads.com" target="_blank">MDMC Music Ads</a>
        </div>
    </div>
    
    <script>
        function trackClick(platform) {
            console.log('Clic sur plateforme:', platform);
        }
        
        window.addEventListener('load', function() {
            console.log('SmartLink ${smartlink.trackTitle} chargé');
        });
    </script>
</body>
</html>`;
}

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
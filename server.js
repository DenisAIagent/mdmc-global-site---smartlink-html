// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
// Importer les fonctions nécessaires depuis le module API
import { addSmartLinksApiRoutes, generateStaticSmartLinkHTML, readSmartLinksDB } from './server-smartlinks-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques (CSS, JS, images du dossier public)
app.use(express.static(path.join(__dirname, 'public')));

// Ajouter les routes de l'API pour créer/lister les smartlinks (/api/smartlinks)
addSmartLinksApiRoutes(app);

// Route proxy pour l'API Odesli/Songlink afin d'éviter les problèmes de CORS
app.get('/api/proxy/fetch-metadata', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'Une URL de service de streaming est requise.' });
    }

    // Pensez à mettre votre clé API dans une variable d'environnement en production
    const apiKey = process.env.SONGLINK_API_KEY;
    const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url )}&userCountry=US${apiKey ? `&key=${apiKey}` : ''}`;

    try {
        const response = await fetch(apiUrl);
        
        // **CORRECTION PRINCIPALE : VÉRIFICATION DU TYPE DE CONTENU**
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // La réponse est bien du JSON, on peut la traiter
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            // La réponse n'est PAS du JSON (probablement une page d'erreur HTML)
            const textResponse = await response.text();
            console.error('Erreur API Odesli: La réponse n\'était pas du JSON.', textResponse);
            res.status(502).json({ 
                error: 'Échec de la récupération des métadonnées depuis l\'API externe.',
                message: 'L\'API externe a renvoyé une réponse inattendue. Le lien est peut-être invalide ou l\'API rencontre des difficultés.'
            });
        }

    } catch (error) {
        console.error('Erreur du proxy de fetch:', error);
        res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des métadonnées.' });
    }
});

// Route pour afficher une page smartlink générée statiquement
app.get('/link/:id', (req, res) => {
    const { id } = req.params;
    const smartlinks = readSmartLinksDB();
    const smartlinkData = smartlinks.find(link => link.id === id);

    if (smartlinkData) {
        // Générer le HTML et l'envoyer
        const html = generateStaticSmartLinkHTML(smartlinkData);
        res.send(html);
    } else {
        // Si non trouvé, envoyer une page 404
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// Route principale pour servir votre application frontend (le tableau de bord)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur http://localhost:${PORT}` );
});

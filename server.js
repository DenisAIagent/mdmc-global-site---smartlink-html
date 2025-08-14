// server.js - Version corrigée pour le déploiement
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { addSmartLinksApiRoutes, generateStaticSmartLinkHTML, readSmartLinksDB } from './server-smartlinks-api.js';

// Configuration plus robuste des chemins pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Définir le chemin vers le dossier 'public' (qui contient votre app React/Vite)
const publicPath = path.join(__dirname, 'public');

// Servir les fichiers statiques (CSS, JS, images) depuis le dossier 'public'
app.use(express.static(publicPath));

// Ajouter les routes de l'API pour les smartlinks (/api/smartlinks)
addSmartLinksApiRoutes(app);

// Route proxy pour l'API Odesli/Songlink
app.get('/api/proxy/fetch-metadata', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'Une URL de service de streaming est requise.' });
    }
    const apiKey = process.env.SONGLINK_API_KEY;
    const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url )}&userCountry=US${apiKey ? `&key=${apiKey}` : ''}`;

    try {
        const response = await fetch(apiUrl);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            const textResponse = await response.text();
            console.error('Erreur API Odesli: La réponse n\'était pas du JSON.', textResponse);
            res.status(502).json({ 
                error: 'Échec de la récupération des métadonnées.',
                message: 'L\'API externe a renvoyé une réponse inattendue.'
            });
        }
    } catch (error) {
        console.error('Erreur du proxy de fetch:', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// **NOUVEAU : Route de Healthcheck pour Railway**
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Route pour afficher une page smartlink générée
app.get('/link/:id', (req, res) => {
    const { id } = req.params;
    const smartlinks = readSmartLinksDB();
    const smartlinkData = smartlinks.find(link => link.id === id);

    if (smartlinkData) {
        const html = generateStaticSmartLinkHTML(smartlinkData);
        res.send(html);
    } else {
        res.status(404).sendFile(path.join(publicPath, '404.html'));
    }
});

// Route "catch-all" pour servir l'application React/Vite sur toutes les autres URL
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Le serveur est lancé et écoute sur le port ${PORT}`);
});

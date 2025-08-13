import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { addSmartLinksApiRoutes } from './server-smartlinks-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration pour servir les fichiers statiques depuis le dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

// Configuration des headers de sécurité et cache
app.use((req, res, next) => {
  // Headers de sécurité
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' blob: data: https: https://res.cloudinary.com; connect-src 'self' https://api.mdmcmusicads.com;"
  );
  
  // Cache pour les assets statiques
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  next();
});

// Health check endpoint pour Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Ajouter les routes API pour SmartLinks
addSmartLinksApiRoutes(app);

// CORS Proxy pour Odesli API (contournement direct)
app.get('/api/proxy/fetch-metadata', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    console.log(`🔄 Direct Odesli request for: ${url}`);
    
    // Appel direct à l'API Odesli publique (pas d'authentification requise)
    const odesliUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(odesliUrl);
    
    if (!response.ok) {
      throw new Error(`Odesli API error: ${response.status} ${response.statusText}`);
    }
    
    const odesliData = await response.json();
    
    // Formater la réponse pour correspondre au format attendu par le frontend
    if (odesliData && odesliData.linksByPlatform) {
      console.log(`✅ Odesli success: ${Object.keys(odesliData.linksByPlatform).length} platforms found`);
      
      res.json({
        success: true,
        data: odesliData
      });
    } else {
      throw new Error('No platform links found in Odesli response');
    }
    
  } catch (error) {
    console.error('❌ Odesli proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch metadata from Odesli',
      details: error.message 
    });
  }
});

// Routes pour admin HTML (avant le catch-all React)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

app.get('/admin/*', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
    }
  });
});

// Route pour servir les pages statiques SmartLinks
app.get('/sl/:shortId.html', (req, res) => {
  const { shortId } = req.params;
  const staticPagePath = path.join(__dirname, 'public', 'sl', `${shortId}.html`);
  
  console.log(`📄 Serving static SmartLink page: /sl/${shortId}.html`);
  
  // Vérifier si la page statique existe
  if (fs.existsSync(staticPagePath)) {
    console.log(`✅ Static page found: ${staticPagePath}`);
    res.sendFile(staticPagePath);
  } else {
    console.log(`❌ Static page not found: ${staticPagePath}`);
    // Fallback vers l'application React
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Route catch-all pour l'application React (SPA routing)
app.get('*', (req, res) => {
  console.log(`📄 Serving React app for: ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📄 Static SmartLinks: /sl/{shortId}.html`);
  console.log(`🔍 React app: /#/smartlinks/artist/track`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('💤 Server shutting down gracefully...');
  process.exit(0);
});

export default app;
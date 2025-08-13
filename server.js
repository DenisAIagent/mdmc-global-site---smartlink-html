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

// CORS Proxy pour login admin
app.use(express.json()); // Assurer que le body est parsé
app.post('/api/proxy/login', async (req, res) => {
  try {
    console.log(`🔄 Proxying admin login`);
    console.log(`📝 Request body:`, req.body);
    
    const loginUrl = 'https://api.mdmcmusicads.com/api/v1/auth/login';
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    console.log(`🌐 Backend response status:`, response.status);
    console.log(`🌐 Backend response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📄 Raw backend response:`, responseText.substring(0, 200));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(`❌ JSON parsing failed:`, jsonError);
      console.error(`📄 Full response text:`, responseText);
      throw new Error(`Backend returned non-JSON response: ${responseText.substring(0, 100)}`);
    }
    
    console.log(`✅ Login response:`, response.status, data.success ? 'Success' : 'Failed');
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Login proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Proxy login failed',
      details: error.message 
    });
  }
});

// CORS Proxy pour upload audio (multipart/form-data)
app.post('/api/upload/audio', (req, res) => {
  console.log(`🔄 Proxying audio upload`);
  console.log(`📝 Request headers:`, req.headers);
  
  const backendUrl = 'https://api.mdmcmusicads.com/api/v1/upload/audio';
  const adminToken = req.headers['authorization'] || req.headers['x-admin-token'];
  
  // Préparer les headers pour le backend
  const headers = {};
  
  // Transférer Content-Type (multipart/form-data avec boundary)
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }
  
  // Ajouter l'authentification
  if (adminToken) {
    headers['Authorization'] = adminToken.startsWith('Bearer ') ? adminToken : `Bearer ${adminToken}`;
    console.log(`🔑 Adding admin token to upload request`);
  } else {
    console.warn(`⚠️ No admin token found in upload request`);
  }
  
  // Créer une requête proxy directe en streaming
  const https = require('https');
  const { URL } = require('url');
  const backendURL = new URL(backendUrl);
  
  const options = {
    hostname: backendURL.hostname,
    port: backendURL.port || 443,
    path: backendURL.pathname,
    method: 'POST',
    headers: headers
  };
  
  const proxyReq = https.request(options, (proxyRes) => {
    console.log(`✅ Backend upload response status:`, proxyRes.statusCode);
    
    // Transférer les headers de réponse
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Transférer le body de réponse
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (error) => {
    console.error('❌ Audio upload proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload proxy failed',
      details: error.message
    });
  });
  
  // Transférer le body de la requête (FormData) directement
  req.pipe(proxyReq);
});

// CORS Proxy pour suppression audio
app.delete('/api/upload/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    console.log(`🔄 Proxying audio deletion: ${filename}`);
    
    const backendUrl = `https://api.mdmcmusicads.com/api/v1/upload/audio/${filename}`;
    const adminToken = req.headers['authorization'] || req.headers['x-admin-token'];
    
    const headers = {};
    
    if (adminToken) {
      headers['Authorization'] = adminToken.startsWith('Bearer ') ? adminToken : `Bearer ${adminToken}`;
    }
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers
    });
    
    const data = await response.json();
    
    console.log(`✅ Audio deletion response:`, response.status, data.success ? 'Success' : 'Failed');
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Audio deletion proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Audio deletion failed',
      details: error.message 
    });
  }
});

// CORS Proxy pour création SmartLink
app.post('/api/proxy/create-smartlink', async (req, res) => {
  try {
    console.log(`🔄 Proxying SmartLink creation`);
    
    // Essayer d'abord un endpoint public temporaire, puis l'endpoint protégé
    let backendUrl = 'https://api.mdmcmusicads.com/api/public/smartlinks/create';
    let useAuth = false;
    
    // Si pas d'endpoint public, utiliser l'endpoint protégé
    const testResponse = await fetch(backendUrl, { method: 'HEAD' }).catch(() => null);
    if (!testResponse || !testResponse.ok) {
      backendUrl = 'https://api.mdmcmusicads.com/api/v1/smartlinks';
      useAuth = true;
    }
    
    // Récupérer le token admin depuis les en-têtes (priorité à Authorization)
    const adminToken = req.headers['authorization'] || req.headers['x-admin-token'];
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter l'authentification seulement si nécessaire et token disponible
    if (useAuth && adminToken) {
      // Si le token a déjà le préfixe Bearer, l'utiliser tel quel
      headers['Authorization'] = adminToken.startsWith('Bearer ') ? adminToken : `Bearer ${adminToken}`;
      console.log('🔑 Using admin token for authentication');
    } else if (useAuth) {
      console.warn('⚠️ Authentication required but no token provided');
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    console.log(`✅ SmartLink creation response:`, response.status, data.success ? 'Success' : 'Failed');
    
    // Transférer le status code et les données
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ SmartLink creation proxy error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Proxy creation failed',
      details: error.message 
    });
  }
});

// Routes pour admin HTML (avant le catch-all React)
app.get('/admin', (req, res) => {
  const adminPath = path.join(__dirname, 'public/admin/index.html');
  console.log(`📄 Serving admin page: ${adminPath}`);
  console.log(`📁 File exists: ${fs.existsSync(adminPath)}`);
  
  // Forcer pas de cache pour admin
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  res.sendFile(adminPath);
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
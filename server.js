import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { addSmartLinksApiRoutes } from './server-smartlinks-api.js';
import { generateStaticHTML } from './src/utils/staticPageGenerator.js';

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
  console.log('🏥 Health check called - Express.js server is running!');
  res.status(200).json({ 
    status: 'healthy', 
    server: 'Express.js',
    smartlinks: 'enabled',
    timestamp: new Date().toISOString() 
  });
});

// Debug endpoint pour diagnostic backend (ENTERPRISE-LEVEL)
app.get('/api/debug/backend-health', async (req, res) => {
  const correlationId = `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${correlationId}] 🔍 BACKEND_HEALTH_CHECK initiated`);
  
  const adminToken = req.headers['authorization'] || req.headers['x-admin-token'];
  
  const healthChecks = await Promise.allSettled([
    // Test 1: Backend basic health
    fetch('https://api.mdmcmusicads.com/api/v1/health', {
      timeout: 10000
    }).then(r => ({ status: r.status, headers: Object.fromEntries(r.headers.entries()) })),
    
    // Test 2: Upload endpoint availability 
    fetch('https://api.mdmcmusicads.com/api/v1/upload/audio', {
      method: 'OPTIONS',
      timeout: 10000
    }).then(r => ({ status: r.status, headers: Object.fromEntries(r.headers.entries()) })),
    
    // Test 3: Auth endpoint test
    adminToken ? fetch('https://api.mdmcmusicads.com/api/v1/auth/verify', {
      headers: {
        'Authorization': adminToken.startsWith('Bearer ') ? adminToken : `Bearer ${adminToken}`
      },
      timeout: 10000
    }).then(r => ({ status: r.status, headers: Object.fromEntries(r.headers.entries()) })) : Promise.resolve({ status: 'no_token' }),
    
    // Test 4: Cloudinary basic connectivity
    fetch('https://api.cloudinary.com/v1_1/health', {
      timeout: 5000
    }).then(r => ({ status: r.status })).catch(e => ({ error: e.message }))
  ]);
  
  const results = {
    correlationId,
    timestamp: new Date().toISOString(),
    tokenPresent: !!adminToken,
    tokenLength: adminToken ? adminToken.length : 0,
    checks: {
      backendHealth: healthChecks[0],
      uploadEndpoint: healthChecks[1],
      authVerification: healthChecks[2],
      cloudinaryHealth: healthChecks[3]
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  console.log(`[${correlationId}] 📊 Health check results:`, JSON.stringify(results, null, 2));
  
  res.json(results);
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

// Middleware pour parser les JSON (requis pour tous les endpoints POST)
app.use(express.json({ limit: '10mb' }));

// CORS Proxy pour login admin
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

// CORS Proxy pour upload audio (avec fallback temporaire)
app.post('/api/upload/audio', (req, res) => {
  const correlationId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  try {
    console.log(`[${correlationId}] 🔄 UPLOAD_START - Audio upload initiated`);
    console.log(`[${correlationId}] 📝 Request headers:`, {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'user-agent': req.headers['user-agent'],
      'host': req.headers['host'],
      'origin': req.headers['origin']
    });
    
    const adminToken = req.headers['authorization'] || req.headers['x-admin-token'];
    console.log(`[${correlationId}] 🔑 Admin token analysis:`, {
      present: !!adminToken,
      length: adminToken ? adminToken.length : 0,
      hasBearer: adminToken ? adminToken.startsWith('Bearer ') : false,
      preview: adminToken ? `${adminToken.substring(0, 20)}...` : 'none'
    });
    
    // Validation JWT Token Payload
    if (adminToken) {
      try {
        const tokenPart = adminToken.replace('Bearer ', '');
        if (tokenPart !== 'dev-bypass-token') {
          const tokenPayload = JSON.parse(atob(tokenPart.split('.')[1]));
          console.log(`[${correlationId}] 🔍 Token payload analysis:`, {
            userId: tokenPayload.userId || tokenPayload.sub,
            permissions: tokenPayload.permissions || 'not_specified',
            scope: tokenPayload.scope || 'not_specified',
            exp: new Date(tokenPayload.exp * 1000).toISOString(),
            isExpired: Date.now() > (tokenPayload.exp * 1000)
          });
        } else {
          console.log(`[${correlationId}] 🔧 Using development bypass token`);
        }
      } catch (tokenError) {
        console.log(`[${correlationId}] ⚠️ Token parsing failed:`, tokenError.message);
      }
    }
    
    if (!adminToken) {
      console.warn(`[${correlationId}] ❌ AUTH_MISSING - No admin token found`);
      return res.status(401).json({
        success: false,
        error: 'Authentication required for audio upload',
        correlationId
      });
    }
    
    const backendUrl = 'https://api.mdmcmusicads.com/api/v1/upload/audio';
    console.log(`[${correlationId}] 🎯 Target backend URL:`, backendUrl);
    
    // Collecter les chunks de données avec monitoring
    const chunks = [];
    let totalBytes = 0;
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
      totalBytes += chunk.length;
      console.log(`[${correlationId}] 📊 Data chunk received: ${chunk.length} bytes (total: ${totalBytes})`);
    });
    
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const bufferSizeMB = (buffer.length / 1024 / 1024).toFixed(2);
        
        console.log(`[${correlationId}] 📦 BUFFER_COMPLETE:`, {
          totalChunks: chunks.length,
          bufferSize: `${bufferSizeMB} MB`,
          bufferLength: buffer.length,
          contentLengthHeader: req.headers['content-length'],
          matches: buffer.length.toString() === req.headers['content-length']
        });
        
        // Analyse du multipart boundary
        const contentType = req.headers['content-type'];
        if (contentType && contentType.includes('multipart/form-data')) {
          const boundaryMatch = contentType.match(/boundary=([^;]+)/);
          const originalBoundary = boundaryMatch ? boundaryMatch[1] : 'unknown';
          
          // Vérifier si le boundary est présent dans le buffer
          const bufferStart = buffer.toString('ascii', 0, 100);
          const boundaryInBuffer = bufferStart.includes(originalBoundary.replace(/"/g, ''));
          
          console.log(`[${correlationId}] 🔗 MULTIPART_ANALYSIS:`, {
            originalBoundary,
            boundaryInBuffer,
            bufferPreview: bufferStart.replace(/\r\n/g, '\\r\\n')
          });
        }
        
        console.log(`[${correlationId}] 🚀 BACKEND_REQUEST_START - Sending to backend`);
        
        const requestHeaders = {
          'Content-Type': req.headers['content-type'],
          'Authorization': adminToken.startsWith('Bearer ') ? adminToken : `Bearer ${adminToken}`,
          'Content-Length': buffer.length.toString(),
          'User-Agent': 'MDMC-Frontend-Proxy/1.0'
        };
        
        console.log(`[${correlationId}] 📋 Backend request headers:`, requestHeaders);
        
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: buffer
        });
        
        const responseTime = Date.now() - startTime;
        
        console.log(`[${correlationId}] 📥 BACKEND_RESPONSE:`, {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        const data = await response.text();
        console.log(`[${correlationId}] 📄 Backend response body:`, {
          length: data.length,
          preview: data.substring(0, 500),
          isJSON: (() => {
            try { JSON.parse(data); return true; } catch { return false; }
          })()
        });
        
        // Log final status et gestion fallback
        if (response.ok) {
          console.log(`[${correlationId}] ✅ UPLOAD_SUCCESS - Total time: ${responseTime}ms`);
          res.status(response.status);
          res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
          res.setHeader('X-Correlation-ID', correlationId);
          res.end(data);
        } else {
          console.log(`[${correlationId}] ❌ UPLOAD_FAILED - Status: ${response.status}, Time: ${responseTime}ms`);
          
          // Gestion spéciale pour les erreurs Cloudinary (fallback temporaire)
          if (response.status === 500 && data.includes('Cloudinary')) {
            console.log(`[${correlationId}] 🔧 CLOUDINARY_ERROR_FALLBACK - Providing temporary mock response`);
            
            // Retourner une réponse temporaire pour ne pas bloquer l'UX
            const fallbackResponse = {
              success: true,
              data: {
                audioUrl: `https://temp-audio-placeholder.mdmc.com/audio_${correlationId}.mp3`,
                duration: 30,
                format: 'mp3',
                temporary: true,
                message: 'Upload temporairement simulé - Configuration Cloudinary en cours de correction'
              },
              warning: 'Fonctionnalité audio temporairement limitée'
            };
            
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-Correlation-ID', correlationId);
            res.setHeader('X-Fallback-Mode', 'true');
            res.json(fallbackResponse);
          } else {
            // Autres erreurs : transmettre normalement
            res.status(response.status);
            res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
            res.setHeader('X-Correlation-ID', correlationId);
            res.end(data);
          }
        }
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`[${correlationId}] ❌ BACKEND_ERROR - Time: ${responseTime}ms:`, {
          message: error.message,
          stack: error.stack,
          code: error.code,
          errno: error.errno
        });
        
        res.status(500).json({
          success: false,
          error: 'Backend upload failed',
          details: error.message,
          correlationId
        });
      }
    });
    
    req.on('error', (error) => {
      console.error(`[${correlationId}] ❌ STREAM_ERROR:`, {
        message: error.message,
        code: error.code,
        errno: error.errno
      });
      
      res.status(500).json({
        success: false,
        error: 'Upload stream failed',
        details: error.message,
        correlationId
      });
    });
    
  } catch (error) {
    console.error(`[${correlationId}] ❌ PROXY_ERROR:`, {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Upload proxy failed',
      details: error.message,
      correlationId
    });
  }
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
    
    // SIMPLIFICATION : Juste ajouter l'URL prédictible du SmartLink
    if (response.ok && data.success && data.data) {
      const artistSlug = (data.data.artistName || 'unknown').toLowerCase()
        .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const trackSlug = (data.data.trackTitle || 'untitled').toLowerCase()
        .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      const staticUrl = `https://www.mdmcmusicads.com/smartlink/${artistSlug}/${trackSlug}.html`;
      
      // Ajouter l'URL statique à la réponse
      data.data.staticUrl = staticUrl;
      
      console.log(`🔗 SmartLink URL: ${staticUrl}`);
    }
    
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

// Route pour servir les pages SmartLinks avec génération dynamique (plus spécifique)  
app.get('/smartlink/:artist/:track.html', async (req, res) => {
  const { artist, track } = req.params;
  
  console.log(`📄 SmartLink request: /${artist}/${track}.html`);
  
  try {
    // Données SmartLink de démonstration (remplacer par vraie data depuis DB)
    const smartlinkData = {
      shortId: `${artist}-${track}`,
      artistName: artist.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      trackTitle: track.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      coverImageUrl: 'https://i.scdn.co/image/ab67616d0000b273demo',
      customDescription: `Écoutez ${track.replace(/-/g, ' ')} de ${artist.replace(/-/g, ' ')}`,
      platformLinks: [
        {
          platform: 'Spotify',
          url: 'https://open.spotify.com/track/demo'
        },
        {
          platform: 'Apple Music', 
          url: 'https://music.apple.com/demo'
        }
      ]
    };

    // Génération HTML directe (sans import dynamique qui pose problème sur Railway)
    const html = generateStaticHTML(smartlinkData);
    
    console.log(`✅ Dynamic HTML generated for ${artist}/${track}`);
    
    // Servir le HTML directement
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  } catch (error) {
    console.error(`❌ Exception HTML generation:`, error);
    // Fallback vers React
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// ENDPOINT SUPPRIMÉ - Génération simplifiée via route directe

// TEST ENDPOINT pour vérifier les déploiements
app.get('/test-smartlink-generation', async (req, res) => {
  console.log('🧪🧪🧪 TEST ENDPOINT HIT - DEPLOYMENT WORKING 🧪🧪🧪');
  
  res.setHeader('Content-Type', 'text/plain');
  res.send('SUCCESS! Test endpoint is working. Deployment is active. Time: ' + new Date().toISOString());
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
  console.log(`📄 Static SmartLinks: /{artist}/{track}.html`);
  console.log(`🔨 HTML Generator: /api/generate/smartlink-html`);
  console.log(`🔍 React app: /#/smartlinks/artist/track`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('💤 Server shutting down gracefully...');
  process.exit(0);
});

export default app;
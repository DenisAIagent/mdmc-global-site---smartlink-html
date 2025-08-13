# MDMC v4 Frontend - Site Web React + Interface Admin

## 🎯 **Rôle et Responsabilités**

Ce frontend est l'**interface utilisateur principale** de l'écosystème MDMC Music Ads, comprenant le site web public (vitrine marketing) et l'interface d'administration pour la gestion des SmartLinks.

### **Services Fournis**
- **Site Web Public** (vitrine marketing, services, contact)
- **Interface Admin SmartLinks** (création, gestion, analytics)
- **Landing Pages SmartLinks** (pages dynamiques pour partage)
- **Simulateur Marketing** (outil de calcul ROI campaigns)
- **Formulaires Contact** (leads, demandes de devis)
- **Système Multi-langues** (FR/EN/ES/PT)
- **SEO Optimization** (meta tags dynamiques, sitemap)
- **Analytics Integration** (GTM, Facebook Pixel, tracking)

## 🏗️ **Architecture Technique**

### **Stack Principal**
- **Framework**: React 18 + Vite
- **Routing**: React Router (HashRouter)
- **State Management**: React Hooks + Context API  
- **UI Components**: Material-UI (admin) + Custom Components
- **Styling**: CSS Modules + Variables CSS
- **Build**: Vite (ES modules, optimizations)
- **Deployment**: Railway avec serveur Express.js

### **Structure des Dossiers**
```
mdmcv4-frontend/
├── public/
│   ├── admin/                    # Pages HTML admin statiques
│   ├── pictos plateformes/       # Icônes plateformes musicales
│   └── assets/                   # Images, favicon
├── src/
│   ├── components/
│   │   ├── layout/               # Header, Footer
│   │   ├── sections/             # Hero, Services, About, etc.
│   │   ├── common/               # Composants réutilisables
│   │   └── admin/                # Interface admin (déprécié)
│   ├── pages/
│   │   ├── public/               # Pages ressources légales
│   │   └── services/             # Pages services SEO
│   ├── services/                 # API calls, intégrations
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utilitaires, helpers
│   └── assets/styles/            # CSS global, variables
├── server.js                     # Serveur Express pour production
└── vite.config.js               # Configuration Vite
```

## 🚀 **Déploiement**

### **URL Production**
```
https://www.mdmcmusicads.com
```

### **Variables d'Environnement**
```env
# Mode
NODE_ENV=production

# APIs
VITE_API_BASE_URL=https://api.mdmcmusicads.com
VITE_SMARTLINKS_SERVICE=https://smartlinks.mdmcmusicads.com

# Analytics
VITE_GA4_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXX

# Features
VITE_ENABLE_SIMULATOR=true
VITE_ENABLE_MULTILANG=true
```

### **Commandes de Déploiement**
```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build

# Build + génération SmartLinks
npm run build:complete

# Serveur production
npm start
```

## 🎨 **Architecture Frontend**

### **1. Site Web Public (Marketing)**
**Pages Principales**
- **Homepage** (`/`) - Hero, Services, About, Reviews, Contact
- **Services SEO** - Pages dédiées YouTube Ads, Meta Ads, TikTok
- **Ressources** - FAQ, Mentions légales, CGU, Politique confidentialité

**Fonctionnalités**
- **Responsive Design** mobile-first
- **SEO Optimized** (meta tags, structured data)
- **Multi-langues** (i18next)
- **Simulateur ROI** intégré
- **Formulaires Contact** avec validation

### **2. Interface Admin (Création SmartLinks)**
**Pages HTML Statiques** (dans `/public/admin/`)
- **Dashboard** (`/admin/dashboard.html`)
- **Création SmartLinks** (`/admin/smartlinks/create.html`)
- **Liste SmartLinks** (`/admin/smartlinks/list.html`)

**Fonctionnalités**
- **Interface Material Design**
- **Intégration API Odesli** (via backend)
- **Upload d'artworks**
- **Analytics SmartLinks**
- **Gestion multi-artistes**

### **3. Landing Pages SmartLinks (Dynamiques)**
**Routes React** (deprecated - migré vers service dédié)
- `/smartlinks/:artist/:track` - Landing page SmartLink
- `/sl/:shortCode` - Redirection liens courts

## 📡 **Intégrations & Services**

### **APIs Consommées**
```javascript
// Configuration API (src/config/api.config.js)
const API_BASE_URL = 'https://api.mdmcmusicads.com';

// Services principaux
- SmartLinks CRUD
- Artists Management  
- Analytics & Tracking
- File Upload (Cloudinary)
- Contact Forms (Brevo)
```

### **Services Externes**
- **Google Tag Manager** - Tracking unifié
- **Facebook Pixel** - Conversion tracking
- **Brevo** - Email marketing
- **Cloudinary** - Gestion médias
- **i18next** - Internationalisation

## 🔗 **Relations avec Autres Services**

### **mdmcv4-backend**
```javascript
// src/services/api.service.js
- Authentification JWT
- CRUD SmartLinks
- Analytics tracking
- File uploads
- Contact forms
```

### **mdmcv4-smartlinks-service**
```javascript
// Redirection SmartLinks (deprecated)
- Navigation vers pages HTML statiques
- Analytics bridge
- Meta tags fallback
```

## 🚨 **Notes Critiques**

### **Restrictions Importantes**
⚠️ **Zone NON MODIFIABLE** - Site web public (`src/pages/public/*`, `src/components/sections/*`)  
✅ **Zone MODIFIABLE** - Interface admin uniquement (`public/admin/*`)

### **Règles de Développement**
- **Jamais d'emojis** dans l'interface
- **Pas de fallbacks** pour logos plateformes
- **Validation stricte** des données utilisateur
- **Double autorisation** pour modifications globales

---

**Contact Support**: [email frontend]  
**Documentation Design**: [Figma/Style Guide]  
**Monitoring**: [Railway Dashboard]

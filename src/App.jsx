import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Import du hook de tracking SEO critique
import usePageTracking from './hooks/usePageTracking';
import useSocialMetaAdaptation from './hooks/useSocialMetaAdaptation';

import './App.css';
import './assets/styles/global.css';
import './assets/styles/animations.css';

import apiService from './services/api.service';
import { updateMetaTags } from './i18n';
import { updateMetaTagsForLanguage } from './utils/multilingualMeta';
import facebookPixel from './services/facebookPixel.service';
import gtm from './services/googleTagManager.service';

// Material-UI supprimé avec l'admin React


import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Simulator from './components/features/Simulator';
import CookieBanner from './components/features/CookieBanner';
import SEOHead from './components/common/SEOHead';

import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import About from './components/sections/About';
import Articles from './components/sections/Articles';
import Reviews from './components/sections/Reviews';
import Contact from './components/sections/Contact';
import AllReviews from './components/pages/AllReviews';
import ArtistPage from './pages/public/ArtistPage';
import ShortLinkPage from './pages/public/ShortLinkPage';

// Pages de ressources légales
import FAQ from './pages/public/resources/FAQ';
import Glossaire from './pages/public/resources/Glossaire';
import MentionsLegales from './pages/public/resources/MentionsLegales';
import PolitiqueConfidentialite from './pages/public/resources/PolitiqueConfidentialite';
import ConditionsGenerales from './pages/public/resources/ConditionsGenerales';
import Cookies from './pages/public/resources/Cookies';
import TestPage from './pages/public/resources/TestPage';
import TestContentValidation from './pages/public/resources/TestContentValidation';

// Pages services SEO-optimisées
import YouTubeAdsMusique from './pages/services/YouTubeAdsMusique';
import MetaAdsArtistes from './pages/services/MetaAdsArtistes';
import TikTokPromotionMusicale from './pages/services/TikTokPromotionMusicale';

// Admin supprimé - utilisation des pages HTML statiques dans /public/admin/

// ProtectedRoute supprimé - admin HTML statique utilisé


const HomePage = ({ openSimulator }) => {
  // 📊 TRACKING CRITIQUE : Virtual pageviews pour homepage
  const { trackFormSubmission, trackEngagement } = usePageTracking(
    "Marketing Musical | YouTube Ads & Meta Ads pour Artistes | MDMC",
    "homepage"
  );

  useEffect(() => { 
    console.log("HomePage rendu avec tracking SEO activé"); 
    
    // Track homepage loaded
    trackEngagement('homepage_loaded');
  }, [trackEngagement]);

  return (
    <>
      <SEOHead 
        title="Marketing Musical | YouTube Ads & Meta Ads pour Artistes | MDMC"
        description="Agence N°1 marketing musical : +500 artistes accompagnés, +50M vues générées. YouTube Ads, Meta Ads, TikTok Pro. Résultats garantis pour artistes et labels. Devis gratuit."
        keywords="promotion musicale professionnelle, marketing musical efficace, publicité YouTube artiste, augmenter streams Spotify, campagne Meta musique, TikTok musical viral, promotion artiste émergent, label marketing digital, boost streams garantis, agence musicale performante"
        url="https://www.mdmcmusicads.com"
        canonicalUrl="https://www.mdmcmusicads.com/"
      />
      <Header />
      <main>
        <Hero openSimulator={openSimulator} />
        <Services />
        <About />
        <Articles />
        <Reviews />
        <Contact trackFormSubmission={trackFormSubmission} />
      </main>
      <Footer openSimulator={openSimulator} />
      <CookieBanner />
    </>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const simulatorRef = useRef(null);
  
  // Adaptation automatique des meta tags pour partage social
  useSocialMetaAdaptation();

  useEffect(() => {
    try {
      updateMetaTags(t);
      const lang = i18n.language.split('-')[0];
      
      // Mise à jour multilingue des meta tags selon la langue du navigateur
      updateMetaTagsForLanguage(lang);
      
      // Initialiser Facebook Pixel
      facebookPixel.init();
      facebookPixel.pageView();
      
      // Initialiser Google Tag Manager
      gtm.init();
    } catch (error) {
      console.warn('Failed to update meta tags:', error);
    }
  }, [t, i18n.language]);

  const openSimulator = () => simulatorRef.current?.openSimulator();

  return (
    <Router>
      <Simulator ref={simulatorRef} />
      <Routes>
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/artists/:slug" element={<ArtistPage />} />
        {/* SmartLinks supprimés - utilisation des pages HTML statiques dans /backend/public/smartlinks/ */}
        
        {/* Routes services SEO-optimisées */}
        <Route path="/services/youtube-ads-musique" element={<YouTubeAdsMusique />} />
        <Route path="/services/meta-ads-artistes" element={<MetaAdsArtistes />} />
        <Route path="/services/tiktok-promotion-musicale" element={<TikTokPromotionMusicale />} />
        
        {/* Routes des pages de ressources légales - SEO optimisées */}
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-contenu" element={<TestContentValidation />} />
        <Route path="/ressources/faq" element={<FAQ />} />
        <Route path="/ressources/glossaire" element={<Glossaire />} />
        <Route path="/ressources/mentions-legales" element={<MentionsLegales />} />
        <Route path="/ressources/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/ressources/conditions-generales" element={<ConditionsGenerales />} />
        <Route path="/ressources/cookies" element={<Cookies />} />
        
        {/* Admin React supprimé - redirection vers pages HTML statiques */}
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard.html" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
// Force deployment trigger Mar  8 jul 2025 12:32:40 WEST

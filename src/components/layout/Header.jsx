import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../../assets/images/logo.png';
// Assurez-vous que le chemin vers le CSS est correct
import '../../assets/styles/header.css';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollTimeoutRef = useRef(null);
  
  // Détecter si on est sur la page d'accueil ou une page de ressources
  const isHomePage = location.pathname === '/';
  const isResourcePage = location.pathname.startsWith('/ressources/');

  // Menu items centralisés pour éviter duplication
  const menuItems = [
    { href: "#hero", key: "nav.home" },
    { href: "#services", key: "nav.services" },
    { href: "#about", key: "nav.about" },
    { href: "#articles", key: "nav.articles" },
    { href: "#contact", key: "nav.contact" }
  ];

  // Gestion du scroll avec throttling pour optimiser les performances
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) return;
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolled(window.scrollY > 50);
        scrollTimeoutRef.current = null;
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Gestion clavier pour accessibilité menu mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêcher scroll du body quand menu ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Navigation vers les sections avec smooth scroll
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      const headerHeight = 60; // Hauteur du header fixe
      const offsetTop = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Fermer le menu mobile lors du clic sur un lien
  const handleNavLinkClick = (e, href) => {
    if (href && href.startsWith('#')) {
      e.preventDefault();
      scrollToSection(href);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  // Gestion fallback logo si image manquante
  const handleLogoError = (e) => {
    e.target.style.display = 'none';
    e.target.nextElementSibling.style.display = 'block';
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          {isHomePage ? (
            <a href="#hero" aria-label="MDMC - Retour à l'accueil">
              <img 
                src={logoImage} 
                alt="MDMC Logo" 
                onError={handleLogoError}
              />
              <span 
                style={{ display: 'none', fontWeight: 'bold', fontSize: '1.5rem' }}
                aria-hidden="true"
              >
                MDMC
              </span>
            </a>
          ) : (
            <Link to="/" aria-label="MDMC - Retour à l'accueil">
              <img 
                src={logoImage} 
                alt="MDMC Logo" 
                onError={handleLogoError}
              />
              <span 
                style={{ display: 'none', fontWeight: 'bold', fontSize: '1.5rem' }}
                aria-hidden="true"
              >
                MDMC
              </span>
            </Link>
          )}
        </div>

        <nav className="nav-desktop">
          <ul>
            {isHomePage ? (
              menuItems.map(({ href, key }) => (
                <li key={key}>
                  <a href={href} onClick={(e) => handleNavLinkClick(e, href)}>{t(key)}</a>
                </li>
              ))
            ) : (
              <li>
                <Link to="/" onClick={handleNavLinkClick}>{t('nav.home')}</Link>
              </li>
            )}
          </ul>
        </nav>

        <button
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`nav-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul>
            {isHomePage ? (
              menuItems.map(({ href, key }) => (
                <li key={`mobile-${key}`}>
                  <a href={href} onClick={(e) => handleNavLinkClick(e, href)}>{t(key)}</a>
                </li>
              ))
            ) : (
              <li key="mobile-home">
                <Link to="/" onClick={handleNavLinkClick}>{t('nav.home')}</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

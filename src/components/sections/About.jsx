import { useTranslation } from 'react-i18next';
import artistAboutImage from '../../assets/images/artist-about.jpg';
import '../../assets/styles/about.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">{t('about.title')}</h2>

        <div className="about-header">
          <div className="about-text-header">
            <h3>{t('about.subtitle')}</h3>
            <p>{t('about.description')}</p>
          </div>

          <div className="about-image">
            <img src={artistAboutImage} alt="Illustration section À Propos" />
          </div>
        </div>

        <div className="about-advantages">
          <ul>
            <li><strong>{t('about.advantages.expertise')}</strong></li>
            <li><strong>{t('about.advantages.campaigns')}</strong></li>
            <li><strong>{t('about.advantages.targeting')}</strong></li>
            <li><strong>{t('about.advantages.analytics')}</strong></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;

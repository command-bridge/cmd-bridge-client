import i18next from 'i18next';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

i18next.init({
  lng: navigator.language.startsWith('pt') ? 'pt' : 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  interpolation: { escapeValue: false },
});

export default i18next;
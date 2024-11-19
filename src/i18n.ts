import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import all translations
import translationEN from '../public/locales/en/translation.json';
import translationFR from '../public/locales/fr/translation.json';
import translationES from '../public/locales/es/translation.json';
import translationDE from '../public/locales/de/translation.json';
import translationIT from '../public/locales/it/translation.json';
import translationPT from '../public/locales/pt/translation.json';
import translationRU from '../public/locales/ru/translation.json';
import translationZH from '../public/locales/zh/translation.json';
import translationJA from '../public/locales/ja/translation.json';
import translationKO from '../public/locales/ko/translation.json';

const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
  es: { translation: translationES },
  de: { translation: translationDE },
  it: { translation: translationIT },
  pt: { translation: translationPT },
  ru: { translation: translationRU },
  zh: { translation: translationZH },
  ja: { translation: translationJA },
  ko: { translation: translationKO },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  });

export default i18n;
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChanged = () => {
      setCurrentLang(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const isValidLang = languages.some(lang => lang.code === browserLang);
    
    if (isValidLang && !localStorage.getItem('i18nextLng')) {
      i18n.changeLanguage(browserLang);
      setCurrentLang(browserLang);
    }
  }, [i18n]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  const displayLang = currentLang.split('-')[0];

  return (
    <select
      value={displayLang}
      onChange={handleLanguageChange}
      className="bg-transparent text-white border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      {languages.map((lang) => (
        <option
          key={lang.code}
          value={lang.code}
          className="bg-primary-600 text-white"
        >
          {lang.name}
        </option>
      ))}
    </select>
  );
}
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Language, Translations } from './types';
import { tr } from './tr';
import { en } from './en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LANGUAGE_STORAGE_KEY = 'devtoo_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'tr';
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') return saved;
    // Fallback to browser locale
    const browserLang = navigator.language?.toLowerCase();
    return browserLang?.startsWith('tr') ? 'tr' : 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return language === 'tr' ? tr : en;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

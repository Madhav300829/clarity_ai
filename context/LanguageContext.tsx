import React, { createContext, useState, useEffect, useContext, ReactNode, FC, useCallback } from 'react';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';

type Language = 'en' | 'es' | 'fr' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'clarity-ai-language';
const translationsCache: { [key in Language]: any } = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations
};

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const storedLang = localStorage.getItem(LANGUAGE_KEY) as Language;
      if (storedLang && ['en', 'es', 'fr', 'de'].includes(storedLang)) {
        return storedLang;
      }
    } catch (e) {
      console.warn(`Failed to get ${LANGUAGE_KEY} from localStorage`, e);
    }
    return 'en';
  });

  const [translations, setTranslations] = useState<any>(translationsCache[language] || enTranslations);

  useEffect(() => {
    // Synchronously set translations from statically loaded local records
    setTranslations(translationsCache[language] || enTranslations);
  }, [language]);

  const setLanguage = (lang: Language) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.warn(`Failed to set ${LANGUAGE_KEY} in localStorage`, e);
    }
    setLanguageState(lang);
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return key if not found
      }
    }

    if (typeof result === 'string' && options) {
      // Replace placeholders like {{count}}
      return result.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, placeholder) => {
        return String(options[placeholder] !== undefined ? options[placeholder] : match);
      });
    }

    return typeof result === 'string' ? result : key;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

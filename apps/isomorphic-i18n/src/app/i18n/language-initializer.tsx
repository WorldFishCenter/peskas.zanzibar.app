'use client';

import { useEffect } from 'react';
import { useTranslation } from './client';
import { languages } from './settings';
import Script from 'next/script';

// Build the inline script using the languages array so it stays in sync with settings
const validLangsJson = JSON.stringify(languages);
const earlyInitScript = `
  try {
    var validLangs = ${validLangsJson};
    var storedLang = localStorage.getItem('selectedLanguage') || localStorage.getItem('i18nextLng');
    if (storedLang && validLangs.includes(storedLang)) {
      document.documentElement.lang = storedLang;
    }
  } catch (e) {
    console.error('Error in language init script:', e);
  }
`;

export default function LanguageInitializer({ lang }: { lang?: string }) {
  const { i18n } = useTranslation(lang || languages[0]);

  useEffect(() => {
    const urlLang = lang;
    const storedLang = typeof window !== 'undefined' ?
      localStorage.getItem('selectedLanguage') || localStorage.getItem('i18nextLng') :
      null;

    // URL lang param is the source of truth (comes from Next.js routing)
    // Fall back to localStorage, then to the configured fallback language
    const targetLang = (urlLang && languages.includes(urlLang)) ?
      urlLang :
      (storedLang && languages.includes(storedLang)) ?
        storedLang :
        languages[0];

    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', targetLang);
      localStorage.setItem('i18nextLng', targetLang);
      localStorage.setItem('peskas-language', targetLang);
      document.documentElement.lang = targetLang;
    }

    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
  }, [lang, i18n]);

  return (
    <>
      <Script id="language-early-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: earlyInitScript }} />
    </>
  );
}

import { activeCountry } from '@/config/countryConfig';

export const fallbackLng = activeCountry.languages[0];
export const languages = [...activeCountry.languages];
export const defaultNS = 'common';

export function getOptions(lang = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lang,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}

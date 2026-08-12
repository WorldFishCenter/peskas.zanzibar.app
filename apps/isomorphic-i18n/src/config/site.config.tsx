import { Metadata } from 'next';
import logoImg from '@public/logo.svg';
import { LAYOUT_OPTIONS } from '@/config/enums';
import logoIconImg from '@public/logo-short.svg';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import sailboatIcon from '@public/sailboat-icon.svg';
import { activeCountry } from '@/config/countryConfig';

enum MODE {
  LIGHT = 'light',
  DARK = 'dark',
}

export const siteConfig = {
  title: activeCountry.siteTitle,
  description: activeCountry.siteDescription,
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.DARK,
  layout: LAYOUT_OPTIONS.LITHIUM,
  favicon: sailboatIcon,
  author: {
    name: 'WorldFish',
    url: 'https://worldfishcenter.org',
  },
  headerLinks: [],
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  const pageTitle = title ? `${title} - ${siteConfig.title}` : siteConfig.title;

  return {
    title: pageTitle,
    description,
    openGraph: openGraph ?? {
      title: pageTitle,
      description,
      siteName: siteConfig.title, // https://developers.google.com/search/docs/appearance/site-names
      locale: activeCountry.locale.replace('-', '_'),
      type: 'website',
    },
  };
};

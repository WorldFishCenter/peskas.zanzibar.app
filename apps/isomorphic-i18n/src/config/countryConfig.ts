/**
 * Country configuration for multi-country deployment.
 * Select the active country at build time via the COUNTRY_CODE env var (default: 'TZ').
 *
 * IMPORTANT: districtToRegion must mirror
 * packages/nosql/src/constants/gaul2-districts.ts GAUL2_TO_REGION,
 * because the district-summary API router uses that file to group data by region.
 * The region keys (e.g. 'Unguja', 'Pemba') flow from the API into file-stats.tsx
 * as data field names. Both must be updated together when adding a new country.
 *
 * To add a new country:
 *   1. Add an entry to COUNTRY_REGISTRY below.
 *   2. Update packages/nosql/src/constants/gaul2-districts.ts with the new
 *      district/region mapping for the new country's DB data.
 *   3. Add locale files under src/app/i18n/locales/<lang>/common.json.
 *   4. Set COUNTRY_CODE and MONGODB_URI env vars in the new deployment.
 */

import type { ComponentType } from 'react';

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface CountryConfig {
  /** Internal identifier matching COUNTRY_CODE env var, e.g. 'TZ' */
  countryCode: string;
  /** Human-readable country/region name used in page titles, e.g. 'Zanzibar' */
  countryName: string;
  /** Browser tab title */
  siteTitle: string;
  /** Meta description */
  siteDescription: string;
  /** Optional country flag asset path (e.g. for header/branding) */
  flagIconSrc?: string;
  /** ISO 4217 currency code, e.g. 'TZS' */
  currencyCode: string;
  /** BCP 47 locale for number/date formatting, e.g. 'sw-TZ' */
  locale: string;
  /** Supported i18n languages. First entry is the fallback language.
   *  Must correspond to folder names under src/app/i18n/locales/. */
  languages: [string, ...string[]];
  /** Official adm2 district names as stored in MongoDB gaul_2_name field */
  districts: string[];
  /** Maps district name → parent region name. Must mirror GAUL2_TO_REGION
   *  in packages/nosql/src/constants/gaul2-districts.ts — see note above. */
  districtToRegion: Record<string, string>;
  /** Per-district hex colors for chart visualization */
  districtColors: Record<string, string>;
  /** View state for the DeckGL hexbin map */
  mapViewState: MapViewState;
  /** View state for the H3 grid map */
  gridMapViewState: MapViewState;
  /** Districts pre-selected in the district filter on first visit */
  defaultSelectedDistricts: string[];
  features: {
    /** Sub-region breakdown bars shown in homepage metric cards.
     *  Regions must exactly match the keys returned by the
     *  districtSummary.getMonthlyRegionSummary tRPC procedure.
     *  Set to undefined for countries with no meaningful sub-regions. */
    regionBreakdown?: {
      regions: [string, ...string[]];
      colors: Record<string, string>;
    };
    /** Optional slot component for country-specific homepage sections.
     *  Zanzibar example: island-level summary cards (Pemba / Unguja). */
    homepageExtras?: ComponentType;
  };
}

// ---------------------------------------------------------------------------
// Zanzibar (Tanzania)
// ---------------------------------------------------------------------------

const zanzibarConfig: CountryConfig = {
  countryCode: 'TZ',
  countryName: 'Zanzibar',
  siteTitle: 'PESKAS | Zanzibar Fisheries',
  siteDescription: 'Peskas | Zanzibar Fisheries Dashboard',
  flagIconSrc: '/zanzibar-flag.svg',
  currencyCode: 'TZS',
  locale: 'sw-TZ',
  languages: ['en', 'sw'],
  districts: [
    'Chake Chake',
    'Kaskazini A',
    'Kaskazini B',
    'Kati',
    'Kusini',
    'Magharibi A',
    'Magharibi B',
    'Micheweni',
    'Mjini',
    'Mkoani',
    'Wete',
  ],
  districtToRegion: {
    'Chake Chake': 'Pemba',
    'Kaskazini A': 'Unguja',
    'Kaskazini B': 'Unguja',
    'Kati': 'Unguja',
    'Kusini': 'Unguja',
    'Magharibi A': 'Unguja',
    'Magharibi B': 'Unguja',
    'Micheweni': 'Pemba',
    'Mjini': 'Unguja',
    'Mkoani': 'Pemba',
    'Wete': 'Pemba',
  },
  // Based on the ColorsWall palette (https://colorswall.com/palette/178887) + Blue-grey lighten-2
  districtColors: {
    'Chake Chake': '#167288',  // Semi dark teal
    'Kaskazini A': '#8cdaec',  // Light sky blue
    'Kaskazini B': '#b45248',  // Semi dark red
    'Kati':        '#d48c84',  // Light rosy brown
    'Kusini':      '#a89a49',  // Semi dark khaki
    'Magharibi A': '#d6cfa2',  // Light pale goldenrod
    'Magharibi B': '#3cb464',  // Semi dark green
    'Micheweni':   '#9bddb1',  // Light medium aquamarine
    'Mjini':       '#643c6a',  // Semi dark purple
    'Mkoani':      '#836394',  // Light medium purple
    'Wete':        '#90a4ae',  // Blue-grey lighten-2
  },
  mapViewState: {
    longitude: 39.8,
    latitude: -4.3,
    zoom: 8,
    minZoom: 5,
    maxZoom: 15,
    pitch: 40.5,
  },
  gridMapViewState: {
    longitude: 39.19,
    latitude: -6.16,
    zoom: 8,
    pitch: 45,
    bearing: 10,
  },
  defaultSelectedDistricts: ['Wete', 'Kati', 'Kaskazini A', 'Kaskazini B', 'Kusini', 'Magharibi A', 'Magharibi B', 'Micheweni', 'Mjini', 'Mkoani', 'Chake Chake'],
  features: {
    regionBreakdown: {
      regions: ['Unguja', 'Pemba'],
      colors: { Unguja: '#F28F3B', Pemba: '#75ABBC' },
    },
    homepageExtras: undefined,
  },
};

// ---------------------------------------------------------------------------
// Registry and active country export
// ---------------------------------------------------------------------------

const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  TZ: zanzibarConfig,
};

/**
 * The active country configuration for this deployment.
 * Resolved once at module load from the COUNTRY_CODE env var.
 * Defaults to 'TZ' (Zanzibar) when COUNTRY_CODE is unset or unknown.
 */
export const activeCountry: CountryConfig =
  COUNTRY_REGISTRY[process.env.COUNTRY_CODE ?? 'TZ'] ?? zanzibarConfig;

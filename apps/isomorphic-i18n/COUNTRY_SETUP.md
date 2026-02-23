# Adding a New Country to the Peskas Dashboard

This guide explains how to deploy the dashboard for a new country.

## How the multi-country system works

The dashboard reads a `COUNTRY_CODE` env var at build time. Each country deployment
sets its own `COUNTRY_CODE` and `MONGODB_URI`, pointing to its own database.
No code forks are needed — only a new config entry per country.

```
COUNTRY_CODE=TZ   MONGODB_URI=<zanzibar-db>   → Zanzibar deployment
COUNTRY_CODE=TL   MONGODB_URI=<timor-db>      → Timor-Leste deployment
```

---

## Step 1 — Add a config entry

Open `src/config/countryConfig.ts` and add a new entry to `COUNTRY_REGISTRY`.

Copy the `zanzibarConfig` object as a starting point and fill in the correct values:

```ts
const timorConfig: CountryConfig = {
  countryCode: 'TL',
  countryName: 'Timor-Leste',
  siteTitle: 'PESKAS | Timor-Leste Fisheries',
  siteDescription: 'Peskas | Timor-Leste Fisheries Dashboard',
  currencyCode: 'USD',
  locale: 'en-US',
  languages: ['en', 'pt'],            // must match locale folder names below
  districts: [ /* adm2 district names from your MongoDB data */ ],
  districtToRegion: { /* district → region mapping */ },
  districtColors: { /* per-district hex colors for charts */ },
  mapViewState: { longitude: 125.7, latitude: -8.9, zoom: 8, pitch: 40.5 },
  gridMapViewState: { longitude: 125.6, latitude: -8.8, zoom: 8, pitch: 45, bearing: 10 },
  defaultSelectedDistricts: [ /* 1-2 districts to pre-select */ ],
  features: {
    regionBreakdown: undefined,   // set if you want sub-region bars in metric cards
    homepageExtras: undefined,    // optional: a React component for country-specific UI
  },
};

const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  TZ: zanzibarConfig,
  TL: timorConfig,   // ← add this
};
```

### CountryConfig field reference

| Field | Description |
|---|---|
| `countryCode` | Must match the `COUNTRY_CODE` env var |
| `countryName` | Used in page headings and map titles |
| `siteTitle` / `siteDescription` | Browser tab and meta description |
| `currencyCode` | ISO 4217, e.g. `'TZS'`, `'USD'` |
| `locale` | BCP 47 for number/date formatting, e.g. `'sw-TZ'`, `'en-US'` |
| `languages` | First element is the i18n fallback; must match locale folder names |
| `districts` | Official adm2 names exactly as stored in MongoDB `gaul_2_name` field |
| `districtToRegion` | Maps each district to its parent region (used in charts and filters) |
| `districtColors` | One hex color per district for consistent chart visualization |
| `mapViewState` | Initial view for the DeckGL hexbin map |
| `gridMapViewState` | Initial view for the H3 grid map |
| `defaultSelectedDistricts` | Pre-selected in the district filter on first visit |
| `features.regionBreakdown` | Enables sub-region bars in homepage metric cards |
| `features.homepageExtras` | Optional React component rendered in the homepage for country-specific content |

---

## Step 2 — Update the API district constants (if adding a new country)

> **This step is required for a new country** because the API router groups
> district data by region using the same mapping.

Open `packages/nosql/src/constants/gaul2-districts.ts` and add or replace:

```ts
export const GAUL2_DISTRICT_NAMES = [
  'District A', 'District B', /* ... */
] as const;

export const GAUL2_TO_REGION: Record<string, string> = {
  'District A': 'Region North',
  'District B': 'Region South',
  /* ... */
};
```

**Keep this in sync with `countryConfig.districts` and `countryConfig.districtToRegion`.**
The API returns data keyed by region name; those keys are used as chart `dataKey` values.

---

## Step 3 — Add locale files

For each language in `languages`, add a translation file:

```
src/app/i18n/locales/<lang>/common.json
```

Start from `src/app/i18n/locales/en/common.json` and translate or adjust values.
Country-specific currency unit strings (e.g. `"TZS/kg"`) should be set in the
relevant locale file for that country.

---

## Step 4 — Configure the deployment

Set these env vars in the deployment environment (Vercel, Docker, etc.):

```
COUNTRY_CODE=TL
MONGODB_URI=<connection-string-for-timor-db>
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=<url>
```

No other code changes are needed. The dashboard reads `COUNTRY_CODE` once at
build time and selects the matching config.

---

## Database schema

All country databases use the **same MongoDB collection names and schemas**
(defined in `packages/nosql/src/schema/`). The district and region names stored
in `gaul_2_name` fields must match the names in `countryConfig.districts` and
`gaul2-districts.ts`.

# peskas.dashboard 1.3.0

## Infrastructure

- **Multi-country deployment**: Each country (TZ, KE, MZ) deploys as a separate Vercel project
  from the same repository, with `NEXT_PUBLIC_COUNTRY_CODE` and `MONGODB_URI` as the only
  per-project env vars. `MONGODB_URI_COASTS` is shared across all deployments.

- **Fixed `NEXT_PUBLIC_COUNTRY_CODE`**: Renamed env var from `COUNTRY_CODE` to
  `NEXT_PUBLIC_COUNTRY_CODE`. The previous name was `undefined` in all client components
  (Next.js only exposes `NEXT_PUBLIC_*` vars to the browser bundle), causing the app to
  always fall back to Zanzibar regardless of which country was configured.

- **`gaul2-districts.ts` registry pattern**: Refactored `packages/nosql/src/constants/gaul2-districts.ts`
  to use the same three-country registry pattern as `countryConfig.ts`. Previously only Zanzibar
  data was exported; Kenya and Mozambique were commented out, breaking the district-summary
  API router for those countries.

- **Project renamed**: Project renamed from `peskas.zanzibar.v2` to `peskas.dashboard` to
  reflect its multi-country scope.

---

# peskas.dashboard 1.2.0

## New Features

- **GAUL2 choropleth map**: Homepage map now overlays administrative district boundaries
  colour-coded by the currently selected metric (CPUE, RPUE, catch tonnage, estimated
  revenue, or submission count). Boundaries are fetched from a separate portal MongoDB
  database (`wio_gaul2` collection) via a new `MONGODB_URI_COASTS` environment variable.
  Colour scale uses a 6-stop sequential Blues palette linearly interpolated across the
  district value range; districts with no data render in grey. The choropleth reacts in
  real-time to both the metric dropdown and the time range selector.

- **Choropleth tooltip**: Hovering a district polygon on the homepage map shows the
  district name and the selected metric value, formatted with the active locale.

- **Choropleth legend**: The map info panel displays the metric label and a colour ramp
  with min/max values when boundary data is loaded.

## Improvements

- **Shared metric state**: `district-summary-bar.tsx` metric selection is now driven by
  the shared `selectedMetricAtom` (Jotai) instead of local `useState`. The bar chart
  and the choropleth map always reflect the same metric selection.

- **Shared date range utility**: Extracted `computeDateRange()` into `dashboard/utils.ts`.
  Both the district summary bar and the choropleth map use it, eliminating duplicated
  inline date computation.

- **Multi-country boundaries**: `countryConfig.ts` extended with an `iso3Code` field
  (`'TZA'` / `'KEN'` / `'MOZ'`). The choropleth queries boundaries for the active
  country automatically — no code change needed when switching deployments.

- **New tRPC router**: `gaul2Boundaries.getByCountry` — queries `wio_gaul2` across all
  known field name variants (alpha-2 and alpha-3 ISO codes, `iso3_code` / `country` /
  nested `properties.*` fields) with a JS-filter fallback for non-standard documents.
  Returns a standard GeoJSON `FeatureCollection`.

- **Isolated portal DB connection**: `packages/nosql/src/portal-db.ts` manages a
  separate Mongoose connection (`mongoose.createConnection()`) for the portal database,
  fully isolated from the main fisheries DB connection.

---

# peskas.dashboard 1.1.0

## Improvements

- **Navigation**: Removed template artifacts (Groups, Widgets menus; ~130 dead route definitions).
  Routes trimmed to fisheries-only (`catch`, `revenue`, `catch_composition`, `map`, `ask_data`,
  `about`, `settings`, `forms.*`). Duplicate `nav-charts` bug fixed.

- **Dashboard components**: Deleted 23 dead component files (0 imports each). Renamed remaining
  components to kebab-case with descriptive names: `metric-cards`, `district-summary-bar`,
  `district-metrics-table`. `index.tsx` cleaned of dead imports and commented-out code.

- **Type safety**: `MetricBarCard` props fully typed (`MetricConfigEntry`, `MetricDataPoint`,
  `MonthlyRegionData`); removed `any` annotations. Badge configuration moved to `DropdownItemType`
  (`badge?: 'beta' | 'soon'`) instead of fragile string-key checks.

- **i18n**: Added `text-district-metrics`, `text-coming-soon`, `text-feature-under-development`
  keys in both English and Swahili. Nav keys (`nav-settings`, `nav-catch-overview`) aligned.
  New `ComingSoonPlaceholder` client component for placeholder pages.

- **Code quality**: `'use client'` directives made explicit; `lang!` assertions replaced with
  `lang ?? 'en'` throughout; unused imports removed.

---

# peskas.dashboard 1.0.0

## Major Changes

- **Multi-country dashboard**: Internationalized Next.js dashboard (apps/isomorphic-i18n)
  for Peskas fisheries deployments. Country is selected via `COUNTRY_CODE` at build
  time; each deployment uses its own config in `countryConfig.ts` and MongoDB,
  with no code fork required.

- **Unified time range for charts**: Navbar time range selector drives all time-based
  charts. Radar (catch and revenue seasonality) now use the same time range as time
  series and treemaps instead of a hardcoded year.

## Improvements

- **Navigation**: Ask Data, Settings, and Map entries can be hidden from nav and
  search (Hydrogen, Lithium, Boron layouts and page-links) for country-specific
  deployments.

- **API**: `monthlySummary.radarData` accepts a `months` parameter (date range)
  instead of a single `year`, returning an array of month-labeled points for the
  selected range. Month labels include the year when the range spans two years.

- **Documentation**: Added `COUNTRY_SETUP.md` for adding a new country to the
  dashboard (config, env, locales, deploy).

## Bug Fixes

- None in this release.

---

# peskas.dashboard 0.1.0

## New Features

- Turborepo monorepo with Next.js 14+ App Router, tRPC API, and MongoDB (nosql).
- Fisheries dashboard with catch, revenue, catch composition, district filters,
  and time range selector.
- Multiple layout themes (Hydrogen, Lithium, Carbon, Beryllium, Boron).
- Shared packages: isomorphic-core (UI), api (tRPC routers), nosql (schemas).

## Improvements

- Tailwind CSS styling; type-safe tRPC procedures; NextAuth integration.

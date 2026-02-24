# peskas.zanzibar.v2 1.1.0

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

# peskas.zanzibar.v2 1.0.0

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

# peskas.zanzibar.v2 0.1.0

## New Features

- Turborepo monorepo with Next.js 14+ App Router, tRPC API, and MongoDB (nosql).
- Fisheries dashboard with catch, revenue, catch composition, district filters,
  and time range selector.
- Multiple layout themes (Hydrogen, Lithium, Carbon, Beryllium, Boron).
- Shared packages: isomorphic-core (UI), api (tRPC routers), nosql (schemas).

## Improvements

- Tailwind CSS styling; type-safe tRPC procedures; NextAuth integration.

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

# Peskas Dashboard

Multi-country fisheries monitoring dashboard for the [Peskas](https://peskas.org) platform. It gives fisheries managers and researchers a live view of small-scale coastal fisheries — catch volumes, revenue, fishing effort, and gear composition — broken down by district and updated regularly from field data.

Each country deployment runs from this single codebase, configured via environment variables. No code forks required when adding a new country.

Currently deployed for: **Zanzibar**, **Kenya**, **Mozambique**.

## What the dashboard shows

- **Catch & revenue trends** over time, filterable by district and date range
- **District-level summaries** with regional breakdowns and an interactive map
- **Gear composition** — what fishing methods are used and how they compare
- **CPUE / RPUE** (catch and revenue per unit effort) as efficiency indicators
- **District filter** — focus on one area or compare across the whole country

## Development

```bash
pnpm install
pnpm run i18n:dev    # starts the dashboard at localhost:3001
```

To switch country locally, edit `apps/isomorphic-i18n/.env`:
```
NEXT_PUBLIC_COUNTRY_CODE=KE   # TZ | KE | MZ
MONGODB_URI=<country-cluster-uri>
```
Then restart the dev server.

## Deployment

Each country is a separate Vercel project pointing to this repo. Only two environment variables differ between deployments: `NEXT_PUBLIC_COUNTRY_CODE` and `MONGODB_URI`. Everything else — the code, the features, the UI — is identical.

See [`apps/isomorphic-i18n/COUNTRY_SETUP.md`](apps/isomorphic-i18n/COUNTRY_SETUP.md) for how to add a new country.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Turborepo monorepo with multiple Next.js applications. Use these commands:

**Development:**
- `pnpm install` - Install dependencies
- `pnpm run dev` - Start all apps in development mode
- `pnpm run iso:dev` - Run only the main isomorphic app
- `pnpm run starter:dev` - Run only the starter app
- `pnpm run i18n:dev` - Run only the i18n app

**Build & Production:**
- `pnpm run build` - Build all apps
- `pnpm run start` - Start all apps in production
- `pnpm run iso:build` && `pnpm run iso:start` - Build and run main app only

**Linting:**
- `pnpm run lint` - Lint all apps
- `pnpm run iso:lint` - Lint main app only

**Cleanup:**
- `pnpm run clean` - Clean build artifacts and node_modules

## Architecture Overview

### Monorepo Structure
- **apps/isomorphic/** - Main dashboard application (Peskas Zanzibar fisheries dashboard)
- **apps/isomorphic-i18n/** - Internationalized version
- **apps/isomorphic-starter/** - Minimal starter template
- **packages/api/** - tRPC API layer with routers for fisheries data
- **packages/nosql/** - MongoDB schemas and migrations for fisheries data
- **packages/isomorphic-core/** - Shared UI components and utilities
- **packages/config-tailwind/** - Shared Tailwind configuration
- **packages/config-typescript/** - TypeScript configurations

### Technology Stack
- **Framework:** Next.js 14+ with App Router
- **Build System:** Turborepo for monorepo management
- **Package Manager:** pnmp 9.1.4
- **Styling:** Tailwind CSS with multiple layout themes
- **Database:** MongoDB with custom schemas
- **API:** tRPC for type-safe API communication
- **Authentication:** NextAuth.js integration
- **UI Components:** Custom component library in isomorphic-core

### Key Application Features
The main isomorphic app is a fisheries dashboard with:
- Multiple dashboard layouts (Hydrogen, Carbon, Beryllium, etc.)
- File management system with storage analytics
- Data visualization for fisheries statistics
- Multi-language support (i18n version)
- Authentication and user management
- Export functionality for data

### Database Schema
Key collections in nosql package:
- `individual-data.ts` - Individual fisheries catch records
- `catch-monthly.ts` - Monthly aggregated catch data
- `district-summary.ts` - District-level summaries
- `gear-summary.ts` - Fishing gear statistics
- `bmu.ts` - Beach Management Unit data

### API Architecture
tRPC routers in packages/api:
- `aggregated-catch.ts` - Catch aggregation endpoints
- `fish-distribution.ts` - Fish distribution data
- `monthly-stats.ts` - Monthly statistics
- `map-distribution.ts` - Geographic distribution data
- `gear.ts` - Fishing gear data
- `district-summary.ts` - District summary endpoints

### Layout System
Multiple pre-built layout themes:
- **Hydrogen** - Default dashboard layout
- **Carbon** - Alternative sidebar layout
- **Beryllium** - Fixed sidebar layout
- **Helium/Lithium/Boron** - Additional layout variations

Each layout includes header, sidebar, and responsive navigation components.

### Environment Variables
Required for build (defined in turbo.json):
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - NextAuth URL
- `MONGODB_URI` - MongoDB connection string
- `VERCEL_URL` - Vercel deployment URL (optional)

## Claude Code Configuration

This project uses a structured Claude Code setup for the main monorepo (apps/isomorphic, packages). Configuration lives at the repo root.

### Quick Commands

- `/plan` - Create implementation plan for new features (uses Architect agent)
- `/code-review` - Code quality and consistency review (uses Code Reviewer agent)
- `/build-fix` - Fix TypeScript/ESLint errors
- `/document` - Document significant changes (updates memory)

### Documentation

- `.claude/QUICK_START.md` - Quick reference
- `.claude/agents/` - Architect, Code Reviewer, Security Reviewer
- `.claude/commands/` - plan, code-review, build-fix, document
- `.claude/skills/` - coding-standards, frontend-patterns (Next.js, Tailwind), backend-patterns (tRPC, MongoDB)
- `.claude/memory/` - session-context.json, architecture-decisions.md, data-models.md
- `.claude/contexts/` - dev.md, review.md

### Quick Start

1. Read `.claude/QUICK_START.md` for common workflows
2. Check `.claude/memory/session-context.json` for current stack and patterns
3. Review relevant skills in `.claude/skills/` for your task
4. Use `/plan` for complex features
5. Run `/code-review` before committing

**Note:** The folder `tracks-explorer/` is a separate app (Vite, Express, Tabler). When working inside `tracks-explorer/`, use that app’s own `.claude/` and `CLAUDE.md`. This root setup applies to the main dashboard apps and shared packages.

## Critical Rules

### Pre-Edit Checklist

Before making any code changes:

- [ ] Read `.claude/FEATURE_IMPLEMENTATION_GUIDE.md`
- [ ] Check `.claude/memory/data-models.md` and `session-context.json`
- [ ] Read relevant skills in `.claude/skills/`
- [ ] Check existing patterns in similar code; align with architecture
- [ ] Prefer Tailwind; avoid one-off custom CSS when Tailwind suffices
- [ ] Read the file you are about to edit fully first

### Code Style

- Many small files; high cohesion, low coupling
- Immutability: do not mutate objects or arrays in place
- No emojis in code or comments; no `console.log` in production code
- TypeScript strict; no `any`; use types from tRPC and nosql
- Use tRPC for data from the UI; do not add ad-hoc fetch for domain data
- Shared UI in `packages/isomorphic-core`; use Tailwind for styling

### Testing and Quality

- Run lint/build; use `/build-fix` and `/code-review` before committing
- Handle loading and error states in UI; validate inputs in tRPC

### Security

- No hardcoded secrets; use env for NEXTAUTH_*, MONGODB_URI
- Validate all user inputs; use projection and safe queries in procedures

## Workflow for Making Changes

1. **REFERENCE** - Check `.claude/memory/session-context.json` for patterns
2. **PLAN** - Use `/plan` for complex features
3. **READ** - Check relevant skills in `.claude/skills/`
4. **UNDERSTAND** - Review similar code in the codebase
5. **IMPLEMENT** - Follow guidelines and established patterns
6. **FIX** - Run `/build-fix` for TypeScript/ESLint errors
7. **REVIEW** - Run `/code-review` before committing
8. **TEST** - Run dev server and lint
9. **DOCUMENT** - Use `/document` for significant changes
10. **COMMIT** - Meaningful, conventional commit message

## When to Ask

Ask the user before proceeding if:

- Requirements or acceptance criteria are unclear
- Multiple valid approaches exist and a product/architecture decision is needed
- The change would be breaking or affect existing functionality
- An architectural or design decision is required

## Development Notes

### Working with the Main App
- Main dashboard code is in `apps/isomorphic/src/app/(hydrogen)/`
- Shared components are in `packages/isomorphic-core/src/components/`
- API routes are in `packages/api/src/router/`
- Database schemas are in `packages/nosql/src/schema/`

### Adding New Features
1. Add API endpoints in `packages/api/src/router/`
2. Create/update database schemas in `packages/nosql/src/schema/`
3. Build UI components in `packages/isomorphic-core/src/components/`
4. Implement pages in the appropriate app directory

### Code Organization
- Follow existing patterns for file structure and naming
- Components use Tailwind CSS for styling
- TypeScript is used throughout with strict typing
- tRPC provides end-to-end type safety

### Database Migrations
- Migration files are in `packages/nosql/migrations/`
- Use the migration system for schema changes
- Test with `packages/nosql/src/test-monthly.ts`
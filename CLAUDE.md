# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TGT Holdings is a financial intelligence platform built with Next.js 16 (App Router) that provides:
- Real-time exchange rates with trend analysis and trading signals
- Monetary indicators (velocity, multiplier, interest rates) across countries
- Stock price tracking and visualization
- Wealth scenario dashboard with economic indicators

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run generate-types  # Generate Supabase TypeScript types
```

## Architecture

### Data Flow
1. **Supabase Edge Functions** fetch data from external APIs (Yahoo Finance, FRED, ECOS)
2. **Supabase PostgreSQL** stores the processed data
3. **React Query hooks** (`lib/hooks/`) fetch and cache data client-side
4. **Components** render charts and UI using Recharts and shadcn/ui

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `components/ui/` - shadcn/ui components (radix-maia style)
- `components/indicators/` - Chart and data visualization components
- `components/tools/` - Exchange rate and asset tools
- `lib/hooks/` - React Query data fetching hooks
- `lib/types/` - TypeScript type definitions
- `lib/supabase/` - Supabase client utilities (server.ts for Server Components, browser.ts for Client Components)

### Supabase Integration
- Edge Functions handle external API calls and data collection
- See `docs/edge-functions.md` for Edge Function documentation
- Use `lib/supabase/server.ts` in Server Components/Actions
- Use `lib/supabase/browser.ts` in Client Components

### State Management
- TanStack Query for server state with 60s staleTime default
- next-themes for dark mode
- Providers wrapped in `app/providers.tsx`

### Environment Variables
Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `FRED_API_KEY` - Federal Reserve Economic Data API
- `ECOS_API_KEY` - Bank of Korea Economic Statistics System API

## Coding Conventions

### Path Aliases
Use `@/` for imports: `@/components`, `@/lib`, `@/hooks`

### Component Patterns
- Use `'use client'` directive for components with hooks or interactivity
- Wrap async data fetching in React Query hooks
- Use Suspense with skeleton components for loading states

### Styling
- Tailwind CSS v4 with CSS variables
- shadcn/ui components with radix-maia style
- Use `cn()` utility from `lib/utils.ts` for conditional classes

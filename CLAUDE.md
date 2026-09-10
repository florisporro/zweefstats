# Zweefstats Project Guide

## Build Commands

- `npm run dev` - Start development server (KV binding emulated via platformProxy)
- `npm run build` - Build for production
- `npm run preview` - Build, then serve on the real Workers runtime via `wrangler dev`
- `npm run check` - Run type checking
- `npm run lint` - Run linting
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run cf-typegen` - Regenerate `worker-configuration.d.ts` after editing `wrangler.jsonc`
- `npm run deploy` - Build and deploy manually (production deploys run from git via Workers Builds)

## Code Style

- **TypeScript**: Use strict typing; shared models are ambient declarations in `src/global.d.ts`
- **Components**: Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`, `$bindable`)
- **CSS**: Tailwind 4, configured CSS-first in `src/app.css`. Component `<style>` blocks that
  use `@apply` need a `@reference '<path>/app.css'` at the top of the block.
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Return typed values, use null checks before operations
- **Imports**: Group by external libraries then internal modules

## Project Structure

- `/src/lib` - Reusable components and utilities
- `/src/lib/server` - Server-only code; never reaches the client bundle
- `/src/routes` - SvelteKit page routes
- `/src/routes/api` - Worker endpoints (KV-backed national statistics)

## Deployment

One Cloudflare Worker serves the app and its API. `wrangler.jsonc` holds every binding;
pushing to `master` deploys through the Workers Builds git connection. The build needs
`PUBLIC_ZWEEFAPP_BASE_URL` set (see `.env.example`) or it fails.

The national statistics in KV are rebuilt when a pilot shares their logbook, debounced to
at most once every 15 minutes. There is no cron.

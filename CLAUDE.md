# Zweefstats Project Guide

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Run type checking
- `npm run lint` - Run linting
- `npm run format` - Format code with Prettier
- `npm run build:server` - Build server code
- `npm run preview:server` - Preview server with Wrangler
- `npm run deploy:server` - Deploy server with Wrangler

## Code Style

- **TypeScript**: Use strict typing with interfaces defined in global.d.ts
- **Components**: Svelte components use .svelte extension with <script>, markup, and <style> sections
- **CSS**: Use Tailwind CSS with @apply directives in component styles
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Return typed values, use null checks before operations
- **Imports**: Group by external libraries then internal modules

## Project Structure

- `/src/lib` - Reusable components and utilities
- `/src/routes` - SvelteKit page routes
- `/src/server` - Server-side code for Cloudflare Workers

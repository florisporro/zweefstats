# acvz-progressie-validator

## Introduction

Simple static site built with SvelteKit to take a CSV file containing soaring pilots flight statistics (exported from a popular Dutch flight administration app: Zweef.app) and analyze it in various ways helpful to pilots. The permission checks are very specific to the requirements at my club, but could be easily adopted for other purposes.

It's deployed here: [https://zweefstats.pages.dev/](https://zweefstats.pages.dev/)

Here is an anonymized example CSV that you can try it with.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

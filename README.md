# Zweefstats

## Introduction

Simple static site built with SvelteKit, hosted on Cloudflare, to take a CSV file containing soaring pilots flight statistics (exported from a popular Dutch flight administration app called Zweef app) and analyze it in various ways helpful to pilots. The soaring sport is organized into local clubs, each with their own minimum experience requirements to qualify for the use of aircraft etc. Some of those requirements might be to have a certain number of hours or flights on a given type. Validating the progression of those requirements can be an error-prone task.

The permission checks I've programmed are very specific to the requirements at my club, but could be easily adopted for other purposes.

It's deployed here: [https://zweefstats.pages.dev/](https://zweefstats.pages.dev/)

[Here is an anonymized example CSV](https://raw.githubusercontent.com/florisporro/acvz-progressie-validator/master/example.csv) that you can try it with if you don't have access to such data.

## Developing

Install dependencies with `npm install` (or `pnpm install` or `yarn`). Then to start a development server:

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

A demo is deployed here on Cloudflare Pages: [https://zweefstats.pages.dev/](https://zweefstats.pages.dev/)
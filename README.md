# Weidmüller Orange Weeks 2025 Experience

> 3D Walkthrough of the Weidmüller Orange Weeks 2025

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm install
npm run build
```

> Vite build output is in the `dist` folder after building. The build can be deployed to any static file server.

## Webcomponent

Build the webcomponent for embedding in other websites:

```bash
npm install
npm run build:wc
```

Usage:

```html
<orange-weeks-tour
  data-base-url="./public"
  data-lang="en"
  data-initial-scene="foyer">
</orange-weeks-tour>
<script type="module" src="./orange-weeks-tour.js"></script>
```

> Build output is in `dist-webcomponent`. The webcomponent can be embedded in any HTML page with the required assets served from `dist-webcomponent/public`.

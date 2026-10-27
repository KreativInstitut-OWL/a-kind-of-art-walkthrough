import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isWebComponent = process.env.BUILD_MODE === "webcomponent";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    allowedHosts: ["localhost", ".local", ".ngrok-free.app"],
    host: "0.0.0.0",
  },
  // Relative base so the SPA build works from any sub-path (e.g. GitHub Pages project sites)
  base: isWebComponent ? "/" : "./",
  publicDir: isWebComponent ? false : "public", // Don't copy public assets for web component builds
  define: isWebComponent
    ? {
        // Provide process globals for browser environment
        global: "globalThis",
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env": {},
        process: {
          env: {},
          browser: true,
        },
      }
    : undefined,
  build: isWebComponent
    ? {
        // Web Component build configuration
        lib: {
          entry: path.resolve(__dirname, "src/webcomponent.tsx"),
          name: "AKindOfArt",
          formats: ["es"],
          fileName: () => "a-kind-of-art.js",
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true, // Bundle everything in one file
            assetFileNames: "a-kind-of-art.[ext]",
          },
        },
        cssCodeSplit: false,
        outDir: "dist-webcomponent",
        emptyOutDir: true,
        minify: false, // Disable minification for easier debugging
      }
    : {
        // Standalone SPA build configuration (default)
        outDir: "dist",
        emptyOutDir: true,
      },
});

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./suppress-errors";
import "./i18n";
import App from "./App.tsx";
import { ErrorBoundary } from "./ErrorBoundary";
import "./index.css";
import { setAssetBaseUrl } from "./utils/asset-url";

// Resolve public assets against the deploy base (e.g. a GitHub Pages sub-path)
setAssetBaseUrl(import.meta.env.BASE_URL);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

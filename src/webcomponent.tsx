import { createRoot } from "react-dom/client";
import { setAssetBaseUrl } from "@/utils/asset-url";
import { initI18nForWebComponent } from "@/i18n-webcomponent";
import { WebComponentApp } from "./webcomponent-wrapper";
import "./index.css";

class AKindOfArt extends HTMLElement {
  private root: any;
  private shadow: ShadowRoot | null = null;
  private keyboardHandler: ((event: KeyboardEvent) => void) | null = null;

  private setupKeyboardPrevention() {
    // Game control keys that should not scroll the parent page
    const gameKeys = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'W', 'a', 'A', 's', 'S', 'd', 'D',
      ' ', 'Space',
      'e', 'E', 'Escape'
    ]);

    this.keyboardHandler = (event: KeyboardEvent) => {
      // Check if the event target is an input element (similar to useKeyPress logic)
      const target = (event.composedPath?.()?.[0] || event.target) as Element | null;
      if (target?.nodeType !== 1) return;

      const isInput =
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.nodeName) ||
        target.hasAttribute('contenteditable') ||
        target.closest('.nokey');

      // If it's an input field, let the event bubble normally
      if (isInput) return;

      // If it's a game control key, prevent default to avoid scrolling
      if (gameKeys.has(event.key)) {
        event.preventDefault();
      }
    };

    // Add the event listener to the document to catch events before they reach the parent
    document.addEventListener('keydown', this.keyboardHandler, true);
  }

  connectedCallback() {
    // Create shadow DOM
    this.shadow = this.attachShadow({ mode: "open" });

    // Extract attributes
    const baseUrl = this.getAttribute("data-base-url") || "";
    const lang = this.getAttribute("data-lang") || "en";
    const initialScene = this.getAttribute("data-initial-scene") || "foyer";

    // Configure asset base URL globally
    setAssetBaseUrl(baseUrl);

    // Initialize i18n with provided language
    initI18nForWebComponent(lang);

    // Add keyboard event prevention for game controls
    this.setupKeyboardPrevention();

    // Create mount point
    const mountPoint = document.createElement("div");
    mountPoint.style.width = "100%";
    mountPoint.style.height = "100%";
    mountPoint.style.display = "block";
    mountPoint.style.transform = "scale(1)";

    // Inject bundled styles into shadow DOM
    this.injectStyles();

    this.shadow.appendChild(mountPoint);

    // Mount React app
    this.root = createRoot(mountPoint);
    this.root.render(
      <WebComponentApp initialScene={initialScene} lang={lang} />
    );
  }

  disconnectedCallback() {
    this.root?.unmount();

    // Clean up keyboard event listener
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler, true);
      this.keyboardHandler = null;
    }
  }

  private injectStyles() {
    if (!this.shadow) return;

    // Inject CSS variables directly from theme-vars.css
    import("./theme-vars.css?inline")
      .then((cssModule: any) => {
        const css = cssModule.default;
        // Transform CSS for Shadow DOM: replace :root with :host
        const shadowCss = css.replace(/:root/g, ':host').replace(/\.dark/g, ':host(.dark)');
        const varsStyle = document.createElement("style");
        varsStyle.textContent = shadowCss;
        this.shadow!.appendChild(varsStyle);
      })
      .catch((error) => {
        throw new Error(
          `Failed to load theme variables from theme-vars.css: ${error}`
        );
      });

    // Try to load Tailwind utilities
    import("./index.css?inline")
      .then((cssModule: any) => {
        const style = document.createElement("style");
        style.textContent = cssModule.default;
        this.shadow!.appendChild(style);
      })
      .catch(() => {
        console.warn(
          "Could not load inline CSS utilities - this may be expected if using Tailwind v4"
        );
      });
  }

  // Allow dynamic attribute changes
  static get observedAttributes() {
    return ["data-lang", "data-initial-scene"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    // Handle language changes
    if (name === "data-lang" && this.root) {
      initI18nForWebComponent(newValue);
    }
    // Scene changes would need store update - implement if needed
  }
}

customElements.define("a-kind-of-art", AKindOfArt);

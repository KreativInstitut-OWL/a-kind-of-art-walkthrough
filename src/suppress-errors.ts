// Suppress known non-critical errors and warnings
if (typeof window !== "undefined") {
  // Suppress PlayCanvas console warnings
  const originalWarn = console.warn;
  const suppressPatterns = [
    /PlayCanvas/i,
    /WebGL/i,
    /DEPRECATED/i,
    /geometry.tangents/i,
  ];

  console.warn = function (...args) {
    const message = args
      .map((arg) => (typeof arg === "string" ? arg : String(arg)))
      .join(" ");

    const shouldSuppress = suppressPatterns.some((pattern) =>
      pattern.test(message)
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Handle unhandled promise rejections gracefully
  window.addEventListener("unhandledrejection", (event) => {
    // Log but don't crash for PlayCanvas asset loading issues
    if (event.reason?.toString().includes("PlayCanvas")) {
      console.debug("PlayCanvas async error handled:", event.reason);
      event.preventDefault();
    }
  });

  // Suppress specific console errors
  const originalError = console.error;
  console.error = function (...args) {
    const message = args
      .map((arg) => (typeof arg === "string" ? arg : String(arg)))
      .join(" ");

    // Allow real errors through, suppress known warnings
    if (!suppressPatterns.some((pattern) => pattern.test(message))) {
      originalError.apply(console, args);
    }
  };
}

import { useState, useEffect } from "react";

function isTouch() {
  if (typeof window === "undefined") return false;

  const hasFinePointer =
    window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  // If device has fine pointer capability, treat as non-touch
  if (hasFinePointer) {
    return false;
  }

  // Only check for touch if no fine pointer
  return (
    "ontouchstart" in window ||
    (navigator.maxTouchPoints || 0) > 0 ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
  );
}

export function useIsTouch() {
  const [enabled, setEnabled] = useState(() => isTouch());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = () => setEnabled(isTouch());
    const abortController = new AbortController();

    mediaQuery.addEventListener("change", handleChange, {
      signal: abortController.signal,
    });
    return () => abortController.abort();
  }, []);

  return enabled;
}

function shouldUseTouchOnly() {
  if (typeof window === "undefined") return false;

  // If device has fine pointer capability (mouse, touchpad, precision stylus), prefer keyboard
  const hasFinePointer =
    window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  return !hasFinePointer && (
    "ontouchstart" in window ||
    (navigator.maxTouchPoints || 0) > 0 ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
  );
}

export function usePreferredControls() {
  const [isTouchOnly, setIsTouchOnly] = useState(() => shouldUseTouchOnly());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handleChange = () => setIsTouchOnly(shouldUseTouchOnly());
    const abortController = new AbortController();

    mediaQuery.addEventListener("change", handleChange, {
      signal: abortController.signal,
    });
    return () => abortController.abort();
  }, []);

  return isTouchOnly ? 'touch' : 'keyboard';
}

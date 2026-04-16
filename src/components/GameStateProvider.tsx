import { useApp } from "@playcanvas/react/hooks";
import { useEffect } from "react";
import { gameState } from "@/lib/stores";

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const app = useApp();

  useEffect(() => {
    if (!app) return;

    // Listen to pause state changes
    const onPauseChanged = (paused: boolean) => {
      gameState.setState({ isPaused: paused });
    };

    // Listen to pointer lock changes from PointerLockManager
    const onPointerLockChanged = (locked: boolean) => {
      gameState.setState({ isPointerLocked: locked });
    };

    (app as any).on("pause:changed", onPauseChanged);
    (app as any).on("pointerlock:changed", onPointerLockChanged);

    return () => {
      (app as any).off("pause:changed", onPauseChanged);
      (app as any).off("pointerlock:changed", onPointerLockChanged);
    };
  }, [app]);

  useEffect(() => {
    // Listen to fullscreen changes - works for both regular and iframe contexts
    const onFullscreenChange = () => {
      // Check fullscreen on document or window.top for iframe contexts
      const isFullscreen = !!(
        document.fullscreenElement ||
        (window.top as any)?.document?.fullscreenElement ||
        (window as any).fullscreen
      );
      gameState.setState({ isFullscreen });
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    // Also listen to the parent document for iframe contexts
    if (window.top !== window) {
      try {
        (window.top as any).document?.addEventListener("fullscreenchange", onFullscreenChange);
      } catch (e) {
        // CORS issues possible
      }
    }

    // Set initial state
    onFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (window.top !== window) {
        try {
          (window.top as any).document?.removeEventListener("fullscreenchange", onFullscreenChange);
        } catch (e) {
          // CORS issues possible
        }
      }
    };
  }, []);

  return <>{children}</>;
}

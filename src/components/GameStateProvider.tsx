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
    // Listen to fullscreen changes
    const onFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      gameState.setState({ isFullscreen });
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    // Set initial state
    onFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  return <>{children}</>;
}

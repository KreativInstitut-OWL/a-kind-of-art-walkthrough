import { Scene } from "@/components/pc/Scene";
import { data } from "@/data";
import { useGameState } from "@/lib/stores";
import { trackData } from "@/utils/tracking";
import { Application } from "@playcanvas/react";
import { useApp } from "@playcanvas/react/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FILLMODE_NONE, Entity as PcEntity, RESOLUTION_AUTO } from "playcanvas";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { ActivePointOfInterestOverlay } from "./ActivePointOfInterestOverlay";
import { Crosshair } from "./Crosshair";
import { GameStateProvider } from "./GameStateProvider";
import { GenericOverlay } from "./GenericOverlay";
import { KeyboardControlsOverlay } from "./KeyboardControlsOverlay";
import { LoadingOverlay } from "./LoadingOverlay";
import { SettingsMenu } from "./SettingsMenu";
import { HelpOverlay } from "./HelpOverlay";
import { TouchControlsOverlay } from "./TouchControlsOverlay";
import { usePreferredControls } from "@/hooks/useIsTouch";

function useOnWindowResize({ onResize }: { onResize: () => void }) {
  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);
}

// Consolidated pointer lock and input management
function usePointerLockManagement() {
  // Pointer lock is now managed entirely by PauseStateManager
  // No need to manage it here anymore
  return null;
}

function PointerLockController() {
  usePointerLockManagement();
  return null;
}

function ResizeApp() {
  const app = useApp();
  useOnWindowResize({
    onResize: useCallback(() => {
      app?.resizeCanvas();
    }, [app]),
  });
  return null;
}

export function PlayCanvasApplication() {
  const { currentSceneId, quality } = useGameState();
  const preferredControls = usePreferredControls();

  // Detect mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const sceneData = useMemo(() => {
    return data.scenes.find((scene) => scene.id === currentSceneId)!;
  }, [currentSceneId]);

  const sceneRef = useRef<PcEntity>(null);

  // Track initial scene load
  useEffect(() => {
    trackData({
      eventData: {
        action: "scene-load",
        label: sceneData.id,
      },
    });
  }, [sceneData.id]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
          },
        },
      }),
    []
  );

  // Optimize graphics settings for mobile
  const graphicsDeviceOptions = useMemo(() => ({
    antialias: !isMobile,
    powerPreference: (isMobile ? "low-power" : "high-performance") as any,
  }), [isMobile]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative w-full h-full">
        <Application
          fillMode={FILLMODE_NONE}
          resolutionMode={RESOLUTION_AUTO}
          graphicsDeviceOptions={graphicsDeviceOptions}
          usePhysics
        >
          <GameStateProvider>
            <PointerLockController />
            <Suspense
              fallback={<LoadingOverlay displayName={sceneData.displayName} />}
            >
              <ActivePointOfInterestOverlay />
              <ResizeApp />
              <Scene
                key={sceneData.id + quality}
                sceneData={sceneData}
                ref={sceneRef}
              />
            </Suspense>
            <GenericOverlay />
            <Crosshair />
            <SettingsMenu />
            <HelpOverlay />
            {preferredControls === 'touch' ? (
              <TouchControlsOverlay />
            ) : (
              <KeyboardControlsOverlay />
            )}
          </GameStateProvider>
        </Application>
      </div>
    </QueryClientProvider>
  );
}

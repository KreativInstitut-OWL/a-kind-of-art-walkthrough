import React from "react";
import { Fullscreen, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { gameState } from "@/lib/stores";

export function GenericOverlay() {
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    // Check if fullscreen is supported
    const supported = !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );
    setIsSupported(supported);
  }, []);

  const handleFullscreen = async () => {
    try {
      // Get the application container (parent of canvas) to include all UI overlays
      const appContainer = document.querySelector(".relative.w-full.h-full");
      if (!appContainer) {
        return;
      }

      // Check current fullscreen state
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        // Try to request fullscreen on the app container (includes UI overlays)
        const request =
          (appContainer as any).requestFullscreen?.() ||
          (appContainer as any).webkitRequestFullscreen?.() ||
          (appContainer as any).mozRequestFullScreen?.() ||
          (appContainer as any).msRequestFullscreen?.();

        if (request?.catch) {
          request.catch(() => {});
        }
      } else {
        // Try to exit fullscreen
        const exitMethod =
          document.exitFullscreen?.() ||
          (document as any).webkitExitFullscreen?.() ||
          (document as any).mozCancelFullScreen?.() ||
          (document as any).msExitFullscreen?.();

        if (exitMethod?.catch) {
          exitMethod.catch(() => {
            // ignore
          });
        }
      }
    } catch {
      // silently fail
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-[9999] flex gap-2 pointer-events-auto">
        {isSupported && (
          <Button 
            onClick={handleFullscreen} 
            variant="secondary" 
            size="icon" 
            className="shadow-lg active:scale-95 transition-transform"
          >
            <Fullscreen />
          </Button>
        )}
        <Button
          onClick={() => gameState.toggleHelp()}
          variant="secondary"
          size="icon"
          className="shadow-lg active:scale-95 transition-transform"
        >
          <HelpCircle />
        </Button>
      </div>
    </>
  );
}

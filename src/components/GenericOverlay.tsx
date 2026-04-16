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
      // For web components, we need to get the container differently
      // First try to find the app container within this component
      let appContainer = document.querySelector(".relative.w-full.h-full");
      
      // If not found (we're in Shadow DOM), try to get the closest container or use the shadow host
      if (!appContainer) {
        // Try to find the canvas container or main app div
        appContainer = document.querySelector("div[style*='width: 100%'][style*='height: 100%']");
      }
      
      if (!appContainer) {
        console.warn("Could not find fullscreen container");
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
        // Try to request fullscreen on the app container
        try {
          await (appContainer as any).requestFullscreen?.() ||
          await (appContainer as any).webkitRequestFullscreen?.() ||
          await (appContainer as any).mozRequestFullScreen?.() ||
          await (appContainer as any).msRequestFullscreen?.();
        } catch (error) {
          console.warn("Fullscreen request failed:", error);
        }
      } else {
        // Try to exit fullscreen
        try {
          await document.exitFullscreen?.() ||
          await (document as any).webkitExitFullscreen?.() ||
          await (document as any).mozCancelFullScreen?.() ||
          await (document as any).msExitFullscreen?.();
        } catch (error) {
          console.warn("Exit fullscreen failed:", error);
        }
      }
    } catch (error) {
      console.warn("Fullscreen error:", error);
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

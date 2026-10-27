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
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        const elem = (document.querySelector("#root") || document.documentElement) as any;
        
        console.log("Requesting fullscreen on:", elem);
        console.log("Has requestFullscreen:", !!elem.requestFullscreen);
        console.log("Has webkitRequestFullscreen:", !!elem.webkitRequestFullscreen);
        console.log("Has mozRequestFullScreen:", !!elem.mozRequestFullScreen);
        console.log("Has msRequestFullscreen:", !!elem.msRequestFullscreen);
        
        let requested = false;
        
        try {
          if (elem.requestFullscreen) {
            console.log("Using requestFullscreen");
            await elem.requestFullscreen();
            requested = true;
          } else if (elem.webkitRequestFullscreen) {
            console.log("Using webkitRequestFullscreen");
            await elem.webkitRequestFullscreen();
            requested = true;
          } else if (elem.mozRequestFullScreen) {
            console.log("Using mozRequestFullScreen");
            await elem.mozRequestFullScreen();
            requested = true;
          } else if (elem.msRequestFullscreen) {
            console.log("Using msRequestFullscreen");
            await elem.msRequestFullscreen();
            requested = true;
          }
          
          if (requested) {
            console.log("Fullscreen request successful");
          } else {
            console.warn("No fullscreen method available");
          }
        } catch (error) {
          console.error("Fullscreen request error:", error);
        }
      } else {
        console.log("Exiting fullscreen");
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            await (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
          console.log("Exited fullscreen");
        } catch (error) {
          console.error("Exit fullscreen error:", error);
        }
      }
    } catch (error) {
      console.error("Fullscreen handler error:", error);
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

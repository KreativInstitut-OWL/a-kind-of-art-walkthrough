import { gameState } from "@/lib/stores";
import React from "react";
import { Button } from "./ui/button";

export function QualitySelector({ onSelected }: { onSelected: () => void }) {
  const handleQualitySelect = React.useCallback((quality: "lq" | "mq" | "hq") => {
    gameState.setQuality(quality);
    localStorage.setItem("qualitySelected", "true");
    onSelected();
  }, [onSelected]);

  React.useEffect(() => {
    // Auto-detect quality on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const hasSelection = localStorage.getItem("qualitySelected");
    
    // If on mobile and no selection made, auto-select LQ after 2 seconds
    if (isMobile && !hasSelection) {
      const timer = setTimeout(() => {
        const currentQuality = localStorage.getItem("qualitySelected");
        if (!currentQuality) {
          handleQualitySelect("lq");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [handleQualitySelect]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-black/90 border border-white/20 px-8 py-12 max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-2">A KInd of Art</h1>
        <p className="text-white/70 mb-8">
          Wähle eine Qualität für optimales Laden
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => handleQualitySelect("lq")}
            className="w-full bg-[#55fc27] text-black hover:bg-[#55fc27]/80"
          >
            Low Quality (schneller Laden)
          </Button>
          <Button
            onClick={() => handleQualitySelect("mq")}
            className="w-full bg-[#55fc27] text-black hover:bg-[#55fc27]/80"
          >
            Medium Quality (empfohlen)
          </Button>
          <Button
            onClick={() => handleQualitySelect("hq")}
            className="w-full bg-[#55fc27] text-black hover:bg-[#55fc27]/80"
          >
            High Quality (bestes Aussehen)
          </Button>
        </div>

        <p className="text-white/50 text-xs mt-8">
          Du kannst die Qualität später in den Einstellungen ändern
        </p>
      </div>
    </div>
  );
}

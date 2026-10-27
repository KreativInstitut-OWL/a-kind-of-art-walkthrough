import { gameState, useGameState } from "@/lib/stores";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePreferredControls } from "@/hooks/useIsTouch";

export function HelpOverlay() {
  const { isHelpOpen } = useGameState();
  const preferredControls = usePreferredControls();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close help when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (overlayRef.current?.contains(target) && target === overlayRef.current) {
        gameState.setHelpOpen(false);
      }
    };

    if (isHelpOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.body.style.overflow = "";
      };
    }
  }, [isHelpOpen]);

  if (!isHelpOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
    >
      <div className={`bg-black border border-white/20 rounded-lg ${
        preferredControls === 'touch' 
          ? 'w-[350px] h-[200px] p-3 overflow-hidden' 
          : 'max-w-none w-2/6 p-8 max-h-[90vh] overflow-y-auto'
      }`}>
        <div className={`flex justify-between items-center overflow-hidden ${preferredControls === 'touch' ? 'mb-1' : 'mb-6'}`}>
          <h2 className={`font-semibold text-white ${preferredControls === 'touch' ? 'text-xs' : 'text-xl'}`}>Steuerung</h2>
          <button
            onClick={() => gameState.setHelpOpen(false)}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          >
            <X className={preferredControls === 'touch' ? 'size-3' : 'size-5'} />
          </button>
        </div>

        {/* Desktop Controls */}
        {preferredControls === 'keyboard' && (
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex justify-between items-center">
              <span>Bewegung</span>
              <span className="font-mono text-white">W, A, S, D</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Umschauen</span>
              <span className="font-mono text-white">Maus bewegen</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pause</span>
              <span className="font-mono text-white">ESC</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fortsetzen</span>
              <span className="font-mono text-white">Linksklick</span>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        {preferredControls === 'touch' && (
          <div className="space-y-0 text-[8px] text-white/80 mb-1 overflow-hidden">
            <div className="flex justify-between items-center leading-tight">
              <span>Bewegung</span>
              <span className="text-white">L-Stick</span>
            </div>
            <div className="flex justify-between items-center leading-tight">
              <span>Umschauen</span>
              <span className="text-white">R-Stick</span>
            </div>
            <div className="flex justify-between items-center leading-tight">
              <span>Einstellungen</span>
              <span className="text-white">Menü</span>
            </div>
          </div>
        )}

        <button
          onClick={() => gameState.setHelpOpen(false)}
          className={`w-full px-2 bg-[#55fc27] text-black font-semibold hover:bg-[#55fc27]/80 transition-colors ${
            preferredControls === 'touch' ? 'mt-1 py-0.5 text-[8px]' : 'mt-8 py-2'
          }`}
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

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
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isHelpOpen]);

  if (!isHelpOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className={`bg-black border border-white/20 rounded-lg p-8 max-h-[90vh] overflow-y-auto ${
        preferredControls === 'touch' 
          ? 'max-w-none w-11/12' 
          : 'max-w-none w-2/6'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Steuerung</h2>
          <button
            onClick={() => gameState.setHelpOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="size-5" />
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
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex justify-between items-center">
              <span>Bewegung</span>
              <span className="text-white">Linker Joystick</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Umschauen</span>
              <span className="text-white">Rechter Joystick</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Einstellungen</span>
              <span className="text-white">Burger Menu</span>
            </div>
          </div>
        )}

        <button
          onClick={() => gameState.setHelpOpen(false)}
          className="w-full mt-8 px-4 py-2 bg-[#55fc27] text-black font-semibold hover:bg-[#55fc27]/80 transition-colors"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

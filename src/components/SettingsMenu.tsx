import { gameState, useGameState } from "@/lib/stores";
import { Menu, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePreferredControls } from "@/hooks/useIsTouch";

export function SettingsMenu() {
  const { quality, isSettingsMenuOpen } = useGameState();
  const preferredControls = usePreferredControls();
  const menuRef = useRef<HTMLDivElement>(null);

  // Pause game and manage pointer lock when menu opens/closes
  useEffect(() => {
    // NOTE: Don't set isPaused here - let PauseStateManager handle pause state
    // SettingsMenu should only manage its own visibility
    
    if (isSettingsMenuOpen) {
      // Exit pointer lock when menu opens (shows cursor)
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else {
      // Re-enable pointer lock when menu closes (hides cursor) on desktop only
      if (!preferredControls.includes('touch')) {
        const canvas = document.querySelector("canvas");
        if (canvas && !document.pointerLockElement) {
          canvas.requestPointerLock();
        }
      }
    }
  }, [isSettingsMenuOpen, preferredControls]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) {
        gameState.setSettingsMenuOpen(false);
      }
    };

    if (isSettingsMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isSettingsMenuOpen]);



  const handleQualityChange = (newQuality: "lq" | "mq" | "hq") => {
    gameState.setQuality(newQuality);
  };

  return (
    <div ref={menuRef}>
      {/* Burger Button - always visible */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          gameState.toggleSettingsMenu();
        }}
        className="fixed top-4 right-4 z-50 inline-flex items-center justify-center size-9 bg-[#55fc27] text-black hover:bg-[#55fc27]/80 transition-colors"
      >
        {isSettingsMenuOpen ? (
          <X className="size-5" />
        ) : (
          <Menu className="size-5" />
        )}
      </button>

      {/* Menu Dropdown - positioned under E key hint on desktop, under burger menu on mobile */}
      {isSettingsMenuOpen && (
        <div className={`fixed bg-black border border-white/20 py-4 min-w-64 z-50 pointer-events-auto ${
          preferredControls === 'touch'
            ? 'top-14 right-4'
            : 'top-20 right-[52px]'
        }`} onClick={(e) => e.stopPropagation()}>
          <div className="px-4 pb-4 border-b border-white/20">
            <p className="text-white text-sm font-semibold mb-3">
              Qualität
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleQualityChange("lq");
                  gameState.setSettingsMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  quality === "lq"
                    ? "bg-[#55fc27] text-black font-semibold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Low Quality
              </button>
              <button
                onClick={() => {
                  handleQualityChange("mq");
                  gameState.setSettingsMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  quality === "mq"
                    ? "bg-[#55fc27] text-black font-semibold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Medium Quality
              </button>
              <button
                onClick={() => {
                  handleQualityChange("hq");
                  gameState.setSettingsMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  quality === "hq"
                    ? "bg-[#55fc27] text-black font-semibold"
                    : "text-white hover:bg-white/10"
                }`}
              >
                High Quality
              </button>
            </div>
          </div>

          <div className="px-4 pt-4">
            <p className="text-white/70 text-xs">
              Aktuelle Qualität: <span className="text-white font-semibold">{quality.toUpperCase()}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

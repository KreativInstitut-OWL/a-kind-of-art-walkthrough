import { gameState, useGameState } from "@/lib/stores";
import { useEffect, useRef } from "react";
import { usePreferredControls } from "@/hooks/useIsTouch";
import { useTranslation } from "react-i18next";

export function IntroOverlay() {
  const { isIntroOpen } = useGameState();
  const preferredControls = usePreferredControls();
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close intro when clicking outside (only on desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (preferredControls !== "touch") {
        const target = event.target as Node;
        if (overlayRef.current?.contains(target) && target === overlayRef.current) {
          gameState.setIntroOpen(false);
        }
      }
    };

    if (isIntroOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.body.style.overflow = "";
      };
    }
  }, [isIntroOpen, preferredControls]);

  if (!isIntroOpen) return null;

  const isMobile = preferredControls === "touch";

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
    >
      <div
        className={`bg-black border border-white/20 rounded-lg ${
          isMobile 
            ? "w-[298px] h-[168px] p-2 flex flex-col justify-center overflow-hidden" 
            : "max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
        }`}
      >
        {isMobile ? (
          // Mobile version - landscape oriented banner
          <div className="text-center space-y-0 overflow-hidden flex flex-col justify-center h-full">
            <h1 className="text-sm font-bold text-white leading-tight">
              {t("intro.welcome")}
            </h1>
            <p className="text-white/80 text-[8px] leading-tight">
              {t("mobile.desktopRecommendation")}
            </p>
          </div>
        ) : (
          // Desktop version
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("intro.welcome")}
              </h1>
            </div>

            {/* Content */}
            <div className="space-y-6 text-white/80 text-sm md:text-base leading-relaxed mb-8">
              <p>
                {t("intro.description")}
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => gameState.setIntroOpen(false)}
              className="w-full px-6 py-3 md:py-4 bg-[#55fc27] text-black font-bold text-lg hover:bg-[#55fc27]/80 transition-colors active:scale-95 transform"
            >
              {t("intro.discover")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

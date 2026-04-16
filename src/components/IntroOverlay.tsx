import { gameState, useGameState } from "@/lib/stores";
import { useEffect, useRef } from "react";
import { usePreferredControls } from "@/hooks/useIsTouch";
import { useTranslation } from "react-i18next";

export function IntroOverlay() {
  const { isIntroOpen } = useGameState();
  const preferredControls = usePreferredControls();
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close intro when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (overlayRef.current?.contains(target) && target === overlayRef.current) {
        gameState.setIntroOpen(false);
      }
    };

    if (isIntroOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isIntroOpen]);

  if (!isIntroOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        className={`bg-black border border-white/20 rounded-lg p-8 max-h-[90vh] overflow-y-auto ${
          preferredControls === "touch" ? "max-w-none w-11/12" : "max-w-2xl"
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("intro.welcome")}
          </h1>
          <img src="/kio_line.svg" alt="decorative line" className="h-5 w-full" />
        </div>

        {/* Content */}
        <div className="space-y-6 text-white/80 text-sm md:text-base leading-relaxed mb-8">
          <p>
            Erkunden Sie die Ausstellung „A Kind of Art" digital – eine einzigartige Reise durch KI-generierte Kunstwerke, die künstlerische Tradition und moderne Technologie verschmelzen.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => gameState.setIntroOpen(false)}
          className="w-full px-6 py-3 md:py-4 bg-[#55fc27] text-black font-bold text-lg hover:bg-[#55fc27]/80 transition-colors active:scale-95 transform"
        >
          {t("intro.discover")}
        </button>
      </div>
    </div>
  );
}

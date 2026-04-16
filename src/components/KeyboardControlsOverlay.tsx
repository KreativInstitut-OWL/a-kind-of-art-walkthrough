import { useGameState } from "@/lib/stores";
import { useTranslation } from "react-i18next";
import { Kbd } from "./ui/kbd";

export function KeyboardControlsOverlay() {
  const { t } = useTranslation();
  const { isFullscreen } = useGameState();

  return (
    <>
      {/* Movement controls - bottom left */}
      <div className="pointer-events-none fixed left-4 bottom-4 z-[998] text-white/90 select-none">
        <div className="flex items-end gap-6">
          <div className="flex flex-col items-center">
            {/* Move label */}
            <div className="text-sm uppercase font-medium mb-3 tracking-wide opacity-80">
              {t("controls.move")}
            </div>
            {/* WASD keys */}
            <div className="grid grid-cols-3 gap-2 justify-items-center">
              <div />
              <Kbd className="size-9 flex items-center justify-center text-base font-semibold">W</Kbd>
              <div />
              <Kbd className="size-9 flex items-center justify-center text-base font-semibold">A</Kbd>
              <Kbd className="size-9 flex items-center justify-center text-base font-semibold">S</Kbd>
              <Kbd className="size-9 flex items-center justify-center text-base font-semibold">D</Kbd>
            </div>
          </div>
          {isFullscreen && (
            <div>
              <div className="text-sm uppercase font-medium mb-3 tracking-wide opacity-80 text-right">
                {t("controls.exitFullscreen")}
              </div>
              <div className="flex justify-end">
                <Kbd className="size-9 flex items-center justify-center text-base font-semibold">Esc</Kbd>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 text-sm uppercase font-medium tracking-wide opacity-80">
          {t("controls.look")}
        </div>
      </div>
    </>
  );
}

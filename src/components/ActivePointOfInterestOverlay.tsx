/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-refresh/only-export-components */
import { useIsTouch } from "@/hooks/useIsTouch";
import { useKeyEvent } from "@/hooks/useKeyEvent";
import { gameState, useGameState } from "@/lib/stores";
import type { PointOfInterestData } from "@/types";
import { getLocalizedString } from "@/utils";
import { getAssetUrl as getAssetUrlBase } from "@/utils/asset-url";
import { trackData } from "@/utils/tracking";
import { ExternalLink, Paperclip, SquareArrowOutUpRight } from "lucide-react";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Kbd } from "./ui/kbd";

const getAssetUrl = (asset: PointOfInterestData["asset"]) => {
  if (!asset) return "";
  
  const rawPath =
    typeof asset.path === "string"
      ? asset.path
      : getLocalizedString(asset.path);

  // Only apply base URL transformation for file/video/image assets, not links
  return asset.type === "link" ? rawPath : getAssetUrlBase(rawPath)!;
};

export function useActivePointOfInterest() {
  const { activePoi, currentSceneId } = useGameState();
  const setPoi = React.useCallback((poi: PointOfInterestData | null) => {
    gameState.setActivePoi(poi);
  }, []);

  return {
    poi: activePoi,
    sceneId: currentSceneId,
    setPoi,
  };
}

const poiIconComponent = {
  file: Paperclip,
  link: SquareArrowOutUpRight,
};

export function ActivePointOfInterestOverlay() {
  const { poi, sceneId } = useActivePointOfInterest();
  const { t } = useTranslation();
  const isTouch = useIsTouch();
  const [showText, setShowText] = React.useState(false);

  const poiRef = React.useRef<PointOfInterestData | null>(poi);
  poiRef.current = poi;

  // Reset showText when POI changes (including when leaving and returning)
  React.useEffect(() => {
    setShowText(false);
  }, [poi]);

  const handleEnterKeyUp = React.useCallback(() => {
    // Toggle text visibility or open asset
    if (!poiRef.current) return;

    // Track POI interaction
    trackData({
      eventData: {
        action: "poi-interact",
        label: `${sceneId}.${poiRef.current.id}`,
      },
    });

    // Toggle showText - if already showing, close it, otherwise show it
    setShowText(prev => !prev);
  }, [sceneId]);

  const isEnterKeyPressed = useKeyEvent({
    onKeyUp: handleEnterKeyUp,
    key: "Enter",
  });

  const handlePoiClick = React.useCallback(() => {
    // Track POI interaction
    if (poi) {
      trackData({
        eventData: {
          action: "poi-interact",
          label: `${sceneId}.${poi.id}`,
        },
      });
    }
  }, [poi, sceneId]);

  if (!poi) return null;

  // Info-only POIs just show the title
  if (poi.type === "info") {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 w-max top-1/2 -translate-y-1/2 z-40 text-black select-none">
        <div className="bg-white/50 backdrop-blur-md px-6 py-4 max-w-[45vw] w-auto rounded-md flex flex-col gap-2 items-center">
          <span className="font-bold text-lg text-center poi-title">
            {poi.title ? getLocalizedString(poi.title) : "Info"}
          </span>
        </div>
      </div>
    );
  }

  const title = poi.title ? getLocalizedString(poi.title) : "Asset Preview";

  const Icon =
    poiIconComponent[poi.asset?.type as keyof typeof poiIconComponent] ??
    Paperclip;

  return (
    <>
      {showText && (
        <div
          className="absolute inset-0 z-30 pointer-events-auto"
          onClick={() => setShowText(false)}
        />
      )}
      {/* Outer container is pointer-events-none to allow input through it */}
      <div className="absolute left-1/2 -translate-x-1/2 w-max top-1/2 -translate-y-1/2 z-40 text-black select-none pointer-events-none">
        {showText ? (
          <div className="bg-white/50 backdrop-blur-md px-6 py-4 max-w-[90vw] md:max-w-[45vw] w-auto rounded-md flex flex-col gap-4 items-center pointer-events-auto">
            <span className="font-bold text-lg text-center poi-title">{title}</span>
            <div className="text-sm text-left text-black/80 whitespace-pre-wrap w-full">
              {poi.description ? getLocalizedString(poi.description) : "Beschreibungstext für diesen POI"}
            </div>
          </div>
        ) : (
          poi.asset && (
          isTouch ? (
            <div
            className="bg-white/50 backdrop-blur-md px-6 py-4 max-w-[90vw] w-auto rounded-md flex flex-col gap-2 items-center hover:bg-white/85 transition-colors cursor-pointer pointer-events-auto"
            onClick={() => {
              trackData({
                eventData: {
                  action: "poi-interact",
                  label: `${sceneId}.${poi.id}`,
                },
              });
              setShowText(prev => !prev);
            }}
          >
            <span className="font-bold text-lg inline-flex items-center justify-center gap-3 poi-title">
              <Icon className="size-4 shrink-0" />
              <span className="text-balance text-center">{title}</span>
            </span>
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#55fc27] text-black font-semibold text-sm">
              <Trans i18nKey="poi.touchToView" />
            </div>
          </div>
        ) : (
        <a
          href={getAssetUrl(poi.asset)}
          className="bg-white/50 backdrop-blur-md px-6 py-4 max-w-[90vw] w-auto rounded-md flex flex-col gap-2 items-center hover:bg-white/85 transition-colors pointer-events-auto"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handlePoiClick}
        >
          <span className="font-bold text-lg inline-flex items-center justify-center gap-3 poi-title">
            <Icon className="size-4 shrink-0" />
            <span className="text-balance text-center">{title}</span>
          </span>
          <div className="flex items-center gap-2">
            <Trans
              i18nKey="poi.pressKeyToView"
              values={{ key: t("controls.enter") }}
              components={[
                <Kbd className="mx-1" active={isEnterKeyPressed} />,
              ]}
            />
          </div>
        </a>
        )
        )
      )}
      </div>
    </>
  );
}

export function AssetExternalActionButton({
  asset,
}: {
  asset?: PointOfInterestData["asset"];
}) {
  if (!asset) return null;

  const handleAction = React.useCallback(() => {
    const url = getAssetUrl(asset);

    if (asset.type === "link") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // For files, create a download link
      const link = document.createElement("a");
      link.href = url;
      link.download = url.split("/").pop() || "download";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [asset]);

  const buttonText = asset.type === "link" ? "Open Link" : "Download File";

  return (
    <Button onClick={handleAction} variant="default">
      <ExternalLink />
      {buttonText}
    </Button>
  );
}

/* eslint-disable react-hooks/rules-of-hooks */
import { useSuspenseAsset } from "@/hooks/useSuspenseAsset";
import { ItemSpin } from "@/scripts/ItemSpin";
import { PointOfInterest as PointOfInterestScript } from "@/scripts/PointOfInterest";
import { getAssetUrl } from "@/utils/asset-url";
import type {
  LocalizedString,
  PointOfInterestAsset,
  PointOfInterestAssetType,
  PointOfInterestData,
} from "@/types";
import { Entity } from "@playcanvas/react";
import { Collision, Render, Script } from "@playcanvas/react/components";
import { useTranslation } from "react-i18next";
import { RenderTexture } from "./RenderTexture";
import { RenderVideoTexture } from "./RenderVideoTexture";

type PointOfInterestProps = {
  poi: PointOfInterestData;
  sceneId?: string;
  onCollision?: (poi: PointOfInterestData | null) => void;
};

function useLocaleAssetPath(asset: PointOfInterestAsset) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const defaultLocale = i18n.options.fallbackLng as string;
  const rawPath =
    typeof asset.path === "string"
      ? asset.path
      : asset.path[locale as keyof LocalizedString] ??
        asset.path[defaultLocale as keyof LocalizedString];

  // Only apply base URL transformation for file/video assets, not links
  return asset.type === "link" ? rawPath : getAssetUrl(rawPath)!;
}

const PointOfInterestImage = ({ poi }: PointOfInterestProps) => {
  if (!poi.asset) return null;
  return (
    <Entity
      name={`poi-image-${poi.id}`}
      position={poi.position}
      rotation={poi.rotation}
      scale={[poi.width, 1, poi.height]}
    >
      <RenderTexture src={useLocaleAssetPath(poi.asset)} type="diffuse" />
    </Entity>
  );
};
const PointOfInterestVideo = ({ poi }: PointOfInterestProps) => {
  if (!poi.asset) return null;
  const assetPath = useLocaleAssetPath(poi.asset);
  return (
    <Entity
      name={`poi-video-${poi.id}`}
      position={poi.position}
      rotation={poi.rotation}
      scale={[poi.width, 1, poi.height]}
      // force re-initialization of the video texture when the asset path changes
      key={assetPath}
    >
      <RenderVideoTexture src={assetPath} type="diffuse" />
    </Entity>
  );
};

const PointOfInterestFileOrLink = ({
  poi,
  sceneId,
  onCollision,
}: PointOfInterestProps) => {
  const { data: poiAsset } = useSuspenseAsset({
    src: getAssetUrl("/assets/POI_Marker_KIO.glb")!,
    type: "container",
  });

  if (!poiAsset) return null;

  return (
    <Entity
      name={`poi-file-or-link-${poi.id}`}
      position={poi.position}
      rotation={poi.rotation}
      scale={[2, 2, 2]}
    >
      <Entity>
        <Entity scale={[0.045, 0.045, 0.045]}>
          <Render type="asset" asset={poiAsset} />
        </Entity>
        <Script
          script={ItemSpin}
          speed={0.25}
          floatSpeed={0.5}
          floatAmplitude={0.125}
        />
      </Entity>
      <Entity>
        {/* <Render type="box" /> */}
        <Collision type="box" />
        <Script
          script={PointOfInterestScript}
          poiData={poi}
          sceneId={sceneId}
          onPoiCollision={onCollision}
        />
      </Entity>
    </Entity>
  );
};

const pointOfInterestComponentForType: Record<
  PointOfInterestAssetType,
  React.ComponentType<PointOfInterestProps>
> = {
  image: PointOfInterestImage,
  video: PointOfInterestVideo,
  file: PointOfInterestFileOrLink,
  link: PointOfInterestFileOrLink,
};

const PointOfInterestInfoOnly = ({
  poi,
  sceneId,
  onCollision,
}: PointOfInterestProps) => {
  return (
    <Entity
      name={`poi-info-${poi.id}`}
      position={poi.position}
      rotation={poi.rotation}
    >
      <Entity>
        <Collision type="box" />
        <Script
          script={PointOfInterestScript}
          poiData={poi}
          sceneId={sceneId}
          onPoiCollision={onCollision}
        />
      </Entity>
    </Entity>
  );
};

export const PointOfInterest = ({
  poi,
  sceneId,
  onCollision,
}: PointOfInterestProps) => {
  // Handle info-only POIs
  if (poi.type === "info") {
    return <PointOfInterestInfoOnly poi={poi} sceneId={sceneId} onCollision={onCollision} />;
  }
  
  // Handle asset-based POIs
  if (!poi.asset) return null;
  const RenderComponent = pointOfInterestComponentForType[poi.asset.type];
  if (!RenderComponent) return null;
  return (
    <RenderComponent poi={poi} sceneId={sceneId} onCollision={onCollision} />
  );
};

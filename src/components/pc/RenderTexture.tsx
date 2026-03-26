import { useSuspenseAsset } from "@/hooks/useSuspenseAsset";
import { Render } from "@playcanvas/react/components";
import { useMaterial } from "@playcanvas/react/hooks";
import type { Texture } from "playcanvas";
import { useEffect } from "react";

export function RenderTexture({
  src,
  type,
}: {
  src: string;
  type: "diffuse" | "emissive";
}) {
  const { data: asset } = useSuspenseAsset({ src, type: "texture" });

  const material = useMaterial({
    // diffuse: "red",
    // diffuseMap: asset?.resource as Texture,
  });

  useEffect(() => {
    if (!asset) return;
    if (type === "diffuse") {
      material.diffuseMap = asset?.resource as Texture;
      material.emissiveMap = null;
    } else {
      material.emissiveMap = asset?.resource as Texture;
      material.diffuseMap = null;
    }
  }, [asset, material, type]);

  if (!asset) return null;

  return <Render type="plane" material={material} />;
}

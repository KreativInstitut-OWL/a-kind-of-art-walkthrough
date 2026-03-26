import { VideoMaterial } from "@/scripts/VideoMaterial.mjs";
import { VideoTexture } from "@/scripts/VideoTexture.mjs";
import { Render, Script } from "@playcanvas/react/components";
import { useMaterial } from "@playcanvas/react/hooks";
import { useId } from "react";

export function RenderVideoTexture({
  src,
  type,
}: {
  src: string;
  type: "diffuse" | "emissive";
}) {
  const id = useId();
  const material = useMaterial({});
  const playEvent = `play:video-texture:${id}`;

  return (
    <>
      <Render type="plane" material={material} />
      <Script
        script={VideoMaterial}
        material={material}
        type={type}
        playEvent={playEvent}
      />
      <Script script={VideoTexture} videoUrl={src} playEvent={playEvent} />
    </>
  );
}

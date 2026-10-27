import { useSuspenseAsset } from "@/hooks/useSuspenseAsset";
import { Splat as SplatScript } from "@/scripts/Splat";
import { getAssetUrl } from "@/utils/asset-url";
import { Entity } from "@playcanvas/react";
import { Script } from "@playcanvas/react/components";
import { Entity as PcEntity } from "playcanvas";
import type { ComponentPropsWithoutRef } from "react";

type EntityProps = ComponentPropsWithoutRef<typeof Entity>;

export function Splat({
  path,
  ref,
  ...props
}: {
  path: string;
  ref?: React.RefObject<PcEntity | null>;
} & EntityProps) {
  const { data: asset } = useSuspenseAsset({
    src: getAssetUrl(path)!,
    type: "gsplat",
  });

  return (
    <Entity name="Splat" key={asset.getFileUrl()} ref={ref} {...props}>
      <Script script={SplatScript} asset={asset} />
    </Entity>
  );
}

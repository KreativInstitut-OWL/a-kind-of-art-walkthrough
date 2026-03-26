import { Entity } from "@playcanvas/react";
import {
  Collision,
  Render,
  RigidBody,
  Script,
} from "@playcanvas/react/components";
import { useMaterial } from "@playcanvas/react/hooks";
import { ResizeCollision } from "@/scripts/ResizeCollision";

type CollisionBoxProps = {
  size: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  isVisible?: boolean;
  material?: Parameters<typeof useMaterial>[0];
  name: string;
};

export function CollisionBox({
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isVisible,
  material: materialProps = { diffuse: "#ff9999" },
  name,
}: CollisionBoxProps) {
  const material = useMaterial(materialProps);
  
  // Set blend type for transparency if opacity is set
  if (materialProps && typeof materialProps === 'object' && 'opacity' in materialProps) {
    material.blendType = 2; // BLEND mode
  }

  return (
    <Entity name={name} position={position} rotation={rotation}>
      <Collision type="box" />
      <Script
        script={ResizeCollision}
        hx={size[0] / 2}
        hy={size[1] / 2}
        hz={size[2] / 2}
      />
      <RigidBody type="static" />
      {isVisible && (
        <Entity name={`${name}Visual`} scale={size}>
          <Render type="box" material={material} />
        </Entity>
      )}
    </Entity>
  );
}

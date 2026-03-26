import { Entity } from "@playcanvas/react";
import { Render } from "@playcanvas/react/components";
import { useMaterial } from "@playcanvas/react/hooks";
import { CollisionBox } from "./CollisionBox";

type CollisionWallsProps = {
  /**
   * Height of the wall boxes (starts on the ground plane (y-plane))
   */
  height?: number;

  /**
   * Thickness of the wall boxes perpendicular to the wall
   */
  thickness?: number;

  /**
   * Vertex positions of the walls ans 2d points on the ground plane (y-plane)
   */
  vertices: [number, number][];

  /**
   * Whether the walls should be visible (forwarded to the <CollisionBox />)
   */
  isVisible?: boolean;
};

export function CollisionWalls({
  height = 2,
  thickness = 0.2,
  vertices,
  isVisible,
}: CollisionWallsProps) {
  const vertexCylinderMaterial = useMaterial({ diffuse: "#00ff00", opacity: 0.5 });  vertexCylinderMaterial.opacity = 0.5;
  vertexCylinderMaterial.blendType = 2; // BLEND mode
    const vertexCylinderRadius = Math.min(thickness / 2, 0.1);
  const vertexCylinderHeight = height + 0.2;

  const segments: Array<[[number, number], [number, number]]> = [];
  if (vertices.length >= 2) {
    for (let i = 0; i < vertices.length - 1; i++) {
      segments.push([vertices[i], vertices[i + 1]]);
    }
    const [firstX, firstZ] = vertices[0];
    const [lastX, lastZ] = vertices[vertices.length - 1];
    if (firstX !== lastX || firstZ !== lastZ) {
      segments.push([vertices[vertices.length - 1], vertices[0]]);
    }
  }

  return (
    <>
      {isVisible &&
        vertices.map(([x, z], index) => (
          <Entity
            key={`vertex-${index}`}
            name={`WallVertex ${index}`}
            position={[x, vertexCylinderHeight / 2, z]}
            scale={[
              vertexCylinderRadius * 2,
              vertexCylinderHeight,
              vertexCylinderRadius * 2,
            ]}
          >
            <Render type="cylinder" material={vertexCylinderMaterial} />
          </Entity>
        ))}
      {segments.map(([[x1, z1], [x2, z2]], index) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        if (length === 0) return null;

        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const yawDeg = (Math.atan2(dx, dz) * 180) / Math.PI;

        return (
          <CollisionBox
            key={index}
            name={`Wall ${index}`}
            size={[thickness, height, length]}
            position={[midX, height / 2, midZ]}
            rotation={[0, yawDeg, 0]}
            isVisible={isVisible}
            material={{ diffuse: "#00ff00", opacity: 0.5, blendType: 2 }}
          />
        );
      })}
    </>
  );
}

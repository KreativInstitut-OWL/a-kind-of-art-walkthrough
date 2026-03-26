import { Entity } from "@playcanvas/react";
import { Collision, RigidBody, Script } from "@playcanvas/react/components";
import { ExtrudedPolygonCollision } from "@/scripts/ExtrudedPolygonCollision";
import { usePhysics } from "@playcanvas/react/hooks";

type CollisionPolygonProps = {
  /**
   * 2D vertices defining the polygon on the ground plane (y=0)
   * Each vertex is [x, z] coordinates
   */
  vertices: [number, number][];

  /**
   * Height of the extruded polygon (on y-axis)
   */
  height: number;

  /**
   * Position offset for the collision polygon
   */
  position?: [number, number, number];

  /**
   * Rotation for the collision polygon
   */
  rotation?: [number, number, number];

  /**
   * Whether to show debug visualization of the collision geometry
   */
  isVisible?: boolean;

  /**
   * Name for the entity
   */
  name: string;
};

export function CollisionPolygon({
  vertices,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isVisible = false,
  name,
}: CollisionPolygonProps) {
  const { isPhysicsLoaded } = usePhysics();

  if (!isPhysicsLoaded) {
    return null;
  }

  // Validate vertices
  if (vertices.length < 3) {
    console.warn(
      `CollisionPolygon ${name}: Need at least 3 vertices for a valid polygon`
    );
    return null;
  }

  return (
    <Entity name={name} position={position} rotation={rotation}>
      <Collision type="mesh" />
      <Script
        script={ExtrudedPolygonCollision}
        vertices={vertices}
        height={height}
        isVisible={isVisible}
      />
      <RigidBody type="static" />
    </Entity>
  );
}

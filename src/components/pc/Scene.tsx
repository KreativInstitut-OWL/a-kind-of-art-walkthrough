import { useSuspenseAsset } from "@/hooks/useSuspenseAsset";
import { PauseStateManager } from "@/scripts/PauseStateManager";
import { PointerLockManager } from "@/scripts/PointerLockManager";
import { PointerToGround } from "@/scripts/PointerToGround";
import { ReactTouchBridge } from "@/scripts/ReactTouchBridge";
import type { SceneData } from "@/types";
import { getAssetUrl } from "@/utils/asset-url";
import { Entity } from "@playcanvas/react";
import {
  Camera,
  Environment,
  Light,
  Script,
} from "@playcanvas/react/components";
import { usePhysics } from "@playcanvas/react/hooks";
import { OrbitControls } from "@playcanvas/react/scripts";
import { Entity as PcEntity, TEXTURETYPE_RGBP } from "playcanvas";
import { useMemo } from "react";
import { useActivePointOfInterest } from "../ActivePointOfInterestOverlay";
import { CollisionBox } from "./CollisionBox";
import { CollisionPolygon } from "./CollisionPolygon";
import { CollisionWalls } from "./CollisionWalls";
import { Player } from "./Player";
import { PointOfInterest } from "./PointOfInterest";
import { useGameState } from "@/lib/stores";
import { Splat } from "./Splat";

void OrbitControls;
void PointerToGround;
void Camera;
void Script;
void Light;
void Environment;

export function Scene({
  sceneData,
  ref,
}: {
  sceneData: SceneData;
  ref: React.RefObject<PcEntity | null>;
}) {
  const { poi, setPoi } = useActivePointOfInterest();
  const { isPhysicsLoaded } = usePhysics();
  const { quality } = useGameState();

  // Detect if on mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const { data: envAtlas } = useSuspenseAsset({
    src: getAssetUrl("/texture/env-atlas.png")!,
    type: "texture",
    props: {
      data: { type: TEXTURETYPE_RGBP, mipmaps: isMobile ? false : true },
    },
  });

  const groundSize = sceneData.size;
  const groundThickness = 0.5;

  return (
    <Entity name="SceneRoot" ref={ref}>
      {process.env.NODE_ENV === "development" && (
        <Script script={PointerToGround} />
      )}
      <Script script={PointerLockManager} />
      <Script script={ReactTouchBridge} />
      <Script script={PauseStateManager} />

      <Splat
        path={sceneData.splat.path[quality]}
        rotation={sceneData.splat.rotation}
        position={sceneData.splat.position}
      />

      <CollisionBox
        name="Ground"
        size={[groundSize, groundThickness, groundSize]}
        position={[0, -groundThickness / 2, 0]}
      />

      {/* Lighting Setup */}
      <Entity
        name="DirectionalLight"
        position={[0, groundSize * 0.5, 0]}
        rotation={[-45, 45, 0]}
      >
        <Light type="directional" color="#ffffff" intensity={1} />
      </Entity>

      {/* Image Based Lighting */}
      {envAtlas && (
        <Environment
          envAtlas={envAtlas}
          exposure={1}
          // ambientLight={new Color(0.4, 0.4, 0.5)}
          // ambientLuminance={0.5}
        />
      )}

      {sceneData.walls.map((wall, index) => (
        <CollisionWalls key={index} vertices={wall.vertices} isVisible={false} />
      ))}

      {sceneData.polygonCollisions.map((polygonCollision) => (
        <CollisionPolygon
          key={polygonCollision.id}
          name={polygonCollision.id}
          vertices={polygonCollision.vertices}
          height={polygonCollision.height}
          position={polygonCollision.position}
          rotation={polygonCollision.rotation}
          isVisible={polygonCollision.isVisible}
        />
      ))}

      {isPhysicsLoaded &&
        sceneData.pointOfInterests.map((scenePoi) => (
          <PointOfInterest
            key={scenePoi.id}
            poi={scenePoi}
            sceneId={sceneData.id}
            onCollision={(collisionPoi) => {
              // ignore unsetting the poi if it's not the current poi
              if (collisionPoi === null && scenePoi.id !== poi?.id) {
                return;
              }

              setPoi(collisionPoi);
            }}
          />
        ))}

      <Player playerData={sceneData.player} sceneId={sceneData.id} />
    </Entity>
  );
}

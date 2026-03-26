import { FirstPersonController } from "@/scripts/FirstPersonController.mjs";
import type { PlayerData } from "@/types";
import { Entity } from "@playcanvas/react";
import {
  Camera,
  Collision,
  Render,
  // Render,
  RigidBody,
  Script,
} from "@playcanvas/react/components";
import { useMaterial, usePhysics } from "@playcanvas/react/hooks";
import { Entity as PcEntity } from "playcanvas";
import { useRef } from "react";
// import { useMaterial } from "@playcanvas/react/hooks";
import { AudioListener } from "@/scripts/AudioListener";
import { PlayerTeleport } from "@/scripts/PlayerTeleport";

export function Player({
  playerData,
  sceneId,
}: {
  playerData: PlayerData;
  sceneId: string;
}) {
  const { isPhysicsLoaded } = usePhysics();
  const playerRef = useRef<PcEntity>(null);
  const cameraRef = useRef<PcEntity>(null);

  const playerMaterial = useMaterial({ diffuse: "#ff0000" });

  if (!isPhysicsLoaded) return null;

  const renderPlayerVisual = false;

  return (
    <Entity
      name="Player"
      // key={position[0] + position[1] + rotation}
      // position={[playerData.position[0], 2, playerData.position[1]]}
      // rotation={[0, playerData.rotation, 0]}
      ref={playerRef}
    >
      <Collision type="capsule" radius={0.4} height={2} />
      <RigidBody
        type="dynamic"
        mass={100}
        linearDamping={0}
        angularDamping={0}
        linearFactor={[1, 1, 1]}
        friction={0.5}
        restitution={0}
      />
      <Entity name="Camera" position={[0, 0.65, 0]} ref={cameraRef}>
        <Camera fov={45} nearClip={0.1} />
        <Script script={AudioListener} />
      </Entity>
      {renderPlayerVisual && (
        <Entity name="PlayerVisual" scale={[1, 1, 1]}>
          <Render type="capsule" material={playerMaterial} />
        </Entity>
      )}
      <Script
        script={FirstPersonController}
        initialPosition={playerData.position}
        initialRotation={playerData.rotation}
      />
      <Script
        script={PlayerTeleport}
        sceneId={sceneId}
        playerData={playerData}
      />
    </Entity>
  );
}

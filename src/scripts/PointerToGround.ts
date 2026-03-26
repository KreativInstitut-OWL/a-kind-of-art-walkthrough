import { Script, Vec3 } from "playcanvas";
import type { FirstPersonController } from "./FirstPersonController.mjs";
import clipboard from "clipboardy";

function round(value: number, precision: number) {
  return Math.round(value * precision) / precision;
}

export class PointerToGround extends Script {
  static scriptName = "pointerToGround";

  private groundHits: [number, number][] = [];

  private _onMouseDown = (event: any) => {
    if (event.button === 0) {
      // Left click
      if (event.shiftKey) {
        // Shift + left click: output position and rotation
        this.outputPositionAndRotation();
      } else {
        // Regular left click
        this.castRayToGround();
      }
    } else if (event.button === 2) {
      // Right click
      this.resetHits();
    }
  };

  private castRayToGround() {
    // Find camera components in the scene
    const cameraComponents = this.app.root.findComponents("camera") as any[];

    // Find the first enabled camera
    const cameraComponent = cameraComponents.find((c) => c.enabled);
    if (!cameraComponent) return;

    // Use center of screen (crosshair position)
    const canvas = this.app.graphicsDevice.canvas;
    const screenX = canvas.width / 2;
    const screenY = canvas.height / 2;

    const from = new Vec3();
    const to = new Vec3();

    // 0 -> near, 1 -> far
    cameraComponent.screenToWorld(screenX, screenY, 0, from);
    cameraComponent.screenToWorld(screenX, screenY, 1, to);

    const dir = to.sub(from);
    const dy = dir.y;
    if (Math.abs(dy) < 1e-6) return; // Ray parallel to ground

    const t = -from.y / dy; // intersect with y=0 plane
    if (t < 0) return; // Intersection behind the camera

    const hit = new Vec3(
      from.x + dir.x * t,
      from.y + dir.y * t,
      from.z + dir.z * t
    );

    // Add hit to array
    const hitPoint: [number, number] = [round(hit.x, 100), round(hit.z, 100)];
    this.groundHits.push(hitPoint);

    // Log the complete array as copyable format
    const groundHitsString = JSON.stringify(this.groundHits);
    console.log("Ground hits:", groundHitsString);
    clipboard.write(groundHitsString).catch(console.error);
  }

  private resetHits() {
    this.groundHits = [];
    console.log("Ground hits reset:", JSON.stringify(this.groundHits));
  }

  private outputPositionAndRotation() {
    // Defer execution to next frame to ensure components are loaded
    setTimeout(() => {
      this._doOutputPositionAndRotation();
    }, 0);
  }

  private _doOutputPositionAndRotation() {
    // Find the player entity and get the FirstPersonController from it
    const playerEntity = this.app.root.findByName("Player") as any;

    if (
      !playerEntity ||
      !playerEntity.script ||
      !playerEntity.script.firstPersonController
    ) {
      console.error("Player entity or FirstPersonController not found");
      return;
    }

    const firstPersonController = playerEntity.script
      .firstPersonController as unknown as FirstPersonController;

    // Get the player's current position
    const playerPosition = playerEntity.getPosition();
    const playerYRotation = firstPersonController.look.y;

    // Output the formatted string using player's x,z position
    const output = `      position: [${round(
      playerPosition.x,
      100
    )}, 1.4, ${round(playerPosition.z, 100)}],
      rotation: [0, ${round(playerYRotation, 100)}, 0],`;

    console.log(output);
    clipboard.write(output).catch(console.error);
  }

  initialize() {
    if (this.app.mouse) {
      this.app.mouse.on("mousedown", this._onMouseDown, this);
    }
    this.on("destroy", this.destroy, this);
  }

  destroy() {
    if (this.app.mouse) {
      this.app.mouse.off("mousedown", this._onMouseDown, this);
    }
  }
}

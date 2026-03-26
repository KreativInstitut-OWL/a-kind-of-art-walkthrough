import { Script } from "playcanvas";
import type { PlayerData } from "../types";
import { getEntityScript } from "../utils";
import { FirstPersonController } from "./FirstPersonController.mjs";

// this script has two properties: playerData and sceneId
// if sceneId changes teleport the player to the new playerData position and rotation
export class PlayerTeleport extends Script {
  static scriptName = "playerTeleport";

  /**
   * @attribute
   * @title Scene ID
   * @description Unique identifier for the current scene
   * @type {string}
   */
  sceneId: string = "";

  /**
   * @attribute
   * @title Player Data
   * @description Player position and rotation data for teleportation
   * @type {object}
   */
  playerData: PlayerData = {
    position: [0, 0],
    rotation: 0,
  };

  /** Private field to track the current scene ID for change detection */
  private _currentSceneId: string | null = null;

  initialize(): void {
    this.teleportPlayer();
  }

  update(): void {
    // Check if sceneId has changed
    if (this.sceneId !== this._currentSceneId) {
      this._currentSceneId = this.sceneId;
      this.teleportPlayer();
    }
  }

  /**
   * Teleports the player to the current playerData position and rotation
   */
  private teleportPlayer(): void {
    // Get the first person controller script
    const firstPersonController = getEntityScript<FirstPersonController>(
      this.entity,
      "firstPersonController"
    );

    if (!firstPersonController) {
      console.warn("FirstPersonController script not found on player");
      return;
    }


    // Teleport the player to the new position and rotation
    firstPersonController.teleport(
      this.playerData.position,
      this.playerData.rotation,
      true
    );
  }

  destroy(): void {
    // Cleanup if needed
  }
}

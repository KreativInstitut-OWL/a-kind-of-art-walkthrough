import { Script } from "playcanvas";

/**
 * Adds an audio listener component to the entity
 */
export class AudioListener extends Script {
  static scriptName = "audiolistener";

  initialize(): void {
    this.entity.addComponent("audiolistener");
  }
}

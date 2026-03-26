import { Script, Color } from "playcanvas";

/**
 * Controls a TV screen by setting a video texture as the emissive map of the screen material.
 */
export class VideoMaterial extends Script {
  /**
   * The screen material of the TV that displays the video texture.
   *
   * @attribute
   * @title Video Material
   * @type {pc.Asset}
   * @resource material
   */
  material;

  /**
   * The type of the video material.
   *
   * @attribute
   * @title Video Type
   * @type {'diffuse' | 'emissive'}
   * @default 'emissive'
   */
  type = "emissive";

  /**
   * Set the TV screen material emissive map on this event.
   *
   * @attribute
   * @title Play Event
   * @type {string}
   * @default ''
   */
  playEvent = "";

  initialize() {
    this.app.on(
      this.playEvent,
      (videoTexture) => {
        const material = this.material;
        if (!material) return;

        if (this.type === "emissive") {
          material.emissiveMap = videoTexture;
          material.emissive = Color.WHITE;
        } else {
          material.diffuseMap = videoTexture;
          material.diffuse = Color.WHITE;
        }

        material.update();
      },
      this
    );
  }
}

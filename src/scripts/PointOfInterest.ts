import { Entity, Script, Vec3 } from "playcanvas";
import type { PointOfInterestData } from "../types";
import { trackData } from "../utils/tracking";

export class PointOfInterest extends Script {
  static scriptName = "pointOfInterest";

  // Script attributes that can be set in the editor
  poiData: PointOfInterestData | null = null;
  sceneId: string = "";
  onPoiCollision?: (poi: PointOfInterestData | null) => void;

  initialize() {
    // Set up collision listener
    const collision = this.entity.collision;

    if (collision) {
      collision.halfExtents = new Vec3(0.7, 0.7, 0.7);
      collision.on("triggerenter", this.onTriggerEnter, this);
      collision.on("triggerleave", this.onTriggerLeave, this);
    }
  }

  private onTriggerEnter = (other: Entity) => {
    if (other.name === "Player" && this.poiData && this.onPoiCollision) {
      // Track POI activation
      trackData({
        eventData: {
          action: "poi-activate",
          label: `${this.sceneId}.${this.poiData.id}`,
        },
      });

      this.onPoiCollision(this.poiData);
    }
  };

  private onTriggerLeave = (other: Entity) => {
    if (other.name === "Player" && this.onPoiCollision) {
      this.onPoiCollision(null);
    }
  };

  destroy() {
    // Clean up event listeners
    const collision = this.entity.collision;
    if (collision) {
      collision.off("triggerenter", this.onTriggerEnter, this);
      collision.off("triggerleave", this.onTriggerLeave, this);
    }
  }
}

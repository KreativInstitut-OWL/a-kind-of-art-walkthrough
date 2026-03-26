import { Script, Vec3 } from "playcanvas";

export class ResizeCollision extends Script {
  static scriptName = "resizeCollision";

  // Half extents for the box collider
  hx: number = 5;
  hy: number = 0.5;
  hz: number = 5;
  private applied = false;

  update(): void {
    if (this.applied) return;
    const collision = this.entity.collision;
    if (!collision) return;
    collision.type = "box";
    // Assign a new Vec3 to trigger the setter and rebuild the shape
    collision.halfExtents = new Vec3(this.hx, this.hy, this.hz);
    this.applied = true;
  }
}

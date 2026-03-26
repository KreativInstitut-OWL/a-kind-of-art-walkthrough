import { Script } from "playcanvas";

export class ItemSpin extends Script {
  static scriptName = "itemSpin";

  // Script attributes that can be set in the editor
  speed: number = 1.0;
  floatSpeed: number = 1.0;
  floatAmplitude: number = 0.5;

  private startRotation: number = 0;
  private startPosition: [number, number, number] = [0, 0, 0];
  private accumulatedTime: number = 0;

  initialize() {
    // Store initial rotation and position
    this.startRotation = this.entity.getEulerAngles().y;
    const pos = this.entity.getPosition();
    this.startPosition = [pos.x, pos.y, pos.z];
  }

  update(dt: number) {
    // Accumulate time
    this.accumulatedTime += dt;

    // Linear rotation around Y-axis
    const rotationOffset = (this.accumulatedTime * this.speed * 360) % 360;
    this.entity.setEulerAngles(0, this.startRotation + rotationOffset, 0);

    // Floating motion up and down using sine wave
    const floatOffset =
      Math.sin(this.accumulatedTime * this.floatSpeed) * this.floatAmplitude;
    const currentPosition = this.entity.getPosition();
    this.entity.setPosition(
      currentPosition.x,
      this.startPosition[1] + floatOffset,
      currentPosition.z
    );
  }
}

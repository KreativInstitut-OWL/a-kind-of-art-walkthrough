import { Script } from "playcanvas";
import { touchUIStore } from "@/lib/stores";

/**
 * Bridges React's TouchControlsOverlay with PlayCanvas
 * Listens to the touchUIStore and fires events to the app
 */
export class ReactTouchBridge extends Script {
  static scriptName = "reactTouchBridge";

  private unsubscribe: (() => void) | null = null;
  private lastLeftActive = false;
  private lastRightActive = false;

  initialize() {
    // Subscribe to touch store changes
    this.unsubscribe = touchUIStore.subscribe((state) => {
      const dev = this.app.graphicsDevice;
      const canvas = dev.canvas as HTMLCanvasElement;

      // Convert CSS viewport coordinates to device coordinates
      const cssToDevice = (cssX: number, cssY: number) => ({
        x: (cssX / canvas.clientWidth) * dev.width,
        y: (cssY / canvas.clientHeight) * dev.height,
      });

      const left = state.left;
      const right = state.right;

      // Handle left joystick
      if (left.active && !this.lastLeftActive) {
        // Activation - fire with center position
        const p = cssToDevice(left.center.x, left.center.y);
        this.app.fire("leftjoystick:enable", p.x, p.y);
      } else if (left.active && this.lastLeftActive) {
        // Movement - fire with current position
        const p = cssToDevice(left.pos.x, left.pos.y);
        this.app.fire("leftjoystick:move", p.x, p.y);
      } else if (!left.active && this.lastLeftActive) {
        // Deactivation
        this.app.fire("leftjoystick:disable");
      }

      // Handle right joystick
      if (right.active && !this.lastRightActive) {
        // Activation - fire with center position
        const p = cssToDevice(right.center.x, right.center.y);
        this.app.fire("rightjoystick:enable", p.x, p.y);
      } else if (right.active && this.lastRightActive) {
        // Movement - fire with current position
        const p = cssToDevice(right.pos.x, right.pos.y);
        this.app.fire("rightjoystick:move", p.x, p.y);
      } else if (!right.active && this.lastRightActive) {
        // Deactivation
        this.app.fire("rightjoystick:disable");
      }

      this.lastLeftActive = left.active;
      this.lastRightActive = right.active;
    });
  }

  onDisable() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

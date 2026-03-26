import { Script, Entity } from "playcanvas";

export class PauseStateManager extends Script {
  static scriptName = "pauseStateManager";

  // 2-State System:
  // State 0: isPaused=false, showUI=true (normal playing)
  // State 1: isPaused=true, showUI=true (paused)
  private _state = 0;

  initialize() {
    this._state = 0;
    this._updateState();

    // ESC key handling - toggle pause state
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Stop propagation FIRST before state change
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Toggle between state 0 and 1
        this._state = this._state === 0 ? 1 : 0;
        this._updateState();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);

    // Click handler when paused (state 1) - goes back to normal (state 0)
    // Only resume if clicking on the canvas, not on UI elements
    const onClickWhenPaused = (e: MouseEvent) => {
      if (this._state === 1) {
        const target = e.target as HTMLElement;
        // Only resume if clicking canvas or empty space, not on buttons/inputs/overlays
        if (target.tagName === "CANVAS" || target === document.body) {
          this._state = 0;
          this._updateState();
        }
      }
    };
    document.addEventListener("click", onClickWhenPaused, true);

    this.on("destroy", () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onClickWhenPaused, true);
    });
  }

  private _updateState() {
    const isPaused = this._state === 1;

    // Update app flags
    (this.app as any)._isPaused = isPaused;

    const canvas = this.app.graphicsDevice.canvas as HTMLCanvasElement;

    // Handle pointer lock:
    // - When paused (state 1): unlock pointer (show cursor)
    // - When normal (state 0): lock pointer if possible
    if (isPaused) {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } else if (this._state === 0) {
      // When normal playing (state 0), request pointer lock
      if (!this.isMobile() && document.pointerLockElement !== canvas) {
        setTimeout(() => {
          canvas.requestPointerLock().catch(() => {
            // fallback - ok if fails
          });
        }, 100);
      }
    }

    // Disable input handlers when paused
    this.setInputEnabled(!isPaused);

    // Fire events for React to update UI
    this.app.fire("pause:changed", isPaused);
  }

  /**
   * Find and disable/enable input handlers on FirstPersonController
   */
  private setInputEnabled(enabled: boolean) {
    const playerEntity = this.findPlayerEntity();
    if (!playerEntity) return;

    const controller = (playerEntity.script as any)?.firstPersonController as any;
    if (!controller) return;

    if (controller._keyboardMouseInput) {
      controller._keyboardMouseInput.enabled = enabled;
    }
    if (controller._mobileInput) {
      controller._mobileInput.enabled = enabled;
    }
    if (controller._gamePadInput) {
      controller._gamePadInput.enabled = enabled;
    }
  }

  private findPlayerEntity(): Entity | null {
    const scene = (this as any).entity.root;
    let playerEntity: Entity | null = null;

    const findPlayer = (entity: Entity | any): void => {
      if (entity.name === "Player") {
        playerEntity = entity;
        return;
      }
      for (let i = 0; i < entity.children.length; i++) {
        if (playerEntity) break;
        findPlayer(entity.children[i]);
      }
    };

    findPlayer(scene);
    return playerEntity;
  }

  private isMobile() {
    if (typeof window === "undefined") return false;

    const hasFinePointer =
      window.matchMedia && window.matchMedia("(pointer: fine)").matches;

    return !hasFinePointer && (
      "ontouchstart" in window ||
      (navigator.maxTouchPoints || 0) > 0 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
    );
  }
}

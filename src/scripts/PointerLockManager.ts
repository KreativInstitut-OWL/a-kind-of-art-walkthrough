import { Script } from "playcanvas";

export class PointerLockManager extends Script {
  static scriptName = "pointerLockManager";

  private canvas!: HTMLCanvasElement;
  private isInShadowDom = false;

  private _onPointerLockChange = () => {
    const rootNode = this.canvas.getRootNode() as Document | ShadowRoot;
    const isLocked = rootNode.pointerLockElement === this.canvas;
    // Pause updates when not locked, resume when locked
    // this.app.timeScale = isLocked ? 1 : 0;
    // this.app.autoRender = isLocked;
    // Emit an app-wide event that React UI can subscribe to if desired
    this.app.fire("pointerlock:changed", isLocked);
  };

  private _onCanvasClick = () => {
    const rootNode = this.canvas.getRootNode() as Document | ShadowRoot;
    if (rootNode.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock();
    }
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    const rootNode = this.canvas.getRootNode() as Document | ShadowRoot;
    // Only handle Enter to request pointer lock, ESC is handled by PauseStateManager
    if (e.key === "Enter" && rootNode.pointerLockElement !== this.canvas) {
      e.preventDefault();
      this.canvas.requestPointerLock();
    }
  };

  initialize() {
    // Only manage pointer lock on desktop/mouse devices
    if (!this.app.mouse) {
      return;
    }

    this.canvas = this.app.graphicsDevice.canvas as HTMLCanvasElement;
    this.isInShadowDom = this.canvas.getRootNode() instanceof ShadowRoot;

    document.addEventListener("pointerlockchange", this._onPointerLockChange);
    this.canvas.addEventListener("click", this._onCanvasClick);

    if (this.isInShadowDom) {
      // In Shadow DOM, attach keyboard events to the host element
      const shadowRoot = this.canvas.getRootNode() as ShadowRoot;
      const hostElement = shadowRoot.host as HTMLElement;
      hostElement.addEventListener("keydown", this._onKeyDown as EventListener);
    } else {
      document.addEventListener("keydown", this._onKeyDown);
    }

    // Set initial pause state
    this._onPointerLockChange();

    this.on("destroy", this.destroy, this);
  }

  destroy() {
    if (this.app.mouse) {
      document.removeEventListener(
        "pointerlockchange",
        this._onPointerLockChange
      );
      this.canvas.removeEventListener("click", this._onCanvasClick);

      if (this.isInShadowDom) {
        const shadowRoot = this.canvas.getRootNode() as ShadowRoot;
        const hostElement = shadowRoot.host as HTMLElement;
        hostElement.removeEventListener(
          "keydown",
          this._onKeyDown as EventListener
        );
      } else {
        document.removeEventListener("keydown", this._onKeyDown);
      }
    }
  }
}

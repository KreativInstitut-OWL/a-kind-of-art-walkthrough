import { Asset, Entity, Script } from "playcanvas";

export class Splat extends Script {
  static scriptName = "splat";

  private applied = false;

  asset: Asset | null = null;

  initialize(): void {
    if (this.applied) return;

    const splat = new Entity("Splat");
    splat.addComponent("gsplat", { asset: this.asset, castShadows: false });
    this.entity.addChild(splat);

    this.applied = true;
  }
}

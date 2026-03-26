import {
  Color,
  Mesh,
  MeshInstance,
  Model,
  Script,
  StandardMaterial,
  Entity,
  Geometry,
} from "playcanvas";

export class ExtrudedPolygonCollision extends Script {
  static scriptName = "extrudedPolygonCollision";

  // Script attributes
  public vertices: [number, number][] = [];
  public height: number = 1;
  public isVisible: boolean = false;

  private applied = false;
  private debugMaterial: StandardMaterial | null = null;

  update(): void {
    if (this.applied) return;

    if (this.vertices.length < 3) {
      console.warn(
        "Not enough vertices for polygon collision:",
        this.vertices.length
      );
      return;
    }

    const collision = this.entity.collision;
    if (!collision) {
      console.error("No collision component found on entity");
      return;
    }

    // Create the extruded polygon geometry
    const model = this.createExtrudedPolygonModel();


    if (model) {
      // Set the collision to use the custom model

      collision.type = "mesh";
      collision.model = model;



      // Create debug material if visible
      if (this.isVisible) {
        this.debugMaterial = new StandardMaterial();
        this.debugMaterial.diffuse = new Color(0, 1, 0); // Green for debug
        this.debugMaterial.update();

        // Create a debug entity for visualization
        const debugEntity = new Entity(`${this.entity.name}_debug`);
        debugEntity.addComponent("render", {
          type: "asset",
        });

        if (debugEntity.render) {
          debugEntity.render.meshInstances = model.meshInstances;
        }

        this.entity.addChild(debugEntity);
      }
    }

    this.applied = true;
  }

  private createExtrudedPolygonModel(): Model | null {
    if (this.vertices.length < 3) return null;

    // Create vertex and index data for extruded polygon
    const { positions, indices } = this.createExtrudedGeometryData();

    if (positions.length === 0 || indices.length === 0) {
      console.error("No geometry data generated");
      return null;
    }

    // Buffers will be created automatically by Mesh.fromGeometry

    // Create mesh using Geometry approach
    const geometry = new Geometry();
    geometry.positions = positions;
    geometry.indices = indices;

    // Create mesh from geometry
    const mesh = Mesh.fromGeometry(this.app.graphicsDevice, geometry);

    // Create temporary material for mesh instance (will be replaced if debug is enabled)
    const tempMaterial = new StandardMaterial();
    tempMaterial.diffuse = new Color(1, 1, 1); // Default white
    tempMaterial.update();

    // Create mesh instance
    const meshInstance = new MeshInstance(mesh, tempMaterial, this.entity);


    // Create model
    const model = new Model();
    model.meshInstances = [meshInstance];
    model.graph = this.entity;

    //   "Model created with",
    //   model.meshInstances.length,
    //   "mesh instances"
    // );

    return model;
  }

  private createExtrudedGeometryData(): {
    positions: number[];
    indices: number[];
  } {
    const positions: number[] = [];
    const indices: number[] = [];

    const vertexCount = this.vertices.length;
    const halfHeight = this.height / 2;

    // Create bottom face (at y = -halfHeight)
    for (let i = 0; i < vertexCount; i++) {
      const [x, z] = this.vertices[i];
      positions.push(x, -halfHeight, z);
    }

    // Create top face (at y = halfHeight)
    for (let i = 0; i < vertexCount; i++) {
      const [x, z] = this.vertices[i];
      positions.push(x, halfHeight, z);
    }

    // Triangulate bottom face
    for (let i = 1; i < vertexCount - 1; i++) {
      indices.push(0, i, i + 1);
    }

    // Triangulate top face (reverse winding for correct normals)
    const topOffset = vertexCount;
    for (let i = 1; i < vertexCount - 1; i++) {
      indices.push(topOffset, topOffset + i + 1, topOffset + i);
    }

    // Create side faces
    for (let i = 0; i < vertexCount; i++) {
      const nextI = (i + 1) % vertexCount;

      // Bottom vertex of current edge
      const bottomCurrent = i;
      const bottomNext = nextI;

      // Top vertex of current edge
      const topCurrent = i + vertexCount;
      const topNext = nextI + vertexCount;

      // Two triangles per side face
      indices.push(bottomCurrent, bottomNext, topCurrent);
      indices.push(bottomNext, topNext, topCurrent);
    }

    return { positions, indices };
  }
}

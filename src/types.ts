export type ProjectData = {
  scenes: SceneData[];
  initialSceneId: string;
  introVideoUrl: LocalizedString;
};

export type PlayerData = {
  /** 2d position on the ground plane (y-plane) */
  position: Vec2;
  /** rotation in degrees around the y-axis */
  rotation: number;
};

export type SceneData = {
  /** unique identifier for the scene */
  id: string;

  /** display name for the scene in UI */
  displayName: LocalizedString;

  /** thumbnail image path for the scene */
  thumbnail?: string;

  splat: SplatData;

  /** where the player starts */
  player: PlayerData;

  /** size of the scene in meters (used for the ground plane) */
  size: number;

  /** walls that the player can collide with */
  walls: Polyline[];

  /** polygon collisions that the player can collide with */
  polygonCollisions: PolygonCollision[];

  /** point of interests that the player can interact with */
  pointOfInterests: PointOfInterestData[];

  /** doors that the player can use to navigate between scenes */
  doors: DoorData[];
};

export type SplatData = {
  path: {
    lq: string;
    mq: string;
    hq: string;
  };

  /** 3d position in world space */
  position: Vec3;

  /** 3d rotation in world space */
  rotation: Vec3;

  /** scale of the splat – make sure to scale it so that one unit is one meter */
  scale: Vec3;
};

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type LocalizedString = {
  en: string;
  de: string;
};

export type Polyline = {
  vertices: Vec2[];
};

export type PolygonCollision = {
  /** Unique identifier for the polygon collision */
  id: string;
  /** 2D vertices defining the polygon on the ground plane (y=0) */
  vertices: Vec2[];
  /** Height of the extruded polygon (on y-axis) */
  height: number;
  /** Position offset for the collision polygon */
  position?: Vec3;
  /** Rotation for the collision polygon */
  rotation?: Vec3;
  /** Whether to show debug visualization */
  isVisible?: boolean;
};

export type PointOfInterestData = {
  id: string;
  asset?: PointOfInterestAsset;
  title?: LocalizedString;
  description?: LocalizedString;
  position: Vec3;
  rotation: Vec3;
  width: number;
  height: number;
  type?: "info"; // For info-only POIs without markers
};

export type PointOfInterestAssetType = "video" | "image" | "file" | "link";

export interface PointOfInterestAssetBase {
  type: PointOfInterestAssetType;
}

export interface PointOfInterestImageAsset extends PointOfInterestAssetBase {
  type: "image";
  path: string | LocalizedString;
}

export interface PointOfInterestVideoAsset extends PointOfInterestAssetBase {
  type: "video";
  path: string | LocalizedString;
}

export interface PointOfInterestFileAsset extends PointOfInterestAssetBase {
  type: "file";
  path: string | LocalizedString;
}

export interface PointOfInterestLinkAsset extends PointOfInterestAssetBase {
  type: "link";
  path: string | LocalizedString;
}

export function assertPointOfInterestAsset<T extends PointOfInterestAsset>(
  asset: PointOfInterestAssetBase,
  type: T["type"]
): asserts asset is PointOfInterestAsset {
  if (asset.type !== type) {
    throw new Error(`Expected asset to be of type ${type}`);
  }
}

export type PointOfInterestAsset =
  | PointOfInterestImageAsset
  | PointOfInterestVideoAsset
  | PointOfInterestFileAsset
  | PointOfInterestLinkAsset;

export type DoorData = {
  /** unique identifier for the door */
  id: string;
  /** 2d position on the ground plane (y-plane) */
  position: Vec2;
  /** rotation in degrees around the y-axis */
  rotation: number;
};

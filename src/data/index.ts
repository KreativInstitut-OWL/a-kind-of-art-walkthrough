import type { ProjectData } from "@/types";
import { aKindOfArt } from "./a-kind-of-art";

export const data: ProjectData = {
  scenes: [aKindOfArt as unknown as ProjectData["scenes"][number]],
  initialSceneId: aKindOfArt.id,
  introVideoUrl: {
    de: "",
    en: "",
  },
};

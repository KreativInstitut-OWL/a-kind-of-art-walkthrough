import { data } from "@/data";
import type { PointOfInterestData } from "@/types";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export type TouchPoint = { x: number; y: number };

export type TouchStickState = {
  active: boolean;
  center: TouchPoint;
  pos: TouchPoint;
  radius: number;
};

export type TouchUIState = {
  left: TouchStickState;
  right: TouchStickState;
};

export type GameState = {
  isPaused: boolean;
  isPointerLocked: boolean;
  isFullscreen: boolean;
  currentSceneId: string;
  activePoi: PointOfInterestData | null;
  quality: "lq" | "mq" | "hq";
  isSettingsMenuOpen: boolean;
  isHelpOpen: boolean;
  isFullscreenMobileOverlayOpen: boolean;
};

const DEFAULT_RADIUS = 50;

const defaultStick: TouchStickState = {
  active: false,
  center: { x: 0, y: 0 },
  pos: { x: 0, y: 0 },
  radius: DEFAULT_RADIUS,
};

const store = createStore<TouchUIState>(() => ({
  left: { ...defaultStick },
  right: { ...defaultStick },
}));

// Wrapper to preserve existing API and support branch function updates
export const touchUIStore = {
  getState: store.getState,
  subscribe: store.subscribe,
  setState(
    partial:
      | Partial<TouchUIState>
      | {
          left?: (s: TouchStickState) => TouchStickState;
          right?: (s: TouchStickState) => TouchStickState;
        }
  ) {
    const prev = store.getState();
    if (
      typeof (partial as any).left === "function" ||
      typeof (partial as any).right === "function"
    ) {
      const p = partial as {
        left?: (s: TouchStickState) => TouchStickState;
        right?: (s: TouchStickState) => TouchStickState;
      };
      store.setState({
        left: p.left ? p.left(prev.left) : prev.left,
        right: p.right ? p.right(prev.right) : prev.right,
      });
      return;
    }
    store.setState(partial as Partial<TouchUIState>);
  },
  setRadius(radius: number) {
    const s = store.getState();
    store.setState({
      left: { ...s.left, radius },
      right: { ...s.right, radius },
    });
  },
};

export const useTouchUI = () => useStore(store);

// Game state store for centralized pause and pointer lock management
const gameStateStore = createStore<GameState>(() => ({
  isPaused: false,
  isPointerLocked: false,
  isFullscreen: false,
  currentSceneId: data.initialSceneId,
  activePoi: null,
  quality: "lq",
  isSettingsMenuOpen: false,
  isHelpOpen: false,
  isFullscreenMobileOverlayOpen: true,
}));

export const gameState = {
  getState: gameStateStore.getState,
  subscribe: gameStateStore.subscribe,
  setState(partial: Partial<GameState>) {
    gameStateStore.setState(partial);
  },
  setCurrentSceneId(sceneId: string) {
    gameStateStore.setState({ currentSceneId: sceneId, activePoi: null });
  },
  setActivePoi(poi: PointOfInterestData | null) {
    gameStateStore.setState({ activePoi: poi });
  },
  setQuality(quality: "lq" | "mq" | "hq") {
    gameStateStore.setState({ quality });
  },
  toggleSettingsMenu() {
    const state = gameStateStore.getState();
    gameStateStore.setState({ isSettingsMenuOpen: !state.isSettingsMenuOpen });
  },
  setSettingsMenuOpen(isOpen: boolean) {
    gameStateStore.setState({ isSettingsMenuOpen: isOpen });
  },
  toggleHelp() {
    const state = gameStateStore.getState();
    gameStateStore.setState({ isHelpOpen: !state.isHelpOpen });
  },
  setHelpOpen(isOpen: boolean) {
    gameStateStore.setState({ isHelpOpen: isOpen });
  },
  setFullscreenMobileOverlayOpen(isOpen: boolean) {
    gameStateStore.setState({ isFullscreenMobileOverlayOpen: isOpen });
  },
};

export const useGameState = () => useStore(gameStateStore);

export function clampOffset(
  center: TouchPoint,
  pos: TouchPoint,
  radius: number
): TouchPoint {
  const dx = pos.x - center.x;
  const dy = pos.y - center.y;
  const mag = Math.hypot(dx, dy);
  if (mag <= radius || mag === 0) return { x: center.x + dx, y: center.y + dy };
  const scale = radius / mag;
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

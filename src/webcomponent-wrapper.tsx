import { PlayCanvasApplication } from "@/components/PlayCanvasApplication";
import { gameState, touchUIStore } from "@/lib/stores";
import { useEffect, useState } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import type { GameState, TouchUIState } from "@/lib/stores";

interface WebComponentAppProps {
  initialScene: string;
  lang: string;
}

// Create isolated stores per widget instance
function createIsolatedStores() {
  // Isolated game state store
  const gameStateStore = createStore<GameState>(() => ({
    isPaused: true,
    isPointerLocked: false,
    isFullscreen: false,
    currentSceneId: "foyer",
    activePoi: null,
    quality: "mq",
    isSettingsMenuOpen: false,
    isHelpOpen: false,
  }));

  // Isolated touch UI store
  const DEFAULT_RADIUS = 50;
  const defaultStick = {
    active: false,
    center: { x: 0, y: 0 },
    pos: { x: 0, y: 0 },
    radius: DEFAULT_RADIUS,
  };

  const touchUIStoreInstance = createStore<TouchUIState>(() => ({
    left: { ...defaultStick },
    right: { ...defaultStick },
  }));

  // Wrapper for game state
  const isolatedGameState = {
    getState: gameStateStore.getState,
    subscribe: gameStateStore.subscribe,
    setState(partial: Partial<GameState>) {
      gameStateStore.setState(partial);
    },
    setCurrentSceneId(sceneId: string) {
      gameStateStore.setState({ currentSceneId: sceneId, activePoi: null });
    },
    setActivePoi(poi: any) {
      gameStateStore.setState({ activePoi: poi });
    },
  };

  // Wrapper for touch UI
  const isolatedTouchUIStore = {
    getState: touchUIStoreInstance.getState,
    subscribe: touchUIStoreInstance.subscribe,
    setState(
      partial:
        | Partial<TouchUIState>
        | {
            left?: (s: any) => any;
            right?: (s: any) => any;
          }
    ) {
      const prev = touchUIStoreInstance.getState();
      if (
        typeof (partial as any).left === "function" ||
        typeof (partial as any).right === "function"
      ) {
        const p = partial as {
          left?: (s: any) => any;
          right?: (s: any) => any;
        };
        touchUIStoreInstance.setState({
          left: p.left ? p.left(prev.left) : prev.left,
          right: p.right ? p.right(prev.right) : prev.right,
        });
        return;
      }
      touchUIStoreInstance.setState(partial as Partial<TouchUIState>);
    },
    setRadius(radius: number) {
      const s = touchUIStoreInstance.getState();
      touchUIStoreInstance.setState({
        left: { ...s.left, radius },
        right: { ...s.right, radius },
      });
    },
  };

  return {
    gameState: isolatedGameState,
    touchUIStore: isolatedTouchUIStore,
    useGameState: () => useStore(gameStateStore),
    useTouchUI: () => useStore(touchUIStoreInstance),
  };
}

export const WebComponentApp = ({ initialScene }: WebComponentAppProps) => {
  // Create isolated stores for this widget instance
  const [stores] = useState(() => createIsolatedStores());

  // Override global stores temporarily for this component tree
  useEffect(() => {
    // Temporarily replace global stores
    (globalThis as any).__gameState = gameState;
    (globalThis as any).__touchUIStore = touchUIStore;

    (globalThis as any).gameState = stores.gameState;
    (globalThis as any).touchUIStore = stores.touchUIStore;

    return () => {
      // Restore global stores
      (globalThis as any).gameState = (globalThis as any).__gameState;
      (globalThis as any).touchUIStore = (globalThis as any).__touchUIStore;
    };
  }, [stores]);

  // Set initial scene
  useEffect(() => {
    stores.gameState.setCurrentSceneId(initialScene);
  }, [initialScene, stores]);

  return <PlayCanvasApplication />;
};

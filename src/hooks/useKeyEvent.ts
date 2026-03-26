import { useState, useEffect, useRef, useCallback, useMemo } from "react";

type KeyCode = string | string[];

export type UseKeyEventOptions = {
  onKeyUp?: (event?: KeyboardEvent) => void;
  onKeyDown?: (event?: KeyboardEvent) => void;
  /** if key is not provided, all keys will be listened for */
  key?: KeyCode;
};

/**
 * Hook that tracks key press state and calls a callback on key up events
 * @param options - Options object containing onKeyUp callback and key(s) to listen for
 * @returns boolean indicating if the specified key(s) are currently pressed
 */
export function useKeyEvent({
  onKeyUp,
  onKeyDown,
  key,
}: UseKeyEventOptions): boolean {
  const [isKeyDown, setIsKeyDown] = useState(false);
  const pressedKeys = useRef<Set<string>>(new Set());
  const keysToWatch = useMemo(() => (Array.isArray(key) ? key : [key]), [key]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!key || keysToWatch.includes(event.key)) {
        pressedKeys.current.add(event.key);
        setIsKeyDown(true);
        onKeyDown?.(event);
      }
    },
    [key, keysToWatch, onKeyDown]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!key || keysToWatch.includes(event.key)) {
        pressedKeys.current.delete(event.key);
        setIsKeyDown(pressedKeys.current.size > 0);
        onKeyUp?.(event);
      }
    },
    [key, keysToWatch, onKeyUp]
  );

  useEffect(() => {
    const abortController = new AbortController();
    const target = window; // Use window instead of document for shadow root compatibility

    target.addEventListener("keydown", handleKeyDown, {
      signal: abortController.signal,
    });
    target.addEventListener("keyup", handleKeyUp, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
    };
  }, [handleKeyDown, handleKeyUp]);

  return isKeyDown;
}
